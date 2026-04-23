"use client";

import * as React from "react";

import { useToast } from "@/hooks/use-toast";

import {
    type FallingTerm,
    HORIZONTAL_PADDING_PX,
    MAX_SIMULTANEOUS_TERMS,
    WORD_SPAWN_INTERVAL_MS,
    getShuffledIndexes,
    PLAYFIELD_HEIGHT_PX,
} from "../_lib/gravity-utils";
import type { VocabTerm } from "@/lib/types/vocab";
import { useGravityAnswerHandlers } from "./useGravityAnswerHandlers";
import { useGravityFavoritesMode } from "./useGravityFavoritesMode";
import { useGravityPlayfield } from "./useGravityPlayfield";
import { useGravityProgressReset } from "./useGravityProgressReset";
import { useGravityTermsLoader } from "./useGravityTermsLoader";
import { useGravityTermScore } from "./useGravityTermScore";
import { useGravityTimer } from "./useGravityTimer";

export function useGravityGame() {
    const [remainingQueue, setRemainingQueue] = React.useState<number[]>([]);
    const [fallingTerms, setFallingTerms] = React.useState<FallingTerm[]>([]);
    const [answer, setAnswer] = React.useState("");
    const [score, setScore] = React.useState(0);
    const [termWrongCounts, setTermWrongCounts] = React.useState<
        Record<string, number>
    >({});
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [gameOverMessage, setGameOverMessage] = React.useState("");
    const [showReadingHint, setShowReadingHint] = React.useState(false);
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

    const inputRef = React.useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const {
        isFavoritesMode,
        setIsFavoritesMode,
        isFavoritesModeRef,
        isFavoritesModeReady,
    } = useGravityFavoritesMode();

    const spawnTerm = React.useCallback(
        (queue: number[], sourceTerms: VocabTerm[]) => {
            let workingQueue = queue;
            if (workingQueue.length === 0) {
                workingQueue = getShuffledIndexes(sourceTerms.length);
            }

            const [nextIndex, ...rest] = workingQueue;
            const nextTerm = sourceTerms[nextIndex!];
            if (!nextTerm) {
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
        activeTerms,
        setActiveTerms,
        isLoading,
        setIsLoading,
        loadVocabTerms,
    } = useGravityTermsLoader({
        isFavoritesModeRef,
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
        setActiveTerms,
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
        activeTerms,
        setActiveTerms,
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
        if (!isFavoritesModeReady) {
            return;
        }

        loadVocabTerms().catch((err) => {
            console.error("Error loading gravity game:", err);
            setIsLoading(false);
        });
    }, [isFavoritesModeReady, loadVocabTerms]);

    const fallingTermsRef = React.useRef<FallingTerm[]>(fallingTerms);
    React.useEffect(() => {
        fallingTermsRef.current = fallingTerms;
    }, [fallingTerms]);

    const remainingQueueRef = React.useRef<number[]>(remainingQueue);
    React.useEffect(() => {
        remainingQueueRef.current = remainingQueue;
    }, [remainingQueue]);

    const activeTermsRef = React.useRef<VocabTerm[]>(activeTerms);
    React.useEffect(() => {
        activeTermsRef.current = activeTerms;
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
        if (activeTerms.length === 0 || isGameOver) {
            return;
        }

        const allLearnt = activeTerms.every(
            (term) => (term.gravity_score ?? 0) >= 2,
        );
        if (allLearnt && !hasShownAllLearntModal) {
            setHasShownAllLearntModal(true);
            setIsAllLearntModalOpen(true);
            setFallingTerms([]);
        }
    }, [hasShownAllLearntModal, isGameOver, activeTerms]);

    React.useEffect(() => {
        if (!isGameOver) {
            return;
        }

        setFallingTerms([]);
    }, [isGameOver]);

    React.useEffect(() => {
        const hasUnlearntTerm = activeTerms.some(
            (term) => (term.gravity_score ?? 0) < 2,
        );
        if (hasUnlearntTerm && hasShownAllLearntModal) {
            setHasShownAllLearntModal(false);
        }
    }, [hasShownAllLearntModal, activeTerms]);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, [fallingTerms.length]);

    const learntTermsCount = activeTerms.filter(
        (term) => (term.gravity_score ?? 0) >= 2,
    ).length;
    const learningTermsCount = activeTerms.filter(
        (term) => (term.gravity_score ?? 0) === 1,
    ).length;
    const unlearntTermsCount = activeTerms.filter(
        (term) => (term.gravity_score ?? 0) === 0,
    ).length;

    const resumeAfterAllLearntModal = React.useCallback(() => {
        setIsAllLearntModalOpen(false);
        if (!isGameOver && activeTerms.length > 0) {
            spawnTerm(remainingQueue, activeTerms);
        }
    }, [isGameOver, remainingQueue, spawnTerm, activeTerms]);

    const isTermAtRisk = Object.values(termWrongCounts).some(
        (count) => count > 0,
    );

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
        totalTermsCount: activeTerms.length,
        timer,
        unlearntTermsCount,
        terms: allTerms,
        setTerms: setAllTerms,
        isEditTermsModalOpen,
        setIsEditTermsModalOpen,
        fallingTerms,
        termWrongCounts,
        isTermAtRisk,
    };
}
