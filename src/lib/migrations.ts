type JsonObject = Record<string, unknown>;

type MigrationResult = { value: unknown; changed: boolean };

const isJsonObject = (value: unknown): value is JsonObject =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const tryParseJson = (value: string): { ok: true; value: unknown } | { ok: false } => {
    try {
        return { ok: true, value: JSON.parse(value) as unknown };
    } catch {
        return { ok: false };
    }
};

const migrateRomanizationToKana = (value: unknown): MigrationResult => {
    if (Array.isArray(value)) {
        let changed = false;
        const next = value.map((item) => {
            const result = migrateRomanizationToKana(item);
            if (result.changed) changed = true;
            return result.value;
        });
        return { value: next, changed };
    }

    if (isJsonObject(value)) {
        let changed = false;
        const next: JsonObject = {};

        for (const [key, child] of Object.entries(value)) {
            if (key === "romanization") {
                if (!("kana" in value)) {
                    next.kana = child;
                    changed = true;
                }
                changed = true;
                continue;
            }

            const result = migrateRomanizationToKana(child);
            if (result.changed) changed = true;
            next[key] = result.value;
        }

        return { value: next, changed };
    }

    return { value, changed: false };
};

const migrateJsonString = (raw: string): { nextRaw: string; changed: boolean } => {
    const parsed = tryParseJson(raw);
    if (!parsed.ok) return { nextRaw: raw, changed: false };

    const result = migrateRomanizationToKana(parsed.value);
    if (!result.changed) return { nextRaw: raw, changed: false };

    return { nextRaw: JSON.stringify(result.value), changed: true };
};

const HISTORY_STORAGE_VERSION_KEY = "historyTermsVersion";
const HISTORY_STORAGE_VERSION = "2";

const isHistoryEntryLike = (value: unknown): value is JsonObject =>
    isJsonObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (value.source === "generated" || value.source === "manual") &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.terms);

const getHistoryPreviewTitle = (terms: unknown[]): string => {
    const preview = terms
        .filter(isJsonObject)
        .map((term) => term.japanese)
        .filter((japanese): japanese is string => typeof japanese === "string")
        .slice(0, 3)
        .join("、");

    return preview || "Untitled history";
};

const migrateHistoryTermsStorage = (): void => {
    const historyTerms = localStorage.getItem("historyTerms");
    if (!historyTerms) {
        localStorage.setItem(HISTORY_STORAGE_VERSION_KEY, HISTORY_STORAGE_VERSION);
        return;
    }

    const parsed = tryParseJson(historyTerms);
    if (!parsed.ok || !isJsonObject(parsed.value)) {
        return;
    }

    const currentVersion = localStorage.getItem(HISTORY_STORAGE_VERSION_KEY);
    const next: JsonObject = {};
    let changed = currentVersion !== HISTORY_STORAGE_VERSION;

    for (const [key, value] of Object.entries(parsed.value)) {
        if (typeof value === "string") {
            const migrated = migrateJsonString(value);
            const termsParsed = tryParseJson(migrated.nextRaw);
            if (!termsParsed.ok || !Array.isArray(termsParsed.value)) {
                continue;
            }

            next[key] = {
                id: key,
                title: getHistoryPreviewTitle(termsParsed.value),
                source: "generated",
                createdAt: new Date().toISOString(),
                terms: termsParsed.value,
            };
            changed = true;
            continue;
        }

        if (isHistoryEntryLike(value)) {
            const migratedTerms = migrateRomanizationToKana(value.terms);
            next[key] = {
                ...value,
                id: key,
                terms: migratedTerms.value,
            };
            if (migratedTerms.changed || value.id !== key) {
                changed = true;
            }
            continue;
        }
    }

    if (changed) {
        localStorage.setItem("historyTerms", JSON.stringify(next));
    }
    localStorage.setItem(HISTORY_STORAGE_VERSION_KEY, HISTORY_STORAGE_VERSION);
};

export const runLocalStorageMigrations = (): void => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
        return;
    }

    // Migrate known keys first for safety.
    const favoriteTerms = localStorage.getItem("favoriteTerms");
    if (favoriteTerms) {
        const { nextRaw, changed } = migrateJsonString(favoriteTerms);
        if (changed) localStorage.setItem("favoriteTerms", nextRaw);
    }

    migrateHistoryTermsStorage();

    // Fallback: scan all JSON-ish values in localStorage.
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (
            !key ||
            key === "favoriteTerms" ||
            key === "historyTerms" ||
            key === HISTORY_STORAGE_VERSION_KEY
        ) {
            continue;
        }
        const value = localStorage.getItem(key);
        if (!value) continue;
        const { nextRaw, changed } = migrateJsonString(value);
        if (changed) localStorage.setItem(key, nextRaw);
    }
};
