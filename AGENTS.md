# AGENTS.md

## Project Context

- This repository is a Next.js project using `pnpm`.
- Use `pnpm` for scripts and package commands (not `npm`).
- After you update a feature, always run `pnpm check` and look for errors rather than warnings(This includes both the project linter and the more robust `tsc --noEmit`).
- If you are worried about a warning you can ask the user for permission to fix. For errors you can fix without permission.
- The repo backlog source of truth is `BACKLOG.md`.
- If the user asks to "take the latest item from the backlog", select the bottom-most task still marked `[status: pending]`, change it to `[status: in_progress]` before coding, and mark it `[status: done]` after completing the work.
- Use the backlog entry format `- [status: ...]`, followed by `Context:` and `Page:` lines.
- Append newly requested backlog tasks to the bottom of the `## Tasks` section in `BACKLOG.md` so the newest task remains the latest item.
- Follow `.codex/workflows/BACKLOG_WORKFLOW.md` for the detailed backlog process.
- Typical commands:
    - `pnpm dev`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`

## Testing

- When changes are made to the UI, you should try to test in a browser directly to make sure the feature is working; it is not enough to only write code and run `pnpm check`.
- There are some limited jest tests in the **tests** folder. Please run with pnpm test at the end of workflow. It normally includes tests that call the LLM so may incur cost. So if in doubt always ask the user.
- Workflow tests that you can carry out in a browser environment are in .codex/workflows/\*.md. If you cannot use browser natively you can use the playwright tool.

### Playwright Shutdown

- Closing a Playwright tab is not enough. Agents must also ensure there are no leftover Playwright MCP worker processes after browser testing.
- Before ending browser-related work, explicitly verify whether any `playwright-mcp`, `@playwright/mcp`, `mcp-chrome`, or Playwright-managed Chrome processes are still running.
- If they are still running, shut them down so the next agent does not inherit a stale Playwright session.
- Do not report Playwright as closed unless both the browser session is closed and the related background Playwright processes have been verified as stopped.

## Commit Management

### Commit Message Format

Use compact, functionality-focused commit messages grouped by area tags.

Preferred structure:

```text
[all]
- <cross-cutting functional change>
- <cross-cutting functional change>

[home]
- <home/favorites/history functional change>

[gravity]
- <gravity functional change>

[match]
- <match functional change>
```

Rules:

- Start each line with one of: `[all]`, `[home]`, `[gravity]`, `[match]`.
- Describe user-facing or workflow functionality changes, not low-level code edits.
- Keep bullets short and specific.
- Include only sections relevant to the current changes.

### Diff + Summary Workflow

- When asked to summarize changes, run `git diff --word-diff` and summarize all current workspace changes (not just the latest edit).
- In addition to `git diff`, explicitly identify newly created/untracked files and inspect their full contents before summarizing changes.
- Do not require staging files just to inspect them; use any read-only method to view full file contents.
- Provide compact summaries by default unless a detailed summary is explicitly requested.
