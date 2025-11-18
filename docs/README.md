# Documentation Index

**Master index for all project documentation.** Use this to find authoritative sources before creating new docs.

## Quick Search

**Problem**: I need to... → **See**:

| Problem                        | Document                                                           | Keywords                               |
| ------------------------------ | ------------------------------------------------------------------ | -------------------------------------- |
| Understand the release process | [RELEASE_WORKFLOW.md](./operations/RELEASE_WORKFLOW.md)            | release, rc, tag, version, deploy      |
| Deploy to production           | [DEPLOYMENT.md](./operations/DEPLOYMENT.md) (WIP)                  | deploy, ci/cd, github actions          |
| Configure environments         | [ENVIRONMENT_CONFIG.md](./operations/ENVIRONMENT_CONFIG.md)        | env, staging, production, config       |
| Set up version bumping         | [VERSIONING_GUIDELINES.md](./development/VERSIONING_GUIDELINES.md) | version, semver, auto-bump, pre-commit |
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

- **[development/STYLE_GUIDE.md](./development/STYLE_GUIDE.md)** ⚠️ **WIP** - Will consolidate 8 style files
  - Topics: Architecture, design system, CSS, templates, content, workflow, performance, accessibility
  - Pending: Merge style-guide/\* files into single guide
  - Status: Under consolidation

- **[development/ACCESSIBILITY.md](./development/ACCESSIBILITY.md)** - WCAG compliance & accessibility standards
  - When: Building accessible features
  - Covers: WCAG 2.1 AA requirements, testing, components
  - Status: Maintained

- **[development/TESTING.md](./development/TESTING.md)** - Testing infrastructure & strategies
  - Unit tests (Go), BDD (Godog), E2E (Playwright)
  - Watch mode, CI integration
  - Status: Maintained

- **[development/BUN_MIGRATION_GUIDE.md](./development/BUN_MIGRATION_GUIDE.md)** - Switch from npm/pnpm to Bun
  - Package management, scripts, performance
  - Status: Maintained (reference for past migration)

### 📦 Component & Framework Decisions

**Design & implementation decisions** for major frameworks/components.

- **[development/COMPONENTS.md](./development/COMPONENTS.md)** ⚠️ **PLANNED** - Will consolidate DaisyUI decisions
  - Current: Scattered across DAISYUI\_\*.md files
  - Pending: Merge assessment + migration + best practices
  - Status: Needs consolidation

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

### 🏗️ In Progress (WIP)

- **STYLE_GUIDE.md** - Consolidating 8 style files into 1 authoritative source
- **COMPONENTS.md** - Consolidating DaisyUI docs (assessment, migration, best practices)

### 📦 To Archive

- `operations/RELEASE_MANAGEMENT.md` - Consolidated into DEPLOYMENT.md
- `operations/DEPLOYMENT_NOTES.md` - Consolidated into DEPLOYMENT.md
- `development/PM2_WORKFLOW_GUIDE.md` - Obsolete (PM2 → Bun)
- `development/PM2_DEVELOPMENT_WORKFLOW.md` - Obsolete (PM2 → Bun)
- `development/DAISYUI_FRAMEWORK_ASSESSMENT.md` - Merged into COMPONENTS.md
- `development/DAISYUI_MIGRATION_PLAN.md` - Merged into COMPONENTS.md
- `development/DAISYUI_BEST_PRACTICES.md` - Merged into COMPONENTS.md
- `development/CARD_TITLE_CENTERING_FIX.md` - One-off fix (archived)
- `development/TEST_BEHAVIOR_ANALYSIS.md` - Analysis artifact (archived)
- `development/DEVELOPMENT_SESSION_SUMMARY.md` - Session notes (archived)
- `development/HEADER_NAVIGATION_SYSTEM.md` - Implementation detail (archived)
- `development/CSS_VARIABLES_DESIGN_SYSTEM.md` - Merged into STYLE_GUIDE
- `development/ALPINEJS_SELFHOSTING_DECISION.md` - Historical decision (archived)
- `development/PATH_BASED_BUILDS.md` - Content moved to RELEASE_WORKFLOW

### 🆕 To Create

- **COMPONENTS.md** - Consolidate DaisyUI & component decisions
- **DEPLOYMENT.md** - Consolidate release & deployment procedures

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
│   ├── DEPLOYMENT.md                  🏗️ WIP (consolidating 3 docs)
│   └── ENVIRONMENT_CONFIG.md          ✅ maintained
├── development/                       (how to work on the project)
│   ├── STYLE_GUIDE.md                 🏗️ WIP (consolidating 8 files)
│   ├── VERSIONING_GUIDELINES.md       ✅ maintained
│   ├── ACCESSIBILITY.md               ✅ maintained
│   ├── TESTING.md                     ✅ maintained
│   ├── COMPONENTS.md                  🆕 planned
│   ├── BUN_MIGRATION_GUIDE.md         ✅ reference
│   ├── DEVELOPMENT_QUICK_REFERENCE.md ✅ maintained
│   ├── style-guide/                   (being consolidated into STYLE_GUIDE.md)
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
