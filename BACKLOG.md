# Backlog

## Tasks

- [status: DONE] Add extinction mode to gravity
  Context: Stop spawning learnt terms so gravity can be finished faster by focusing only on remaining unlearnt terms.
  Page: Gravity
- [status: DONE] Add "test reading" checkbox to gravity.
  Context: Currently vocabTerm's english definition is used as prompt. Instead use the KANJI as prompt and the user has to reproduce that same Kanji by typing it. So the prompt should be like "Write: {$card.kanji}"
  Page: /gravity
- [status: DONE] Add dedicated history page
  Context: consists of the common history component on the home page + propose some new features to the user.
  Page: /history(new)
- [status: DONE] Add dedicated favorites page
  Context: consists of the common favorites component on the home page + propose some new features to the user.
  Page: /favorites(new)
- [status: DONE] Do not allow extintion mode when all terms are learnt
  Context: Currently when the user wants to "keep practicing" after all terms are DONE and extintion mode it clicked, the user cannot see any terms because of the extintion filter. So exinction should be 1) disabled when all terms for a particular mode are learnt(with hover message and clear UI that shows it is disabled and why) AND 2) if the user wants to study again when extinction mode is ON, simply deactivate extinction mode. 
  Page: /gravity
- [status: PENDING] Add global menu to all pages.
  Context: Start only AFTER history and favorites standalone pages are implemented. Unfoldable menu located within the section header component. Suitable for SP and PC. Includes, home, history and favorites.
  Page: All
