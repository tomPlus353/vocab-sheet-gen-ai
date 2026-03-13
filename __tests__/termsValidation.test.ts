const N1_TEXT =
    '政府は急速な少子高齢化への対応として、年金制度の抜本的な見直しを検討している。' +
    '財政の持続可能性を確保するためには給付と負担の均衡が不可欠であり、世代間の公平性をどう担保するかが焦点だ。' +
    '専門家の間では、積立方式の拡充や受給開始年齢の段階的引き上げなど、複数の選択肢が議論されている。';

type Term = {
    japanese: string;
    english_definition: string;
};

const stripParentheticalReadings = (input: string) =>
    input.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim();

const stripCodeFences = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.startsWith('```')) {
        return trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }
    return trimmed;
};

describe('terms extraction validation', () => {
    jest.setTimeout(60_000);

    it('returns terms derived from the input text', async () => {
        const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/llm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: N1_TEXT, mode: 'vocabGame' }),
        });

        expect(response.status).toBe(200);

        const payload = (await response.json()) as { jsonMarkdownString?: string };
        expect(payload.jsonMarkdownString).toBeTruthy();

        const jsonString = stripCodeFences(payload.jsonMarkdownString ?? '');
        const terms = JSON.parse(jsonString) as Term[];

        expect(Array.isArray(terms)).toBe(true);
        expect(terms.length).toBeGreaterThan(0);

        terms.forEach((term) => {
            const normalizedJapanese = stripParentheticalReadings(term.japanese);
            expect(normalizedJapanese).toBeTruthy();
            expect(N1_TEXT).toContain(normalizedJapanese);
            expect(term.english_definition).toBeTruthy();
        });
    });
});
