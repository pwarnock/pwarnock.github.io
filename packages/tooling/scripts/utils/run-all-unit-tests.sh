#!/bin/bash

# Unified Unit Test Runner
# Runs both Go and TypeScript unit tests with detailed counts
# Usage: ./scripts/run-all-unit-tests.sh [--watch] [--coverage] [--go-only] [--ts-only]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
WATCH_MODE=false
COVERAGE_MODE=false
GO_ONLY=false
TS_ONLY=false

# Counters
GO_TESTS=0
TS_TESTS=0
GO_PASSED=0
GO_FAILED=0
TS_PASSED=0
TS_FAILED=0

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --watch)
      WATCH_MODE=true
      shift
      ;;
    --coverage)
      COVERAGE_MODE=true
      shift
      ;;
    --go-only)
      GO_ONLY=true
      shift
      ;;
    --ts-only)
      TS_ONLY=true
      shift
      ;;
    *)
      echo "Unknown flag: $1"
      echo "Usage: $0 [--watch] [--coverage] [--go-only] [--ts-only]"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Unified Unit Test Runner v1.0       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

# ============ GO TESTS ============
if [ "$TS_ONLY" = false ]; then
  echo -e "\n${YELLOW}[1/2] Go Unit Tests${NC}"
  echo "      Location: test/support/"
  echo ""
  
  cd test
  
  GO_OUTPUT=$(go test -v ./support/... 2>&1) || GO_FAILED=1
  GO_TESTS=$(echo "$GO_OUTPUT" | grep -c "^=== RUN" || true)
  GO_PASSED=$(echo "$GO_OUTPUT" | grep -c "^--- PASS" || true)
  
  if [ $GO_FAILED -eq 0 ]; then
    echo -e "      ${GREEN}✓ PASSED${NC}"
    echo "      Tests: $GO_PASSED"
  else
    echo -e "      ${RED}✗ FAILED${NC}"
    GO_FAILED=$(echo "$GO_OUTPUT" | grep -c "^--- FAIL" || true)
    echo "      Tests: $GO_PASSED passed, $GO_FAILED failed"
  fi
  
  # Show brief summary
  echo "$GO_OUTPUT" | tail -3
  
  cd ..
fi

# ============ TYPESCRIPT TESTS ============
if [ "$GO_ONLY" = false ]; then
  echo -e "\n${YELLOW}[2/2] TypeScript Unit Tests${NC}"
  echo "      Location: src/**/*.test.ts"
  echo ""
  
  if [ "$WATCH_MODE" = true ]; then
    echo -e "      ${BLUE}Watch mode enabled${NC}"
    bun run test:unit:ts:watch
  elif [ "$COVERAGE_MODE" = true ]; then
    echo -e "      ${BLUE}Coverage mode enabled${NC}"
    bun run test:coverage:ts
  else
    TS_OUTPUT=$(bun run test:unit:ts 2>&1) || TS_FAILED=1
    
    # Extract test counts from Vitest output
    # Format: "Tests  8 passed (8)"
    TS_TESTS=$(echo "$TS_OUTPUT" | grep "Tests " | grep -oE '[0-9]+ passed' | awk '{print $1}' || true)
    
    if [ $TS_FAILED -eq 0 ]; then
      echo -e "      ${GREEN}✓ PASSED${NC}"
      echo "      $TS_TESTS tests"
      TS_PASSED=$TS_TESTS
    else
      echo -e "      ${RED}✗ FAILED${NC}"
    fi
    
    # Show test summary
    echo "$TS_OUTPUT" | grep -E "(Test Files|Tests)" || true
  fi
fi

# ============ FINAL SUMMARY ============
if [ "$WATCH_MODE" = false ] && [ "$COVERAGE_MODE" = false ]; then
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║           Test Summary                 ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
  
  TOTAL_TESTS=$((GO_PASSED + TS_PASSED))
  TOTAL_FAILED=$((GO_FAILED + TS_FAILED))
  
  if [ "$TS_ONLY" = false ]; then
    echo -e "${YELLOW}Go Tests:${NC}"
    echo "  Passed: $GO_PASSED"
  fi
  
  if [ "$GO_ONLY" = false ]; then
    echo -e "${YELLOW}TypeScript Tests:${NC}"
    echo "  Passed: $TS_PASSED"
  fi
  
  echo ""
  
  if [ $TOTAL_FAILED -eq 0 ] && [ $TOTAL_TESTS -gt 0 ]; then
    echo -e "${GREEN}✓ All unit tests passed!${NC}"
    echo -e "  ${GREEN}Total: $TOTAL_TESTS tests${NC}"
  elif [ $TOTAL_FAILED -gt 0 ]; then
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "  ${RED}Failed: $TOTAL_FAILED${NC}"
    echo -e "  ${GREEN}Passed: $TOTAL_TESTS${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
fi
