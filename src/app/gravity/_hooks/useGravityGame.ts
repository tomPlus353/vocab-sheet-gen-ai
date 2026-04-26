"use client";

import * as React from "react";

import { useToast } from "@/hooks/use-toast";

import {
    type FallingTerm,
    HORIZONTAL_PADDING_PX,
    MAX_SIMULTANEOUS_TERMS,
    WORD_SPAWN_INTERVAL_MS,
    getShuffledTermKeys,
    getTermKey,
    getGravityTermScore,
    isGravityTermLearnt,
    PLAYFIELD_HEIGHT_PX,
} from "../_lib/gravity-utils";
import type { VocabTerm } from "@/lib/types/vocab";
import { useGravityAnswerHandlers } from "./useGravityAnswerHandlers";
import { useGravityExtinctionMode } from "./useGravityExtinctionMode";
import { useGravityFavoritesMode } from "./useGravityFavoritesMode";
import { useGravityPlayfield } from "./useGravityPlayfield";
import { useGravityProgressReset } from "./useGravityProgressReset";
import { useGravityTermsLoader } from "./useGravityTermsLoader";
import { useGravityTermScore } from "./useGravityTermScore";
import { useGravityTimer } from "./useGravityTimer";

const TEST_READING_STORAGE_KEY = "gravityTestReadingMode";

export function useGravityGame() {
    const [remainingQueue, setRemainingQueue] = React.useState<string[]>([]);
    const [fallingTerms, setFallingTerms] = React.useState<FallingTerm[]>([]);
    const [answer, setAnswer] = React.useState("");
    const [score, setScore] = React.useState(0);
    const [termWrongCounts, setTermWrongCounts] = React.useState<
        Record<string, number>
    >({});
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [gameOverMessage, setGameOverMessage] = React.useState("");
    const [showReadingHint, setShowReadingHint] = React.useState(false);
    const [isTestReading, setIsTestReadingState] = React.useState(() => {
        if (typeof window === "undefined") {
            return false;
        }
        return window.localStorage.getItem(TEST_READING_STORAGE_KEY) === "1";
    });
    const [timer, setTimer] = React.useState(0);
    const [correctionInput, setCorrectionInput] = React.useState("");
    const [correctionError, setCorrectionError] = React.useState("");
    const [correctionTerm, setCorrectionTerm] = React.useState<VocabTerm | null>(
        null,
    );
    const [hasShownAllLearntModal, setHasShownAllLearntModal] =
        React.useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] =
        React.useState(false);
    const [isEditTermsModalOpen, setIsEditTermsModalOpen] =
        React.useState(false);
    const [isAllLearntModalOpen, setIsAllLearntModalOpen] =
        React.useState(false);

    const isTestReadingRef = React.useRef(isTestReading);
    const setIsTestReading = React.useCallback(
        (value: React.SetStateAction<boolean>) => {
            const nextValue =
                typeof value === "function"
                    ? (value as (prevState: boolean) => boolean)(
                          isTestReadingRef.current,
                      )
                    : value;
            isTestReadingRef.current = nextValue;
            setIsTestReadingState(nextValue);
            try {
                window.localStorage.setItem(
                    TEST_READING_STORAGE_KEY,
                    nextValue ? "1" : "0",
                );
            } catch {
                // ignore storage errors (private mode, quota, etc.)
            }
        },
        [],
    );

    const inputRef = React.useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const {
        isFavoritesMode,
        setIsFavoritesMode,
        isFavoritesModeRef,
        isFavoritesModeReady,
    } = useGravityFavoritesMode();
    const {
        isExtinctionMode,
        setIsExtinctionMode,
        isExtinctionModeRef,
        isExtinctionModeReady,
    } = useGravityExtinctionMode();

    const spawnTerm = React.useCallback(
        (queue: string[], sourceTerms: VocabTerm[]) => {
            const sourceTermKeys = new Set(
                sourceTerms.map((term) => getTermKey(term)),
            );
            let workingQueue = queue.filter((key) => sourceTermKeys.has(key));
            if (workingQueue.length === 0) {
                workingQueue = getShuffledTermKeys(sourceTerms);
            }

            const [nextKey, ...rest] = workingQueue;
            const nextTerm = sourceTerms.find(
                (term) => getTermKey(term) === nextKey,
            );
            if (!nextTerm) {
                if (sourceTerms.length === 0) {
                    return;
                }
                setIsGameOver(true);
                setGameOverMessage("Game ended due to invalid term data.");
                return;
            }

            setRemainingQueue(rest);
            setFallingTerms((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    term: nextTerm,
                    y: 0,
                    x: HORIZONTAL_PADDING_PX,
                    isPositioned: false,
                    laneIndex: undefined,
                },
            ]);
        },
        [
            setRemainingQueue,
            setFallingTerms,
            setIsGameOver,
            setGameOverMessage,
        ],
    );

    const {
        allTerms,
        setAllTerms,
        scopedTerms,
        setScopedTerms,
        activeTerms,
        setActiveTerms,
        isLoading,
        setIsLoading,
        loadVocabTerms,
    } = useGravityTermsLoader({
        isFavoritesModeRef,
        isExtinctionModeRef,
        isTestReadingRef,
        spawnTerm,
        setFallingTerms,
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
        setCorrectionTerm,
    });

    const { updateTermScore } = useGravityTermScore({
        setAllTerms,
        setScopedTerms,
        setActiveTerms,
        isExtinctionModeRef,
        isTestReadingRef,
    });

    useGravityTimer({
        setTimer,
        isLoading,
        isGameOver,
        isCorrectionModalOpen,
        isAllLearntModalOpen,
        isEditTermsModalOpen,
    });

    const { playfieldRef } = useGravityPlayfield({
        fallingTerms,
        setFallingTerms,
        isLoading,
        isGameOver,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        score,
    });

    const {
        handleWrongAttempt,
        handleSubmit,
        handleCorrectionSubmit,
    } = useGravityAnswerHandlers({
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
    });

    const { resetLearningProgress } = useGravityProgressReset({
        activeTerms: scopedTerms,
        setActiveTerms,
        setScopedTerms,
        setAllTerms,
        setFallingTerms,
        setTermWrongCounts,
        setIsAllLearntModalOpen,
        setHasShownAllLearntModal,
        setIsCorrectionModalOpen,
        setCorrectionInput,
        setCorrectionError,
        setAnswer,
        setCorrectionTerm,
        toast,
    });

    React.useEffect(() => {
        if (!isFavoritesModeReady || !isExtinctionModeReady) {
            return;
        }

        loadVocabTerms().catch((err) => {
            console.error("Error loading gravity game:", err);
            setIsLoading(false);
        });
    }, [isExtinctionModeReady, isFavoritesModeReady, loadVocabTerms]);

    const fallingTermsRef = React.useRef<FallingTerm[]>(fallingTerms);
    React.useEffect(() => {
        fallingTermsRef.current = fallingTerms;
    }, [fallingTerms]);

    const remainingQueueRef = React.useRef<string[]>(remainingQueue);
    React.useEffect(() => {
        remainingQueueRef.current = remainingQueue;
    }, [remainingQueue]);

    const activeTermsRef = React.useRef<VocabTerm[]>(activeTerms);
    React.useEffect(() => {
        activeTermsRef.current = activeTerms;
    }, [activeTerms]);

    React.useEffect(() => {
        const activeKeys = new Set(activeTerms.map((term) => getTermKey(term)));
        setRemainingQueue((prevQueue) =>
            prevQueue.filter((key) => activeKeys.has(key)),
        );
    }, [activeTerms]);

    React.useEffect(() => {
        if (
            isGameOver ||
            isLoading ||
            isCorrectionModalOpen ||
            isAllLearntModalOpen ||
            isEditTermsModalOpen
        ) {
            return;
        }

        const interval = setInterval(() => {
            if (
                fallingTermsRef.current.length >= MAX_SIMULTANEOUS_TERMS ||
                activeTermsRef.current.length === 0
            ) {
                return;
            }

            spawnTerm(remainingQueueRef.current, activeTermsRef.current);
        }, WORD_SPAWN_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        isAllLearntModalOpen,
        isEditTermsModalOpen,
        spawnTerm,
    ]);

    React.useEffect(() => {
        if (
            fallingTerms.length === 0 ||
            isGameOver ||
            isLoading ||
            isCorrectionModalOpen ||
            isEditTermsModalOpen
        ) {
            return;
        }

        const missedTerm = fallingTerms.find((term) => term.y >= PLAYFIELD_HEIGHT_PX);
        if (!missedTerm) {
            return;
        }

        toast({
            title: "Missed",
            description: "The term reached the bottom.",
            duration: 800,
            variant: "destructive",
        });
        updateTermScore(missedTerm.term, "wrong", false);
        setFallingTerms((prev) => prev.filter((item) => item.id !== missedTerm.id));
        handleWrongAttempt(missedTerm.term);
    }, [
        fallingTerms,
        handleWrongAttempt,
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        toast,
        updateTermScore,
    ]);

    React.useEffect(() => {
        if (scopedTerms.length === 0 || isGameOver) {
            return;
        }

        const allLearnt = scopedTerms.every((term) =>
            isGravityTermLearnt(term, isTestReading),
        );
        if (allLearnt && !hasShownAllLearntModal) {
            setHasShownAllLearntModal(true);
            setIsAllLearntModalOpen(true);
            setFallingTerms([]);
        }
    }, [hasShownAllLearntModal, isGameOver, isTestReading, scopedTerms]);

    React.useEffect(() => {
        if (!isGameOver) {
            return;
        }

        setFallingTerms([]);
    }, [isGameOver]);

    React.useEffect(() => {
        const hasUnlearntTerm = scopedTerms.some((term) =>
            !isGravityTermLearnt(term, isTestReading),
        );
        if (hasUnlearntTerm && hasShownAllLearntModal) {
            setHasShownAllLearntModal(false);
        }
    }, [hasShownAllLearntModal, isTestReading, scopedTerms]);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, [fallingTerms.length]);

    const learntTermsCount = scopedTerms.filter((term) =>
        isGravityTermLearnt(term, isTestReading),
    ).length;
    const learningTermsCount = scopedTerms.filter(
        (term) => getGravityTermScore(term, isTestReading) === 1,
    ).length;
    const unlearntTermsCount = scopedTerms.filter(
        (term) => getGravityTermScore(term, isTestReading) === 0,
    ).length;

    const resumeAfterAllLearntModal = React.useCallback(() => {
        setIsAllLearntModalOpen(false);
        if (isGameOver) {
            return;
        }

        if (activeTerms.length === 0) {
            if (isExtinctionModeRef.current) {
                setIsExtinctionMode(false);
            }
            loadVocabTerms().catch((err) => {
                console.error("Error resuming gravity practice:", err);
            });
            return;
        }
        spawnTerm(remainingQueue, activeTerms);
    }, [
        activeTerms,
        isExtinctionModeRef,
        isGameOver,
        loadVocabTerms,
        remainingQueue,
        setIsExtinctionMode,
        spawnTerm,
    ]);

    const isTermAtRisk = Object.values(termWrongCounts).some(
        (count) => count > 0,
    );
    const oppositeModeHasUnlearntTerms = scopedTerms.some((term) =>
        !isGravityTermLearnt(term, !isTestReading),
    );

    const hasUnlearntTermsInScope = scopedTerms.some(
        (term) => !isGravityTermLearnt(term, isTestReading),
    );
    const isExtinctionModeDisabled =
        scopedTerms.length > 0 && !hasUnlearntTermsInScope;

    React.useEffect(() => {
        if (isExtinctionMode && isExtinctionModeDisabled) {
            setIsExtinctionMode(false);
        }
    }, [isExtinctionMode, isExtinctionModeDisabled, setIsExtinctionMode]);

    return {
        answer,
        correctionError,
        correctionInput,
        correctionTerm,
        gameOverMessage,
        handleCorrectionSubmit,
        handleSubmit,
        inputRef,
        isAllLearntModalOpen,
        isCorrectionModalOpen,
        isGameOver,
        isLoading,
        learntTermsCount,
        learningTermsCount,
        loadVocabTerms,
        playfieldRef,
        resumeAfterAllLearntModal,
        resetLearningProgress,
        setAnswer,
        setCorrectionInput,
        setShowReadingHint,
        showReadingHint,
        isFavoritesMode,
        setIsFavoritesMode,
        isExtinctionMode,
        setIsExtinctionMode,
        isExtinctionModeDisabled,
        totalTermsCount: scopedTerms.length,
        timer,
        unlearntTermsCount,
        terms: allTerms,
        setTerms: setAllTerms,
        isEditTermsModalOpen,
        setIsEditTermsModalOpen,
        fallingTerms,
        termWrongCounts,
        isTermAtRisk,
        isTestReading,
        setIsTestReading,
        oppositeModeHasUnlearntTerms,
    };
}
