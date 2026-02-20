"use client";

import * as React from "react";

import { useToast } from "@/hooks/use-toast";
import { appendGameHistory, getGameHistory } from "@/lib/utils";

import {
    type FallingTerm,
    type VocabTerm,
    getShuffledIndexes,
    getTermKey,
    HORIZONTAL_PADDING_PX,
    isAnswerCorrect,
    PLAYFIELD_HEIGHT_PX,
} from "../_lib/gravity-utils";

export function useGravityGame() {
    // Holds all terms used in the gravity session and their learning metadata.
    const [terms, setTerms] = React.useState<VocabTerm[]>([]);
    // Queue of term indexes used to pick the next falling term.
    const [remainingQueue, setRemainingQueue] = React.useState<number[]>([]);
    // The currently falling term rendered in the playfield.
    const [activeTerm, setActiveTerm] = React.useState<FallingTerm | null>(null);
    // Main answer input value from the bottom input box.
    const [answer, setAnswer] = React.useState("");
    // Total number of correct answers during this run.
    const [score, setScore] = React.useState(0);
    // Tracks wrong-attempt count per term key to enforce per-term fail rules.
    const [termWrongCounts, setTermWrongCounts] = React.useState<Record<string, number>>({});
    // Elapsed game time in seconds.
    const [timer, setTimer] = React.useState(0);
    // Indicates whether terms/loading setup is in progress.
    const [isLoading, setIsLoading] = React.useState(true);
    // Marks game over state after terminal failure.
    const [isGameOver, setIsGameOver] = React.useState(false);
    // Human-readable message shown when game is over.
    const [gameOverMessage, setGameOverMessage] = React.useState("");
    // Toggles romanization visibility in game and correction modal.
    const [showReadingHint, setShowReadingHint] = React.useState(false);
    // Controls visibility of the first-mistake correction modal.
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = React.useState(false);
    // Input value inside the correction modal form.
    const [correctionInput, setCorrectionInput] = React.useState("");
    // Inline validation error text for correction modal input.
    const [correctionError, setCorrectionError] = React.useState("");
    // Controls visibility of the "all terms learnt" completion modal.
    const [isAllLearntModalOpen, setIsAllLearntModalOpen] = React.useState(false);
    // Prevents repeatedly re-opening the completion modal without state change.
    const [hasShownAllLearntModal, setHasShownAllLearntModal] =
        React.useState(false);

    // Ref to the main answer input for auto-focus behavior.
    const inputRef = React.useRef<HTMLInputElement>(null);
    // Ref to the falling-term playfield container.
    const playfieldRef = React.useRef<HTMLDivElement>(null);
    // Ref to the active falling term card for width measurement.
    const activeCardRef = React.useRef<HTMLDivElement>(null);
    // Cached playfield width used to clamp card horizontal position.
    const [playfieldWidth, setPlayfieldWidth] = React.useState(0);

    const { toast } = useToast();

    // Spawns the next falling term and refreshes queue when it is exhausted.
    const spawnTerm = React.useCallback((queue: number[], sourceTerms: VocabTerm[]) => {
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
    }, []);

    // Loads terms from favorites/history/cache/API and resets game state.
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
            if (!cachedJsonString) {
                alert("No favorite terms found.");
                setIsLoading(false);
                return;
            }
        } else if (isReviewHistory) {
            const historyHash = urlParams.get("historyTerms") ?? "";
            cachedJsonString = getGameHistory(historyHash, true);
            if (!cachedJsonString) {
                alert("No history terms found for key: " + historyHash);
                setIsLoading(false);
                return;
            }
        } else {
            cachedJsonString = getGameHistory(activeTextStr, false);
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

            const jsonResponse = (await response.json()) as Record<string, string>;
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
                        typeof item.romanization === "string" &&
                        typeof item.english_definition === "string"
                    );
                })
                .map((item) => ({
                    japanese: item.japanese as string,
                    romanization: item.romanization as string,
                    english_definition: item.english_definition as string,
                    isFavorite: item.isFavorite as boolean | undefined,
                    gravity_score: item.gravity_score as number | undefined,
                    isLearnt: (item.isLearnt as boolean) ?? false,
                }));
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

        setTerms(parsedTerms);
        const queue = getShuffledIndexes(parsedTerms.length);
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
        spawnTerm(queue, parsedTerms);
        setIsLoading(false);
    }, [spawnTerm]);

    // Updates per-term learning score based on correct/wrong outcomes.
    const updateTermScore = React.useCallback(
        (term: VocabTerm, action: "correct" | "wrong", shouldIncrement: boolean) => {
            const targetKey = getTermKey(term);
            setTerms((prevTerms) =>
                prevTerms.map((oneTerm) => {
                    if (getTermKey(oneTerm) !== targetKey) {
                        return oneTerm;
                    }

                    if (action === "wrong") {
                        return {
                            ...oneTerm,
                            gravity_score: 0,
                            isLearnt: false,
                        };
                    }

                    if (!shouldIncrement) {
                        return oneTerm;
                    }

                    const nextScore = (oneTerm.gravity_score ?? 0) + 1;
                    return {
                        ...oneTerm,
                        gravity_score: nextScore,
                        isLearnt: nextScore >= 2,
                    };
                }),
            );
        },
        [],
    );

    // Applies per-term wrong-attempt logic and opens correction flow or game over.
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
                setGameOverMessage(`Game over. "${term.japanese}" was missed twice.`);
                return;
            }

            setIsCorrectionModalOpen(true);
            setCorrectionInput(answer);
            setCorrectionError("");
        },
        [answer, termWrongCounts],
    );

    const activeTermWrongCount = activeTerm
        ? (termWrongCounts[getTermKey(activeTerm.term)] ?? 0)
        : 0;

    // Handles submission from the main input box during active gameplay.
    const handleSubmit = React.useCallback((event: React.FormEvent) => {
        event.preventDefault();

        if (!activeTerm || isGameOver || isLoading || isCorrectionModalOpen) {
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
            spawnTerm(remainingQueue, terms);
            return;
        }

        toast({
            title: "Incorrect",
            description: "Try again.",
            duration: 800,
            variant: "destructive",
        });
        setAnswer("");
        updateTermScore(activeTerm.term, "wrong", false);
    }, [
        activeTerm,
        answer,
        isCorrectionModalOpen,
        isGameOver,
        isLoading,
        remainingQueue,
        showReadingHint,
        spawnTerm,
        terms,
        toast,
        updateTermScore,
    ]);

    // Handles submission inside the correction modal to resume gameplay.
    const handleCorrectionSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!activeTerm) {
            return;
        }

        if (isAnswerCorrect(correctionInput, activeTerm.term.japanese)) {
            updateTermScore(activeTerm.term, "correct", !showReadingHint);
            setIsCorrectionModalOpen(false);
            setCorrectionInput("");
            setCorrectionError("");
            setAnswer("");
            spawnTerm(remainingQueue, terms);
            return;
        }

        setCorrectionError("That is not the correct Japanese term yet.");
    }, [
        activeTerm,
        correctionInput,
        remainingQueue,
        showReadingHint,
        spawnTerm,
        terms,
        updateTermScore,
    ]);

    // Loads terms once on mount (and whenever loader callback identity changes).
    React.useEffect(() => {
        loadVocabTerms().catch((err) => {
            console.error("Error loading gravity game:", err);
            setIsLoading(false);
        });
    }, [loadVocabTerms]);

    // Runs/pauses the timer depending on loading, modal, and game-over states.
    React.useEffect(() => {
        if (
            isLoading ||
            isGameOver ||
            isCorrectionModalOpen ||
            isAllLearntModalOpen
        ) {
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoading, isGameOver, isCorrectionModalOpen, isAllLearntModalOpen]);

    // Advances the active falling term downward at speed based on score.
    React.useEffect(() => {
        if (!activeTerm || isLoading || isGameOver || isCorrectionModalOpen) {
            return;
        }

        const speedPerTick = Math.min(5, 1.3 + score * 0.08);
        const interval = setInterval(() => {
            setActiveTerm((prev) => {
                if (!prev) {
                    return prev;
                }
                return {
                    ...prev,
                    y: prev.y + speedPerTick,
                };
            });
        }, 50);

        return () => clearInterval(interval);
    }, [activeTerm, isGameOver, isLoading, score, isCorrectionModalOpen]);

    // Treats bottom-collision as a wrong attempt and triggers fail flow.
    React.useEffect(() => {
        if (!activeTerm || isGameOver || isLoading || isCorrectionModalOpen) {
            return;
        }

        if (activeTerm.y >= PLAYFIELD_HEIGHT_PX - 56) {
            toast({
                title: "Missed",
                description: "The term reached the bottom.",
                duration: 800,
                variant: "destructive",
            });
            updateTermScore(activeTerm.term, "wrong", false);
            handleWrongAttempt(activeTerm.term);
        }
    }, [
        activeTerm,
        handleWrongAttempt,
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        toast,
        updateTermScore,
    ]);

    // Opens completion modal once when every term reaches learnt threshold.
    React.useEffect(() => {
        if (terms.length === 0 || isGameOver) {
            return;
        }

        const allLearnt = terms.every((term) => (term.gravity_score ?? 0) >= 2);
        if (allLearnt && !hasShownAllLearntModal) {
            setHasShownAllLearntModal(true);
            setIsAllLearntModalOpen(true);
            setActiveTerm(null);
        }
    }, [hasShownAllLearntModal, isGameOver, terms]);

    // Resets completion-modal guard once any term drops below learnt threshold.
    React.useEffect(() => {
        const hasUnlearntTerm = terms.some((term) => (term.gravity_score ?? 0) < 2);
        if (hasUnlearntTerm && hasShownAllLearntModal) {
            setHasShownAllLearntModal(false);
        }
    }, [hasShownAllLearntModal, terms]);

    // Keeps keyboard focus on the answer input as terms change.
    React.useEffect(() => {
        inputRef.current?.focus();
    }, [activeTerm]);

    // Tracks playfield width and updates it on window resize.
    React.useEffect(() => {
        const updatePlayfieldWidth = () => {
            setPlayfieldWidth(playfieldRef.current?.clientWidth ?? 0);
        };

        updatePlayfieldWidth();
        window.addEventListener("resize", updatePlayfieldWidth);
        return () => window.removeEventListener("resize", updatePlayfieldWidth);
    }, []);

    // Randomly positions each newly spawned card within horizontal bounds.
    React.useEffect(() => {
        if (!activeTerm || activeTerm.isPositioned) {
            return;
        }

        const cardWidth = activeCardRef.current?.offsetWidth ?? 0;
        if (!playfieldWidth || !cardWidth) {
            return;
        }

        const maxLeft = Math.max(
            HORIZONTAL_PADDING_PX,
            playfieldWidth - cardWidth - HORIZONTAL_PADDING_PX,
        );
        const randomLeft =
            HORIZONTAL_PADDING_PX +
            Math.random() * Math.max(0, maxLeft - HORIZONTAL_PADDING_PX);

        setActiveTerm((prev) =>
            prev && prev.id === activeTerm.id
                ? { ...prev, x: randomLeft, isPositioned: true }
                : prev,
        );
    }, [activeTerm, playfieldWidth]);

    // Re-clamps active card horizontal position if container/card size changes.
    React.useEffect(() => {
        if (!activeTerm?.isPositioned) {
            return;
        }

        const cardWidth = activeCardRef.current?.offsetWidth ?? 0;
        if (!playfieldWidth || !cardWidth) {
            return;
        }

        const maxLeft = Math.max(
            HORIZONTAL_PADDING_PX,
            playfieldWidth - cardWidth - HORIZONTAL_PADDING_PX,
        );
        const clampedLeft = Math.min(
            Math.max(activeTerm.x, HORIZONTAL_PADDING_PX),
            maxLeft,
        );

        if (clampedLeft !== activeTerm.x) {
            setActiveTerm((prev) =>
                prev && prev.id === activeTerm.id
                    ? { ...prev, x: clampedLeft }
                    : prev,
            );
        }
    }, [activeTerm, playfieldWidth]);

    // Computes how many terms are currently marked as learnt (score >= 2).
    const learntTermsCount = terms.filter(
        (term) => (term.gravity_score ?? 0) >= 2,
    ).length;
    // Computes how many terms are in learning state (score exactly 1).
    const learningTermsCount = terms.filter(
        (term) => (term.gravity_score ?? 0) === 1,
    ).length;
    // Computes how many terms are still unlearnt (score 0 or undefined).
    const unlearntTermsCount = terms.filter(
        (term) => (term.gravity_score ?? 0) === 0,
    ).length;

    // Closes completion modal and resumes spawning terms for continued practice.
    const resumeAfterAllLearntModal = React.useCallback(() => {
        setIsAllLearntModalOpen(false);
        if (!isGameOver && terms.length > 0) {
            spawnTerm(remainingQueue, terms);
        }
    }, [isGameOver, remainingQueue, spawnTerm, terms]);

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
        setAnswer,
        setCorrectionInput,
        setShowReadingHint,
        showReadingHint,
        totalTermsCount: terms.length,
        timer,
        unlearntTermsCount,
    };
}
