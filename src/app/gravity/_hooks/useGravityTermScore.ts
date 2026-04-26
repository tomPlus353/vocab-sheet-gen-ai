"use client";

import * as React from "react";

import { getTermKey, isGravityTermLearnt } from "../_lib/gravity-utils";
import type { VocabTerm } from "@/lib/types/vocab";

type TermScoreInputs = {
    setAllTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
    setScopedTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
    setActiveTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
    isExtinctionModeRef: React.MutableRefObject<boolean>;
    isTestReadingRef: React.MutableRefObject<boolean>;
};

export function useGravityTermScore({
    setAllTerms,
    setScopedTerms,
    setActiveTerms,
    isExtinctionModeRef,
    isTestReadingRef,
}: TermScoreInputs) {
    const updateTermScore = React.useCallback(
        (
            term: VocabTerm,
            action: "correct" | "wrong",
            shouldIncrement: boolean,
        ) => {
            const targetKey = getTermKey(term);
            const applyScoreUpdate = (prevTerms: VocabTerm[]) =>
                prevTerms.map((oneTerm) => {
                    if (getTermKey(oneTerm) !== targetKey) {
                        return oneTerm;
                    }

                    const scoreField = isTestReadingRef.current
                        ? ("gravity_reading_score" as const)
                        : ("gravity_score" as const);
                    const currentScore = isTestReadingRef.current
                        ? oneTerm.gravity_reading_score ?? 0
                        : oneTerm.gravity_score ?? 0;

                    if (action === "wrong") {
                        return {
                            ...oneTerm,
                            [scoreField]: 0,
                            isLearnt: false,
                        };
                    }

                    if (!shouldIncrement) {
                        return oneTerm;
                    }

                    const nextScore = currentScore + 1;
                    return {
                        ...oneTerm,
                        [scoreField]: nextScore,
                        isLearnt: nextScore >= 2,
                    };
                });

            setAllTerms(applyScoreUpdate);
            setScopedTerms((prevTerms) => {
                const updatedTerms = applyScoreUpdate(prevTerms);
                setActiveTerms(
                    isExtinctionModeRef.current
                        ? updatedTerms.filter(
                              (oneTerm) =>
                                  !isGravityTermLearnt(
                                      oneTerm,
                                      isTestReadingRef.current,
                                  ),
                          )
                        : updatedTerms,
                );
                return updatedTerms;
            });
        },
        [isExtinctionModeRef, setActiveTerms, setAllTerms, setScopedTerms],
    );

    return { updateTermScore };
}
