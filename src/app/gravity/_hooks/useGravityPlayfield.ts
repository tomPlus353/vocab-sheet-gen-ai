"use client";

import * as React from "react";

import {
    FALLING_CARD_GAP,
    FALLING_CARD_WIDTH,
    HORIZONTAL_PADDING_PX,
} from "../_lib/gravity-utils";
import type { FallingTerm } from "../_lib/gravity-utils";

type PlayfieldInputs = {
    fallingTerms: FallingTerm[];
    setFallingTerms: React.Dispatch<React.SetStateAction<FallingTerm[]>>;
    isLoading: boolean;
    isGameOver: boolean;
    isCorrectionModalOpen: boolean;
    isEditTermsModalOpen: boolean;
    score: number;
};

export function useGravityPlayfield({
    fallingTerms,
    setFallingTerms,
    isLoading,
    isGameOver,
    isCorrectionModalOpen,
    isEditTermsModalOpen,
    score,
}: PlayfieldInputs) {
    const playfieldRef = React.useRef<HTMLDivElement>(null);
    const [playfieldWidth, setPlayfieldWidth] = React.useState(0);

    React.useEffect(() => {
        if (
            isLoading ||
            isGameOver ||
            isCorrectionModalOpen ||
            isEditTermsModalOpen
        ) {
            return;
        }

        const speedPerTick = Math.min(5, 1.3 + score * 0.08);
        const interval = setInterval(() => {
            setFallingTerms((prev) =>
                prev.map((term) => ({ ...term, y: term.y + speedPerTick })),
            );
        }, 50);

        return () => clearInterval(interval);
    }, [
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        score,
        setFallingTerms,
    ]);

    React.useEffect(() => {
        const updatePlayfieldWidth = () => {
            setPlayfieldWidth(playfieldRef.current?.clientWidth ?? 0);
        };

        updatePlayfieldWidth();
        window.addEventListener("resize", updatePlayfieldWidth);
        return () => window.removeEventListener("resize", updatePlayfieldWidth);
    }, []);

    React.useEffect(() => {
        if (!playfieldWidth) {
            return;
        }

        const cardWidth = Math.min(
            FALLING_CARD_WIDTH,
            Math.max(0, playfieldWidth - HORIZONTAL_PADDING_PX * 2),
        );
        const laneWidth = cardWidth + FALLING_CARD_GAP;
        const laneCount = Math.max(
            1,
            Math.floor(
                (playfieldWidth - HORIZONTAL_PADDING_PX * 2 + FALLING_CARD_GAP) /
                    laneWidth,
            ),
        );

        setFallingTerms((prev) => {
            let changed = false;
            const mapped = prev.map((term, index) => {
                const lane = index % laneCount;
                const left = HORIZONTAL_PADDING_PX + lane * laneWidth;
                if (term.laneIndex === lane && term.x === left && term.isPositioned) {
                    return term;
                }
                changed = true;
                return {
                    ...term,
                    x: left,
                    laneIndex: lane,
                    isPositioned: true,
                };
            });
            return changed ? mapped : prev;
        });
    }, [fallingTerms, playfieldWidth, setFallingTerms]);

    return {
        playfieldRef,
    };
}
