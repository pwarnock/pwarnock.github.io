# GitHub Copilot Instructions

## Project Overview

Personal portfolio and blog for Pete Warnock. This is a **Bun workspaces monorepo** where the main deliverable is a Hugo static site. Tooling is managed via `.mise.toml`: Bun 1.3.6, Go 1.25, and just 1.46.0 are pinned there, while Hugo currently uses the system installation.

## Workspace Structure

```
packages/site/       # Hugo site + frontend (Tailwind CSS v4 + DaisyUI v5)
packages/agents/     # Content generation agents (@pwarnock/agents)
packages/qa-tools/   # QA infrastructure (@pwarnock/qa-tools)
packages/tooling/    # Build/deploy scripts (@pwarnock/tooling)
shared/              # Shared TypeScript utilities and types (@pwarnock/shared)
test/                # Go test infrastructure (BDD with Godog)
tests/               # Playwright E2E tests
scripts/             # Symlinks to packages/tooling/scripts/ (backward compat)
```

`packages/agents` and `packages/qa-tools` depend on `@pwarnock/shared`. `packages/site` is standalone.

## Commands

```bash
# Development
just dev                        # Start dev server (http://localhost:1313)
bun run dev                     # Same

# Building
bun run build                   # Production build
bun run generate-version        # Run before builds; writes data/version.json

# Testing
bun run test:unit:ts            # Vitest TypeScript unit tests
bun run test:unit:go            # Go unit tests only
bun run test:unit               # All unit tests (Go + TS)
bunx playwright test            # All E2E tests
bunx playwright test --grep "pattern"  # Single E2E test
bunx playwright test --grep @visual    # Visual regression only
bun run test:bdd                # BDD (Godog) tests in test/
vitest --run packages/agents/src/__tests__/specific.test.ts  # Single TS test

# Linting
bun run lint                    # YAML + TOML + CSS linters
bun run format                  # Prettier
bun run lint:css                # CSS only (Stylelint)

# Validation
bun run validate                # Full validation suite (content, links, portfolio)
bun run validate:portfolio      # Portfolio frontmatter validation only
bun run validate:radar          # Tech radar validation only
```

## Hugo Site Architecture (`packages/site/`)

### Content Location
All site content lives in `packages/site/content/`, **not** the root `content/` directory.

### URL → File Mapping
- `/blog/posts/[slug]/` → `packages/site/content/blog/posts/[slug]/index.md`
- `/portfolio/[project]/` → `packages/site/content/portfolio/[project]/index.md`
- `/tools/[tool]/` → `packages/site/content/tools/[tool]/index.md`

### Template Hierarchy
- `layouts/_default/baseof.html` — Base HTML shell (head, body, skip nav)
- `layouts/_default/single.html` — Single content pages
- `layouts/_default/list.html` — Section index pages
- `layouts/partials/components/` — Reusable UI components
- `layouts/partials/sections/` — Page section templates

### Environment Configs
- `packages/site/config/development/hugo.toml`
- `packages/site/config/staging/hugo.toml`
- `packages/site/config/production/hugo.toml`

## CSS Architecture

CSS is split into modules under `packages/site/assets/css/`:

```
assets/css/main.css             # Entry point — imports all modules
assets/css/framework/           # Tailwind v4 + DaisyUI v5 imports, base reset
assets/css/design-system/       # tokens.css (CSS custom properties), utilities.css
assets/css/components/          # buttons, badges, cards, icons, focus, carousel
assets/css/layout/              # hero, responsive, embeds
assets/css/content/             # prose, code blocks, tables
```

**Critical CSS rule**: `assets/css/main.css` and modules are for design tokens and custom components only. Layout and element styling goes in Hugo template `class=` attributes using Tailwind utilities. Never add Tailwind utility classes to CSS files.

## Content Types

Blog posts require a `content_type` field. The four types and their required frontmatter:

| Type | Required extra fields |
|------|-----------------------|
| `original` | — |
| `curated` | `attribution`, `source_url` |
| `embed` | `attribution`, `source_url` |
| `project` | (portfolio-specific fields) |

Portfolio items also require: `client`, `technologies[]`, `completion_date`, `category`.

## Issue Tracking

This project uses **`bd` (beads)** CLI for all issue tracking. Never create markdown TODO lists.

```bash
bd ready --json                                         # See unblocked work
bd create "Title" -t task -p 2 --json                  # Create issue
bd update bd-42 --status in_progress --json             # Claim work
bd close bd-42 --reason "Done" --json                  # Complete work
```

## Release Process

**Never manually edit `package.json.version`** — the `version-consistency.yml` CI gate blocks it. All releases go through:

```bash
./scripts/release.sh [rc|final|hotfix]
```

The release controller CI job handles version bumping, tagging, and deployment.

## Pre-commit Hooks

Pre-commit runs: Prettier, ESLint (with `eslint-plugin-security`), secret scanning (Gitleaks), YAML/TOML/JSON checks, analytics validation, and hero component validation. **Never bypass with `--no-verify`** without explicit user approval.

## Key Conventions

- **Package manager**: Bun everywhere (`bun install`, `bun run`, `bunx`). Not npm/npx.
- **Task runner**: `just` (see `justfile`). `just --list` shows all tasks.
- **Vitest parallelism**: `fileParallelism: false` is intentional — tests share singleton state via `paths.ts`.
- **Playwright base URL**: `http://localhost:3000` (serve preview, not Hugo dev server).
- **DaisyUI theming**: Use semantic color tokens (`btn-primary`, `text-base-content`) not hardcoded colors. 13 themes are configured.
- **Hugo templates**: `data-section` attribute on `<body>` identifies the current section (home/blog/portfolio/tools/page).
- **Analytics**: GTM container only loads in `production` environment. Pre-commit validates interactive elements have GA tracking.
