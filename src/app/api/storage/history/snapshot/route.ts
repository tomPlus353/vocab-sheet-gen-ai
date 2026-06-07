import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getUserStorageSnapshot } from "@/server/storage/relational";

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await getUserStorageSnapshot(userId);
    return NextResponse.json({ historyEntries: snapshot.historyEntries });
}
