"use client";

import { Heart } from "lucide-react";
import { getHashedCache, setHashedCache } from "@/lib/utils";

type vocabObj = Record<string, string | boolean>;

const GLOBAL_FAV_LIST_KEY = "favoriteTerms";

interface Props {
    mode: "all" | "current";
    terms: Record<string, string | boolean>[];
    setTerms: React.Dispatch<React.SetStateAction<vocabObj[]>>;
}

export function FavoritesList({ mode, terms, setTerms }: Props) {
    function handleFavoriteClickAll(index: number) {
        // For use in "all" mode to toggle favorite status
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
        // For use in "current" mode to toggle favorite status
        // e.g. editing the terms for the current game

        if (!terms) return;

        const updatedTerms = [...terms];
        //toggle is_favorite property of term at index
        const term = updatedTerms[index];

        if (!term) return;

        if (term.isFavorite === undefined) {
            //initialize to true if clicked for the first time
            term.isFavorite = true;
        } else {
            //if not first time, then toggle the favorite status
            term.isFavorite = !term.isFavorite;
        }

        // 1. update the list of terms in local storage
        const activeTextStr = localStorage.getItem("activeText");
        const currentTermListString = getHashedCache(
            "vocabGame" + activeTextStr,
        );
        let currentTermsList: vocabObj[] = [];
        if (currentTermListString) {
            currentTermsList = JSON.parse(currentTermListString);
        }
        // Update the term in the current terms list
        currentTermsList[index] = term;
        // Cache the updated terms list
        setHashedCache(
            "vocabGame" + activeTextStr,
            JSON.stringify(currentTermsList),
        );

        //2. update state
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
    const favoriteClickHandler =
        mode === "all" ? handleFavoriteClickAll : handleFavoriteClickCurrent;

    return (
        <ul className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            {terms.map((termObj, index) => (
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
    );
}
