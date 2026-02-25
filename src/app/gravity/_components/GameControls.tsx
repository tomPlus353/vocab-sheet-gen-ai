"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";
import { Checkbox } from "@/components/ui/checkbox";

import { useGravityGame } from "../_hooks/useGravityGame";

export function GameControls(props: any) {
    const router = useRouter();
    const {
        loadVocabTerms,
        resetLearningProgress,
        setIsEditTermsModalOpen,
        activeTermWrongCount,
        showReadingHint,
        setShowReadingHint,
        isFavoritesMode,
        setIsFavoritesMode,
    } = useGravityGame();

    const [isAllFavoritesReviewMode, setIsAllFavoritesReviewMode] =
        useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setIsAllFavoritesReviewMode(urlParams.get("favorites") === "1");
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between border border-x-0 border-gray-700 bg-gray-900 px-1">
                <div className="flex gap-2">
                    <CommonButton
                        label="↩ Back"
                        additionalclasses="mx-0 whitespace-nowrap text-xs sm:text-sm"
                        onClick={() => router.back()}
                    />
                    <CommonButton
                        label="⟳ Restart"
                        additionalclasses="mx-0 whitespace-nowrap text-xs sm:text-sm"
                        onClick={() => {
                            loadVocabTerms().catch((err) => {
                                console.error(
                                    "Error restarting gravity game:",
                                    err,
                                );
                            });
                        }}
                    />
                    <CommonButton
                        label="Reset Progress"
                        additionalclasses="mx-0 whitespace-nowrap bg-red-700 text-xs sm:text-sm hover:bg-red-600"
                        onClick={resetLearningProgress}
                    />
                    <CommonButton
                        label={"✎ Edit Terms"}
                        additionalclasses="mx-0 whitespace-nowrap text-xs sm:text-sm"
                        onClick={() => setIsEditTermsModalOpen(true)}
                    />
                </div>
                <div className="px-1 text-xs text-gray-200 sm:text-sm">
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
            <div className="w-full border border-x-0 border-gray-700 bg-gray-900 px-4 py-3">
                <div className="flex justify-center gap-6">
                    <label
                        htmlFor="show-reading-hint"
                        className="flex cursor-pointer items-center gap-3"
                    >
                        <Checkbox
                            className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                            id="show-reading-hint"
                            checked={showReadingHint}
                            onCheckedChange={() =>
                                setShowReadingHint((prev) => !prev)
                            }
                        />
                        <span className="text-sm font-medium text-gray-200">
                            Show reading hint (romanization)
                        </span>
                    </label>
                    {!isAllFavoritesReviewMode && (
                        <label
                            htmlFor="favorites-only"
                            className="flex cursor-pointer items-center gap-3"
                        >
                            <Checkbox
                                className="h-5 w-5 rounded-sm border-gray-500 bg-transparent data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                                id="favorites-only"
                                checked={isFavoritesMode}
                                onCheckedChange={() =>
                                    setIsFavoritesMode(!isFavoritesMode)
                                }
                            />
                            <span className="text-sm font-medium text-gray-200">
                                Favorites only
                            </span>
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
