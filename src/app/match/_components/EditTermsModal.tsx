"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    // DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { FavoritesList } from "@/components/common/FavoritesList";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useToast } from "@/hooks/use-toast";
import { getHashedCache, setHashedCache } from "@/lib/utils";

interface ImageTextModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type vocabObj = Record<string, string | boolean>;

export function EditTermsModal({ open, onOpenChange }: ImageTextModalProps) {
    const { toast } = useToast();

    const [gameVocabJson, setGameVocabJson] = useState<vocabObj[]>([]);

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
                            <FavoritesList
                                mode="current"
                                terms={gameVocabJson}
                                setTerms={setGameVocabJson}
                            />
                        </div>
                    )}
                </ScrollArea>
                {/* <DialogFooter></DialogFooter> */}
            </DialogContent>
        </Dialog>
    );
}
