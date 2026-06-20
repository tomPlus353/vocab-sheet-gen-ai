"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    // DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { FavoritesList } from "@/components/common/FavoritesList";
import { StudyFavoritesButton } from "@/components/common/StudyFavoritesButton";

import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

import { getGameHistoryEntry } from "@/lib/utils";
import {
    fetchRemoteHistoryEntryByIdBestEffort,
    loadFavoriteTermsBestEffort,
} from "@/lib/storage-sync";

import type { VocabTerm } from "@/lib/types/vocab";
interface ViewHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    historyTermsKey?: string;
    mode?: "history" | "favorites";
}

export function ViewHistoryModal({
    open,
    onOpenChange,
    historyTermsKey = "",
    mode = "history",
}: ViewHistoryModalProps) {
    const { toast } = useToast();

    const [terms, setTerms] = useState<VocabTerm[]>([]);
    const [isLoadingTerms, setIsLoadingTerms] = useState(false);
    const favoriteCount = terms ? terms.filter((t) => t.isFavorite).length : 0;

    useEffect(() => {
        let cancelled = false;

        async function loadTerms() {
            setIsLoadingTerms(true);

            try {
                if (mode === "favorites") {
                    const favoriteTerms = await loadFavoriteTermsBestEffort();
                    if (!cancelled) {
                        setTerms(favoriteTerms.filter((term) => term.isFavorite));
                    }
                    return;
                }

                // Fetch terms from localStorage using the historyTermsKey
                if (!historyTermsKey) {
                    if (mode === "history") {
                        return;
                    }
                }
                const storageMode =
                    typeof localStorage !== "undefined"
                        ? localStorage.getItem("storageMode")
                        : null;
                const remoteHistory = await fetchRemoteHistoryEntryByIdBestEffort(
                    historyTermsKey,
                );
                if (remoteHistory && !cancelled) {
                    setTerms(remoteHistory.terms);
                    return;
                }

                if (storageMode === "server") {
                    if (!cancelled) {
                        setTerms([]);
                        toast({
                            title: "History unavailable",
                            description:
                                "Could not load the latest server copy of this history set.",
                            variant: "destructive",
                        });
                    }
                    return;
                }

                const storedHistory = getGameHistoryEntry(historyTermsKey, true);
                if (storedHistory && !cancelled) {
                    setTerms(storedHistory.terms);
                }
            } catch (e) {
                console.error("Error fetching history terms: ", e);
                toast({
                    title: "Error",
                    description: "There was an error fetching the history terms.",
                    variant: "destructive",
                });
            } finally {
                if (!cancelled) {
                    setIsLoadingTerms(false);
                }
            }
        }

        void loadTerms();

        return () => {
            cancelled = true;
        };
    }, [open, historyTermsKey, mode, toast]);

    useEffect(() => {
        if (!open) {
            setIsLoadingTerms(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[80svh] flex-col bg-slate-900 text-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">
                        Select Favorite Terms for Later Study
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                        Please review the terms below. <br />
                        You can select or deselect terms that you want to focus
                        on later. <br />
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 border-b border-slate-700/70 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-violet-200">
                            Terms: {terms ? terms.length : 0}
                        </span>
                        <span className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-red-300">
                            Favorites: {favoriteCount}
                        </span>
                    </div>
                    {mode === "history" ? (
                        <StudyFavoritesButton
                            favoriteCount={favoriteCount}
                            historyTermsKey={historyTermsKey}
                        />
                    ) : null}
                </div>
                {isLoadingTerms ? (
                    <pre className="font-body whitespace-pre-wrap p-4 text-sm text-foreground text-white">
                        Loading terms...
                    </pre>
                ) : !terms ? (
                    <pre className="font-body whitespace-pre-wrap p-4 text-sm text-foreground text-white">
                        No terms available.
                    </pre>
                ) : (
                    <FavoritesList
                        mode={mode}
                        terms={terms}
                        setTerms={setTerms}
                        historyTermsKey={historyTermsKey}
                    />
                )}

                {/* <DialogFooter></DialogFooter> */}
            </DialogContent>
        </Dialog>
    );
}
