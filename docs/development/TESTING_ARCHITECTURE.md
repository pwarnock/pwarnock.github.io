# Testing Architecture

Complete guide to the project's multi-layer testing strategy, covering unit tests, integration tests, end-to-end testing, visual regression, BDD scenarios, and performance monitoring.

## Overview

The project implements a **comprehensive, enterprise-grade testing infrastructure** with multiple layers optimized for different concerns:

- **Unit Tests** (Go, TypeScript) - Code correctness and logic
- **Integration Tests** (Bash scripts) - Workflow and system behavior
- **End-to-End Tests** (Playwright) - User journeys and critical paths
- **Visual Regression** (Playwright) - Design consistency
- **BDD Tests** (Godog) - Behavior specifications
- **Performance Tests** (Lighthouse) - Metrics and optimization

---

## Test Types & Responsibilities

| Type | Tool | Purpose | Location | Run Command |
|------|------|---------|----------|------------|
| **Unit** | Vitest + Go | Code correctness, logic verification | `src/**/*.test.ts`, `test/support/` | `bun run test:unit` |
| **Integration** | Bash scripts | Workflow validation, system behavior | `test/deployment_*.test.sh` | `bun run test:deployment` |
| **E2E** | Playwright | User journeys, critical UI paths | `tests/` | `bunx playwright test` |
| **Visual** | Playwright | Design regression detection | `tests/` (with @visual tag) | `bunx playwright test --grep @visual` |
| **BDD** | Godog (Cucumber) | Behavior specifications | `test/features/`, `test/step_definitions/` | `bun run test:bdd` |
| **Performance** | Lighthouse | Core Web Vitals, metrics | `tests/` (perf folder) | `bun run test:perf:watch` |

---

## Layer 1: Unit Tests

### Purpose
Verify individual functions, components, and utilities work correctly in isolation.

### Technologies
- **TypeScript**: Vitest with happy-dom
- **Go**: Standard Go testing with structured logging

### Coverage Requirements
- **Core logic**: ≥80% statement coverage
- **Critical paths**: 100% coverage for security-sensitive code
- **Utilities**: 75%+ coverage for shared functions

### Running Unit Tests

```bash
# All unit tests
bun run test:unit

# TypeScript only
bun run test:unit:ts

# TypeScript with watch mode
bun run test:unit:ts:watch

# Go tests only
bun run test:unit:go

# With UI dashboard
bun run test:unit:ui

# With coverage report
bun run test:coverage:ts
```

### File Structure
```
src/
├── components/
│   ├── Button.ts
│   └── Button.test.ts        ← Vitest
├── utils/
│   ├── validators.ts
│   └── validators.test.ts    ← Vitest
└── ...

test/support/
├── validators_test.go         ← Go testing
├── integration_test.go
└── ...
```

### Writing Unit Tests

**TypeScript Example** (`src/utils/validators.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validators';

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

**Go Example** (`test/support/validators_test.go`):
```go
func TestValidateEmail(t *testing.T) {
  tests := []struct {
    input    string
    expected bool
  }{
    {"test@example.com", true},
    {"invalid", false},
  }
  
  for _, tt := range tests {
    result := support.ValidateEmail(tt.input)
    if result != tt.expected {
      t.Errorf("ValidateEmail(%q) = %v, want %v", tt.input, result, tt.expected)
    }
  }
}
```

---

## Layer 2: Integration Tests

### Purpose
Verify that multiple components work together correctly and workflows execute as expected.

### Technologies
- **Bash Scripts**: Functional testing of deployment workflows
- **Pre-commit hooks**: Validation gates before commits

### Test Suites

#### 2.1: Deployment Validation Tests (27 tests)
File: `test/deployment_validation.test.sh`

**Coverage**:
- Script existence and permissions
- Hugo configuration validation
- CSS processing validation
- Build output structure
- Deploy script integration
- Environment configurations
- Documentation completeness

**Run**:
```bash
bun run test:deployment
```

**Example Test**:
```bash
test_hugo_config_validation() {
  log_test "Hugo config validation checks baseURL"
  
  if [ -f "config/production/hugo.toml" ]; then
    if grep -q "baseURL = \"https://peterwarnock.com" config/production/hugo.toml; then
      log_pass "Production Hugo config has correct baseURL"
    else
      log_fail "Production Hugo config baseURL incorrect"
    fi
  fi
}
```

#### 2.2: Deployment Workflow Integration Tests (14 tests)
File: `test/deployment_workflow.integration.sh`

**Coverage**:
- Environment branch setup (staging, production)
- Git remote configuration
- Deployment script validation
- Environment-specific configurations
- Hugo builds for each environment
- CI/CD integration points
- Error handling and rollback capability
- Security considerations

**Run**:
```bash
bun run test:deployment:integration
```

### Pre-commit Validation Gates

The `.husky/pre-commit` hook runs:
1. **YAML linting** - GitHub Actions workflows
2. **TOML validation** - Hugo config files
3. **CSS linting** - Style consistency
4. **Blog post validation** - Frontmatter checks
5. **Security scanning** - Secret detection
6. **Link validation** - HTML correctness

These run automatically before commit; changes are rejected if validation fails.

---

## Layer 3: End-to-End Tests

### Purpose
Verify complete user journeys work correctly in a real browser environment.

### Technologies
- **Playwright**: Cross-browser (Chromium, Firefox, Safari)
- **TypeScript**: Type-safe test definitions

### Test Locations
```
tests/
├── e2e/                       ← Critical user journeys
│   ├── navigation.spec.ts
│   ├── blog-reading.spec.ts
│   └── portfolio-browsing.spec.ts
├── visual/                    ← Design regression (marked @visual)
│   ├── homepage.visual.spec.ts
│   └── components.visual.spec.ts
├── performance/               ← Lighthouse checks (marked @perf)
│   └── core-web-vitals.spec.ts
└── accessibility/             ← WCAG compliance (marked @a11y)
    └── keyboard-nav.spec.ts
```

### Running E2E Tests

```bash
# All E2E tests
bunx playwright test

# With UI mode (interactive)
bunx playwright test --ui

# Visual regression only
bun run test:visual

# Watch mode (auto-rerun)
bun run test:e2e:watch

# Generate HTML report
bunx playwright show-report
```

### Writing E2E Tests

**Example** (`tests/e2e/navigation.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('navigate to blog and read post', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/');
  
  // Click blog link
  await page.click('nav a:has-text("Blog")');
  
  // Verify blog page loaded
  await expect(page).toHaveTitle(/Blog/);
  
  // Click first blog post
  await page.click('a[href^="/blog/"]');
  
  // Verify post content visible
  await expect(page.locator('article')).toBeVisible();
});
```

### Browser Coverage

Tests run on:
- **Chromium** (primary, ~85% of users)
- **Firefox** (secondary, ~10% of users)
- **Safari/WebKit** (mobile, ~5% of users)

Configure in `playwright.config.ts`:
```typescript
{
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
}
```

---

## Layer 4: Visual Regression Tests

### Purpose
Detect unintended design changes by comparing screenshots before and after code changes.

### Technologies
- **Playwright**: Screenshot capture and comparison
- **Visual baselines**: Stored in `tests/visual/baselines/`

### Running Visual Tests

```bash
# Run visual tests only
bun run test:visual

# Update baselines (after intentional design changes)
bunx playwright test --grep @visual --update-snapshots

# Watch mode
bun run test:visual:watch
```

### Creating Visual Tests

Mark tests with `@visual` tag:
```typescript
test('homepage layout @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-full.png');
});

test('dark theme @visual', async ({ page, context }) => {
  await context.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-dark.png');
});
```

### Baseline Management

1. **Initial capture**: `bunx playwright test --grep @visual --update-snapshots`
2. **Commit baselines**: Store in version control
3. **Review diffs**: Always review visual diffs in CI
4. **Update intentionally**: Only update after design review approval

---

## Layer 5: BDD Tests (Behavior-Driven Development)

### Purpose
Document and verify business requirements and user behaviors in human-readable format.

### Technologies
- **Godog**: Cucumber for Go
- **Gherkin syntax**: Human-readable test specifications

### File Structure
```
test/
├── features/                  ← User stories
│   ├── navigation.feature
│   ├── blog-reading.feature
│   └── portfolio.feature
└── step_definitions/          ← Implementation
    ├── navigation_steps.go
    ├── blog_steps.go
    └── portfolio_steps.go
```

### Running BDD Tests

```bash
# Run all BDD scenarios
bun run test:bdd

# Run specific feature
cd test && godog run features/navigation.feature

# With CI mode (non-interactive)
bun run test:bdd:ci
```

### Example BDD Feature File

`test/features/navigation.feature`:
```gherkin
Feature: Site Navigation
  As a user
  I want to navigate the site easily
  So I can find content quickly

  Scenario: Navigate to blog
    Given I am on the homepage
    When I click the blog link
    Then I should see the blog page
    And the page title should contain "Blog"

  Scenario: Navigate to portfolio
    Given I am on the homepage
    When I click the portfolio link
    Then I should see the portfolio page
    And the page lists my projects
```

### Example Step Definition

`test/step_definitions/navigation_steps.go`:
```go
package stepdefinitions

import (
  "github.com/cucumber/godog"
)

func iAmOnTheHomepage(ctx context.Context) error {
  // Navigate to homepage
  return nil
}

func iClickTheBlogLink(ctx context.Context) error {
  // Click blog link
  return nil
}

func iShouldSeeTheBlogPage(ctx context.Context) error {
  // Verify blog page loaded
  return nil
}

func InitializeScenario(s *godog.ScenarioContext) {
  s.Step(`^I am on the homepage$`, iAmOnTheHomepage)
  s.Step(`^I click the blog link$`, iClickTheBlogLink)
  s.Step(`^I should see the blog page$`, iShouldSeeTheBlogPage)
}
```

---

## Layer 6: Performance Tests

### Purpose
Monitor Core Web Vitals and performance metrics to ensure optimal user experience.

### Technologies
- **Lighthouse**: Page performance auditing
- **Playwright**: Performance metric collection

### Metrics Tracked

| Metric | Target | Tool |
|--------|--------|------|
| **Largest Contentful Paint (LCP)** | <2.5s | Lighthouse |
| **First Input Delay (FID)** | <100ms | Lighthouse |
| **Cumulative Layout Shift (CLS)** | <0.1 | Lighthouse |
| **Page Load Time** | <3s | Lighthouse |
| **Bundle Size** | <150KB (gzip) | Build stats |

### Running Performance Tests

```bash
# Analyze current build
bun run perf:analyze

# Monitor during development
bun run perf:monitor

# Watch mode for continuous monitoring
bun run test:perf:watch
```

### Performance Baseline

Configured in `lighthouserc.js`:
```javascript
{
  ci: {
    collect: {
      url: ['http://localhost:3000'],
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
}
```

---

## Coverage Requirements Summary

### Mandatory Coverage (Must Pass)
- **Unit tests**: Core logic ≥80%
- **Integration tests**: All 41 tests passing
- **Pre-commit hooks**: Linting, validation, security checks
- **Deployment validation**: 27 tests for staging/production

### Expected Coverage (Should Maintain)
- **E2E**: All critical user journeys
- **Visual regression**: Homepage, key pages, responsive breakpoints
- **BDD**: High-value user stories
- **Performance**: Production build monitored

### Optional Coverage (Nice to Have)
- **Additional E2E**: Edge cases, error scenarios
- **Additional visual tests**: Secondary pages, less common interactions
- **Load testing**: k6 scenarios for performance under load

---

## CI/CD Integration

### GitHub Actions Workflow

The test infrastructure integrates with GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Run pre-commit checks
  run: bun run lint

- name: Run unit tests
  run: bun run test:unit

- name: Run deployment tests
  run: bun run test:deployment

- name: Run deployment workflow tests
  run: bun run test:deployment:integration

- name: Build for E2E
  run: bun run build:preview

- name: Run E2E tests
  run: bunx playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Requirements for Deployment

| Environment | Required Tests |
|-------------|---|
| **Commit** | Pre-commit hooks (linting, security) |
| **Push to main** | Unit + integration + deployment tests |
| **Merge to staging** | All tests + E2E tests |
| **Merge to production** | All tests + manual verification |

---

## Adding New Tests

### For a New Feature

1. **Start with BDD** (if user-facing):
   ```bash
   # Create feature file
   echo 'Feature: ...' > test/features/my-feature.feature
   # Write scenarios
   # Implement step definitions
   ```

2. **Add Unit Tests**:
   ```typescript
   // src/my-feature.test.ts
   describe('myFeature', () => {
     it('should ...', () => { ... });
   });
   ```

3. **Add E2E Tests** (if critical):
   ```typescript
   // tests/e2e/my-feature.spec.ts
   test('user can ...', async ({ page }) => { ... });
   ```

4. **Visual Tests** (if design-sensitive):
   ```typescript
   test('component looks correct @visual', async ({ page }) => { ... });
   ```

### For Bug Fixes

1. Add regression test first (red test that fails with the bug)
2. Fix the bug (test goes green)
3. Keep the test to prevent regression

### For Performance Improvements

1. Establish baseline in `lighthouserc.js`
2. Implement improvement
3. Verify metrics with `bun run perf:analyze`
4. Update baseline if improvement is permanent

---

## Test Maintenance

### Regular Tasks

**Weekly**:
- Review E2E test failures in CI
- Update visual regression baselines if design changes were intentional
- Check performance metrics

**Monthly**:
- Review unit test coverage trends
- Update BDD scenarios if requirements changed
- Performance audit of critical pages

**Quarterly**:
- Full accessibility audit
- Load testing with new content volume
- Browser version compatibility check

### Troubleshooting Tests

#### Unit Test Failures
```bash
# Run in debug mode
bun run test:unit -- --reporter=verbose --inspect-brk

# Re-run specific test file
bun run test:unit src/utils/validators.test.ts
```

#### E2E Test Failures
```bash
# Run with headed browser (see what's happening)
bunx playwright test --headed

# Run single test
bunx playwright test tests/e2e/navigation.spec.ts

# Debug mode (step through test)
bunx playwright test --debug
```

#### Integration Test Failures
```bash
# Run individual test script
bash test/deployment_validation.test.sh

# Run with debugging
bash -x test/deployment_validation.test.sh
```

#### Visual Regression Failures
```bash
# View the diff
bunx playwright show-report

# If intentional, update baselines
bunx playwright test --grep @visual --update-snapshots
```

---

## Performance Benchmarks

Typical test execution times on CI:
- **Unit tests**: 30-45 seconds
- **Integration tests**: 15-20 seconds
- **E2E tests**: 2-3 minutes
- **Visual tests**: 1-2 minutes
- **BDD tests**: 30-45 seconds
- **Total**: ~5-7 minutes

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Godog Documentation](https://github.com/cucumber/godog)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Project Test Structure](/docs/development/TESTING_ARCHITECTURE.md)
- [Deployment Testing Guide](/docs/operations/DEPLOYMENT_TESTING.md)

---

## See Also

- [DEPLOYMENT_TESTING.md](/docs/operations/DEPLOYMENT_TESTING.md) - Deployment-specific test procedures
- [INFRASTRUCTURE_PROMOTION_WORKFLOW.md](/docs/operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md) - Manual promotion workflow
- [ENVIRONMENT_SETTINGS.md](/docs/operations/ENVIRONMENT_SETTINGS.md) - Environment-specific configurations
