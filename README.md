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

## Documentation

See [`docs/`](docs/README.md) for architecture, coding guidelines, decisions and the roadmap.
