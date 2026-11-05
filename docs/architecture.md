# Architecture

## Overview

A static single-page app (React + TypeScript, built with Vite), hosted on GitHub Pages.
There is **no backend**. Everything runs in the browser.

```
vocabulary JSON (in repo, maintained by hand)  ──►  bundled into the app at build time
learning progress (per device)                 ──►  IndexedDB in the browser
small UI preferences (language, …)             ──►  localStorage (Zustand `persist`)
moving progress between devices                ──►  manual JSON export / import
```

### Data ownership

- **Vocabulary is content.** It is maintained by the user in a JSON file in the repository
  (see [vocabulary-format.md](vocabulary-format.md)). The app never modifies it. New words reach
  the app via a commit → CI → redeploy.
- **Progress is user state.** It is stored in IndexedDB and keyed by the stable word `id`
  from the vocabulary file. It must survive vocabulary edits: a renamed translation keeps its
  progress, while a removed word's progress is ignored (not deleted, in case the word comes back).
- **Preferences** (UI language etc.) are tiny and live in localStorage through Zustand's
  `persist` middleware. Never put progress into localStorage. They're per device on purpose,
  e.g. the special-character bar: `diacriticsBar` is `null` until the user chooses, and
  `useDiacriticsBarEnabled()` then falls back to the device default (on for desktop, off for
  touch devices, detected once via `(hover: none) and (pointer: coarse)`).

## Scheduling and progress

- `src/domain/scheduling.ts` wraps **ts-fsrs** (FSRS-7). Each word has two cards, `hr-de` and
  `de-hr`, scheduled independently.
- A card has no stored progress until its first review; until then it is "new".
  `buildStudyQueue()` returns the due cards (most overdue first) and the new cards (file order).
- `reviewCard()` returns the card's new FSRS state and a history entry. Both are saved together
  by `saveReview()` in `src/storage/progressRepository.ts`.
- IndexedDB database `bks-learning` (`src/storage/database.ts`):

  | Store      | Key                   | Value                                            |
  | ---------- | --------------------- | ------------------------------------------------ |
  | `progress` | `[wordId, direction]` | `CardProgress`: current ts-fsrs card             |
  | `reviews`  | auto-increment        | `ReviewRecord`: rating, time, ts-fsrs review log |

  Dates are stored as `Date` objects (IndexedDB clones them natively).
- The ts-fsrs card object is stored as-is. Upgrading ts-fsrs to a version with a different card
  shape needs a database migration.

## Study session

- `src/features/learn/learningService.ts` is the UI's single entry point: `loadStudyQueue()`
  and `recordAnswer()` (schedules, saves, returns the new progress). It keeps one shared
  scheduler, created while the queue loads.
- `src/domain/studySession.ts` is the session state machine used with `useReducer`:
  - Order: due cards first, then new words in groups of 5 (hr-de of the group, then de-hr).
  - Phases: `question` → `revealed` (hr-de, self-rated) or `checked` (de-hr, typed).
  - A card that is due again within 20 minutes (e.g. after _Again_) is appended to the queue.
  - `ratingOptions()` decides which rating buttons are shown and which is the default.
- `src/domain/answerCheck.ts` checks typed answers strictly: only wrong/missing diacritics count
  as "almost" (verdict `diacritics`). Case, extra spaces and sentence punctuation are ignored.
- Every answer is saved before the next card is shown, so leaving mid-session loses nothing.
- `DiacriticsBar` (č ć đ š ž) below the typed-answer field inserts at the caret. Its buttons
  prevent `mousedown` so the field keeps focus, and `AnswerForm` uses `flushSync` to place the
  caret after the inserted letter.
- **Alt+.** (Option+. on macOS) in the answer field toggles the letter before the caret:
  c → č → ć → c, s ↔ š, z ↔ ž, d ↔ đ (`toggleDiacritic` in `src/domain/diacritics.ts`). It
  works whether or not the bar is shown. Matched by `event.code === "Period"` (layout
  independent) with `event.key === "."` as a fallback. AltGr is excluded.
- Keyboard (desktop): Space/Enter reveals, 1–n picks a rating, Enter picks the default. Handled
  in `StudySession` with `useEffectEvent`. Enter/Space on a focused button or link is left to the
  browser.

## Folder layout

```
src/
  main.tsx            entry point, mounts <App/>
  app/                app shell: layout, header, routes
  features/<name>/    one folder per feature (home, learn, words, …): components + CSS modules
  domain/             pure TypeScript logic, no React, no browser APIs → unit tested
  data/               vocabulary.json (hand-maintained), its JSON schema, and the loader
  storage/            IndexedDB access via `idb` (database schema, repositories)
  i18n/               i18next setup, UI translations (de = source of truth, en), key typing
  settings/           Zustand store for user preferences
  ui/                 small shared components (Button)
  styles/global.css   design tokens (CSS custom properties) + minimal reset
public/               static files copied as-is (icons); generated by `yarn icons`
scripts/              small Node scripts used during development
docs/                 this documentation
```

Dependency direction: `app → features → (data, domain, storage, i18n, settings)`. `domain` imports
nothing from the others.

## Navigation

Routing uses **wouter** with `useHashLocation` (URLs like `#/learn`), because GitHub Pages can't
serve an SPA fallback for path URLs. Real history entries make the phone's back button work.
Paths live in `src/app/routes.ts`; the routes are declared in `App.tsx`.

| Route       | Screen                                      |
| ----------- | ------------------------------------------- |
| `/`         | Home: due/new counts, start button          |
| `/learn`    | Study session (`features/learn/LearnPage`)  |
| `/settings` | Settings (`features/settings/SettingsPage`) |

Leaving a session ("Beenden", "Zur Startseite") uses `replace`, so going back from the start
page doesn't return to an ended session.

## Internationalisation

Uses **i18next** with **react-i18next**.

- `src/i18n/messages/de.ts` defines all keys as nested objects. `en.ts` is typed as `Messages`,
  so a missing or extra key is a compile error.
- `src/i18n/i18next.d.ts` registers the German messages with i18next's `CustomTypeOptions`, so
  `t()` only accepts existing keys.
- `setupI18n()` (called in `main.tsx`) initialises i18next synchronously from the bundled
  messages. The **settings store owns the selected locale** (persisted in localStorage) and
  i18next follows its changes.
- Components call `const { t } = useTranslation()` from `react-i18next`.
- i18next syntax: `{{name}}` for interpolation, plurals through `_one` / `_other` key suffixes,
  called without the suffix: `t("home.wordCount", { count })`.
- Only UI texts are translated. Vocabulary is always Croatian ↔ German.

## PWA

`vite-plugin-pwa` generates a service worker that precaches the build, so the app works offline
and can be installed on a phone's home screen. `registerType: "autoUpdate"`: a new deployment is
picked up on the next visit after it has been downloaded in the background.
