import type { HistoryEntry, VocabTerm } from "@/lib/types/vocab";
import { Prisma, type PrismaClient } from "@prisma/client";
import type {
    SrsCardState,
    SrsDashboardBucket,
    SrsDashboardSummary,
    SrsDashboardTermRow,
    SrsReviewRating,
} from "@/lib/types/srs";
import { db } from "@/server/db";
import { createInitialSrsCard, reviewSrsCard } from "@/server/storage/srs";

const prisma = db as PrismaClient;

type TermKey = string;

function makeTermKey(term: Pick<VocabTerm, "japanese" | "kana" | "english_definition">): TermKey {
    return `${term.japanese}\u0000${term.kana}\u0000${term.english_definition}`;
}

export function dedupeTerms(terms: VocabTerm[]): VocabTerm[] {
    const seen = new Set<TermKey>();
    const next: VocabTerm[] = [];
    for (const term of terms) {
        const key = makeTermKey(term);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(term);
    }
    return next;
}

function parseDate(value: string): number {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? 0 : ms;
}

function toCountNumber(value: bigint | number | string | null | undefined): number {
    if (value == null) return 0;
    return Number(value);
}

export function mergeHistoryEntries(serverEntries: HistoryEntry[], localEntries: HistoryEntry[]): HistoryEntry[] {
    const byId = new Map<string, HistoryEntry>();

    for (const entry of serverEntries) {
        byId.set(entry.id, entry);
    }

    for (const entry of localEntries) {
        const existing = byId.get(entry.id);
        if (!existing) {
            byId.set(entry.id, entry);
            continue;
        }

        if (parseDate(entry.createdAt) > parseDate(existing.createdAt)) {
            byId.set(entry.id, entry);
        }
    }

    return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUserStorageSnapshot(userId: string): Promise<{
    favoriteTerms: VocabTerm[];
    historyEntries: HistoryEntry[];
}> {
    const termStateRows = await db.userTermState.findMany({
        where: { userId },
        select: {
            term: {
                select: {
                    japanese: true,
                    kana: true,
                    englishDefinition: true,
                },
            },
            gravityScore: true,
            gravityReadingScore: true,
            isLearnt: true,
        },
    });

    const stateByKey = new Map<TermKey, { gravity_score?: number; gravity_reading_score?: number; isLearnt?: boolean }>();
    for (const row of termStateRows) {
        stateByKey.set(`${row.term.japanese}\u0000${row.term.kana}\u0000${row.term.englishDefinition}`, {
            gravity_score: row.gravityScore ?? undefined,
            gravity_reading_score: row.gravityReadingScore ?? undefined,
            isLearnt: row.isLearnt ?? undefined,
        });
    }

    const [favorites, history] = await Promise.all([
        db.userFavoriteTerm.findMany({
            where: { userId },
            include: { term: true },
            orderBy: { createdAt: "desc" },
        }),
        db.userHistoryEntry.findMany({
            where: { userId },
            include: {
                terms: {
                    include: { term: true },
                    orderBy: { position: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    const favoriteKeys = new Set<TermKey>(
        favorites.map(({ term }) => `${term.japanese}\u0000${term.kana}\u0000${term.englishDefinition}`),
    );

    const favoriteTerms: VocabTerm[] = favorites.map(({ term }) => ({
        japanese: term.japanese,
        kana: term.kana,
        english_definition: term.englishDefinition,
        example_sentences: (term.exampleSentences as unknown as VocabTerm["example_sentences"]) ?? undefined,
        type: term.type ?? undefined,
        isFavorite: true,
        ...stateByKey.get(`${term.japanese}\u0000${term.kana}\u0000${term.englishDefinition}`),
    }));

    const historyEntries: HistoryEntry[] = history.map((entry) => ({
        id: entry.entryId,
        title: entry.title,
        source: entry.source === "manual" ? "manual" : "generated",
        createdAt: entry.createdAt.toISOString(),
        terms: entry.terms.map(({ term }) => ({
            japanese: term.japanese,
            kana: term.kana,
            english_definition: term.englishDefinition,
            example_sentences: (term.exampleSentences as unknown as VocabTerm["example_sentences"]) ?? undefined,
            type: term.type ?? undefined,
            isFavorite: favoriteKeys.has(`${term.japanese}\u0000${term.kana}\u0000${term.englishDefinition}`) ? true : undefined,
            ...stateByKey.get(`${term.japanese}\u0000${term.kana}\u0000${term.englishDefinition}`),
        })),
    }));

    return { favoriteTerms, historyEntries };
}

async function upsertTermIds(terms: VocabTerm[]): Promise<Map<TermKey, string>> {
    const map = new Map<TermKey, string>();

    if (terms.length === 0) {
        return map;
    }

    await db.term.createMany({
        data: terms.map((term) => ({
            japanese: term.japanese,
            kana: term.kana,
            englishDefinition: term.english_definition,
            exampleSentences: term.example_sentences ?? undefined,
            type: term.type ?? undefined,
        })),
        skipDuplicates: true,
    });

    const storedTerms = await db.term.findMany({
        where: {
            OR: terms.map((term) => ({
                japanese: term.japanese,
                kana: term.kana,
                englishDefinition: term.english_definition,
            })),
        },
        select: { id: true, japanese: true, kana: true, englishDefinition: true },
    });

    for (const row of storedTerms) {
        map.set(`${row.japanese}\u0000${row.kana}\u0000${row.englishDefinition}`, row.id);
    }

    return map;
}

export async function replaceUserFavorites(userId: string, favoriteTerms: VocabTerm[]): Promise<void> {
    const deduped = dedupeTerms(favoriteTerms);
    const termIdMap = await upsertTermIds(deduped);

    await db.$transaction(async (tx) => {
        await tx.userFavoriteTerm.deleteMany({ where: { userId } });
        if (deduped.length === 0) return;
        await tx.userFavoriteTerm.createMany({
            data: deduped.map((term) => ({
                userId,
                termId: termIdMap.get(makeTermKey(term))!,
            })),
            skipDuplicates: true,
        });
    });

    await upsertUserTermStates(userId, deduped, termIdMap);
}

export async function upsertUserHistoryEntry(userId: string, entry: HistoryEntry): Promise<void> {
    const termIdMap = await upsertTermIds(entry.terms);

    await db.$transaction(async (tx) => {
        await tx.userHistoryEntry.upsert({
            where: { userId_entryId: { userId, entryId: entry.id } },
            create: {
                userId,
                entryId: entry.id,
                title: entry.title,
                source: entry.source,
                createdAt: new Date(entry.createdAt),
            },
            update: {
                title: entry.title,
                source: entry.source,
                createdAt: new Date(entry.createdAt),
            },
        });

        await tx.userHistoryEntryTerm.deleteMany({ where: { userId, entryId: entry.id } });
        if (entry.terms.length === 0) return;

        await tx.userHistoryEntryTerm.createMany({
            data: entry.terms.map((term, position) => ({
                userId,
                entryId: entry.id,
                termId: termIdMap.get(makeTermKey(term))!,
                position,
            })),
            skipDuplicates: true,
        });
    });

    await upsertUserTermStates(userId, entry.terms, termIdMap);
}

export async function deleteUserHistoryEntry(userId: string, entryId: string): Promise<void> {
    await db.userHistoryEntry.delete({
        where: { userId_entryId: { userId, entryId } },
    });
}

export async function upsertUserTermStates(
    userId: string,
    terms: VocabTerm[],
    existingTermIdMap?: Map<TermKey, string>,
): Promise<void> {
    const deduped = dedupeTerms(terms);
    const termIdMap = existingTermIdMap ?? (await upsertTermIds(deduped));

    const rows = deduped
        .map((term) => {
            const termId = termIdMap.get(makeTermKey(term));
            if (!termId) return null;
            const hasAny =
                typeof term.gravity_score === "number" ||
                typeof term.gravity_reading_score === "number" ||
                typeof term.isLearnt === "boolean";
            if (!hasAny) return null;
            return {
                userId,
                termId,
                gravityScore: typeof term.gravity_score === "number" ? term.gravity_score : undefined,
                gravityReadingScore:
                    typeof term.gravity_reading_score === "number" ? term.gravity_reading_score : undefined,
                isLearnt: typeof term.isLearnt === "boolean" ? term.isLearnt : undefined,
            };
        })
        .filter(Boolean) as Array<{
        userId: string;
        termId: string;
        gravityScore?: number;
        gravityReadingScore?: number;
        isLearnt?: boolean;
    }>;

    if (rows.length === 0) return;

    const now = new Date();
    const values = rows.map((row) =>
        Prisma.sql`(${row.userId}, ${row.termId}, ${row.gravityScore ?? null}, ${row.gravityReadingScore ?? null}, ${row.isLearnt ?? null}, ${now})`,
    );

    await db.$executeRaw(Prisma.sql`
        INSERT INTO "UserTermState" (
            "userId",
            "termId",
            "gravityScore",
            "gravityReadingScore",
            "isLearnt",
            "updatedAt"
        )
        VALUES ${Prisma.join(values)}
        ON CONFLICT ("userId", "termId")
        DO UPDATE SET
            "gravityScore" = EXCLUDED."gravityScore",
            "gravityReadingScore" = EXCLUDED."gravityReadingScore",
            "isLearnt" = EXCLUDED."isLearnt",
            "updatedAt" = EXCLUDED."updatedAt"
    `);
}

function getStartOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function getStartOfTomorrow(value: Date): Date {
    const day = getStartOfDay(value);
    day.setDate(day.getDate() + 1);
    return day;
}

export async function getSrsDashboardSummary(
    userId: string,
    now = new Date(),
): Promise<SrsDashboardSummary> {
    const startOfToday = getStartOfDay(now);
    const startOfTomorrow = getStartOfTomorrow(now);

    const [row] = await db.$queryRaw<Array<{
        overdue: bigint | number | string;
        dueToday: bigint | number | string;
        upcoming: bigint | number | string;
        totalTracked: bigint | number | string;
    }>>(Prisma.sql`
        SELECT
            COUNT(*) FILTER (WHERE "due" < ${startOfToday}) AS "overdue",
            COUNT(*) FILTER (
                WHERE "due" >= ${startOfToday}
                  AND "due" < ${startOfTomorrow}
            ) AS "dueToday",
            COUNT(*) FILTER (WHERE "due" >= ${startOfTomorrow}) AS "upcoming",
            COUNT(*) AS "totalTracked"
        FROM "UserTermSrsState"
        WHERE "userId" = ${userId}
    `);

    return {
        overdue: toCountNumber(row?.overdue),
        dueToday: toCountNumber(row?.dueToday),
        upcoming: toCountNumber(row?.upcoming),
        totalTracked: toCountNumber(row?.totalTracked),
    };
}

function buildSrsBucketFilter(bucket: SrsDashboardBucket, now: Date): Prisma.Sql {
    const startOfToday = getStartOfDay(now);
    const startOfTomorrow = getStartOfTomorrow(now);
    if (bucket === "overdue") {
        return Prisma.sql`s."due" < ${startOfToday}`;
    }
    if (bucket === "due_today") {
        return Prisma.sql`s."due" >= ${startOfToday} AND s."due" < ${startOfTomorrow}`;
    }
    return Prisma.sql`s."due" >= ${startOfTomorrow}`;
}

export async function getSrsDashboardTermCount(
    userId: string,
    bucket?: SrsDashboardBucket,
    now: Date = new Date(),
): Promise<number> {
    const bucketFilter = bucket
        ? Prisma.sql`AND ${buildSrsBucketFilter(bucket, now)}`
        : Prisma.empty;

    const [row] = await db.$queryRaw<Array<{ totalTracked: bigint | number | string }>>(Prisma.sql`
        SELECT COUNT(*) AS "totalTracked"
        FROM "UserTermSrsState" s
        WHERE s."userId" = ${userId}
        ${bucketFilter}
    `);

    return toCountNumber(row?.totalTracked);
}

export async function getSrsDashboardTerms(
    userId: string,
    options?: {
        bucket?: SrsDashboardBucket;
        limit?: number;
        offset?: number;
        now?: Date;
    },
): Promise<{ rows: SrsDashboardTermRow[]; total: number }> {
    const now = options?.now ?? new Date();
    const limit = Math.max(1, Math.min(options?.limit ?? 100, 200));
    const offset = Math.max(0, options?.offset ?? 0);
    const bucketFilter = options?.bucket
        ? Prisma.sql`AND ${buildSrsBucketFilter(options.bucket, now)}`
        : Prisma.empty;

    const [rows, totalRows] = await Promise.all([
        db.$queryRaw<Array<{
            japanese: string;
            kana: string;
            englishDefinition: string;
            due: Date | string;
            lastReview: Date | string | null;
            stability: number;
            difficulty: number;
            repetitions: number;
            lapses: number;
            state: number;
            retrievability: number | null;
            lastRating: number | null;
        }>>(Prisma.sql`
            SELECT
                t.japanese AS "japanese",
                t.kana AS "kana",
                t."englishDefinition" AS "englishDefinition",
                s."due" AS "due",
                s."lastReview" AS "lastReview",
                s."stability" AS "stability",
                s."difficulty" AS "difficulty",
                s."repetitions" AS "repetitions",
                s."lapses" AS "lapses",
                s."state" AS "state",
                s."retrievability" AS "retrievability",
            s."lastRating" AS "lastRating"
            FROM "UserTermSrsState" s
            INNER JOIN "Term" t ON t.id = s."termId"
            WHERE s."userId" = ${userId}
            ${bucketFilter}
            ORDER BY s."due" ASC
            LIMIT ${limit}
            OFFSET ${offset}
        `),
        getSrsDashboardTermCount(userId, options?.bucket, now),
    ]);

    return {
        rows: rows.map((row) => ({
            japanese: row.japanese,
            kana: row.kana,
            englishDefinition: row.englishDefinition,
            due: new Date(row.due).toISOString(),
            lastReview: row.lastReview ? new Date(row.lastReview).toISOString() : undefined,
            stability: row.stability,
            difficulty: row.difficulty,
            repetitions: row.repetitions,
            lapses: row.lapses,
            state: row.state,
            retrievability: row.retrievability ?? undefined,
            lastRating: row.lastRating ?? undefined,
        })),
        total: totalRows,
    };
}

export async function recordUserTermSrsReview(params: {
    userId: string;
    term: Pick<VocabTerm, "japanese" | "kana" | "english_definition">;
    rating: SrsReviewRating;
    reviewedAt?: Date;
}): Promise<SrsCardState> {
    const reviewedAt = params.reviewedAt ?? new Date();
    const termIdMap = await upsertTermIds([
        {
            japanese: params.term.japanese,
            kana: params.term.kana,
            english_definition: params.term.english_definition,
        },
    ]);
    const termId =
        termIdMap.get(
            `${params.term.japanese}\u0000${params.term.kana}\u0000${params.term.english_definition}`,
        ) ?? "";
    if (!termId) {
        throw new Error("Failed to resolve term id for SRS review.");
    }

    const current = await prisma.userTermSrsState.findUnique({
        where: { userId_termId: { userId: params.userId, termId } },
    });

    const currentCard: SrsCardState | null = current
        ? {
              due: current.due.toISOString(),
              stability: current.stability,
              difficulty: current.difficulty,
              repetitions: current.repetitions,
              lapses: current.lapses,
              state: current.state,
              lastReview: current.lastReview?.toISOString(),
              scheduledDays: current.scheduledDays,
              learningSteps: current.learningSteps,
              retrievability: current.retrievability ?? undefined,
              lastRating: current.lastRating ?? undefined,
          }
        : createInitialSrsCard(reviewedAt);

    const next = reviewSrsCard(currentCard, params.rating, reviewedAt);

    await prisma.userTermSrsState.upsert({
        where: { userId_termId: { userId: params.userId, termId } },
        create: {
            userId: params.userId,
            termId,
            due: new Date(next.due),
            stability: next.stability,
            difficulty: next.difficulty,
            repetitions: next.repetitions,
            lapses: next.lapses,
            state: next.state,
            lastReview: next.lastReview ? new Date(next.lastReview) : null,
            scheduledDays: next.scheduledDays,
            learningSteps: next.learningSteps,
            retrievability: next.retrievability,
            lastRating: next.lastRating,
        },
        update: {
            due: new Date(next.due),
            stability: next.stability,
            difficulty: next.difficulty,
            repetitions: next.repetitions,
            lapses: next.lapses,
            state: next.state,
            lastReview: next.lastReview ? new Date(next.lastReview) : null,
            scheduledDays: next.scheduledDays,
            learningSteps: next.learningSteps,
            retrievability: next.retrievability,
            lastRating: next.lastRating,
        },
    });

    return next;
}

export async function deleteUserTermEverywhere(
    userId: string,
    term: { japanese: string; kana: string; englishDefinition: string },
): Promise<void> {
    const existingTerm = await db.term.findUnique({
        where: {
            japanese_kana_englishDefinition: {
                japanese: term.japanese,
                kana: term.kana,
                englishDefinition: term.englishDefinition,
            },
        },
        select: { id: true },
    });

    if (!existingTerm) return;

    const termId = existingTerm.id;
    await db.$transaction(async (tx) => {
        await tx.userTermSrsState.deleteMany({ where: { userId, termId } });
        await tx.userTermState.deleteMany({ where: { userId, termId } });
        await tx.userFavoriteTerm.deleteMany({ where: { userId, termId } });
        await tx.userHistoryEntryTerm.deleteMany({ where: { userId, termId } });
    });
}
