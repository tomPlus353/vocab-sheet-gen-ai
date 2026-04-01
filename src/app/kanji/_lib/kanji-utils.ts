import type {
    KanjiGameTerm,
    KanjiMasteryStage,
    KanjiSupportWord,
    ExampleSentence,
    VocabTerm,
} from "@/lib/types/vocab";

export const KANJI_TARGET_TOKEN = "__TARGET__";
export const KANJI_STARTING_HEARTS = 3;
export const KANJI_BASE_POINTS = 100;

export const MASTERY_STAGES: KanjiMasteryStage[] = [
    "new",
    "learning",
    "mastered",
];

export function normalizeKanjiAnswer(value: string): string {
    return value.trim().normalize("NFKC");
}

export function isKanjiAnswerCorrect(
    answer: string,
    expectedKanji: string,
): boolean {
    const normalizedAnswer = normalizeKanjiAnswer(answer);
    const normalizedExpected = normalizeKanjiAnswer(expectedKanji);
    return normalizedAnswer.length > 0 && normalizedAnswer === normalizedExpected;
}

export function getKanjiMultiplier(streak: number): number {
    if (streak >= 10) {
        return 4;
    }
    if (streak >= 5) {
        return 3;
    }
    if (streak >= 3) {
        return 2;
    }
    return 1;
}

export function getNextMasteryStage(
    stage: KanjiMasteryStage,
): KanjiMasteryStage {
    const currentIndex = MASTERY_STAGES.indexOf(stage);
    if (currentIndex === -1 || currentIndex === MASTERY_STAGES.length - 1) {
        return "mastered";
    }

    return MASTERY_STAGES[currentIndex + 1]!;
}

export function getMasteryStageFromCorrectCount(
    count: number,
    totalQuestions = 2,
): KanjiMasteryStage {
    if (count >= totalQuestions) {
        return "mastered";
    }
    if (count >= 1) {
        return "learning";
    }
    return "new";
}

function isKanjiCharacter(character: string): boolean {
    return /\p{Script=Han}/u.test(character);
}

function buildSupportWord(term: VocabTerm): KanjiSupportWord {
    const exampleSentence =
        term.example_sentences?.find((item) =>
            item.japanese.includes(term.japanese),
        ) ?? term.example_sentences?.[0];

    return {
        word: term.japanese,
        kana: term.kana,
        english_definition: term.english_definition,
        sentence_template: buildSentenceTemplate(term.japanese, exampleSentence),
    };
}

function buildSentenceTemplate(
    word: string,
    exampleSentence?: ExampleSentence,
): string {
    if (!exampleSentence?.japanese.includes(word)) {
        return `${KANJI_TARGET_TOKEN}`;
    }

    return exampleSentence.japanese.replace(word, KANJI_TARGET_TOKEN);
}

export function renderKanjiSentence(
    template: string,
    replacement: string,
): string {
    return template.replace(KANJI_TARGET_TOKEN, replacement);
}

export function buildKanjiCardsFromVocabTerms(
    terms: VocabTerm[],
): KanjiGameTerm[] {
    const groupedTerms = new Map<string, KanjiSupportWord[]>();

    terms.forEach((term) => {
        const seen = new Set<string>();
        Array.from(term.japanese).forEach((character) => {
            if (!isKanjiCharacter(character) || seen.has(character)) {
                return;
            }

            seen.add(character);
            const currentWords = groupedTerms.get(character) ?? [];
            const nextWord = buildSupportWord(term);
            const alreadyIncluded = currentWords.some(
                (word) => word.word === nextWord.word,
            );
            if (!alreadyIncluded) {
                groupedTerms.set(character, [...currentWords, nextWord]);
            }
        });
    });

    const cards: KanjiGameTerm[] = [];

    Array.from(groupedTerms.entries()).forEach(([character, supportWords]) => {
        const representativeWord = supportWords[0];
        if (!representativeWord) {
            return;
        }

        cards.push({
            japanese: character,
            kana: representativeWord.kana,
            english_definition: representativeWord.english_definition,
            support_words: supportWords.slice(0, 3),
            jlpt_level: "N1+",
        });
    });

    return cards;
}
