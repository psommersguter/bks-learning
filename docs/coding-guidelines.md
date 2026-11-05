# Coding guidelines

These apply to humans and coding agents alike.

## Guardrails

- **Minimal dependencies.** Runtime dependencies are `react`, `react-dom` and `zustand`. Do not add
  a new dependency (runtime *or* dev) without the owner's explicit approval. Prefer browser-native
  APIs (IndexedDB, `Intl`, Web Speech, `crypto.randomUUID`, …) and small hand-written helpers.
  Record every approved addition in [decisions.md](decisions.md).
- **No Tailwind, no CSS-in-JS, no UI component libraries.** Styling is plain CSS Modules plus the
  tokens in `src/styles/global.css`.
- **No router library** for now (see [architecture.md](architecture.md#navigation)).
- **No backend.** The app must keep working as a static site on GitHub Pages, including offline.
- **Never modify the vocabulary file from app code.** It is user-maintained content.
- **Don't break stored progress.** Changes to the IndexedDB schema or the export format need a
  version bump and a migration (see "Persistence" below).
- `yarn check` must pass before every commit (typecheck + lint + tests).

## Language

- Code, comments, commit messages and docs: **English**.
- UI texts: through i18n only (German default, English second). Never hard-code UI strings in
  components.
- Vocabulary content: Croatian and German.

## TypeScript

- `strict` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on. Don't weaken them.
- No `any`; use `unknown` and narrow it. Avoid non-null assertions (`!`); handle the missing case.
- Prefer `type`/`interface` + plain functions over classes.
- Named exports only (no default exports), so a component's name is the same everywhere.
- Validate data at the boundaries (JSON import, IndexedDB reads, the vocabulary file) and trust
  the types inside the app.
- Use `import type` for type-only imports (enforced by Biome).

## React

- Function components only, one component per file, file named after the component
  (`LanguageSwitch.tsx` + `LanguageSwitch.module.css`).
- Keep components thin: logic that doesn't need React goes into `src/domain/` as pure functions
  with unit tests.
- State: local `useState` first; Zustand stores for state shared across features. Select narrow
  slices: `useStore((s) => s.value)`, never the whole store.
- Effects are for synchronising with the outside world (DOM, storage), not for deriving state.

## CSS

- Mobile-first: base styles target phones, `@media (min-width: …)` adds desktop refinements.
- Use the design tokens (`var(--space-4)`, `var(--color-accent)`, …) instead of raw values.
  Add a token if a value is used in more than one place.
- Dark mode works through the tokens (`prefers-color-scheme`). Don't hard-code colours in modules.
- Touch targets are at least ~44px high. Respect `env(safe-area-inset-*)` on edges.

## Accessibility

- Semantic elements (`button`, `main`, `header`, headings in order); never clickable `div`s.
- Every interactive element has an accessible name. Toggle buttons use `aria-pressed`.
- Learning flows must be fully usable with the keyboard on desktop (e.g. Enter/Space to reveal).

## Testing

- Vitest, files named `*.test.ts` next to the code under test.
- Must be tested: everything in `src/domain/` (scheduling, answer checking, parsing/validation of
  the vocabulary and the import files).
- UI tests are optional. Adding React Testing Library needs approval (see guardrails).

## Persistence

- IndexedDB is accessed only through `src/storage/`. Components never call `indexedDB` directly.
- Bump the database version and write an `onupgradeneeded` migration for every schema change.
- Exported JSON carries a `formatVersion`. Import must accept all older versions.

## Git

- Small, focused commits with imperative messages ("Add review session screen").
- `main` deploys automatically; keep it green.
