import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { deleteUserTermEverywhere } from "@/server/storage/relational";

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const japanese = typeof body.japanese === "string" ? body.japanese : "";
    const kana = typeof body.kana === "string" ? body.kana : "";
    const englishDefinition = typeof body.englishDefinition === "string" ? body.englishDefinition : "";

    if (!japanese || !kana || !englishDefinition) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await deleteUserTermEverywhere(userId, { japanese, kana, englishDefinition });
    return NextResponse.json({ ok: true });
}
