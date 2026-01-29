"use client";

import { useState, useEffect, use } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import CommonButton from "@/components/common/CommonButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, ClipboardPaste, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHashedCache, setHashedCache } from "@/lib/utils";

interface ImageTextModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type vocabObj = Record<string, string | boolean>;

export function EditTermsModal({ open, onOpenChange }: ImageTextModalProps) {
    const { toast } = useToast();

    const GLOBAL_FAV_LIST_KEY = "favoriteTerms";

    const [gameVocabJson, setGameVocabJson] = useState<vocabObj[]>([]);

    // const handleSelectFavorite = async () => {
    //     try {
    //         if (setTextboxFunction) setTextboxFunction(text);
    //         setIsCopied(true);
    //         toast({
    //             variant: "success",
    //             description: "Extracted image text pasted.",
    //         });
    //         setTimeout(() => onOpenChange(false), 1000);
    //     } catch (err) {
    //         console.error("Error saving extracted text: ", err);
    //         toast({
    //             variant: "destructive",
    //             title: "Save Failed",
    //             description:
    //                 "Could not paste the extracted text. Try again or copy to clipboard first instead.",
    //         });
    //     }
    // };

    useEffect(() => {
        // Extract gameVocabJson data from localStorage when the modal opens
        if (open) {
            //extract raw text from localStorage
            const activeTextStr = localStorage.getItem("activeText");
            //get cached vocab game data
            const cachedJsonString = getHashedCache(
                "vocabGame" + activeTextStr,
            );
            // parse json string into array
            const termsAsJson: vocabObj[] = JSON.parse(
                cachedJsonString ?? "[]",
            );
            // set terms to state
            setGameVocabJson(termsAsJson);
        }
    }, [open]);

    function handleFavoriteClick(index: number) {
        const updatedTerms = [...gameVocabJson];
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
        setGameVocabJson(updatedTerms);

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
        //cache the request using hash of activeText
        localStorage.setItem(
            GLOBAL_FAV_LIST_KEY,
            JSON.stringify(currentFavorites),
        );
    }

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
                <ScrollArea className="my-2 flex-1 overflow-y-auto rounded-md border">
                    {!gameVocabJson ? (
                        <pre className="font-body whitespace-pre-wrap p-4 text-sm text-foreground text-white">
                            No terms available.
                        </pre>
                    ) : (
                        <div>
                            <ul className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                                {gameVocabJson.map((termObj, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between border-2 border-blue-600/50"
                                    >
                                        <span>{termObj.japanese}</span>
                                        {/* Favorite button */}
                                        <button
                                            className="ml-4 rounded-md px-2 py-1 text-sm text-red-500 hover:bg-slate-800"
                                            onClick={() =>
                                                handleFavoriteClick(index)
                                            }
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
                        </div>
                    )}
                </ScrollArea>
                {/* <DialogFooter></DialogFooter> */}
            </DialogContent>
        </Dialog>
    );
}
