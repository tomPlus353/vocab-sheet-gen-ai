import type { HistoryEntry, HistoryEntrySource, VocabTerm } from "@/lib/types/vocab";
import { isVocabTerm } from "@/lib/utils";

function isHistoryEntrySource(value: unknown): value is HistoryEntrySource {
    return value === "generated" || value === "manual";
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
    if (typeof value !== "object" || value === null) return false;
    const entry = value as Record<string, unknown>;
    return (
        typeof entry.id === "string" &&
        typeof entry.title === "string" &&
        isHistoryEntrySource(entry.source) &&
        typeof entry.createdAt === "string" &&
        Array.isArray(entry.terms)
    );
}

function sanitizeVocabTerm(term: VocabTerm): VocabTerm {
    const next: VocabTerm = {
        japanese: term.japanese,
        kana: term.kana,
        english_definition: term.english_definition,
    };

    if (term.example_sentences) next.example_sentences = term.example_sentences;
    if (typeof term.type === "string") next.type = term.type;

    // User-scoped fields: keep them in localStorage for current UI, but do not store them in Term DB rows.
    if (typeof term.isFavorite === "boolean") next.isFavorite = term.isFavorite;
    if (typeof term.gravity_score === "number") next.gravity_score = term.gravity_score;
    if (typeof term.gravity_reading_score === "number") next.gravity_reading_score = term.gravity_reading_score;
    if (typeof term.isLearnt === "boolean") next.isLearnt = term.isLearnt;

    return next;
}

export function parseFavoriteTermsRaw(raw: unknown): VocabTerm[] {
    if (typeof raw !== "string" || !raw.trim()) return [];
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isVocabTerm).map((term) => ({ ...sanitizeVocabTerm(term), isFavorite: true }));
    } catch {
        return [];
    }
}

export function parseHistoryEntriesRaw(raw: unknown): HistoryEntry[] {
    if (typeof raw !== "string" || !raw.trim()) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw) as unknown;
    } catch {
        return [];
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return [];

    const entriesObj = parsed as Record<string, unknown>;
    const entries: HistoryEntry[] = [];

    for (const [id, value] of Object.entries(entriesObj)) {
        if (!value) continue;
        if (isHistoryEntry(value)) {
            entries.push({
                ...value,
                id,
                title: value.title.trim() || "Untitled history",
                terms: value.terms.filter(isVocabTerm).map((term) => sanitizeVocabTerm(term)),
            });
            continue;
        }

        if (typeof value === "string") {
            try {
                const termsParsed = JSON.parse(value) as unknown;
                if (!Array.isArray(termsParsed)) continue;
                const terms = termsParsed.filter(isVocabTerm).map((term) => sanitizeVocabTerm(term));
                entries.push({
                    id,
                    title: terms
                        .slice(0, 3)
                        .map((term) => term.japanese.trim())
                        .filter(Boolean)
                        .join("、") || "Untitled history",
                    source: "generated",
                    createdAt: new Date().toISOString(),
                    terms,
                });
            } catch {
                continue;
            }
        }
    }

    entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return entries;
}

