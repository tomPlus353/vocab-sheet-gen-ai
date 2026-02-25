"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { getAllGameHistories, removeGameHistory } from "@/lib/utils";
import { Eye, Grid2x2Check, Orbit, Trash2 } from "lucide-react";
import { ViewHistoryModal } from "./ViewHistoryModal";
import { ConfirmActionModal } from "@/components/common/modals/ConfirmActionModal";

type vocabObj = Record<string, string | boolean>;

const LAST_PAGINATOR_PAGE_KEY = "lastPaginatorPage";

const History = () => {
    const [gameHistory, setGameHistory] = React.useState<
        Record<string, string>
    >({});
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalTargetKey, setModalTargetKey] = React.useState<string>("");
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [deleteTargetKey, setDeleteTargetKey] = React.useState<string>("");
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
            localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
            router.push(`/match?history=1&historyTerms=${key}`, undefined);
        } catch (e) {
            console.log("Error pushing to match page: ", e);
        }
    };

    const handleGoGravity = (key: string) => {
        try {
            localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
            router.push(`/gravity?history=1&historyTerms=${key}`, undefined);
        } catch (e) {
            console.log("Error pushing to gravity page: ", e);
        }
    };

    const handleOpenTermsModal = (key: string) => {
        setModalTargetKey(key);
        setIsModalOpen(true);
    };

    const handleDeleteHistory = (key: string, isKeyHashed = true) => {
        // Remove from local state
        const updatedHistory = { ...gameHistory };
        delete updatedHistory[key];
        setGameHistory(updatedHistory);

        // Remove from localStorage
        removeGameHistory(key, isKeyHashed);
    };

    const handleOpenDeleteConfirm = (key: string) => {
        setDeleteTargetKey(key);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deleteTargetKey) return;
        handleDeleteHistory(deleteTargetKey, true);
        setIsDeleteConfirmOpen(false);
        setDeleteTargetKey("");
    };

    const getSampleTerms = (terms: vocabObj[]): string => {
        return (
            terms
                .slice(0, 3)
                .map((term) => term.japanese as string)
                .join("、") + "... "
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
                                        <p className="max-w-32 truncate text-sm text-slate-200 md:max-w-40 md:text-base">
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
                                            className="has-tooltip relative rounded border border-slate-700 px-2 py-1 hover:bg-blue-300 hover:text-black"
                                            onClick={() => handleGoMatch(key)}
                                            aria-label="Study with Match"
                                            title="Study with Match"
                                        >
                                            <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                                Study (Match)
                                            </span>
                                            <Grid2x2Check className="mx-auto h-5 w-5"></Grid2x2Check>
                                        </button>
                                        <button
                                            className="has-tooltip relative rounded border border-slate-700 px-2 py-1 hover:bg-blue-300 hover:text-black"
                                            onClick={() => handleGoGravity(key)}
                                            aria-label="Study with Gravity"
                                            title="Study with Gravity"
                                        >
                                            <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                                Study (Gravity)
                                            </span>
                                            <Orbit className="mx-auto h-5 w-5"></Orbit>
                                        </button>
                                        <button
                                            className="has-tooltip relative rounded border border-slate-700 px-2 py-1 hover:bg-blue-300 hover:text-black"
                                            onClick={() =>
                                                handleOpenTermsModal(key)
                                            }
                                            aria-label="View all terms"
                                            title="View all terms"
                                        >
                                            <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                                View all
                                            </span>
                                            <Eye className="mx-auto h-5 w-5" />
                                        </button>
                                        <button
                                            className="has-tooltip group relative rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
                                            aria-label="Delete history item"
                                            title="Delete history item"
                                            onClick={() =>
                                                handleOpenDeleteConfirm(key)
                                            }
                                        >
                                            <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                                Delete
                                            </span>
                                            <Trash2 className="group-hover:hidden" />
                                            <Trash2
                                                className="hidden text-red-500 group-hover:block"
                                                fill="red"
                                            />
                                        </button>
                                        <ViewHistoryModal
                                            open={isModalOpen}
                                            onOpenChange={setIsModalOpen}
                                            historyTermsKey={modalTargetKey}
                                        />
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
            <ConfirmActionModal
                open={isDeleteConfirmOpen}
                title="Delete this history set?"
                description="This removes the selected vocabulary history entry."
                confirmLabel="Delete"
                onOpenChange={setIsDeleteConfirmOpen}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default History;
