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

    const historyTerms = localStorage.getItem("historyTerms");
    if (historyTerms) {
    const parsed = tryParseJson(historyTerms);
    if (parsed.ok && isJsonObject(parsed.value)) {
        let changed = false;
        const next: JsonObject = {};
        for (const [key, value] of Object.entries(parsed.value)) {
                if (typeof value === "string") {
                    const migrated = migrateJsonString(value);
                    if (migrated.changed) changed = true;
                    next[key] = migrated.nextRaw;
                } else {
                    const result = migrateRomanizationToKana(value);
                    if (result.changed) changed = true;
                    next[key] = result.value;
                }
            }
            if (changed) {
                localStorage.setItem("historyTerms", JSON.stringify(next));
            }
        }
    }

    // Fallback: scan all JSON-ish values in localStorage.
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || key === "favoriteTerms" || key === "historyTerms") continue;
        const value = localStorage.getItem(key);
        if (!value) continue;
        const { nextRaw, changed } = migrateJsonString(value);
        if (changed) localStorage.setItem(key, nextRaw);
    }
};
