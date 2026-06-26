"use client";

import * as React from "react";

import { useToast } from "@/hooks/use-toast";

import {
    type FallingTerm,
    GRAVITY_BATCH_SIZE,
    GRAVITY_INITIAL_FALL_SPEED,
    GRAVITY_INITIAL_SPAWN_INTERVAL_MS,
    GRAVITY_LEVEL_SPAWN_MULTIPLIER,
    GRAVITY_LEVEL_SPEED_MULTIPLIER,
    GRAVITY_LEVEL_TRANSITION_BASE_DELAY_MS,
    GRAVITY_LEVEL_TRANSITION_DELAY_PER_LEVEL_MS,
    HORIZONTAL_PADDING_PX,
    MAX_SIMULTANEOUS_TERMS,
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
import { useGravityKeepPlayingMode } from "./useGravityKeepPlayingMode";
import { useGravityPlayfield } from "./useGravityPlayfield";
import { useGravityProgressReset } from "./useGravityProgressReset";
import { useGravityTermsLoader } from "./useGravityTermsLoader";
import { useGravityTermScore } from "./useGravityTermScore";
import { useGravityTimer } from "./useGravityTimer";
import {
    syncGravityTermStatesBestEffort,
    syncSrsReviewBestEffort,
} from "@/lib/storage-sync";
import { applySrsSessionAnswer } from "../_lib/srs-gravity-session";
import { resolveSrsPromptType } from "@/lib/srs-prompt";

const TEST_READING_STORAGE_KEY = "gravityTestReadingMode";

export function useGravityGame() {
    const [remainingQueue, setRemainingQueue] = React.useState<string[]>([]);
    const [batchBacklog, setBatchBacklog] = React.useState<string[]>([]);
    const [fallingTerms, setFallingTerms] = React.useState<FallingTerm[]>([]);
    const [answer, setAnswer] = React.useState("");
    const [, setScore] = React.useState(0);
    const [level, setLevel] = React.useState(1);
    const [fallSpeed, setFallSpeed] = React.useState(
        GRAVITY_INITIAL_FALL_SPEED,
    );
    const [spawnIntervalMs, setSpawnIntervalMs] = React.useState(
        GRAVITY_INITIAL_SPAWN_INTERVAL_MS,
    );
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
    const didFlushCompletionRef = React.useRef(false);
    const isBatchTransitioningRef = React.useRef(false);

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
        isSrsMode,
    } = useGravityFavoritesMode();
    const {
        isExtinctionMode,
        setIsExtinctionMode,
        isExtinctionModeRef,
        isExtinctionModeReady,
    } = useGravityExtinctionMode();
    const {
        isKeepPlayingMode,
        setIsKeepPlayingMode,
        isKeepPlayingModeRef,
        isKeepPlayingModeReady,
    } = useGravityKeepPlayingMode();

    const spawnTerm = React.useCallback(
        (queue: string[], sourceTerms: VocabTerm[]) => {
            const sourceTermKeys = new Set(
                sourceTerms.map((term) => getTermKey(term)),
            );
            const workingQueue = queue.filter((key) => sourceTermKeys.has(key));
            if (workingQueue.length === 0) {
                setRemainingQueue([]);
                return;
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

    const getNextBatchState = React.useCallback(
        (sourceTerms: VocabTerm[], preferredBacklog: string[] = []) => {
            const sourceTermKeys = new Set(
                sourceTerms.map((term) => getTermKey(term)),
            );
            const nextKeys = preferredBacklog.filter((key) =>
                sourceTermKeys.has(key),
            );
            const sourceKeys =
                nextKeys.length > 0 ? nextKeys : getShuffledTermKeys(sourceTerms);

            return {
                batchKeys: sourceKeys.slice(0, GRAVITY_BATCH_SIZE),
                backlogKeys: sourceKeys.slice(GRAVITY_BATCH_SIZE),
            };
        },
        [],
    );

    const initializeGravityRun = React.useCallback(
        (sourceTerms: VocabTerm[]) => {
            setLevel(1);
            setFallSpeed(GRAVITY_INITIAL_FALL_SPEED);
            setSpawnIntervalMs(GRAVITY_INITIAL_SPAWN_INTERVAL_MS);
            isBatchTransitioningRef.current = false;
            setBatchBacklog([]);
            setRemainingQueue([]);
            setFallingTerms([]);

            const { batchKeys, backlogKeys } = getNextBatchState(sourceTerms);
            setBatchBacklog(backlogKeys);
            if (batchKeys.length > 0) {
                spawnTerm(batchKeys, sourceTerms);
            }
        },
        [getNextBatchState, spawnTerm],
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
        isEmptyFavoritesModalOpen,
        setIsEmptyFavoritesModalOpen,
    } = useGravityTermsLoader({
        isFavoritesModeRef,
        isExtinctionModeRef,
        isKeepPlayingModeRef,
        isTestReadingRef,
        initializeGravityRun,
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
        setIsEditTermsModalOpen,
        setCorrectionTerm,
    });

    const { updateTermScore } = useGravityTermScore({
        setAllTerms,
        setScopedTerms,
        setActiveTerms,
        isExtinctionModeRef,
        isKeepPlayingModeRef,
        isTestReadingRef,
    });

    const handleSrsAnswer = React.useCallback(
        (term: VocabTerm, isCorrect: boolean) => {
            const promptType = resolveSrsPromptType(term.srsPromptType);
            const rating = isCorrect
                ? showReadingHint
                    ? "hard"
                    : "good"
                : "again";

            void syncSrsReviewBestEffort(term, rating, promptType);

            const termKey = getTermKey(term);
            setTermWrongCounts((prev) => {
                const next = { ...prev };
                if (isCorrect) {
                    delete next[termKey];
                } else {
                    next[termKey] = (next[termKey] ?? 0) + 1;
                }
                return next;
            });

            if (!isCorrect) {
                return;
            }

            setActiveTerms((prev) => applySrsSessionAnswer(prev, term, true));
            setRemainingQueue((prev) =>
                prev.filter((key) => key !== getTermKey(term)),
            );
        },
        [showReadingHint],
    );
    const getReviewPromptType = React.useCallback(
        (term: VocabTerm) =>
            isSrsMode
                ? resolveSrsPromptType(term.srsPromptType)
                : isTestReadingRef.current
                  ? "reading"
                  : "meaning",
        [isSrsMode],
    );

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
        fallSpeed,
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
        isSrsMode,
        onSrsAnswer: handleSrsAnswer,
        getReviewPromptType,
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

    const flushGravityProgress = React.useCallback(() => {
        if (isSrsMode || allTerms.length === 0) {
            return;
        }

        void syncGravityTermStatesBestEffort(allTerms);
    }, [allTerms, isSrsMode]);

    React.useEffect(() => {
        if (
            !isFavoritesModeReady ||
            !isExtinctionModeReady ||
            !isKeepPlayingModeReady
        ) {
            return;
        }

        didFlushCompletionRef.current = false;
        loadVocabTerms().catch((err) => {
            console.error("Error loading gravity game:", err);
            setIsLoading(false);
        });
    }, [
        isExtinctionModeReady,
        isFavoritesModeReady,
        isKeepPlayingModeReady,
        loadVocabTerms,
    ]);

    const fallingTermsRef = React.useRef<FallingTerm[]>(fallingTerms);
    React.useEffect(() => {
        fallingTermsRef.current = fallingTerms;
    }, [fallingTerms]);

    const remainingQueueRef = React.useRef<string[]>(remainingQueue);
    React.useEffect(() => {
        remainingQueueRef.current = remainingQueue;
    }, [remainingQueue]);

    const batchBacklogRef = React.useRef<string[]>(batchBacklog);
    React.useEffect(() => {
        batchBacklogRef.current = batchBacklog;
    }, [batchBacklog]);

    const activeTermsRef = React.useRef<VocabTerm[]>(activeTerms);
    React.useEffect(() => {
        activeTermsRef.current = activeTerms;
    }, [activeTerms]);

    React.useEffect(() => {
        const activeKeys = new Set(activeTerms.map((term) => getTermKey(term)));
        setRemainingQueue((prevQueue) =>
            prevQueue.filter((key) => activeKeys.has(key)),
        );
        setBatchBacklog((prevQueue) =>
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
                activeTermsRef.current.length === 0 ||
                remainingQueueRef.current.length === 0
            ) {
                return;
            }

            spawnTerm(remainingQueueRef.current, activeTermsRef.current);
        }, spawnIntervalMs);

        return () => clearInterval(interval);
    }, [
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        isAllLearntModalOpen,
        isEditTermsModalOpen,
        isSrsMode,
        spawnIntervalMs,
        spawnTerm,
    ]);

    React.useEffect(() => {
        if (
            isGameOver ||
            isLoading ||
            isCorrectionModalOpen ||
            isAllLearntModalOpen ||
            isEditTermsModalOpen ||
            fallingTerms.length > 0 ||
            remainingQueue.length > 0 ||
            activeTerms.length === 0 ||
            isBatchTransitioningRef.current
        ) {
            return;
        }

        const isCompletedNonSrsRun =
            !isSrsMode &&
            !isKeepPlayingMode &&
            scopedTerms.length > 0 &&
            scopedTerms.every((term) =>
                isGravityTermLearnt(term, isTestReading),
            );
        if (isCompletedNonSrsRun) {
            return;
        }

        const { batchKeys, backlogKeys } = getNextBatchState(
            activeTerms,
            batchBacklogRef.current,
        );
        if (batchKeys.length === 0) {
            return;
        }

        isBatchTransitioningRef.current = true;
        const nextLevel = level + 1;
        const transitionDelayMs =
            GRAVITY_LEVEL_TRANSITION_BASE_DELAY_MS +
            GRAVITY_LEVEL_TRANSITION_DELAY_PER_LEVEL_MS * nextLevel;
        const timeout = window.setTimeout(() => {
            setLevel(nextLevel);
            setFallSpeed((prev) => prev * GRAVITY_LEVEL_SPEED_MULTIPLIER);
            setSpawnIntervalMs((prev) => prev * GRAVITY_LEVEL_SPAWN_MULTIPLIER);
            setBatchBacklog(backlogKeys);
            spawnTerm(batchKeys, activeTerms);
            isBatchTransitioningRef.current = false;
        }, transitionDelayMs);

        return () => {
            window.clearTimeout(timeout);
            isBatchTransitioningRef.current = false;
        };
    }, [
        activeTerms,
        fallingTerms.length,
        getNextBatchState,
        isAllLearntModalOpen,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        isGameOver,
        isKeepPlayingMode,
        isLoading,
        isSrsMode,
        isTestReading,
        level,
        remainingQueue.length,
        scopedTerms,
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

        const playfieldHeight = playfieldRef.current?.clientHeight ?? PLAYFIELD_HEIGHT_PX;
        const missedTerm = fallingTerms.find((term) => term.y > playfieldHeight);
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
        playfieldRef,
        toast,
        updateTermScore,
    ]);

    React.useEffect(() => {
        if (
            isSrsMode ||
            scopedTerms.length === 0 ||
            isGameOver ||
            isKeepPlayingMode
        ) {
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
    }, [
        hasShownAllLearntModal,
        isGameOver,
        isSrsMode,
        isKeepPlayingMode,
        isTestReading,
        scopedTerms,
    ]);

    React.useEffect(() => {
        if (
            !isSrsMode ||
            scopedTerms.length === 0 ||
            activeTerms.length > 0 ||
            fallingTerms.length > 0 ||
            isGameOver ||
            isAllLearntModalOpen
        ) {
            return;
        }

        setHasShownAllLearntModal(true);
        setIsAllLearntModalOpen(true);
    }, [
        activeTerms.length,
        fallingTerms.length,
        isAllLearntModalOpen,
        isGameOver,
        isSrsMode,
        scopedTerms.length,
    ]);

    React.useEffect(() => {
        if (!isGameOver) {
            return;
        }

        setFallingTerms([]);
    }, [isGameOver]);

    React.useEffect(() => {
        if (!isGameOver && !isAllLearntModalOpen) {
            didFlushCompletionRef.current = false;
            return;
        }

        if (didFlushCompletionRef.current) {
            return;
        }

        didFlushCompletionRef.current = true;
        flushGravityProgress();
    }, [flushGravityProgress, isAllLearntModalOpen, isGameOver]);

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

    const srsCompletedTermsCount = Math.max(
        0,
        scopedTerms.length - activeTerms.length,
    );
    const learntTermsCount = isSrsMode
        ? srsCompletedTermsCount
        : scopedTerms.filter((term) => isGravityTermLearnt(term, isTestReading))
              .length;
    const learningTermsCount = isSrsMode
        ? 0
        : scopedTerms.filter(
              (term) => getGravityTermScore(term, isTestReading) === 1,
          ).length;
    const unlearntTermsCount = isSrsMode
        ? activeTerms.length
        : scopedTerms.filter(
              (term) => getGravityTermScore(term, isTestReading) === 0,
          ).length;

    const resumeAfterAllLearntModal = React.useCallback(() => {
        setIsAllLearntModalOpen(false);
        setIsKeepPlayingMode(true);
        if (isGameOver) {
            return;
        }
        loadVocabTerms().catch((err) => {
            console.error("Error resuming gravity practice:", err);
        });
    }, [
        isGameOver,
        loadVocabTerms,
        setIsKeepPlayingMode,
    ]);

    const isTermAtRisk = Object.values(termWrongCounts).some(
        (count) => count > 0,
    );
    const srsCurrentPromptType = fallingTerms[0]?.term.srsPromptType;
    const oppositeModeHasUnlearntTerms = scopedTerms.some((term) =>
        !isGravityTermLearnt(term, !isTestReading),
    );

    const hasUnlearntTermsInScope = scopedTerms.some(
        (term) => !isGravityTermLearnt(term, isTestReading),
    );
    const isExtinctionModeDisabled =
        scopedTerms.length > 0 && !hasUnlearntTermsInScope;

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
        isEmptyFavoritesModalOpen,
        setIsEmptyFavoritesModalOpen,
        playfieldRef,
        resumeAfterAllLearntModal,
        resetLearningProgress,
        setAnswer,
        setCorrectionInput,
        setShowReadingHint,
        showReadingHint,
        isFavoritesMode,
        isSrsMode,
        setIsFavoritesMode,
        isExtinctionMode,
        setIsExtinctionMode,
        isExtinctionModeDisabled,
        isKeepPlayingMode,
        setIsKeepPlayingMode,
        totalTermsCount: scopedTerms.length,
        level,
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
        srsCurrentPromptType,
    };
}
