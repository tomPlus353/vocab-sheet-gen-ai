import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { isVocabTerm } from "@/lib/utils";
import { upsertUserTermStates } from "@/server/storage/relational";
import type { VocabTerm } from "@/lib/types/vocab";

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const termsRaw = body.terms;
    const terms: VocabTerm[] = Array.isArray(termsRaw)
        ? termsRaw.filter(isVocabTerm).map((term) => ({ ...term }))
        : [];

    await upsertUserTermStates(userId, terms);
    return NextResponse.json({ ok: true, count: terms.length });
}
