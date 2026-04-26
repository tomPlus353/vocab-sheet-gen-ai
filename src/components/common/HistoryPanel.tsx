"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    ArrowRight,
    Eye,
    Grid2x2Check,
    Orbit,
    Plus,
    Trash2,
} from "lucide-react";

import { HanIcon } from "@/components/icons/HanIcon";
import { useToast } from "@/hooks/use-toast";
import { parseManualHistoryTerms } from "@/lib/history-import";
import type { HistoryEntry } from "@/lib/types/vocab";
import {
    createManualGameHistory,
    getAllGameHistoryEntries,
    removeGameHistory,
} from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ConfirmActionModal } from "@/components/common/modals/ConfirmActionModal";
import CommonButton from "@/components/common/CommonButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ViewHistoryModal } from "@/app/_components/ViewHistoryModal";

const LAST_PAGINATOR_PAGE_KEY = "lastPaginatorPage";

function formatHistoryDate(createdAt: string): string {
    const parsedDate = new Date(createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getSampleTerms(entry: HistoryEntry): string {
    const sample = entry.terms
        .slice(0, 3)
        .map((term) => term.japanese)
        .join("、");

    return sample ? `${sample}...` : "No terms available.";
}

type ManualHistoryImportModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (title: string, rawInput: string) => void;
};

function ManualHistoryImportModal(props: ManualHistoryImportModalProps) {
    const { open, onOpenChange, onImport } = props;
    const [title, setTitle] = React.useState("");
    const [rawInput, setRawInput] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");

    function resetForm() {
        setTitle("");
        setRawInput("");
        setErrorMessage("");
    }

    function handleOpenChange(nextOpen: boolean) {
        onOpenChange(nextOpen);
        if (!nextOpen) {
            resetForm();
        }
    }

    function handleSave() {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setErrorMessage("Enter a title for this history set.");
            return;
        }

        try {
            parseManualHistoryTerms(rawInput);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Could not parse the pasted history content.",
            );
            return;
        }

        onImport(trimmedTitle, rawInput);
        resetForm();
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-slate-900 text-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Manual History</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        Paste vocabulary rows in CSV or TSV format with headers
                        such as <code>japanese</code>, <code>kana</code>, and{" "}
                        <code>english_definition</code>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-200">
                        Title
                    </label>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Business interview set"
                        className="w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-white outline-none focus:border-blue-400"
                    />
                    <label className="block text-sm font-medium text-slate-200">
                        CSV or TSV content
                    </label>
                    <textarea
                        value={rawInput}
                        onChange={(event) => setRawInput(event.target.value)}
                        placeholder={`japanese,kana,english_definition\n会議,かいぎ,meeting\n提案,ていあん,proposal`}
                        className="min-h-64 w-full rounded-md border border-slate-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-blue-400"
                    />
                    {errorMessage ? (
                        <p className="text-sm text-red-300">{errorMessage}</p>
                    ) : null}
                </div>
                <DialogFooter>
                    <CommonButton
                        label="Cancel"
                        additionalclasses="mx-0 bg-slate-700 hover:bg-slate-600"
                        onClick={() => handleOpenChange(false)}
                    />
                    <CommonButton
                        label="Save history"
                        additionalclasses="mx-0"
                        onClick={handleSave}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function HistoryPanel() {
    const ACTION_BUTTON_CLASSES =
        "has-tooltip relative rounded border border-blue-100/20 bg-blue-500/50 px-2 py-1 hover:bg-blue-300 hover:text-black";
    const [historyEntries, setHistoryEntries] = React.useState<HistoryEntry[]>(
        [],
    );
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalTargetKey, setModalTargetKey] = React.useState<string>("");
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [deleteTargetKey, setDeleteTargetKey] = React.useState<string>("");
    const [isImportOpen, setIsImportOpen] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    const loadHistoryEntries = React.useCallback(() => {
        const entries = Object.values(getAllGameHistoryEntries()).sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
        );
        setHistoryEntries(entries);
    }, []);

    React.useEffect(() => {
        loadHistoryEntries();
    }, [loadHistoryEntries]);

    function handleGoMatch(key: string) {
        localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
        router.push(`/match?history=1&historyTerms=${key}`, undefined);
    }

    function handleGoGravity(key: string) {
        localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
        router.push(`/gravity?history=1&historyTerms=${key}`, undefined);
    }

    function handleGoKanji(key: string) {
        localStorage.setItem(LAST_PAGINATOR_PAGE_KEY, "0");
        router.push(`/kanji?history=1&historyTerms=${key}`, undefined);
    }

    function handleOpenTermsModal(key: string) {
        setModalTargetKey(key);
        setIsModalOpen(true);
    }

    function handleOpenDeleteConfirm(key: string) {
        setDeleteTargetKey(key);
        setIsDeleteConfirmOpen(true);
    }

    function handleConfirmDelete() {
        if (!deleteTargetKey) return;
        removeGameHistory(deleteTargetKey, true);
        setDeleteTargetKey("");
        loadHistoryEntries();
    }

    function handleImportHistory(title: string, rawInput: string) {
        try {
            const terms = parseManualHistoryTerms(rawInput);
            createManualGameHistory(title, terms);
            setIsImportOpen(false);
            loadHistoryEntries();
            toast({
                variant: "success",
                description: `Saved ${terms.length} terms to history.`,
                duration: 2500,
            });
        } catch (error) {
            toast({
                title: "Import failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not import the pasted history content.",
                variant: "destructive",
                duration: 4000,
            });
        }
    }

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="mb-1 font-medium text-slate-100">
                        🕘 History
                    </p>
                    <p className="text-sm text-slate-400">
                        Vocabulary grouped by analyzed text or manual imports
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {pathname !== "/history" ? (
                        <CommonButton
                            additionalclasses="mx-0 bg-slate-700 hover:bg-slate-600"
                            onClick={() => router.push("/history")}
                        >
                            <span className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Open page
                            </span>
                        </CommonButton>
                    ) : null}
                    <CommonButton
                        additionalclasses="mx-0"
                        onClick={() => setIsImportOpen(true)}
                    >
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New history
                        </span>
                    </CommonButton>
                </div>
            </div>

            <ScrollArea className="my-2 max-h-96 flex-1 overflow-y-auto rounded-md border">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                    {historyEntries.length > 0 ? (
                        historyEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="mb-1 rounded-lg border border-slate-800 bg-black p-3 last:mb-0"
                            >
                                <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-100 md:text-base">
                                            {entry.title}
                                        </p>
                                        <p className="truncate text-sm text-slate-300">
                                            {getSampleTerms(entry)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {entry.terms.length} words •{" "}
                                            {formatHistoryDate(entry.createdAt)}{" "}
                                            • {entry.source}
                                        </p>
                                    </div>
                                    <div className="flex w-full flex-wrap justify-end gap-2 text-xs sm:w-auto sm:flex-nowrap">
                                        <button
                                            className={ACTION_BUTTON_CLASSES}
                                            onClick={() =>
                                                handleGoMatch(entry.id)
                                            }
                                            aria-label="Study with Match"
                                            title="Study with Match"
                                        >
                                            <span className="tooltip absolute bottom-full right-0 mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                                Study (Match)
                                            </span>
                                            <Grid2x2Check className="mx-auto h-5 w-5" />
                                        </button>
                                        <button
                                            className={ACTION_BUTTON_CLASSES}
                                            onClick={() =>
                                                handleGoGravity(entry.id)
                                            }
                                            aria-label="Study with Gravity"
                                            title="Study with Gravity"
                                        >
                                            <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                                Study (Gravity)
                                            </span>
                                            <Orbit className="mx-auto h-5 w-5" />
                                        </button>
                                        <button
                                            className={ACTION_BUTTON_CLASSES}
                                            onClick={() =>
                                                handleGoKanji(entry.id)
                                            }
                                            aria-label="Study with Kanji"
                                            title="Study with Kanji"
                                        >
                                            <span className="tooltip absolute bottom-full right-0 -mt-8 rounded bg-black p-1 text-sm text-white shadow-lg">
                                                Study (Kanji)
                                            </span>
                                            <HanIcon className="mx-auto h-5 w-5" />
                                        </button>
                                        <button
                                            className={ACTION_BUTTON_CLASSES}
                                            onClick={() =>
                                                handleOpenTermsModal(entry.id)
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
                                                handleOpenDeleteConfirm(
                                                    entry.id,
                                                )
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
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500">
                            No history available.
                        </p>
                    )}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            <ViewHistoryModal
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) {
                        loadHistoryEntries();
                    }
                }}
                historyTermsKey={modalTargetKey}
            />
            <ConfirmActionModal
                open={isDeleteConfirmOpen}
                title="Delete this history set?"
                description="This removes the selected vocabulary history entry."
                confirmLabel="Delete"
                onOpenChange={setIsDeleteConfirmOpen}
                onConfirm={handleConfirmDelete}
            />
            <ManualHistoryImportModal
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onImport={handleImportHistory}
            />
        </div>
    );
}
