import {
    applySrsSessionAnswer,
    getSrsPromptText,
} from "@/app/gravity/_lib/srs-gravity-session";
import type { VocabTerm } from "@/lib/types/vocab";

const termA: VocabTerm = {
    japanese: "確認",
    kana: "かくにん",
    english_definition: "confirmation",
    srsPromptType: "meaning",
};

const termB: VocabTerm = {
    japanese: "提出",
    kana: "ていしゅつ",
    english_definition: "submission",
    srsPromptType: "reading",
};

describe("SRS gravity session helpers", () => {
    it("keeps a term in the session after a wrong answer", () => {
        expect(applySrsSessionAnswer([termA, termB], termA, false)).toEqual([
            termA,
            termB,
        ]);
    });

    it("removes a term from the session after a correct answer", () => {
        expect(applySrsSessionAnswer([termA, termB], termA, true)).toEqual([
            termB,
        ]);
    });

    it("uses the persisted prompt type to render review prompts", () => {
        expect(getSrsPromptText(termA)).toBe("confirmation");
        expect(getSrsPromptText(termB)).toBe("Write: 提出");
    });
});
