"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";
import SectionHeader from "@/components/common/SectionHeader";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { appendGameHistory, getGameHistory } from "@/lib/utils";

import { Loader } from "../match/_components/Loader";

type VocabTerm = {
    japanese: string;
    romanization: string;
    english_definition: string;
    isFavorite?: boolean;
};

type FallingTerm = {
    id: number;
    term: VocabTerm;
    y: number;
    x: number;
    isPositioned: boolean;
};

const PLAYFIELD_HEIGHT_PX = 480;
const HORIZONTAL_PADDING_PX = 8;

function normalizeAnswer(value: string): string {
    return value
        .trim()
        .replace(/[\u3000\s]+/g, "")
        .replace(/[。、！？.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .replace(/\s+/g, " ");
}

function isAnswerCorrect(answer: string, japaneseTerm: string): boolean {
    const normalizedAnswer = normalizeAnswer(answer);
    const normalizedTerm = normalizeAnswer(japaneseTerm);
    return normalizedAnswer.length > 0 && normalizedAnswer === normalizedTerm;
}

function getShuffledIndexes(length: number): number[] {
    const indexes = Array.from({ length }, (_, i) => i);
    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = indexes[i];
        indexes[i] = indexes[j]!;
        indexes[j] = temp!;
    }
    return indexes;
}

function getTermKey(term: VocabTerm): string {
    return `${term.japanese}||${term.english_definition}`;
}

export default function GravityPage() {
    const [terms, setTerms] = React.useState<VocabTerm[]>([]);
    const [remainingQueue, setRemainingQueue] = React.useState<number[]>([]);
    const [activeTerm, setActiveTerm] = React.useState<FallingTerm | null>(
        null,
    );
    const [answer, setAnswer] = React.useState("");
    const [score, setScore] = React.useState(0);
    const [termWrongCounts, setTermWrongCounts] = React.useState<
        Record<string, number>
    >({});
    const [timer, setTimer] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [gameOverMessage, setGameOverMessage] = React.useState("");
    const [showReadingHint, setShowReadingHint] = React.useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] =
        React.useState(false);
    const [correctionInput, setCorrectionInput] = React.useState("");
    const [correctionError, setCorrectionError] = React.useState("");

    const { toast } = useToast();
    const router = useRouter();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const playfieldRef = React.useRef<HTMLDivElement>(null);
    const activeCardRef = React.useRef<HTMLDivElement>(null);
    const [playfieldWidth, setPlayfieldWidth] = React.useState(0);

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

            const jsonResponse = (await response.json()) as Record<
                string,
                string
            >;
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
                setGameOverMessage(
                    `Game over. "${term.japanese}" was missed twice.`,
                );
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

    const handleSubmit = (event: React.FormEvent) => {
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
            description:
                "First miss: enter the correct Japanese term to continue.",
            duration: 800,
            variant: "destructive",
        });
        handleWrongAttempt(activeTerm.term);
    };

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

    return (
        <div>
            <SectionHeader title="Gravity Typing Game" />

            <div className="flex items-center justify-between border border-x-0 border-gray-700 bg-gray-900 px-4 py-3">
                <div className="flex gap-2">
                    <CommonButton
                        label="↩ Back to Ereader"
                        additionalclasses="mx-0 bg-indigo-600"
                        onClick={() => router.back()}
                    />
                    <CommonButton
                        label="⟳ Restart"
                        additionalclasses="mx-0 bg-indigo-600"
                        onClick={() => {
                            loadVocabTerms().catch((err) => {
                                console.error(
                                    "Error restarting gravity game:",
                                    err,
                                );
                            });
                        }}
                    />
                </div>
                <div className="text-sm text-gray-200">
                    {activeTermWrongCount > 0 ? (
                        <span className="font-semibold text-red-400">
                            Warning: this term ends the game if missed again.
                        </span>
                    ) : (
                        <span className="text-gray-300">
                            Game ends if you miss the same term twice.
                        </span>
                    )}
                </div>
            </div>
            <div className="border border-x-0 border-gray-700 bg-gray-900 px-4 py-2">
                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-200">
                    <input
                        type="checkbox"
                        checked={showReadingHint}
                        onChange={() => setShowReadingHint((prev) => !prev)}
                    />
                    Show reading hint (romanization)
                </label>
            </div>

            <div className="border border-x-0 border-gray-600 bg-gray-700/50">
                <div className="mx-auto grid max-w-[90%] grid-cols-3 gap-4 text-center">
                    <div className="py-2">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Score
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-400">
                            {score}
                        </div>
                    </div>
                    <div className="py-2">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Remaining
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-400">
                            {activeTerm
                                ? remainingQueue.length + 1
                                : remainingQueue.length}
                        </div>
                    </div>
                    <div className="py-2">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Time
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-400">
                            {timer}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="mx-auto mt-6 max-w-3xl px-4">
                    <div
                        ref={playfieldRef}
                        className="relative overflow-hidden rounded-xl border border-blue-300/20 bg-slate-900"
                        style={{ height: `${PLAYFIELD_HEIGHT_PX}px` }}
                    >
                        <div className="absolute bottom-0 h-1 w-full bg-red-500/60" />
                        {activeTerm ? (
                            <div
                                ref={activeCardRef}
                                className={`absolute max-w-[calc(100%-16px)] rounded-lg border px-3 py-2 shadow-lg ${
                                    activeTermWrongCount > 0
                                        ? "border-red-300/20 bg-red-500/20 text-red-100"
                                        : "border-amber-300/20 bg-amber-500/20 text-amber-100"
                                }`}
                                style={{
                                    top: `${activeTerm.y}px`,
                                    left: `${activeTerm.x}px`,
                                }}
                            >
                                <p className="whitespace-normal break-words font-bold">
                                    {activeTerm.term.english_definition}
                                </p>
                                {showReadingHint && (
                                    <p className="text-xs text-amber-200/80">
                                        Hint: {activeTerm.term.romanization}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                {isGameOver
                                    ? gameOverMessage
                                    : "Preparing next term..."}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-white outline-none focus:border-indigo-500"
                            placeholder="Type the Japanese term"
                            value={answer}
                            disabled={
                                isGameOver ||
                                isLoading ||
                                !activeTerm ||
                                isCorrectionModalOpen
                            }
                            onChange={(event) => setAnswer(event.target.value)}
                        />
                        <CommonButton
                            type="submit"
                            label="Submit"
                            additionalclasses="mx-0 bg-indigo-600"
                            disabled={
                                isGameOver ||
                                isLoading ||
                                !activeTerm ||
                                isCorrectionModalOpen
                            }
                        />
                    </form>

                    {isGameOver && (
                        <div className="mt-3 rounded-md border border-indigo-500/40 bg-indigo-500/10 p-3 text-sm text-indigo-100">
                            {gameOverMessage}
                        </div>
                    )}
                </div>
            )}
            {isCorrectionModalOpen && activeTerm && !isGameOver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-md rounded-xl border border-red-300/30 bg-slate-900 p-5 text-white shadow-2xl">
                        <h3 className="text-xl font-bold text-red-300">
                            First mistake
                        </h3>
                        <p className="mt-2 text-sm text-gray-300">
                            Type the correct Japanese term to resume.
                        </p>
                        <p className="mt-3 rounded-md bg-slate-800 p-2 text-sm text-amber-100">
                            Clue: {activeTerm.term.english_definition}
                        </p>
                        <p className="mt-2 rounded-md border border-red-300/30 bg-red-500/10 p-2 text-sm">
                            Correct term:{" "}
                            <span className="font-bold text-red-200">
                                {activeTerm.term.japanese}
                            </span>
                        </p>
                        {showReadingHint && (
                            <p className="mt-2 text-xs text-amber-200/80">
                                Hint: {activeTerm.term.romanization}
                            </p>
                        )}
                        <form
                            className="mt-4 flex flex-col gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                if (
                                    isAnswerCorrect(
                                        correctionInput,
                                        activeTerm.term.japanese,
                                    )
                                ) {
                                    setIsCorrectionModalOpen(false);
                                    setCorrectionInput("");
                                    setCorrectionError("");
                                    setAnswer("");
                                    spawnTerm(remainingQueue, terms);
                                    return;
                                }
                                setCorrectionError(
                                    "That is not the correct Japanese term yet.",
                                );
                            }}
                        >
                            <input
                                autoFocus
                                type="text"
                                className="w-full rounded-md border border-red-400/40 bg-black px-3 py-2 text-white outline-none focus:border-red-400"
                                placeholder="Enter the exact Japanese term"
                                value={correctionInput}
                                onChange={(event) =>
                                    setCorrectionInput(event.target.value)
                                }
                            />
                            {correctionError && (
                                <p className="text-sm text-red-300">
                                    {correctionError}
                                </p>
                            )}
                            <CommonButton
                                type="submit"
                                label="Resume Game"
                                additionalclasses="mx-0 bg-red-600 hover:bg-red-500"
                            />
                        </form>
                    </div>
                </div>
            )}
            <Toaster />
        </div>
    );
}
