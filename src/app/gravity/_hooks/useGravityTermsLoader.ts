"use client";

import * as React from "react";

import { appendGameHistory, getGameHistory } from "@/lib/utils";
import type { VocabTerm } from "@/lib/types/vocab";
import type { SrsDashboardBucket, SrsDashboardTermRow } from "@/lib/types/srs";
import { setFavoriteTerms } from "@/lib/favorites-storage";
import {
    fetchRemoteHistoryEntryByIdBestEffort,
    loadFavoriteTermsBestEffort,
    syncHistoryForKeyBestEffort,
} from "@/lib/storage-sync";
import {
    applyLocalTermStatesToTerms,
    upsertLocalTermStatesFromTerms,
} from "@/lib/term-state-storage";
import {
    isGravityTermLearnt,
} from "../_lib/gravity-utils";
import type { FallingTerm } from "../_lib/gravity-utils";

type ProgressSource =
    | { mode: "favorites" }
    | { mode: "history"; key: string }
    | { mode: "active"; key: string }
    | { mode: "srs"; bucket: SrsDashboardBucket };

type TermsLoaderInputs = {
    isFavoritesModeRef: React.MutableRefObject<boolean>;
    isExtinctionModeRef: React.MutableRefObject<boolean>;
    isKeepPlayingModeRef: React.MutableRefObject<boolean>;
    initializeGravityRun: (sourceTerms: VocabTerm[]) => void;
    setFallingTerms: React.Dispatch<React.SetStateAction<FallingTerm[]>>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setTermWrongCounts: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
    setTimer: React.Dispatch<React.SetStateAction<number>>;
    setAnswer: React.Dispatch<React.SetStateAction<string>>;
    setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
    setGameOverMessage: React.Dispatch<React.SetStateAction<string>>;
    setIsCorrectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCorrectionInput: React.Dispatch<React.SetStateAction<string>>;
    setCorrectionError: React.Dispatch<React.SetStateAction<string>>;
    setIsAllLearntModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setHasShownAllLearntModal: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEditTermsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCorrectionTerm: React.Dispatch<React.SetStateAction<VocabTerm | null>>;
    isTestReadingRef: React.MutableRefObject<boolean>;
};

type LoadVocabTermsOptions = {
    ignoreFavoritesMode?: boolean;
    forceFavoritesMode?: boolean;
    openEditTermsAfterLoad?: boolean;
};

export function useGravityTermsLoader({
    isFavoritesModeRef,
    isExtinctionModeRef,
    isKeepPlayingModeRef,
    initializeGravityRun,
    setScore,
    setTermWrongCounts,
    setTimer,
    setAnswer,
    setIsGameOver,
    setGameOverMessage,
    setIsCorrectionModalOpen,
    setCorrectionInput,
    setCorrectionError,
    setIsAllLearntModalOpen,
    setHasShownAllLearntModal,
    setIsEditTermsModalOpen,
    setFallingTerms,
    setCorrectionTerm,
    isTestReadingRef,
}: TermsLoaderInputs) {
    const [allTerms, setAllTerms] = React.useState<VocabTerm[]>([]);
    const [scopedTerms, setScopedTerms] = React.useState<VocabTerm[]>([]);
    const [activeTerms, setActiveTerms] = React.useState<VocabTerm[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isEmptyFavoritesModalOpen, setIsEmptyFavoritesModalOpen] =
        React.useState(false);
    const progressSourceRef = React.useRef<ProgressSource | null>(null);

    const parseSrsBucket = (
        value: string | null,
    ): SrsDashboardBucket | undefined => {
        if (value === "overdue" || value === "due_today" || value === "upcoming") {
            return value;
        }
        return undefined;
    };

    const loadVocabTerms = React.useCallback(
        async (options: LoadVocabTermsOptions = {}) => {
            const {
                ignoreFavoritesMode = false,
                forceFavoritesMode = false,
                openEditTermsAfterLoad = false,
            } = options;
            setIsLoading(true);
            setIsEmptyFavoritesModalOpen(false);

            let cachedJsonString: string | null = null;
            let parsedTerms: VocabTerm[] = [];
            const urlParams = new URLSearchParams(window.location.search);
            const isSrsMode = urlParams.get("srsMode") === "1";
            const srsBucket = parseSrsBucket(urlParams.get("srsBucket"));
            const isReviewFavorites =
                !ignoreFavoritesMode && urlParams.get("favorites") === "1";
            const isReviewHistory = urlParams.get("history") === "1";
            if (isSrsMode) {
                if (!srsBucket) {
                    alert(
                        "Invalid SRS bucket. Please return to dashboard and try again.",
                    );
                    setIsLoading(false);
                    return;
                }
                progressSourceRef.current = { mode: "srs", bucket: srsBucket };
                try {
                    const response = await fetch(
                        `/api/srs/dashboard?bucket=${srsBucket}&limit=50&offset=0`,
                    );
                    const jsonResponse = (await response.json()) as {
                        rows?: SrsDashboardTermRow[];
                        error?: string;
                    };
                    if (!response.ok) {
                        alert(
                            jsonResponse.error ??
                                "Unable to load SRS terms. Please try again.",
                        );
                        setIsLoading(false);
                        return;
                    }
                    parsedTerms = (jsonResponse.rows ?? []).map((row) => ({
                        japanese: row.japanese,
                        kana: row.kana,
                        english_definition: row.englishDefinition,
                        example_sentences: row.exampleSentences,
                        srsPromptType: row.nextPromptType,
                        gravity_score: 0,
                        gravity_reading_score: 0,
                        isLearnt: false,
                    }));
                } catch (error) {
                    console.error("Failed to fetch SRS dashboard terms:", error);
                    alert("Unable to load SRS terms. Please try again.");
                    setIsLoading(false);
                    return;
                }
            } else {
                const activeTextStr = localStorage.getItem("activeText");
                if (!activeTextStr) {
                    alert("No active text found. Please use the ereader first.");
                    setIsLoading(false);
                    return;
                }

                if (isReviewHistory) {
                    const historyHash = urlParams.get("historyTerms") ?? "";
                    const storageMode =
                        typeof localStorage !== "undefined"
                            ? localStorage.getItem("storageMode")
                            : null;
                    if (storageMode === "server") {
                        const remoteHistory =
                            await fetchRemoteHistoryEntryByIdBestEffort(
                                historyHash,
                            );
                        cachedJsonString = remoteHistory
                            ? JSON.stringify(remoteHistory.terms)
                            : null;
                    } else {
                        cachedJsonString = getGameHistory(historyHash, true);
                    }
                    progressSourceRef.current = {
                        mode: "history",
                        key: historyHash,
                    };
                    if (!cachedJsonString) {
                        alert("No history terms found for key: " + historyHash);
                        setIsLoading(false);
                        return;
                    }
                } else if (isReviewFavorites) {
                    parsedTerms = await loadFavoriteTermsBestEffort();
                    progressSourceRef.current = { mode: "favorites" };
                    if (parsedTerms.length === 0) {
                        setIsEmptyFavoritesModalOpen(true);
                        setIsLoading(false);
                        return;
                    }
                } else {
                    cachedJsonString = getGameHistory(activeTextStr, false);
                    progressSourceRef.current = {
                        mode: "active",
                        key: activeTextStr,
                    };
                }

                let reply = cachedJsonString ?? "";
                if (!isReviewFavorites && !reply) {
                    const response = await fetch("/api/llm", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        cache: "force-cache",
                        body: JSON.stringify({
                            text: activeTextStr,
                            mode: "vocabGame",
                        }),
                    });

                    const jsonResponse = (await response.json()) as Record<
                        string,
                        string
                    >;
                    const responseCode = response.status;
                    reply = jsonResponse?.jsonMarkdownString ?? "";

                    if (responseCode !== 200 || !reply) {
                        setIsLoading(false);
                        alert("Server Error: LLM could not generate terms.");
                        return;
                    }

                    await appendGameHistory(activeTextStr, reply);
                    void syncHistoryForKeyBestEffort(activeTextStr, false);
                }

                if (!isReviewFavorites) {
                    try {
                        const asJson = JSON.parse(reply) as Array<Record<string, unknown>>;
                        parsedTerms = asJson
                            .filter((item) => {
                                return (
                                    typeof item.japanese === "string" &&
                                    typeof item.kana === "string" &&
                                    typeof item.english_definition === "string"
                                );
                            })
                            .map((item) => {
                                const score =
                                    typeof item.gravity_score === "number"
                                        ? item.gravity_score
                                        : undefined;
                                const readingScore =
                                    typeof item.gravity_reading_score === "number"
                                        ? item.gravity_reading_score
                                        : undefined;
                                return {
                                    japanese: item.japanese as string,
                                    kana: item.kana as string,
                                    english_definition:
                                        item.english_definition as string,
                                    example_sentences: Array.isArray(
                                        item.example_sentences,
                                    )
                                        ? item.example_sentences
                                        : undefined,
                                    isFavorite:
                                        typeof item.isFavorite === "boolean"
                                            ? item.isFavorite
                                            : undefined,
                                    gravity_score: score,
                                    gravity_reading_score: readingScore,
                                    isLearnt:
                                        (score ?? 0) >= 2 ||
                                        (readingScore ?? 0) >= 2,
                                    type:
                                        typeof item.type === "string"
                                            ? item.type
                                            : undefined,
                                };
                            });
                    } catch (error) {
                        console.error("Failed to parse game terms:", error);
                        alert("Could not parse terms for gravity game.");
                        setIsLoading(false);
                        return;
                    }
                }
            }

            if (parsedTerms.length === 0) {
                alert("No terms found for this game.");
                setIsLoading(false);
                return;
            }

            const storageMode =
                typeof localStorage !== "undefined"
                    ? localStorage.getItem("storageMode")
                    : null;
            const shouldApplyLocalTermStates =
                storageMode !== "server" && !isReviewFavorites;

            if (shouldApplyLocalTermStates) {
                parsedTerms = applyLocalTermStatesToTerms(parsedTerms);
            }

            const shouldFilterFavorites =
                !ignoreFavoritesMode &&
                (forceFavoritesMode || isFavoritesModeRef.current);
            const filteredTerms = parsedTerms.filter((term) => {
                if (isSrsMode) {
                    return true;
                }
                if (shouldFilterFavorites) {
                    return term.isFavorite === true;
                }
                return true;
            });

            if (filteredTerms.length === 0) {
                setIsEmptyFavoritesModalOpen(true);
                setIsLoading(false);
                return;
            }

            setAllTerms(parsedTerms);
            setScopedTerms(filteredTerms);
            const nextActiveTerms =
                isKeepPlayingModeRef.current
                    ? filteredTerms
                    : isExtinctionModeRef.current
                      ? filteredTerms.filter(
                            (term) =>
                                !isGravityTermLearnt(
                                    term,
                                    isTestReadingRef.current,
                                ),
                        )
                      : filteredTerms;
            setActiveTerms(nextActiveTerms);
            setScore(0);
            setTermWrongCounts({});
            setTimer(0);
            setAnswer("");
            setIsGameOver(false);
            setGameOverMessage("");
            setIsCorrectionModalOpen(false);
            setCorrectionInput("");
            setCorrectionError("");
            setIsAllLearntModalOpen(false);
            setHasShownAllLearntModal(false);
            setFallingTerms([]);
            setCorrectionTerm(null);
            initializeGravityRun(nextActiveTerms);
            if (openEditTermsAfterLoad) {
                setIsEditTermsModalOpen(true);
            }
            setIsLoading(false);
        },
        [
            isExtinctionModeRef,
            isFavoritesModeRef,
            isKeepPlayingModeRef,
            setTimer,
            setAnswer,
            setCorrectionError,
            setCorrectionInput,
            setGameOverMessage,
            setHasShownAllLearntModal,
            setIsAllLearntModalOpen,
            setIsCorrectionModalOpen,
            setIsGameOver,
            setScore,
            setTermWrongCounts,
            initializeGravityRun,
            setFallingTerms,
            setCorrectionTerm,
            isTestReadingRef,
            setIsEditTermsModalOpen,
        ],
    );

    React.useEffect(() => {
        if (allTerms.length === 0) {
            return;
        }
        const source = progressSourceRef.current;
        if (!source) {
            return;
        }
        if (source.mode === "srs") {
            return;
        }

        upsertLocalTermStatesFromTerms(allTerms);

        const serializedTerms = JSON.stringify(allTerms);
        if (source.mode === "favorites") {
            setFavoriteTerms(allTerms);
            return;
        }
        if (source.mode === "history") {
            void appendGameHistory(source.key, serializedTerms, true);
            void syncHistoryForKeyBestEffort(source.key, true);
            return;
        }
        void appendGameHistory(source.key, serializedTerms, false);
        void syncHistoryForKeyBestEffort(source.key, false);
    }, [allTerms]);

    return {
        allTerms,
        setAllTerms,
        scopedTerms,
        setScopedTerms,
        activeTerms,
        setActiveTerms,
        isLoading,
        setIsLoading,
        loadVocabTerms,
        isEmptyFavoritesModalOpen,
        setIsEmptyFavoritesModalOpen,
    };
}
