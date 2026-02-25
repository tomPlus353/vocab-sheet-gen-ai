export type VocabTerm = {
    japanese: string;
    romanization: string;
    english_definition: string;
    isFavorite?: boolean;
    gravity_score?: number;
    isLearnt?: boolean;
    type?: string;
};