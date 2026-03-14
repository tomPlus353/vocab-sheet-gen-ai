"use client";

import * as React from "react";

import { HORIZONTAL_PADDING_PX } from "../_lib/gravity-utils";
import type { FallingTerm } from "../_lib/gravity-utils";

type PlayfieldInputs = {
    activeTerm: FallingTerm | null;
    setActiveTerm: React.Dispatch<React.SetStateAction<FallingTerm | null>>;
    isLoading: boolean;
    isGameOver: boolean;
    isCorrectionModalOpen: boolean;
    isEditTermsModalOpen: boolean;
    score: number;
};

export function useGravityPlayfield({
    activeTerm,
    setActiveTerm,
    isLoading,
    isGameOver,
    isCorrectionModalOpen,
    isEditTermsModalOpen,
    score,
}: PlayfieldInputs) {
    const playfieldRef = React.useRef<HTMLDivElement>(null);
    const activeCardRef = React.useRef<HTMLDivElement>(null);
    const [playfieldWidth, setPlayfieldWidth] = React.useState(0);

    React.useEffect(() => {
        if (
            !activeTerm ||
            isLoading ||
            isGameOver ||
            isCorrectionModalOpen ||
            isEditTermsModalOpen
        ) {
            return;
        }

        const speedPerTick = Math.min(5, 1.3 + score * 0.08);
        const interval = setInterval(() => {
            setActiveTerm((prev) => {
                if (!prev) {
                    return prev;
                }
                return {
                    ...prev,
                    y: prev.y + speedPerTick,
                };
            });
        }, 50);

        return () => clearInterval(interval);
    }, [
        activeTerm,
        isGameOver,
        isLoading,
        score,
        isCorrectionModalOpen,
        isEditTermsModalOpen,
        setActiveTerm,
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
        if (!activeTerm || activeTerm.isPositioned) {
            return;
        }

        const cardWidth = activeCardRef.current?.offsetWidth ?? 0;
        if (!playfieldWidth || !cardWidth) {
            return;
        }

        const maxLeft = Math.max(
            HORIZONTAL_PADDING_PX,
            playfieldWidth - cardWidth - HORIZONTAL_PADDING_PX,
        );
        const randomLeft =
            HORIZONTAL_PADDING_PX +
            Math.random() * Math.max(0, maxLeft - HORIZONTAL_PADDING_PX);

        setActiveTerm((prev) =>
            prev && prev.id === activeTerm.id
                ? { ...prev, x: randomLeft, isPositioned: true }
                : prev,
        );
    }, [activeTerm, playfieldWidth, setActiveTerm]);

    React.useEffect(() => {
        if (!activeTerm?.isPositioned) {
            return;
        }

        const cardWidth = activeCardRef.current?.offsetWidth ?? 0;
        if (!playfieldWidth || !cardWidth) {
            return;
        }

        const maxLeft = Math.max(
            HORIZONTAL_PADDING_PX,
            playfieldWidth - cardWidth - HORIZONTAL_PADDING_PX,
        );
        const clampedLeft = Math.min(
            Math.max(activeTerm.x, HORIZONTAL_PADDING_PX),
            maxLeft,
        );

        if (clampedLeft !== activeTerm.x) {
            setActiveTerm((prev) =>
                prev && prev.id === activeTerm.id
                    ? { ...prev, x: clampedLeft }
                    : prev,
            );
        }
    }, [activeTerm, playfieldWidth, setActiveTerm]);

    return {
        playfieldRef,
        activeCardRef,
    };
}
