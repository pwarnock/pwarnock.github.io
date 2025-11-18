# Unified Unit Test Runner

**Date**: November 17, 2025  
**Status**: ✅ Implemented  
**Script**: `scripts/run-all-unit-tests.sh`

---

## Overview

A unified test runner that executes **both Go and TypeScript unit tests** with clear, detailed output showing test counts.

**Features**:
- ✅ Runs Go tests (test/support/) and TypeScript tests (src/) together
- ✅ Shows test counts for each suite
- ✅ Clear pass/fail indicators
- ✅ Support for watch mode, coverage, and single-suite runs
- ✅ Formatted summary with totals

---

## Quick Start

### Run All Tests
```bash
bun run test:unit
```

Output shows:
```
╔════════════════════════════════════════╗
║    Unified Unit Test Runner v1.0       ║
╚════════════════════════════════════════╝

[1/2] Go Unit Tests
      Location: test/support/
      ✓ PASSED
      Tests: 38

[2/2] TypeScript Unit Tests
      Location: src/**/*.test.ts
      ✓ PASSED
      Tests: 8 passed (8)

╔════════════════════════════════════════╗
║           Test Summary                 ║
╚════════════════════════════════════════╝
Go Tests:
  Passed: 38
TypeScript Tests:
  Passed: 8

✓ All unit tests passed!
  Total: 46 tests
╚════════════════════════════════════════╝
```

---

## Commands

### All Tests
```bash
bun run test:unit              # Run both (default)
bun run test:unit:watch       # Watch mode (rerun on changes)
bun run test:coverage         # Generate coverage reports
```

### Individual Suites
```bash
bun run test:unit:go           # Go tests only (test/support/)
bun run test:unit:ts           # TypeScript tests only (src/)
bun run test:unit:ts:watch    # TypeScript watch mode
bun run test:coverage:ts       # TypeScript coverage
```

---

## Script Flags

Alternatively, use the script directly:

```bash
./scripts/run-all-unit-tests.sh              # Run both
./scripts/run-all-unit-tests.sh --watch     # Watch mode
./scripts/run-all-unit-tests.sh --coverage  # Coverage
./scripts/run-all-unit-tests.sh --go-only   # Go tests only
./scripts/run-all-unit-tests.sh --ts-only   # TypeScript only
```

---

## Test Locations

| Suite | Location | Framework | Count |
|-------|----------|-----------|-------|
| **Go** | `test/support/` | Go testing + Testify | 38+ tests |
| **TypeScript** | `src/**/*.test.ts` | Vitest | 8+ tests (growing) |

---

## Output Format

### Success
```
[1/2] Go Unit Tests
      Location: test/support/
      ✓ PASSED
      Tests: 38

[2/2] TypeScript Unit Tests
      Location: src/**/*.test.ts
      ✓ PASSED
      Tests: 8 passed (8)

Test Summary:
  Go Tests: 38 passed
  TypeScript Tests: 8 passed
  Total: 46 tests ✓
```

### Failure
```
[1/2] Go Unit Tests
      Location: test/support/
      ✓ PASSED
      Tests: 38

[2/2] TypeScript Unit Tests
      Location: src/**/*.test.ts
      ✗ FAILED
      Tests: 5 passed, 3 failed

Test Summary:
  Go Tests: 38 passed
  TypeScript Tests: 5 passed, 3 failed
  Failed: 3
  Passed: 43
```

---

## Watch Mode

```bash
bun run test:unit:watch
```

Reruns both test suites automatically when files change:
- `test/support/*_test.go` changes → Go tests rerun
- `src/**/*.test.ts` changes → TypeScript tests rerun

---

## Coverage Reports

```bash
bun run test:coverage
```

Generates coverage reports:
- **HTML Report**: `coverage/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **Console Output**: Coverage percentages

Coverage tracks:
- Go: `test/support/`
- TypeScript: `src/`

---

## Integration with CI/CD

### GitHub Actions

Add to workflow:

```yaml
- name: Run all unit tests
  run: bun run test:unit

- name: Generate coverage
  run: bun run test:coverage

- name: Upload coverage (TypeScript)
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
echo "Running unit tests..."
bun run test:unit || exit 1
```

---

## Technical Details

### How It Works

1. **Parse flags** - Determines mode (watch, coverage, etc.)
2. **Run Go tests** - `cd test && go test -v ./support/...`
3. **Count results** - Grep for `^--- PASS` and `^--- FAIL` lines
4. **Run TypeScript tests** - `vitest --run`
5. **Extract counts** - Parse Vitest output for test counts
6. **Display summary** - Show totals and pass/fail status

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | Some tests failed |
| N/A | Watch/coverage mode (continuous) |

---

## Examples

### Scenario 1: Daily Development
```bash
# Terminal 1: Watch mode for quick feedback
bun run test:unit:watch

# Terminal 2: Do your work
# Tests automatically rerun on file changes
```

### Scenario 2: Before Commit
```bash
# Run tests, coverage, and linting
bun run test:unit && bun run lint && git commit
```

### Scenario 3: CI/CD Pipeline
```bash
# Run tests and upload coverage
bun run test:unit && bun run test:coverage
```

### Scenario 4: Only TS Tests During Development
```bash
# Work only on TypeScript tests
bun run test:unit:ts:watch
```

---

## Troubleshooting

### Tests hanging

**Cause**: Long-running test or infinite loop

**Fix**: Interrupt (`Ctrl+C`) and run with timeout:
```bash
gtimeout 30 bun run test:unit  # macOS (needs coreutils)
```

### Missing test counts

**Cause**: Test output parsing failed

**Fix**: Check individual suites:
```bash
bun run test:unit:go    # Check Go tests
bun run test:unit:ts    # Check TypeScript tests
```

### Watch mode not detecting changes

**Cause**: File not in correct location

**Fix**: Ensure tests are in:
- `test/support/*_test.go` (Go)
- `src/**/*.test.ts` (TypeScript)

---

## Current Status

| Framework | Tests | Coverage | Status |
|-----------|-------|----------|--------|
| Go | 38 | 44% | ✅ Working |
| TypeScript | 8 | 0% (growing) | ✅ Working |
| **Total** | **46** | **~5%** | ✅ Ready |

---

## See Also

- `docs/development/TESTING.md` - Testing overview
- `docs/development/TESTING_GAPS_ANALYSIS.md` - Testing gaps and phases
- `docs/development/VITEST_SETUP.md` - Vitest configuration
- `test/support/` - Go unit tests
- `src/` - TypeScript unit tests

---

**Ready for both unit test development streams!**
