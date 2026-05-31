import type { VocabTerm } from "@/lib/types/vocab";

const FAVORITES_KEY = "favoriteTerms";
const TERM_STATES_KEY = "termStates";
const ACTIVE_TEXT_KEY = "activeText";
const HISTORY_TERMS_KEY = "historyTerms";

type TermIdentity = Pick<VocabTerm, "japanese" | "kana" | "english_definition">;

type HistoryEntryLike = {
    id: string;
    title: string;
    source: "generated" | "manual";
    createdAt: string;
    terms: VocabTerm[];
};

function matchesTerm(term: Pick<VocabTerm, "japanese" | "kana" | "english_definition">, target: TermIdentity): boolean {
    return (
        term.japanese === target.japanese &&
        term.kana === target.kana &&
        term.english_definition === target.english_definition
    );
}

function parseJson<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function removeTermFromLocalStorage(target: TermIdentity): void {
    if (typeof localStorage === "undefined") return;

    const favorites = parseJson<VocabTerm[]>(localStorage.getItem(FAVORITES_KEY), []);
    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites.filter((term) => !matchesTerm(term, target))),
    );

    const termStateKey = `${target.japanese}\u0000${target.kana}\u0000${target.english_definition}`;
    const termStates = parseJson<Record<string, unknown>>(localStorage.getItem(TERM_STATES_KEY), {});
    if (Object.prototype.hasOwnProperty.call(termStates, termStateKey)) {
        delete termStates[termStateKey];
        localStorage.setItem(TERM_STATES_KEY, JSON.stringify(termStates));
    }

    const activeTextTerms = parseJson<VocabTerm[]>(localStorage.getItem(ACTIVE_TEXT_KEY), []);
    if (Array.isArray(activeTextTerms)) {
        const nextActiveTerms = activeTextTerms.filter((term) => !matchesTerm(term, target));
        localStorage.setItem(ACTIVE_TEXT_KEY, JSON.stringify(nextActiveTerms));
    }

    const historyEntries = parseJson<Record<string, HistoryEntryLike>>(localStorage.getItem(HISTORY_TERMS_KEY), {});
    let historyChanged = false;
    const nextHistory: Record<string, HistoryEntryLike> = {};

    for (const [entryId, entry] of Object.entries(historyEntries)) {
        const entryTerms = Array.isArray(entry?.terms) ? entry.terms : [];
        const nextTerms = entryTerms.filter((term) => !matchesTerm(term, target));
        if (nextTerms.length !== entryTerms.length) {
            historyChanged = true;
        }
        nextHistory[entryId] = {
            ...entry,
            terms: nextTerms,
        };
    }

    if (historyChanged) {
        localStorage.setItem(HISTORY_TERMS_KEY, JSON.stringify(nextHistory));
    }
}
