"use client";

import * as React from "react";

import { isAnswerCorrect, getTermKey } from "../_lib/gravity-utils";
import type { FallingTerm } from "../_lib/gravity-utils";
import type { VocabTerm } from "@/lib/types/vocab";

type AnswerHandlerInputs = {
    fallingTerms: FallingTerm[];
    setFallingTerms: React.Dispatch<React.SetStateAction<FallingTerm[]>>;
    answer: string;
    setAnswer: React.Dispatch<React.SetStateAction<string>>;
    isGameOver: boolean;
    isLoading: boolean;
    isCorrectionModalOpen: boolean;
    showReadingHint: boolean;
    correctionInput: string;
    remainingQueue: number[];
    activeTerms: VocabTerm[];
    spawnTerm: (queue: number[], sourceTerms: VocabTerm[]) => void;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    updateTermScore: (
        term: VocabTerm,
        action: "correct" | "wrong",
        shouldIncrement: boolean,
    ) => void;
    termWrongCounts: Record<string, number>;
    setTermWrongCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
    setGameOverMessage: React.Dispatch<React.SetStateAction<string>>;
    setIsCorrectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCorrectionInput: React.Dispatch<React.SetStateAction<string>>;
    setCorrectionError: React.Dispatch<React.SetStateAction<string>>;
    toast: (payload: {
        title: string;
        description: string;
        duration: number;
        variant: "success" | "destructive" | "default";
    }) => void;
    correctionTerm: VocabTerm | null;
    setCorrectionTerm: React.Dispatch<React.SetStateAction<VocabTerm | null>>;
};

export function useGravityAnswerHandlers({
    fallingTerms,
    setFallingTerms,
    answer,
    setAnswer,
    isGameOver,
    isLoading,
    isCorrectionModalOpen,
    showReadingHint,
    correctionInput,
    remainingQueue,
    activeTerms,
    spawnTerm,
    setScore,
    updateTermScore,
    termWrongCounts,
    setTermWrongCounts,
    setIsGameOver,
    setGameOverMessage,
    setIsCorrectionModalOpen,
    setCorrectionInput,
    setCorrectionError,
    toast,
    correctionTerm,
    setCorrectionTerm,
}: AnswerHandlerInputs) {
    const handleWrongAttempt = React.useCallback(
        (term: VocabTerm) => {
            const termKey = getTermKey(term);
            const previousCount = termWrongCounts[termKey] ?? 0;
            const nextCount = previousCount + 1;

            setTermWrongCounts((prev) => ({
                ...prev,
                [termKey]: (prev[termKey] ?? 0) + 1,
            }));

            if (nextCount >= 2) {
                setCorrectionTerm(term);
                setIsCorrectionModalOpen(true);
                setCorrectionInput(answer);
                setCorrectionError("");
                setIsGameOver(true);
                setGameOverMessage(
                    `Game over. "${term.japanese}" was missed twice.`,
                );
                return;
            }

            setCorrectionTerm(term);
            setIsCorrectionModalOpen(true);
            setCorrectionInput(answer);
            setCorrectionError("");
        },
        [
            answer,
            setCorrectionError,
            setCorrectionInput,
            setGameOverMessage,
            setIsCorrectionModalOpen,
            setIsGameOver,
            setTermWrongCounts,
            setCorrectionTerm,
            termWrongCounts,
        ],
    );

    const handleSubmit = React.useCallback(
        (event: React.FormEvent) => {
            event.preventDefault();

            if (
                fallingTerms.length === 0 ||
                isGameOver ||
                isLoading ||
                isCorrectionModalOpen
            ) {
                return;
            }

            const matches = fallingTerms.filter((falling) =>
                isAnswerCorrect(answer, falling.term.japanese),
            );

            if (matches.length > 0) {
                const matchedIds = new Set(matches.map((match) => match.id));
                setFallingTerms((prev) =>
                    prev.filter((term) => !matchedIds.has(term.id)),
                );
                matches.forEach((match) => {
                    updateTermScore(match.term, "correct", !showReadingHint);
                });
                setScore((prev) => prev + matches.length);
                setAnswer("");
                let toastDescription = `${matches.length} matching terms cleared.`;
                if (matches.length === 1) {
                    const singleMatch = matches[0]!;
                    toastDescription = `${singleMatch.term.english_definition} = ${singleMatch.term.japanese}`;
                }
                toast({
                    title: "Correct",
                    description: toastDescription,
                    duration: 800,
                    variant: "success",
                });
                return;
            }

            toast({
                title: "Incorrect",
                description: "Try again.",
                duration: 800,
                variant: "destructive",
            });
            setAnswer("");
        },
        [
            fallingTerms,
            answer,
            isCorrectionModalOpen,
            isGameOver,
            isLoading,
            showReadingHint,
            toast,
            updateTermScore,
            setAnswer,
            setScore,
        ],
    );

    const handleCorrectionSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!correctionTerm) {
                return;
            }

            if (isAnswerCorrect(correctionInput, correctionTerm.japanese)) {
                setIsCorrectionModalOpen(false);
                setCorrectionInput("");
                setCorrectionError("");
                setAnswer("");
                setCorrectionTerm(null);
                if (isGameOver) {
                    return;
                }
                spawnTerm(remainingQueue, activeTerms);
                return;
            }

            setCorrectionError("That is not the correct Japanese term yet.");
        },
        [
            correctionTerm,
            correctionInput,
            isGameOver,
            remainingQueue,
            spawnTerm,
            activeTerms,
            setIsCorrectionModalOpen,
            setCorrectionInput,
            setCorrectionError,
            setAnswer,
            setCorrectionTerm,
        ],
    );

    return {
        handleWrongAttempt,
        handleSubmit,
        handleCorrectionSubmit,
    };
}
