# Vitest Setup for TypeScript Unit Tests

**Date**: November 17, 2025  
**Status**: ✅ Installed and configured  
**Version**: Vitest 4.0.10

---

## What Was Added

### Dependencies

```bash
✅ vitest@4.0.10
✅ @vitest/ui@4.0.10
✅ @vitest/coverage-v8@4.0.10
✅ happy-dom@20.0.10
✅ typescript@5.9.3
```

### Configuration

- `vitest.config.ts` - Vitest configuration
- `src/utils/string.test.ts` - Example test file

### NPM Scripts

```json
"test:unit": "vitest --run",           // Run tests once
"test:unit:watch": "vitest --watch",   // Watch mode (re-run on changes)
"test:unit:ui": "vitest --ui",         // UI dashboard
"test:coverage": "vitest --coverage",  // Coverage report
```

---

## Quick Start

### Run Tests

```bash
# Run all tests once
bun run test:unit

# Watch mode (rerun on file changes)
bun run test:unit:watch

# Coverage report
bun run test:coverage

# UI dashboard
bun run test:unit:ui
```

### Create Your First Test

```typescript
// src/components/Button.test.ts
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render with text', () => {
    // Test implementation
  });
});
```

**File location**: Tests go in `src/` directory with `.test.ts` or `.spec.ts`
extension

---

## Configuration Details

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    globals: true, // Use describe/it without imports
    environment: 'happy-dom', // DOM simulation (lightweight)
    coverage: {
      provider: 'v8', // Code coverage
      reporter: ['text', 'json', 'html'],
    },
    include: ['src/**/*.{test,spec}.ts'], // Only src/ tests
    exclude: [
      'node_modules',
      'tests/', // Exclude Playwright E2E tests
      'test/', // Exclude Go BDD tests
    ],
  },
});
```

### Why These Settings?

| Setting                     | Why                                                    |
| --------------------------- | ------------------------------------------------------ |
| `globals: true`             | No need to import `describe`, `it`, `expect` each file |
| `happy-dom`                 | Lightweight DOM simulation (faster than jsdom)         |
| `include: src/**/*.test.ts` | Keeps unit tests close to source code                  |
| `exclude: tests/`           | Don't run Playwright E2E tests as unit tests           |
| `v8 coverage`               | Built-in code coverage with accurate reporting         |

---

## Example Test Structure

### Basic Test

```typescript
import { describe, it, expect } from 'vitest';

describe('MyUtility', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toThrow();
  });
});
```

### With Setup/Teardown

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('DataStore', () => {
  let store;

  beforeEach(() => {
    store = new DataStore();
  });

  afterEach(() => {
    store.clear();
  });

  it('should initialize empty', () => {
    expect(store.size).toBe(0);
  });
});
```

### With Mocking

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('API Client', () => {
  it('should call endpoint', async () => {
    const mockFetch = vi.fn();
    const result = await apiClient.get('/endpoint', mockFetch);

    expect(mockFetch).toHaveBeenCalledWith('/endpoint');
    expect(result).toBeDefined();
  });
});
```

---

## Writing Tests for Phase 1

### Target Coverage: 50%+

Create tests for:

1. **test/support/ utilities** (Go test utilities ported to TS)
   - Logging functions
   - Test context setup
   - Assertion helpers

2. **Component logic** (TypeScript components)
   - Theme switching
   - Navigation state
   - Form handling
   - Event handlers

3. **Utility functions**
   - String formatting
   - Date manipulation
   - Data transformations
   - Validation functions

### Test Template

```typescript
// src/utils/myutil.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './myutil';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('output');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('default');
    expect(myFunction(null)).toThrow(Error);
  });

  it('should work with different types', () => {
    expect(myFunction('string')).toBe('STRING');
    expect(myFunction(123)).toThrow();
  });
});
```

---

## Integration with CI/CD

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
- name: Run unit tests
  run: bun run test:unit

- name: Generate coverage
  run: bun run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
bun run test:unit || exit 1
```

This ensures tests pass before commits.

---

## Commands Reference

| Command                                   | Purpose                               |
| ----------------------------------------- | ------------------------------------- |
| `bun run test:unit`                       | Run all tests once                    |
| `bun run test:unit:watch`                 | Watch mode (rerun on changes)         |
| `bun run test:unit:ui`                    | UI dashboard (http://localhost:51204) |
| `bun run test:coverage`                   | Coverage report with HTML output      |
| `bun run test:unit -- --reporter=verbose` | Verbose output                        |
| `bun run test:unit -- --grep "pattern"`   | Run tests matching pattern            |

---

## Troubleshooting

### "Module not found" errors

**Cause**: Import paths incorrect or module not installed

**Fix**:

```bash
# Check tsconfig.json paths
# Ensure module is in package.json
bun install
```

### "ReferenceError: describe is not defined"

**Cause**: `globals: true` not set in vitest.config.ts

**Fix**: Verify vitest.config.ts has:

```typescript
test: {
  globals: true,
}
```

### Coverage showing 0%

**Cause**: Tests in `tests/` directory (excluded from coverage)

**Fix**: Move tests to `src/` directory

### Tests hanging

**Cause**: Missing `--run` flag or infinite loop in test

**Fix**:

```bash
# Run once instead of watch
bun run test:unit

# Or add timeout
bun run test:unit -- --reporter=verbose --timeout=5000
```

---

## Next Steps (Phase 1)

1. **Spike/Evaluation** ✅ (Done - Vitest installed)
2. **Create test structure**
   - Set up `src/` directory if needed
   - Create test directory organization
3. **Write tests for test/support/ utilities**
   - Port Go test utilities to TypeScript
   - Cover StructuredLogger equivalents
4. **Write tests for components**
   - Start with 5 critical components
   - Target 50%+ coverage
5. **CI/CD integration**
   - Add to GitHub Actions
   - Add pre-commit hooks
   - Coverage gates

---

## References

- [Vitest Docs](https://vitest.dev/)
- [Vitest API](https://vitest.dev/api/)
- [happy-dom](https://github.com/capricorn86/happy-dom)
- [Code Coverage](https://vitest.dev/guide/coverage.html)

---

## Files Created

```
/Users/peter/github/pwarnock.github.io/
├── vitest.config.ts                    ← Vitest configuration
├── src/
│   └── utils/
│       └── string.test.ts              ← Example test
├── package.json                        ← Updated with test scripts
└── docs/development/
    └── VITEST_SETUP.md                 ← This file
```

---

**Status**: ✅ READY FOR PHASE 1

Vitest is installed, configured, and working.  
Ready to start writing TypeScript unit tests.
