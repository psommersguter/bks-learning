# Coding guidelines

These apply to humans and coding agents alike.

## Guardrails

- **Minimal dependencies, owner decides.** Do not add a dependency (runtime _or_ dev) without the
  owner's explicit approval. Conversely, don't hand-roll something a well-known library covers
  without asking either: whenever both options exist, present them with pros and cons and let
  the owner choose. Prefer browser-native APIs (IndexedDB, `Intl`, Web Speech,
  `crypto.randomUUID`, …) where they fit. Record every decision in [decisions.md](decisions.md).
- **No Tailwind, no CSS-in-JS, no UI component libraries.** Styling is plain CSS Modules plus the
  tokens in `src/styles/global.css`.
- **Routing via `wouter` with hash URLs** only (see [architecture.md](architecture.md#navigation)).
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
- Validate data at the boundaries (the vocabulary file, imported backup files) and trust the
  types inside the app. IndexedDB data is only written by the app through a versioned schema,
  so reads from it aren't validated again.
- Use `import type` for type-only imports (enforced by Biome).

## React

- Function components only, one component per file, file named after the component
  (`LanguageSwitch.tsx` + `LanguageSwitch.module.css`).
- Keep components thin: logic that doesn't need React goes into `src/domain/` as pure functions
  with unit tests.
- State: local `useState` first; Zustand stores for state shared across features. Select narrow
  slices: `useStore((s) => s.value)`, never the whole store.
- Effects are for synchronising with the outside world (DOM, storage), not for deriving state.

### React Compiler

The build runs the [React Compiler](https://react.dev/learn/react-compiler), which memoises
components and hooks automatically.

- **Don't add `useMemo`, `useCallback` or `memo()`** for performance. The compiler does that.
- Follow the [Rules of React](https://react.dev/reference/rules) (pure render, no mutating props
  or state, hooks only called). Code that breaks them is silently left uncompiled.
- Patterns the current compiler can't compile, so they also leave the component unoptimised:
  `try … finally` (put the cleanup after `try/catch`), conditionals (`?:`, `&&`, `?.`) inside a
  `try` block (compute them before the `try`), and default values in destructured props (use
  `value ?? default`).
- Known exception: `App` in `src/app/App.tsx` passes wouter's location hook as a prop and is
  intentionally left uncompiled. Everything else should compile.
- To check a component: React DevTools shows a "Memo ✨" badge on compiled components.

## CSS

- Mobile-first: base styles target phones, `@media (min-width: …)` adds desktop refinements.
- Use the design tokens (`var(--space-4)`, `var(--color-accent)`, …) instead of raw values.
  Add a token if a value is used in more than one place.
- Dark mode works through the tokens: `global.css` redefines them for
  `:root[data-theme="dark"]`. Don't hard-code colours in modules, and don't use
  `prefers-color-scheme` in CSS (the user can override the device setting).
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

- **Never commit without the owner's OK.** Present the finished change for review first. The
  owner decides whether the agent commits or they commit themselves.
- Small, focused commits with imperative messages ("Add review session screen").
- `main` deploys automatically; keep it green.
