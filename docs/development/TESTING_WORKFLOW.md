# Testing Workflow for Feature Development

**Purpose**: Establish a consistent process for adding tests when developing new
features.

## Test Types

### 1. E2E Tests (Playwright) - Primary Test Type

**Location**: `tests/*.spec.ts`  
**Framework**: Playwright (cross-browser: Chromium, Firefox, Safari)  
**Run**: `bun run test:e2e`

**When to write E2E tests:**

- New features that interact with the UI
- User journeys across multiple pages
- Analytics and tracking features
- Navigation and accessibility changes
- Form submissions and interactions

**Pattern:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name (pw-XXX)', () => {
  test('specific user action leads to expected result @e2e', async ({
    page,
  }) => {
    await page.goto('/');

    // Act
    await page.click('button[aria-label="Do something"]');

    // Assert
    await expect(page.locator('.result')).toContainText('Expected');
  });
});
```

**Best Practices:**

- Use semantic selectors (`aria-label`, `role`) instead of classes
- Add `@e2e` tag to mark E2E tests
- Include feature ID (e.g., `@analytics` for pw-26 tests)
- Use `waitForLoadState('networkidle')` after navigation
- Test across all browsers (tests run on Chromium, Firefox, WebKit
  automatically)

### 2. Unit Tests (Vitest) - For Logic & Utilities

**Location**: `src/**/*.test.ts`  
**Framework**: Vitest (TypeScript unit testing)  
**Run**: `bun run test:unit:ts`

**When to write unit tests:**

- Utility functions (`string.test.ts`, `date.test.ts`, etc.)
- Complex business logic
- Functions that don't need DOM/browser APIs

**Pattern:**

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './utils';

describe('myFunction', () => {
  it('should handle edge cases', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### 3. Accessibility Tests (Axe) - Included in E2E

**Integration**: Axe accessibility checks can be added to E2E tests  
**Run**: `bun run test:e2e`

**Example:**

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('page is accessible @a11y', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Testing Process for New Features

### Step 1: Create Issue

```bash
bd create "Feature Name" -t feature -p 2 --json
# Example: bd create "Add feature X" -t feature
```

### Step 2: Write Tests FIRST (TDD approach)

Create `tests/feature-name.spec.ts` with failing tests

```typescript
test('feature works as expected @feature-tag', async ({ page }) => {
  // This will initially fail
});
```

### Step 3: Implement Feature

Make the feature code to pass the tests

### Step 4: Run Tests Locally

```bash
# Run specific feature tests
bun run test:e2e -- tests/feature-name.spec.ts

# Run all tests
bun run test:e2e

# Watch mode
bun run test:e2e:watch
```

### Step 5: Verify Cross-Browser

Tests automatically run on Chromium, Firefox, and WebKit  
If a test fails in one browser, fix the implementation or update test

### Step 6: Build and Validate

```bash
# Path-based build (auto-detects changes)
bun run build:path

# Full validation
bun run validate
```

### Step 7: Commit with Test Results

```bash
git add tests/feature-name.spec.ts src/feature-name.ts
git commit -m "feat: Feature Name (pw-XXX)

- Implement feature X
- Add 3 E2E tests covering main use cases
- All 27 tests passing (Chromium, Firefox, WebKit)"
```

### Step 8: Close Issue

```bash
bd update pw-XXX --status closed --notes "Implemented with tests: $(bun run test:e2e -- tests/feature-name.spec.ts 2>&1 | grep passed)"
```

## Testing Patterns by Feature Type

### Analytics/Tracking Features (like pw-26)

```typescript
test.beforeEach(async ({ page }) => {
  // Set up dataLayer spy
  await page.addInitScript(() => {
    (window as any).dataLayerEvents = [];
    (window as any).dataLayer = (window as any).dataLayer || [];
    const originalPush = (window as any).dataLayer.push;
    (window as any).dataLayer.push = function (...args: any[]) {
      (window as any).dataLayerEvents.push(...args);
      return originalPush.apply(this, args);
    };
  });
});

test('event is tracked @analytics', async ({ page }) => {
  await page.goto('/');

  // Trigger event manually in test environment
  await page.evaluate(() => {
    if (typeof (window as any).Analytics !== 'undefined') {
      (window as any).Analytics.trackEvent('test_event', { data: 'value' });
    }
  });

  // Verify event in dataLayer
  const events = await page.evaluate(() => {
    return (window as any).dataLayerEvents.filter(
      (e: any) => e.event === 'test_event'
    );
  });
  expect(events.length).toBeGreaterThan(0);
});
```

### Component/UI Features

```typescript
test('component renders and responds to interaction @ui', async ({ page }) => {
  await page.goto('/page-with-component');

  // Verify component visible
  const component = page.locator('[data-component="my-component"]');
  await expect(component).toBeVisible();

  // Interact
  await component.locator('button').click();

  // Verify state change
  await expect(component.locator('.result')).toContainText('Updated');
});
```

### Responsive/Mobile Features

```typescript
test('feature works on mobile @responsive', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone size
  });
  const page = await context.newPage();

  await page.goto('/');
  // Test mobile-specific behavior

  await context.close();
});
```

## CI/CD Integration

### Pre-Push Hook (`.husky/pre-push`)

```bash
# Automatically runs path-based tests
bun run build:path  # Detects change type and runs appropriate tests
```

### GitHub Actions (`.github/workflows/`)

- Runs full test suite on PR
- Runs on multiple OS (Ubuntu, Windows, macOS)
- Blocks merge if tests fail

## Debugging Tests

### Run Single Test

```bash
bun run test:e2e -- tests/file.spec.ts -g "exact test name"
```

### Debug Mode (opens browser)

```bash
bun x playwright test tests/file.spec.ts --debug
# Step through with UI
```

### View Test Report

```bash
# Generated after test run
bun x playwright show-report
```

## Test Coverage Goals

- **E2E Tests**: 1-3 tests per feature (happy path + edge cases)
- **Unit Tests**: Only for complex utility functions
- **Overall**: No strict percentage, but avoid untested critical paths

## Common Issues

| Issue                        | Solution                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| Test times out on navigation | Add `page.waitForLoadState('networkidle')`                        |
| Script not available in test | Use `page.addInitScript()` to inject for testing                  |
| Browser-specific failures    | Run tests individually: `--project=chromium`, `--project=firefox` |
| Selector not found           | Use `page.locator()` with semantic selectors (role, aria-label)   |
| Flaky external link clicks   | Mock or manually trigger tracking instead of clicking real links  |

## Resources

- **Playwright Docs**: https://playwright.dev
- **Vitest Docs**: https://vitest.dev
- **Accessibility Testing**: https://www.w3.org/WAI/test-evaluate/
- **Example Tests**: `/tests/e2e-journeys.spec.ts`,
  `/tests/analytics-tracking.spec.ts`
