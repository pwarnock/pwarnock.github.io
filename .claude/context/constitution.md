# Project Constitution

> Authoritative conventions for the pwarnock.github.io monorepo.
> When in doubt, this document wins. Last updated: 2026-03-01.

## Identity

**pwarnock-monorepo** — A Bun workspace monorepo serving dual purposes:
1. Personal portfolio, blog, and tech radar (Hugo static site)
2. Engineering showcase of CI/CD automation, content agents, and observability

**Owner**: Pete Warnock | **License**: MIT | **Runtime**: Bun | **Site generator**: Hugo

## Packages

| Package | Purpose | Key Tech |
|---------|---------|----------|
| `@pwarnock/site` | Hugo static site with Tailwind v4 + DaisyUI | Hugo, PostCSS, Tailwind |
| `@pwarnock/agents` | Content generation agents (blog, portfolio, radar) | TypeScript, Vitest |
| `@pwarnock/qa-tools` | QA automation, observability, test orchestration | OpenTelemetry, Logfire |
| `@pwarnock/tooling` | Build, deployment, and validation scripts | Shell, Bun scripts |
| `shared` | Cross-package utilities and types | TypeScript |

## Non-Negotiable Rules

1. **Bun only** — Never `npm`, `npx`, `yarn`. Use `bun`, `bunx`, `bun run`.
2. **No `--no-verify`** — Pre-commit hooks are safety gates, not obstacles.
3. **Tests before push** — Run `bun run test` + `bun run lint` before any `git push`.
4. **Zero TypeScript warnings** — `bun tsc --noEmit` must be clean.
5. **Agents never auto-publish** — All content starts `draft: true`, requires explicit approval.
6. **Conventional commits** — `<type>(<scope>): <subject>` format enforced by commitlint.
7. **No hardcoded paths** — Use `getAgentPaths()` / config system.
8. **First-person voice** — All site content uses "I" perspective, never "we".
9. **Beads for tracking** — Use `bd` CLI, not TodoWrite or markdown files.
10. **Push safety protocol** — Tests + lint must pass; verified output required before push.

## Architecture Invariants

- **Release authority is centralized** — Only `release-controller.yml` bumps versions and creates tags
- **`package.json.version` is the single source of truth** for all versioning
- **Sequential rebase strategy** — Clean linear history, no parallel merge conflicts
- **CSS must be processed** — Tailwind CLI converts directives before Hugo serves from `static/`
- **Content bundles are validated** — Frontmatter checked against type-specific schemas

## Quality Gates

| Gate | Command | When |
|------|---------|------|
| Unit tests | `bun run test` or `bunx vitest` | Before commit |
| Linting | `bun run lint` | Before commit (via hooks) |
| TypeScript | `bun tsc --noEmit` | Before commit (via hooks) |
| QA auto | `bun run qa:auto` | Before push |
| E2E | `bun run test:e2e` | Before release |
| Full QA | `bun run qa:full` | Before release |

## Testing Pyramid

```
        /\
       /E2E\        Playwright (Chromium/Firefox/Safari)
      /------\
     /Visual \      Playwright @visual snapshots
    /----------\
   /Integration\    Bash scripts + deployment validation
  /--------------\
 / BDD (Godog)    \ Gherkin features + Go step definitions
/------------------\
   Unit (Vitest)    TypeScript + happy-dom
```

## Key Paths

| What | Where |
|------|-------|
| Hugo content | `packages/site/content/` |
| Hugo layouts | `packages/site/layouts/` |
| Hugo config | `packages/site/hugo.toml` + `config/` |
| Agent source | `packages/agents/src/` |
| QA tools | `packages/qa-tools/src/` |
| E2E tests | `tests/` |
| BDD tests | `test/features/` |
| CI workflows | `.github/workflows/` |
| Scripts | `scripts/` |
| Style docs | `.cody/project/library/style-docs/` |
| Beads issues | `.beads/issues.jsonl` |
| Context system | `.claude/context/` |
