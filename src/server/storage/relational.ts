import type { HistoryEntry, VocabTerm } from "@/lib/types/vocab";
import { db } from "@/server/db";

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
    for (const term of terms) {
        const key = makeTermKey(term);
        if (map.has(key)) continue;
        const upserted = await db.term.upsert({
            where: {
                japanese_kana_englishDefinition: {
                    japanese: term.japanese,
                    kana: term.kana,
                    englishDefinition: term.english_definition,
                },
            },
            create: {
                japanese: term.japanese,
                kana: term.kana,
                englishDefinition: term.english_definition,
                exampleSentences: term.example_sentences ?? undefined,
                type: term.type ?? undefined,
            },
            update: {
                exampleSentences: term.example_sentences ?? undefined,
                type: term.type ?? undefined,
            },
            select: { id: true },
        });
        map.set(key, upserted.id);
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

    await db.$transaction(async (tx) => {
        for (const row of rows) {
            await tx.userTermState.upsert({
                where: { userId_termId: { userId: row.userId, termId: row.termId } },
                create: {
                    userId: row.userId,
                    termId: row.termId,
                    gravityScore: row.gravityScore,
                    gravityReadingScore: row.gravityReadingScore,
                    isLearnt: row.isLearnt,
                },
                update: {
                    gravityScore: row.gravityScore,
                    gravityReadingScore: row.gravityReadingScore,
                    isLearnt: row.isLearnt,
                },
            });
        }
    });
}
