"use client";

import * as React from "react";

import { useToast } from "@/hooks/use-toast";

import {
    type FallingTerm,
    HORIZONTAL_PADDING_PX,
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
    // Queue of term indexes used to pick the next falling term.
    const [remainingQueue, setRemainingQueue] = React.useState<number[]>([]);
    // The currently falling term rendered in the playfield.
    const [activeTerm, setActiveTerm] = React.useState<FallingTerm | null>(
        null,
    );
    // Main answer input value from the bottom input box.
    const [answer, setAnswer] = React.useState("");
    // Total number of correct answers during this run.
    const [score, setScore] = React.useState(0);
    // Tracks wrong-attempt count per term key to enforce per-term fail rules.
    const [termWrongCounts, setTermWrongCounts] = React.useState<
        Record<string, number>
    >({});
    // Marks game over state after terminal failure.
    const [isGameOver, setIsGameOver] = React.useState(false);
    // Human-readable message shown when game is over.
    const [gameOverMessage, setGameOverMessage] = React.useState("");
    // Toggles kana visibility in game and correction modal.
    const [showReadingHint, setShowReadingHint] = React.useState(false);
    // Elapsed game time in seconds.
    const [timer, setTimer] = React.useState(0);

    // Input value inside the correction modal form.
    const [correctionInput, setCorrectionInput] = React.useState("");
    // Inline validation error text for correction modal input.
    const [correctionError, setCorrectionError] = React.useState("");
    // Prevents repeatedly re-opening the completion modal without state change.
    const [hasShownAllLearntModal, setHasShownAllLearntModal] =
        React.useState(false);
    // Controls visibility of the first-mistake correction modal.
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] =
        React.useState(false);
    // Controls visibility of the edit terms modal
    const [isEditTermsModalOpen, setIsEditTermsModalOpen] =
        React.useState(false);
    // Controls visibility of the "all terms learnt" completion modal.
    const [isAllLearntModalOpen, setIsAllLearntModalOpen] =
        React.useState(false);

    // Ref to the main answer input for auto-focus behavior.
    const inputRef = React.useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const { isFavoritesMode, setIsFavoritesMode, isFavoritesModeRef } =
        useGravityFavoritesMode();

    // Spawns the next falling term and refreshes queue when it is exhausted.
    const spawnTerm = React.useCallback(
        (queue: number[], sourceTerms: VocabTerm[]) => {
            let workingQueue = queue;
            if (workingQueue.length === 0) {
                workingQueue = getShuffledIndexes(sourceTerms.length);
            }

            const [nextIndex, ...rest] = workingQueue;
            const nextTerm = sourceTerms[nextIndex!];
            if (!nextTerm) {
                setActiveTerm(null);
                setIsGameOver(true);
                setGameOverMessage("Game ended due to invalid term data.");
                return;
            }

            setRemainingQueue(rest);
            setActiveTerm({
                id: Date.now(),
                term: nextTerm,
                y: 0,
                x: HORIZONTAL_PADDING_PX,
                isPositioned: false,
            });
        },
        [],
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

    const { playfieldRef, activeCardRef } = useGravityPlayfield({
        activeTerm,
        setActiveTerm,
        isLoading,
        isGameOver,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        score,
    });

    const {
        activeTermWrongCount,
        handleWrongAttempt,
        handleSubmit,
        handleCorrectionSubmit,
    } = useGravityAnswerHandlers({
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
    });

    const { resetLearningProgress } = useGravityProgressReset({
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
    });

    // Loads terms once on mount (and whenever loader callback identity changes).
    React.useEffect(() => {
        loadVocabTerms().catch((err) => {
            console.error("Error loading gravity game:", err);
            setIsLoading(false);
        });
    }, [loadVocabTerms]);

    // Treats bottom-collision as a wrong attempt and triggers fail flow.
    React.useEffect(() => {
        if (
            !activeTerm ||
            isGameOver ||
            isLoading ||
            isCorrectionModalOpen ||
            isEditTermsModalOpen
        ) {
            return;
        }

        if (activeTerm.y >= PLAYFIELD_HEIGHT_PX) {
            toast({
                title: "Missed",
                description: "The term reached the bottom.",
                duration: 800,
                variant: "destructive",
            });
            // Reaching the floor is treated as a hard miss and resets term mastery.
            updateTermScore(activeTerm.term, "wrong", false);
            handleWrongAttempt(activeTerm.term);
        }
    }, [
        activeTerm,
        handleWrongAttempt,
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        toast,
        updateTermScore,
    ]);

    // Opens completion modal once when every term reaches learnt threshold.
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
            setActiveTerm(null);
        }
    }, [hasShownAllLearntModal, isGameOver, activeTerms]);

    // Resets completion-modal guard once any term drops below learnt threshold.
    React.useEffect(() => {
        const hasUnlearntTerm = activeTerms.some(
            (term) => (term.gravity_score ?? 0) < 2,
        );
        if (hasUnlearntTerm && hasShownAllLearntModal) {
            setHasShownAllLearntModal(false);
        }
    }, [hasShownAllLearntModal, activeTerms]);

    // Keeps keyboard focus on the answer input as terms change.
    React.useEffect(() => {
        inputRef.current?.focus();
    }, [activeTerm]);

    // Computes how many terms are currently marked as learnt (score >= 2).
    const learntTermsCount = activeTerms.filter(
        (term) => (term.gravity_score ?? 0) >= 2,
    ).length;
    // Computes how many terms are in learning state (score exactly 1).
    const learningTermsCount = activeTerms.filter(
        (term) => (term.gravity_score ?? 0) === 1,
    ).length;
    // Computes how many terms are still unlearnt (score 0 or undefined).
    const unlearntTermsCount = activeTerms.filter(
        (term) => (term.gravity_score ?? 0) === 0,
    ).length;

    // Closes completion modal and resumes spawning terms for continued practice.
    const resumeAfterAllLearntModal = React.useCallback(() => {
        setIsAllLearntModalOpen(false);
        if (!isGameOver && activeTerms.length > 0) {
            spawnTerm(remainingQueue, activeTerms);
        }
    }, [isGameOver, remainingQueue, spawnTerm, activeTerms]);


    return {
        activeTerm,
        activeTermWrongCount,
        answer,
        correctionError,
        correctionInput,
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
        activeCardRef,
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
    };
}
