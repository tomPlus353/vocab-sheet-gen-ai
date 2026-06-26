"use client";

import * as React from "react";

import {
    FALLING_CARD_WIDTH,
    GRAVITY_DROP_TICK_MS,
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
    fallSpeed: number;
};

function getClampedX(
    value: number,
    minLeft: number,
    maxLeft: number,
): number {
    return Math.min(Math.max(value, minLeft), maxLeft);
}

function getRandomCardX(minLeft: number, maxLeft: number): number {
    if (maxLeft <= minLeft) {
        return minLeft;
    }

    return minLeft + Math.random() * (maxLeft - minLeft);
}

export function useGravityPlayfield({
    fallingTerms,
    setFallingTerms,
    isLoading,
    isGameOver,
    isCorrectionModalOpen,
    isEditTermsModalOpen,
    fallSpeed,
}: PlayfieldInputs) {
    const playfieldRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (
            isLoading ||
            isGameOver ||
            isCorrectionModalOpen ||
            isEditTermsModalOpen
        ) {
            return;
        }

        const interval = setInterval(() => {
            setFallingTerms((prev) =>
                prev.map((term) => ({ ...term, y: term.y + fallSpeed })),
            );
        }, GRAVITY_DROP_TICK_MS);

        return () => clearInterval(interval);
    }, [
        isGameOver,
        isLoading,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        fallSpeed,
        setFallingTerms,
    ]);

    React.useEffect(() => {
        const measuredWidth =
            playfieldRef.current?.clientWidth ??
            Math.max(0, window.innerWidth - HORIZONTAL_PADDING_PX * 4);

        const cardWidth = Math.min(
            FALLING_CARD_WIDTH,
            Math.max(0, measuredWidth - HORIZONTAL_PADDING_PX * 2),
        );
        const minLeft = HORIZONTAL_PADDING_PX;
        const maxLeft = Math.max(
            HORIZONTAL_PADDING_PX,
            measuredWidth - cardWidth - HORIZONTAL_PADDING_PX,
        );

        setFallingTerms((prev) => {
            let changed = false;
            const mapped = prev.map((term) => {
                if (term.isPositioned) {
                    const clampedX = getClampedX(term.x, minLeft, maxLeft);
                    if (clampedX === term.x) {
                        return term;
                    }
                    changed = true;
                    return {
                        ...term,
                        x: clampedX,
                    };
                }

                const nextX = getRandomCardX(minLeft, maxLeft);
                changed = true;
                return {
                    ...term,
                    x: nextX,
                    laneIndex: undefined,
                    isPositioned: true,
                };
            });
            return changed ? mapped : prev;
        });
    }, [fallingTerms, setFallingTerms]);

    return {
        playfieldRef,
    };
}
