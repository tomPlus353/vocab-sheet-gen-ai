"use client";

import * as React from "react";

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
        isKeepPlayingModeRef.current = false;
        setIsKeepPlayingModeReady(true);
    }, []);

    return {
        isKeepPlayingMode,
        setIsKeepPlayingMode,
        isKeepPlayingModeRef,
        isKeepPlayingModeReady,
    };
}
