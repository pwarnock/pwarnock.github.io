# Repository Guidelines

Bun workspace monorepo for Peter Warnock's personal portfolio, blog, and tech radar (Hugo static site) plus content generation agents and QA tooling. MIT licensed. Tool versions pinned via mise (`.mise.toml`).

## Non-Negotiable Rules

1. **Bun only** — never npm, npx, or yarn. Use `bun`, `bunx`, `bun run`.
2. **No `--no-verify`** — pre-commit hooks are safety gates, not obstacles.
3. **Tests before push** — `bun run test` + `bun run lint` must pass.
4. **Zero TypeScript warnings** — `bun tsc --noEmit` must be clean.
5. **Agents never auto-publish** — all content starts `draft: true`, requires approval.
6. **Conventional commits** — `<type>(<scope>): <subject>` enforced by commitlint.
7. **No hardcoded paths** — use `getAgentPaths()` / config system.
8. **First-person voice** — site content uses "I", never "we".
9. **Beads for tracking** — use `bd` CLI, not TodoWrite or markdown TODOs.
10. **Never edit `.cody/`** or `package.json.version` manually — managed by Cody Framework and release controller.

Full rules, architecture invariants, and quality gates: `.claude/context/constitution.md`

## Project Structure

```
packages/
  site/      Hugo site (content/, layouts/, assets/, static/), config in hugo.toml
  agents/    @pwarnock/agents - content generation (blog, portfolio, radar)
  qa-tools/  @pwarnock/qa-tools - QA automation and observability
  tooling/   @pwarnock/tooling - build/deploy scripts
shared/       @pwarnock/shared - cross-package utilities and types
test/         Go BDD suite (Godog) and unit tests
tests/        Playwright E2E and visual regression
scripts/      Root automation (symlinks to packages/tooling/scripts/)
docs/         Operational and tutorial documentation
config/       Per-environment Hugo configs (development, staging, production)
.claude/context/  Codified context infrastructure (constitution, routing, failure modes)
```

## Build, Test, and Development

Prerequisites: install mise, run `mise install`, then `bun install`.

```bash
bun run dev              # Hugo dev server (localhost:1313)
bun run build            # Production build
bun run validate         # All validation (content, links, portfolio, security)
bun run test             # Vitest (TypeScript unit tests)
bun run test:unit        # All unit tests (Go + TS)
bun run test:e2e         # Playwright E2E tests
bun run test:bdd         # Godog BDD suite
bun run test:deployment  # Deployment validation
bun run lint             # YAML, TOML, CSS linters
bun run format           # Prettier --write .
```

Releases are automatic. Merge a PR to main and the auto-release workflow bumps version, creates a tag, and deploys. Never edit `package.json.version` manually.

## Coding Style

- **Prettier**: single quotes, trailing comma es5, 100 char width (80 for markdown), 2-space indent, LF.
- **ESLint**: flat config with `eslint-plugin-security`, max line 120 in scripts.
- **CSS**: Stylelint + Tailwind v4 + DaisyUI, BEM class naming.
- **Hugo templates**: kebab-case filenames; base in `layouts/_default/baseof.html`, components in `layouts/partials/components/`.
- **TypeScript**: strict mode for utilities and tooling.
- **Commits**: Conventional Commits via commitlint. Types: feat, fix, docs, chore, style, refactor, test, perf. Scopes: content, ci, blog, agents, etc.

## Testing

- **Unit (TS)**: Vitest, `happy-dom`. Tests as `*.test.ts`/`*.spec.ts` in `packages/*/src/` and `shared/src/`.
- **Unit (Go)**: `cd test && go test -v ./support/...`
- **BDD**: Godog in `test/features/` + `test/step_definitions/`. Run: `bun run test:bdd`.
- **E2E**: Playwright in `tests/*.spec.ts`. Config: `playwright.config.ts`.
- **Deployment**: Shell integration tests in `test/deployment_*.sh`.

Run `bun run validate` before committing content changes. Run `bun run test:deployment` for infrastructure changes. Never bypass pre-commit hooks without explicit user approval.

## Commit and Pull Request

- Conventional Commits: `<type>(<scope>): <subject>`.
- Branch from `main`. Run `bun run validate` and relevant tests before PR.
- CI enforces multi-OS matrix, cross-browser testing, coverage gates, security scans.
- Staging deploys on push to `staging`. Production deploys on push to `production`.
- All releases go through `scripts/release.sh` and the automated release controller.

## Agent Context Routing

This project uses codified context with progressive disclosure. AGENTS.md inlines essentials (above); detail loads on demand.

| When working on... | Load this context |
|---|---|
| Any task | `.claude/context/constitution.md` |
| Routing queries / file patterns | `.claude/context/trigger-tables.md` |
| Debugging failures | `.claude/context/failure-modes.md` |
| Exploring the codebase | `.claude/context/subsystem-map.md` |
| Architecture decisions | `.claude/context/project/architecture.md` |
| Coding standards | `.claude/context/project/conventions.md` |
| Dev/release/deploy workflows | `.claude/context/project/workflows.md` |
| Subsystem deep-dives | `.claude/context/specs/` |
| Operational docs | `docs/` (start at `docs/README.md`) |

Context index and full loading rules: `.claude/context/index.md`

## Issue Tracking

Use `bd` (beads) CLI for all task tracking. Never markdown TODOs.

```bash
bd ready --json                    # Check unblocked work
bd create "Title" -t task -p 2 --json  # Create issue
bd update <id> --claim --json      # Claim task
bd close <id> --reason "Done" --json   # Complete
```
