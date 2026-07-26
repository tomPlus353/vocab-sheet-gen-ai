import type { VocabTerm } from "@/lib/types/vocab";
import type { KuromojiToken } from "kuromojin";

export type GravityExactChallenge = {
    kind: "exact";
    expectedAnswer: string;
};

export type GravityStarChallenge = {
    kind: "star";
    expectedAnswer: string;
    answerIndex: number;
    slots: string[];
    chips: string[];
};

export type GravityChallenge = GravityExactChallenge | GravityStarChallenge;

export type FallingTerm = {
    id: number;
    term: VocabTerm;
    challenge: GravityChallenge;
    y: number;
    x: number;
    isPositioned: boolean;
    laneIndex?: number;
};

export const PLAYFIELD_HEIGHT_PX = 480;
export const HORIZONTAL_PADDING_PX = 8;
export const MAX_SIMULTANEOUS_TERMS = 2;
export const FALLING_CARD_WIDTH = 220;
export const FALLING_CARD_GAP = 2;
export const GRAVITY_BATCH_SIZE = 20;
export const GRAVITY_DROP_TICK_MS = 30;
export const GRAVITY_INITIAL_FALL_SPEED = 1;
export const GRAVITY_INITIAL_SPAWN_INTERVAL_MS = 3000;
export const GRAVITY_LEVEL_SPEED_MULTIPLIER = 1.1;
export const GRAVITY_LEVEL_SPAWN_MULTIPLIER = 0.9;
export const GRAVITY_LEVEL_TRANSITION_BASE_DELAY_MS = 300;
export const GRAVITY_LEVEL_TRANSITION_DELAY_PER_LEVEL_MS = 20;
export const WORD_SPAWN_INTERVAL_MS = GRAVITY_INITIAL_SPAWN_INTERVAL_MS;
export const GRAVITY_STAR_MIN_TOKENS = 4;
export const GRAVITY_STAR_MIN_CHARACTERS = 8;

const EXCLUDED_STAR_ANSWER_POS = new Set(["助詞", "助動詞", "記号"]);
const MERGEABLE_ENDINGS = new Set([
    "ない",
    "なかった",
    "なくて",
    "なく",
    "ます",
    "ました",
    "ません",
    "ませんでした",
    "たい",
    "たかった",
    "たくない",
    "たくなかった",
    "て",
    "で",
    "って",
    "いて",
    "いで",
    "った",
    "いた",
    "いだ",
    "した",
    "して",
    "いる",
    "ちゃう",
    "じゃう",
]);
const MERGEABLE_PARTICLES = new Set([
    "は",
    "が",
    "を",
    "に",
    "へ",
    "で",
    "と",
    "も",
    "の",
    "や",
    "から",
    "まで",
    "より",
    "だけ",
    "しか",
    "ばかり",
    "くらい",
    "ぐらい",
    "など",
    "でも",
    "か",
    "ね",
    "よ",
    "な",
]);
const PUNCTUATION_ONLY_PATTERN =
    /^[\s\u3000。、！？.,/#!$%^&*;:{}=\-_`~()[\]「」『』（）・…]+$/;

type GravityChallengeToken = Pick<KuromojiToken, "surface_form" | "pos">;

export function normalizeAnswer(value: string): string {
    return value
        .trim()
        .replace(/[\u3000\s]+/g, "")
        .replace(/[。、！？.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .replace(/\s+/g, " ");
}

export function isAnswerCorrect(answer: string, japaneseTerm: string): boolean {
    const normalizedAnswer = normalizeAnswer(answer);
    const normalizedTerm = normalizeAnswer(japaneseTerm);
    return normalizedAnswer.length > 0 && normalizedAnswer === normalizedTerm;
}

export function createExactGravityChallenge(term: VocabTerm): GravityExactChallenge {
    return {
        kind: "exact",
        expectedAnswer: term.japanese,
    };
}

function stableHash(value: string): number {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function getStableShuffledValues(values: string[], seed: string): string[] {
    const nextValues = [...values];
    let hash = stableHash(seed);

    for (let index = nextValues.length - 1; index > 0; index--) {
        hash = Math.imul(hash ^ index, 16777619) >>> 0;
        const swapIndex = hash % (index + 1);
        const temp = nextValues[index];
        nextValues[index] = nextValues[swapIndex]!;
        nextValues[swapIndex] = temp!;
    }

    if (
        nextValues.length > 1 &&
        nextValues.every((value, index) => value === values[index])
    ) {
        const first = nextValues.shift();
        if (first) {
            nextValues.push(first);
        }
    }

    return nextValues;
}

function isDisplayToken(token: KuromojiToken): boolean {
    const surface = token.surface_form.trim();
    return surface.length > 0 && !PUNCTUATION_ONLY_PATTERN.test(surface);
}

function isMeaningfulAnswerToken(token: GravityChallengeToken): boolean {
    const surface = token.surface_form.trim();
    return (
        surface.length > 0 &&
        !PUNCTUATION_ONLY_PATTERN.test(surface) &&
        !EXCLUDED_STAR_ANSWER_POS.has(token.pos)
    );
}

function shouldMergeWithPrevious(
    previous: GravityChallengeToken,
    current: GravityChallengeToken,
    japaneseTerm: string,
): boolean {
    const surface = current.surface_form;
    const mergedSurface = `${previous.surface_form}${surface}`;

    return (
        japaneseTerm.includes(mergedSurface) &&
        !EXCLUDED_STAR_ANSWER_POS.has(previous.pos) &&
        (MERGEABLE_ENDINGS.has(surface) || MERGEABLE_PARTICLES.has(surface))
    );
}

function mergeGravityChallengeTokens(
    tokens: KuromojiToken[],
    japaneseTerm: string,
): GravityChallengeToken[] {
    return tokens.filter(isDisplayToken).reduce<GravityChallengeToken[]>(
        (mergedTokens, token) => {
            const current = {
                surface_form: token.surface_form.trim(),
                pos: token.pos,
            };
            const previous = mergedTokens[mergedTokens.length - 1];

            if (
                previous &&
                shouldMergeWithPrevious(previous, current, japaneseTerm)
            ) {
                mergedTokens[mergedTokens.length - 1] = {
                    surface_form: `${previous.surface_form}${current.surface_form}`,
                    pos: previous.pos,
                };
                return mergedTokens;
            }

            mergedTokens.push(current);
            return mergedTokens;
        },
        [],
    );
}

export function createGravityChallenge(
    term: VocabTerm,
    tokens?: KuromojiToken[],
): GravityChallenge {
    if (!tokens || tokens.length === 0) {
        return createExactGravityChallenge(term);
    }

    const displayTokens = mergeGravityChallengeTokens(tokens, term.japanese);
    const normalizedJapanese = normalizeAnswer(
        displayTokens.map((token) => token.surface_form).join(""),
    );
    const isLongTerm =
        displayTokens.length >= GRAVITY_STAR_MIN_TOKENS ||
        normalizedJapanese.length >= GRAVITY_STAR_MIN_CHARACTERS;
    const answerCandidates = displayTokens
        .map((token, index) => ({ token, index }))
        .filter(({ token }) => isMeaningfulAnswerToken(token));

    if (!isLongTerm || displayTokens.length < 3 || answerCandidates.length === 0) {
        return createExactGravityChallenge(term);
    }

    const answerCandidate =
        answerCandidates[
            stableHash(`${term.japanese}|${term.english_definition}|answer`) %
                answerCandidates.length
        ]!;
    const chips = getStableShuffledValues(
        displayTokens.map((token) => token.surface_form),
        `${term.japanese}|${term.english_definition}|chips`,
    );

    return {
        kind: "star",
        expectedAnswer: answerCandidate.token.surface_form,
        answerIndex: answerCandidate.index,
        slots: displayTokens.map((_, index) =>
            index === answerCandidate.index ? "★" : "＿",
        ),
        chips,
    };
}

export function getExpectedGravityAnswer(
    term: VocabTerm,
    challenge?: GravityChallenge,
): string {
    return challenge?.expectedAnswer ?? term.japanese;
}

export function getShuffledIndexes(length: number): number[] {
    const indexes = Array.from({ length }, (_, i) => i);
    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = indexes[i];
        indexes[i] = indexes[j]!;
        indexes[j] = temp!;
    }
    return indexes;
}

export function getTermKey(term: VocabTerm): string {
    return `${term.japanese}||${term.english_definition}`;
}

export function getGravityTermScore(term: VocabTerm, isTestReading: boolean): number {
    return isTestReading ? term.gravity_reading_score ?? 0 : term.gravity_score ?? 0;
}

export function isGravityTermLearnt(term: VocabTerm, isTestReading = false): boolean {
    return getGravityTermScore(term, isTestReading) >= 2;
}

export function getShuffledTermKeys(terms: VocabTerm[]): string[] {
    const indexes = getShuffledIndexes(terms.length);
    return indexes
        .map((index) => terms[index])
        .filter((term): term is VocabTerm => Boolean(term))
        .map((term) => getTermKey(term));
}
