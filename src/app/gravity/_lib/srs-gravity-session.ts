import type { VocabTerm } from "@/lib/types/vocab";
import { resolveSrsPromptType } from "@/lib/srs-prompt";

export function getSrsPromptText(term: VocabTerm): string {
    const promptType = resolveSrsPromptType(term.srsPromptType);
    return promptType === "reading"
        ? `Write: ${term.japanese}`
        : term.english_definition;
}

export function applySrsSessionAnswer(
    terms: VocabTerm[],
    answeredTerm: VocabTerm,
    isCorrect: boolean,
): VocabTerm[] {
    if (!isCorrect) {
        return terms;
    }

    return terms.filter((term) => !isSameSrsTerm(term, answeredTerm));
}

export function isSameSrsTerm(left: VocabTerm, right: VocabTerm): boolean {
    return (
        left.japanese === right.japanese &&
        left.kana === right.kana &&
        left.english_definition === right.english_definition
    );
}
