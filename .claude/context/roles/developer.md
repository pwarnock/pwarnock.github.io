# Developer Context

Default role context for standard development tasks. Use this context when working on features, bug fixes, refactoring, or any code-related work not covered by specialized roles.

## Purpose

You are a developer working on the pwarnock.github.io project. Your focus is on writing clean, tested, maintainable code that follows the project's established patterns and standards. Every commit should leave the codebase better than you found it.

## Core Principles

### 1. Code Quality First

**Zero-tolerance standards:**
- All TypeScript must compile without errors or warnings
- All tests must pass before committing
- No `--no-verify` bypasses unless explicitly requested
- Clean git history reflects professional development

**Why this matters:**
- Warnings indicate type safety gaps
- Runtime errors often hide behind ignored warnings
- Clean compilation = predictable behavior
- Pre-commit hooks prevent bad code from entering history

### 2. Test-Driven Development

Follow the testing pyramid for all work:

```
        /\
       /E2E\        ← Few, high-value user journeys
      /------\
     /Visual \      ← Key pages, responsive breakpoints
    /----------\
   /Integration\    ← Workflow validation, system behavior
  /--------------\
 /   Unit Tests   \ ← Core logic, ≥80% coverage
/------------------\
```

**Test requirements by change type:**

| Change Type | Required Tests |
|-------------|----------------|
| New feature | Unit + integration + E2E (if user-facing) |
| Bug fix | Regression test first (red → green) |
| Refactoring | All existing tests pass |
| Performance | Baseline + verification with metrics |
| UI change | Visual regression + accessibility |

**Test execution:**
```bash
# Before committing
bun run test:unit              # Fast feedback loop
bun run test:deployment        # Workflow validation

# Before pushing
bun run qa:auto                # Intelligent test selection
# OR
bun run qa:full                # Complete test suite
```

### 3. TypeScript Standards

**Type safety requirements:**
```typescript
// ✅ GOOD: Complete type declarations
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // Implementation with proper error handling
}

// ❌ BAD: Implicit any, incomplete types
function getUser(id) {
  // Type safety bypassed
}

// ❌ FORBIDDEN: Suppressing legitimate errors
// @ts-ignore
const result = dangerousOperation();
```

**Compilation requirements:**
```bash
# Must pass cleanly
bun tsc --noEmit

# No warnings allowed
# No @ts-ignore bypasses without justification
# All Node.js globals properly typed (@types/node)
```

### 4. Git Workflow

**Commit message standards:**
```bash
# Format: <type>(<scope>): <subject>
feat(blog): add reading time estimation
fix(analytics): correct event tracking for dark mode
refactor(components): extract hero variants to separate files
test(e2e): add navigation journey scenarios
docs(agents): strengthen --no-verify protocol
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring (no behavior change)
- `test` - Adding or updating tests
- `docs` - Documentation only
- `chore` - Build, tooling, dependencies
- `perf` - Performance improvements
- `style` - Code formatting (not CSS)

**Pre-commit validation gates:**
```bash
# Automatically run by .husky/pre-commit:
1. YAML linting - GitHub Actions workflows
2. TOML validation - Hugo config files
3. CSS linting - Style consistency
4. Blog post validation - Frontmatter checks
5. Security scanning - Secret detection
6. TypeScript compilation - Zero warnings
7. Unit tests - Fast feedback
```

**CRITICAL: Never bypass hooks without explicit permission:**
```bash
# ❌ FORBIDDEN (unless explicitly requested):
git commit --no-verify

# ✅ CORRECT: Fix the issue, then commit normally:
bun run lint                   # Fix linting issues
bun run test:unit             # Ensure tests pass
git commit -m "feat: ..."     # Commit passes all hooks
```

### 5. Development Workflow

**Standard flow for any task:**

1. **Understand the requirement**
   ```bash
   # Check for existing issues
   bd list --type=feature --status=pending

   # Review related documentation
   ls docs/development/
   ```

2. **Create isolated workspace (for complex work)**
   ```bash
   # Use worktrees for feature branches
   git worktree add ../feature-name feature/name
   cd ../feature-name
   ```

3. **Write tests first (TDD)**
   ```typescript
   // Start with failing test
   describe('newFeature', () => {
     it('should do something', () => {
       expect(newFeature()).toBe(expected); // Fails
     });
   });

   // Implement feature
   // Test passes
   ```

4. **Implement with incremental validation**
   ```bash
   # Fast feedback loop
   bun run test:unit:ts:watch    # Continuous testing
   bun run dev                   # Live preview
   ```

5. **Validate before committing**
   ```bash
   # Run appropriate QA level
   bun run qa:auto               # Intelligent selection

   # Commit (hooks run automatically)
   git add <files>
   git commit -m "feat: ..."
   ```

6. **Track multi-session work**
   ```bash
   # For work spanning sessions
   bd create --type=feature --title="..." --priority=2
   bd update <id> --status=in_progress
   # ... work ...
   bd close <id>
   bd sync                       # Persist to git
   ```

## Development Patterns

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── Button.ts
│   └── Button.test.ts   # Co-located tests
├── utils/               # Shared utilities
│   ├── validators.ts
│   └── validators.test.ts
├── agents/              # Content generation agents
│   ├── core/            # Shared agent foundation
│   ├── blog/
│   ├── portfolio/
│   └── tech-radar/
└── types/               # TypeScript type definitions

content/                 # Hugo content (Markdown + frontmatter)
├── blog/posts/
├── portfolio/
└── tools/               # Tech radar entries

layouts/                 # Hugo templates (Go templates)
├── _default/
├── partials/
│   └── components/      # Component partials
└── shortcodes/

test/                    # Integration and BDD tests
├── features/            # Gherkin scenarios
├── step_definitions/    # Godog step implementations
└── support/             # Test utilities

tests/                   # Playwright E2E tests
├── e2e/                 # User journeys
├── visual/              # Visual regression (marked @visual)
├── performance/         # Lighthouse checks (marked @perf)
└── accessibility/       # WCAG compliance (marked @a11y)

scripts/                 # Build and utility scripts
├── build/               # Build-time scripts
├── validation/          # Content validation
└── deployment/          # Deployment workflows

docs/                    # Project documentation
├── development/         # Development guides
├── operations/          # Deployment, infrastructure
└── agents/              # Agent-specific docs

.claude/                 # Claude Code configuration
├── context/
│   ├── roles/           # Role-specific context (this file)
│   └── project/         # Project-wide knowledge
├── skills/              # Custom Claude Code skills
└── learning/            # Session learnings
```

### Component Development

**Creating new components:**

1. **Define TypeScript interface**
   ```typescript
   // src/components/Card.ts
   interface CardProps {
     title: string;
     description: string;
     imageUrl?: string;
     link?: string;
   }

   export class Card {
     constructor(private props: CardProps) {}

     render(): string {
       // Component logic
     }
   }
   ```

2. **Create Hugo partial**
   ```html
   {{/* layouts/partials/components/card.html */}}
   <div class="card">
     <h3>{{ .title }}</h3>
     <p>{{ .description }}</p>
     {{ with .imageUrl }}
       <img src="{{ . }}" alt="{{ $.title }}" loading="lazy">
     {{ end }}
   </div>
   ```

3. **Add unit tests**
   ```typescript
   // src/components/Card.test.ts
   import { describe, it, expect } from 'vitest';
   import { Card } from './Card';

   describe('Card', () => {
     it('renders with required props', () => {
       const card = new Card({
         title: 'Test',
         description: 'Description'
       });
       expect(card.render()).toContain('Test');
     });
   });
   ```

4. **Add visual test (if applicable)**
   ```typescript
   // tests/visual/card.visual.spec.ts
   import { test, expect } from '@playwright/test';

   test('card component @visual', async ({ page }) => {
     await page.goto('/components/card-demo');
     await expect(page.locator('.card')).toHaveScreenshot('card.png');
   });
   ```

### Content Agent Development

When working on content generation agents (blog, portfolio, tech radar):

**Agent structure:**
```
src/agents/<type>/
├── agent.ts             # Main agent logic
├── templates.ts         # Content templates
├── validation.ts        # Content validation rules
└── agent.test.ts        # Agent unit tests
```

**Key patterns:**
- All content starts as draft (`draft: true` in frontmatter)
- Agents never auto-publish (requires explicit approval)
- Voice learning from user feedback (stored in `.cody/project/library/style-docs/`)
- Hugo integration for content bundle generation
- Validation before completion (bash scripts or TypeScript validators)

**Adding a new agent capability:**

1. Add to agent interface
2. Implement with tests
3. Update agent documentation in `docs/agents/`
4. Add validation script if needed
5. Update CLI if exposing as command

## Common Tasks

### Adding a New Feature

```bash
# 1. Check if issue exists
bd list --type=feature --status=pending

# 2. Create issue for tracking (if multi-session work)
bd create --type=feature --title="Add feature X" --priority=2

# 3. Create worktree for isolation (optional but recommended)
git worktree add ../feature-x feature/x

# 4. Write tests first
# Create test file in appropriate location

# 5. Implement feature
# Follow TDD: red → green → refactor

# 6. Run QA
bun run qa:auto

# 7. Commit (hooks validate automatically)
git commit -m "feat(scope): add feature X"

# 8. Close issue
bd close <issue-id>
bd sync
```

### Fixing a Bug

```bash
# 1. Write regression test first (test should fail)
# tests/e2e/bug-reproduction.spec.ts

# 2. Fix the bug (test should pass)

# 3. Verify fix
bun run test:unit
bun run qa:auto

# 4. Commit with test + fix together
git add <test-file> <fix-file>
git commit -m "fix(scope): correct behavior X

Regression test ensures bug doesn't return."

# 5. Keep the test (prevents future regression)
```

### Refactoring Code

```bash
# 1. Ensure all tests pass before starting
bun run test:unit
bun run qa:full

# 2. Make incremental changes
# Keep tests passing at each step

# 3. Run tests frequently
bun run test:unit:watch

# 4. Verify no behavior changes
bun run qa:full

# 5. Commit with clear rationale
git commit -m "refactor(scope): extract X for reusability

No behavior changes. All tests pass."
```

### Adding Documentation

```bash
# Create documentation file
# Location depends on audience:
# - docs/development/ - Developer guides
# - docs/operations/ - Deployment, infrastructure
# - docs/agents/ - Agent-specific docs

# Follow existing patterns:
# - Clear hierarchy with ## headings
# - Code examples with syntax highlighting
# - Links to related docs
# - Tables for structured information

# Commit documentation
git commit -m "docs(scope): add guide for X"
```

## QA Modes: Intelligent Test Selection

The project uses a QA Modes system for efficient testing:

### qa:auto (Recommended Default)

```bash
bun run qa:auto
```

Analyzes changed files (vs `origin/main`) and automatically selects:
- **Content Fast-Path QA** - For content-only changes (Markdown, images)
  - Full site build via content pipeline
  - SEO checks on core pages
  - Accessibility smoke tests
- **Full QA** - For code, templates, configs, or ambiguous changes
  - Build + SEO + accessibility
  - E2E journeys + visual regression
  - Performance + Go BDD tests

### qa:content (Force Content Fast-Path)

```bash
bun run qa:content
```

Use when confident changes are only in:
- `content/**`
- `static/img/**`, `static/images/**`
- Static media files (`.jpg`, `.png`, `.webp`, `.svg`, `.pdf`)

### qa:full (Force Complete Suite)

```bash
bun run qa:full
```

Use for:
- Any layout, script, config, or data changes
- Major feature work or refactors
- Pre-release / high-risk changes

**When in doubt, use `qa:auto`** - it errs on the side of safety.

## Testing Architecture

Complete testing strategy across multiple layers:

### Unit Tests (Foundation Layer)

**Purpose:** Verify individual functions, components, utilities

**Technologies:**
- TypeScript: Vitest with happy-dom
- Go: Standard Go testing with structured logging

**Coverage requirements:**
- Core logic: ≥80% statement coverage
- Critical paths: 100% for security-sensitive code
- Utilities: 75%+ for shared functions

**Running unit tests:**
```bash
bun run test:unit              # All unit tests
bun run test:unit:ts           # TypeScript only
bun run test:unit:ts:watch     # TypeScript with watch mode
bun run test:unit:go           # Go tests only
bun run test:unit:ui           # With UI dashboard
bun run test:coverage:ts       # With coverage report
```

### Integration Tests (System Layer)

**Purpose:** Verify components work together, workflows execute correctly

**Technologies:**
- Bash scripts for deployment workflows
- Pre-commit hooks for validation gates

**Test suites:**
- `test/deployment_validation.test.sh` (27 tests)
- `test/deployment_workflow.integration.sh` (14 tests)

**Running integration tests:**
```bash
bun run test:deployment        # Deployment validation
bun run test:deployment:integration  # Workflow integration
```

### End-to-End Tests (User Layer)

**Purpose:** Verify complete user journeys in real browsers

**Technologies:**
- Playwright (Chromium, Firefox, Safari)
- TypeScript for type-safe test definitions

**Test organization:**
```
tests/
├── e2e/                 # Critical user journeys
├── visual/              # Design regression (@visual tag)
├── performance/         # Lighthouse checks (@perf tag)
└── accessibility/       # WCAG compliance (@a11y tag)
```

**Running E2E tests:**
```bash
bunx playwright test              # All E2E tests
bunx playwright test --ui         # Interactive UI mode
bun run test:visual               # Visual regression only
bun run test:e2e:watch            # Watch mode
bunx playwright show-report      # View HTML report
```

### Visual Regression Tests

**Purpose:** Detect unintended design changes

**Creating visual tests:**
```typescript
test('homepage layout @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-full.png');
});
```

**Managing baselines:**
```bash
# Update baselines (after intentional design changes)
bunx playwright test --grep @visual --update-snapshots

# View differences
bunx playwright show-report
```

### BDD Tests (Behavior Specifications)

**Purpose:** Document and verify business requirements

**Technologies:**
- Godog (Cucumber for Go)
- Gherkin syntax for human-readable specs

**File structure:**
```
test/
├── features/           # User stories (.feature files)
└── step_definitions/   # Implementation (.go files)
```

**Running BDD tests:**
```bash
bun run test:bdd       # All BDD scenarios
cd test && godog run features/navigation.feature  # Specific feature
```

### Performance Tests

**Purpose:** Monitor Core Web Vitals and optimization metrics

**Technologies:**
- Lighthouse for page performance auditing
- Playwright for metric collection

**Metrics tracked:**
| Metric | Target | Tool |
|--------|--------|------|
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse |
| First Input Delay (FID) | <100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse |
| Page Load Time | <3s | Lighthouse |
| Bundle Size | <150KB (gzip) | Build stats |

**Running performance tests:**
```bash
bun run perf:analyze              # Analyze current build
bun run perf:monitor              # Monitor during development
bun run test:perf:watch           # Watch mode
```

## Beads Issue Tracking

Use Beads for tracking strategic multi-session work:

```bash
# Create issue
bd create --type=feature --title="Add search functionality" --priority=2

# List issues
bd list --type=feature --status=pending
bd ready                          # Show ready-to-work tasks (no blockers)
bd blocked                        # Show blocked issues

# Update issue
bd update <id> --status=in_progress
bd update <id> --priority=1       # Increase priority

# Add dependencies
bd dep add <blocked-id> <blocker-id>

# Close when complete
bd close <id>

# Sync to git (always sync at session end)
bd sync
```

**Priority scale:**
- 0: Critical (blocking, security)
- 1: High (important features, major bugs)
- 2: Medium (planned features, moderate bugs)
- 3: Low (nice-to-have, minor improvements)
- 4: Backlog (future consideration)

## Key Commands Reference

### Development

```bash
# Local development
bun run dev                       # Hugo server with live reload
bun run dev:test                  # Dev server with test mode

# Building
bun run build                     # Production build
bun run build:preview             # Preview build for testing

# Linting & Formatting
bun run lint                      # Run all linters
bun run format                    # Format code with Prettier

# Type checking
bun tsc --noEmit                  # TypeScript compilation check
```

### Testing

```bash
# Unit tests
bun run test:unit                 # All unit tests
bun run test:unit:watch           # Watch mode
bun run test:coverage:ts          # With coverage

# Integration tests
bun run test:deployment           # Deployment validation

# E2E tests
bunx playwright test              # All E2E tests
bunx playwright test --ui         # Interactive mode
bun run test:visual               # Visual regression

# QA modes
bun run qa:auto                   # Intelligent selection
bun run qa:content                # Content fast-path
bun run qa:full                   # Complete suite
```

### Git

```bash
# Standard workflow
git status
git add <files>
git commit -m "type(scope): message"
git push origin <branch>

# Pre-commit hooks run automatically
# Never use --no-verify unless explicitly requested

# Worktrees (for feature isolation)
git worktree add ../feature-name feature/name
cd ../feature-name
# ... work ...
git worktree remove ../feature-name
```

### Beads

```bash
# Issue management
bd create --type=feature --title="..." --priority=2
bd list --status=pending
bd ready                          # Show unblocked tasks
bd update <id> --status=in_progress
bd close <id>
bd sync                           # Persist to git

# Dependencies
bd dep add <blocked> <blocker>

# Search
bd search "search term"
```

## Authoritative Documentation

For detailed information, consult these primary sources:

**Development:**
- `docs/development/TESTING_ARCHITECTURE.md` - Complete testing strategy
- `docs/development/CONTRIBUTING.md` - QA modes and contribution workflow
- `docs/development/BUILD_SYSTEM.md` - Build configuration
- `docs/development/COMPONENTS.md` - Component development patterns

**Standards:**
- `.claude/context/project/references.md` - Project standards and patterns
- `.pre-commit-config.yaml` - Pre-commit validation gates
- `tsconfig.json` - TypeScript configuration

**Agents:**
- `docs/agents/README.md` - Agent system overview
- `docs/agents/BLOG_AGENT.md` - Blog agent specifics
- `docs/agents/PORTFOLIO_AGENT.md` - Portfolio agent specifics
- `docs/agents/TECH_RADAR_AGENT.md` - Tech radar agent specifics

**Operations:**
- `docs/operations/DEPLOYMENT_TESTING.md` - Deployment procedures
- `docs/operations/ENVIRONMENT_SETTINGS.md` - Environment configuration

## Anti-Patterns to Avoid

### Code Quality

❌ **Suppressing TypeScript errors**
```typescript
// @ts-ignore
const result = dangerousOperation();
```
✅ **Fix the underlying issue**
```typescript
const result: ResultType = await safeOperation();
```

❌ **Skipping pre-commit hooks**
```bash
git commit --no-verify
```
✅ **Fix validation issues**
```bash
bun run lint
bun run test:unit
git commit -m "feat: ..."
```

❌ **Committing untested code**
```bash
git add new-feature.ts
git commit -m "feat: new feature"
# No tests written
```
✅ **Write tests first**
```bash
# Write test (fails)
git add new-feature.test.ts new-feature.ts
git commit -m "feat: new feature with tests"
```

### Testing

❌ **Skipping tests because "it's just a small change"**
```bash
# Small CSS change, skip tests
git commit -m "style: update colors"
```
✅ **Run appropriate QA level**
```bash
bun run qa:auto  # Automatically selects right tests
git commit -m "style: update colors"
```

❌ **Updating visual baselines without review**
```bash
bunx playwright test --grep @visual --update-snapshots
git commit -m "fix: update baselines"
```
✅ **Review changes, then update intentionally**
```bash
bunx playwright test --grep @visual
bunx playwright show-report  # Review differences
# If changes are intentional:
bunx playwright test --grep @visual --update-snapshots
git commit -m "refactor: update button design

Visual regression baselines updated after design review approval."
```

### Git Workflow

❌ **Vague commit messages**
```bash
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "updates"
```
✅ **Clear, descriptive messages**
```bash
git commit -m "fix(analytics): correct event tracking for dark mode toggle"
git commit -m "feat(blog): add reading time estimation"
git commit -m "refactor(components): extract hero variants to separate files"
```

❌ **Committing to main directly**
```bash
git checkout main
# ... make changes ...
git commit -m "feat: ..."
git push origin main
```
✅ **Use feature branches**
```bash
git checkout -b feature/name
# ... make changes ...
git commit -m "feat: ..."
git push origin feature/name
# Create PR for review
```

## Context Management

This context file is part of the modular Claude Code context system:

**Context structure:**
```
.claude/context/
├── roles/
│   ├── developer.md      # This file (default development role)
│   └── refinery.md       # Merge queue processor role
└── project/
    ├── references.md     # Standards and external references
    └── standards.md      # Project-specific coding standards
```

**Loading behavior:**
- This file is loaded automatically for general development work
- Specialized roles (like refinery.md) override this context
- Project-wide standards in `project/` are always available

**Progressive disclosure:**
- Core principles in this file (~2,000 words)
- Detailed patterns in linked documentation
- Authoritative references at bottom

## Session End Protocol

At the end of each session, consider:

1. **Sync Beads issues (if using)**
   ```bash
   bd sync
   ```

2. **Capture learnings (if significant discoveries made)**
   ```bash
   # Learnings saved in .claude/learning/session-YYYY-MM-DD.md
   ```

3. **Verify clean state**
   ```bash
   git status
   bun run qa:auto  # If uncommitted changes
   ```

4. **Push work to remote**
   ```bash
   git push origin <branch>
   ```

## Recovery Procedures

If you encounter issues:

**Pre-commit hook failures:**
```bash
# See what failed
git commit -m "..." # Read error output

# Fix linting
bun run lint

# Fix TypeScript errors
bun tsc --noEmit

# Fix failing tests
bun run test:unit

# Try commit again
git commit -m "..."
```

**Test failures:**
```bash
# Debug unit tests
bun run test:unit -- --reporter=verbose

# Debug E2E tests
bunx playwright test --headed --debug

# Debug integration tests
bash -x test/deployment_validation.test.sh
```

**Build failures:**
```bash
# Check Hugo version
hugo version  # Should be Extended v0.152.2+

# Clean and rebuild
rm -rf public/ resources/
bun run build

# Check for errors in templates
hugo --logLevel debug
```

---

**Remember:** Every commit is a contribution to the project's ledger. Write clean code, test thoroughly, and leave clear documentation for future maintainers (including your future self).
