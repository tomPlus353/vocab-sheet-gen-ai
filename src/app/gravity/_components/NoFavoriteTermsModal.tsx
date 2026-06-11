"use client";

import CommonButton from "@/components/common/CommonButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type NoFavoriteTermsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectFavorites: () => void;
    onStudyAllTerms: () => void;
};

export function NoFavoriteTermsModal({
    open,
    onOpenChange,
    onSelectFavorites,
    onStudyAllTerms,
}: NoFavoriteTermsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        No Favorite Terms Yet
                    </DialogTitle>
                    <DialogDescription className="text-slate-300">
                        There are no favorite terms in this set right now.
                        Choose whether you want to pick favorites first or
                        study the full set instead.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-start">
                    <CommonButton
                        label="Select Favorites"
                        additionalclasses="mx-0 min-h-11 bg-indigo-600 text-white hover:bg-indigo-500"
                        onClick={onSelectFavorites}
                    />
                    <CommonButton
                        label="Study All Terms"
                        additionalclasses="mx-0 min-h-11 bg-emerald-700 text-white hover:bg-emerald-600"
                        onClick={onStudyAllTerms}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
