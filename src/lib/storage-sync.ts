"use client";

import type { HistoryEntry, VocabTerm } from "@/lib/types/vocab";
import type { SrsReviewRating } from "@/lib/types/srs";
import { getAllGameHistoryEntries, getGameHistoryEntry } from "@/lib/utils";
import { getLocalFavoriteTerms } from "@/lib/favorites-storage";

async function postJson(url: string, body: unknown): Promise<boolean> {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return response.ok;
    } catch {
        // ignore network errors / unauthorized anonymous sessions
        return false;
    }
}

async function getJson(url: string): Promise<unknown> {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return null;
        return (await response.json()) as unknown;
    } catch {
        return null;
    }
}

export async function syncHistoryEntryBestEffort(entry: HistoryEntry): Promise<void> {
    await postJson("/api/storage/history/upsert", { entry });
}

export async function syncHistoryEntryByIdBestEffort(entryId: string): Promise<void> {
    const entry = getAllGameHistoryEntries()[entryId];
    if (!entry) return;
    await syncHistoryEntryBestEffort(entry);
}

export async function syncHistoryForKeyBestEffort(key: string, isKeyHashed: boolean): Promise<void> {
    const entry = getGameHistoryEntry(key, isKeyHashed);
    if (!entry) return;
    await syncHistoryEntryBestEffort(entry);
}

export async function deleteHistoryEntryBestEffort(entryId: string): Promise<void> {
    await postJson("/api/storage/history/delete", { entryId });
}

export async function fetchRemoteHistoryEntryIdsBestEffort(): Promise<Set<string> | null> {
    const json = await getJson("/api/storage/history/ids");
    if (!json || typeof json !== "object" || Array.isArray(json)) {
        return null;
    }

    const entryIds = (json as { entryIds?: unknown }).entryIds;
    if (!Array.isArray(entryIds)) {
        return null;
    }

    return new Set(
        entryIds.filter((entryId): entryId is string => typeof entryId === "string" && entryId.length > 0),
    );
}

export async function syncMissingHistoryEntriesBestEffort(existingIds: Set<string>): Promise<{
    attempted: number;
    succeeded: number;
    skipped: number;
    failed: number;
}> {
    const entries = Object.values(getAllGameHistoryEntries());
    const missingEntries = entries.filter((entry) => !existingIds.has(entry.id));
    let succeeded = 0;

    for (const entry of missingEntries) {
        const ok = await postJson("/api/storage/history/upsert", { entry });
        if (ok) {
            succeeded += 1;
        }
    }

    return {
        attempted: missingEntries.length,
        succeeded,
        skipped: entries.length - missingEntries.length,
        failed: missingEntries.length - succeeded,
    };
}

export async function syncFavoritesBestEffort(terms?: VocabTerm[]): Promise<void> {
    const favoriteTerms = terms ?? getLocalFavoriteTerms();
    try {
        await fetch("/api/storage/favorites", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favoriteTerms }),
        });
    } catch {
        // ignore
    }
}

export async function syncSrsReviewBestEffort(
    term: VocabTerm,
    rating: SrsReviewRating,
): Promise<void> {
    await postJson("/api/srs/review", { term, rating });
}
