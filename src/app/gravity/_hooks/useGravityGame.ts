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
    const [terms, setTerms] = React.useState<VocabTerm[]>([]);
    const [remainingQueue, setRemainingQueue] = React.useState<number[]>([]);
    const [activeTerm, setActiveTerm] = React.useState<FallingTerm | null>(null);
    const [answer, setAnswer] = React.useState("");
    const [score, setScore] = React.useState(0);
    const [termWrongCounts, setTermWrongCounts] = React.useState<Record<string, number>>({});
    const [timer, setTimer] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [gameOverMessage, setGameOverMessage] = React.useState("");
    const [showReadingHint, setShowReadingHint] = React.useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = React.useState(false);
    const [correctionInput, setCorrectionInput] = React.useState("");
    const [correctionError, setCorrectionError] = React.useState("");

    const inputRef = React.useRef<HTMLInputElement>(null);
    const playfieldRef = React.useRef<HTMLDivElement>(null);
    const activeCardRef = React.useRef<HTMLDivElement>(null);
    const [playfieldWidth, setPlayfieldWidth] = React.useState(0);

    const { toast } = useToast();

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
        spawnTerm(queue, parsedTerms);
        setIsLoading(false);
    }, [spawnTerm]);

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
            setCorrectionInput("");
            setCorrectionError("");
        },
        [termWrongCounts],
    );

    const activeTermWrongCount = activeTerm
        ? (termWrongCounts[getTermKey(activeTerm.term)] ?? 0)
        : 0;

    const handleSubmit = React.useCallback((event: React.FormEvent) => {
        event.preventDefault();

        if (!activeTerm || isGameOver || isLoading || isCorrectionModalOpen) {
            return;
        }

        if (isAnswerCorrect(answer, activeTerm.term.japanese)) {
            setScore((prev) => prev + 1);
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
            description: "First miss: enter the correct Japanese term to continue.",
            duration: 800,
            variant: "destructive",
        });
        handleWrongAttempt(activeTerm.term);
    }, [
        activeTerm,
        answer,
        handleWrongAttempt,
        isCorrectionModalOpen,
        isGameOver,
        isLoading,
        remainingQueue,
        spawnTerm,
        terms,
        toast,
    ]);

    const handleCorrectionSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!activeTerm) {
            return;
        }

        if (isAnswerCorrect(correctionInput, activeTerm.term.japanese)) {
            setIsCorrectionModalOpen(false);
            setCorrectionInput("");
            setCorrectionError("");
            setAnswer("");
            spawnTerm(remainingQueue, terms);
            return;
        }

        setCorrectionError("That is not the correct Japanese term yet.");
    }, [activeTerm, correctionInput, remainingQueue, spawnTerm, terms]);

    React.useEffect(() => {
        loadVocabTerms().catch((err) => {
            console.error("Error loading gravity game:", err);
            setIsLoading(false);
        });
    }, [loadVocabTerms]);

    React.useEffect(() => {
        if (isLoading || isGameOver || isCorrectionModalOpen) {
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoading, isGameOver, isCorrectionModalOpen]);

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
            handleWrongAttempt(activeTerm.term);
        }
    }, [
        activeTerm,
        handleWrongAttempt,
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        toast,
    ]);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, [activeTerm]);

    React.useEffect(() => {
        const updatePlayfieldWidth = () => {
            setPlayfieldWidth(playfieldRef.current?.clientWidth ?? 0);
        };

        updatePlayfieldWidth();
        window.addEventListener("resize", updatePlayfieldWidth);
        return () => window.removeEventListener("resize", updatePlayfieldWidth);
    }, []);

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
        isCorrectionModalOpen,
        isGameOver,
        isLoading,
        loadVocabTerms,
        playfieldRef,
        activeCardRef,
        remainingQueue,
        score,
        setAnswer,
        setCorrectionInput,
        setShowReadingHint,
        showReadingHint,
        timer,
    };
}
