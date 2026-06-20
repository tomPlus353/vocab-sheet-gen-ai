import type { ExampleSentence } from "@/lib/types/vocab";

export type SrsReviewRating = "again" | "hard" | "good" | "easy";
export type SrsPromptType = "reading" | "meaning";

export type SrsCardState = {
    due: string;
    stability: number;
    difficulty: number;
    repetitions: number;
    lapses: number;
    state: number;
    lastReview?: string;
    scheduledDays: number;
    learningSteps: number;
    retrievability?: number;
    lastRating?: number;
};

export type SrsDashboardBucket = "overdue" | "due_today" | "upcoming";

export type SrsDashboardSummary = {
    overdue: number;
    dueToday: number;
    upcoming: number;
    totalTracked: number;
};

export type SrsDashboardTermRow = {
    japanese: string;
    kana: string;
    englishDefinition: string;
    exampleSentences?: ExampleSentence[];
    nextPromptType: SrsPromptType;
    due: string;
    lastReview?: string;
    stability: number;
    difficulty: number;
    repetitions: number;
    lapses: number;
    state: number;
    retrievability?: number;
    lastRating?: number;
};
