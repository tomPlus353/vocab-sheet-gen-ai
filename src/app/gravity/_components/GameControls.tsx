"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    CircleAlert,
    Clock3,
    RotateCcw,
    Settings,
    BookOpen,
    CheckCircle2,
    TriangleAlert,
    Pencil,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmActionModal } from "@/components/common/modals/ConfirmActionModal";

type GameControlProps = {
    loadVocabTerms: () => Promise<void>;
    resetLearningProgress: () => void;
    setIsEditTermsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isTermAtRisk: boolean;
    showReadingHint: boolean;
    setShowReadingHint: React.Dispatch<React.SetStateAction<boolean>>;
    isTestReading: boolean;
    setIsTestReading: React.Dispatch<React.SetStateAction<boolean>>;
    isFavoritesMode: boolean;
    setIsFavoritesMode: React.Dispatch<React.SetStateAction<boolean>>;
    isExtinctionMode: boolean;
    setIsExtinctionMode: React.Dispatch<React.SetStateAction<boolean>>;
    isExtinctionModeDisabled: boolean;
    isKeepPlayingMode: boolean;
    setIsKeepPlayingMode: React.Dispatch<React.SetStateAction<boolean>>;
    isSrsMode: boolean;
    learningTermsCount: number;
    unlearntTermsCount: number;
    atRiskTermsCount: number;
    learntTermsCount: number;
    timer: number;
};

function StatPill(props: {
    icon: React.ReactNode;
    value: React.ReactNode;
    className: string;
    tooltip: string;
}) {
    return (
        <div
            className={`inline-flex items-center gap-1 rounded-2xl border px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${props.className}`}
            title={props.tooltip}
        >
            {props.icon}
            <span>{props.value}</span>
        </div>
    );
}

export function GameControls(props: GameControlProps) {
    const router = useRouter();
    const {
        loadVocabTerms,
        resetLearningProgress,
        setIsEditTermsModalOpen,
        isTermAtRisk,
        showReadingHint,
        setShowReadingHint,
        isTestReading,
        setIsTestReading,
        isFavoritesMode,
        setIsFavoritesMode,
        isExtinctionMode,
        setIsExtinctionMode,
        isExtinctionModeDisabled,
        isKeepPlayingMode,
        setIsKeepPlayingMode,
        isSrsMode,
        learningTermsCount,
        unlearntTermsCount,
        atRiskTermsCount,
        learntTermsCount,
        timer,
    } = props;

    const [isAllFavoritesReviewMode, setIsAllFavoritesReviewMode] =
        useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRestartPromptOpen, setIsRestartPromptOpen] = useState(false);
    const [isResetPromptOpen, setIsResetPromptOpen] = useState(false);
    const [pendingModeChange, setPendingModeChange] = useState<
        "favorites" | "testReading" | "extinction" | "keepPlaying" | null
    >(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setIsAllFavoritesReviewMode(urlParams.get("favorites") === "1");
    }, []);

    const handleRestart = () => {
        loadVocabTerms().catch((err) => {
            console.error("Error restarting gravity game:", err);
        });
    };

    const handleRequestModeChange = (
        mode: "favorites" | "testReading" | "extinction" | "keepPlaying",
    ) => {
        setPendingModeChange(mode);
        setIsRestartPromptOpen(true);
    };

    const handleConfirmModeChange = () => {
        if (pendingModeChange === "favorites") {
            setIsFavoritesMode((prev) => !prev);
        } else if (pendingModeChange === "testReading") {
            setIsTestReading((prev) => !prev);
        } else if (pendingModeChange === "extinction") {
            if (!isExtinctionModeDisabled) {
                setIsExtinctionMode((prev) => !prev);
            }
        } else if (pendingModeChange === "keepPlaying") {
            setIsKeepPlayingMode((prev) => !prev);
        }
        setPendingModeChange(null);
        setIsRestartPromptOpen(false);
        handleRestart();
    };

    const handleRestartPromptOpenChange = (open: boolean) => {
        setIsRestartPromptOpen(open);
        if (!open) {
            setPendingModeChange(null);
        }
    };

    return (
        <div className="relative border border-x-0 border-indigo-200/20 bg-[#08132d]/95">
            <div className="flex flex-col border-b border-indigo-200/20 px-3 py-2 pr-14 text-slate-100 md:flex-row md:items-center md:gap-1 md:pr-16">
                <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-400/40 px-2.5 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/40"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                </button>
                <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex shrink-0 items-center gap-1.5 px-1.5 py-1.5 text-sm font-semibold text-slate-300 hover:text-white"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restart</span>
                </button>
                <button
                    type="button"
                    onClick={() => setIsEditTermsModalOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 px-1.5 py-1.5 text-sm font-semibold text-slate-300 hover:text-white"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                </button>
                </div>

                <div className="mt-1 flex items-center gap-1 md:mt-0 md:ml-1 md:shrink-0">
                    <StatPill
                        icon={<TriangleAlert className="h-3.5 w-3.5" />}
                        value={atRiskTermsCount}
                        className="border-rose-500/65 bg-rose-500/15 text-rose-200"
                        tooltip="Terms currently at risk (one miss away)"
                    />
                    <StatPill
                        icon={<CircleAlert className="h-3.5 w-3.5" />}
                        value={unlearntTermsCount}
                        className="border-red-500/65 bg-red-500/15 text-red-200"
                        tooltip="Unlearnt terms remaining"
                    />
                    <StatPill
                        icon={<BookOpen className="h-3.5 w-3.5" />}
                        value={learningTermsCount}
                        className="border-amber-500/65 bg-amber-500/15 text-amber-200"
                        tooltip="Learning terms in this run"
                    />
                    <StatPill
                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        value={learntTermsCount}
                        className="border-emerald-500/65 bg-emerald-500/15 text-emerald-200"
                        tooltip="Learnt terms in this run"
                    />
                    <StatPill
                        icon={<Clock3 className="h-3.5 w-3.5" />}
                        value={`${timer}s`}
                        className="border-blue-500/65 bg-blue-500/15 text-blue-200"
                        tooltip="Elapsed time in this game"
                    />
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1 text-xs md:mt-0 md:ml-auto">
                    <span
                        className={`truncate whitespace-nowrap ${
                            isTermAtRisk
                                ? "font-semibold text-red-300"
                                : "text-slate-300"
                        }`}
                        title={
                            isTermAtRisk
                                ? "At least one term is currently one miss away from game over."
                                : undefined
                        }
                    >
                        {isTermAtRisk
                            ? "Warning: one more miss can end the game"
                            : "Miss twice = game over"}
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className="absolute right-2 top-2 z-30 rounded-lg p-2.5 text-slate-200 hover:bg-slate-700/40 md:right-3"
                aria-label="Game settings"
            >
                <Settings className="h-5 w-5" />
            </button>

            {isSettingsOpen ? (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSettingsOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/20" />
                    <div
                        className="absolute right-4 top-16 z-50 w-[min(92vw,520px)] rounded-3xl border border-indigo-300/25 bg-[#121f43] p-6 text-slate-200 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3 className="mb-4 text-2xl font-semibold">
                            Game Settings
                        </h3>
                        <div className="space-y-4 text-xl">
                        <label
                            htmlFor="show-reading-hint"
                            className="flex cursor-pointer items-center gap-3"
                        >
                            <Checkbox
                                className="h-6 w-6 rounded border-slate-400 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                                id="show-reading-hint"
                                checked={showReadingHint}
                                onCheckedChange={() =>
                                    setShowReadingHint((prev) => !prev)
                                }
                            />
                            <span>Show reading hint (kana)</span>
                        </label>

                        <label
                            htmlFor="test-reading"
                            className="flex cursor-pointer items-center gap-3"
                        >
                            <Checkbox
                                className="h-6 w-6 rounded border-slate-400 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                                id="test-reading"
                                checked={isTestReading}
                                onCheckedChange={() =>
                                    handleRequestModeChange("testReading")
                                }
                            />
                            <span>Test reading</span>
                        </label>

                        {!isAllFavoritesReviewMode && !isSrsMode ? (
                            <label
                                htmlFor="favorites-only"
                                className="flex cursor-pointer items-center gap-3"
                            >
                                <Checkbox
                                    className="h-6 w-6 rounded border-slate-400 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                                    id="favorites-only"
                                    checked={isFavoritesMode}
                                    onCheckedChange={() =>
                                        handleRequestModeChange("favorites")
                                    }
                                />
                                <span>Favorites only</span>
                            </label>
                        ) : null}

                        <label
                            htmlFor="extinction-mode"
                            className={`flex items-center gap-3 ${
                                isExtinctionModeDisabled || isKeepPlayingMode
                                    ? "cursor-not-allowed opacity-60"
                                    : "cursor-pointer"
                            }`}
                            title={
                                isKeepPlayingMode
                                    ? "Extinction mode is paused while Keep playing mode is on."
                                    : isExtinctionModeDisabled
                                      ? "Extinction mode is disabled because all terms in this set are already learnt."
                                      : "Hide learnt terms and keep practicing only unlearnt terms."
                            }
                        >
                            <Checkbox
                                className="h-6 w-6 rounded border-slate-400 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                                id="extinction-mode"
                                checked={isExtinctionMode}
                                onCheckedChange={() => {
                                    if (isExtinctionModeDisabled || isKeepPlayingMode) {
                                        return;
                                    }
                                    handleRequestModeChange("extinction");
                                }}
                                disabled={isExtinctionModeDisabled || isKeepPlayingMode}
                            />
                            <span>Extinction mode</span>
                        </label>

                        {isKeepPlayingMode ? (
                            <div
                                className="flex items-center gap-3 text-slate-300"
                                title="Extra practice after the current set is fully learnt."
                            >
                                <span className="h-6 w-6 rounded border border-dashed border-slate-500/70" />
                                <span>Extra practice</span>
                            </div>
                        ) : null}

                        {!isSrsMode ? (
                            <button
                                type="button"
                                onClick={() => setIsResetPromptOpen(true)}
                                className="rounded-lg border border-red-400/60 px-3 py-2 text-base text-red-200 hover:bg-red-500/15"
                            >
                                Reset learning progress
                            </button>
                        ) : null}

                        {!isSrsMode ? (
                            <button
                                type="button"
                                onClick={() => setIsEditTermsModalOpen(true)}
                                className="rounded-lg border border-slate-500/70 px-3 py-2 text-base hover:bg-slate-700/40"
                            >
                                Edit Terms
                            </button>
                        ) : null}
                    </div>

                    {isSrsMode ? (
                        <div className="mt-4 border-t border-slate-600 pt-4 text-lg text-slate-400">
                            SRS bucket mode: Favorites and Edit Terms are
                            disabled.
                        </div>
                    ) : null}
                    </div>
                </div>
            ) : null}

            <ConfirmActionModal
                open={isRestartPromptOpen}
                title="Restart Gravity?"
                description="Mode changes require restarting this gravity run to avoid state conflicts. Restart now?"
                confirmLabel="Restart now"
                onOpenChange={handleRestartPromptOpenChange}
                onConfirm={handleConfirmModeChange}
            />
            <ConfirmActionModal
                open={isResetPromptOpen}
                title="Reset learning progress?"
                description="This will reset learning progress for terms in the current gravity scope."
                confirmLabel="Reset now"
                onOpenChange={setIsResetPromptOpen}
                onConfirm={resetLearningProgress}
            />
        </div>
    );
}
