import {
    buildKanjiCardsFromVocabTerms,
    getKanjiMultiplier,
    getMasteryStageFromCorrectCount,
    isKanjiAnswerCorrect,
} from "../src/app/kanji/_lib/kanji-utils";

describe("kanji game utils", () => {
    it("checks exact kanji answers with unicode normalization", () => {
        expect(isKanjiAnswerCorrect(" 確保 ", "確保")).toBe(true);
        expect(isKanjiAnswerCorrect("ｶｸﾎ", "確保")).toBe(false);
        expect(isKanjiAnswerCorrect("かくほ", "確保")).toBe(false);
        expect(isKanjiAnswerCorrect("確保する", "確保")).toBe(false);
    });

    it("uses the expected combo multiplier thresholds", () => {
        expect(getKanjiMultiplier(1)).toBe(1);
        expect(getKanjiMultiplier(3)).toBe(2);
        expect(getKanjiMultiplier(5)).toBe(3);
        expect(getKanjiMultiplier(10)).toBe(4);
    });

    it("maps correct counts onto the mastery ladder", () => {
        expect(getMasteryStageFromCorrectCount(0)).toBe("new");
        expect(getMasteryStageFromCorrectCount(1)).toBe("learning");
        expect(getMasteryStageFromCorrectCount(2)).toBe("mastered");
        expect(getMasteryStageFromCorrectCount(3)).toBe("mastered");
    });

    it("groups vocab terms into single-kanji cards with support words", () => {
        const result = buildKanjiCardsFromVocabTerms([
            {
                japanese: "練習",
                kana: "れんしゅう",
                english_definition: "practice",
                example_sentences: [
                    {
                        japanese: "毎日練習すると上達が早い。",
                        kana: "まいにちれんしゅうするとじょうたつがはやい。",
                    },
                ],
            },
            {
                japanese: "練る",
                kana: "ねる",
                english_definition: "to knead; to refine",
                example_sentences: [
                    {
                        japanese: "計画を練る必要がある。",
                        kana: "けいかくをねるひつようがある。",
                    },
                ],
            },
            {
                japanese: "熟練",
                kana: "じゅくれん",
                english_definition: "skill; mastery",
            },
        ]);

        const target = result.find((term) => term.japanese === "練");

        expect(target).toEqual({
            japanese: "練",
            kana: "れんしゅう",
            english_definition: "practice",
            support_words: [
                {
                    word: "練習",
                    kana: "れんしゅう",
                    english_definition: "practice",
                    sentence_template: "毎日__TARGET__すると上達が早い。",
                },
                {
                    word: "練る",
                    kana: "ねる",
                    english_definition: "to knead; to refine",
                    sentence_template: "計画を__TARGET__必要がある。",
                },
                {
                    word: "熟練",
                    kana: "じゅくれん",
                    english_definition: "skill; mastery",
                    sentence_template: "__TARGET__",
                },
            ],
            jlpt_level: "N1+",
        });
    });
});
