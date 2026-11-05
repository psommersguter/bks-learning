# Agent instructions

A vocabulary trainer web app for learning Croatian (BKS) with German translations.
Static React + TypeScript SPA built with Vite and hosted on GitHub Pages. There is no backend.

## Before you start

Read [docs/README.md](docs/README.md), especially [docs/coding-guidelines.md](docs/coding-guidelines.md)
(guardrails) and [docs/architecture.md](docs/architecture.md).

## Commands (Yarn 4 via Corepack, `nodeLinker: node-modules`)

- `yarn dev`: dev server at http://localhost:5173/bks-learning/
- `yarn check`: typecheck + lint + tests. **Must pass before committing.**
- `yarn lint:fix`: format the code and apply safe lint fixes (Biome)
- `yarn build`: production build into `dist/`

## Troubleshooting

- **Dev server serves an empty/broken module** ("does not provide an export named …") after an
  edit, or an error that only fits a half-done change (e.g. "X is not defined" right after adding
  its import): Vite cached an intermediate version of the file. This happens when a file is
  rewritten or edited several times in quick succession. `touch` the changed files and reload
  the page before checking the result in the browser.

## Working with the owner

- **Build vs. library: ask.** Whenever something could be written by hand or taken from a
  library, present the options with pros and cons and let the owner decide. Don't pick on your own.
- **Never commit on your own.** When a change is ready, summarise it and ask the owner to review.
  They decide whether you commit, they commit themselves, or changes are needed first.

## Hard rules

- Don't add dependencies without the owner's explicit approval.
- No Tailwind, CSS-in-JS or UI kits. Routing is `wouter` with hash URLs.
- React Compiler is on: no manual `useMemo`/`useCallback`/`memo()`, and follow the Rules of React
  (see docs/coding-guidelines.md for the patterns it can't compile).
- All UI strings go through i18n (`src/i18n/messages/de.ts` + `en.ts`).
- Never write to the vocabulary file (`src/data/vocabulary.json`, see docs/vocabulary-format.md) from
  app code, and never change existing word ids. Never break stored progress without a migration.
- Code and docs in English, UI in German/English, vocabulary in Croatian/German.
- When you make a decision or learn something future sessions should know, update the relevant
  file in `docs/` (decisions go in `docs/decisions.md`, progress in `docs/roadmap.md`).
