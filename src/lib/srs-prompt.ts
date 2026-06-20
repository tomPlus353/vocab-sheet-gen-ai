import type { SrsPromptType } from "@/lib/types/srs";

export function isSrsPromptType(value: unknown): value is SrsPromptType {
    return value === "reading" || value === "meaning";
}

export function resolveSrsPromptType(value: unknown): SrsPromptType {
    return isSrsPromptType(value) ? value : "reading";
}

export function getRandomSrsPromptType(): SrsPromptType {
    return Math.random() < 0.5 ? "reading" : "meaning";
}

export function flipSrsPromptType(value: SrsPromptType): SrsPromptType {
    return value === "reading" ? "meaning" : "reading";
}

export function getSrsPromptLabel(value: SrsPromptType): string {
    return value === "reading" ? "Reading" : "Meaning";
}
