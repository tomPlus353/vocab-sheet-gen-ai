import type { VocabTerm } from "./types/vocab";

const REQUIRED_HEADERS = ["japanese",
     "kana", 
     "english_definition",
    //  "example_japanese",
    // "example_kana"
    // all headers should go here and optional ones should be commented out
    ] as const;

const HEADER_ALIASES: Record<string, (typeof REQUIRED_HEADERS)[number] | "isFavorite" | "gravity_score" | "gravity_reading_score" | "example_japanese" | "example_kana"> = {
    japanese: "japanese",
    term: "japanese",
    word: "japanese",
    kana: "kana",
    reading: "kana",
    english_definition: "english_definition",
    english: "english_definition",
    definition: "english_definition",
    meaning: "english_definition",
    isfavorite: "isFavorite",
    favorite: "isFavorite",
    gravity_score: "gravity_score",
    gravityscore: "gravity_score",
    score: "gravity_score",
    gravity_reading_score: "gravity_reading_score",
    gravityreading_score: "gravity_reading_score",
    gravity_reading: "gravity_reading_score",
    reading_score: "gravity_reading_score",
    example_japanese: "example_japanese",
    example_sentence_japanese: "example_japanese",
    example_sentences: "example_japanese",
    example_sentence: "example_japanese",
    example_kana: "example_kana",
    example_sentence_kana: "example_kana",
};

function parseDelimitedLine(line: string, delimiter: "," | "\t"): string[] {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === "\"") {
            if (inQuotes && nextChar === "\"") {
                current += "\"";
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === delimiter && !inQuotes) {
            cells.push(current.trim());
            current = "";
            continue;
        }

        current += char;
    }

    if (inQuotes) {
        throw new Error("Could not parse the pasted data because a quoted value is not closed.");
    }

    cells.push(current.trim());
    return cells;
}

function normalizeHeader(value: string): string {
    return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function parseBoolean(value: string): boolean | undefined {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
    return undefined;
}

function parseNumber(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseManualHistoryTerms(input: string): VocabTerm[] {
    const normalizedInput = input.trim();
    if (!normalizedInput) {
        throw new Error("Paste CSV or TSV content before saving.");
    }

    const lines = normalizedInput
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        throw new Error("Include a header row and at least one term row.");
    }

    const headerLine = lines[0]!;
    const delimiter: "," | "\t" =
        headerLine.includes("\t") && !headerLine.includes(",") ? "\t" : ",";

    const rawHeaders = parseDelimitedLine(headerLine, delimiter);
    const mappedHeaders = rawHeaders.map((header) => HEADER_ALIASES[normalizeHeader(header)] ?? null);

    const missingRequiredHeaders = REQUIRED_HEADERS.filter(
        (requiredHeader) => !mappedHeaders.includes(requiredHeader),
    );
    if (missingRequiredHeaders.length > 0) {
        throw new Error(
            `Missing required headers: ${missingRequiredHeaders.join(", ")}.`,
        );
    }

    if (mappedHeaders.every((header) => header === null)) {
        throw new Error("The header row was not recognized. Use headers like japanese, kana, and english_definition.");
    }

    const terms = lines.slice(1).map((line, index) => {
        const cells = parseDelimitedLine(line, delimiter);
        const row: Partial<VocabTerm> & { example_japanese?: string; example_kana?: string } = {};

        mappedHeaders.forEach((header, cellIndex) => {
            if (!header) return;
            const rawValue = cells[cellIndex]?.trim() ?? "";

            if (header === "isFavorite") {
                const parsedBoolean = parseBoolean(rawValue);
                if (parsedBoolean !== undefined) {
                    row.isFavorite = parsedBoolean;
                }
                return;
            }

            if (header === "gravity_score") {
                const parsedNumber = parseNumber(rawValue);
                if (parsedNumber !== undefined) {
                    row.gravity_score = parsedNumber;
                }
                return;
            }

            if (header === "gravity_reading_score") {
                const parsedNumber = parseNumber(rawValue);
                if (parsedNumber !== undefined) {
                    row.gravity_reading_score = parsedNumber;
                }
                return;
            }

            if (header === "example_japanese" || header === "example_kana") {
                if (rawValue) {
                    row[header] = rawValue;
                }
                return;
            }

            row[header] = rawValue;
        });

        if (!row.japanese || !row.kana || !row.english_definition) {
            throw new Error(
                `Row ${index + 2} is missing one of the required fields: japanese, kana, english_definition.`,
            );
        }

        const term: VocabTerm = {
            japanese: row.japanese,
            kana: row.kana,
            english_definition: row.english_definition,
            isFavorite: row.isFavorite,
            gravity_score: row.gravity_score,
            gravity_reading_score: row.gravity_reading_score,
        };

        // Add example sentences if both japanese and kana are provided
        if (row.example_japanese && row.example_kana) {
            term.example_sentences = [
                {
                    japanese: row.example_japanese,
                    kana: row.example_kana,
                },
            ];
        }

        return term;
    });

    if (terms.length === 0) {
        throw new Error("No valid terms were found in the pasted content.");
    }

    return terms;
}
