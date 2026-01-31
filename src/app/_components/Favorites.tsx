"use client";
import { FavoritesList } from "@/components/common/FavoritesList";
import { getHashedCache } from "@/lib/utils";
import React, { useEffect } from "react";
type vocabObj = Record<string, string | boolean>;

const Favorites = () => {
    const [favoriteTerms, setFavoriteTerms] = React.useState<vocabObj[]>([]);

    useEffect(() => {
        // Extract gameVocabJson data from localStorage when the modal opens

        //extract raw text from localStorage
        const cachedJsonString = localStorage.getItem("favoriteTerms");
        // parse json string into array
        const termsAsJson: vocabObj[] = JSON.parse(cachedJsonString ?? "[]");
        // set terms to state
        setFavoriteTerms(termsAsJson);
    }, []);
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
            {/* Favorites Flow */}
            <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-slate-100">⭐ Favorites</p>
                <div className="flex gap-2 text-xs">
                    <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
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
            <div>
                <FavoritesList
                    mode="all"
                    terms={favoriteTerms}
                    setTerms={setFavoriteTerms}
                />
                {/* <ul className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    <li className="flex justify-between">
                        <span>重要</span>
                        <span className="text-slate-500">important</span>
                    </li>
                    <li className="flex justify-between">
                        <span>制約条件</span>
                        <span className="text-slate-500">constraint</span>
                    </li>
                    <li className="flex justify-between">
                        <span>KPI</span>
                        <span className="text-slate-500">key indicator</span>
                    </li>
                </ul> */}
            </div>
        </div>
    );
};

export default Favorites;
