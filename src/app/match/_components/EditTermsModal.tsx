"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { FavoritesList } from "@/components/common/FavoritesList";
import type { VocabTerm } from "@/lib/types/vocab";

interface EditTermsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    terms: VocabTerm[];
    setTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
}

export function EditTermsModal({
    open,
    onOpenChange,
    terms,
    setTerms,
}: EditTermsModalProps) {
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
                        mode="history"
                        terms={terms}
                        setTerms={setTerms}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
