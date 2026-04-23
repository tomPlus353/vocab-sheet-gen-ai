# Backlog Operator

Use this skill when the user wants work to be managed through the repository backlog instead of restating tasks manually.

## Goal

Operate on the shared backlog consistently so the latest pending item can be claimed, implemented, and closed out with minimal ambiguity.

## Source Of Truth

1. Read `BACKLOG.md`.
2. Follow `.codex/workflows/BACKLOG_WORKFLOW.md`.

## Operating Rules

1. Interpret "latest backlog item" as the bottom-most task still marked `pending`.
2. Mark that item `in_progress` before starting code changes.
3. After implementation and required verification, mark it `done`.
4. If blocked, keep it `in_progress` and append a short blocker note to the task.
5. Add newly requested tasks to the bottom of the `## Tasks` section.

## Task Format

```md
- [status: pending] Short task title
  Context: optional detail
  Page: area or route affected
```
