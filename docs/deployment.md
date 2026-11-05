# Deployment

The app is hosted on GitHub Pages at `https://<user>.github.io/bks-learning/`.

## Pipeline

`.github/workflows/ci.yml` runs on every push and pull request:

1. `corepack enable` + `yarn install --immutable`
2. `yarn typecheck`, `yarn lint`, `yarn test`
3. `yarn build` → `dist/`
4. On `main` only: upload `dist/` and deploy it to GitHub Pages.

## One-time setup in GitHub

Repository → _Settings_ → _Pages_ → _Build and deployment_ → Source: **GitHub Actions**.

## Base path

`BASE_PATH` in `vite.config.ts` must match the repository name (`/bks-learning/`). If the
repository is renamed or a custom domain is used, change it there. The PWA manifest's
`start_url`/`scope` follow automatically.

## Updates on installed apps

The service worker updates itself automatically (`registerType: "autoUpdate"`). After a deploy,
an open or installed app picks up the new version on its next start.
