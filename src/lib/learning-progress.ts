import type { CSSProperties } from "react";
import type { VocabTerm } from "@/lib/types/vocab";

export type CompletionTone = {
    badgeStyle: CSSProperties;
    accentStyle: CSSProperties;
};

export function getLearntCount(terms: VocabTerm[]): number {
    return terms.filter((term) => (term.gravity_score ?? 0) >= 2).length;
}

export function getCompletionPercent(terms: VocabTerm[]): number {
    if (terms.length === 0) {
        return 0;
    }

    return Math.round((getLearntCount(terms) / terms.length) * 100);
}

export function getCompletionTone(percent: number): CompletionTone {
    if (percent >= 100) {
        return {
            badgeStyle: {
                backgroundColor: "rgba(22, 163, 74, 0.92)",
                borderColor: "rgba(16, 185, 129, 1)",
                color: "#f0fdf4",
            },
            accentStyle: {
                borderLeftColor: "rgba(16, 185, 129, 1)",
            },
        };
    }

    if (percent >= 76) {
        return {
            badgeStyle: {
                backgroundColor: "rgba(132, 204, 22, 0.88)",
                borderColor: "rgba(132, 204, 22, 1)",
                color: "#111827",
            },
            accentStyle: {
                borderLeftColor: "rgba(132, 204, 22, 1)",
            },
        };
    }

    if (percent >= 50) {
        return {
            badgeStyle: {
                backgroundColor: "rgba(250, 204, 21, 0.92)",
                borderColor: "rgba(250, 204, 21, 1)",
                color: "#111827",
            },
            accentStyle: {
                borderLeftColor: "rgba(250, 204, 21, 1)",
            },
        };
    }

    if (percent >= 25) {
        return {
            badgeStyle: {
                backgroundColor: "rgba(249, 115, 22, 0.88)",
                borderColor: "rgba(249, 115, 22, 1)",
                color: "#fff7ed",
            },
            accentStyle: {
                borderLeftColor: "rgba(249, 115, 22, 1)",
            },
        };
    }

    return {
        badgeStyle: {
            backgroundColor: "rgba(220, 38, 38, 0.9)",
            borderColor: "rgba(248, 113, 113, 1)",
            color: "#fef2f2",
        },
        accentStyle: {
            borderLeftColor: "rgba(248, 113, 113, 1)",
        },
    };
}
