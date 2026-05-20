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
- [status: DONE] Enable logged in users to store history and favorites in the server DB.
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
- [status: done] Add long-term learning SRS style dashboard and gravity game
  - Decide on an SRS algorithm and package to use. I want to use an existing package instead of implementing my own SRS algorithm because it will save me time and I can be confident that the algorithm is well-tested and effective. Some popular SRS packages include Anki's SM-2 algorithm, SuperMemo's SM-18 algorithm, and the Leitner system. We will need to research these algorithms and choose the one that best fits my needs.
  - For each term, store SRS style stats. Actual implementation will depend on the SRS algorithm we choose, but generally we will need to store the date of the last review, the interval until the next review, the ease factor, and the repetition count for each term.
  - Create a new table in the database to store the SRS stats for each term, scoped to each user. This table will need to have a foreign key relationship with the terms table and the users table.
  - Implement the SRS algorithm to calculate the next review date for each term based on the user's performance. Store this data in the database for every time the term is reviewed in gravity.
  - Create a new dashboard page where users can see their SRS stats for each term, showing a 
  Page: /gravity + /dashboard(new)
- [status: PENDING] Separate history term favorites from global favorites, allowing users to toggle both in the ui.
  Context: Currently, the history component on the home page allows users to favorite terms and these terms are saved in two places: the history term favorites and the global favorites. This can be confusing for users because it creates a race condition and can lead to inconsistencies in the data. For example, if a user favorites a term in the history component, it is saved in both the history term favorites and the global favorites. If the user then unfavorites the term in the history component, it is only removed from the history term favorites but remains in the global favorites. This can lead to confusion for users because they may not understand why a term they unfavorited is still showing up in their global favorites. To solve this problem, I want to separate the history term favorites from the global favorites and allow users to toggle both in the UI. This way, when a user favorites a term in the history component, it is only saved in the history term favorites and does not affect the global favorites. Similarly, when a user unfavorites a term in the history component, it is only removed from the history term favorites and does not affect the global favorites.
  Page: /home + /favorites + /history + /gravity + /match
- [status: done] Monitor gravity game text box for immediate correct matches
  Context: Monitor text box to immediately mark correct and clear without requiring Enter key press.
  Page: /gravity
- [status: done] Monitor correction modal text box for immediate correct match
  Context: Automatically submit and close correction modal when typed text matches the correct term.
  Page: /gravity
- [status: PENDING] Replace separate reading and meaning modes with a single mode
  Context: Merge separate reading and meaning options into a single mode. Group terms in batches of max 10 terms. For each term, first test reading, then test meaning once its reading is learnt (gravity reading score of 2 or more).
  Page: /gravity + /match
