import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import type { HistoryEntry } from "@/lib/types/vocab";
import { upsertUserHistoryEntry } from "@/server/storage/relational";

function isHistoryEntry(value: unknown): value is HistoryEntry {
    if (typeof value !== "object" || value === null) return false;
    const entry = value as Record<string, unknown>;
    return (
        typeof entry.id === "string" &&
        typeof entry.title === "string" &&
        (entry.source === "generated" || entry.source === "manual") &&
        typeof entry.createdAt === "string" &&
        Array.isArray(entry.terms)
    );
}

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const entryRaw = body.entry;
    if (!isHistoryEntry(entryRaw)) {
        return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
    }

    await upsertUserHistoryEntry(userId, entryRaw);
    return NextResponse.json({ ok: true, entryId: entryRaw.id });
}
