import {
    flipSrsPromptType,
    getRandomSrsPromptType,
    resolveSrsPromptType,
} from "@/lib/srs-prompt";

describe("SRS prompt rotation", () => {
    it("flips reading and meaning prompts", () => {
        expect(flipSrsPromptType("reading")).toBe("meaning");
        expect(flipSrsPromptType("meaning")).toBe("reading");
    });

    it("defaults unknown prompt values to reading", () => {
        expect(resolveSrsPromptType(undefined)).toBe("reading");
        expect(resolveSrsPromptType("bad-value")).toBe("reading");
        expect(resolveSrsPromptType("meaning")).toBe("meaning");
    });

    it("returns a valid random prompt type", () => {
        expect(["reading", "meaning"]).toContain(getRandomSrsPromptType());
    });
});
