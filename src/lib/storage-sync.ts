"use client";

import type { HistoryEntry, VocabTerm } from "@/lib/types/vocab";
import type { SrsReviewRating } from "@/lib/types/srs";
import { getAllGameHistoryEntries, getGameHistoryEntry } from "@/lib/utils";
import { getLocalFavoriteTerms } from "@/lib/favorites-storage";
import { logHistorySyncEvent, summarizeHistoryEntry } from "@/lib/history-sync-logger";

type PostJsonResult =
    | {
          ok: true;
          status: number;
      }
    | {
          ok: false;
          status: number | null;
          error: string;
      };

async function postJson(url: string, body: unknown): Promise<PostJsonResult> {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                error: `HTTP ${response.status}`,
            };
        }

        return {
            ok: true,
            status: response.status,
        };
    } catch {
        // ignore network errors / unauthorized anonymous sessions
        return {
            ok: false,
            status: null,
            error: "Network error",
        };
    }
}

type FetchJsonResult =
    | {
          ok: true;
          status: number;
          json: unknown;
      }
    | {
          ok: false;
          status: number | null;
          error: string;
      };

async function fetchJson(url: string): Promise<FetchJsonResult> {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                error: `HTTP ${response.status}`,
            };
        }

        return {
            ok: true,
            status: response.status,
            json: (await response.json()) as unknown,
        };
    } catch (error) {
        return {
            ok: false,
            status: null,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

export async function syncHistoryEntryBestEffort(entry: HistoryEntry): Promise<void> {
    logHistorySyncEvent("history-upload-start", summarizeHistoryEntry(entry));
    const result = await postJson("/api/storage/history/upsert", { entry });
    if (result.ok) {
        logHistorySyncEvent("history-upload-success", {
            ...summarizeHistoryEntry(entry),
            status: result.status,
        });
        return;
    }

    logHistorySyncEvent(
        "history-upload-failed",
        {
            ...summarizeHistoryEntry(entry),
            status: result.status,
            error: result.error,
        },
        "warn",
    );
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
    logHistorySyncEvent("history-delete-start", { entryId });
    const result = await postJson("/api/storage/history/delete", { entryId });
    if (result.ok) {
        logHistorySyncEvent("history-delete-success", { entryId, status: result.status });
        return;
    }

    logHistorySyncEvent(
        "history-delete-failed",
        {
            entryId,
            status: result.status,
            error: result.error,
        },
        "warn",
    );
}

export async function fetchRemoteHistoryEntryIdsBestEffort(): Promise<Set<string> | null> {
    logHistorySyncEvent("history-id-preflight-start");
    const result = await fetchJson("/api/storage/history/ids");
    if (!result.ok) {
        logHistorySyncEvent(
            "history-id-preflight-failed",
            {
                status: result.status,
                error: result.error,
            },
            "warn",
        );
        return null;
    }

    const json = result.json;
    if (!json || typeof json !== "object" || Array.isArray(json)) {
        return null;
    }

    const entryIds = (json as { entryIds?: unknown }).entryIds;
    if (!Array.isArray(entryIds)) {
        logHistorySyncEvent(
            "history-id-preflight-invalid-response",
            {
                status: result.status,
                reason: "Missing entryIds array",
            },
            "warn",
        );
        return null;
    }

    const parsedIds = new Set(
        entryIds.filter((entryId): entryId is string => typeof entryId === "string" && entryId.length > 0),
    );
    logHistorySyncEvent("history-id-preflight-success", {
        status: result.status,
        remoteIdCount: parsedIds.size,
    });
    return parsedIds;
}

export async function fetchRemoteHistoryEntryIdsWithStatusBestEffort(): Promise<
    | {
          ok: true;
          entryIds: Set<string>;
      }
    | {
          ok: false;
          reason: string;
      }
> {
    logHistorySyncEvent("history-id-preflight-start");
    const result = await fetchJson("/api/storage/history/ids");
    if (!result.ok) {
        logHistorySyncEvent(
            "history-id-preflight-failed",
            {
                status: result.status,
                error: result.error,
            },
            "warn",
        );
        return {
            ok: false,
            reason: result.error,
        };
    }

    const json = result.json;
    if (!json || typeof json !== "object" || Array.isArray(json)) {
        return {
            ok: false,
            reason: "Invalid server response",
        };
    }

    const entryIds = (json as { entryIds?: unknown }).entryIds;
    if (!Array.isArray(entryIds)) {
        logHistorySyncEvent(
            "history-id-preflight-invalid-response",
            {
                status: result.status,
                reason: "Missing entryIds array",
            },
            "warn",
        );
        return {
            ok: false,
            reason: "Missing entryIds array",
        };
    }

    const parsedIds = new Set(
        entryIds.filter((entryId): entryId is string => typeof entryId === "string" && entryId.length > 0),
    );
    logHistorySyncEvent("history-id-preflight-success", {
        status: result.status,
        remoteIdCount: parsedIds.size,
    });
    return {
        ok: true,
        entryIds: parsedIds,
    };
}

export async function fetchRemoteHistoryEntriesBestEffort(): Promise<HistoryEntry[] | null> {
    logHistorySyncEvent("history-snapshot-fetch-start");
    const result = await fetchJson("/api/storage/history/snapshot");
    if (!result.ok) {
        logHistorySyncEvent(
            "history-snapshot-fetch-failed",
            {
                status: result.status,
                error: result.error,
            },
            "warn",
        );
        return null;
    }

    const historyEntries = (result.json as { historyEntries?: unknown }).historyEntries;
    if (!Array.isArray(historyEntries)) {
        logHistorySyncEvent(
            "history-snapshot-fetch-failed",
            {
                status: result.status,
                reason: "Missing historyEntries array",
            },
            "warn",
        );
        return null;
    }

    const parsedEntries = historyEntries.filter((entry): entry is HistoryEntry => {
        if (typeof entry !== "object" || entry === null) return false;
        const value = entry as Record<string, unknown>;
        return (
            typeof value.id === "string" &&
            typeof value.title === "string" &&
            (value.source === "generated" || value.source === "manual") &&
            typeof value.createdAt === "string" &&
            Array.isArray(value.terms)
        );
    });
    logHistorySyncEvent("history-snapshot-fetch-success", {
        status: result.status,
        remoteEntryCount: parsedEntries.length,
    });
    return parsedEntries;
}

export async function fetchRemoteFavoriteTermsBestEffort(): Promise<VocabTerm[] | null> {
    logHistorySyncEvent("favorites-snapshot-fetch-start");
    const result = await fetchJson("/api/storage/favorites");
    if (!result.ok) {
        logHistorySyncEvent(
            "favorites-snapshot-fetch-failed",
            {
                status: result.status,
                error: result.error,
            },
            "warn",
        );
        return null;
    }

    const json = result.json;
    if (!json || typeof json !== "object" || Array.isArray(json)) {
        logHistorySyncEvent(
            "favorites-snapshot-fetch-failed",
            {
                status: result.status,
                reason: "Invalid server response",
            },
            "warn",
        );
        return null;
    }

    const favoriteTerms = (json as { favoriteTerms?: unknown }).favoriteTerms;
    if (!Array.isArray(favoriteTerms)) {
        logHistorySyncEvent(
            "favorites-snapshot-fetch-failed",
            {
                status: result.status,
                reason: "Missing favoriteTerms array",
            },
            "warn",
        );
        return null;
    }

    const parsedTerms = favoriteTerms.filter((term): term is VocabTerm => {
        if (typeof term !== "object" || term === null) return false;
        const value = term as Record<string, unknown>;
        return (
            typeof value.japanese === "string" &&
            typeof value.kana === "string" &&
            typeof value.english_definition === "string"
        );
    });

    logHistorySyncEvent("favorites-snapshot-fetch-success", {
        status: result.status,
        remoteFavoriteCount: parsedTerms.length,
    });
    return parsedTerms;
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

    logHistorySyncEvent("history-upload-batch-start", {
        localEntryCount: entries.length,
        remoteKnownIdCount: existingIds.size,
        missingEntryCount: missingEntries.length,
    });

    for (const entry of missingEntries) {
        logHistorySyncEvent("history-upload-attempt", summarizeHistoryEntry(entry));
        const result = await postJson("/api/storage/history/upsert", { entry });
        if (result.ok) {
            logHistorySyncEvent("history-upload-attempt-success", {
                ...summarizeHistoryEntry(entry),
                status: result.status,
            });
            succeeded += 1;
            continue;
        }

        logHistorySyncEvent(
            "history-upload-attempt-failed",
            {
                ...summarizeHistoryEntry(entry),
                status: result.status,
                error: result.error,
            },
            "warn",
        );
    }

    const result = {
        attempted: missingEntries.length,
        succeeded,
        skipped: entries.length - missingEntries.length,
        failed: missingEntries.length - succeeded,
    };
    logHistorySyncEvent("history-upload-batch-complete", result);
    return result;
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
