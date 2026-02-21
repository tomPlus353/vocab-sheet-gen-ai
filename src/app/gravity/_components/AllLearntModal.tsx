"use client";

import CommonButton from "@/components/common/CommonButton";

type Props = {
    open: boolean;
    onReturnToReader: () => void;
    onContinuePractice: () => void;
};

export function AllLearntModal(props: Props) {
    const { open, onReturnToReader, onContinuePractice } = props;

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-lg rounded-xl border border-green-300/30 bg-slate-900 p-5 text-white shadow-2xl">
                <h3 className="text-xl font-bold text-green-300">All Terms Learnt</h3>
                <p className="mt-2 text-sm text-gray-300">
                    You got every term correct at least twice in a row.
                </p>
                <p className="mt-2 text-sm text-gray-300">
                    Do you want to return to the ereader and read the text now?
                </p>
                <div className="mt-4 flex gap-2">
                    <CommonButton
                        label="Back to Ereader"
                        additionalclasses="mx-0 bg-green-700 hover:bg-green-600"
                        onClick={onReturnToReader}
                    />
                    <CommonButton
                        label="Keep Practicing"
                        additionalclasses="mx-0 bg-slate-700 hover:bg-slate-600"
                        onClick={onContinuePractice}
                    />
                </div>
            </div>
        </div>
    );
}
