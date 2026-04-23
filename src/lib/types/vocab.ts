export type ExampleSentence = {
    japanese: string;
    kana: string;
};

export type VocabTerm = {
    japanese: string;
    kana: string;
    english_definition: string;
    example_sentences?: ExampleSentence[];
    isFavorite?: boolean;
    gravity_score?: number;
    isLearnt?: boolean;
    type?: string;
};

export type HistoryEntrySource = "generated" | "manual";

export type HistoryEntry = {
    id: string;
    title: string;
    source: HistoryEntrySource;
    createdAt: string;
    terms: VocabTerm[];
};

export type KanjiMasteryStage = "new" | "learning" | "mastered";

export type KanjiSupportWord = {
    word: string;
    kana: string;
    english_definition: string;
    sentence_template: string;
};

export type KanjiGameTerm = {
    japanese: string;
    kana: string;
    english_definition: string;
    support_words: KanjiSupportWord[];
    jlpt_level?: string;
    isFavorite?: boolean;
};
