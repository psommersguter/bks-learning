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

## Hard rules

- Don't add dependencies without the owner's explicit approval.
- No Tailwind, CSS-in-JS, UI kits or router libraries.
- All UI strings go through i18n (`src/i18n/messages/de.ts` + `en.ts`).
- Never write to the vocabulary file from app code. Never break stored progress without a migration.
- Code and docs in English, UI in German/English, vocabulary in Croatian/German.
- When you make a decision or learn something future sessions should know, update the relevant
  file in `docs/` (decisions go in `docs/decisions.md`, progress in `docs/roadmap.md`).
