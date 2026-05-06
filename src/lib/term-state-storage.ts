import type { VocabTerm } from "@/lib/types/vocab";

export type TermState = {
    gravity_score?: number;
    gravity_reading_score?: number;
    isLearnt?: boolean;
};

export type TermStateMap = Record<string, TermState>;

const TERM_STATES_KEY = "termStates";

export function makeTermStateKey(
    term: Pick<VocabTerm, "japanese" | "kana" | "english_definition">,
): string {
    return `${term.japanese}\u0000${term.kana}\u0000${term.english_definition}`;
}

export function extractTermStatesFromTerms(terms: VocabTerm[]): TermStateMap {
    const next: TermStateMap = {};
    for (const term of terms) {
        const hasAny =
            typeof term.gravity_score === "number" ||
            typeof term.gravity_reading_score === "number" ||
            typeof term.isLearnt === "boolean";
        if (!hasAny) continue;
        next[makeTermStateKey(term)] = {
            gravity_score: term.gravity_score,
            gravity_reading_score: term.gravity_reading_score,
            isLearnt: term.isLearnt,
        };
    }
    return next;
}

export function mergeTermStatesIntoTerms(
    terms: VocabTerm[],
    stateByKey: TermStateMap,
): VocabTerm[] {
    return terms.map((term) => {
        const state = stateByKey[makeTermStateKey(term)];
        if (!state) return term;
        return { ...term, ...state };
    });
}

export function getLocalTermStates(): TermStateMap {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(TERM_STATES_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return {};
        }
        return parsed as TermStateMap;
    } catch {
        return {};
    }
}

export function upsertLocalTermStatesFromTerms(terms: VocabTerm[]): void {
    if (typeof localStorage === "undefined") return;
    const current = getLocalTermStates();
    const next = { ...current, ...extractTermStatesFromTerms(terms) };
    localStorage.setItem(TERM_STATES_KEY, JSON.stringify(next));
}

export function applyLocalTermStatesToTerms(terms: VocabTerm[]): VocabTerm[] {
    return mergeTermStatesIntoTerms(terms, getLocalTermStates());
}
