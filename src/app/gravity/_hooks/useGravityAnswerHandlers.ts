"use client";

import * as React from "react";

import { isAnswerCorrect, getTermKey } from "../_lib/gravity-utils";
import type { FallingTerm } from "../_lib/gravity-utils";
import type { VocabTerm } from "@/lib/types/vocab";

type AnswerHandlerInputs = {
    activeTerm: FallingTerm | null;
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
    setActiveTerm: React.Dispatch<React.SetStateAction<FallingTerm | null>>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    updateTermScore: (
        term: VocabTerm,
        action: "correct" | "wrong",
        shouldIncrement: boolean,
    ) => void;
    termWrongCounts: Record<string, number>;
    setTermWrongCounts: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
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
};

export function useGravityAnswerHandlers({
    activeTerm,
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
    setActiveTerm,
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
}: AnswerHandlerInputs) {
    const handleWrongAttempt = React.useCallback(
        (term: VocabTerm) => {
            const termKey = getTermKey(term);
            const previousCount = termWrongCounts[termKey] ?? 0;
            const nextCount = previousCount + 1;

            setTermWrongCounts((prev) => ({
                ...prev,
                [termKey]: nextCount,
            }));

            if (nextCount >= 2) {
                setActiveTerm(null);
                setIsGameOver(true);
                setGameOverMessage(
                    `Game over. "${term.japanese}" was missed twice.`,
                );
                return;
            }

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
            setActiveTerm,
            termWrongCounts,
        ],
    );

    const activeTermWrongCount = activeTerm
        ? (termWrongCounts[getTermKey(activeTerm.term)] ?? 0)
        : 0;

    const handleSubmit = React.useCallback(
        (event: React.FormEvent) => {
            event.preventDefault();

            if (
                !activeTerm ||
                isGameOver ||
                isLoading ||
                isCorrectionModalOpen
            ) {
                return;
            }

            if (isAnswerCorrect(answer, activeTerm.term.japanese)) {
                setScore((prev) => prev + 1);
                updateTermScore(activeTerm.term, "correct", !showReadingHint);
                setAnswer("");
                toast({
                    title: "Correct",
                    description: `${activeTerm.term.english_definition} = ${activeTerm.term.japanese}`,
                    duration: 800,
                    variant: "success",
                });
                spawnTerm(remainingQueue, activeTerms);
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
            activeTerm,
            answer,
            isCorrectionModalOpen,
            isGameOver,
            isLoading,
            remainingQueue,
            showReadingHint,
            spawnTerm,
            activeTerms,
            toast,
            updateTermScore,
            setAnswer,
            setScore,
        ],
    );

    const handleCorrectionSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!activeTerm) {
                return;
            }

            if (isAnswerCorrect(correctionInput, activeTerm.term.japanese)) {
                setIsCorrectionModalOpen(false);
                setCorrectionInput("");
                setCorrectionError("");
                setAnswer("");
                spawnTerm(remainingQueue, activeTerms);
                return;
            }

            setCorrectionError("That is not the correct Japanese term yet.");
        },
        [
            activeTerm,
            correctionInput,
            remainingQueue,
            spawnTerm,
            activeTerms,
            setIsCorrectionModalOpen,
            setCorrectionInput,
            setCorrectionError,
            setAnswer,
        ],
    );

    return {
        activeTermWrongCount,
        handleWrongAttempt,
        handleSubmit,
        handleCorrectionSubmit,
    };
}
