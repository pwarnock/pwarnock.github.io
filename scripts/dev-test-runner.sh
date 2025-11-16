#!/bin/bash

# Development test runner with watch mode and enhanced UX
# Provides fast feedback and intelligent test selection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
WATCH_MODE=false
TEST_TYPE="all"
COVERAGE=false
VERBOSE=false
PARALLEL=true
BROWSER="chromium"

# Help function
show_help() {
    echo -e "${BLUE}🧪 Development Test Runner${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS] [TEST_TYPE]"
    echo ""
    echo "TEST_TYPES:"
    echo "  all         Run all test suites (default)"
    echo "  unit        Run Go unit tests only"
    echo "  bdd         Run BDD integration tests only"
    echo "  e2e         Run Playwright E2E tests only"
    echo "  visual      Run visual regression tests only"
    echo "  performance Run performance tests only"
    echo ""
    echo "OPTIONS:"
    echo "  -w, --watch      Enable watch mode"
    echo "  -c, --coverage   Generate coverage reports"
    echo "  -v, --verbose    Verbose output"
    echo "  -p, --parallel   Run tests in parallel (default)"
    echo "  -s, --sequential Run tests sequentially"
    echo "  -b, --browser    Specify browser for E2E tests (chromium|firefox|webkit)"
    echo "  -h, --help       Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 --watch e2e           # Watch E2E tests"
    echo "  $0 --coverage unit        # Run unit tests with coverage"
    echo "  $0 --browser firefox e2e  # Run E2E tests in Firefox"
    echo "  $0 --watch --coverage all # Watch all tests with coverage"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--watch)
            WATCH_MODE=true
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -p|--parallel)
            PARALLEL=true
            shift
            ;;
        -s|--sequential)
            PARALLEL=false
            shift
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        unit|bdd|e2e|visual|performance|all)
            TEST_TYPE="$1"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_test() {
    echo -e "${PURPLE}🧪 $1${NC}"
}

log_perf() {
    echo -e "${CYAN}⚡ $1${NC}"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Go
    if ! command -v go &> /dev/null; then
        log_error "Go is not installed"
        exit 1
    fi
    
    # Check Node/Bun
    if ! command -v bun &> /dev/null; then
        log_error "Bun is not installed"
        exit 1
    fi
    
    # Check Playwright
    if ! bunx playwright --version &> /dev/null; then
        log_warning "Playwright not found, installing browsers..."
        bunx playwright install --with-deps
    fi
    
    log_success "Dependencies checked"
}

# Run Go unit tests
run_unit_tests() {
    log_test "Running Go unit tests..."
    
    cd test
    
    if [ "$COVERAGE" = true ]; then
        log_info "Generating coverage report..."
        go test -v -race -coverprofile=coverage.out ./support/...
        go tool cover -html=coverage.out -o coverage.html
        log_success "Coverage report generated: test/coverage.html"
    else
        go test -v -race ./support/...
    fi
    
    cd ..
}

# Run BDD tests
run_bdd_tests() {
    log_test "Running BDD integration tests..."
    
    cd test
    
    if [ "$PARALLEL" = true ]; then
        go test -v ./...
    else
        go test -v -parallel=1 ./...
    fi
    
    cd ..
}

# Run E2E tests
run_e2e_tests() {
    log_test "Running E2E tests with $BROWSER..."
    
    local playwright_args=""
    
    if [ "$VERBOSE" = true ]; then
        playwright_args="$playwright_args --reporter=list"
    fi
    
    if [ "$PARALLEL" = false ]; then
        playwright_args="$playwright_args --workers=1"
    fi
    
    bunx playwright test --project="$BROWSER" $playwright_args tests/e2e-journeys.spec.ts
}

# Run visual tests
run_visual_tests() {
    log_test "Running visual regression tests..."
    
    local playwright_args=""
    
    if [ "$VERBOSE" = true ]; then
        playwright_args="$playwright_args --reporter=list"
    fi
    
    bunx playwright test $playwright_args tests/visual-regression.spec.ts
}

# Run performance tests
run_performance_tests() {
    log_test "Running performance benchmarking..."
    
    local playwright_args=""
    
    if [ "$VERBOSE" = true ]; then
        playwright_args="$playwright_args --reporter=list"
    fi
    
    bunx playwright test $playwright_args tests/performance.spec.ts
}

# Watch mode function
watch_mode() {
    log_info "Starting watch mode for $TEST_TYPE tests..."
    log_warning "Press Ctrl+C to stop watching"
    
    # Install fswatch if not present
    if ! command -v fswatch &> /dev/null; then
        log_info "Installing fswatch for file watching..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install fswatch
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get install fswatch
        else
            log_error "Please install fswatch manually for your platform"
            exit 1
        fi
    fi
    
    # Define watch patterns based on test type
    local watch_patterns=""
    case $TEST_TYPE in
        unit)
            watch_patterns="test/support/*.go test/support/*_test.go"
            ;;
        bdd)
            watch_patterns="test/**/*.go test/features/*.feature"
            ;;
        e2e|visual|performance)
            watch_patterns="tests/*.ts layouts/**/*.html content/**/*.md assets/**/*.css"
            ;;
        all)
            watch_patterns="test/**/*.go tests/*.ts layouts/**/*.html content/**/*.md assets/**/*.css"
            ;;
    esac
    
    # Initial run
    run_tests
    
    # Watch loop
    fswatch -o $watch_patterns | while read event; do
        echo ""
        log_info "File changes detected, re-running tests..."
        echo ""
        run_tests
    done
}

# Main test runner function
run_tests() {
    local start_time=$(date +%s)
    
    case $TEST_TYPE in
        unit)
            run_unit_tests
            ;;
        bdd)
            run_bdd_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        visual)
            run_visual_tests
            ;;
        performance)
            run_performance_tests
            ;;
        all)
            log_test "Running all test suites..."
            run_unit_tests
            run_bdd_tests
            run_e2e_tests
            run_visual_tests
            run_performance_tests
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_perf "Tests completed in ${duration}s"
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Development Test Runner${NC}"
    echo -e "${BLUE}=============================${NC}"
    echo ""
    
    check_dependencies
    
    if [ "$WATCH_MODE" = true ]; then
        watch_mode
    else
        run_tests
    fi
    
    echo ""
    log_success "Test run completed!"
}

# Run main function
main "$@"