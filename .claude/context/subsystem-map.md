# Subsystem Map

> Directory to subsystem ownership and responsibility.
> Use for routing queries and understanding boundaries.

## Top-Level Structure

```
pwarnock.github.io/
├── packages/           # Bun workspace packages (core code)
│   ├── site/           # [SITE] Hugo static site
│   ├── agents/         # [AGENTS] Content generation agents
│   ├── qa-tools/       # [QA] Test orchestration & observability
│   └── tooling/        # [TOOLING] Build & deployment scripts
├── shared/             # [SHARED] Cross-package utilities
├── test/               # [BDD] Go-based BDD test suite
├── tests/              # [E2E] Playwright test specs
├── scripts/            # [SCRIPTS] Root-level automation
├── .github/workflows/  # [CI] GitHub Actions pipelines
├── .claude/            # [CONTEXT] AI context infrastructure
├── .beads/             # [TRACKING] Issue tracking data
├── .cody/              # [CODY] Feature planning & style docs
├── docs/               # [DOCS] Project documentation
├── config/             # [CONFIG] Root config files
└── public/             # [OUTPUT] Built site (gitignored)
```

## Subsystem Details

### [SITE] Hugo Static Site
**Owner**: `packages/site/`
**Responsibility**: Content rendering, templates, styling, static assets
**Key files**:
- `content/` — Markdown content (blog, portfolio, tools, about)
- `layouts/` — Go templates (partials, shortcodes, page types)
- `assets/css/` — Tailwind source CSS
- `static/` — Processed CSS, images, fonts
- `hugo.toml` — Hugo base configuration
- `../../config/{dev,prod,staging}/` — Environment-specific Hugo overrides
- `data/` — Version info, structured data

**Dependencies**: Tailwind v4, DaisyUI, PostCSS, Hugo Extended
**Tests**: E2E (Playwright), Visual regression, BDD (Godog)

### [AGENTS] Content Generation
**Owner**: `packages/agents/`
**Responsibility**: Blog, portfolio, tech-radar content generation with voice learning
**Key files**:
- `src/blog/` — Blog post generation agent
- `src/portfolio/` — Portfolio case study agent
- `src/tech-radar/` — Tech radar entry agent
- `src/core/` — Voice learning, Hugo integration, review workflow
- `src/cli/` — CLI interface for agent commands
- `src/types/` — Shared TypeScript types
- `src/config/` — Path resolution and configuration

**Dependencies**: `@pwarnock/shared`, js-yaml, Vitest
**Tests**: Unit (Vitest with happy-dom)

### [QA] Test Orchestration & Observability
**Owner**: `packages/qa-tools/`
**Responsibility**: QA mode selection (auto/content/full), OpenTelemetry tracing, test orchestration
**Key files**:
- `src/qaCli.ts` — QA mode CLI (auto, content, full)
- `src/` — Tracing, matchers, orchestration logic

**Dependencies**: OpenTelemetry stack, Logfire, picomatch
**Tests**: Unit (Vitest)

### [TOOLING] Build & Deployment
**Owner**: `packages/tooling/`
**Responsibility**: Build scripts, version generation, release preparation
**Key files**:
- `scripts/build/` — Build-time utilities (version generation)
- `scripts/release/` — Release workflow scripts

**Dependencies**: None (standalone scripts)
**Tests**: None currently

### [BDD] Behavior-Driven Tests
**Owner**: `test/`
**Responsibility**: Gherkin feature specs and Go step definitions
**Key files**:
- `features/` — `.feature` files (Gherkin scenarios)
- `step_definitions/` — Go implementations
- `support/` — Test utilities and helpers
- `godog_test.go` — Test runner entry point
- `run-tests.sh` — BDD test execution script

**Dependencies**: Go, Godog, go-playwright-testkit
**Tests**: Self-contained (runs via `go test`)

### [E2E] Playwright Tests
**Owner**: `tests/`
**Responsibility**: End-to-end journeys, visual regression, performance, accessibility
**Key files**:
- `e2e-journeys.spec.ts` — Critical user flows
- `visual-regression.spec.ts` — Design stability (@visual)
- `performance.spec.ts` — Lighthouse checks (@perf)
- `accessibility-critical.spec.ts` — WCAG compliance (@a11y)
- `analytics-tracking.spec.ts` — GTM/GA validation
- `seo-metadata.spec.ts` — SEO checks
- `navigation.spec.js` — Navigation flows

**Dependencies**: Playwright, axe-playwright
**Tests**: Self-contained

### [CI] GitHub Actions
**Owner**: `.github/workflows/`
**Responsibility**: Automated build, test, deploy, release, and version governance
**Key files**:
- `cicd.yml` — Main CI/CD pipeline
- `release-controller.yml` — Centralized release authority
- `version-consistency.yml` — Version bump governance
- `orphan-rc-auditor.yml` — Stale RC detection
- `test.yml` — Test pipeline

### [SCRIPTS] Root Automation
**Owner**: `scripts/`
**Responsibility**: Developer-facing build, validation, release, and utility scripts
**Key categories**:
- Build: `path-based-build.sh`, `analyze-bundles.js`
- Release: `release-prep.sh`, `version-sync.sh`, `version-dev.sh`
- Validation: `validate.sh`, `validate-links.sh`, `validate-portfolio-frontmatter.js`
- Testing: `run-all-unit-tests.sh`, `dev-test-runner.sh`
- Deployment: `deploy-staging.sh`, `deploy-production.sh`
- Sync: `backlog-to-beads.js`, `beads-to-cody.js`

### [CONTEXT] AI Context Infrastructure
**Owner**: `.claude/context/`
**Responsibility**: Role-based context routing, project knowledge, session state
**Key files**:
- `constitution.md` — Non-negotiable project rules and conventions
- `trigger-tables.md` — File pattern to context/skill routing
- `failure-modes.md` — Symptom to cause to fix mappings
- `subsystem-map.md` — Directory to ownership reference (this file)
- `specs/` — On-demand subsystem deep-dives
- `roles/developer.md` — Default development context
- `roles/refinery.md` — Merge queue processor context
- `roles/personal-assistant.md` — Daily planning context
- `project/architecture.md` — System design decisions
- `project/conventions.md` — Coding standards
- `project/workflows.md` — Development/release workflows
- `project/references.md` — External references

### [TRACKING] Beads Issue Tracking
**Owner**: `.beads/`
**Responsibility**: Git-backed issue tracking with dependencies
**Key files**:
- `issues.jsonl` — All issues (JSON lines format)
- CLI: `bd` command

### [CODY] Feature Planning
**Owner**: `.cody/`
**Responsibility**: Feature backlog, style documentation, content library
**Key files**:
- `project/build/feature-backlog.md` — Feature planning
- `project/library/style-docs/` — Voice learning style guides (blog, portfolio, radar)
