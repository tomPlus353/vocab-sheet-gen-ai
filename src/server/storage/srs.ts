import {
    Rating,
    createEmptyCard,
    fsrs,
    generatorParameters,
    type Grade,
    type State,
} from "ts-fsrs";

import type { SrsCardState, SrsReviewRating } from "@/lib/types/srs";

const scheduler = fsrs(
    generatorParameters({
        request_retention: 0.9,
        enable_fuzz: true,
    }),
);

function toRating(rating: SrsReviewRating): Grade {
    if (rating === "again") return Rating.Again;
    if (rating === "hard") return Rating.Hard;
    if (rating === "easy") return Rating.Easy;
    return Rating.Good;
}

export function createInitialSrsCard(now = new Date()): SrsCardState {
    const card = createEmptyCard(now);
    return {
        due: card.due.toISOString(),
        stability: card.stability,
        difficulty: card.difficulty,
        repetitions: card.reps,
        lapses: card.lapses,
        state: card.state,
        lastReview: card.last_review?.toISOString(),
        scheduledDays: card.scheduled_days,
        learningSteps: card.learning_steps,
    };
}

export function reviewSrsCard(
    current: SrsCardState | null,
    rating: SrsReviewRating,
    now = new Date(),
): SrsCardState {
    const baseCard = current
        ? {
              due: new Date(current.due),
              stability: current.stability,
              difficulty: current.difficulty,
              elapsed_days: 0,
              scheduled_days: current.scheduledDays,
              learning_steps: current.learningSteps,
              reps: current.repetitions,
              lapses: current.lapses,
              state: current.state as State,
              last_review: current.lastReview
                  ? new Date(current.lastReview)
                  : undefined,
          }
        : createEmptyCard(now);

    const next = scheduler.next(baseCard, now, toRating(rating));

    return {
        due: next.card.due.toISOString(),
        stability: next.card.stability,
        difficulty: next.card.difficulty,
        repetitions: next.card.reps,
        lapses: next.card.lapses,
        state: next.card.state,
        lastReview: next.card.last_review?.toISOString(),
        scheduledDays: next.card.scheduled_days,
        learningSteps: next.card.learning_steps,
        retrievability: scheduler.get_retrievability(next.card, now, false),
        lastRating: next.log.rating,
    };
}
