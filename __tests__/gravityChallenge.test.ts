import {
    createGravityChallenge,
    getExpectedGravityAnswer,
    isAnswerCorrect,
} from "@/app/gravity/_lib/gravity-utils";
import type { VocabTerm } from "@/lib/types/vocab";
import type { KuromojiToken } from "kuromojin";

function token(surface: string, pos = "名詞"): KuromojiToken {
    return {
        word_id: 1,
        word_type: "KNOWN",
        surface_form: surface,
        pos,
        pos_detail_1: "*",
        pos_detail_2: "*",
        pos_detail_3: "*",
        conjugated_type: "*",
        conjugated_form: "*",
        basic_form: surface,
        reading: surface,
        pronunciation: surface,
        word_position: 1,
    };
}

const baseTerm: VocabTerm = {
    japanese: "確認",
    kana: "かくにん",
    english_definition: "confirmation",
};

describe("gravity challenge helpers", () => {
    it("keeps short terms as exact Japanese answers", () => {
        const challenge = createGravityChallenge(baseTerm, [token("確認")]);

        expect(challenge).toEqual({
            kind: "exact",
            expectedAnswer: "確認",
        });
        expect(getExpectedGravityAnswer(baseTerm, challenge)).toBe("確認");
    });

    it("creates a stable star challenge for long Japanese sentences", () => {
        const term: VocabTerm = {
            japanese: "私は毎朝駅で友達に会います",
            kana: "わたしはまいあさえきでともだちにあいます",
            english_definition: "I meet my friend at the station every morning",
        };
        const tokens = [
            token("私"),
            token("は", "助詞"),
            token("毎朝"),
            token("駅"),
            token("で", "助詞"),
            token("友達"),
            token("に", "助詞"),
            token("会い", "動詞"),
            token("ます", "助動詞"),
        ];

        const challenge = createGravityChallenge(term, tokens);
        const repeatedChallenge = createGravityChallenge(term, tokens);

        expect(challenge.kind).toBe("star");
        if (challenge.kind !== "star") {
            throw new Error("Expected a star challenge");
        }
        expect(challenge).toEqual(repeatedChallenge);
        expect(challenge.slots).toHaveLength(5);
        expect(challenge.slots.filter((slot) => slot === "★")).toHaveLength(1);
        expect(challenge.chips).toEqual(
            expect.arrayContaining(["私は", "毎朝", "駅で", "友達に", "会います"]),
        );
        expect(["私は", "毎朝", "駅で", "友達に", "会います"]).toContain(
            challenge.expectedAnswer,
        );
    });

    it("creates a star challenge for compact verb phrases", () => {
        const term: VocabTerm = {
            japanese: "漫然と仕事をする",
            kana: "まんぜんとしごとをする",
            english_definition: "work aimlessly",
        };
        const challenge = createGravityChallenge(term, [
            token("漫然", "名詞"),
            token("と", "助詞"),
            token("仕事", "名詞"),
            token("を", "助詞"),
            token("する", "動詞"),
        ]);

        expect(challenge.kind).toBe("star");
        if (challenge.kind !== "star") {
            throw new Error("Expected a star challenge");
        }
        expect(challenge.slots).toHaveLength(3);
        expect(challenge.chips).toEqual(
            expect.arrayContaining(["漫然と", "仕事を", "する"]),
        );
        expect(["漫然と", "仕事を", "する"]).toContain(challenge.expectedAnswer);
    });

    it("merges common negative endings into the previous stem", () => {
        const term: VocabTerm = {
            japanese: "要らないものを捨てる",
            kana: "いらないもの",
            english_definition: "throw away things not needed",
        };
        const challenge = createGravityChallenge(term, [
            token("要ら", "動詞"),
            token("ない", "助動詞"),
            token("もの", "名詞"),
            token("を", "助詞"),
            token("捨てる", "動詞"),
        ]);

        expect(challenge.kind).toBe("star");
        if (challenge.kind !== "star") {
            throw new Error("Expected a star challenge");
        }
        expect(challenge.chips).toEqual(
            expect.arrayContaining(["要らない", "ものを", "捨てる"]),
        );
        expect(challenge.chips).not.toEqual(expect.arrayContaining(["要ら", "ない"]));
    });

    it("does not merge removed compound endings like てある", () => {
        const term: VocabTerm = {
            japanese: "書いてあるメモを見る",
            kana: "かいてあるめも",
            english_definition: "look at a written note",
        };
        const challenge = createGravityChallenge(term, [
            token("書い", "動詞"),
            token("て", "助詞"),
            token("ある", "動詞"),
            token("メモ", "名詞"),
            token("を", "助詞"),
            token("見る", "動詞"),
        ]);

        expect(challenge.kind).toBe("star");
        if (challenge.kind !== "star") {
            throw new Error("Expected a star challenge");
        }
        expect(challenge.chips).toEqual(
            expect.arrayContaining(["書いて", "ある", "メモを", "見る"]),
        );
        expect(challenge.chips).not.toContain("書いてある");
    });

    it("falls back to exact when tokens are only punctuation", () => {
        const term: VocabTerm = {
            ...baseTerm,
            japanese: "。。。。。。。。。。。。",
        };
        const challenge = createGravityChallenge(term, [
            token("。", "記号"),
            token("。", "記号"),
            token("。", "記号"),
        ]);

        expect(challenge.kind).toBe("exact");
        expect(getExpectedGravityAnswer(term, challenge)).toBe(term.japanese);
    });

    it("falls back to exact when tokenizer output is unavailable", () => {
        const challenge = createGravityChallenge(baseTerm);

        expect(challenge.kind).toBe("exact");
        expect(challenge.expectedAnswer).toBe(baseTerm.japanese);
    });

    it("normalizes punctuation and spacing while checking answers", () => {
        expect(isAnswerCorrect(" 会い。 ", "会い")).toBe(true);
        expect(isAnswerCorrect("会 い", "会い")).toBe(true);
    });
});
