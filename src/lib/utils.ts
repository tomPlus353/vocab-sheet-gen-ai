import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto";
import { VocabTerm } from "./types/vocab";


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
        typeof term.romanization === "string" &&
        typeof term.english_definition === "string"
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

export function appendGameHistory(key: string, content: string, isKeyHashed = false): void {
  const history = localStorage.getItem("historyTerms") ?? "{}";
  const historyHashmap: Record<string, string> = JSON.parse(history) as Record<string, string>;
  const hashToSet = isKeyHashed ? key : createHash("sha256")
    .update(key)
    .digest("hex");
  historyHashmap[hashToSet] = content;
  localStorage.setItem("historyTerms", JSON.stringify(historyHashmap));
}

export function getGameHistory(key: string, isKeyHashed: boolean): string | null {
  const history = localStorage.getItem("historyTerms") ?? "{}";
  const historyHashmap: Record<string, string> = JSON.parse(history) as Record<string, string>;
  const hashToCheck = isKeyHashed ? key : createHash("sha256").update(key).digest("hex");
  return historyHashmap[hashToCheck] ?? null;
}

export function removeGameHistory(key: string, isKeyHashed: boolean): void {
  const history = localStorage.getItem("historyTerms") ?? "{}";
  const historyHashmap: Record<string, string> = JSON.parse(history) as Record<string, string>;
  const hashToRemove = isKeyHashed ? key : createHash("sha256").update(key).digest("hex");
  delete historyHashmap[hashToRemove];
  localStorage.setItem("historyTerms", JSON.stringify(historyHashmap));
}

export function getAllGameHistories(): Record<string, string> {
  const history = localStorage.getItem("historyTerms") ?? "{}";
  const historyHashmap: Record<string, string> = JSON.parse(history) as Record<string, string>;
  return historyHashmap;
}