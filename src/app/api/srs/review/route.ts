import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { isVocabTerm } from "@/lib/utils";
import type { SrsReviewRating } from "@/lib/types/srs";
import { recordUserTermSrsReview } from "@/server/storage/relational";

function isSrsReviewRating(value: unknown): value is SrsReviewRating {
    return (
        value === "again" ||
        value === "hard" ||
        value === "good" ||
        value === "easy"
    );
}

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ ok: true, skipped: true });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const termRaw = body.term;
    const ratingRaw = body.rating;

    if (!isVocabTerm(termRaw) || !isSrsReviewRating(ratingRaw)) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const next = await recordUserTermSrsReview({
        userId,
        term: {
            japanese: termRaw.japanese,
            kana: termRaw.kana,
            english_definition: termRaw.english_definition,
        },
        rating: ratingRaw,
    });

    return NextResponse.json({ ok: true, card: next });
}
