# Terms Extraction Validation Workflow

## Purpose
Verify that extracted vocabulary terms originate from the target input text by querying the `/api/llm` endpoint directly.

## Preconditions
1. App is running at `http://localhost:3000`.
2. You can run a local HTTP request tool (`curl` preferred).

## Test Data
Use the same N1-level Japanese text:
```
政府は急速な少子高齢化への対応として、年金制度の抜本的な見直しを検討している。財政の持続可能性を確保するためには給付と負担の均衡が不可欠であり、世代間の公平性をどう担保するかが焦点だ。専門家の間では、積立方式の拡充や受給開始年齢の段階的引き上げなど、複数の選択肢が議論されている。
```

## Steps
**Run the Test**
1. Start the dev server in another terminal: `pnpm dev`.
2. Run the tests: `pnpm test`.

**API Call**
1. POST to `/api/llm` with `mode: "vocabGame"` and the test text.
   ```bash
   curl -s http://localhost:3000/api/llm \
     -H "Content-Type: application/json" \
     -d '{
       "text": "政府は急速な少子高齢化への対応として、年金制度の抜本的な見直しを検討している。財政の持続可能性を確保するためには給付と負担の均衡が不可欠であり、世代間の公平性をどう担保するかが焦点だ。専門家の間では、積立方式の拡充や受給開始年齢の段階的引き上げなど、複数の選択肢が議論されている。",
       "mode": "vocabGame"
     }'
   ```
2. Copy the `jsonMarkdownString` from the response and parse it into JSON.

**Verification**
1. Confirm every `japanese` term appears verbatim in the input text.
2. Confirm each `english_definition` corresponds to the in-context sense (not unrelated homographs).
3. Flag any term that is not present in the source text or is semantically unrelated.

## Expected Results
1. The response contains a valid `jsonMarkdownString` array of terms.
2. All `japanese` terms are present in the original text.
3. Definitions are consistent with the text context.

## Notes
1. If the response is wrapped as Markdown, strip the code fences before parsing.
