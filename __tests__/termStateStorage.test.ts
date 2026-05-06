import {
    extractTermStatesFromTerms,
    makeTermStateKey,
    mergeTermStatesIntoTerms,
} from "../src/lib/term-state-storage";

describe("term state storage helpers", () => {
    it("extracts keyed term states from terms", () => {
        const terms = [
            {
                japanese: "急ぐ",
                kana: "いそぐ",
                english_definition: "to hurry",
                gravity_score: 2,
                gravity_reading_score: 1,
                isLearnt: true,
            },
            {
                japanese: "歩く",
                kana: "あるく",
                english_definition: "to walk",
            },
        ];

        const map = extractTermStatesFromTerms(terms as any);
        expect(map[makeTermStateKey(terms[0] as any)]).toEqual({
            gravity_score: 2,
            gravity_reading_score: 1,
            isLearnt: true,
        });
        expect(map[makeTermStateKey(terms[1] as any)]).toBeUndefined();
    });

    it("merges term states into terms without touching other fields", () => {
        const baseTerms = [
            {
                japanese: "急ぐ",
                kana: "いそぐ",
                english_definition: "to hurry",
                isFavorite: true,
            },
        ];

        const merged = mergeTermStatesIntoTerms(baseTerms as any, {
            [makeTermStateKey(baseTerms[0] as any)]: {
                gravity_score: 1,
                gravity_reading_score: 0,
                isLearnt: false,
            },
        });

        expect(merged[0]).toEqual({
            japanese: "急ぐ",
            kana: "いそぐ",
            english_definition: "to hurry",
            isFavorite: true,
            gravity_score: 1,
            gravity_reading_score: 0,
            isLearnt: false,
        });
    });
});

