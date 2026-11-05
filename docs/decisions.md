# Decision log

Newest first. One short entry per decision: what was decided, and why.

## 2026-11-05: Keep learning after a session

- **Two extra modes**, both chosen by the owner: _Vorlernen_ (review ahead: the cards due
  soonest, answers saved) and _Freies Üben_ (random learned cards, nothing saved).
- **Rounds of 20 cards**, after each round you can start another one.
- Free practice still runs the scheduler in memory, so a forgotten card comes back within the
  round, but nothing reaches IndexedDB.
- Offered on the session summary and in a "Mehr üben" section on the home page.

## 2026-11-05: React Compiler

- **React Compiler via Babel** (`babel-plugin-react-compiler` 1.0 with `@rolldown/plugin-babel`
  and `@babel/core`, all dev-only), using `reactCompilerPreset()` from `@vitejs/plugin-react`.
  The owner chose it over the Rust port (`oxc-transform-react`), which plugin-react marks as
  experimental and which only supports a narrow version range.
- **`rolldown` peer marked optional** via `packageExtensions` in `.yarnrc.yml`:
  `@rolldown/plugin-babel` runs inside Vite, which ships rolldown itself.
- **No manual memoisation** from now on (see coding guidelines). Three components needed small
  changes to compile (`try … finally`, a destructuring default, and wouter's hook-as-prop in
  `App`, which was split off into a wrapper).

## 2026-11-05: Manual light/dark theme

- **A sun/moon toggle in the header** switches between light and dark. The settings page also
  offers "Wie Gerät" (follow the device), which is the default.
- **The theme is applied as `data-theme` on `<html>`**, and CSS only reacts to that attribute.
  Doing it in JS keeps the dark tokens in one place (CSS can't combine "media query OR
  attribute" without duplicating the block).
- **An inline script in index.html** sets the attribute before React loads, to avoid a flash of
  the wrong theme.

## 2026-11-05: Keyboard shortcut for special letters

- **One toggle shortcut, Alt+.**, instead of one shortcut per letter. You type the base letter
  and press Alt+. to cycle it (c → č → ć → c, s ↔ š, z ↔ ž, d ↔ đ).
- Why not Alt+letter: on Windows/Linux, Alt+D focuses the address bar in Chrome, Edge and
  Firefox. Firefox opens menus with Alt+letter, including locale-specific ones (Alt+S History,
  German Alt+C "Chronik", Alt+A "Ansicht"). Ctrl+… and Alt+digit are taken by browser and tab
  shortcuts. Alt+. has no browser or OS meaning on Windows, Linux or macOS (where Option+.
  would only type "≥").
- AltGr is excluded so typing characters on layouts that use it is never intercepted.

## 2026-11-05: Special-character bar and settings page

- **A bar with č ć đ š ž below typed answers.** On by default on desktop. On phones it's off by
  default, because their keyboards usually make these letters easy, and can be enabled in the
  settings. The setting is per device (localStorage).
- **Device detection** is a one-off `matchMedia("(hover: none) and (pointer: coarse)")` check:
  a plain browser API, no library needed.
- **Settings page** at `#/settings`, reachable via a gear icon in the header (Feather Icons'
  "settings" path, MIT, inlined as SVG instead of adding an icon library).

## 2026-11-05: Learning session

- **`wouter`** with hash routing instead of view state, mainly so the phone's back button works.
- **Strict answer checking**, no typo tolerance: only diacritic mistakes count as "almost".
- **A wrong typed answer defaults to _Again_**, with an "I was right" override (rates _Good_).
- **New words in groups of 5** (hr-de first, then de-hr), so a word isn't typed right after
  it was first seen.
- **Cards due within 20 minutes are repeated in the same session** (Anki's default learn-ahead
  limit).
- **No component tests for now.** Domain logic is unit-tested and the UI is checked by hand.
  React Testing Library would need the owner's approval.

## 2026-11-05: Scheduling and progress storage

- **ts-fsrs 6 with FSRS-7** and its default settings: 90% desired retention, fuzz on, learning
  steps 1m/10m, relearning step 10m. FSRS-7 may skip learning steps when it's confident, e.g. a
  new card rated _Good_ goes straight to a few days.
- **Two cards per word** (`hr-de`, `de-hr`), scheduled independently. Both directions of a new
  word may be studied on the same day.
- **No daily limit for new words.** The owner wants to study as much or as little as they like.
- **`idb`** (thin promise wrapper with a typed schema) instead of a hand-written IndexedDB
  wrapper. The owner chose it.
- **`fake-indexeddb`** (dev only) so the storage code is covered by real tests in Node.
- **Every answer is kept** in a `reviews` store, for statistics and a possible later FSRS
  parameter optimisation.
- **Node ≥ 24** required (ts-fsrs's engine requirement; CI already uses Node 24).

## 2026-11-05: i18next instead of hand-written i18n

- **i18next + react-i18next** replace the small hand-written translation helper. The owner
  prefers a well-known library over custom code, and we get plurals and formatting.
- The settings store (Zustand) keeps owning the selected locale. A language-detector plugin
  wasn't added: German is the default and the choice is persisted already.
- **Working agreement:** whenever something could be hand-written or taken from a library, the
  owner decides (see [coding-guidelines.md](coding-guidelines.md)).

## 2026-11-05: Vocabulary format and scheduling

- **Flat word list with optional `tags`** instead of nested lessons. Lessons don't matter for
  scheduling. Tags still allow filtering (by lesson or topic), and a word can carry several.
  The file order is the order in which new words are introduced.
- **UUIDs as word ids**, generated by the owner when adding words. Progress is keyed by id, so
  ids are stable even when a typo in a term is fixed.
- **JSON Schema (draft-07) for editor support** plus a **hand-written validator** that is the
  authoritative check, so no schema library is needed. Tests check that the vocabulary file is
  valid and that schema and validator allow the same properties and enum values. Cross-field
  rules (gender only on nouns, aspect only on verbs) are enforced by both.
- **`ts-fsrs` approved** as a runtime dependency for scheduling (FSRS). It will be added with the
  learning session.
- **IntelliJ is the owner's IDE.** There's no VS Code config. `.editorconfig` provides basic
  settings, and the Biome plugin handles formatting.

## 2026-11-05: Yarn 4 instead of Yarn 1

- **Yarn 4 (modern), pinned via `packageManager` and provided by Corepack.** The owner wants
  current tooling. Yarn 1 is in maintenance mode.
- **`nodeLinker: node-modules`** instead of Plug'n'Play. PnP needs editor SDKs and causes friction
  with tools such as TypeScript and Biome. A normal `node_modules` folder just works.
- **Yarn's security defaults are kept**: dependency install scripts are disabled and packages
  must be at least one day old (`npmMinimalAgeGate`). If a future dependency really needs a
  postinstall script, allow it only for that package via `dependenciesMeta`.

## 2026-11-05: Initial scaffold

- **React 19 + TypeScript + Vite.** The owner knows React; Vite was a requirement.
- **Zustand** for shared state, the only runtime dependency besides React.
- **Biome** for linting and formatting: one tool and one config, already known to the owner.
  Oxlint alone would still need a separate formatter.
- **Vitest** for unit tests. It shares Vite's config and needs no extra setup.
- **vite-plugin-pwa** for offline support and installation on the phone.
- **No router.** There are only a few screens. If one is added later, it must be hash-based
  (GitHub Pages has no SPA fallback).
- **Native IndexedDB instead of Dexie.** This keeps dependencies to a minimum. A small typed
  wrapper in `src/storage/` is enough for the access patterns here.
- **Vocabulary as a hand-maintained JSON file in the repo.** The owner adds words after each
  lesson. There is no editing UI in the app.
- **Sync = manual JSON export/import** of progress between devices. A backend can be added later.
- **UI in German, switchable to English**, via a tiny typed message catalogue instead of an
  i18n library. _(Superseded: now i18next, see above.)_
- **Icons generated by a dependency-free Node script** (`scripts/generate-icons.mjs`). The design
  is a red/white checkerboard (šahovnica).
- **TypeScript 7** (the native compiler) is used. If a tool turns out to be incompatible, pinning
  `typescript@5` is an acceptable fallback.
