# Page Specifications

This document outlines each route in the vocab-sheet-gen-ai application.

---

## `/` — Home / Text Input Page

**Purpose:** Primary entry point for creating study materials from any text.

### Features

- **Text Input Area**: Large textarea for pasting text content
- **Settings Panel**: Configure number of sentences per page (`perPage` from SettingsProvider)
- **History & Favorites**: View previously processed texts and favorited terms
- **Navigation**: Links to `/upload` for file-based input

### Data Flow

1. User pastes text → stored in `localStorage.activeText`
2. Text is split into sentences array → stored in `localStorage.textArray`
3. User navigates to `/paginator` to read through pages
4. On paginator, user can launch `/match` or `/gravity` games

### Key Components

- `InputTextArea` — Text input with submit handler
- `HistoryAndFavorites` — List of past texts and saved favorites

---

## `/paginator` — E-Reader / Paginated View

**Purpose:** Break text into manageable chunks for reading practice.

### Features

- **Pagination**: Navigate through text in chunks (configurable via settings)
- **Keyboard Navigation**: Arrow keys (← →) for previous/next page
- **Page Indicators**: Shows current page / total pages
- **Quick Actions**:
    - "Match" button → Launch matching game for current page
    - "Gravity" button → Launch gravity typing game for current page
- **Cheatsheet Modal**: View vocabulary for current page

### URL Parameters

- `?page=N` — Navigate to specific page

### Data Flow

1. Reads `textArray` from localStorage (set by home page)
2. Slices array based on `perPage` setting
3. Stores current page text in `localStorage.activeText`
4. Game pages read from `activeText` to generate vocabulary

### Key Components

- `Paginator` — Main pagination logic and UI
- `Modal` — Cheatsheet popup showing vocab terms

---

## `/match` — Matching Game

**Purpose:** Vocabulary reinforcement through pair-matching gameplay.

### Gameplay

- Cards split into two columns (front: Japanese, back: English)
- Select two cards to attempt a match
- Correct match: cards disappear, score increases
- Incorrect match: cards deselect, can try again

### Features

- **Multiple Rounds**: Terms divided into sets of 5 per round
- **Score Tracking**: Count of correct matches
- **Timer**: Elapsed time since game start
- **Keyboard Shortcuts**:
    - `a-z` keys to select cards (1-26)
    - `Enter` to restart game
    - `← →` to change rounds
- **Settings**:
    - Toggle reading/romanization visibility (`isHideReading`)
    - Test reading mode (`isTestReading`)
    - Favorites-only mode
- **Round Management**: Navigate between rounds if >5 terms
- **Edit Terms Modal**: Modify vocabulary before/after generation

### Data Flow

1. Reads `activeText` from localStorage
2. Calls `/api/llm` with `mode: "vocabGame"` to generate terms
3. Terms cached in localStorage by text hash
4. Cards shuffled and displayed
5. Score and progress saved to localStorage

### Key Components

- `GameControls` — Settings, round selector, restart
- `GameStats` — Score, timer, round info
- `EditTermsModal` — Modify generated terms

---

## `/gravity` — Gravity Typing Game

**Purpose:** Typing practice with falling vocabulary cards.

### Gameplay

- Terms appear as cards falling from top of screen
- Each card shows English definition
- User types Japanese term to "gravity" the card down
- Correct answer: card falls and disappears, score increases
- Wrong answer: card stays, can try again (or triggers correction modal after 2 fails)
- Game over if term reaches bottom after 2 wrong attempts

### Features

- **Progressive Difficulty**: Fall speed increases with score
- **Mastery System**:
    - 2 consecutive correct answers = "learnt" (green)
    - 1 correct = "learning" (blue)
    - 0 correct = "unlearnt" (default)
- **Reading Hint**: Toggle romanization hint display
- **Correction Modal**: After 2 wrong attempts, modal allows retry or quit
- **Progress Tracking**: Learning/Unlearnt/Learnt counts displayed
- **Timer**: Elapsed game time
- **Edit Terms Modal**: Modify vocabulary during game
- **All Learnt Modal**: Congratulatory modal when all terms mastered
- **Persistence**: Progress saved to localStorage

### Game Over Conditions

1. Term reaches bottom after 2 wrong attempts
2. All terms marked as "learnt" (optional: continue practicing)

### Data Flow

1. Reads from `activeText`, `favoriteTerms`, or `historyTerms` (via URL params)
2. Calls `/api/llm` if not cached
3. Terms stored with `gravity_score` (0-2+)
4. Score persists to localStorage after each answer

### Key Components

- `useGravityGame` hook — All game logic
- `GameControls` — Settings, reset, edit terms
- `CorrectionModal` — Retry interface after failures
- `AllLearntModal` — Completion celebration

### URL Parameters

- `?favorites=1` — Load only favorite terms
- `?history=1&historyTerms=HASH` — Load terms from specific history entry

---

## `/upload` — File Upload

**Purpose:** Upload text files to extract content for study.

### Features

- File picker for text-based files
- FileReader parses file content
- Extracted text displayed in textarea
- Text can be copied/pasted to home page

### Supported Input

- Plain text files (.txt)
- Any text-based file readable by FileReader

---

## `/t3` — tRPC Demo Page

**Purpose:** Legacy/boilerplate page demonstrating tRPC integration.

### Features

- Server-side data fetching with tRPC
- Authentication display (logged in/out)
- Sample post fetching with HydrateClient
- Links to source code and main app

### Note

This appears to be a demo/boilerplate page from the T3 Stack initialization that was not fully integrated into the main app flow.

---

## API Routes

### `/api/llm` (POST)

Generates vocabulary terms from text using AI.

**Request Body:**

```json
{
    "text": "source text content",
    "mode": "vocabGame"
}
```

**Response:**

```json
{
  "jsonMarkdownString": "[{ "japanese": "...", "romanization": "...", "english_definition": "...", "isFavorite": false, "gravity_score": 0 }]"
}
```

### `/api/auth/[...nextauth]` (ALL)

NextAuth.js authentication handlers for sign-in/sign-out.

### `/api/trpc/[trpc]` (ALL)

tRPC router endpoint for type-safe API calls.

---

## Data Storage

### localStorage Keys

| Key                        | Description                    |
| -------------------------- | ------------------------------ |
| `activeText`               | Current page text (JSON array) |
| `textArray`                | Full text split into sentences |
| `favoriteTerms`            | User's favorited vocabulary    |
| `numSentences` / `perPage` | Sentences per page setting     |
| `lastPaginatorPage`        | Last viewed page number        |
| Game history hashes        | Cached vocabulary by text hash |

---

## User Flow

```
Home (paste text)
    ↓
Paginator (read pages)
    ↓
    ├→ Match (matching game)
    └→ Gravity (typing game)
         ↓
    [Practice until mastered]
```

```
Home → Favorites → Match/Gravity (favorites mode)
Home → History → Match/Gravity (history mode)
```
