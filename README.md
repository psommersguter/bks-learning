# BKS Vokabeltrainer

A small web app for learning Croatian vocabulary (with German translations). It works on
desktop and phone, offline-capable, and is hosted on GitHub Pages.

## Getting started

Requires Node ≥ 22 (see `.nvmrc`) and Yarn 4. Yarn is provided by Corepack using the version
pinned in `package.json`:

```bash
corepack enable   # once per machine
yarn install
yarn dev        # http://localhost:5173/bks-learning/
```

## Scripts

| Script            | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `yarn dev`        | Start the dev server                             |
| `yarn build`      | Typecheck and build into `dist/`                 |
| `yarn preview`    | Serve the production build locally               |
| `yarn check`      | Typecheck + lint + tests (run before committing) |
| `yarn lint:fix`   | Format and auto-fix with Biome                   |
| `yarn test:watch` | Run the tests in watch mode                      |
| `yarn icons`      | Regenerate the app icons in `public/`            |

## Adding vocabulary

Edit [`src/data/vocabulary.json`](src/data/vocabulary.json) and append new words at the end.
Every word needs a new UUID as its `id`, e.g. from
`node -e 'console.log(crypto.randomUUID())'`. The format is described in
[docs/vocabulary-format.md](docs/vocabulary-format.md). `yarn test` validates the file.

## IntelliJ setup

- **Biome:** install the _Biome_ plugin and enable _Format on save_ and _Apply safe fixes on
  save_ under _Settings_ → _Languages & Frameworks_ → _Biome_. Turn off IntelliJ's own
  _Reformat code_ / _Optimize imports_ on save so the two don't conflict.
- **TypeScript:** use the project's `node_modules/typescript` under _Settings_ → _Languages &
  Frameworks_ → _TypeScript_.
- **JSON schema:** nothing to do. `vocabulary.json` references its schema via `$schema`, which
  IntelliJ picks up automatically for autocompletion and validation.
- `.editorconfig` sets basic settings (indentation, line endings) to match Biome.

## Documentation

See [`docs/`](docs/README.md) for architecture, coding guidelines, decisions and the roadmap.
