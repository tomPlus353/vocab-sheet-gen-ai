"use client";
import { FavoritesList } from "@/components/common/FavoritesList";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

type vocabObj = Record<string, string | boolean>;

const Favorites = () => {
    const [favoriteTerms, setFavoriteTerms] = React.useState<vocabObj[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Extract gameVocabJson data from localStorage when the modal opens

        //extract raw text from localStorage
        const cachedJsonString = localStorage.getItem("favoriteTerms");
        // parse json string into array
        const termsAsJson: vocabObj[] = JSON.parse(cachedJsonString ?? "[]");
        // set terms to state
        setFavoriteTerms(termsAsJson);
    }, []);

    const handleGoMatch = () => {
        try {
            router.push("/match?favorites=1", undefined);
        } catch (e) {
            console.log("Error pushing to match page: ", e);
        }
    };
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            {/* Favorites Flow */}
            <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-slate-100">⭐ Favorites</p>
                <div className="flex gap-2 text-xs">
                    <button
                        className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
                        onClick={handleGoMatch}
                    >
                        Study
                    </button>
                    <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                        View all
                    </button>
                </div>
            </div>
            <p className="mb-3 text-sm text-slate-400">
                Most recent starred terms
            </p>
            <p className="text-right text-sm font-bold text-red-500">
                Total Favorites:{" "}
                {favoriteTerms
                    ? favoriteTerms.filter((t) => t.isFavorite).length
                    : 0}
            </p>
            <div>
                <FavoritesList
                    mode="all"
                    terms={favoriteTerms}
                    setTerms={setFavoriteTerms}
                />
            </div>
        </div>
    );
};

export default Favorites;
