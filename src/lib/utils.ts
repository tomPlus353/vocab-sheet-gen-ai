import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto";
import type {
  HistoryEntry,
  HistoryEntrySource,
  KanjiGameTerm,
  VocabTerm,
} from "./types/vocab";


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

function isHistoryEntry(value: unknown): value is HistoryEntry {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const entry = value as Record<string, unknown>;
    return (
        typeof entry.id === "string" &&
        typeof entry.title === "string" &&
        (entry.source === "generated" || entry.source === "manual") &&
        typeof entry.createdAt === "string" &&
        Array.isArray(entry.terms)
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

const GAME_HISTORY_STORAGE_KEY = "historyTerms";

function getHistoryId(key: string, isKeyHashed: boolean): string {
  return isKeyHashed
    ? key
    : createHash("sha256").update(key).digest("hex");
}

function sanitizeVocabTerm(term: VocabTerm): VocabTerm {
  const nextTerm: VocabTerm = {
    japanese: term.japanese,
    kana: term.kana,
    english_definition: term.english_definition,
  };

  if (term.example_sentences) nextTerm.example_sentences = term.example_sentences;
  if (typeof term.isFavorite === "boolean") nextTerm.isFavorite = term.isFavorite;
  if (typeof term.gravity_score === "number") nextTerm.gravity_score = term.gravity_score;
  if (typeof term.gravity_reading_score === "number") nextTerm.gravity_reading_score = term.gravity_reading_score;
  if (typeof term.isLearnt === "boolean") nextTerm.isLearnt = term.isLearnt;
  if (typeof term.type === "string") nextTerm.type = term.type;

  return nextTerm;
}

function parseVocabTermsFromJson(content: string): VocabTerm[] {
  const parsed = JSON.parse(content) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("History content must be a JSON array.");
  }

  return parsed.filter(isVocabTerm).map((term) => sanitizeVocabTerm(term));
}

function getHistoryPreviewTitle(terms: VocabTerm[]): string {
  const preview = terms
    .slice(0, 3)
    .map((term) => term.japanese.trim())
    .filter(Boolean)
    .join("、");

  return preview || "Untitled history";
}

function getGeneratedHistoryTitle(key: string, isKeyHashed: boolean, terms: VocabTerm[]): string {
  if (isKeyHashed) {
    return getHistoryPreviewTitle(terms);
  }

  const normalized = key
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();

  return normalized.slice(0, 48) || getHistoryPreviewTitle(terms);
}

function createHistoryEntry(
  id: string,
  title: string,
  source: HistoryEntrySource,
  createdAt: string,
  terms: VocabTerm[],
): HistoryEntry {
  return {
    id,
    title: title.trim() || "Untitled history",
    source,
    createdAt,
    terms: terms.map((term) => sanitizeVocabTerm(term)),
  };
}

function normalizeStoredHistoryEntry(
  id: string,
  rawValue: unknown,
): HistoryEntry | null {
  if (isHistoryEntry(rawValue)) {
    return createHistoryEntry(
      id,
      rawValue.title,
      rawValue.source,
      rawValue.createdAt,
      rawValue.terms.filter(isVocabTerm),
    );
  }

  if (typeof rawValue === "string") {
    try {
      const terms = parseVocabTermsFromJson(rawValue);
      return createHistoryEntry(
        id,
        getHistoryPreviewTitle(terms),
        "generated",
        new Date().toISOString(),
        terms,
      );
    } catch {
      return null;
    }
  }

  return null;
}

function getStoredGameHistoryEntries(): Record<string, HistoryEntry> {
  const rawHistory = localStorage.getItem(GAME_HISTORY_STORAGE_KEY) ?? "{}";
  let parsed: unknown = {};

  try {
    parsed = JSON.parse(rawHistory) as unknown;
  } catch {
    return {};
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const entries = parsed as Record<string, unknown>;
  const nextEntries: Record<string, HistoryEntry> = {};

  for (const [id, value] of Object.entries(entries)) {
    const normalized = normalizeStoredHistoryEntry(id, value);
    if (normalized) {
      nextEntries[id] = normalized;
    }
  }

  return nextEntries;
}

function setStoredGameHistoryEntries(entries: Record<string, HistoryEntry>): void {
  localStorage.setItem(GAME_HISTORY_STORAGE_KEY, JSON.stringify(entries));
}

export function getGameHistoryEntry(key: string, isKeyHashed: boolean): HistoryEntry | null {
  const historyId = getHistoryId(key, isKeyHashed);
  const entries = getStoredGameHistoryEntries();
  return entries[historyId] ?? null;
}

export function getAllGameHistoryEntries(): Record<string, HistoryEntry> {
  return getStoredGameHistoryEntries();
}

export function updateGameHistoryTerms(
  key: string,
  terms: VocabTerm[],
  isKeyHashed = true,
): void {
  const historyId = getHistoryId(key, isKeyHashed);
  const entries = getStoredGameHistoryEntries();
  const existingEntry = entries[historyId];
  const sanitizedTerms = terms.filter(isVocabTerm).map((term) => sanitizeVocabTerm(term));

  entries[historyId] = createHistoryEntry(
    historyId,
    existingEntry?.title ?? getHistoryPreviewTitle(sanitizedTerms),
    existingEntry?.source ?? "generated",
    existingEntry?.createdAt ?? new Date().toISOString(),
    sanitizedTerms,
  );
  setStoredGameHistoryEntries(entries);
}

export function createManualGameHistory(
  title: string,
  terms: VocabTerm[],
): HistoryEntry {
  const createdAt = new Date().toISOString();
  const id = createHash("sha256")
    .update(`${title}:${createdAt}:${JSON.stringify(terms)}`)
    .digest("hex");
  const entries = getStoredGameHistoryEntries();
  const entry = createHistoryEntry(id, title, "manual", createdAt, terms);
  entries[id] = entry;
  setStoredGameHistoryEntries(entries);
  return entry;
}

export function appendGameHistory(key: string, content: string, isKeyHashed = false): void {
  const historyId = getHistoryId(key, isKeyHashed);
  const entries = getStoredGameHistoryEntries();
  const existingEntry = entries[historyId];
  const terms = parseVocabTermsFromJson(content);
  const source = existingEntry?.source ?? "generated";
  const title = existingEntry?.title ?? getGeneratedHistoryTitle(key, isKeyHashed, terms);
  const createdAt = existingEntry?.createdAt ?? new Date().toISOString();

  entries[historyId] = createHistoryEntry(
    historyId,
    title,
    source,
    createdAt,
    terms,
  );
  setStoredGameHistoryEntries(entries);
}

export function getGameHistory(key: string, isKeyHashed: boolean): string | null {
  const entry = getGameHistoryEntry(key, isKeyHashed);
  return entry ? JSON.stringify(entry.terms) : null;
}

export function removeGameHistory(key: string, isKeyHashed: boolean): void {
  const historyId = getHistoryId(key, isKeyHashed);
  const entries = getStoredGameHistoryEntries();
  delete entries[historyId];
  setStoredGameHistoryEntries(entries);
}

export function getAllGameHistories(): Record<string, string> {
  const entries = getStoredGameHistoryEntries();
  return Object.fromEntries(
    Object.entries(entries).map(([id, entry]) => [id, JSON.stringify(entry.terms)]),
  );
}
