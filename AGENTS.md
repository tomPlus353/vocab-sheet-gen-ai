# AGENTS.md

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

## Project Context

- This repository is a Next.js project using `pnpm`.
- Use `pnpm` for scripts and package commands (not `npm`).
- Typical commands:
  - `pnpm dev`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
