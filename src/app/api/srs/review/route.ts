import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { isVocabTerm } from "@/lib/utils";
import type { SrsPromptType, SrsReviewRating } from "@/lib/types/srs";
import { recordUserTermSrsReview } from "@/server/storage/relational";
import { isSrsPromptType } from "@/lib/srs-prompt";

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
    const promptTypeRaw = body.promptType;

    if (!isVocabTerm(termRaw) || !isSrsReviewRating(ratingRaw)) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const promptType: SrsPromptType | undefined = isSrsPromptType(promptTypeRaw)
        ? promptTypeRaw
        : undefined;

    try {
        const next = await recordUserTermSrsReview({
            userId,
            term: {
                japanese: termRaw.japanese,
                kana: termRaw.kana,
                english_definition: termRaw.english_definition,
            },
            rating: ratingRaw,
            promptType,
        });

        return NextResponse.json({ ok: true, card: next });
    } catch (error) {
        console.error("Failed to record SRS review", {
            error,
            term: {
                japanese: termRaw.japanese,
                kana: termRaw.kana,
                english_definition: termRaw.english_definition,
            },
            rating: ratingRaw,
            promptType,
        });

        return NextResponse.json(
            {
                error: "Failed to record SRS review",
                detail:
                    error instanceof Error
                        ? error.message
                        : "Unknown server error",
            },
            { status: 500 },
        );
    }
}
