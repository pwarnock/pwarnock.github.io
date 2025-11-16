# Testing Documentation

## Overview

This project uses a comprehensive multi-layer testing strategy with
TypeScript-based E2E tests and Go-based BDD tests for behavior-driven
development.

## TypeScript Preference

**All new test specifications should be written in TypeScript (.ts)** rather
than JavaScript (.js) for better type safety and developer experience.

### Why TypeScript for Tests?

- **Type Safety**: Catch errors at compile time, not runtime
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Interface Definitions**: Clear contracts for test data and responses
- **Maintainability**: Easier to understand and modify test code
- **Documentation**: Types serve as inline documentation

### Migration Status

✅ **Completed**:

- `visual-regression.spec.ts` - Visual regression tests with Axe integration
- `performance.spec.ts` - Performance benchmarking with typed interfaces
- `e2e-journeys.spec.ts` - End-to-end user journey tests

⚠️ **Needs Attention**:

- Install `@axe-playwright` types for accessibility testing
- Remove old `.js` files to avoid confusion

### Configuration Updates

Updated `playwright.config.js`:

```javascript
testMatch: '**/*.spec.ts',  // Only run TypeScript specs
```

### TypeScript Interfaces Available

- `PerformanceMetrics` - Core web vitals and timing data
- `WebVitals` - LCP, FID, CLS, FCP measurements
- `BundleInfo` - JavaScript/CSS bundle analysis
- `ImageInfo` - Image optimization metrics

### Writing New Tests

1. **Always use `.ts` extension**
2. **Define interfaces for complex data structures**
3. **Leverage Playwright's built-in types**
4. **Use proper typing for page objects and fixtures**

Example:

```typescript
interface TestUser {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

test('user authentication', async ({ page }) => {
  const user: TestUser = {
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  };
  // ... test implementation
});
```

## Test Categories

### 1. Visual Regression Tests (`visual-regression.spec.ts`)

- Full page screenshots
- Component-level screenshots
- Responsive design testing
- Theme switching validation
- Accessibility visual checks

### 2. Performance Tests (`performance.spec.ts`)

- Core Web Vitals measurement
- Resource loading analysis
- Bundle size tracking
- Image optimization verification
- Caching header validation

### 3. E2E Journey Tests (`e2e-journeys.spec.ts`)

- Complete user workflows
- Cross-page navigation
- Mobile responsive testing
- Form interaction testing
- Error handling validation

### 4. BDD Integration Tests (Go)

- Behavior-driven development scenarios
- Accessibility compliance testing
- Performance threshold validation
- Cross-browser compatibility

## Running Tests

```bash
# Run all TypeScript tests
bun run test:e2e

# Run specific test categories
bunx playwright test --grep "@visual"
bunx playwright test --grep "@performance"
bunx playwright test --grep "@e2e"

# Run with specific browsers
bunx playwright test --project=chromium
bunx playwright test --project=webkit
```

## Test Tags

- `@visual` - Visual regression tests
- `@performance` - Performance benchmarking
- `@e2e` - End-to-end journeys
- `@a11y` - Accessibility testing
- `@mobile` - Mobile-specific tests
- `@theme` - Theme switching tests
- `@component` - Component-level tests

## Coverage Integration

Test coverage is automatically tracked via:

- Go unit tests with `go test -cover`
- Playwright test execution tracking
- CI/CD pipeline coverage gates
- Codecov integration for visualization

## Best Practices

1. **Use TypeScript interfaces** for all complex data structures
2. **Leverage test tags** for categorization and selective running
3. **Include performance assertions** in E2E tests
4. **Test responsive design** across multiple viewports
5. **Validate accessibility** in visual tests
6. **Use proper waits** - avoid arbitrary timeouts
7. **Take screenshots** on failure for debugging
8. **Test error states** and edge cases
