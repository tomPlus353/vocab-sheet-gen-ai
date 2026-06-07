import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db.userHistoryEntry.findMany({
        where: { userId },
        select: { entryId: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entryIds: rows.map((row) => row.entryId) });
}
