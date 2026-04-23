"use client";

import * as React from "react";

import { appendGameHistory, getGameHistory } from "@/lib/utils";
import type { VocabTerm } from "@/lib/types/vocab";
import {
    getShuffledTermKeys,
    isGravityTermLearnt,
} from "../_lib/gravity-utils";
import type { FallingTerm } from "../_lib/gravity-utils";

type ProgressSource =
    | { mode: "favorites" }
    | { mode: "history"; key: string }
    | { mode: "active"; key: string };

type TermsLoaderInputs = {
    isFavoritesModeRef: React.MutableRefObject<boolean>;
    isExtinctionModeRef: React.MutableRefObject<boolean>;
    spawnTerm: (queue: string[], sourceTerms: VocabTerm[]) => void;
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
    setCorrectionTerm: React.Dispatch<React.SetStateAction<VocabTerm | null>>;
};

export function useGravityTermsLoader({
    isFavoritesModeRef,
    isExtinctionModeRef,
    spawnTerm,
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
    setFallingTerms,
    setCorrectionTerm,
}: TermsLoaderInputs) {
    const [allTerms, setAllTerms] = React.useState<VocabTerm[]>([]);
    const [scopedTerms, setScopedTerms] = React.useState<VocabTerm[]>([]);
    const [activeTerms, setActiveTerms] = React.useState<VocabTerm[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const progressSourceRef = React.useRef<ProgressSource | null>(null);

    const loadVocabTerms = React.useCallback(async () => {
        setIsLoading(true);

        const activeTextStr = localStorage.getItem("activeText");
        if (!activeTextStr) {
            alert("No active text found. Please use the ereader first.");
            setIsLoading(false);
            return;
        }

        let cachedJsonString: string | null = null;
        const urlParams = new URLSearchParams(window.location.search);
        const isReviewFavorites = urlParams.get("favorites") === "1";
        const isReviewHistory = urlParams.get("history") === "1";

        if (isReviewFavorites) {
            cachedJsonString = localStorage.getItem("favoriteTerms");
            progressSourceRef.current = { mode: "favorites" };
            if (!cachedJsonString) {
                alert("No favorite terms found.");
                setIsLoading(false);
                return;
            }
        } else if (isReviewHistory) {
            const historyHash = urlParams.get("historyTerms") ?? "";
            cachedJsonString = getGameHistory(historyHash, true);
            progressSourceRef.current = { mode: "history", key: historyHash };
            if (!cachedJsonString) {
                alert("No history terms found for key: " + historyHash);
                setIsLoading(false);
                return;
            }
        } else {
            cachedJsonString = getGameHistory(activeTextStr, false);
            progressSourceRef.current = { mode: "active", key: activeTextStr };
        }

        let reply = cachedJsonString ?? "";

        if (!reply) {
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

            appendGameHistory(activeTextStr, reply);
        }

        let parsedTerms: VocabTerm[] = [];
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
                    return {
                        japanese: item.japanese as string,
                        kana: item.kana as string,
                        english_definition: item.english_definition as string,
                        isFavorite: item.isFavorite as boolean | undefined,
                        gravity_score: score,
                        isLearnt: typeof score === "number" ? score >= 2 : false,
                    };
                });
        } catch (error) {
            console.error("Failed to parse game terms:", error);
            alert("Could not parse terms for gravity game.");
            setIsLoading(false);
            return;
        }

        if (parsedTerms.length === 0) {
            alert("No terms found for this game.");
            setIsLoading(false);
            return;
        }

        const filteredTerms = parsedTerms.filter((term) => {
            if (isFavoritesModeRef.current) {
                return term.isFavorite === true;
            }
            return true;
        });

        if (filteredTerms.length === 0) {
            alert("No favorite terms found.");
            setIsLoading(false);
            return;
        }

        setAllTerms(parsedTerms);
        setScopedTerms(filteredTerms);
        const nextActiveTerms = isExtinctionModeRef.current
            ? filteredTerms.filter((term) => !isGravityTermLearnt(term))
            : filteredTerms;
        setActiveTerms(nextActiveTerms);
        const queue = getShuffledTermKeys(nextActiveTerms);
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
        if (nextActiveTerms.length > 0) {
            spawnTerm(queue, nextActiveTerms);
        }
        setIsLoading(false);
    }, [
        isExtinctionModeRef,
        isFavoritesModeRef,
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
        spawnTerm,
        setFallingTerms,
        setCorrectionTerm,
    ]);

    React.useEffect(() => {
        if (allTerms.length === 0) {
            return;
        }
        const source = progressSourceRef.current;
        if (!source) {
            return;
        }

        const serializedTerms = JSON.stringify(allTerms);
        if (source.mode === "favorites") {
            localStorage.setItem("favoriteTerms", serializedTerms);
            return;
        }
        if (source.mode === "history") {
            appendGameHistory(source.key, serializedTerms, true);
            return;
        }
        appendGameHistory(source.key, serializedTerms, false);
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
    };
}
