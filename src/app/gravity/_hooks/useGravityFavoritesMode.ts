"use client";

import * as React from "react";

export function useGravityFavoritesMode() {
    const [isFavoritesMode, setIsFavoritesMode] = React.useState(false);
    const isFavoritesModeRef = React.useRef(false);

    React.useEffect(() => {
        isFavoritesModeRef.current = isFavoritesMode;
    }, [isFavoritesMode]);

    return {
        isFavoritesMode,
        setIsFavoritesMode,
        isFavoritesModeRef,
    };
}
