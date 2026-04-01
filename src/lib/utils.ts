import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto";
import type { KanjiGameTerm, VocabTerm } from "./types/vocab";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isVocabTerm(value: unknown): value is VocabTerm {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const term = value as Record<string, unknown>;
    return (
        typeof term.japanese === "string" &&
        typeof term.kana === "string" &&
        typeof term.english_definition === "string"
    );
}

export function isKanjiGameTerm(value: unknown): value is KanjiGameTerm {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const term = value as Record<string, unknown>;
    return (
        typeof term.japanese === "string" &&
        typeof term.kana === "string" &&
        typeof term.english_definition === "string" &&
        Array.isArray(term.support_words)
    );
}


export function getHashedCache(key: string): string | null {
  //create sha256 hash of key
  const hashToCheck = createHash("sha256")
    .update(key)
    .digest("hex");
  // retrieve previously content from local storage if it exists
  const cachedResponse = localStorage.getItem(hashToCheck);
  return cachedResponse;

}

export function setHashedCache(key: string, content: string): void {
  //create sha256 hash of content
  const hashToSet = createHash("sha256")
    .update(key)
    .digest("hex");
  // store content in local storage
  localStorage.setItem(hashToSet, content);
}

function getStoredHistory(storageKey: string): Record<string, string> {
  const history = localStorage.getItem(storageKey) ?? "{}";
  return JSON.parse(history) as Record<string, string>;
}

function setStoredHistory(storageKey: string, history: Record<string, string>): void {
  localStorage.setItem(storageKey, JSON.stringify(history));
}

export function appendNamedHistory(
  storageKey: string,
  key: string,
  content: string,
  isKeyHashed = false,
): void {
  const historyHashmap = getStoredHistory(storageKey);
  const hashToSet = isKeyHashed ? key : createHash("sha256")
    .update(key)
    .digest("hex");
  historyHashmap[hashToSet] = content;
  setStoredHistory(storageKey, historyHashmap);
}

export function getNamedHistory(
  storageKey: string,
  key: string,
  isKeyHashed: boolean,
): string | null {
  const historyHashmap = getStoredHistory(storageKey);
  const hashToCheck = isKeyHashed ? key : createHash("sha256").update(key).digest("hex");
  return historyHashmap[hashToCheck] ?? null;
}

export function getAllNamedHistories(storageKey: string): Record<string, string> {
  return getStoredHistory(storageKey);
}

export function removeNamedHistory(storageKey: string, key: string, isKeyHashed: boolean): void {
  const historyHashmap = getStoredHistory(storageKey);
  const hashToRemove = isKeyHashed ? key : createHash("sha256").update(key).digest("hex");
  delete historyHashmap[hashToRemove];
  setStoredHistory(storageKey, historyHashmap);
}

export function appendGameHistory(key: string, content: string, isKeyHashed = false): void {
  appendNamedHistory("historyTerms", key, content, isKeyHashed);
}

export function getGameHistory(key: string, isKeyHashed: boolean): string | null {
  return getNamedHistory("historyTerms", key, isKeyHashed);
}

export function removeGameHistory(key: string, isKeyHashed: boolean): void {
  removeNamedHistory("historyTerms", key, isKeyHashed);
}

export function getAllGameHistories(): Record<string, string> {
  return getAllNamedHistories("historyTerms");
}
