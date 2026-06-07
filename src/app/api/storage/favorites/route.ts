import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { isVocabTerm } from "@/lib/utils";
import type { VocabTerm } from "@/lib/types/vocab";
import { replaceUserFavorites, getUserStorageSnapshot } from "@/server/storage/relational";

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await getUserStorageSnapshot(userId);
    return NextResponse.json({ favoriteTerms: snapshot.favoriteTerms });
}

export async function PUT(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const termsRaw = body.favoriteTerms;
    const favoriteTerms: VocabTerm[] = Array.isArray(termsRaw)
        ? termsRaw.filter(isVocabTerm).map((term) => ({
              ...term,
              isFavorite: true,
          }))
    : [];

    await replaceUserFavorites(userId, favoriteTerms);
    return NextResponse.json({ ok: true, favoriteCount: favoriteTerms.length });
}
