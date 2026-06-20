"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import type { SrsDashboardTermRow } from "@/lib/types/srs";
import { removeTermFromLocalStorage } from "@/lib/term-deletion";

type SrsDashboardTableProps = {
    bucket?: "overdue" | "due_today" | "upcoming";
    initialRows: SrsDashboardTermRow[];
    initialPage: number;
    totalTerms: number;
    totalPages: number;
};

const PAGE_SIZE = 20;

function formatDate(value: string | undefined): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
}

export function SrsDashboardTable({
    bucket,
    initialRows,
    initialPage,
    totalTerms: initialTotalTerms,
    totalPages: initialTotalPages,
}: SrsDashboardTableProps) {
    const [rows, setRows] = React.useState<SrsDashboardTermRow[]>(initialRows);
    const [deletingKey, setDeletingKey] = React.useState<string>("");
    const [page, setPage] = React.useState<number>(initialPage);
    const [totalPages, setTotalPages] = React.useState<number>(initialTotalPages);
    const [totalTerms, setTotalTerms] = React.useState<number>(initialTotalTerms);
    const [isLoadingPage, setIsLoadingPage] = React.useState(false);

    React.useEffect(() => {
        setRows(initialRows);
        setPage(initialPage);
        setTotalTerms(initialTotalTerms);
        setTotalPages(initialTotalPages);
        setDeletingKey("");
    }, [initialRows, initialPage, initialTotalPages, initialTotalTerms]);

    async function loadPage(nextPage: number) {
        if (nextPage < 1 || nextPage > totalPages || isLoadingPage) return;
        setIsLoadingPage(true);

        try {
            const params = new URLSearchParams({
                limit: String(PAGE_SIZE),
                offset: String((nextPage - 1) * PAGE_SIZE),
            });
            if (bucket) {
                params.set("bucket", bucket);
            }

            const response = await fetch(`/api/srs/dashboard?${params.toString()}`);
            const json = (await response.json()) as {
                rows?: SrsDashboardTermRow[];
                total?: number;
                error?: string;
            };

            if (!response.ok) {
                throw new Error(json.error ?? "Failed to load dashboard page");
            }

            setRows(json.rows ?? []);
            setPage(nextPage);
            setTotalTerms(typeof json.total === "number" ? json.total : totalTerms);
            setTotalPages(Math.max(1, Math.ceil((json.total ?? totalTerms) / PAGE_SIZE)));
            setDeletingKey("");
        } catch (error) {
            console.error("Failed to load dashboard page", error);
            window.alert("Could not load the next page. Please try again.");
        } finally {
            setIsLoadingPage(false);
        }
    }

    async function handleDeleteTerm(row: SrsDashboardTermRow) {
        const key = `${row.japanese}\u0000${row.kana}\u0000${row.englishDefinition}`;
        if (deletingKey) return;
        setDeletingKey(key);

        try {
            const response = await fetch("/api/srs/term/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    japanese: row.japanese,
                    kana: row.kana,
                    englishDefinition: row.englishDefinition,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete term");
            }

            removeTermFromLocalStorage({
                japanese: row.japanese,
                kana: row.kana,
                english_definition: row.englishDefinition,
            });
            setRows((current) =>
                current.filter(
                    (item) =>
                        !(
                            item.japanese === row.japanese &&
                            item.kana === row.kana &&
                            item.englishDefinition === row.englishDefinition
                        ),
                ),
            );
        } catch (error) {
            console.error("Failed to delete term", error);
            window.alert("Could not delete this term. Please try again.");
        } finally {
            setDeletingKey("");
        }
    }

    if (rows.length === 0) {
        return (
            <div className="p-6 text-center text-slate-300">
                No terms found in this view.
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 text-sm text-slate-300">
                <div>
                    Showing {rows.length} of {totalTerms} terms
                </div>
                <div className="flex items-center gap-2">
                    <PagerButton
                        disabled={isLoadingPage || page <= 1}
                        label="Previous"
                        onClick={() => void loadPage(page - 1)}
                    />
                    <span className="text-slate-400">
                        Page {page} of {totalPages}
                    </span>
                    <PagerButton
                        disabled={isLoadingPage || page >= totalPages}
                        label="Next"
                        onClick={() => void loadPage(page + 1)}
                    />
                </div>
            </div>

            <div className={isLoadingPage ? "pointer-events-none opacity-70" : ""}>
                <table className="w-full min-w-[1020px] text-sm">
                    <thead className="bg-slate-800 text-slate-200">
                        <tr>
                            <th className="px-3 py-2 text-left">Term</th>
                            <th className="px-3 py-2 text-left">Reading</th>
                            <th className="px-3 py-2 text-left">Meaning</th>
                            <th className="px-3 py-2 text-left">Next Review</th>
                            <th className="px-3 py-2 text-left">Last Review</th>
                            <th className="px-3 py-2 text-right">Stability</th>
                            <th className="px-3 py-2 text-right">Difficulty</th>
                            <th className="px-3 py-2 text-right">Reps</th>
                            <th className="px-3 py-2 text-right">Lapses</th>
                            <th className="px-3 py-2 text-right">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const rowKey = `${row.japanese}\u0000${row.kana}\u0000${row.englishDefinition}`;
                            const isDeleting = deletingKey === rowKey;
                            return (
                                <tr
                                    key={rowKey}
                                    className="border-t border-slate-800 text-slate-100"
                                >
                                    <td className="px-3 py-2 font-semibold">{row.japanese}</td>
                                    <td className="px-3 py-2">{row.kana}</td>
                                    <td className="px-3 py-2 text-slate-300">{row.englishDefinition}</td>
                                    <td className="px-3 py-2">{formatDate(row.due)}</td>
                                    <td className="px-3 py-2">{formatDate(row.lastReview)}</td>
                                    <td className="px-3 py-2 text-right">{row.stability.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">{row.difficulty.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">{row.repetitions}</td>
                                    <td className="px-3 py-2 text-right">{row.lapses}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md p-1 text-red-300 hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                                            onClick={() => void handleDeleteTerm(row)}
                                            disabled={isDeleting || isLoadingPage}
                                            aria-label="Delete term"
                                            title="Delete term"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isLoadingPage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35">
                    <div className="rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 shadow-lg">
                        Loading page...
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function PagerButton({
    disabled,
    label,
    onClick,
}: {
    disabled: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={[
                "rounded-md border px-3 py-1.5 text-sm font-semibold",
                disabled
                    ? "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"
                    : "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700",
            ].join(" ")}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
}
