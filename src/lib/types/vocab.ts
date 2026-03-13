export type VocabTerm = {
    japanese: string;
    kana: string;
    english_definition: string;
    isFavorite?: boolean;
    gravity_score?: number;
    isLearnt?: boolean;
    type?: string;
};