export type HistoryStorageTarget = {
    key: string;
    isKeyHashed: boolean;
};

type ResolveHistoryStorageTargetOptions = {
    historyTermsKey?: string | null;
    search?: string;
    activeText?: string | null;
};

export function resolveHistoryStorageTarget(
    options: ResolveHistoryStorageTargetOptions,
): HistoryStorageTarget | null {
    const historyTermsKey = options.historyTermsKey?.trim();
    if (historyTermsKey) {
        return { key: historyTermsKey, isKeyHashed: true };
    }

    const search = options.search ?? "";
    const urlParams = new URLSearchParams(search);
    const isReviewHistory = urlParams.get("history") === "1";
    if (isReviewHistory) {
        const keyFromUrl = urlParams.get("historyTerms")?.trim();
        if (keyFromUrl) {
            return { key: keyFromUrl, isKeyHashed: true };
        }
    }

    const activeText = options.activeText?.trim();
    if (activeText) {
        return { key: activeText, isKeyHashed: false };
    }

    return null;
}

