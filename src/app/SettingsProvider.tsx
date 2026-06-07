'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import { runLocalStorageMigrations } from "@/lib/migrations";
import type { HistoryEntry, VocabTerm } from "@/lib/types/vocab";
import { getLocalFavoriteTerms } from "@/lib/favorites-storage";
import { logHistorySyncEvent } from "@/lib/history-sync-logger";
import {
    fetchRemoteFavoriteTermsBestEffort,
    fetchRemoteHistoryEntriesBestEffort,
} from "@/lib/storage-sync";
import { getAllGameHistoryEntries, isVocabTerm } from "@/lib/utils";

type SettingsContextType = {
    perPage: number;
    setPerPageContext: (n: number) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [perPage, setPerPage] = useState(5);
    const setPerPageContext = (n: number) => setPerPage(n);

    // on mount, load settings from localStorage
    useEffect(() => {
        runLocalStorageMigrations();

        async function bootstrapStorage() {
            try {
                localStorage.setItem("storageMode", "local");
                logHistorySyncEvent("storage-bootstrap-start", {
                    localFavoriteCount: getLocalFavoriteTerms().length,
                    localHistoryEntryCount: Object.keys(getAllGameHistoryEntries()).length,
                });

                const favoriteTermsRaw = localStorage.getItem("favoriteTerms");
                const historyTermsRaw = localStorage.getItem("historyTerms");

                const response = await fetch("/api/storage/bootstrap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ favoriteTermsRaw, historyTermsRaw }),
                });

                if (response.status === 401) {
                    logHistorySyncEvent(
                        "storage-bootstrap-unauthorized",
                        { status: response.status },
                        "warn",
                    );
                    return;
                }
                if (!response.ok) {
                    logHistorySyncEvent(
                        "storage-bootstrap-failed",
                        { status: response.status },
                        "warn",
                    );
                    return;
                }

                localStorage.setItem("storageMode", "server");
                const json = (await response.json()) as { migrated?: boolean };
                const migrated = json.migrated === true;

                const [favoriteTerms, historyEntries] = await Promise.all([
                    fetchRemoteFavoriteTermsBestEffort(),
                    fetchRemoteHistoryEntriesBestEffort(),
                ]);

                if (favoriteTerms) {
                    const normalizedFavorites: VocabTerm[] = favoriteTerms
                        .filter(isVocabTerm)
                        .map((term) => ({ ...term, isFavorite: true }));
                    localStorage.setItem("favoriteTerms", JSON.stringify(normalizedFavorites));
                }

                if (historyEntries) {
                    const historyObj: Record<string, HistoryEntry> = {};
                    for (const entry of historyEntries) {
                        historyObj[entry.id] = entry;
                    }
                    localStorage.setItem("historyTerms", JSON.stringify(historyObj));
                }

                logHistorySyncEvent("storage-bootstrap-success", {
                    status: response.status,
                    migrated,
                    remoteFavoriteCount: favoriteTerms?.length ?? 0,
                    remoteHistoryEntryCount: historyEntries?.length ?? 0,
                });
            } catch {
                // ignore (offline / server errors / anonymous sessions)
                logHistorySyncEvent("storage-bootstrap-error", {}, "warn");
            }
        }

        void bootstrapStorage();
        const savedNumSentences = localStorage.getItem("numSentences") ?? "5";
        setPerPageContext(Number(savedNumSentences));
    }, []);

    // whenever settings change, save to localStorage
    useEffect(() => {
        localStorage.setItem("numSentences", perPage.toString());
    }, [perPage]);

    return <SettingsContext.Provider value={{ perPage: perPage, setPerPageContext }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
    // get the context
    const ctx = useContext(SettingsContext);

    // Type guard to ensure context is defined
    if (!ctx) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }

    // Type guard to ensure ctx is an object
    if (!(typeof ctx == "object")) {
        throw new Error("useSettings: context is not an object");
    }

    // return the entire context after passing validation
    return ctx;
}
