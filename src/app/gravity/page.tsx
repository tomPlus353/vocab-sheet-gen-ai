"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";
import SectionHeader from "@/components/common/SectionHeader";
import { Toaster } from "@/components/ui/toaster";
import { Loader } from "@/components/common/Loader";
import { Checkbox } from "@/components/ui/checkbox";

import { AllLearntModal } from "./_components/AllLearntModal";
import { CorrectionModal } from "./_components/CorrectionModal";
import { useGravityGame } from "./_hooks/useGravityGame";
import { PLAYFIELD_HEIGHT_PX } from "./_lib/gravity-utils";
import { EditTermsModal } from "../match/_components/EditTermsModal";

export default function GravityPage() {
    const router = useRouter();
    const LAST_PAGINATOR_PAGE_KEY = "lastPaginatorPage";
    const [isAllFavoritesReviewMode, setIsAllFavoritesReviewMode] =
        useState(false);

    const {
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
        totalTermsCount,
        setAnswer,
        setCorrectionInput,
        setShowReadingHint,
        showReadingHint,
        isFavoritesMode,
        setIsFavoritesMode,
        timer,
        unlearntTermsCount,
        terms,
        setTerms,
        isEditTermsModalOpen,
        setIsEditTermsModalOpen,
    } = useGravityGame();

    const handleReturnFromGravityPage = () => {
        const page = localStorage.getItem(LAST_PAGINATOR_PAGE_KEY) ?? "1";
        if (page === "0") {
            router.back();
        } else {
            router.push(`/paginator?page=${page}`);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setIsAllFavoritesReviewMode(urlParams.get("favorites") === "1");
    }, []);

    return (
        <div>
            <SectionHeader title="Gravity Typing Game" />

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

            <div className="border border-x-0 border-gray-600 bg-gray-700/50">
                <div className="mx-auto grid w-[96%] max-w-6xl grid-cols-4 gap-4 text-center">
                    <div className="py-2">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Learning
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-400">
                            {learningTermsCount}
                        </div>
                    </div>
                    <div className="py-2">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Unlearnt
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-400">
                            {unlearntTermsCount}
                        </div>
                    </div>
                    <div className="py-2">
                        <span className="text-sm uppercase tracking-wider text-indigo-400">
                            Learnt
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-400">
                            <span className="text-green-300">
                                {learntTermsCount}
                            </span>
                            /{totalTermsCount}
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
                <div className="mx-auto mt-6 w-[96%] max-w-6xl px-4">
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
                            additionalclasses="mx-0"
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

            <CorrectionModal
                open={isCorrectionModalOpen && !isGameOver}
                activeTerm={activeTerm?.term ?? null}
                correctionInput={correctionInput}
                correctionError={correctionError}
                onCorrectionInputChange={setCorrectionInput}
                onSubmit={handleCorrectionSubmit}
            />
            <AllLearntModal
                open={isAllLearntModalOpen && !isGameOver}
                onReturnToReader={handleReturnFromGravityPage}
                onContinuePractice={resumeAfterAllLearntModal}
            />
            <EditTermsModal
                open={isEditTermsModalOpen}
                onOpenChange={setIsEditTermsModalOpen}
                terms={terms}
                setTerms={setTerms}
            />

            <Toaster />
        </div>
    );
}
