import { resolveHistoryStorageTarget } from "../src/lib/history-storage-target";

describe("resolveHistoryStorageTarget", () => {
    it("prefers an explicit historyTermsKey", () => {
        expect(
            resolveHistoryStorageTarget({
                historyTermsKey: "abc123",
                search: "?history=1&historyTerms=ignored",
                activeText: "ignored",
            }),
        ).toEqual({ key: "abc123", isKeyHashed: true });
    });

    it("uses historyTerms from URL when history=1", () => {
        expect(
            resolveHistoryStorageTarget({
                search: "?history=1&historyTerms=fromUrl",
                activeText: "active",
            }),
        ).toEqual({ key: "fromUrl", isKeyHashed: true });
    });

    it("falls back to activeText when no history context exists", () => {
        expect(
            resolveHistoryStorageTarget({
                search: "?favorites=1",
                activeText: "some text",
            }),
        ).toEqual({ key: "some text", isKeyHashed: false });
    });

    it("returns null when no key is available", () => {
        expect(
            resolveHistoryStorageTarget({
                search: "",
                activeText: null,
            }),
        ).toBeNull();
    });
});
