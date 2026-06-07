import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { parseFavoriteTermsRaw, parseHistoryEntriesRaw } from "@/server/storage/parsers";
import {
    dedupeTerms,
    getUserStorageSnapshot,
    mergeHistoryEntries,
    replaceUserFavorites,
    upsertUserHistoryEntry,
} from "@/server/storage/relational";

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const localFavoriteTerms = parseFavoriteTermsRaw(body.favoriteTermsRaw);
    const localHistoryEntries = parseHistoryEntriesRaw(body.historyTermsRaw);

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { storageMigratedAt: true },
    });

    const serverSnapshotBefore = await getUserStorageSnapshot(userId);

    const shouldMigrate = !user?.storageMigratedAt;
    if (shouldMigrate) {
        const mergedFavorites = dedupeTerms([
            ...serverSnapshotBefore.favoriteTerms,
            ...localFavoriteTerms,
        ]).map((term) => ({ ...term, isFavorite: true }));

        const mergedHistory = mergeHistoryEntries(
            serverSnapshotBefore.historyEntries,
            localHistoryEntries,
        );

        await replaceUserFavorites(userId, mergedFavorites);
        for (const entry of mergedHistory) {
            await upsertUserHistoryEntry(userId, entry);
        }

        await db.user.update({
            where: { id: userId },
            data: { storageMigratedAt: new Date() },
        });
    }

    const snapshot = await getUserStorageSnapshot(userId);
    return NextResponse.json({ migrated: shouldMigrate, ...snapshot });
}
