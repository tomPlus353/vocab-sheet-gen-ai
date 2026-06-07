"use client";

import type { HistoryEntry } from "@/lib/types/vocab";

type HistorySyncLogLevel = "info" | "warn" | "error";

type HistorySyncLogDetails = Record<string, unknown>;

function getConsoleMethod(level: HistorySyncLogLevel) {
    if (level === "warn") return console.warn.bind(console);
    if (level === "error") return console.error.bind(console);
    return console.info.bind(console);
}

export function logHistorySyncEvent(
    event: string,
    details: HistorySyncLogDetails = {},
    level: HistorySyncLogLevel = "info",
) {
    const payload = {
        at: new Date().toISOString(),
        event,
        ...details,
    };

    getConsoleMethod(level)("[history-sync]", payload);
}

export function summarizeHistoryEntry(entry: HistoryEntry) {
    return {
        entryId: entry.id,
        title: entry.title,
        source: entry.source,
        termCount: entry.terms.length,
    };
}
