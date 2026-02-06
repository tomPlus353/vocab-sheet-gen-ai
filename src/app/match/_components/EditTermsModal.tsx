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
import { getGameHistory, getHashedCache } from "@/lib/utils";

interface ImageTextModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    terms: Record<string, string | boolean>[];
    setTerms: React.Dispatch<
        React.SetStateAction<Record<string, string | boolean>[]>
    >;
}

type vocabObj = Record<string, string | boolean>;

export function EditTermsModal({
    open,
    onOpenChange,
    terms,
    setTerms,
}: ImageTextModalProps) {
    const { toast } = useToast();

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
                    {!terms ? (
                        <pre className="font-body whitespace-pre-wrap p-4 text-sm text-foreground text-white">
                            No terms available.
                        </pre>
                    ) : (
                        <div>
                            <FavoritesList
                                mode="current"
                                terms={terms}
                                setTerms={setTerms}
                            />
                        </div>
                    )}
                </ScrollArea>
                {/* <DialogFooter></DialogFooter> */}
            </DialogContent>
        </Dialog>
    );
}
