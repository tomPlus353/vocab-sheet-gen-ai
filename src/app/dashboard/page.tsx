import Link from "next/link";

import SectionHeader from "@/components/common/SectionHeader";
import { auth } from "@/server/auth";
import {
    getSrsDashboardTermCount,
    getSrsDashboardSummary,
    getSrsDashboardTerms,
} from "@/server/storage/relational";
import type { SrsDashboardBucket } from "@/lib/types/srs";
import { SrsBucketStudyButton } from "./_components/SrsBucketStudyButton";
import { SrsDashboardTable } from "./_components/SrsDashboardTable";

type DashboardPageProps = {
    searchParams?: Promise<{
        bucket?: string;
        page?: string;
    }>;
};

const PAGE_SIZE = 20;

function parseBucket(value: string | undefined): SrsDashboardBucket | undefined {
    if (value === "overdue" || value === "due_today" || value === "upcoming") {
        return value;
    }
    return undefined;
}

function parsePage(value: string | undefined): number {
    const parsed = Number(value ?? "1");
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function buildDashboardHref(bucket: SrsDashboardBucket | undefined, page: number): string {
    const params = new URLSearchParams();
    if (bucket) {
        params.set("bucket", bucket);
    }
    if (page > 1) {
        params.set("page", String(page));
    }
    const query = params.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
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

    const resolvedSearchParams = await searchParams;
    const bucket = parseBucket(resolvedSearchParams?.bucket);
    const requestedPage = parsePage(resolvedSearchParams?.page);
    const [summary, totalTerms] = await Promise.all([
        getSrsDashboardSummary(userId),
        getSrsDashboardTermCount(userId, bucket),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalTerms / PAGE_SIZE));
    const currentPage = Math.min(requestedPage, totalPages);
    const offset = (currentPage - 1) * PAGE_SIZE;
    const list = await getSrsDashboardTerms(userId, { bucket, limit: PAGE_SIZE, offset });

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
                <BucketLink href={buildDashboardHref(undefined, 1)} active={!bucket} label="All" />
                <BucketLink
                    href={buildDashboardHref("overdue", 1)}
                    active={bucket === "overdue"}
                    label="Overdue"
                />
                <BucketLink
                    href={buildDashboardHref("due_today", 1)}
                    active={bucket === "due_today"}
                    label="Due Today"
                />
                <BucketLink
                    href={buildDashboardHref("upcoming", 1)}
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
                    <SrsDashboardTable
                        bucket={bucket}
                        initialPage={currentPage}
                        initialRows={rows}
                        totalTerms={totalTerms}
                        totalPages={totalPages}
                    />
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
