# Main Flow Workflow

## Purpose

End-to-end verification of the primary user flow from text input through games, history, and favorites.

## Preconditions

1. App is running at `http://localhost:3000`.
2. No existing history entries, or you will delete them as part of this flow.

## Test Data

Use N1-level Japanese text:

```
政府は急速な少子高齢化への対応として、年金制度の抜本的な見直しを検討している。財政の持続可能性を確保するためには給付と負担の均衡が不可欠であり、世代間の公平性をどう担保するかが焦点だ。専門家の間では、積立方式の拡充や受給開始年齢の段階的引き上げなど、複数の選択肢が議論されている。
```

## Steps

**Home (Setup)**

1. Go to `/`.
2. In History, delete the most recent history entry if present.
3. Paste the N1 text in the textarea and click `Submit`.

**Paginator**

1. Confirm navigation to `/paginator` and that the page shows the three sentences.
2. Click the Match action on the paginator.

**Match**

1. Wait at least 20 seconds for LLM-generated terms to load.
2. Confirm Match renders cards and a non-zero total score count (not `0/0`).
3. Play one correct match (any valid pair).
4. Click `Edit Terms` to open the modal.
5. Add favorites two words, e.g. `抜本的` and `財政`.
6. Close the modal.
7. Click `↩ Back to Ereader` to return to `/paginator`.

**Gravity**

1. Click the Gravity action on the paginator.
2. Confirm Gravity loads immediately (cached) and shows the same terms set count as Match.
3. Type a correct Japanese term for the current English prompt and click `Submit`.
4. Confirm the answer registers (score or learning counters update).
5. Click `↩ Back` to return to `/paginator`.

**Home (Favorites)**

1. Click `↩ Back to Ereader`, then `← Start Again` to return to `/`.
2. Verify Favorites shows `2` items and lists `抜本的` and `財政`.
3. Click `Study with Match` under Favorites and confirm only those two terms appear.

## Expected Results

1. History is cleared before the run.
2. Paginator renders the input text as a single page with three sentences.
3. Match renders terms after the LLM delay and allows gameplay.
4. Edit Terms modal opens and favorites are saved.
5. Gravity loads immediately from cache, shows the same term set count as Match, and accepts a correct answer.
6. Favorites list on Home reflects the two selected terms.
7. Favorites-only Match loads exactly those two terms.

## Notes

1. LLM-backed pages may take ~20 seconds to render cards; do not flag missing data until the wait is complete.
