"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import CommonButton from "@/components/common/CommonButton";
import { Toaster } from "@/components/ui/toaster";
import { Loader } from "@/components/common/Loader";

import { AllLearntModal } from "./_components/AllLearntModal";
import { CorrectionModal } from "./_components/CorrectionModal";
import { GameOverModal } from "./_components/GameOverModal";
import { useGravityGame } from "./_hooks/useGravityGame";
import { getTermKey } from "./_lib/gravity-utils";
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
        setAnswer,
        setCorrectionInput,
        setShowReadingHint,
        showReadingHint,
        isTestReading,
        setIsTestReading,
        isFavoritesMode,
        isSrsMode,
        setIsFavoritesMode,
        isExtinctionMode,
        setIsExtinctionMode,
        isExtinctionModeDisabled,
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
            if (urlParams.get("srsMode") === "1") {
                setIsEditTermsModalOpen(false);
            }
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

    const isCorrectionModalVisible =
        isCorrectionModalOpen && correctionTerm !== null;
    const showGameOverPanel = isGameOver && !isCorrectionModalVisible;
    const atRiskTermsCount = Object.values(termWrongCounts).filter(
        (count) => count > 0,
    ).length;
    const getAsteroidStyle = (id: number, isAtRisk: boolean) => {
        const tilt = ((id * 13) % 18) - 9;
        const scale = 0.92 + ((id * 7) % 12) / 100;
        const glowColor = isAtRisk
            ? "rgba(239, 68, 68, 0.48)"
            : "rgba(251, 146, 60, 0.42)";

        return {
            transform: `rotate(${tilt}deg) scale(${scale})`,
            boxShadow: `0 0 36px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.18)`,
        };
    };

    return (
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#030611] text-slate-100">
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
                isExtinctionModeDisabled={isExtinctionModeDisabled}
                isSrsMode={isSrsMode}
                learningTermsCount={learningTermsCount}
                unlearntTermsCount={unlearntTermsCount}
                atRiskTermsCount={atRiskTermsCount}
                learntTermsCount={learntTermsCount}
                timer={timer}
            />

            {isLoading ? (
                <Loader />
            ) : (
                <div className="flex min-h-0 w-full flex-1 flex-col px-2 pb-2 pt-2 md:px-3">
                    <div
                        ref={playfieldRef}
                        className="relative min-h-0 w-full flex-1 overflow-hidden rounded-[28px] border border-indigo-200/20 bg-[#040818]"
                    >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_14%,rgba(103,88,255,0.2),transparent_34%),radial-gradient(circle_at_72%_68%,rgba(255,95,31,0.13),transparent_36%),radial-gradient(circle_at_50%_80%,rgba(170,64,255,0.2),transparent_44%),linear-gradient(180deg,#090d2c_0%,#06091d_55%,#050614_100%)]" />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.92)_1px,transparent_0)] [background-size:28px_28px]" />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.24] [background-image:radial-gradient(circle_at_1px_1px,rgba(226,232,240,0.8)_1px,transparent_0)] [background-size:42px_42px]" />
                        <div className="absolute bottom-0 h-1 w-full bg-gradient-to-r from-red-500/55 via-rose-400/75 to-red-500/55" />
                        {isCorrectionModalVisible || showGameOverPanel ? null : fallingTerms.length > 0 ? (
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
                                        className={`absolute max-w-[220px] rounded-[26px] border px-4 py-3 shadow-lg backdrop-blur-[1px] transition-all duration-200 ${
                                            termWrongCount > 0
                                                ? "border-red-500/70 bg-[radial-gradient(circle_at_20%_18%,rgba(190,18,60,0.5),rgba(69,10,10,0.84))] text-red-100"
                                                : "border-amber-500/65 bg-[radial-gradient(circle_at_28%_20%,rgba(234,88,12,0.5),rgba(67,20,7,0.84))] text-amber-100"
                                        }`}
                                        style={{
                                            top: `${term.y}px`,
                                            left: `${term.x}px`,
                                            ...getAsteroidStyle(
                                                term.id,
                                                termWrongCount > 0,
                                            ),
                                        }}
                                        title={term.term.english_definition}
                                    >
                                        <span className="pointer-events-none absolute right-4 top-3 h-3.5 w-3.5 rounded-full bg-black/35" />
                                        <span className="pointer-events-none absolute bottom-3 left-4 h-2.5 w-2.5 rounded-full bg-black/30" />
                                        <p className="whitespace-normal break-words font-bold">
                                            {truncated}
                                        </p>
                                        {showReadingHint && (
                                            <p className="text-xs text-amber-100/80">
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

                    {!showGameOverPanel && !isGameOver && (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-2 flex items-center gap-2 rounded-2xl border border-indigo-200/20 bg-[#0b1331]/90 p-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                className="h-12 w-full rounded-xl border border-indigo-300/25 bg-[#111b3d] px-4 text-2xl text-slate-100 outline-none placeholder:text-slate-400 focus:border-indigo-400"
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
                                additionalclasses="mx-0 h-12 rounded-xl border-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-7 text-xl font-semibold text-white hover:from-indigo-400 hover:to-fuchsia-400"
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
                open={isCorrectionModalVisible}
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
            <GameOverModal
                open={showGameOverPanel}
                message={gameOverMessage}
                onRestart={() => {
                    loadVocabTerms().catch((err) => {
                        console.error("Error restarting gravity game:", err);
                    });
                }}
                onReturn={handleReturnFromGravityPage}
            />
            {!isSrsMode ? (
                <EditTermsModal
                    open={isEditTermsModalOpen}
                    onOpenChange={setIsEditTermsModalOpen}
                    terms={terms}
                    setTerms={setTerms}
                    mode={editTermsMode}
                />
            ) : null}

            <Toaster />
        </div>
    );
}
