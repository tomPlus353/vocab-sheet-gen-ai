"use client";

import * as React from "react";

const GRAVITY_EXTINCTION_MODE_KEY = "gravityExtinctionMode";

export function useGravityExtinctionMode() {
    const [isExtinctionMode, setIsExtinctionMode] = React.useState(false);
    const isExtinctionModeRef = React.useRef(false);
    const [isExtinctionModeReady, setIsExtinctionModeReady] =
        React.useState(false);

    React.useEffect(() => {
        const persistedMode =
            localStorage.getItem(GRAVITY_EXTINCTION_MODE_KEY) === "true";

        setIsExtinctionMode(persistedMode);
        isExtinctionModeRef.current = persistedMode;
        setIsExtinctionModeReady(true);
    }, []);

    React.useEffect(() => {
        isExtinctionModeRef.current = isExtinctionMode;
    }, [isExtinctionMode]);

    React.useEffect(() => {
        if (!isExtinctionModeReady) {
            return;
        }

        localStorage.setItem(
            GRAVITY_EXTINCTION_MODE_KEY,
            isExtinctionMode ? "true" : "false",
        );
    }, [isExtinctionMode, isExtinctionModeReady]);

    return {
        isExtinctionMode,
        setIsExtinctionMode,
        isExtinctionModeRef,
        isExtinctionModeReady,
    };
}
