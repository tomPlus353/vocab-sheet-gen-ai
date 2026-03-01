"use client";

import React from "react";
import { Heart, Trash2 } from "lucide-react";
import { appendGameHistory } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import CommonButton from "./CommonButton";
import { ConfirmActionModal } from "./modals/ConfirmActionModal";
import type { VocabTerm } from "@/lib/types/vocab";

const GLOBAL_FAV_LIST_KEY = "favoriteTerms";

interface FavoritesListProps {
    mode: "favorites" | "history";
    terms: VocabTerm[];
    setTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
    historyTermsKey?: string | null;
    refreshTerms?: () => void;
}

function getLearningStatus(gravityScore?: number): {
    label: "unlearned" | "learning" | "learnt";
    icon: "○" | "◐" | "●";
    badgeClassName: string;
    accentClassName: string;
} {
    if ((gravityScore ?? 0) >= 2) {
        return {
            label: "learnt",
            icon: "●",
            badgeClassName:
                "border-emerald-400/40 bg-emerald-500/20 text-emerald-200",
            accentClassName: "border-l-emerald-400/70",
        };
    }

    if ((gravityScore ?? 0) === 1) {
        return {
            label: "learning",
            icon: "◐",
            badgeClassName:
                "border-amber-400/40 bg-amber-500/20 text-amber-200",
            accentClassName: "border-l-amber-400/70",
        };
    }

    return {
        label: "unlearned",
        icon: "○",
        badgeClassName:
            "border-violet-400/30 bg-violet-500/10 text-violet-200/90",
        accentClassName: "border-l-violet-400/60",
    };
}

export function FavoritesList({
    mode,
    terms,
    setTerms,
    historyTermsKey = null,
    refreshTerms = undefined,
}: FavoritesListProps) {
    const [isClearConfirmOpen, setIsClearConfirmOpen] = React.useState(false);
    const favoriteCount = terms
        ? terms.filter((term) => term.isFavorite).length
        : 0;
    const unlearnedCount = terms
        ? terms.filter((term) => (term.gravity_score ?? 0) === 0).length
        : 0;
    const learningCount = terms
        ? terms.filter((term) => (term.gravity_score ?? 0) === 1).length
        : 0;
    const learntCount = terms
        ? terms.filter((term) => (term.gravity_score ?? 0) >= 2).length
        : 0;

    function clearAllFavorites() {
        // 1. update the state
        const updatedTerms = terms.map((term) => {
            return { ...term, isFavorite: false };
        });
        setTerms(updatedTerms);
        // 2. update localStorage depending on mode

        // Case 1: Clear global favorites list in localStorage
        if (mode === "favorites") {
            localStorage.removeItem(GLOBAL_FAV_LIST_KEY);
            refreshTerms?.(); // Refresh the favorites list after clearing
            return;
            // Case 2: Clear favorite status from the current history terms
        } else if (mode === "history") {
            // If historyTermsKey is provided, update that specific key in the game history cache
            if (historyTermsKey) {
                appendGameHistory(
                    historyTermsKey,
                    JSON.stringify(updatedTerms),
                    true,
                );
            }
            // If no specific key is provided, attempt to determine the correct key from URL params or active text
            if (!historyTermsKey) {
                // Check the url
                if (typeof window !== "undefined") {
                    const urlParams = new URLSearchParams(
                        window.location.search,
                    );
                    const isReviewHistory =
                        urlParams.get("history") === "1" ? true : false;

                    if (isReviewHistory) {
                        historyTermsKey = urlParams.get("historyTerms");
                        appendGameHistory(
                            historyTermsKey!,
                            JSON.stringify(updatedTerms),
                            true,
                        );
                        refreshTerms?.(); // Refresh the favorites list after clearing
                        return;
                    }
                }
                // check the local storage if no key in url and we're in a browser environment
                if (
                    typeof localStorage !== "undefined" &&
                    localStorage.getItem("activeText")
                ) {
                    // Fallback to activeText if historyTermsKey is not set and we're in a browser environment
                    const activeText = localStorage.getItem("activeText");
                    historyTermsKey = activeText;
                    appendGameHistory(
                        historyTermsKey!,
                        JSON.stringify(updatedTerms),
                        false,
                    );
                    refreshTerms?.(); // Refresh the favorites list after clearing
                    return;
                }

                console.warn(
                    "No historyTermsKey provided for clearing favorites in history mode.",
                );
                return;
            }
        }
    }

    function handleFavoriteClickAll(index: number) {
        // For use in "favorites" mode to toggle favorite status
        // e.g. viewing all favorite terms

        if (!terms) return;
        const updatedTerms = [...terms];
        //toggle is_favorite property of term at index
        const term = updatedTerms[index];

        if (!term) return;

        //1 toggle favorite status
        if (term.isFavorite === undefined) {
            //initialize to true if clicked for the first time
            term.isFavorite = true;
        } else {
            //if not first time, then toggle the favorite status
            term.isFavorite = !term.isFavorite;
        }

        //2 update state
        setTerms(updatedTerms);

        //3. Update localStorage cache for the global term list
        const currentFavoritesString =
            localStorage.getItem(GLOBAL_FAV_LIST_KEY);
        let currentFavorites: VocabTerm[] = [];
        if (currentFavoritesString) {
            currentFavorites = JSON.parse(currentFavoritesString);
        }
        // If term is now favorite, add to favorites list
        if (term.isFavorite) {
            // Avoid duplicates
            const exists = currentFavorites.some(
                (favTerm) =>
                    favTerm.english_definition === term.english_definition &&
                    favTerm.japanese === term.japanese,
            );
            if (!exists) {
                currentFavorites.push(term);
            }
        } else {
            // If term is unfavorited, remove from favorites list
            currentFavorites = currentFavorites.filter(
                (favTerm) =>
                    favTerm.english_definition !== term.english_definition &&
                    favTerm.japanese !== term.japanese,
            );
        }
        // save updated favorites list to localStorage
        localStorage.setItem(
            GLOBAL_FAV_LIST_KEY,
            JSON.stringify(currentFavorites),
        );
    }

    function handleFavoriteClickCurrent(index: number) {
        // For use in "history" mode to toggle favorite status
        // e.g. editing the terms for the current game

        if (!terms) return;

        const term = terms[index];

        if (!term) return;

        // Toggle is_favorite property of term at index
        if (term.isFavorite === undefined) {
            //initialize to true if clicked for the first time
            term.isFavorite = true;
        } else {
            //if not first time, then toggle the favorite status
            term.isFavorite = !term.isFavorite;
        }

        // Create a copy of the terms array to update
        const updatedTerms = [...terms];

        // reflect change in the copied array
        updatedTerms[index] = term;

        // 1. update the list of terms in local storage
        const urlParams = new URLSearchParams(window.location.search);
        const isReviewHistory = urlParams.get("history") === "1" ? true : false;
        const isReviewFavorites =
            urlParams.get("favorites") === "1" ? true : false;

        // Update the history cache
        if (historyTermsKey) {
            // use the provided historyTermsKey, no need to change
        } else if (isReviewHistory) {
            // If reviewing history and history terms not set yet
            // then try to get key from URL params
            historyTermsKey = urlParams.get("historyTerms");
        } else {
            // If no key is provided, default to active text
            const activeText = localStorage.getItem("activeText");
            historyTermsKey = activeText;
        }

        // case 1: no special params review active text terms
        if (!isReviewHistory && !isReviewFavorites) {
            console.log("Case 1. Updating history with active text terms. ");

            // If not reviewing history or favorites, update the active text terms
            const activeText = localStorage.getItem("activeText");
            if (activeText) {
                appendGameHistory(
                    activeText,
                    JSON.stringify(updatedTerms),
                    false,
                );
            }
            // case 2: past game history review
        } else if (isReviewHistory && historyTermsKey) {
            console.log(
                "Case 2. Updating history terms for key: ",
                historyTermsKey,
            );
            // Cache the updated terms list
            appendGameHistory(
                historyTermsKey,
                JSON.stringify(updatedTerms),
                true,
            );

            // case 3: reviewing all favorites
        } else if (isReviewFavorites) {
            console.log(
                "Case 3. Updating favorite terms for key: ",
                GLOBAL_FAV_LIST_KEY,
            );
            //if reviewing favorites, update the favorite terms cache
            localStorage.setItem(
                GLOBAL_FAV_LIST_KEY,
                JSON.stringify(updatedTerms),
            );
        } else {
            console.warn("No valid key found for updating game history terms.");
        }

        //2. update state
        setTerms(updatedTerms);

        //3. Update localStorage cache for the global term list
        const currentFavoritesString =
            localStorage.getItem(GLOBAL_FAV_LIST_KEY);
        let currentFavorites: VocabTerm[] = [];
        if (currentFavoritesString) {
            currentFavorites = JSON.parse(
                currentFavoritesString,
            ) as VocabTerm[];
        }
        // If term is now favorite, add to favorites list
        if (term.isFavorite) {
            // Avoid duplicates
            const exists = currentFavorites.some(
                (favTerm) =>
                    favTerm.english_definition === term.english_definition &&
                    favTerm.japanese === term.japanese,
            );
            if (!exists) {
                currentFavorites.push(term);
            }
        } else {
            // If term is unfavorited, remove from favorites list
            currentFavorites = currentFavorites.filter(
                (favTerm) =>
                    favTerm.english_definition !== term.english_definition &&
                    favTerm.japanese !== term.japanese,
            );
        }
        // save updated favorites list to localStorage
        localStorage.setItem(
            GLOBAL_FAV_LIST_KEY,
            JSON.stringify(currentFavorites),
        );
    }
    const favoriteClickHandler =
        mode === "favorites"
            ? handleFavoriteClickAll
            : handleFavoriteClickCurrent;

    return (
        <ScrollArea className="my-2 max-h-96 flex-1 overflow-y-auto rounded-md border">
            {/* header section */}
            <div className="my-1 flex flex-wrap items-start justify-between gap-2 px-1">
                <div className="grid grid-cols-2 gap-1 text-xs sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                    <span
                        className="inline-flex items-center gap-1 rounded-full border border-red-400/40 bg-red-500/10 px-2 py-0.5 text-red-200"
                        title={`Favorites: ${favoriteCount}`}
                    >
                        <Heart className="h-3.5 w-3.5" fill="currentColor" />
                        <span className="font-medium">favorites</span>
                        <span className="font-semibold">{favoriteCount}</span>
                    </span>
                    <span
                        className="inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-0.5 text-violet-200"
                        title={`Unlearned: ${unlearnedCount}`}
                    >
                        <span className="text-sm leading-none">○</span>
                        <span className="font-medium">unlearned</span>
                        <span className="font-semibold">{unlearnedCount}</span>
                    </span>
                    <span
                        className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-amber-200"
                        title={`Learning: ${learningCount}`}
                    >
                        <span className="text-sm leading-none">◐</span>
                        <span className="font-medium">learning</span>
                        <span className="font-semibold">{learningCount}</span>
                    </span>
                    <span
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-200"
                        title={`Learnt: ${learntCount}`}
                    >
                        <span className="text-sm leading-none">●</span>
                        <span className="font-medium">learnt</span>
                        <span className="font-semibold">{learntCount}</span>
                    </span>
                </div>
                <a
                    className="inline-flex items-center gap-1 whitespace-nowrap border-slate-800/40 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
                    onClick={() => setIsClearConfirmOpen(true)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove all
                </a>
            </div>
            <ul className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                {terms?.map((termObj, index) => {
                    const learningStatus = getLearningStatus(
                        termObj.gravity_score,
                    );

                    return (
                        <li
                            key={index}
                            className={`mb-1 flex items-center justify-between rounded-md border border-l-4 border-slate-700 bg-black px-2 py-1.5 last:mb-0 ${learningStatus.accentClassName}`}
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="truncate font-medium text-slate-100">
                                    {termObj.japanese}
                                </span>
                                <span
                                    className={`inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-semibold tracking-wide ${learningStatus.badgeClassName}`}
                                    title={`${learningStatus.label} (gravity score: ${termObj.gravity_score ?? 0})`}
                                >
                                    {learningStatus.icon} {learningStatus.label}
                                </span>
                            </div>
                            {/* Favorite button */}
                            <button
                                className="ml-3 rounded-md px-1 py-1 text-sm text-red-500 hover:bg-slate-800"
                                onClick={() => favoriteClickHandler(index)}
                                title={
                                    termObj.isFavorite
                                        ? "Remove favorite"
                                        : "Add favorite"
                                }
                            >
                                {termObj.isFavorite ? (
                                    // Filled heart icon for favorite
                                    <Heart
                                        className="inline-block h-6 w-6"
                                        fill="red"
                                    />
                                ) : (
                                    <Heart className="inline-block h-6 w-6" />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <ConfirmActionModal
                open={isClearConfirmOpen}
                title="Clear all favorites?"
                description="This removes the favorite selection from all visible terms."
                confirmLabel="Clear all"
                onOpenChange={setIsClearConfirmOpen}
                onConfirm={clearAllFavorites}
            />
        </ScrollArea>
    );
}
