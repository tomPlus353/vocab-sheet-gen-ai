"use client";

import * as React from "react";

const GRAVITY_KEEP_PLAYING_MODE_KEY = "gravityKeepPlayingMode";

export function useGravityKeepPlayingMode() {
    const [isKeepPlayingMode, setIsKeepPlayingModeState] =
        React.useState(false);
    const isKeepPlayingModeRef = React.useRef(false);
    const [isKeepPlayingModeReady, setIsKeepPlayingModeReady] =
        React.useState(false);

    const setIsKeepPlayingMode = React.useCallback(
        (value: React.SetStateAction<boolean>) => {
            const nextValue =
                typeof value === "function"
                    ? (value as (prevState: boolean) => boolean)(
                          isKeepPlayingModeRef.current,
                      )
                    : value;
            isKeepPlayingModeRef.current = nextValue;
            setIsKeepPlayingModeState(nextValue);
        },
        [],
    );

    React.useEffect(() => {
        const persistedMode =
            localStorage.getItem(GRAVITY_KEEP_PLAYING_MODE_KEY) === "true";

        setIsKeepPlayingModeState(persistedMode);
        isKeepPlayingModeRef.current = persistedMode;
        setIsKeepPlayingModeReady(true);
    }, []);

    React.useEffect(() => {
        if (!isKeepPlayingModeReady) {
            return;
        }

        localStorage.setItem(
            GRAVITY_KEEP_PLAYING_MODE_KEY,
            isKeepPlayingMode ? "true" : "false",
        );
    }, [isKeepPlayingMode, isKeepPlayingModeReady]);

    return {
        isKeepPlayingMode,
        setIsKeepPlayingMode,
        isKeepPlayingModeRef,
        isKeepPlayingModeReady,
    };
}
