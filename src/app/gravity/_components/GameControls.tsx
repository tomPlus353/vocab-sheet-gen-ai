"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";
import { ConfirmActionModal } from "@/components/common/modals/ConfirmActionModal";
import { Checkbox } from "@/components/ui/checkbox";

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
};

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
    } = props;

    const [isAllFavoritesReviewMode, setIsAllFavoritesReviewMode] =
        useState(false);
    const [isRestartPromptOpen, setIsRestartPromptOpen] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setIsAllFavoritesReviewMode(urlParams.get("favorites") === "1");
    }, []);

    const handleRestart = () => {
        loadVocabTerms().catch((err) => {
            console.error("Error restarting gravity game:", err);
        });
    };

    const handleFavoritesModeToggle = () => {
        setIsFavoritesMode(!isFavoritesMode);
        setIsRestartPromptOpen(true);
    };

    const handleExtinctionModeToggle = () => {
        if (isExtinctionModeDisabled) {
            return;
        }
        setIsExtinctionMode(!isExtinctionMode);
        setIsRestartPromptOpen(true);
    };

    const handleTestReadingToggle = () => {
        setIsTestReading(!isTestReading);
        setIsRestartPromptOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col items-center gap-1 border border-x-0 border-gray-700 bg-gray-900 px-1 sm:flex-row sm:items-center sm:justify-around sm:gap-0">
                <div className="flex gap-1 sm:gap-2">
                    <CommonButton
                        label="↩ Back"
                        additionalclasses="mx-0 whitespace-nowrap text-xs sm:text-sm"
                        onClick={() => router.back()}
                    />
                    <CommonButton
                        label="⟳ Restart"
                        additionalclasses="mx-0 whitespace-nowrap text-xs sm:text-sm"
                        onClick={handleRestart}
                    />
                    <CommonButton
                        label="Reset"
                        additionalclasses="mx-0 whitespace-nowrap bg-red-700 text-xs sm:text-sm hover:bg-red-600"
                        onClick={resetLearningProgress}
                    />
                    <CommonButton
                        label={"✎ Edit"}
                        additionalclasses="mx-0 whitespace-nowrap text-xs sm:text-sm"
                        onClick={() => setIsEditTermsModalOpen(true)}
                    />
                </div>
                <div className="px-1 text-center text-xs text-gray-200 sm:text-left sm:text-sm">
                    {isTermAtRisk ? (
                        <span className="font-semibold text-red-400">
                            Warning: a missed term ends the game if missed
                            again.
                        </span>
                    ) : (
                        <span className="text-gray-300">
                            Game ends if you miss the same term twice.
                        </span>
                    )}
                </div>
            </div>
            <div className="w-full border border-x-0 border-gray-700 bg-gray-900 px-2 py-1">
                <div className="flex flex-wrap justify-around gap-4">
                    <label
                        htmlFor="show-reading-hint"
                        className="flex cursor-pointer items-center gap-2"
                    >
                        <Checkbox
                            className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                            id="show-reading-hint"
                            checked={showReadingHint}
                            onCheckedChange={() =>
                                setShowReadingHint((prev) => !prev)
                            }
                        />
                        <span className="text-xs font-medium text-gray-200 md:text-sm">
                            Show reading hint (kana)
                        </span>
                    </label>
                    {!isAllFavoritesReviewMode && (
                        <label
                            htmlFor="favorites-only"
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <Checkbox
                                className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                                id="favorites-only"
                                checked={isFavoritesMode}
                                onCheckedChange={handleFavoritesModeToggle}
                            />
                            <span className="text-xs font-medium text-gray-200 md:text-sm">
                                Favorites only
                            </span>
                        </label>
                    )}
                    <label
                        htmlFor="test-reading"
                        className="flex cursor-pointer items-center gap-2"
                    >
                        <Checkbox
                            className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                            id="test-reading"
                            checked={isTestReading}
                            onCheckedChange={handleTestReadingToggle}
                        />
                        <span className="text-xs font-medium text-gray-200 md:text-sm">
                            Test reading
                        </span>
                    </label>
                    <label
                        htmlFor="extinction-mode"
                        className={`flex items-center gap-2 ${
                            isExtinctionModeDisabled
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                        }`}
                        title={
                            isExtinctionModeDisabled
                                ? "Extinction mode is disabled because all terms in this set are already learnt."
                                : "Hide learnt terms and keep practicing only unlearnt terms."
                        }
                    >
                        <Checkbox
                            className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                            id="extinction-mode"
                            checked={isExtinctionMode}
                            onCheckedChange={handleExtinctionModeToggle}
                            disabled={isExtinctionModeDisabled}
                        />
                        <span className="text-xs font-medium text-gray-200 md:text-sm">
                            Extinction mode
                        </span>
                        {isExtinctionModeDisabled && (
                            <span className="text-[10px] text-slate-400 md:text-xs">
                                (disabled: all learnt)
                            </span>
                        )}
                    </label>
                </div>
            </div>
            <ConfirmActionModal
                open={isRestartPromptOpen}
                title="Restart Gravity?"
                description={`Restart to apply mode changes to this gravity run. Favorites only is ${
                    isFavoritesMode ? "on" : "off"
                }, extinction mode is ${
                    isExtinctionMode ? "on" : "off"
                }, and test reading is ${isTestReading ? "on" : "off"}.`}
                confirmLabel="Restart now"
                onOpenChange={setIsRestartPromptOpen}
                onConfirm={handleRestart}
            />
        </div>
    );
}
