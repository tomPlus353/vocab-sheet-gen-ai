"use client";

import CommonButton from "@/components/common/CommonButton";

type Props = {
    open: boolean;
    message: string;
    onRestart: () => void;
    onReturn: () => void;
};

export function GameOverModal(props: Props) {
    const { open, message, onRestart, onReturn } = props;

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-lg rounded-xl border border-red-300/30 bg-slate-900 p-5 shadow-2xl">
                <h3 className="text-xl font-bold text-red-300">Game Over</h3>
                <p className="mt-2 text-sm text-slate-300">{message}</p>
                <p className="mt-2 text-sm text-slate-400">
                    Restart this gravity set or head back to choose your next
                    review.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <CommonButton
                        label="Restart Gravity"
                        additionalclasses="mx-0"
                        onClick={onRestart}
                    />
                    <CommonButton
                        label="Back to Reader"
                        additionalclasses="mx-0 bg-slate-700/80 hover:bg-slate-600 hover:text-white"
                        onClick={onReturn}
                    />
                </div>
            </div>
        </div>
    );
}
