"use client";

import { Heart, Trash2 } from "lucide-react";
import { appendGameHistory } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import CommonButton from "./CommonButton";

type vocabObj = Record<string, string | boolean>;

const GLOBAL_FAV_LIST_KEY = "favoriteTerms";

interface Props {
    mode: "favorites" | "history";
    terms: Record<string, string | boolean>[];
    setTerms: React.Dispatch<React.SetStateAction<vocabObj[]>>;
    historyTermsKey?: string | null;
}

export function FavoritesList({
    mode,
    terms,
    setTerms,
    historyTermsKey = null,
}: Props) {
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
        let currentFavorites: vocabObj[] = [];
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

        // case 1: past game history review
        if (historyTermsKey) {
            console.log(
                "Case 1. Updating history terms for key: ",
                historyTermsKey,
            );
            // Cache the updated terms list
            appendGameHistory(
                historyTermsKey,
                JSON.stringify(updatedTerms),
                false,
            );
            // case 2: reviewing all favorites
        } else if (isReviewFavorites) {
            console.log(
                "Case 2. Updating favorite terms for key: ",
                GLOBAL_FAV_LIST_KEY,
            );
            //if reviewing favorites, update the favorite terms cache
            localStorage.setItem(
                GLOBAL_FAV_LIST_KEY,
                JSON.stringify(updatedTerms),
            );
            // case 3: default, reviewing active text terms
        } else if (!isReviewHistory && !isReviewFavorites) {
            console.log("Case 3. Updating history with active text terms. ");

            // If not reviewing history or favorites, update the active text terms
            const activeText = localStorage.getItem("activeText");
            if (activeText) {
                appendGameHistory(
                    activeText,
                    JSON.stringify(updatedTerms),
                    false,
                );
            }
        } else {
            console.warn("No valid key found for updating game history terms.");
        }

        //2. update state
        setTerms(updatedTerms);

        //3. Update localStorage cache for the global term list
        const currentFavoritesString =
            localStorage.getItem(GLOBAL_FAV_LIST_KEY);
        let currentFavorites: vocabObj[] = [];
        if (currentFavoritesString) {
            currentFavorites = JSON.parse(currentFavoritesString) as vocabObj[];
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
            <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-right text-sm font-bold text-red-500">
                    Total Favorites:{" "}
                    {terms ? terms.filter((t) => t.isFavorite).length : 0}
                </p>
                <CommonButton
                    additionalclasses="mx-0 my-0 inline-flex items-center gap-1 rounded-full border-red-400/40 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
                    onClick={() => {
                        // Clear all favorites
                        const updatedTerms = terms.map((term) => {
                            return { ...term, isFavorite: false };
                        });
                        setTerms(updatedTerms);
                        // Clear global favorites list in localStorage
                        localStorage.removeItem(GLOBAL_FAV_LIST_KEY);
                    }}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear all
                </CommonButton>
            </div>
            <ul className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                {terms?.map((termObj, index) => (
                    <li
                        key={index}
                        className="flex justify-between border-2 border-blue-600/50"
                    >
                        <span>{termObj.japanese}</span>
                        {/* Favorite button */}
                        <button
                            className="ml-4 rounded-md px-2 py-1 text-sm text-red-500 hover:bg-slate-800"
                            onClick={() => favoriteClickHandler(index)}
                        >
                            {termObj.isFavorite ? (
                                // Filled heart icon for favorite
                                <Heart
                                    className="inline-block h-8 w-8"
                                    fill="red"
                                />
                            ) : (
                                <Heart className="inline-block h-8 w-8" />
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </ScrollArea>
    );
}
