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
- [status: done] Add global menu to all pages.
  Context: Start only AFTER history and favorites standalone pages are implemented. Unfoldable menu located within the section header component. Suitable for SP and PC. Includes, home, history and favorites.
  Page: All
- [status: PENDING] Enable logged in users to store history and favorites in the server DB.
  Context: Currently users can only save data locally. I want
    - unregistered users - same experience up until now. History and Favorites stored in local storage.
    - registered users - history and favorites stored in the server DB. When they log in on a different device, they can see their history and favorites.
    - user transition - when a user registers for the first time, their local storage history and favorites are migrated to the server DB and and then the relevalant local storage is cleared.(only clear the local storage keys that were migrated)
  Page: All
- [status: PENDING] Store more detailed stats for all terms.
  Context: Create a new table in the DB that stores stats for each term. This will allow me to do more detailed analysis of the user's learning and make better recommendations. For example, I can store the number of times a term was practiced, the number of times it was answered correctly, the last time it was practiced, etc. Currently I just store gravity score, which is the number of times term is correct in a row.
  Page: All
- [status: PENDING] Change camera upload flow from modal to accordion/tab
  Context: Currently when the user clicks on the camera icon to upload a photo, a modal pops up. This can be a bit disruptive to the user experience. Instead, I want to change this flow to an accordion or tab that the user can use to toggle between text input and camera upload, with the selected option remembered by the browser. Also when text is uploaded, the user should be able to go directly to the ereader.
  Page: /home
- [status: PENDING] Add long-term learning SRS style dashboard and gravity game

  Page: /gravity + /dashboard(new)
