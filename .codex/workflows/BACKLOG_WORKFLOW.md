# Backlog Workflow

## Purpose

Provide a single repo-local workflow for queuing tasks and letting an agent claim the latest backlog item without the user having to restate the rules each time.

## Source Of Truth

1. Use `BACKLOG.md` for all queued work.
2. Treat the bottom-most `pending` item as the latest backlog item.

## Claim Rules

1. Read `BACKLOG.md` before starting implementation.
2. Find the latest task with status `pending`.
3. Change its status to `in_progress` before editing code.
4. Do not silently skip a `pending` task unless the user explicitly redirects the priority.

## Completion Rules

1. Finish the requested change.
2. Run `pnpm check` after code changes.
3. Run browser verification for UI work when feasible.
4. Only run `pnpm test` if the user asked for it or approved the extra cost.
5. When the task is complete, change its status to `done`.

## Adding Tasks

1. Append new tasks to the bottom of the `## Tasks` section in `BACKLOG.md`.
2. Keep task titles short and action-oriented.
3. Put extra detail in `Context:` and `Page:` lines instead of making the title long.

## Status Conventions

1. `pending` means ready to start.
2. `in_progress` means actively owned by the current agent.
3. `done` means implemented and verified to the level required by `AGENTS.md`.

## Example

```md
- [status: pending] Tighten gravity answer matching
  Context: Accept common kana-only variants for the same term.
  Page: Gravity
```
