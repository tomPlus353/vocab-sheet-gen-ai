"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";
import SectionHeader from "@/components/common/SectionHeader";
import { Toaster } from "@/components/ui/toaster";
import { Loader } from "@/components/common/Loader";

import { AllLearntModal } from "./_components/AllLearntModal";
import { CorrectionModal } from "./_components/CorrectionModal";
import { useGravityGame } from "./_hooks/useGravityGame";
import { PLAYFIELD_HEIGHT_PX, getTermKey } from "./_lib/gravity-utils";
import { EditTermsModal } from "../match/_components/EditTermsModal";
import { GameControls } from "./_components/GameControls";

export default function GravityPage() {
    const router = useRouter();
    const LAST_PAGINATOR_PAGE_KEY = "lastPaginatorPage";
    const [editTermsMode, setEditTermsMode] = useState<"favorites" | "history">(
        "history",
    );

    const {
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
        totalTermsCount,
        setAnswer,
        setCorrectionInput,
        setShowReadingHint,
        showReadingHint,
        isTestReading,
        setIsTestReading,
        isFavoritesMode,
        setIsFavoritesMode,
        isExtinctionMode,
        setIsExtinctionMode,
        timer,
        unlearntTermsCount,
        terms,
        setTerms,
        isEditTermsModalOpen,
        setIsEditTermsModalOpen,
        fallingTerms,
        termWrongCounts,
        isTermAtRisk,
        oppositeModeHasUnlearntTerms,
    } = useGravityGame();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setEditTermsMode(
            urlParams.get("favorites") === "1" ? "favorites" : "history",
        );
    }, []);

    const handleReturnFromGravityPage = () => {
        const page = localStorage.getItem(LAST_PAGINATOR_PAGE_KEY) ?? "1";
        if (page === "0") {
            router.back();
        } else {
            router.push(`/paginator?page=${page}`);
        }
    };

    const handleSwitchPracticeMode = () => {
        setIsTestReading(!isTestReading);
        loadVocabTerms().catch((err) => {
            console.error("Error switching gravity practice mode:", err);
        });
    };

    const showGameOverPanel = isGameOver && !isCorrectionModalOpen;

    return (
        <div>
            <SectionHeader title="Gravity Typing Game" />

            <GameControls
                loadVocabTerms={loadVocabTerms}
                resetLearningProgress={resetLearningProgress}
                setIsEditTermsModalOpen={setIsEditTermsModalOpen}
                isTermAtRisk={isTermAtRisk}
                showReadingHint={showReadingHint}
                setShowReadingHint={setShowReadingHint}
                isTestReading={isTestReading}
                setIsTestReading={setIsTestReading}
                isFavoritesMode={isFavoritesMode}
                setIsFavoritesMode={setIsFavoritesMode}
                isExtinctionMode={isExtinctionMode}
                setIsExtinctionMode={setIsExtinctionMode}
            />

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
                <div className="mt-6 w-full px-4">
                    <div
                        ref={playfieldRef}
                        className="relative h-[480px] w-full overflow-hidden rounded-xl border border-blue-300/20 bg-slate-900"
                        style={{ height: `${PLAYFIELD_HEIGHT_PX}px` }}
                    >
                        <div className="absolute bottom-0 h-1 w-full bg-red-500/60" />
                        {showGameOverPanel ? (
                            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-300/80">
                                        Round Complete
                                    </p>
                                    <h2 className="text-3xl font-black text-white">
                                        Game Over
                                    </h2>
                                    <p className="mx-auto max-w-md text-sm text-slate-300">
                                        {gameOverMessage}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Restart this gravity set or head back to
                                        choose your next review.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <CommonButton
                                        label="Restart Gravity"
                                        additionalclasses="mx-0"
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
                                        label="Back to Reader"
                                        additionalclasses="mx-0 bg-slate-700/80 hover:bg-slate-600 hover:text-white"
                                        onClick={handleReturnFromGravityPage}
                                    />
                                </div>
                            </div>
                        ) : fallingTerms.length > 0 ? (
                            fallingTerms.map((term) => {
                                const termKey = getTermKey(term.term);
                                const termWrongCount =
                                    termWrongCounts[termKey] ?? 0;
                                const isDisplayingReading = isTestReading;
                                const prompt = isDisplayingReading
                                    ? `Write: ${term.term.japanese}`
                                    : term.term.english_definition;
                                const truncated =
                                    prompt.length > 50
                                        ? `${prompt.slice(0, 50)}…`
                                        : prompt;
                                return (
                                    <div
                                        key={term.id}
                                        className={`absolute max-w-[220px] rounded-lg border px-3 py-2 shadow-lg transition-all duration-200 ${
                                            termWrongCount > 0
                                                ? "border-red-300/20 bg-red-500/20 text-red-100"
                                                : "border-amber-300/20 bg-amber-500/20 text-amber-100"
                                        }`}
                                        style={{
                                            top: `${term.y}px`,
                                            left: `${term.x}px`,
                                        }}
                                        title={term.term.english_definition}
                                    >
                                        <p className="whitespace-normal break-words font-bold">
                                            {truncated}
                                        </p>
                                        {showReadingHint && (
                                            <p className="text-xs text-amber-200/80">
                                                Hint: {term.term.kana}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                Preparing next terms...
                            </div>
                        )}
                    </div>

                    {!showGameOverPanel && (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-4 flex gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-white outline-none focus:border-indigo-500"
                                placeholder="Type the Japanese term"
                                value={answer}
                                disabled={
                                    isGameOver ||
                                    isLoading ||
                                    fallingTerms.length === 0 ||
                                    isCorrectionModalOpen
                                }
                                onChange={(event) =>
                                    setAnswer(event.target.value)
                                }
                            />
                            <CommonButton
                                type="submit"
                                label="Submit"
                                additionalclasses="mx-0"
                                disabled={
                                    isGameOver ||
                                    isLoading ||
                                    fallingTerms.length === 0 ||
                                    isCorrectionModalOpen
                                }
                            />
                        </form>
                    )}
                </div>
            )}

            <CorrectionModal
                open={isCorrectionModalOpen}
                isGameOver={isGameOver}
                activeTerm={correctionTerm ?? null}
                correctionInput={correctionInput}
                correctionError={correctionError}
                onCorrectionInputChange={setCorrectionInput}
                onSubmit={handleCorrectionSubmit}
            />
            <AllLearntModal
                open={isAllLearntModalOpen && !isGameOver}
                isTestReading={isTestReading}
                showSwitchPractice={oppositeModeHasUnlearntTerms}
                onSwitchPractice={handleSwitchPracticeMode}
                onReturnToReader={handleReturnFromGravityPage}
                onContinuePractice={resumeAfterAllLearntModal}
            />
            <EditTermsModal
                open={isEditTermsModalOpen}
                onOpenChange={setIsEditTermsModalOpen}
                terms={terms}
                setTerms={setTerms}
                mode={editTermsMode}
            />

            <Toaster />
        </div>
    );
}
