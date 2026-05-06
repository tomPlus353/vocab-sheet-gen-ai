"use client";

import type { HistoryEntry, VocabTerm } from "@/lib/types/vocab";
import { getAllGameHistoryEntries, getGameHistoryEntry } from "@/lib/utils";
import { getLocalFavoriteTerms } from "@/lib/favorites-storage";

async function postJson(url: string, body: unknown): Promise<void> {
    try {
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch {
        // ignore network errors / unauthorized anonymous sessions
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

