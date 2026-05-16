import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import type { SrsDashboardBucket } from "@/lib/types/srs";
import {
    getSrsDashboardSummary,
    getSrsDashboardTerms,
} from "@/server/storage/relational";

function parseBucket(value: string | null): SrsDashboardBucket | undefined {
    if (value === "overdue" || value === "due_today" || value === "upcoming") {
        return value;
    }
    return undefined;
}

export async function GET(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const bucket = parseBucket(url.searchParams.get("bucket"));
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const offset = Number(url.searchParams.get("offset") ?? "0");

    const [summary, list] = await Promise.all([
        getSrsDashboardSummary(userId),
        getSrsDashboardTerms(userId, { bucket, limit, offset }),
    ]);

    return NextResponse.json({
        summary,
        rows: list.rows,
        total: list.total,
        bucket: bucket ?? "all",
    });
}
