import { createInitialSrsCard, reviewSrsCard } from "@/server/storage/srs";

describe("SRS service", () => {
    it("creates an initial card", () => {
        const now = new Date("2026-05-16T00:00:00.000Z");
        const card = createInitialSrsCard(now);

        expect(card.due).toBeTruthy();
        expect(card.stability).toBeGreaterThanOrEqual(0);
        expect(card.difficulty).toBeGreaterThanOrEqual(0);
        expect(card.repetitions).toBe(0);
        expect(card.lapses).toBe(0);
    });

    it("updates a card after reviews", () => {
        const now = new Date("2026-05-16T00:00:00.000Z");
        const initial = createInitialSrsCard(now);
        const afterGood = reviewSrsCard(initial, "good", now);
        const afterAgain = reviewSrsCard(
            afterGood,
            "again",
            new Date("2026-05-17T00:00:00.000Z"),
        );

        expect(afterGood.repetitions).toBeGreaterThan(initial.repetitions);
        expect(afterAgain.lapses).toBeGreaterThanOrEqual(afterGood.lapses);
        expect(afterAgain.lastRating).toBeDefined();
    });
});
