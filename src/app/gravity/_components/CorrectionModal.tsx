"use client";

import * as React from "react";
import CommonButton from "@/components/common/CommonButton";
import type { VocabTerm } from "@/lib/types/vocab";

type Props = {
    open: boolean;
    activeTerm: VocabTerm | null;
    correctionInput: string;
    correctionError: string;
    onCorrectionInputChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function CorrectionModal(props: Props) {
    const {
        open,
        activeTerm,
        correctionInput,
        correctionError,
        onCorrectionInputChange,
        onSubmit,
    } = props;

    if (!open || !activeTerm) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-xl border border-red-300/30 bg-slate-900 p-5 text-white shadow-2xl">
                <h3 className="text-xl font-bold text-red-300">
                    First mistake
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                    Type the correct Japanese term to resume.
                </p>
                <p className="mt-3 rounded-md bg-slate-800 p-2 text-sm text-amber-100">
                    Clue: {activeTerm.english_definition}
                </p>
                <p className="mt-2 rounded-md border border-red-300/30 bg-red-500/10 p-2 text-sm">
                    Correct term:{" "}
                    <span className="font-bold text-red-200">
                        {activeTerm.japanese}
                    </span>
                </p>
                <p className="mt-2 text-xs text-amber-200/80">
                    Hint: {activeTerm.romanization}
                </p>
                <form className="mt-4 flex flex-col gap-2" onSubmit={onSubmit}>
                    <input
                        autoFocus
                        type="text"
                        className="w-full rounded-md border border-red-400/40 bg-black px-3 py-2 text-white outline-none focus:border-red-400"
                        placeholder="Enter the exact Japanese term"
                        value={correctionInput}
                        onChange={(event) =>
                            onCorrectionInputChange(event.target.value)
                        }
                    />
                    {correctionError && (
                        <p className="text-sm text-red-300">
                            {correctionError}
                        </p>
                    )}
                    <CommonButton
                        type="submit"
                        label="Resume Game"
                        additionalclasses="mx-0 bg-red-600 hover:bg-red-500"
                    />
                </form>
            </div>
        </div>
    );
}
