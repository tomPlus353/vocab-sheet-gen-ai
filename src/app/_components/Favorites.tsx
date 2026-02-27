"use client";
import { FavoritesList } from "@/components/common/FavoritesList";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ViewHistoryModal } from "./ViewHistoryModal";
import { Eye, Grid2x2Check, Orbit, RefreshCcw } from "lucide-react";

import type { VocabTerm } from "@/lib/types/vocab";
import { isVocabTerm } from "@/lib/utils";

const LAST_PAGINATOR_PAGE_KEY = "lastPaginatorPage";

const Favorites = () => {
    const ACTION_BUTTON_CLASSES =
        "has-tooltip relative rounded border border-blue-100/20 px-2 py-1 bg-blue-500/50 hover:bg-blue-300 hover:text-black";
    const [favoriteTerms, setFavoriteTerms] = React.useState<VocabTerm[]>([]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleOpenTermsModal = () => {
        setIsModalOpen(true);
    };

    const loadFavoriteTerms = React.useCallback(() => {
        const cachedJsonString = localStorage.getItem("favoriteTerms");
        try {
            const parsedTerms: unknown = JSON.parse(cachedJsonString ?? "[]");
            // Verify first that the parsed data is an array before filtering
            if (!Array.isArray(parsedTerms)) {
                setFavoriteTerms([]);
                return;
            }
            // Filter the parsed data to ensure all items conform to the VocabTerm structure
            const termsAsJson = parsedTerms.filter(isVocabTerm);
            // Set only the terms that are marked as favorite
            setFavoriteTerms(
                termsAsJson.filter((term) => term.isFavorite === true),
            );
        } catch (e) {
            // If parsing fails, reset to an empty array
            console.error(
                "Error parsing favorite terms from localStorage: ",
                e,
            );
            setFavoriteTerms([]);
        }
    }, []);

    useEffect(() => {
        loadFavoriteTerms();
    }, [loadFavoriteTerms]);

    const handleGoMatch = () => {
        try {
            localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
            router.push("/match?favorites=1", undefined);
        } catch (e) {
            console.log("Error pushing to match page: ", e);
        }
    };

    const handleGoGravity = () => {
        try {
            localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
            router.push("/gravity?favorites=1", undefined);
        } catch (e) {
            console.log("Error pushing to gravity page: ", e);
        }
    };
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            {/* Favorites Flow */}
            <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-slate-100">⭐ Favorites</p>
                <div className="flex gap-2 text-xs">
                    <button
                        className={ACTION_BUTTON_CLASSES}
                        onClick={handleGoMatch}
                        aria-label="Study with Match"
                        title="Study with Match"
                    >
                        <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                            Study (Match)
                        </span>
                        <Grid2x2Check className="h-4 w-4" />
                    </button>
                    <button
                        className={ACTION_BUTTON_CLASSES}
                        onClick={handleGoGravity}
                        aria-label="Study with Gravity"
                        title="Study with Gravity"
                    >
                        <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                            Study (Gravity)
                        </span>
                        <Orbit className="h-4 w-4" />
                    </button>
                    <button
                        className={ACTION_BUTTON_CLASSES}
                        onClick={() => handleOpenTermsModal()}
                        aria-label="View all terms"
                        title="View all terms"
                    >
                        <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                            View all
                        </span>
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        className={ACTION_BUTTON_CLASSES}
                        onClick={loadFavoriteTerms}
                        aria-label="Refresh favorites list"
                        title="Refresh favorites list"
                    >
                        <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                            Refresh list
                        </span>
                        <RefreshCcw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
            <p className="mb-3 text-sm text-slate-400">
                Most recent starred terms
            </p>
            <div>
                <FavoritesList
                    mode="favorites"
                    terms={favoriteTerms}
                    setTerms={setFavoriteTerms}
                    refreshTerms={loadFavoriteTerms}
                />
            </div>
            <ViewHistoryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                mode="favorites"
            />
        </div>
    );
};

export default Favorites;
