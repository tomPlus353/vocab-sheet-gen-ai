"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { FavoritesList } from "@/components/common/FavoritesList";
import { StudyFavoritesButton } from "@/components/common/StudyFavoritesButton";
import type { VocabTerm } from "@/lib/types/vocab";

interface EditTermsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    terms: VocabTerm[];
    setTerms: React.Dispatch<React.SetStateAction<VocabTerm[]>>;
    mode?: "favorites" | "history";
    onStudyFavorites?: () => void;
}

export function EditTermsModal({
    open,
    onOpenChange,
    terms,
    setTerms,
    mode = "history",
    onStudyFavorites,
}: EditTermsModalProps) {
    const favoriteCount = terms ? terms.filter((t) => t.isFavorite).length : 0;

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
                            onClick={onStudyFavorites}
                        />
                    ) : null}
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
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
