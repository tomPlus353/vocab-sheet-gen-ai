"use client";

import * as React from "react";

type TimerInputs = {
    setTimer: React.Dispatch<React.SetStateAction<number>>;
    isLoading: boolean;
    isGameOver: boolean;
    isCorrectionModalOpen: boolean;
    isAllLearntModalOpen: boolean;
    isEditTermsModalOpen: boolean;
};

export function useGravityTimer({
    setTimer,
    isLoading,
    isGameOver,
    isCorrectionModalOpen,
    isAllLearntModalOpen,
    isEditTermsModalOpen,
}: TimerInputs) {
    React.useEffect(() => {
        if (
            isLoading ||
            isGameOver ||
            isCorrectionModalOpen ||
            isAllLearntModalOpen ||
            isEditTermsModalOpen
        ) {
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [
        isLoading,
        isGameOver,
        isCorrectionModalOpen,
        isAllLearntModalOpen,
        isEditTermsModalOpen,
    ]);

    return;
}
