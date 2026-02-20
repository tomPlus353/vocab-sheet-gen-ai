export type VocabTerm = {
    japanese: string;
    romanization: string;
    english_definition: string;
    isFavorite?: boolean;
    gravity_score?: number;
    isLearnt?: boolean;
};

export type FallingTerm = {
    id: number;
    term: VocabTerm;
    y: number;
    x: number;
    isPositioned: boolean;
};

export const PLAYFIELD_HEIGHT_PX = 480;
export const HORIZONTAL_PADDING_PX = 8;

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
