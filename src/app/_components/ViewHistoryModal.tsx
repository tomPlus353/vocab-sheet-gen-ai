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

import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

import { getGameHistory } from "@/lib/utils";

interface ViewHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    historyTermsKey?: string;
    mode?: "history" | "favorites";
}

type vocabObj = Record<string, string | boolean>;

export function ViewHistoryModal({
    open,
    onOpenChange,
    historyTermsKey = "",
    mode = "history",
}: ViewHistoryModalProps) {
    const { toast } = useToast();

    const [terms, setTerms] = useState<vocabObj[]>([]);

    useEffect(() => {
        // Fetch terms from localStorage using the historyTermsKey
        try {
            if (mode === "favorites") {
                const cachedJsonString = localStorage.getItem("favoriteTerms");
                const termsAsJson: vocabObj[] = JSON.parse(
                    cachedJsonString ?? "[]",
                );
                setTerms(termsAsJson);
                return;
            }

            if (!historyTermsKey) {
                if (mode === "history") {
                    setTerms([]);
                    return;
                }
            }
            const storedHistory = getGameHistory(historyTermsKey, true);
            if (storedHistory) {
                const parsedHistory: vocabObj[] = JSON.parse(
                    storedHistory,
                ) as vocabObj[];
                setTerms(parsedHistory);
            } else {
                setTerms([]);
            }
        } catch (e) {
            console.error("Error fetching history terms: ", e);
            toast({
                title: "Error",
                description: "There was an error fetching the history terms.",
                variant: "destructive",
            });
        }
    }, [open, historyTermsKey]);

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
                <div className="text-md flex justify-between font-bold">
                    <span className="text-violet-300/80">
                        Terms: {terms ? terms.length : 0}
                    </span>
                    <span className="text-right text-red-500">
                        Favorites:{" "}
                        {terms ? terms.filter((t) => t.isFavorite).length : 0}
                    </span>
                </div>
                {!terms ? (
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
