"use client";

import CommonButton from "@/components/common/CommonButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { KanjiGameTerm } from "@/lib/types/vocab";

type Props = {
    loadedTerms: KanjiGameTerm[];
    open: boolean;
    returnTargetLabel: "Ereader" | "Home";
    onBackToReader: () => void;
    onOpenChange: (open: boolean) => void;
    onStartGame: () => void;
    onStartPractice: () => void;
};

export function KanjiStudyConfirmModal(props: Props) {
    const {
        loadedTerms,
        open,
        returnTargetLabel,
        onBackToReader,
        onOpenChange,
        onStartGame,
        onStartPractice,
    } = props;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 text-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Study These Kanji?</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        Review the extracted kanji, then choose how you want to study them.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                    {loadedTerms.map((term) => (
                        <div
                            key={term.japanese}
                            className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
                        >
                            <div className="flex items-center gap-3">
                                <span className="rounded-md bg-amber-400/20 px-3 py-1 text-xl font-bold text-amber-100">
                                    {term.japanese}
                                </span>
                                <div>
                                    <p className="text-sm text-slate-200">
                                        {term.kana}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {term.english_definition}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                                {term.support_words
                                    .map((word) => word.word)
                                    .join(" / ")}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    <CommonButton onClick={onBackToReader} additionalclasses="mx-0">
                        Back to {returnTargetLabel}
                    </CommonButton>
                    <CommonButton
                        onClick={onStartPractice}
                        additionalclasses="mx-0 bg-emerald-600 text-white hover:bg-emerald-400"
                    >
                        Start Practice Run
                    </CommonButton>
                    <CommonButton
                        onClick={onStartGame}
                        additionalclasses="mx-0 bg-blue-600 text-white hover:bg-blue-400"
                    >
                        Start Challenge Run
                    </CommonButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
