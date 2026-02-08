"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { getAllGameHistories, removeGameHistory } from "@/lib/utils";
import { Trash } from "lucide-react";

type vocabObj = Record<string, string | boolean>;

const History = () => {
    const [gameHistory, setGameHistory] = React.useState<
        Record<string, string>
    >({});
    const router = useRouter();

    React.useEffect(() => {
        // Fetch initial game history from localStorage
        const history = getAllGameHistories();
        if (history) {
            setGameHistory(history);
        }
    }, []);

    const handleGoMatch = (key: string) => {
        try {
            router.push(`/match?history=1&historyTerms=${key}`, undefined);
        } catch (e) {
            console.log("Error pushing to match page: ", e);
        }
    };

    const handleDeleteHistory = (key: string, isKeyHashed = true) => {
        // Remove from local state
        const updatedHistory = { ...gameHistory };
        delete updatedHistory[key];
        setGameHistory(updatedHistory);

        // Remove from localStorage
        removeGameHistory(key, isKeyHashed);
    };

    const getSampleTerms = (terms: vocabObj[]): string => {
        return (
            terms
                .slice(0, 3)
                .map((term) => term.japanese as string)
                .join(", ") + "... "
        );
    };

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            {/* History Flow */}
            <p className="mb-1 font-medium text-slate-100">🕘 History</p>
            <p className="mb-4 text-sm text-slate-400">
                Vocabulary grouped by analyzed text
            </p>

            <div className="space-y-3">
                {Object.entries(gameHistory).length > 0 ? (
                    Object.entries(gameHistory).map(([key, vocab]) => {
                        return (
                            <div
                                key={key}
                                className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-slate-200">
                                            {getSampleTerms(
                                                JSON.parse(vocab) as vocabObj[],
                                            ) ?? "No terms available."}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {
                                                (
                                                    JSON.parse(
                                                        vocab,
                                                    ) as vocabObj[]
                                                ).length
                                            }{" "}
                                            words • Dec 28 2024
                                        </p>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                        <button
                                            className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
                                            onClick={() => handleGoMatch(key)}
                                        >
                                            Study
                                        </button>
                                        <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                            View all
                                        </button>
                                        <button className="group rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
                                            <Trash className="group-hover:hidden" />
                                            <Trash
                                                className="hidden group-hover:block"
                                                fill="red"
                                                onClick={() =>
                                                    handleDeleteHistory(
                                                        key,
                                                        true,
                                                    )
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-slate-500">
                        No history available.
                    </p>
                )}
            </div>
        </div>
    );
};

export default History;
