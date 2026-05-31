"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import type { SrsDashboardTermRow } from "@/lib/types/srs";
import { removeTermFromLocalStorage } from "@/lib/term-deletion";

type SrsDashboardTableProps = {
    initialRows: SrsDashboardTermRow[];
};

function formatDate(value: string | undefined): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
}

export function SrsDashboardTable({ initialRows }: SrsDashboardTableProps) {
    const [rows, setRows] = React.useState<SrsDashboardTermRow[]>(initialRows);
    const [deletingKey, setDeletingKey] = React.useState<string>("");

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
                                    disabled={isDeleting}
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
    );
}
