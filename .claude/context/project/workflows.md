# Project Workflows

A high-level overview of the key development, release, deployment, and issue tracking workflows used in this project. For detailed guides, follow the links to full documentation.

---

## Development Workflows

Development follows a structured TDD (Test-Driven Development) approach with feature branches, code review via PRs, and automated validation.

### Quick Start

```bash
# 1. Start development server
bun run dev

# 2. Create or claim an issue
bd create "Feature name" -t feature -p 2 --json
# or update existing: bd update bd-XX --status in_progress

# 3. Create feature branch
git checkout -b feature/feature-name

# 4. Write tests first (E2E with Playwright)
# tests/feature-name.spec.ts

# 5. Implement feature to pass tests

# 6. Run tests and validation
bun run test:e2e
bun run lint
bun run validate

# 7. Commit with test results
git commit -m "feat: Feature Name (pw-XXX)
- Implement feature X
- Add E2E tests covering main use cases
- All tests passing"

# 8. Push and create PR
git push origin feature/feature-name
# Create PR in GitHub with issue references

# 9. After merge, close issue
bd close bd-XX --reason "Merged"
```

### Testing Strategy

Three layers of testing:

1. **E2E Tests (Playwright)** - Primary validation
   - User interactions across UI
   - Cross-browser (Chromium, Firefox, Safari)
   - Location: `tests/*.spec.ts`
   - Run: `bun run test:e2e`
   - Best for: Features, analytics, navigation, accessibility

2. **Unit Tests (Vitest)** - Logic validation
   - Utility functions and business logic
   - Location: `src/**/*.test.ts`
   - Run: `bun run test:unit:ts`
   - Best for: Complex functions without DOM

3. **Accessibility Tests (Axe)** - A11y compliance
   - Integrated into E2E tests
   - Automated WCAG checks
   - Run: `bun run test:accessibility`

**Full workflow:** See [TESTING_WORKFLOW.md](../../docs/development/TESTING_WORKFLOW.md) for detailed patterns, examples, and debugging tips.

### Pre-Push Validation

```bash
# Before pushing code:
bun run lint          # Code quality checks
bun run validate      # Content and build validation
bun run build:path    # Path-based build (auto-detects changes)
```

**Pre-commit hooks** automatically enforce:
- Code formatting via Prettier
- YAML/TOML linting
- CSS validation
- Build test

Hooks use `FORCE_PUSH=yes` environment variable to bypass if needed (not recommended).

### Feature Branch Strategy

```
main (stable, always deployable)
 ├── feature/navigation-redesign
 ├── feature/analytics-tracking
 ├── bugfix/modal-z-index
 └── hotfix/critical-bug
```

**Rules:**
- Create feature branch from `main`
- All changes via Pull Request (no direct commits to main)
- PR requires successful checks (tests, linting, builds)
- Link issues in PR description: `Resolves: bd-XX`
- Merge with "Squash and merge" for clean history

---

## Release Workflows

Three-stage release process (RC → Test → Production) with semantic versioning.

### Quick Release

```bash
# Check current status
./scripts/release.sh check

# Stage 1: Create release candidate (for testing)
./scripts/release.sh pre
# Output: v0.17.1-rc.1

# Push RC and deploy to staging
FORCE_PUSH=yes git push upstream v0.17.1-rc.1
bun run deploy:staging

# Stage 2: Run full test suite
bun run test:e2e
bun run test:accessibility

# If tests pass, create production release
./scripts/release.sh post
# Output: v0.17.1

# Push production tag
FORCE_PUSH=yes git push upstream v0.17.1

# Create GitHub Release and deploy
bun run deploy:production
# Then manually create GitHub Release with release notes
```

### Three-Stage Process

**Stage 1: Pre-Release (RC)**
- Create annotated git tag: `v0.17.1-rc.1`
- Supports multiple RCs: rc.1, rc.2, rc.3
- Deploy to staging environment
- Full test suite validation

**Stage 2: Testing**
- Run E2E tests on staging
- Run accessibility tests
- Run performance checks
- If failure: Fix bug, increment RC (rc.2), repeat

**Stage 3: Production Release**
- Create production tag: `v0.17.1`
- Deploy to production
- Create GitHub Release with notes
- Mark as latest release

### Semantic Versioning

- **MAJOR** (1.0.0): Breaking changes, major redesigns
- **MINOR** (0.17.0): New features, significant additions
- **PATCH** (0.17.1): Bug fixes, content updates

Version bumping is **manual and deliberate**:

```bash
# Before release, update version
bun pm version patch  # 0.17.0 → 0.17.1
# or
bun pm version minor  # 0.17.0 → 0.18.0
```

Build process syncs version to site footer automatically.

**Full workflow:** See [RELEASE_WORKFLOW.md](../../docs/operations/RELEASE_WORKFLOW.md) for detailed process, tag lifecycle, troubleshooting, and multiple RC scenarios.

---

## Deployment Workflows

Automatic deployment via GitHub Actions with path-based build routing.

### CI/CD Architecture

Different changes trigger different deployment paths:

| Change Type       | Examples                          | Build | Test | Deploy               |
|-------------------|-----------------------------------|-------|------|----------------------|
| **Content**       | `content/`, `static/`, `assets/`  | ✅    | ✅   | ✅ Production        |
| **Build Config**  | `hugo.toml`, `layouts/`, `config/`| ✅    | ✅   | ✅ Production        |
| **Test-Only**     | `test/`, `.github/`, `scripts/`   | ✅    | ✅   | ❌ Verification only |
| **Documentation** | `docs/`, `*.md`                   | ❌    | ❌   | ❌ Validation only   |

### Deployment Process

```bash
# 1. Ensure pre-commit checks passed
git status
# All changes staged, pre-commit successful

# 2. Test build locally
bun run build:production
# Check /public directory

# 3. Run test suite locally
bun run test:e2e
bun run test:accessibility

# 4. Review changes
git log --oneline -5
git diff HEAD~1 HEAD

# 5. Push to main (with guardrail confirmation)
git push origin main

# 6. Monitor CI/CD in GitHub Actions
# Wait for all checks to pass (typically 2-5 minutes)

# 7. Verify deployment
curl -I https://peterwarnock.com
# Check version in footer
```

### Critical: CSS Processing

CSS must be processed with Tailwind CLI **before** moving to `static/` directory:

```bash
# Process CSS (converts @import/@plugin directives to actual CSS)
bun x tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --minify

# Verify processing succeeded
grep -E "@import|@plugin" static/css/main.css
# Should return NOTHING

# Verify output contains actual CSS
grep -c "class=" static/css/main.css
# Should be non-zero
```

Hugo processes files in `assets/` with PostCSS, but serves `static/` files as-is. Unprocessed directives break the entire stylesheet.

### Post-Deployment Validation

After deployment completes:

```bash
# 1. Check site is live
curl -I https://peterwarnock.com
# Should return 200 OK

# 2. Check version in footer
curl https://peterwarnock.com | grep -o "v[0-9.]*"

# 3. Run end-to-end tests
bun run test:e2e

# 4. Check GitHub Actions workflow
# Visit https://github.com/pwarnock/pwarnock.github.io/actions
```

**Full workflow:** See [DEPLOYMENT.md](../../docs/operations/DEPLOYMENT.md) for detailed checklists, critical issues, troubleshooting, and rollback procedures.

---

## Issue Tracking Workflow (Beads)

Cody Framework (feature planning) and Beads (task management) work together. This is **Phase 1** with manual linking.

### Quick Start

```bash
# 1. Check Cody backlog
# Navigate to .cody/project/build/feature-backlog.md

# 2. Create Beads issue for implementation task
bd create "Implement component X" -t task -p 2 --json
# Returns: bd-47

# 3. Update feature backlog with issue link
# In .cody/project/build/feature-backlog.md
# - Implementation: See bd-47 for details

# 4. During development
bd update bd-47 --status in_progress

# 5. When complete
bd close bd-47 --reason "Completed and merged"
```

### Three-Layer Architecture

```
Planning Layer (Cody)
  Feature concepts → Backlogs → Requirements
         ↓ [Linked via conventions]
Execution Layer (Beads)
  Todo issues → In Progress → Completed
         ↓ [Status aggregated back to Cody]
Delivery Layer
  Release notes → GitHub releases → Live deployment
```

### Naming Conventions

**Beads Issues:**
- Format: `bd-XXX` (auto-generated) or `pw-XXX`
- Examples:
  - `bd create "Navigation component restructure" -p 1`
  - `bd create "Add keyboard shortcuts (v0.20.0)" -p 2`

**Version Labels:**
- Format: `version:X.Y.Z` (lowercase, semantic)
- Applied at issue creation
- Examples: `version:0.20.0`, `version:0.19.5`

**Feature Links:**
In issue descriptions, reference the Cody feature:
```markdown
## Related
- Feature: Enhanced Navigation System (v0.20.0)
- Cody backlog: .cody/project/build/feature-backlog.md
```

### Weekly Workflow

| Day | Task |
|-----|------|
| **Monday** | Review Cody backlog, check Beads blockers, create/prioritize issues |
| **Tue-Thu** | Claim work (`bd update bd-XX --status in_progress`), develop, create PRs |
| **Friday** | Complete reviews (`bd close bd-XX`), update backlog, plan next week |

### Dependency Tracking

```bash
# Create blocking task first
bd create "Design navigation component" -t task -p 1 --json  # bd-47

# Create dependent task
bd create "Implement navigation component" \
  -t task -p 2 --deps blocks:bd-47 --json  # bd-48

# See which tasks are ready (not blocked)
bd ready --json
```

### Release Notes Generation

When preparing a release:

```bash
# 1. Query completed issues for version
# Manual filtering from .beads/issues.jsonl for version tag

# 2. Group by type (features, bugs, improvements)

# 3. Generate release notes
# See docs/releases/v0.20.0.md

# 4. Commit release notes
git add docs/releases/v0.20.0.md
git commit -m "docs: v0.20.0 release notes"
```

**Full workflow:** See [CODY_BEADS_WORKFLOW.md](../../docs/integration/CODY_BEADS_WORKFLOW.md) for detailed synchronization, dependency patterns, GitHub integration, and scenarios like blocking discoveries and feature splitting.

---

## Summary Matrix

| Workflow | Trigger | Primary Tool | Output | Duration |
|----------|---------|--------------|--------|----------|
| **Development** | Feature request | Git + Beads | PR + Commits | Days |
| **Release** | Version bump | Release scripts | Production tag | Hours |
| **Deployment** | Main branch merge | GitHub Actions | Live site | Minutes |
| **Issue Tracking** | Feature planning | Beads + Cody | Release notes | Sprint |

---

## Key Commands Cheat Sheet

```bash
# Development
bun run dev                    # Start dev server
bun run test:e2e              # Run all E2E tests
bun run lint                  # Code quality
bun run validate              # Build validation
git push origin feature/name  # Push feature branch

# Release
./scripts/release.sh check    # Check status
./scripts/release.sh pre      # Create RC
./scripts/release.sh post     # Create production release

# Deployment
git push origin main          # Deploy to production
bun run deploy:staging        # Deploy to staging

# Issue Tracking
bd create "Title" -t feature  # Create issue
bd ready --json              # See unblocked work
bd update bd-XX --status in_progress  # Claim work
bd close bd-XX               # Complete issue
```

---

## See Also

- **Development:** [TESTING_WORKFLOW.md](../../docs/development/TESTING_WORKFLOW.md), [DEVELOPMENT_QUICK_REFERENCE.md](../../docs/DEVELOPMENT_QUICK_REFERENCE.md)
- **Release:** [RELEASE_WORKFLOW.md](../../docs/operations/RELEASE_WORKFLOW.md)
- **Deployment:** [DEPLOYMENT.md](../../docs/operations/DEPLOYMENT.md)
- **Issues:** [CODY_BEADS_WORKFLOW.md](../../docs/integration/CODY_BEADS_WORKFLOW.md)
- **Architecture:** [AGENTS.md](../../AGENTS.md) for automation guidelines
