import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { deleteUserHistoryEntry, getUserStorageSnapshot } from "@/server/storage/relational";

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const entryId = typeof body.entryId === "string" ? body.entryId : "";
    if (!entryId) {
        return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
    }

    await deleteUserHistoryEntry(userId, entryId);
    const snapshot = await getUserStorageSnapshot(userId);
    return NextResponse.json(snapshot);
}

