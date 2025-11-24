# Documentation Index

**Master index for all project documentation.** Use this to find authoritative sources before creating new docs.

## Quick Search

**Problem**: I need to... → **See**:

| Problem                        | Document                                                                           | Keywords                               |
| ------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------- |
| Get started with local development | [tutorials/GETTING_STARTED.md](./tutorials/GETTING_STARTED.md)                | setup, install, dev server, prerequisites |
| Add or edit a blog post        | [tutorials/ADDING_BLOG_POST.md](./tutorials/ADDING_BLOG_POST.md)                  | blog, content, frontmatter, markdown   |
| Understand the build system    | [development/BUILD_SYSTEM.md](./development/BUILD_SYSTEM.md)                      | build, compilation, css, optimization  |
| Find & use build/deploy scripts | [development/SCRIPTS_ORGANIZATION.md](./development/SCRIPTS_ORGANIZATION.md)      | scripts, automation, reference         |
| Understand the release process | [RELEASE_WORKFLOW.md](./operations/RELEASE_WORKFLOW.md)                            | release, rc, tag, version, deploy      |
| Use Git upstream remote         | [UPSTREAM_REMOTES_GUIDE.md](./operations/UPSTREAM_REMOTES_GUIDE.md)                | upstream, git, push, fetch, remotes    |
| Deploy infrastructure changes  | [INFRASTRUCTURE_PROMOTION_WORKFLOW.md](./operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md) | infra, config, build, staging, production |
| Configure environments & access| [ENVIRONMENT_SETTINGS.md](./operations/ENVIRONMENT_SETTINGS.md)                   | env, permissions, branch protection, secrets |
| Rollback a deployment          | [operations/ROLLBACK_PROCEDURES.md](./operations/ROLLBACK_PROCEDURES.md)          | rollback, incident, emergency, revert  |
| Deploy to production           | [DEPLOYMENT.md](./operations/DEPLOYMENT.md)                                        | deploy, ci/cd, github actions          |
| Configure environment variables| [ENVIRONMENT_CONFIG.md](./operations/ENVIRONMENT_CONFIG.md)                        | env, staging, production, config       |
| Set up version bumping         | [VERSIONING_GUIDELINES.md](./development/VERSIONING_GUIDELINES.md)                 | version, semver, auto-bump, pre-commit |
| Work with styles/CSS           | [STYLE_GUIDE.md](./development/STYLE_GUIDE.md)                                    | css, tailwind, daisyui, styling        |
| Build accessible components    | [ACCESSIBILITY.md](./development/ACCESSIBILITY.md)                                | wcag, a11y, accessibility, aria        |
| Write/run tests                | [development/TESTING_ARCHITECTURE.md](./development/TESTING_ARCHITECTURE.md)      | test, bdd, e2e, unit, playwright, vitest |
| Test deployments               | [operations/DEPLOYMENT_TESTING.md](./operations/DEPLOYMENT_TESTING.md)            | validate, deployment test, integration |
| Migrate to Bun                 | [BUN_MIGRATION_GUIDE.md](./development/BUN_MIGRATION_GUIDE.md)                    | bun, npm, package manager              |

## By Topic

### 🎓 Getting Started & Tutorials

**Start here if you're new to the project** - setup, workflows, and content creation.

- **[tutorials/GETTING_STARTED.md](./tutorials/GETTING_STARTED.md)** - Local development setup and first steps
  - When: First-time setup, environment configuration
  - Covers: Prerequisites, installation, project structure, dev server, git workflow, troubleshooting
  - Status: New, comprehensive onboarding guide
  - Last updated: 2025-11-24

- **[tutorials/ADDING_BLOG_POST.md](./tutorials/ADDING_BLOG_POST.md)** - Creating and publishing blog posts
  - When: Writing blog content, publishing workflow
  - Covers: Frontmatter requirements, markdown structure, validation, tagging, deployment process
  - Status: New, complete blog publishing guide
  - Last updated: 2025-11-24

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

- **[operations/ROLLBACK_PROCEDURES.md](./operations/ROLLBACK_PROCEDURES.md)** - Incident response and rollback procedures
   - When: Production issue detected, emergency rollback needed
   - Covers: When to rollback, staging/production procedures, post-rollback checks, communication templates, prevention strategies
   - Status: New, comprehensive incident response guide
   - Last updated: 2025-11-24

- **[operations/DEPLOYMENT_TESTING.md](./operations/DEPLOYMENT_TESTING.md)** - Deployment validation and verification
   - When: Testing deployment infrastructure, validating infrastructure changes
   - Covers: 27 unit tests, 14 integration tests, pre/post-deployment checks, manual verification checklists
   - Status: Complete, comprehensive deployment testing guide
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

- **[development/TESTING_ARCHITECTURE.md](./development/TESTING_ARCHITECTURE.md)** ✅ **New** - Complete testing architecture and strategy
    - When: Writing tests, understanding test infrastructure, adding new test types
    - Covers: Unit (Vitest, Go), Integration (Bash), E2E (Playwright), Visual regression, BDD (Godog), Performance (Lighthouse)
    - Includes: Running tests, writing tests, coverage requirements, CI/CD integration, troubleshooting
    - Status: New, comprehensive testing guide
    - Last updated: 2025-11-24

- **[development/BUILD_SYSTEM.md](./development/BUILD_SYSTEM.md)** ✅ **New** - Build system and path-based compilation
    - When: Understanding build process, optimizing build times, configuring environments
    - Covers: Path-based detection, build environments (dev/staging/prod), CSS pipeline, asset optimization
    - Includes: Build commands, optimization tips, troubleshooting, CI/CD integration
    - Status: New, complete build system guide
    - Last updated: 2025-11-24

- **[development/SCRIPTS_ORGANIZATION.md](./development/SCRIPTS_ORGANIZATION.md)** ✅ **New** - Scripts reference and organization
    - When: Finding deployment/build/test scripts, understanding automation
    - Covers: 30+ scripts organized by function (build, deploy, test, validation, setup)
    - Includes: Script patterns, best practices, how to add new scripts, troubleshooting
    - Status: New, complete scripts reference
    - Last updated: 2025-11-24

- **[development/BUN_MIGRATION_GUIDE.md](./development/BUN_MIGRATION_GUIDE.md)** - Switch from npm/pnpm to Bun
   - Package management, scripts, performance
   - Status: Maintained (reference for past migration)

### 📦 Component & Framework Decisions

**Design & implementation decisions** for major frameworks/components.

- **[development/COMPONENTS.md](./development/COMPONENTS.md)** ✅ **Consolidated** - DaisyUI framework implementation and best practices
  - Merged from: DAISYUI_FRAMEWORK_ASSESSMENT.md + DAISYUI_MIGRATION_PLAN.md + DAISYUI_BEST_PRACTICES.md
  - Covers: Current assessment, implementation status, migration strategy, core principles, component guidelines, testing standards
  - Status: Complete, replaces all 3 DaisyUI docs

### 🔗 Integration & Workflow

**How systems work together** for unified development workflow.

- **[integration/CODY_BEADS_WORKFLOW.md](./integration/CODY_BEADS_WORKFLOW.md)** ✅ **Phase 1 Implementation** - Cody Framework and Beads integration
  - When: Understanding feature planning ↔ task execution ↔ releases
  - Covers: Three-layer architecture, naming conventions, manual synchronization, dependency tracking, weekly workflow
  - Includes: Command reference, common scenarios, troubleshooting
  - Status: New, Phase 1 (manual linking) operational
  - Last updated: 2025-11-24

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
├── tutorials/                         (getting started, how-to guides)
│   ├── GETTING_STARTED.md             ✅ new (local setup, first steps)
│   └── ADDING_BLOG_POST.md            ✅ new (content creation workflow)
├── operations/                        (release, deployment, infrastructure)
│   ├── RELEASE_WORKFLOW.md            ✅ maintained
│   ├── UPSTREAM_REMOTES_GUIDE.md      ✅ new
│   ├── INFRASTRUCTURE_PROMOTION_WORKFLOW.md ✅ new
│   ├── ENVIRONMENT_SETTINGS.md        ✅ new
│   ├── ROLLBACK_PROCEDURES.md         ✅ new (incident response)
│   ├── DEPLOYMENT_TESTING.md          ✅ new (27+14 tests)
│   ├── DEPLOYMENT.md                  ✅ consolidated
│   └── ENVIRONMENT_CONFIG.md          ✅ maintained
├── development/                       (how to work on the project)
│   ├── STYLE_GUIDE.md                 ✅ consolidated
│   ├── VERSIONING_GUIDELINES.md       ✅ maintained
│   ├── ACCESSIBILITY.md               ✅ maintained
│   ├── TESTING_ARCHITECTURE.md        ✅ new (unit, E2E, BDD, visual, perf)
│   ├── BUILD_SYSTEM.md                ✅ new (path-based builds, environments)
│   ├── SCRIPTS_ORGANIZATION.md        ✅ new (30+ scripts reference)
│   ├── COMPONENTS.md                  ✅ consolidated
│   ├── BUN_MIGRATION_GUIDE.md         ✅ reference
│   ├── DEVELOPMENT_QUICK_REFERENCE.md ✅ maintained
│   └── _archived/                     (old docs, session notes, assessments)
└── releases/                          (version-specific notes)
```

## Legend

| Status        | Meaning                         |
| ------------- | ------------------------------- |
| ✅ maintained | Actively used, up to date       |
| 🏗️ WIP        | Under consolidation or redesign |
| 🆕 planned    | Will be created soon            |
| 📦 archived   | Historical reference only       |
| ⚠️ WIP        | Will change soon                |
