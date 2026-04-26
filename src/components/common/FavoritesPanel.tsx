"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    ArrowRight,
    Eye,
    Grid2x2Check,
    Orbit,
    RefreshCcw,
} from "lucide-react";

import { FavoritesList } from "@/components/common/FavoritesList";
import CommonButton from "@/components/common/CommonButton";
import { HanIcon } from "@/components/icons/HanIcon";
import { ViewHistoryModal } from "@/app/_components/ViewHistoryModal";

import type { VocabTerm } from "@/lib/types/vocab";
import { isVocabTerm } from "@/lib/utils";

const LAST_PAGINATOR_PAGE_KEY = "lastPaginatorPage";

export function FavoritesPanel() {
    const ACTION_BUTTON_CLASSES =
        "has-tooltip relative rounded border border-blue-100/20 bg-blue-500/50 px-2 py-1 hover:bg-blue-300 hover:text-black";
    const [favoriteTerms, setFavoriteTerms] = React.useState<VocabTerm[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const loadFavoriteTerms = React.useCallback(() => {
        const cachedJsonString = localStorage.getItem("favoriteTerms");
        try {
            const parsedTerms: unknown = JSON.parse(cachedJsonString ?? "[]");
            if (!Array.isArray(parsedTerms)) {
                setFavoriteTerms([]);
                return;
            }

            const termsAsJson = parsedTerms.filter(isVocabTerm);
            setFavoriteTerms(
                termsAsJson.filter((term) => term.isFavorite === true),
            );
        } catch (error) {
            console.error(
                "Error parsing favorite terms from localStorage: ",
                error,
            );
            setFavoriteTerms([]);
        }
    }, []);

    React.useEffect(() => {
        loadFavoriteTerms();
    }, [loadFavoriteTerms]);

    function handleGoMatch() {
        localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
        router.push("/match?favorites=1", undefined);
    }

    function handleGoGravity() {
        localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
        router.push("/gravity?favorites=1", undefined);
    }

    function handleGoKanji() {
        localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
        router.push("/kanji?favorites=1", undefined);
    }

    function handleOpenTermsModal() {
        setIsModalOpen(true);
    }

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="mb-1 font-medium text-slate-100">
                        ⭐ Favorites
                    </p>
                    <p className="text-sm text-slate-400">
                        Starred terms saved locally for quick review
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    {pathname !== "/favorites" ? (
                        <CommonButton
                            additionalclasses="mx-0 bg-slate-700 hover:bg-slate-600"
                            onClick={() => router.push("/favorites")}
                        >
                            <span className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Open page
                            </span>
                        </CommonButton>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-2 text-xs sm:flex-nowrap">
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
                            onClick={handleGoKanji}
                            aria-label="Study with Kanji"
                            title="Study with Kanji"
                        >
                            <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                Study (Kanji)
                            </span>
                            <HanIcon className="h-4 w-4" />
                        </button>
                        <button
                            className={ACTION_BUTTON_CLASSES}
                            onClick={handleOpenTermsModal}
                            aria-label="View all favorite terms"
                            title="View all favorite terms"
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
            </div>

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
}

