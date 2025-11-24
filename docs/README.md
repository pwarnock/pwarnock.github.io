# Documentation Index

**Master index for all project documentation.** Use this to find authoritative sources before creating new docs.

## Quick Search

**Problem**: I need to... → **See**:

| Problem                        | Document                                                                           | Keywords                               |
| ------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------- |
| Understand the release process | [RELEASE_WORKFLOW.md](./operations/RELEASE_WORKFLOW.md)                            | release, rc, tag, version, deploy      |
| Use Git upstream remote         | [UPSTREAM_REMOTES_GUIDE.md](./operations/UPSTREAM_REMOTES_GUIDE.md)                | upstream, git, push, fetch, remotes    |
| Deploy infrastructure changes  | [INFRASTRUCTURE_PROMOTION_WORKFLOW.md](./operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md) | infra, config, build, staging, production |
| Configure environments & access| [ENVIRONMENT_SETTINGS.md](./operations/ENVIRONMENT_SETTINGS.md)                   | env, permissions, branch protection, secrets |
| Deploy to production           | [DEPLOYMENT.md](./operations/DEPLOYMENT.md) (WIP)                                  | deploy, ci/cd, github actions          |
| Configure environment variables| [ENVIRONMENT_CONFIG.md](./operations/ENVIRONMENT_CONFIG.md)                        | env, staging, production, config       |
| Set up version bumping         | [VERSIONING_GUIDELINES.md](./development/VERSIONING_GUIDELINES.md)                 | version, semver, auto-bump, pre-commit |
| Work with styles/CSS           | [STYLE_GUIDE.md](./development/STYLE_GUIDE.md) (WIP)               | css, tailwind, daisyui, styling        |
| Build accessible components    | [ACCESSIBILITY.md](./development/ACCESSIBILITY.md)                 | wcag, a11y, accessibility, aria        |
| Write/run tests                | [TESTING.md](./development/TESTING.md)                             | test, bdd, e2e, unit, playwright       |
| Migrate to Bun                 | [BUN_MIGRATION_GUIDE.md](./development/BUN_MIGRATION_GUIDE.md)     | bun, npm, package manager              |

## By Topic

### 🚀 Release & Deployment

**Authoritative docs** for release process and production deployment.

- **[operations/RELEASE_WORKFLOW.md](./operations/RELEASE_WORKFLOW.md)** - Three-stage release (RC → test → production)
  - When: Use for release decisions, RC testing, tag creation
  - Covers: Auto-versioning, tag lifecycle, troubleshooting
  - Last updated: 2025-11-17

- **[operations/UPSTREAM_REMOTES_GUIDE.md](./operations/UPSTREAM_REMOTES_GUIDE.md)** - Git upstream remote and collaborative workflow
  - When: Setting up remotes, pushing code to upstream, understanding deployment flow
  - Covers: Remote configuration, main branch workflow, release tag workflow, pre-push guardrails, troubleshooting
  - Status: New, documents upstream remote usage
  - Last updated: 2025-11-24

- **[operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md](./operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md)** - Manual promotion of infrastructure changes
  - When: Deploying build config, layout, CSS, or other infrastructure changes
  - Covers: main → staging → production promotion, validation checklist, monitoring, troubleshooting
  - Status: New, replaces manual promotion documentation gaps
  - Last updated: 2025-11-24

- **[operations/ENVIRONMENT_SETTINGS.md](./operations/ENVIRONMENT_SETTINGS.md)** - Environment-specific configuration and access control
  - When: Setting up environments, configuring secrets, managing permissions
  - Covers: Hugo config per environment, git branch protection, deployment authorization, analytics config, security headers, emergency procedures
  - Status: New, documents environment access control matrix
  - Last updated: 2025-11-24

- **[operations/DEPLOYMENT.md](./operations/DEPLOYMENT.md)** ✅ **Consolidated** - Deployment procedures, versioning, and release management
  - Merged from: RELEASE_MANAGEMENT.md + DEPLOYMENT_NOTES.md
  - Covers: Checklists, CI/CD architecture, three-stage release, version management, post-release validation, critical issues, troubleshooting
  - Status: Complete, replaces RELEASE_MANAGEMENT.md and DEPLOYMENT_NOTES.md

- **[operations/ENVIRONMENT_CONFIG.md](./operations/ENVIRONMENT_CONFIG.md)** - Environment setup (staging, production)
  - When: Configuring environments, managing secrets
  - Status: Maintained

### 🔧 Development Workflow

**How to work on the project** - building, testing, styling, versioning.

- **[development/VERSIONING_GUIDELINES.md](./development/VERSIONING_GUIDELINES.md)** - Semantic versioning & auto-bumping
  - Pre-commit hook analyzes commits → bumps version
  - Feature commits: minor bump, default: patch
  - Last updated: 2025-11-17

- **[development/STYLE_GUIDE.md](./development/STYLE_GUIDE.md)** ✅ **Consolidated** - Complete guide to architecture, design, CSS, templates, content, development, performance, and accessibility
  - Merged from: 8 style-guide files + CSS_VARIABLES_DESIGN_SYSTEM.md
  - Covers: Project architecture, design system, CSS guidelines, template conventions, content guidelines (critical: first-person voice, no H1 in markdown), development workflow, performance, accessibility
  - Status: Complete, replaces style-guide/\* files

- **[development/ACCESSIBILITY.md](./development/ACCESSIBILITY.md)** - WCAG compliance & accessibility standards
  - When: Building accessible features
  - Covers: WCAG 2.1 AA requirements, testing, components
  - Status: Maintained

- **[development/TESTING.md](./development/TESTING.md)** - Testing infrastructure & strategies
   - Unit tests (Go), BDD (Godog), E2E (Playwright)
   - Watch mode, CI integration
   - Status: Maintained

- **[development/DEPLOYMENT_TESTING.md](./development/DEPLOYMENT_TESTING.md)** ✅ **New** - Deployment validation and verification
   - Unit tests for deployment scripts (27 tests)
   - Integration tests for workflow (14 tests)
   - Pre/post-deployment validation
   - Manual verification checklists
   - Status: New, comprehensive deployment testing

- **[development/BUN_MIGRATION_GUIDE.md](./development/BUN_MIGRATION_GUIDE.md)** - Switch from npm/pnpm to Bun
  - Package management, scripts, performance
  - Status: Maintained (reference for past migration)

### 📦 Component & Framework Decisions

**Design & implementation decisions** for major frameworks/components.

- **[development/COMPONENTS.md](./development/COMPONENTS.md)** ✅ **Consolidated** - DaisyUI framework implementation and best practices
  - Merged from: DAISYUI_FRAMEWORK_ASSESSMENT.md + DAISYUI_MIGRATION_PLAN.md + DAISYUI_BEST_PRACTICES.md
  - Covers: Current assessment, implementation status, migration strategy, core principles, component guidelines, testing standards
  - Status: Complete, replaces all 3 DaisyUI docs

### 📚 Reference Guides

**Quick reference and tool guides.**

- **[DEVELOPMENT_QUICK_REFERENCE.md](./DEVELOPMENT_QUICK_REFERENCE.md)** - Commands and quick tips
  - Status: Maintained

### 📋 Release Notes

Historical release notes by version.

- **[releases/](./releases/)** - Version-specific release notes
  - Format: `v0.x.x.md`
  - Status: Archive

## Consolidation Status

### ✅ Complete

- Path-based CI/CD logic documented
- DEPLOYMENT.md - Consolidated release management procedures
- STYLE_GUIDE.md - Consolidated development style guide

### 🏗️ In Progress (WIP)

(None currently)

### 📦 Archived

All obsolete and consolidated documents are moved to `docs/development/_archived/` and `docs/operations/_archived/`:

**Consolidated into active docs:**

- DEPLOYMENT.md - Merged from RELEASE_MANAGEMENT.md + DEPLOYMENT_NOTES.md
- STYLE_GUIDE.md - Merged from 8 style-guide files + CSS_VARIABLES_DESIGN_SYSTEM.md
- COMPONENTS.md - Merged from 3 DaisyUI docs

**Obsolete/Historical:**

- PM2_WORKFLOW_GUIDE.md, PM2_DEVELOPMENT_WORKFLOW.md (migrated to Bun)
- ALPINEJS_SELFHOSTING_DECISION.md (historical decision)
- CARD_TITLE_CENTERING_FIX.md, TEST_BEHAVIOR_ANALYSIS.md, DEVELOPMENT_SESSION_SUMMARY.md, HEADER_NAVIGATION_SYSTEM.md (one-off analysis)
- PATH_BASED_BUILDS.md (content moved to RELEASE_WORKFLOW.md)

## Rules for AI Agents

### Before Creating Documentation

1. **Check this index** - Is there already a doc for this topic?
2. **Search `/docs`** - Use grep/find to look for related content
3. **Propose consolidation** - If similar docs exist, suggest merging
4. **Link to parent** - New discoveries → add to existing doc with date

### Adding New Knowledge

- **Bug fix or workaround?** → Add to relevant doc with date stamp
- **New topic/process?** → Propose in `.tmp/` first, link to parent issue
- **Never duplicate** solutions across multiple docs

### Questions?

- Check the quick search table above
- Look for similar keywords across all docs
- If truly new topic: create issue, propose structure in `.tmp/`, wait for approval

## File Organization

```
docs/
├── README.md                          (this file - master index)
├── operations/                        (release, deployment, infrastructure)
│   ├── RELEASE_WORKFLOW.md            ✅ maintained
│   ├── UPSTREAM_REMOTES_GUIDE.md      ✅ new
│   ├── INFRASTRUCTURE_PROMOTION_WORKFLOW.md ✅ new
│   ├── ENVIRONMENT_SETTINGS.md        ✅ new
│   ├── DEPLOYMENT.md                  ✅ consolidated
│   └── ENVIRONMENT_CONFIG.md          ✅ maintained
├── development/                       (how to work on the project)
│   ├── STYLE_GUIDE.md                 ✅ consolidated
│   ├── VERSIONING_GUIDELINES.md       ✅ maintained
│   ├── ACCESSIBILITY.md               ✅ maintained
│   ├── TESTING.md                     ✅ maintained
│   ├── COMPONENTS.md                  ✅ consolidated
│   ├── BUN_MIGRATION_GUIDE.md         ✅ reference
│   ├── DEVELOPMENT_QUICK_REFERENCE.md ✅ maintained
│   └── _archived/                     (old docs, session notes, assessments)
├── releases/                          (version-specific notes)
└── development/
    └── DEVELOPMENT_QUICK_REFERENCE.md
```

## Legend

| Status        | Meaning                         |
| ------------- | ------------------------------- |
| ✅ maintained | Actively used, up to date       |
| 🏗️ WIP        | Under consolidation or redesign |
| 🆕 planned    | Will be created soon            |
| 📦 archived   | Historical reference only       |
| ⚠️ WIP        | Will change soon                |
