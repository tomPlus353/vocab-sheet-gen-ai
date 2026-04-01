# Kanji Mode TODO

Based on direct browser testing of the live kanji page.

## Priority Issues

### 1. Remove the false empty state shown behind the start modal
Observed behavior:
- On first load, the page renders `No kanji prompts available.` behind the `Study These Kanji?` modal.
- The modal still contains valid kanji and allows the run to start.

Why this matters:
- It gives contradictory status at the exact moment the user is deciding whether the feature worked.

Acceptance criteria:
- Do not render the empty-state message while the study-confirm modal is open.
- Only show the empty state when there are truly no loaded terms and no pending start flow.

### 2. Make the required answer format explicit in game mode
Observed behavior:
- In `Main Game`, the prompt showed kana in context and the input said `Type the kanji word`.
- It was easy to answer with kana instead of the expected kanji word.
- The UI does not clearly explain whether the user should type a kanji character, the full word, kana, or the missing phrase.

Why this matters:
- This is the main source of avoidable mistakes.

Acceptance criteria:
- Add helper text above the input that explicitly says the user must enter the full kanji word.
- Keep that helper text visible before submission, not only after an error.
- Ensure game and practice modes have distinct, unambiguous instructions.

### 3. Simplify the incorrect-answer recovery state
Observed behavior:
- After a wrong answer, the screen shows a large feedback panel with kanji details, word details, mastery state, rewrite input, and follow-up messaging.
- The next action is present, but the amount of text competes with it.

Why this matters:
- Error recovery should be fast and obvious, not cognitively heavy.

Acceptance criteria:
- Make the rewrite action the primary visual focus.
- Reduce or collapse secondary detail blocks.
- Keep the key correction information visible without forcing the user to scan a dense panel.

### 4. Clarify rewrite expectations during recovery
Observed behavior:
- The rewrite field says `Write the word once`.
- If the rewrite is wrong, the follow-up message says `Write the exact kanji once to continue.`
- This is better than nothing, but still arrives only after failure.

Why this matters:
- The user should not have to fail twice to understand the exact rule.

Acceptance criteria:
- Make the rewrite instruction explicit before the user presses confirm.
- Use language that matches the actual validation rule.
- If feasible, show the expected format more directly in the recovery state.

### 5. Fix misleading practice-mode progress updates
Observed behavior:
- In `Practice Once`, after a wrong answer, `Remaining` dropped from `2` to `1` before the rewrite was completed.
- The user had not actually completed the item yet, but the summary already suggested progress.

Why this matters:
- Progress indicators should reflect actual completion, not internal state transitions.

Acceptance criteria:
- Do not decrement `Remaining` or increment `Completed` until the rewrite step is successfully finished.
- Keep progress counters aligned with what the user would reasonably call done.

### 6. Rename mode labels to be clearer and more consistent
Observed behavior:
- The UI uses `Main Game`, `Start Main Game`, `Practice Once`, and `One Pass`.
- These labels describe related concepts but do not use one stable vocabulary set.

Why this matters:
- The mode model is understandable, but the naming adds friction.

Acceptance criteria:
- Choose one consistent label set across modal, toggle, status cards, and descriptions.
- Replace `Practice Once` and `One Pass` with clearer study-oriented language.

### 7. Make restart behavior easier to understand
Observed behavior:
- `Restart Run` is always visible, but it is not obvious whether it resets current progress, reloads the same terms, or re-fetches kanji generation.

Why this matters:
- Restart is a destructive action for the current session and should be predictable.

Acceptance criteria:
- Clarify in the label or nearby copy what `Restart Run` does.
- Add confirmation if the action can unexpectedly wipe meaningful progress.

### 8. Replace internal progress language with clearer study language
Observed behavior:
- Main game shows `Ladder: new | learning | mastered`.
- The state is technically understandable, but it reads like internal implementation language.

Why this matters:
- Study progress should feel like user-facing feedback, not debug terminology.

Acceptance criteria:
- Rephrase or redesign this status so it reads as learning progress.
- Preserve the counts, but present them in more natural language.

### 9. Add lightweight input help for Japanese typing
Observed behavior:
- The page assumes the user can enter the correct kanji form.
- There is no hint about IME expectations or what to do if typing setup gets in the way.

Why this matters:
- Some wrong answers may be input friction, not knowledge failure.

Acceptance criteria:
- Add a small, unobtrusive hint near the input where relevant.
- Keep it visible enough to help first-time users without cluttering the layout.

### 10. Add a softer exit path during active study
Observed behavior:
- The user can `Back` or `Restart Run`, but there is no explicit `Skip` or `End Session` action during the learning loop.

Why this matters:
- Users need a lower-friction way to recover from frustration or leave the mode intentionally.

Acceptance criteria:
- Add a clear non-destructive exit or skip option.
- Explain how that action affects progress, score, or mastery.

## Secondary Notes

### 11. Keep correct-answer feedback shorter
Observed behavior:
- After a correct answer, the page still shows a fairly large feedback block before moving on.
- The user mainly needs confirmation and the next action.

Acceptance criteria:
- Keep success feedback concise.
- Make `Next Term` the dominant action.

### 12. Improve empty and error-state guidance
Observed behavior:
- The current page can show very generic fallback states such as `No kanji prompts available.`

Acceptance criteria:
- Differentiate between no source text, no generated kanji, and load failure.
- Include a concrete next step in each state.
