'use client';
import React, { createContext, useContext, useState, useEffect } from "react";

type SettingsContextType = {
    perPage: number;
    setPerPageContext: (n: number) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [perPage, setPerPage] = useState(5);
    const setPerPageContext = (n: number) => setPerPage(n);

    // on mount, load settings from localStorage
    useEffect(() => {
        const savedNumSentences = localStorage.getItem("numSentences") ?? "5";
        setPerPageContext(Number(savedNumSentences));
    }, []);

    // whenever settings change, save to localStorage
    useEffect(() => {
        localStorage.setItem("numSentences", perPage.toString());
    }, [perPage]);

    return <SettingsContext.Provider value={{ perPage: perPage, setPerPageContext }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
    // get the context
    const ctx = useContext(SettingsContext);

    // Type guard to ensure context is defined
    if (!ctx) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }

    // Type guard to ensure ctx is an object
    if (!(typeof ctx == "object")) {
        throw new Error("useSettings: context is not an object");
    }

    // return the entire context after passing validation
    return ctx;
}