# Project Cleanup & Architecture Plan

**Date**: November 24, 2025  
**Status**: Strategic Planning Phase  
**Priority**: Foundation for sustainable development

## Executive Summary

The project has strong deployment infrastructure (pw-21, pw-23, pw-24, pw-25) with 41 passing tests and good CI/CD foundations. However, there are accumulated artifacts from framework experiments, agent configurations, and work directories that should be systematically cleaned up and organized. This plan ensures the codebase remains maintainable while supporting future development.

---

## Part 1: Current State Analysis

### Strengths
- ✅ **Deployment Infrastructure**: Production-ready (all 41 tests passing)
- ✅ **Testing Foundation**: Unit, integration, E2E, BDD, visual regression
- ✅ **Pre-commit Hooks**: Linting, validation, security checks
- ✅ **Environment Strategy**: Main → staging → production with branch protection
- ✅ **Documentation**: Comprehensive guides in `/docs/operations/` and `/docs/development/`
- ✅ **Package Management**: Bun with clean package.json structure
- ✅ **Dependency Hygiene**: Just resolved glob advisory

### Problems to Fix

#### 1. **Root-Level Documentation Clutter** (~17 files)
Experimental/working documents at root level that should be archived:
```
AMP_AGENT_STRATEGY.md              ← Agent framework experiments
AMP_COMMANDS_REFERENCE.md          ← Agent commands reference
BDD_TEST_RESOLUTION_SUMMARY.md     ← Old test work
CODY_BEADS_RECONCILIATION.md       ← Cody framework reconciliation
CODY_PBT_*.md (3 files)            ← Cody property-based testing migration
CONTRAST_FIX_LOG.md                ← Old accessibility work
CURRENT_UNIT_TESTS_OVERVIEW.md     ← Superseded by testing structure
DEV_SERVER_MANAGEMENT.md           ← Old dev setup docs
FONT_CONTRAST_FIX_PLAN.md          ← Old a11y planning
GEMINI.md                          ← Unknown/experimental
RECONCILIATION_SUMMARY.md          ← Process reconciliation work
SUBAGENT_QUICK_START.md            ← Agent framework docs
TESTING_BACKLOG_SUMMARY.md         ← Superseded by test structure
TOMORROW_PLAN.md                   ← Daily planning (ephemeral)
UNIFIED_TEST_RUNNER.md             ← Old test infrastructure
```

**Impact**: Noise in git root, confusing for new developers, makes AGENTS.md harder to find

#### 2. **Backup & Cache Directories**
```
.cody.backup.20251124_094441/      ← 744K (framework backups)
.cody.backup.20251124_095017/      ← 788K (framework backups)
.cody/project/library/             ← New audit docs (144K)
.agents/                           ← Agent config experiments
.claude/agents/                    ← Claude agent definitions
.claude/commands/                  ← Claude command definitions
.pids/                             ← 13M (PM2 pid files - should be ignored)
```

**Impact**: ~2.5MB in version control, inflates clone size, clutters git status

#### 3. **Work Directory** (~3MB)
```
work/
├── cody-pbt-source/               ← Git submodule (duplicate clone)
├── cody-pbt-test/                 ← Migration test environment
├── migrate-to-pbt.sh              ← Migration scripts
├── test-migration.sh
└── DATA_MAPPING_ANALYSIS.md       ← Analysis from experiments
```

**Impact**: 3MB in git, includes git repos as embedded repos, hides real work

#### 4. **Test Results** 
```
test-results/                      ← Visual regression baselines (ephemeral)
tmp/                               ← Temporary files from build/test runs
debug-focus-*.png                  ← Debug screenshots (root level)
```

**Impact**: Should be in gitignore, clutters repo

#### 5. **Configuration Proliferation**
```
.letta/                           ← Framework-specific config (should be ignored)
.letta.example/                   ← Example config
.letta.schema.json                ← Schema definition
.opencode.jsonc                   ← New (unclear purpose)
.claude/session-state.json        ← Session state (ephemeral)
```

**Impact**: Framework-specific files not part of core project

---

## Part 2: Ideal Architecture

### Root Level Structure (Clean)
```
pwarnock.github.io/
├── .git/
├── .gitignore                     ← Updated to exclude backups
├── .github/                       ← CI/CD workflows (keep)
├── .husky/                        ← Git hooks (keep)
├── .pre-commit-config.yaml        ← Pre-commit setup (keep)
├── .prettierrc, .stylelintrc.json ← Linters (keep)
├── AGENTS.md                      ← Development guide (only agent doc)
├── CONTRIBUTING.md                ← Contribution guide (keep)
├── LICENSE                        ← License (keep)
├── README.md                      ← Project overview (keep)
├── package.json                   ← Dependencies (keep)
├── bun.lock                       ← Lockfile (keep)
├── hugo.toml                      ← Hugo config (keep)
├── tailwind.config.js             ← Tailwind config (keep)
├── postcss.config.cjs             ← PostCSS config (keep)
├── playwright.config.ts           ← E2E config (keep)
├── vitest.config.ts               ← Unit test config (keep)
├── lighthouserc.js                ← Performance config (keep)
├── ecosystem.config.cjs           ← PM2 config (keep)
├── .env.example                   ← Env template (keep)
├── .htmltest.yml                  ← HTML validation (keep)
├── gitleaks.toml                  ← Security scanning (keep)
│
├── archetypes/                    ← Hugo archetypes (keep)
├── assets/                        ← Source assets (keep)
├── config/                        ← Hugo environment configs (keep)
├── content/                       ← Site content (keep)
├── data/                          ← Hugo data files (keep)
├── docs/                          ← Operational documentation (keep + expand)
├── layouts/                       ← Hugo templates (keep)
├── scripts/                       ← Build/deploy scripts (keep)
├── src/                           ← TypeScript tools (keep)
├── static/                        ← Static files (keep)
├── test/                          ← Test infrastructure (keep)
├── tests/                         ← E2E tests (keep)
│
├── .gitignore                     ← Updated to exclude framework dirs
├── .bd.toml                       ← Beads config (if needed)
└── (NO more root-level .md docs)
```

### Documentation Hierarchy (Reorganized)

**Root Level** (Only essentials):
- `README.md` - Project overview, quick start
- `AGENTS.md` - Agent development guide (this is the ONLY workflow doc at root)
- `CONTRIBUTING.md` - How to contribute
- `LICENSE` - License

**`/docs` (Canonical Documentation)**:
```
docs/
├── README.md                          ← Documentation index
├── development/
│   ├── STYLE_GUIDE.md                ← Hugo site architecture & design
│   ├── ACCESSIBILITY.md              ← WCAG compliance
│   ├── VERSIONING_GUIDELINES.md      ← SemVer principles
│   ├── BUN_MIGRATION_GUIDE.md        ← Bun tooling
│   └── TESTING_ARCHITECTURE.md       ← [NEW] Unified test documentation
├── operations/
│   ├── RELEASE_MANAGEMENT.md         ← Release procedures
│   ├── DEPLOYMENT_NOTES.md           ← Deployment config & troubleshooting
│   ├── ENVIRONMENT_CONFIG.md         ← Environment setup
│   ├── INFRASTRUCTURE_PROMOTION_WORKFLOW.md  ← Manual promotions
│   ├── ENVIRONMENT_SETTINGS.md       ← Permissions & branch protection
│   ├── DEPLOYMENT_TESTING.md         ← Test procedures
│   └── ROLLBACK_PROCEDURES.md        ← [NEW] Emergency recovery
└── tutorials/
    ├── GETTING_STARTED.md           ← [NEW] Local dev setup
    ├── ADDING_BLOG_POST.md          ← [NEW] Content workflow
    └── PERFORMANCE_OPTIMIZATION.md  ← [NEW] Bundle/performance work
```

### Framework Configuration Strategy

**Keep** (Project-essential):
- `.github/` - GitHub Actions workflows (CI/CD backbone)
- `.husky/` - Git hooks (quality gates)
- `.pre-commit-config.yaml` - Pre-commit hooks

**Archive/Deprecate** (Experimental frameworks):
- `.cody/` - Cody Framework internals (read-only, never edit manually)
- `.agents/`, `.claude/` - Agent definitions (framework-generated, not part of core project)
- `.letta/` - Letta AI framework (external, should be .gitignored)

**Add to `.gitignore`**:
```bash
# Framework-generated directories (read-only)
.cody.backup.*/
.agents/
.claude/
.letta/
.letta.example/

# Ephemeral files
.pids/
test-results/
tmp/
.cache/

# Session state (regenerated)
.claude/session-state.json
.letta.schema.json
```

---

## Part 3: Cleanup Tasks (Ordered by Impact)

### Phase 1: Quick Wins (1-2 hours)

**Task 1.1**: Update `.gitignore`
- Add framework backup patterns
- Add ephemeral directories
- Verify everything unwanted is ignored

**Task 1.2**: Move experimental docs to `work/` or delete
```bash
# Archive these (move to work/archive/)
├── AMP_AGENT_STRATEGY.md
├── CODY_*.md (all 4)
├── RECONCILIATION_SUMMARY.md
└── SUBAGENT_QUICK_START.md

# Delete (superseded)
├── BDD_TEST_RESOLUTION_SUMMARY.md
├── CURRENT_UNIT_TESTS_OVERVIEW.md
├── UNIFIED_TEST_RUNNER.md
├── TESTING_BACKLOG_SUMMARY.md
├── TOMORROW_PLAN.md

# Keep but clean up references
├── CONTRAST_FIX_LOG.md → Link from accessibility docs
├── FONT_CONTRAST_FIX_PLAN.md → Link from accessibility docs
└── DEV_SERVER_MANAGEMENT.md → Link from dev setup guide
```

**Task 1.3**: Clean root-level debug files
```bash
rm -f debug-focus-*.png
rm -f cody-*.log cody-migration.log cody-backup.log cody-health-check.log
rm -f AGENTS.md.backup AGENTS.md.bak
```

**Task 1.4**: Add `.gitignore` entries
```bash
# Framework-specific (never commit)
.cody.backup.*/
.agents/
.claude/
.letta/
.letta*.json
.opencode.jsonc

# Ephemeral (regenerated)
.pids/
test-results/
debug-*.png
cody-*.log
```

### Phase 2: Repository Cleanup (2-3 hours)

**Task 2.1**: Clean git index
```bash
git rm --cached -r .cody.backup.* .agents .claude .pids test-results
git rm --cached debug-*.png *.log
git rm --cached work/cody-pbt-* work/migrate-to-pbt.sh work/test-migration.sh
```

**Task 2.2**: Move experimental docs to archive
```bash
mkdir -p work/archive/
mv AMP_AGENT_STRATEGY.md work/archive/
mv CODY_PBT_IMPLEMENTATION_COMPLETE.md work/archive/
# ... etc
```

**Task 2.3**: Delete superseded docs (with git log reference)
```bash
# Document why in commit message that these were superseded by:
# - DEPLOYMENT_TESTING.md
# - TESTING_ARCHITECTURE.md (new)
# - docs/operations/ structure
git rm BDD_TEST_RESOLUTION_SUMMARY.md CURRENT_UNIT_TESTS_OVERVIEW.md
```

**Task 2.4**: Commit cleanup
```bash
git add .gitignore
git commit -m "chore: update gitignore to exclude ephemeral and framework files"

git add -A
git commit -m "chore: archive experimental framework docs to work/archive/"

git add -A
git commit -m "chore: remove superseded documentation (consolidated into docs/)"
```

### Phase 3: Documentation Expansion (3-4 hours)

**Task 3.1**: Create new canonical docs
```
docs/development/TESTING_ARCHITECTURE.md
├── Overview of all test types (unit, integration, E2E, visual, BDD)
├── When to use each type
├── How to add tests
├── Coverage expectations
└── CI/CD integration

docs/operations/ROLLBACK_PROCEDURES.md
├── Emergency rollback process
├── Git reset procedures
├── Staging vs Production rollback differences
└── Communication checklist

docs/tutorials/GETTING_STARTED.md
├── Prerequisites (Bun, Hugo, Go)
├── Local setup (dev environment)
├── Running tests locally
├── Common workflows

docs/tutorials/ADDING_BLOG_POST.md
├── Blog directory structure
├── Frontmatter requirements
├── Content guidelines
├── Preview and publish
```

**Task 3.2**: Update docs/README.md index
- Add TESTING_ARCHITECTURE.md
- Add ROLLBACK_PROCEDURES.md
- Remove references to deleted docs
- Add tutorials/ section

**Task 3.3**: Update AGENTS.md
- Ensure it references /docs/ for detailed procedures
- Keep only high-level agent workflow
- Add quick links to common docs

---

## Part 4: Architectural Improvements

### Testing Architecture (Codify Current State)

Create `docs/development/TESTING_ARCHITECTURE.md`:

```markdown
# Testing Architecture

## Test Types & Responsibilities

| Type | Tool | Purpose | Location | Run Command |
|------|------|---------|----------|------------|
| **Unit** | Vitest + Go | Code correctness | `src/**/*.test.ts`, `test/support/` | `bun run test:unit` |
| **Integration** | Bash scripts | Workflow validation | `test/*.sh` | `bun run test:deployment` |
| **E2E** | Playwright | User journeys | `tests/` | `bunx playwright test` |
| **Visual** | Playwright | Design regressions | `tests/` | `bunx playwright test --grep @visual` |
| **BDD** | Godog | Behavior specs | `test/features/` | `bun run test:bdd` |
| **Performance** | Lighthouse | Metrics tracking | `tests/` | `bun run test:perf:watch` |

## Coverage Requirements

- **Core logic**: ≥80% unit test coverage
- **Workflows**: All critical paths in integration tests
- **UI Changes**: Visual regression baseline updated
- **Deployments**: Pre/post validation scripts passing
- **Performance**: Lighthouse scores tracked

## Adding Tests

1. Identify type needed (see table above)
2. Create test file in appropriate location
3. Update package.json if new test runner needed
4. Add to CI/CD workflow if critical path
5. Document in TESTING_ARCHITECTURE.md
```

### Build System (Document & Optimize)

Current excellence (working well):
- Path-based build detection (infrastructure vs content vs docs)
- Pre-commit validation (fast feedback)
- Hugo multi-config (dev/staging/production)
- Environment-specific optimization

Document in `docs/development/BUILD_SYSTEM.md`:
- Build flow diagram
- When each build type runs
- How to optimize builds locally
- CI/CD integration

### Script Organization

**Current**: `scripts/` with 30+ scripts (mostly good, some overlap)

**Improvements**:
```
scripts/
├── build/                    ← Build-related
│   ├── path-based-build.sh
│   ├── build:cleanup.sh
│   └── generate-version.js
├── deploy/                   ← Deployment-related
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   ├── sync-environments.sh
│   └── validate-deployment.sh
├── test/                     ← Test-related
│   ├── run-all-unit-tests.sh
│   ├── dev-test-runner.sh
│   └── (move .sh files from test/ here)
├── dev/                      ← Development utilities
│   ├── dev-cycle-start.sh
│   ├── pm2-agent-integration.sh
│   └── performance-monitor.sh
└── setup/                    ← Initial setup
    ├── setup-environments.sh
    ├── setup-branch-protection.sh
    └── letta-config-init.sh
```

Action: Document this in `docs/development/SCRIPTS_ORGANIZATION.md` (no code changes needed yet).

---

## Part 5: Git Housekeeping

### Commits to Make

**Commit 1** (15 min): Dependency fix
```
fix: upgrade markdownlint-cli to resolve glob command injection advisory
✅ [ALREADY DONE]
```

**Commit 2** (30 min): Gitignore cleanup
```
chore: update gitignore to exclude framework artifacts and ephemeral files

- Add .cody.backup.* pattern
- Add .agents/ and .claude/ directories
- Add .pids/, test-results/, tmp/ (ephemeral)
- Add .letta/ and .letta*.json (framework config)
- Add .opencode.jsonc (unclear purpose)
```

**Commit 3** (30 min): Documentation archive
```
chore: archive experimental documentation to work/archive/

Archive from root level to work/archive/:
- AMP_AGENT_STRATEGY.md
- CODY_PBT_*.md
- SUBAGENT_QUICK_START.md
- AMP_COMMANDS_REFERENCE.md
- RECONCILIATION_SUMMARY.md

Rationale: These document framework experiments and agent setup,
not core project functionality. Moving to archive keeps git root clean.
```

**Commit 4** (15 min): Remove superseded docs
```
chore: remove superseded documentation

Remove (consolidated into docs/operations/DEPLOYMENT_TESTING.md):
- BDD_TEST_RESOLUTION_SUMMARY.md
- CURRENT_UNIT_TESTS_OVERVIEW.md
- UNIFIED_TEST_RUNNER.md
- TESTING_BACKLOG_SUMMARY.md

Remove (ephemeral daily planning):
- TOMORROW_PLAN.md

These were from earlier development phases and functionality
is now captured in canonical documentation structure.
```

**Commit 5** (30 min): Clean debug artifacts
```
chore: remove debug artifacts and temporary files

- Remove debug-focus-*.png (old focus management debug)
- Remove cody-*.log files (build artifacts)
- Remove AGENTS.md.backup, AGENTS.md.bak
- Remove package-lock.json backups (if any)
```

**Commit 6** (2 hours): Create new documentation
```
docs: add comprehensive testing and rollback documentation

New documents:
- docs/development/TESTING_ARCHITECTURE.md
- docs/operations/ROLLBACK_PROCEDURES.md
- docs/tutorials/GETTING_STARTED.md
- docs/tutorials/ADDING_BLOG_POST.md

Updated:
- docs/README.md (new index entries)
- AGENTS.md (simplified, links to canonical docs)

This consolidates testing and deployment knowledge
into discoverable, maintainable documentation.
```

### Git Repo Stats Before/After

**Before**:
- ~300 untracked files (experiments)
- ~17 root-level .md files
- 2.5MB in framework backups
- 3.0MB in work/ experiments
- ~13MB in .pids/
- Cluttered `git status` output

**After**:
- <50 untracked files (only active work)
- 4 root-level .md files (README, LICENSE, AGENTS, CONTRIBUTING)
- 0MB in backups/experiments (archived)
- Clean `/work/archive/` for reference
- Ignored .pids/ (automatic exclusion)
- Clear `git status` (only relevant files)

---

## Part 6: Implementation Roadmap

### Week 1: Cleanup (Priority 1)
- [ ] Day 1: Phase 1 tasks (quick wins) - 2 hours
- [ ] Day 2: Phase 2 tasks (git cleanup) - 3 hours
- [ ] Day 3: Phase 3 tasks (new docs) - 4 hours
- [ ] Day 4: Review & verification - 1 hour

**Total**: 10 hours over 4 days

### Week 2: Architecture Docs (Priority 2)
- [ ] Document testing architecture
- [ ] Document build system
- [ ] Document script organization
- [ ] Update AGENTS.md with navigation

**Total**: 4 hours, can be done incrementally

### Ongoing: Keep Clean
- [ ] Don't commit framework artifacts (use .gitignore)
- [ ] Archive experimental work to `/work/archive/`
- [ ] Keep root-level only essential (.md files)
- [ ] Link from root docs to canonical `/docs/`

---

## Part 7: Quality Gates

**Before**: 
- All tests passing ✓
- No git warnings ✓

**After** (add these):
- [ ] `npm audit` shows no high-severity dev vulns ✓
- [ ] `git status` shows <20 untracked files
- [ ] All docs link correctly (no broken references)
- [ ] AGENTS.md references canonical /docs/
- [ ] No .md files at root except: README, LICENSE, AGENTS, CONTRIBUTING
- [ ] /docs/README.md index is current

---

## Summary

This cleanup achieves:

1. **Clarity**: Project structure is immediately obvious to new developers
2. **Maintainability**: Documentation is canonical and well-organized
3. **Quality**: Reduces git noise and potential security issues
4. **Scalability**: Foundation for adding new features without clutter
5. **Professionalism**: Git history and file structure match production standards

**Next Steps**:
1. Review this plan for feedback
2. Execute Phase 1 (quick wins) immediately
3. Block Phase 2-3 for dedicated cleanup day
4. Implement quality gates to prevent regression
