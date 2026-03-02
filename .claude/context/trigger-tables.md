# Trigger Tables

> File-pattern to context routing rules for AI agents.
> Used by context-routing skill and agent dispatching.

## File Pattern Routes

### Content & Hugo (Site Package)

| Pattern | Subsystem | Load Context | Suggested Skill |
|---------|-----------|-------------|-----------------|
| `packages/site/content/blog/**` | blog-content | developer.md, conventions.md | — |
| `packages/site/content/portfolio/**` | portfolio-content | developer.md, conventions.md | — |
| `packages/site/content/tools/**` | tech-radar | developer.md | — |
| `packages/site/layouts/**/*.html` | hugo-templates | architecture.md | — |
| `packages/site/layouts/partials/**` | hugo-partials | architecture.md | responsive-design |
| `packages/site/assets/css/**` | styling | conventions.md | tailwind-design-system |
| `packages/site/static/**` | static-assets | — | — |
| `packages/site/hugo.toml` | hugo-config | architecture.md | — |
| `config/**/*.toml` | hugo-env-config | architecture.md | — |
| `packages/site/data/**` | site-data | architecture.md | — |

### Agents Package

| Pattern | Subsystem | Load Context | Suggested Skill |
|---------|-----------|-------------|-----------------|
| `packages/agents/src/blog/**` | blog-agent | conventions.md, architecture.md | — |
| `packages/agents/src/portfolio/**` | portfolio-agent | conventions.md | — |
| `packages/agents/src/tech-radar/**` | radar-agent | conventions.md | — |
| `packages/agents/src/core/**` | agent-core | conventions.md, architecture.md | — |
| `packages/agents/src/cli/**` | agent-cli | conventions.md | — |
| `packages/agents/src/types/**` | agent-types | conventions.md | typescript-advanced-types |
| `packages/agents/src/utils/**` | agent-utils | conventions.md | — |
| `packages/agents/src/**/*.test.ts` | agent-tests | developer.md | javascript-testing-patterns |

### QA & Testing

| Pattern | Subsystem | Load Context | Suggested Skill |
|---------|-----------|-------------|-----------------|
| `packages/qa-tools/src/**` | qa-tools | workflows.md | — |
| `tests/*.spec.ts` | e2e-tests | developer.md | e2e-testing-patterns |
| `tests/visual-regression*` | visual-tests | developer.md | — |
| `tests/performance*` | perf-tests | developer.md | — |
| `tests/accessibility*` | a11y-tests | developer.md | accessibility-compliance |
| `test/features/**/*.feature` | bdd-specs | developer.md | — |
| `test/step_definitions/**` | bdd-steps | developer.md | go-concurrency-patterns |
| `test/*.sh` | integration-tests | developer.md | bash-defensive-patterns |

### CI/CD & Release

| Pattern | Subsystem | Load Context | Suggested Skill |
|---------|-----------|-------------|-----------------|
| `.github/workflows/*.yml` | ci-cd | architecture.md, workflows.md | github-actions-templates |
| `.github/workflows/release-*` | release-system | architecture.md | — |
| `scripts/release*.sh` | release-scripts | architecture.md, workflows.md | — |
| `scripts/deploy*.sh` | deployment | workflows.md | deployment-pipeline-design |
| `scripts/validate*.sh` | validation | workflows.md | — |
| `.release/**` | release-requests | architecture.md | — |

### Infrastructure & Config

| Pattern | Subsystem | Load Context | Suggested Skill |
|---------|-----------|-------------|-----------------|
| `package.json` | monorepo-root | architecture.md | monorepo-management |
| `packages/*/package.json` | package-config | architecture.md | — |
| `bun.lock` | dependencies | — | dependency-upgrade |
| `vitest.config.*` | test-config | developer.md | — |
| `playwright.config.*` | e2e-config | developer.md | e2e-testing-patterns |
| `tsconfig*.json` | typescript-config | conventions.md | — |
| `.husky/**` | git-hooks | conventions.md | — |
| `.beads/**` | issue-tracking | workflows.md | — |

### Context System

| Pattern | Subsystem | Load Context | Suggested Skill |
|---------|-----------|-------------|-----------------|
| `.claude/context/**` | context-system | — | codified-context:* |
| `.claude/skills/**` | skills | — | plugin-dev:skill-development |
| `.claude/agents/**` | custom-agents | — | plugin-dev:agent-development |
| `CLAUDE.md` | project-config | — | claude-md-management:* |

## Keyword Triggers

| Keyword in Query | Route To | Reason |
|------------------|----------|--------|
| "blog post", "write a post" | blog-agent subsystem | Content generation |
| "portfolio", "case study" | portfolio-agent subsystem | Content generation |
| "tech radar", "radar entry" | radar-agent subsystem | Content generation |
| "deploy", "release", "version" | release-system | Release workflow |
| "test", "failing test", "spec" | testing subsystem (detect layer) | Test debugging |
| "CSS", "styling", "tailwind" | styling subsystem | Design changes |
| "template", "layout", "partial" | hugo-templates subsystem | Hugo development |
| "CI", "workflow", "action" | ci-cd subsystem | Pipeline work |
| "bead", "issue", "bd " | issue-tracking | Beads operations |
| "performance", "lighthouse", "CWV" | perf-tests | Performance work |
| "accessibility", "a11y", "WCAG" | a11y-tests | Accessibility work |
