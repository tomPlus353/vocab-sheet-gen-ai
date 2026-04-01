"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Heart, RotateCcw, Trophy } from "lucide-react";

import CommonButton from "@/components/common/CommonButton";
import SectionHeader from "@/components/common/SectionHeader";
import { Loader } from "@/components/common/Loader";
import {
    appendNamedHistory,
    getGameHistory,
    getNamedHistory,
    isKanjiGameTerm,
    isVocabTerm,
} from "@/lib/utils";
import type { KanjiGameTerm, KanjiMasteryStage } from "@/lib/types/vocab";

import {
    getKanjiMultiplier,
    getMasteryStageFromCorrectCount,
    isKanjiAnswerCorrect,
    KANJI_BASE_POINTS,
    KANJI_STARTING_HEARTS,
} from "./_lib/kanji-utils";
import { KanjiStudyConfirmModal } from "./_components/KanjiStudyConfirmModal";

const LAST_PAGINATOR_PAGE_KEY = "lastPaginatorPage";
const KANJI_HISTORY_STORAGE_KEY = "kanjiHistoryTermsV2";

type KanjiMode = "game" | "practice";

type FeedbackState = {
    isCorrect: boolean;
    message: string;
    pointsAwarded: number;
    masteryStage: KanjiMasteryStage;
    requiresRewrite: boolean;
    advanceAfterRewrite?: boolean;
    supportWord: KanjiGameTerm["support_words"][number];
};

type LoadStateDetails = {
    title: string;
    message: string;
    action: string;
};

function getModeLabel(mode: KanjiMode): string {
    return mode === "game" ? "Challenge Run" : "Practice Run";
}

function getStudyStatusLabel(stage: KanjiMasteryStage): string {
    if (stage === "new") {
        return "not started";
    }

    if (stage === "learning") {
        return "in progress";
    }

    return "learned";
}

function getLoadStateDetails(message: string): LoadStateDetails {
    if (message.includes("No active text found")) {
        return {
            title: "No source text loaded",
            message,
            action: "Return to the ereader, load a passage, and start kanji study again.",
        };
    }

    if (message.includes("No kanji prompts available")) {
        return {
            title: "No kanji found for this set",
            message,
            action: "Try a different passage or review set that contains kanji words.",
        };
    }

    if (message.includes("LLM could not generate")) {
        return {
            title: "Kanji prompts could not be generated",
            message,
            action: "Restart this set to try again with the same source text.",
        };
    }

    return {
        title: "Kanji study could not be loaded",
        message,
        action: "Restart this set or go back and choose a different source.",
    };
}

function getTermKey(term: KanjiGameTerm): string {
    return term.japanese;
}

function getRandomNextTerm(
    terms: KanjiGameTerm[],
    currentKey: string | null,
): KanjiGameTerm | null {
    if (terms.length === 0) {
        return null;
    }

    const candidateTerms =
        terms.length > 1
            ? terms.filter((term) => getTermKey(term) !== currentKey)
            : terms;
    const pickFrom = candidateTerms.length > 0 ? candidateTerms : terms;
    const nextIndex = Math.floor(Math.random() * pickFrom.length);
    return pickFrom[nextIndex] ?? null;
}

async function fetchKanjiTermsFromText(text: string): Promise<KanjiGameTerm[]> {
    const response = await fetch("/api/llm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "force-cache",
        body: JSON.stringify({
            text,
            mode: "kanjiGame",
        }),
    });

    const payload = (await response.json()) as {
        jsonMarkdownString?: string;
    };

    if (response.status !== 200 || !payload.jsonMarkdownString) {
        throw new Error("LLM could not generate kanji prompts.");
    }

    const parsedTerms = JSON.parse(payload.jsonMarkdownString) as unknown[];
    return parsedTerms.filter(isKanjiGameTerm);
}

export default function KanjiPage() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const rewriteInputRef = useRef<HTMLInputElement>(null);
    const nextTermButtonRef = useRef<HTMLButtonElement>(null);
    const [mode, setMode] = useState<KanjiMode>("game");
    const [isLoading, setIsLoading] = useState(true);
    const [allTerms, setAllTerms] = useState<KanjiGameTerm[]>([]);
    const [activeTerms, setActiveTerms] = useState<KanjiGameTerm[]>([]);
    const [currentTerm, setCurrentTerm] = useState<KanjiGameTerm | null>(null);
    const [answer, setAnswer] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [hearts, setHearts] = useState(KANJI_STARTING_HEARTS);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [hasWon, setHasWon] = useState(false);
    const [pendingGameOver, setPendingGameOver] = useState(false);
    const [returnTargetLabel, setReturnTargetLabel] = useState<
        "Ereader" | "Home"
    >("Ereader");
    const [errorMessage, setErrorMessage] = useState("");
    const [rewriteAnswer, setRewriteAnswer] = useState("");
    const [rewriteError, setRewriteError] = useState("");
    const [loadedTerms, setLoadedTerms] = useState<KanjiGameTerm[]>([]);
    const [isStudyConfirmOpen, setIsStudyConfirmOpen] = useState(false);
    const [termCorrectCounts, setTermCorrectCounts] = useState<
        Record<string, number>
    >({});
    const [termQuestionIndexes, setTermQuestionIndexes] = useState<
        Record<string, number>
    >({});

    const initializeRun = (terms: KanjiGameTerm[], nextMode: KanjiMode) => {
        const initialCounts = Object.fromEntries(
            terms.map((term) => [getTermKey(term), 0]),
        ) as Record<string, number>;
        const initialIndexes = Object.fromEntries(
            terms.map((term) => [getTermKey(term), 0]),
        ) as Record<string, number>;

        setMode(nextMode);
        setAllTerms(terms);
        setActiveTerms(terms);
        setTermCorrectCounts(initialCounts);
        setTermQuestionIndexes(initialIndexes);
        setCurrentTerm(getRandomNextTerm(terms, null));
        setAnswer("");
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setMultiplier(1);
        setHearts(KANJI_STARTING_HEARTS);
        setFeedback(null);
        setIsGameOver(false);
        setHasWon(false);
        setPendingGameOver(false);
        setIsStudyConfirmOpen(false);
        setErrorMessage("");
        setRewriteAnswer("");
        setRewriteError("");
    };

    const loadKanjiTerms = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const isReviewFavorites = urlParams.get("favorites") === "1";
            const isReviewHistory = urlParams.get("history") === "1";

            let nextTerms: KanjiGameTerm[] = [];

            if (isReviewFavorites || isReviewHistory) {
                const rawTerms = isReviewFavorites
                    ? localStorage.getItem("favoriteTerms")
                    : getGameHistory(urlParams.get("historyTerms") ?? "", true);

                const parsedTerms = JSON.parse(rawTerms ?? "[]") as unknown[];
                const vocabTerms = parsedTerms.filter(isVocabTerm);
                const kanjiSourceText = vocabTerms
                    .map((term) => term.japanese)
                    .join("\n");

                if (!kanjiSourceText) {
                    throw new Error("No kanji prompts available for this set.");
                }

                const cacheKey = isReviewHistory
                    ? urlParams.get("historyTerms") ?? ""
                    : kanjiSourceText;
                const isCacheKeyHashed = isReviewHistory;
                const cachedTerms = getNamedHistory(
                    KANJI_HISTORY_STORAGE_KEY,
                    cacheKey,
                    isCacheKeyHashed,
                );

                if (cachedTerms) {
                    const parsedCachedTerms = JSON.parse(cachedTerms) as unknown[];
                    nextTerms = parsedCachedTerms.filter(isKanjiGameTerm);
                } else {
                    nextTerms = await fetchKanjiTermsFromText(kanjiSourceText);
                    appendNamedHistory(
                        KANJI_HISTORY_STORAGE_KEY,
                        cacheKey,
                        JSON.stringify(nextTerms),
                        isCacheKeyHashed,
                    );
                }
            } else {
                const activeTextStr = localStorage.getItem("activeText");
                if (!activeTextStr) {
                    throw new Error(
                        "No active text found. Please use the ereader first.",
                    );
                }

                const cachedTerms = getNamedHistory(
                    KANJI_HISTORY_STORAGE_KEY,
                    activeTextStr,
                    false,
                );

                let reply = cachedTerms ?? "";
                if (!reply) {
                    try {
                        const fetchedTerms =
                            await fetchKanjiTermsFromText(activeTextStr);
                        reply = JSON.stringify(fetchedTerms);
                        appendNamedHistory(
                            KANJI_HISTORY_STORAGE_KEY,
                            activeTextStr,
                            reply,
                            false,
                        );
                    } catch (kanjiFetchError) {
                        console.error("Error loading kanji prompts:", kanjiFetchError);
                        throw kanjiFetchError;
                    }
                }

                if (reply) {
                    const parsedTerms = JSON.parse(reply) as unknown[];
                    nextTerms = parsedTerms.filter(isKanjiGameTerm);
                }
            }

            if (nextTerms.length === 0) {
                throw new Error("No kanji prompts available for this set.");
            }

            setLoadedTerms(nextTerms);
            setAllTerms([]);
            setActiveTerms([]);
            setCurrentTerm(null);
            setIsStudyConfirmOpen(true);
        } catch (error) {
            console.error("Error loading kanji game:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Could not load the kanji game.";
            setErrorMessage(message);
            setLoadedTerms([]);
            setIsStudyConfirmOpen(false);
            setAllTerms([]);
            setActiveTerms([]);
            setCurrentTerm(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadKanjiTerms();
    }, []);

    useEffect(() => {
        if (isLoading || isGameOver || feedback || !currentTerm) {
            return;
        }

        inputRef.current?.focus();
    }, [currentTerm, feedback, isGameOver, isLoading]);

    useEffect(() => {
        if (!feedback || feedback.requiresRewrite || isGameOver) {
            return;
        }

        nextTermButtonRef.current?.focus();
    }, [feedback, isGameOver]);

    useEffect(() => {
        if (!feedback?.requiresRewrite || isGameOver) {
            return;
        }

        rewriteInputRef.current?.focus();
    }, [feedback, isGameOver]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isReviewFavorites = urlParams.get("favorites") === "1";
        const isReviewHistory = urlParams.get("history") === "1";
        if (isReviewFavorites || isReviewHistory) {
            setReturnTargetLabel("Home");
            return;
        }

        setReturnTargetLabel("Ereader");
    }, []);

    const goBack = () => {
        const page = localStorage.getItem(LAST_PAGINATOR_PAGE_KEY) ?? "1";
        if (page === "0") {
            router.push("/", undefined);
            return;
        }

        router.push(`/paginator?page=${page}`, undefined);
    };

    const handleNextRound = () => {
        const nextTerm = getRandomNextTerm(
            activeTerms,
            currentTerm ? getTermKey(currentTerm) : null,
        );
        setCurrentTerm(nextTerm);
        setFeedback(null);
        setAnswer("");
        setRewriteAnswer("");
        setRewriteError("");
    };

    const handleModeChange = (nextMode: KanjiMode) => {
        if (mode === nextMode) {
            return;
        }

        if (allTerms.length === 0) {
            setMode(nextMode);
            return;
        }

        initializeRun(allTerms, nextMode);
    };

    const handleStartLoadedStudy = (nextMode: KanjiMode) => {
        if (loadedTerms.length === 0) {
            return;
        }

        initializeRun(loadedTerms, nextMode);
    };

    const hasActiveSession =
        !isLoading &&
        !isStudyConfirmOpen &&
        allTerms.length > 0 &&
        !isGameOver &&
        (score > 0 ||
            streak > 0 ||
            activeTerms.length !== allTerms.length ||
            feedback !== null);

    const handleRestartRun = () => {
        if (
            hasActiveSession &&
            !window.confirm(
                "Restart this kanji set from the beginning? Your current run progress will be cleared.",
            )
        ) {
            return;
        }

        void loadKanjiTerms();
    };

    const handleEndSession = () => {
        if (
            !window.confirm(
                "End this study session now? Your current run will stop, and you can review your current score and progress.",
            )
        ) {
            return;
        }

        setFeedback(null);
        setPendingGameOver(false);
        setIsGameOver(true);
        setHasWon(false);
    };

    const completeRewriteStep = () => {
        if (!feedback || !currentTerm) {
            return;
        }

        setRewriteAnswer("");
        setRewriteError("");
        let availableTerms = activeTerms;

        if (pendingGameOver) {
            setPendingGameOver(false);
            setFeedback(null);
            setIsGameOver(true);
            if (mode === "game") {
                setHasWon(false);
            }
            return;
        }

        if (mode === "practice" && feedback.advanceAfterRewrite) {
            const termKey = getTermKey(currentTerm);
            const currentCount = termCorrectCounts[termKey] ?? 0;
            const currentIndex = termQuestionIndexes[termKey] ?? 0;
            const nextCount = Math.min(
                currentCount + 1,
                currentTerm.support_words.length,
            );
            const nextIndexes = {
                ...termQuestionIndexes,
                [termKey]: Math.min(
                    currentIndex + 1,
                    currentTerm.support_words.length - 1,
                ),
            };
            const nextCounts = {
                ...termCorrectCounts,
                [termKey]: nextCount,
            };
            const nextActiveTerms =
                nextCount >= currentTerm.support_words.length
                    ? activeTerms.filter((term) => getTermKey(term) !== termKey)
                    : activeTerms;

            setTermCorrectCounts(nextCounts);
            setTermQuestionIndexes(nextIndexes);
            setActiveTerms(nextActiveTerms);
            availableTerms = nextActiveTerms;

            if (nextActiveTerms.length === 0) {
                setFeedback(null);
                setIsGameOver(true);
                setHasWon(true);
                return;
            }
        }

        const nextTerm = getRandomNextTerm(
            availableTerms,
            getTermKey(currentTerm),
        );
        setFeedback(null);
        setCurrentTerm(nextTerm);
        setAnswer("");
    };

    const handleRewriteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!currentTerm || !feedback?.requiresRewrite) {
            return;
        }

        const feedbackWord = feedback.supportWord;

        if (!isKanjiAnswerCorrect(rewriteAnswer, feedbackWord.word)) {
            setRewriteError("Write the exact kanji once to continue.");
            return;
        }

        completeRewriteStep();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!currentTerm || isGameOver || feedback) {
            return;
        }

        const termKey = getTermKey(currentTerm);
        const currentCorrectCount = termCorrectCounts[termKey] ?? 0;
        const currentQuestionIndex = termQuestionIndexes[termKey] ?? 0;
        const currentSupportWord =
            currentTerm.support_words[
                Math.min(currentQuestionIndex, currentTerm.support_words.length - 1)
            ];
        const remainingTerms = activeTerms.filter(
            (term) => getTermKey(term) !== termKey,
        );

        if (!currentSupportWord) {
            return;
        }

        const isCorrect = isKanjiAnswerCorrect(answer, currentSupportWord.word);

        if (isCorrect) {
            if (mode === "practice") {
                const nextCorrectCount = Math.min(
                    currentCorrectCount + 1,
                    currentTerm.support_words.length,
                );
                const nextStage = getMasteryStageFromCorrectCount(
                    nextCorrectCount,
                    currentTerm.support_words.length,
                );
                const nextCounts = {
                    ...termCorrectCounts,
                    [termKey]: nextCorrectCount,
                };
                const nextIndexes = {
                    ...termQuestionIndexes,
                    [termKey]: Math.min(
                        currentQuestionIndex + 1,
                        currentTerm.support_words.length - 1,
                    ),
                };
                const nextActiveTerms =
                    nextCorrectCount >= currentTerm.support_words.length
                        ? remainingTerms
                        : activeTerms;

                setTermCorrectCounts(nextCounts);
                setTermQuestionIndexes(nextIndexes);
                setActiveTerms(nextActiveTerms);
                setFeedback({
                    isCorrect: true,
                    message:
                        nextStage === "mastered"
                            ? `Correct. ${currentTerm.japanese} is done for practice mode.`
                            : `Correct. ${currentTerm.japanese} moves to the next word.`,
                    pointsAwarded: 0,
                    masteryStage: nextStage,
                    requiresRewrite: false,
                    advanceAfterRewrite: false,
                    supportWord: currentSupportWord,
                });

                if (nextActiveTerms.length === 0) {
                    setHasWon(true);
                    setIsGameOver(true);
                }
                return;
            }

            const nextStreak = streak + 1;
            const nextMultiplier = getKanjiMultiplier(nextStreak);
            const pointsAwarded = KANJI_BASE_POINTS * nextMultiplier;
            const nextCorrectCount = Math.min(
                currentCorrectCount + 1,
                currentTerm.support_words.length,
            );
            const nextStage = getMasteryStageFromCorrectCount(
                nextCorrectCount,
                currentTerm.support_words.length,
            );
            const nextCounts = {
                ...termCorrectCounts,
                [termKey]: nextCorrectCount,
            };
            const nextIndexes = {
                ...termQuestionIndexes,
                [termKey]: Math.min(
                    currentQuestionIndex + 1,
                    currentTerm.support_words.length - 1,
                ),
            };
            const nextActiveTerms =
                nextStage === "mastered"
                    ? activeTerms.filter((term) => getTermKey(term) !== termKey)
                    : activeTerms;

            setTermCorrectCounts(nextCounts);
            setTermQuestionIndexes(nextIndexes);
            setScore((prev) => prev + pointsAwarded);
            setStreak(nextStreak);
            setBestStreak((prev) => Math.max(prev, nextStreak));
            setMultiplier(nextMultiplier);
            setActiveTerms(nextActiveTerms);
            setFeedback({
                isCorrect: true,
                message:
                    nextStage === "mastered"
                        ? `Mastered. ${currentTerm.japanese} leaves the rotation.`
                        : `Correct. ${currentTerm.japanese} advanced to ${getStudyStatusLabel(nextStage)}.`,
                pointsAwarded,
                masteryStage: nextStage,
                requiresRewrite: false,
                advanceAfterRewrite: false,
                supportWord: currentSupportWord,
            });

            if (nextActiveTerms.length === 0) {
                setHasWon(true);
                setIsGameOver(true);
            }
            return;
        }

        const nextHearts = hearts - 1;
        const nextCounts = {
            ...termCorrectCounts,
            [termKey]: 0,
        };
        const resetIndexes = {
            ...termQuestionIndexes,
            [termKey]: 0,
        };

        setTermCorrectCounts(nextCounts);
        setTermQuestionIndexes(resetIndexes);
        setRewriteAnswer("");
        setRewriteError("");

        if (mode === "practice") {
            setFeedback({
                isCorrect: false,
                message:
                    "Incorrect. Write the exact kanji word once to continue.",
                pointsAwarded: 0,
                masteryStage: "new",
                requiresRewrite: true,
                advanceAfterRewrite: true,
                supportWord: currentSupportWord,
            });
            return;
        }

        setHearts(nextHearts);
        setStreak(0);
        setMultiplier(1);
        setFeedback({
            isCorrect: false,
            message:
                nextHearts <= 0
                    ? "Incorrect. Write the word once to finish the run."
                    : "Incorrect. Write the word once before the next question.",
            pointsAwarded: 0,
            masteryStage: "new",
            requiresRewrite: true,
            advanceAfterRewrite: false,
            supportWord: currentSupportWord,
        });

        if (nextHearts <= 0) {
            setPendingGameOver(true);
        }
    };

    const masteryCounts = allTerms.reduce(
        (acc, term) => {
            const count = termCorrectCounts[getTermKey(term)] ?? 0;
            const stage = getMasteryStageFromCorrectCount(
                count,
                term.support_words.length,
            );
            acc[stage] += 1;
            return acc;
        },
        {
            new: 0,
            learning: 0,
            mastered: 0,
        } as Record<KanjiMasteryStage, number>,
    );

    const isPracticeMode = mode === "practice";
    const currentQuestionIndex = currentTerm
        ? termQuestionIndexes[getTermKey(currentTerm)] ?? 0
        : 0;
    const currentSupportWord = currentTerm
        ? currentTerm.support_words[
              Math.min(currentQuestionIndex, currentTerm.support_words.length - 1)
          ]
        : null;
    const promptParts = currentSupportWord
        ? currentSupportWord.sentence_template.split("__TARGET__")
        : ["", ""];
    const revealParts = currentSupportWord
        ? currentSupportWord.sentence_template.split("__TARGET__")
        : ["", ""];
    const feedbackWord = feedback?.supportWord ?? null;
    const feedbackRevealParts = feedbackWord
        ? feedbackWord.sentence_template.split("__TARGET__")
        : ["", ""];
    const practiceCompletedCount = allTerms.length - activeTerms.length;
    const loadStateDetails = errorMessage
        ? getLoadStateDetails(errorMessage)
        : null;
    const shouldShowEmptyState =
        !isLoading &&
        !errorMessage &&
        !isStudyConfirmOpen &&
        loadedTerms.length === 0 &&
        allTerms.length === 0 &&
        !currentTerm;
    const modeLabel = getModeLabel(mode);
    const rewriteTargetWord = feedback?.supportWord.word ?? "";

    return (
        <div className="mx-2">
            <KanjiStudyConfirmModal
                loadedTerms={loadedTerms}
                open={isStudyConfirmOpen}
                returnTargetLabel={returnTargetLabel}
                onBackToReader={goBack}
                onOpenChange={(open) => {
                    if (!open && loadedTerms.length > 0 && allTerms.length === 0) {
                        return;
                    }
                    setIsStudyConfirmOpen(open);
                }}
                onStartGame={() => handleStartLoadedStudy("game")}
                onStartPractice={() => handleStartLoadedStudy("practice")}
            />

            <SectionHeader title="Kanji Speed Chain" />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <CommonButton onClick={goBack}>
                    <span className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </span>
                </CommonButton>
                <div className="flex flex-wrap gap-2">
                    {allTerms.length > 0 && !isGameOver ? (
                        <CommonButton
                            onClick={handleEndSession}
                            additionalclasses="mx-0 bg-slate-700 text-white hover:bg-slate-600"
                        >
                            End Session
                        </CommonButton>
                    ) : null}
                    <CommonButton
                        onClick={handleRestartRun}
                        additionalclasses="mx-0"
                    >
                        <span className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Restart This Set
                        </span>
                    </CommonButton>
                </div>
            </div>

            <div className="mt-4 inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
                <button
                    type="button"
                    onClick={() => handleModeChange("game")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        mode === "game"
                            ? "bg-blue-500 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800"
                    }`}
                    aria-pressed={mode === "game"}
                >
                    Challenge Run
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange("practice")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        mode === "practice"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800"
                    }`}
                    aria-pressed={mode === "practice"}
                >
                    Practice Run
                </button>
            </div>

            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
                {mode === "game"
                    ? "Challenge Run: type the full kanji word from the kana clue, build your chain, and protect your hearts."
                    : "Practice Run: work through the set with no score or hearts, and confirm each word before moving on."}
            </div>

            {mode === "game" ? (
                <>
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-blue-400/30 bg-slate-800 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Score
                            </p>
                            <p className="text-3xl font-bold text-blue-200">
                                {score}
                            </p>
                        </div>
                        <div className="rounded-xl border border-orange-400/30 bg-slate-800 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Speed Chain
                            </p>
                            <div className="flex items-center gap-2 text-3xl font-bold text-orange-300">
                                <Flame className="h-7 w-7" />
                                {streak}
                            </div>
                            <p className="mt-1 text-sm text-orange-200">
                                x{multiplier} multiplier
                            </p>
                        </div>
                        <div className="rounded-xl border border-red-400/30 bg-slate-800 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Hearts
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-red-300">
                                {Array.from({
                                    length: KANJI_STARTING_HEARTS,
                                }).map((_, index) => (
                                    <Heart
                                        key={index}
                                        className={`h-6 w-6 ${
                                            index < hearts
                                                ? "fill-red-400 text-red-400"
                                                : "text-slate-600"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl border border-emerald-400/30 bg-slate-800 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Mastered
                            </p>
                            <div className="flex items-center gap-2 text-3xl font-bold text-emerald-300">
                                <Trophy className="h-7 w-7" />
                                {masteryCounts.mastered}/{allTerms.length}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
                        <p>
                            Study progress: not started {masteryCounts.new} | in
                            progress {masteryCounts.learning} | learned{" "}
                            {masteryCounts.mastered}
                        </p>
                    </div>
                </>
            ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-blue-400/30 bg-slate-800 p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-400">
                            Remaining
                        </p>
                        <p className="text-3xl font-bold text-blue-200">
                            {activeTerms.length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-emerald-400/30 bg-slate-800 p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-400">
                            Completed
                        </p>
                        <p className="text-3xl font-bold text-emerald-300">
                            {practiceCompletedCount}/{allTerms.length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-violet-400/30 bg-slate-800 p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-400">
                            Mode
                        </p>
                        <p className="text-2xl font-bold text-violet-200">
                            Practice Run
                        </p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <Loader />
            ) : errorMessage ? (
                <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
                    <p className="font-semibold">{loadStateDetails?.title}</p>
                    <p className="mt-2 text-sm">{loadStateDetails?.message}</p>
                    <p className="mt-2 text-sm text-red-200">
                        Next step: {loadStateDetails?.action}
                    </p>
                </div>
            ) : currentTerm ? (
                <div className="mt-6 rounded-2xl border border-blue-400/30 bg-slate-800 p-5 shadow-xl">
                    {!feedback && !isGameOver ? (
                        <>
                            <p className="text-sm uppercase tracking-wider text-blue-300">
                                {isPracticeMode
                                    ? "Practice Run"
                                    : "Challenge Run"}
                            </p>
                            <p className="mt-2 text-sm text-slate-300">
                                {isPracticeMode
                                    ? "Enter the full kanji word exactly as shown to confirm you can write it once."
                                    : "Enter the full kanji word in kanji. Do not answer with kana or a partial phrase."}
                            </p>
                            {isPracticeMode ? (
                                <div className="mt-3 space-y-3">
                                    <p className="text-4xl font-bold tracking-wide text-amber-100">
                                        {currentSupportWord?.word ??
                                            currentTerm.japanese}
                                    </p>
                                    <p className="text-2xl leading-relaxed text-slate-100">
                                        {revealParts[0]}
                                        <span className="rounded-md bg-amber-400/20 px-2 py-1 font-semibold text-amber-200">
                                            {currentSupportWord?.word}
                                        </span>
                                        {revealParts[1]}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-3 text-2xl leading-relaxed text-slate-100">
                                    {promptParts[0]}
                                    <span className="rounded-md bg-amber-400/20 px-2 py-1 font-semibold text-amber-200">
                                        {currentSupportWord?.kana}
                                    </span>
                                    {promptParts[1]}
                                </p>
                            )}
                            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-500">
                                        {isPracticeMode ? "Target" : "Reading"}
                                    </p>
                                    <p className="mt-1 text-lg">
                                        {isPracticeMode
                                            ? `${currentSupportWord?.word ?? currentTerm.japanese} (${currentSupportWord?.kana ?? currentTerm.kana})`
                                            : currentSupportWord?.kana ??
                                              currentTerm.kana}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-500">
                                        {isPracticeMode ? "Level" : "Meaning"}
                                    </p>
                                    <p className="mt-1 text-lg">
                                        {isPracticeMode
                                            ? currentTerm.jlpt_level ?? "N1+"
                                            : currentSupportWord?.english_definition ??
                                              currentTerm.english_definition}
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-5 flex gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={answer}
                                    onChange={(event) =>
                                        setAnswer(event.target.value)
                                    }
                                    placeholder={
                                        isPracticeMode
                                            ? "Enter the full kanji word"
                                            : "Enter the full kanji word in kanji"
                                    }
                                    disabled={isGameOver}
                                    className="w-full rounded-md border border-slate-700 bg-black px-3 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
                                />
                                <CommonButton
                                    type="submit"
                                    disabled={isGameOver}
                                    additionalclasses="mx-0"
                                >
                                    Submit
                                </CommonButton>
                            </form>
                            <p className="mt-2 text-xs text-slate-400">
                                Input tip: on desktop, a Chinese handwriting pad can
                                help if you have a trackpad. On mobile, try Google
                                Japanese handwriting input.
                            </p>
                        </>
                    ) : feedback ? (
                        <div
                            className={`mt-4 rounded-xl border p-4 ${
                                feedback.isCorrect
                                    ? "border-emerald-400/40 bg-emerald-600/10 text-emerald-100"
                                    : "border-red-400/40 bg-red-500/10 text-red-100"
                            }`}
                        >
                            <p className="font-semibold">{feedback.message}</p>
                            {feedback.requiresRewrite ? (
                                <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs uppercase tracking-wider text-current/70">
                                        Rewrite to continue
                                    </p>
                                    <p className="mt-2 text-lg">
                                        Correct answer:{" "}
                                        <span className="rounded-md bg-amber-400/20 px-2 py-1 font-bold text-amber-100">
                                            {feedbackWord?.word}
                                        </span>
                                    </p>
                                    <p className="mt-2 text-sm">
                                        Enter the exact full kanji word shown above
                                        to continue.
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        Sentence: {feedbackRevealParts[0]}
                                        <span className="rounded-md bg-emerald-400/20 px-2 py-1 text-lg font-bold text-emerald-200">
                                            {feedbackWord?.word}
                                        </span>
                                        {feedbackRevealParts[1]}
                                    </p>
                                    <form
                                        onSubmit={handleRewriteSubmit}
                                        className="mt-4 flex gap-2"
                                    >
                                        <input
                                            ref={rewriteInputRef}
                                            type="text"
                                            value={rewriteAnswer}
                                            onChange={(event) => {
                                                setRewriteAnswer(
                                                    event.target.value,
                                                );
                                                setRewriteError("");
                                            }}
                                            placeholder={`Type ${rewriteTargetWord}`}
                                            className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
                                        />
                                        <CommonButton
                                            type="submit"
                                            additionalclasses="mx-0 bg-emerald-600 text-white hover:bg-emerald-500"
                                        >
                                            Confirm Rewrite
                                        </CommonButton>
                                    </form>
                                    <p className="mt-2 text-xs text-current/80">
                                        Input tip: on desktop, a Chinese handwriting
                                        pad can help if you have a trackpad. On
                                        mobile, try Google Japanese handwriting
                                        input.
                                    </p>
                                    {rewriteError && (
                                        <p className="mt-2 text-sm text-yellow-100">
                                            {rewriteError}
                                        </p>
                                    )}
                                    <details className="mt-4 text-sm text-current/80">
                                        <summary className="cursor-pointer select-none">
                                            Show kanji details
                                        </summary>
                                        <div className="mt-3 space-y-1 rounded-lg border border-white/10 bg-black/10 p-3">
                                            <p>
                                                Target kanji: {currentTerm.japanese}
                                            </p>
                                            <p>Reading: {currentTerm.kana}</p>
                                            <p>
                                                Meaning:{" "}
                                                {currentTerm.english_definition}
                                            </p>
                                            <p>
                                                Level: {currentTerm.jlpt_level ?? "N1+"}
                                            </p>
                                        </div>
                                    </details>
                                    <details className="mt-4 text-sm text-current/80">
                                        <summary className="cursor-pointer select-none">
                                            Show word details
                                        </summary>
                                        <div className="mt-3 space-y-1 rounded-lg border border-white/10 bg-black/10 p-3">
                                            <p>Reading: {feedbackWord?.kana}</p>
                                            <p>
                                                Meaning:{" "}
                                                {feedbackWord?.english_definition}
                                            </p>
                                            <p>
                                                Study status:{" "}
                                                {getStudyStatusLabel(
                                                    feedback.masteryStage,
                                                )}
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            ) : (
                                <>
                                    {feedback.pointsAwarded > 0 && (
                                        <p className="mt-2 text-sm">
                                            Points gained: {feedback.pointsAwarded}
                                        </p>
                                    )}
                                    {!isGameOver && (
                                        <CommonButton
                                            ref={nextTermButtonRef}
                                            onClick={handleNextRound}
                                            additionalclasses="mx-0 mt-4 bg-white text-slate-900 hover:bg-slate-200"
                                        >
                                            Next Term
                                        </CommonButton>
                                    )}
                                </>
                            )}
                        </div>
                    ) : null}

                    {isGameOver && (
                        <div className="mt-4 rounded-xl border border-indigo-400/40 bg-indigo-500/10 p-4 text-indigo-100">
                            <p className="font-semibold">
                                {hasWon
                                    ? mode === "practice"
                                        ? "Practice run complete. Every kanji in this set was confirmed."
                                        : "Set cleared. Every term reached mastered."
                                    : `${modeLabel} ended. Your score and study progress are shown below.`}
                            </p>
                            <p className="mt-2 text-sm">
                                {mode === "practice"
                                    ? `Confirmed ${practiceCompletedCount} of ${allTerms.length} kanji this session.`
                                    : `Final score: ${score} | Best chain this run: ${bestStreak}`}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <CommonButton
                                    onClick={goBack}
                                    additionalclasses="mx-0 bg-indigo-600 text-white hover:bg-indigo-400"
                                >
                                    Back to {returnTargetLabel}
                                </CommonButton>
                                <CommonButton
                                    onClick={handleRestartRun}
                                    additionalclasses="mx-0 text-white"
                                >
                                    Play Again
                                </CommonButton>
                            </div>
                        </div>
                    )}
                </div>
            ) : shouldShowEmptyState ? (
                <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-4 text-slate-300">
                    <p className="font-semibold">No kanji ready to study</p>
                    <p className="mt-2 text-sm">
                        There is no loaded kanji set for this page right now.
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        Next step: go back to {returnTargetLabel} and choose a
                        source with kanji text.
                    </p>
                </div>
            ) : null}
        </div>
    );
}
