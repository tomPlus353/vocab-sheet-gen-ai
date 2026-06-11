"use client";

import * as React from "react";

export function useGravityFavoritesMode() {
    const [isFavoritesMode, setIsFavoritesMode] = React.useState(false);
    const [isSrsMode, setIsSrsMode] = React.useState(false);
    const isFavoritesModeRef = React.useRef(false);
    const [isFavoritesModeReady, setIsFavoritesModeReady] =
        React.useState(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const srsEnabled =
            urlParams.get("srsMode") === "1" &&
            (urlParams.get("srsBucket") === "overdue" ||
                urlParams.get("srsBucket") === "due_today" ||
                urlParams.get("srsBucket") === "upcoming");
        setIsSrsMode(srsEnabled);
        const isHistoryFavoritesMode = urlParams.get("historyFavorites") === "1";
        const nextMode =
            !srsEnabled &&
            (urlParams.get("favorites") === "1" ||
                isHistoryFavoritesMode);

        setIsFavoritesMode(nextMode);
        isFavoritesModeRef.current = nextMode;
        setIsFavoritesModeReady(true);
    }, []);

    React.useEffect(() => {
        isFavoritesModeRef.current = isFavoritesMode;
    }, [isFavoritesMode]);

    return {
        isFavoritesMode,
        setIsFavoritesMode,
        isFavoritesModeRef,
        isFavoritesModeReady,
        isSrsMode,
    };
}
