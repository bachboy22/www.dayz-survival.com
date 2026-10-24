# Local development and review

Read the root `AGENTS.md`, `docs/PLAN_MVP.md` and `docs/CONTROL.md` before changing the application. The original editorial master is not a dependency for running this demo.

## Run the reader

Use the Node version pinned in `.nvmrc` and the locked npm dependency graph:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Astro. The version is a demonstration with synthetic data. Do not point it at the production domain or publish its build directory.

## Reproduce checks

```sh
npm run check
npm run validate
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
```

On a fresh Linux CI machine, `npx playwright install --with-deps chromium` also installs browser system dependencies. Playwright starts and stops a local Astro preview at `http://127.0.0.1:4321`. Close another process using that port if it is serving unrelated content. The configuration can reuse an existing preview for local work; CI always starts its own.

The integration suite checks the nine core routes on desktop and mobile, performs axe WCAG A/AA checks, checks horizontal overflow, searches with and without accent marks, exercises tag filtering and empty results, follows article/quick-card links, checks keyboard entry and mobile navigation, and records screenshots. The test preview uses `--ignore-lock` so Astro remains in the foreground even when an agent environment is detected. Local runs may optionally select an existing Chromium via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; CI uses the Playwright-installed browser.

Reports are generated under `artifacts/`: a JSON result, an HTML Playwright report, failure traces, and desktop/mobile screenshots for the home and article pages. These generated artifacts are ignored by Git and may be included separately with a reviewed delivery. Passing axe checks does not establish complete WCAG conformance; manually review focus order, zoom, screen-reader announcements and real content when available.

## Branches and pull requests

Use a short-lived `feat/…`, `fix/…` or `chore/…` branch. Keep the master manuscripts and private archive packages outside the checkout. Review the staged diff and file list before committing; `.gitignore` is a convenience, not a security boundary.

Every PR describes the behavior, validation evidence and editorial impact. Require a reviewer, resolved discussions and passing `verify` checks before merging. Configure these rules in GitHub repository settings when administration access is available; this file does not enable branch protection. A developer cannot approve their own editorial additions simply by changing a status string.

**Current state (2026-10-24):** WEB-001 is closed, `main` and `feat/web-v0.1` were pushed successfully preserving the original Git objects, and [PR #2](https://github.com/bachboy22/www.dayz-survival.com/pull/2) remains open in draft. The earlier 403 in the archived local delivery is resolved; see [WEB-002 review](WEB-002-REVIEW.md). Changes to the feature branch must await CI and review before any merge.

Historical troubleshooting context: An empty remote needs an agreed base branch before a conventional PR can compare branches. Preserve local commits if write access fails. A GitHub App needs repository **Contents: read and write** for code and **Pull requests: read and write** to open the PR; adding or updating workflow files may also require **Workflows: read and write**. Grant access only to the intended repository. Never paste a token into source or logs. An account's reported `push: true` is not proof of an integration's effective write access.

No command in this project publishes the site or changes Cloudflare. Do not add a deployment command or production credentials as part of routine verification.
