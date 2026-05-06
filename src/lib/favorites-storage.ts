"use client";

import type { VocabTerm } from "@/lib/types/vocab";
import { isVocabTerm } from "@/lib/utils";
import { applyLocalTermStatesToTerms } from "@/lib/term-state-storage";

const FAVORITES_KEY = "favoriteTerms";

export function getLocalFavoriteTerms(): VocabTerm[] {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return applyLocalTermStatesToTerms(
            parsed
                .filter(isVocabTerm)
                .map((term) => ({ ...term, isFavorite: true })),
        );
    } catch {
        return [];
    }
}

export function setLocalFavoriteTerms(terms: VocabTerm[]): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(terms.map((term) => ({ ...term, isFavorite: true }))),
    );
}

export async function persistFavoriteTermsBestEffort(terms: VocabTerm[]): Promise<void> {
    try {
        await fetch("/api/storage/favorites", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favoriteTerms: terms }),
        });
    } catch {
        // ignore network errors; anonymous users will not be authorized anyway
    }
}

export function setFavoriteTerms(terms: VocabTerm[]): void {
    setLocalFavoriteTerms(terms);
    void persistFavoriteTermsBestEffort(terms);
}
