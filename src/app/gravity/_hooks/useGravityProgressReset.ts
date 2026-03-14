"use client";

import * as React from "react";

import { getTermKey } from "../_lib/gravity-utils";
import type { VocabTerm } from "@/lib/types/vocab";

type ProgressResetInputs = {
    activeTerms: VocabTerm[];
    setActiveTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
    setAllTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
    setTermWrongCounts: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
    setIsAllLearntModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setHasShownAllLearntModal: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCorrectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCorrectionInput: React.Dispatch<React.SetStateAction<string>>;
    setCorrectionError: React.Dispatch<React.SetStateAction<string>>;
    setAnswer: React.Dispatch<React.SetStateAction<string>>;
    toast: (payload: {
        title: string;
        description: string;
        duration: number;
        variant: "default" | "success" | "destructive";
    }) => void;
};

export function useGravityProgressReset({
    activeTerms,
    setActiveTerms,
    setAllTerms,
    setTermWrongCounts,
    setIsAllLearntModalOpen,
    setHasShownAllLearntModal,
    setIsCorrectionModalOpen,
    setCorrectionInput,
    setCorrectionError,
    setAnswer,
    toast,
}: ProgressResetInputs) {
    const resetLearningProgress = React.useCallback(() => {
        if (activeTerms.length === 0) {
            return;
        }

        const activeTermKeys = new Set(
            activeTerms.map((term) => getTermKey(term)),
        );
        const resetTerm = (term: VocabTerm) => ({
            ...term,
            gravity_score: 0,
            isLearnt: false,
        });

        setActiveTerms((prevTerms) => prevTerms.map(resetTerm));
        setAllTerms((prevTerms) =>
            prevTerms.map((term) =>
                activeTermKeys.has(getTermKey(term)) ? resetTerm(term) : term,
            ),
        );
        setTermWrongCounts({});
        setIsAllLearntModalOpen(false);
        setHasShownAllLearntModal(false);
        setIsCorrectionModalOpen(false);
        setCorrectionInput("");
        setCorrectionError("");
        setAnswer("");
        toast({
            title: "Progress reset",
            description: "Learning progress was reset for this term set.",
            duration: 1200,
            variant: "default",
        });
    }, [
        activeTerms,
        setActiveTerms,
        setAllTerms,
        setTermWrongCounts,
        setIsAllLearntModalOpen,
        setHasShownAllLearntModal,
        setIsCorrectionModalOpen,
        setCorrectionInput,
        setCorrectionError,
        setAnswer,
        toast,
    ]);

    return { resetLearningProgress };
}
