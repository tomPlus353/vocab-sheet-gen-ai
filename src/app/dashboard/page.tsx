import Link from "next/link";

import SectionHeader from "@/components/common/SectionHeader";
import { auth } from "@/server/auth";
import {
    getSrsDashboardSummary,
    getSrsDashboardTerms,
} from "@/server/storage/relational";
import type { SrsDashboardBucket } from "@/lib/types/srs";
import { SrsBucketStudyButton } from "./_components/SrsBucketStudyButton";

type DashboardPageProps = {
    searchParams?: {
        bucket?: string;
    };
};

function parseBucket(value: string | undefined): SrsDashboardBucket | undefined {
    if (value === "overdue" || value === "due_today" || value === "upcoming") {
        return value;
    }
    return undefined;
}

function formatDate(value: string | undefined): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
}

const bucketLabel: Record<SrsDashboardBucket, string> = {
    overdue: "Overdue",
    due_today: "Due Today",
    upcoming: "Upcoming",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return (
            <div className="mx-2">
                <SectionHeader title="SRS Dashboard" />
                <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-700 bg-slate-900 p-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-100">Sign in to use SRS tracking</h2>
                    <p className="mt-2 text-slate-300">
                        Long-term review scheduling is currently available for logged-in users only.
                    </p>
                    <Link
                        href="/login"
                        className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const bucket = parseBucket(searchParams?.bucket);
    const [summary, list] = await Promise.all([
        getSrsDashboardSummary(userId),
        getSrsDashboardTerms(userId, { bucket, limit: 200, offset: 0 }),
    ]);

    const rows = list.rows;

    return (
        <div className="mx-2">
            <SectionHeader title="SRS Dashboard" />
            <div className="mx-auto mt-4 grid w-full max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryCard label="Overdue" value={summary.overdue} />
                <SummaryCard label="Due Today" value={summary.dueToday} />
                <SummaryCard label="Upcoming" value={summary.upcoming} />
                <SummaryCard label="Tracked" value={summary.totalTracked} />
            </div>

            <div className="mx-auto mt-6 flex w-full max-w-6xl flex-wrap gap-2">
                <BucketLink href="/dashboard" active={!bucket} label="All" />
                <BucketLink
                    href="/dashboard?bucket=overdue"
                    active={bucket === "overdue"}
                    label="Overdue"
                />
                <BucketLink
                    href="/dashboard?bucket=due_today"
                    active={bucket === "due_today"}
                    label="Due Today"
                />
                <BucketLink
                    href="/dashboard?bucket=upcoming"
                    active={bucket === "upcoming"}
                    label="Upcoming"
                />
            </div>
            {bucket ? (
                <div className="mx-auto mt-4 flex w-full max-w-6xl">
                    <SrsBucketStudyButton bucket={bucket} />
                </div>
            ) : null}

            <div className="mx-auto mt-4 w-full max-w-6xl overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
                {rows.length === 0 ? (
                    <div className="p-6 text-center text-slate-300">
                        {bucket
                            ? `No ${bucketLabel[bucket].toLowerCase()} terms yet.`
                            : "No SRS data yet. Play gravity while logged in to start tracking long-term reviews."}
                    </div>
                ) : (
                    <table className="w-full min-w-[960px] text-sm">
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
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={`${row.japanese}\u0000${row.kana}\u0000${row.englishDefinition}`} className="border-t border-slate-800 text-slate-100">
                                    <td className="px-3 py-2 font-semibold">{row.japanese}</td>
                                    <td className="px-3 py-2">{row.kana}</td>
                                    <td className="px-3 py-2 text-slate-300">{row.englishDefinition}</td>
                                    <td className="px-3 py-2">{formatDate(row.due)}</td>
                                    <td className="px-3 py-2">{formatDate(row.lastReview)}</td>
                                    <td className="px-3 py-2 text-right">{row.stability.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">{row.difficulty.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">{row.repetitions}</td>
                                    <td className="px-3 py-2 text-right">{row.lapses}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
            <div className="mt-1 text-3xl font-bold text-slate-100">{value}</div>
        </div>
    );
}

function BucketLink({
    href,
    active,
    label,
}: {
    href: string;
    active: boolean;
    label: string;
}) {
    return (
        <Link
            href={href}
            className={[
                "rounded-lg border px-3 py-2 text-sm font-semibold",
                active
                    ? "border-blue-400 bg-blue-500/30 text-blue-100"
                    : "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700",
            ].join(" ")}
        >
            {label}
        </Link>
    );
}
