"use client";

import * as React from "react";

const GRAVITY_FAVORITES_MODE_KEY = "gravityFavoritesMode";

export function useGravityFavoritesMode() {
    const [isFavoritesMode, setIsFavoritesMode] = React.useState(false);
    const isFavoritesModeRef = React.useRef(false);
    const [isFavoritesModeReady, setIsFavoritesModeReady] =
        React.useState(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const persistedMode =
            localStorage.getItem(GRAVITY_FAVORITES_MODE_KEY) === "true";
        const nextMode = urlParams.get("favorites") === "1" || persistedMode;

        setIsFavoritesMode(nextMode);
        isFavoritesModeRef.current = nextMode;
        setIsFavoritesModeReady(true);
    }, []);

    React.useEffect(() => {
        isFavoritesModeRef.current = isFavoritesMode;
    }, [isFavoritesMode]);

    React.useEffect(() => {
        if (!isFavoritesModeReady) {
            return;
        }

        localStorage.setItem(
            GRAVITY_FAVORITES_MODE_KEY,
            isFavoritesMode ? "true" : "false",
        );
    }, [isFavoritesMode, isFavoritesModeReady]);

    return {
        isFavoritesMode,
        setIsFavoritesMode,
        isFavoritesModeRef,
        isFavoritesModeReady,
    };
}
