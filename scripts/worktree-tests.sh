#!/bin/bash

# Parallel Testing Script for Worktrees
# Enables running tests on different worktrees with isolated environments

set -euo pipefail

# Configuration
MAIN_REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREES_DIR="$MAIN_REPO_PATH/.worktrees"
DEFAULT_TEST_PORT=4000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
Parallel Worktrees Testing Script

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    test [worktree] [type]     Run tests for specific worktree
    test-all [type]             Run tests for all worktrees
    status                       Show test status across worktrees
    clean                        Clean test artifacts across worktrees
    help                         Show this help message

TEST TYPES:
    e2e                          End-to-end tests (Playwright)
    unit                         Unit tests (TypeScript + Go)
    bdd                          BDD tests (Go)
    visual                       Visual regression tests
    performance                  Performance tests
    accessibility               Accessibility tests
    all                          Run all test types

EXAMPLES:
    $0 test opencode-dev e2e      Run E2E tests for opencode-dev
    $0 test letta-dev unit         Run unit tests for letta-dev
    $0 test-all e2e               Run E2E tests for all worktrees
    $0 status                      Show test status
    $0 clean                       Clean test artifacts

PORT ALLOCATION:
    - opencode-dev: 4001 (E2E), 4002 (Unit), 4003 (Reports)
    - letta-dev: 4011 (E2E), 4012 (Unit), 4013 (Reports)
    - letta-dev-2: 4021 (E2E), 4022 (Unit), 4023 (Reports)
    - main: 4031 (E2E), 4032 (Unit), 4033 (Reports)

EOF
}

# Get test ports for worktree
get_test_ports() {
    local worktree=$1
    local base_port=$2
    
    case "$worktree" in
        "opencode-dev") echo "4001 4002 4003" ;;
        "letta-dev") echo "4011 4012 4013" ;;
        "letta-dev-2") echo "4021 4022 4023" ;;
        "main") echo "4031 4032 4033" ;;
        *) echo "$((base_port + 1)) $((base_port + 2)) $((base_port + 3))" ;;
    esac
}

# Run tests for specific worktree
run_worktree_tests() {
    local worktree=$1
    local test_type=${2:-"all"}
    
    if [[ -z "$worktree" ]]; then
        echo -e "${RED}Error: Worktree name required${NC}"
        show_help
        exit 1
    fi
    
    local worktree_path="$WORKTREES_DIR/$worktree"
    if [[ ! -d "$worktree_path" ]]; then
        echo -e "${RED}Error: Worktree '$worktree' not found at $worktree_path${NC}"
        exit 1
    fi
    
    local ports=($(get_test_ports "$worktree" "$DEFAULT_TEST_PORT"))
    local e2e_port=${ports[0]}
    local unit_port=${ports[2]}
    
    echo -e "${BLUE}🧪 Running $test_type tests for '$worktree'${NC}"
    echo -e "${PURPLE}📊 Reports will be available on port $unit_port${NC}"
    
    # Change to worktree directory
    cd "$worktree_path"
    
    # Set environment variables for this worktree
    export WORKTREE_NAME="$worktree"
    export TEST_REPORT_PORT="$unit_port"
    export E2E_TEST_PORT="$e2e_port"
    
    case "$test_type" in
        "e2e")
            echo -e "${GREEN}🎭 Running E2E tests...${NC}"
            bun run test:e2e
            ;;
        "unit")
            echo -e "${GREEN}🔬 Running unit tests...${NC}"
            bun run test:unit
            ;;
        "bdd")
            echo -e "${GREEN}📋 Running BDD tests...${NC}"
            bun run test:bdd
            ;;
        "visual")
            echo -e "${GREEN}👁️ Running visual regression tests...${NC}"
            bun run test:visual
            ;;
        "performance")
            echo -e "${GREEN}⚡ Running performance tests...${NC}"
            bun run test:perf
            ;;
        "accessibility")
            echo -e "${GREEN}♿ Running accessibility tests...${NC}"
            bun run test:a11y
            ;;
        "all")
            echo -e "${GREEN}🚀 Running all tests...${NC}"
            bun run test:unit
            bun run test:bdd
            bun run test:e2e
            bun run test:visual
            ;;
        *)
            echo -e "${RED}Error: Unknown test type '$test_type'${NC}"
            show_help
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✓ Tests completed for '$worktree'${NC}"
}

# Run tests for all worktrees
run_all_tests() {
    local test_type=${1:-"all"}
    
    echo -e "${BLUE}🧪 Running $test_type tests for all worktrees${NC}"
    
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                local name=$(basename "$worktree")
                echo -e "${YELLOW}Processing worktree: $name${NC}"
                run_worktree_tests "$name" "$test_type"
                echo ""
            fi
        done
    else
        echo -e "${YELLOW}No worktrees directory found${NC}"
    fi
}

# Show test status across worktrees
show_test_status() {
    echo -e "${BLUE}📊 Test Status Across Worktrees${NC}"
    echo ""
    
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                local name=$(basename "$worktree")
                local worktree_path="$WORKTREES_DIR/$name"
                
                echo -e "${PURPLE}$name:${NC}"
                
                # Check for test results
                if [[ -f "$worktree_path/test-results/.last-run.json" ]]; then
                    local last_run=$(cat "$worktree_path/test-results/.last-run.json" | jq -r '.timestamp // "Unknown"')
                    echo -e "  Last run: $last_run"
                fi
                
                # Check for Playwright results
                if [[ -d "$worktree_path/playwright-report" ]]; then
                    echo -e "  ${GREEN}✓${NC} Playwright reports available"
                fi
                
                # Check for test coverage
                if [[ -f "$worktree_path/coverage/coverage-summary.json" ]]; then
                    local coverage=$(cat "$worktree_path/coverage/coverage-summary.json" | jq -r '.total.lines.pct // "Unknown"')
                    echo -e "  Coverage: ${coverage}%"
                fi
                
                echo ""
            fi
        done
    else
        echo -e "${YELLOW}No worktrees directory found${NC}"
    fi
}

# Clean test artifacts across worktrees
clean_test_artifacts() {
    echo -e "${YELLOW}🧹 Cleaning test artifacts across worktrees...${NC}"
    
    if [[ -d "$WORKTREES_DIR" ]]; then
        for worktree in "$WORKTREES_DIR"/*; do
            if [[ -d "$worktree" ]]; then
                local name=$(basename "$worktree")
                local worktree_path="$WORKTREES_DIR/$name"
                
                echo -e "${BLUE}Cleaning $name...${NC}"
                
                # Clean common test artifacts
                rm -rf "$worktree_path/test-results" 2>/dev/null || true
                rm -rf "$worktree_path/playwright-report" 2>/dev/null || true
                rm -rf "$worktree_path/coverage" 2>/dev/null || true
                rm -rf "$worktree_path/.nyc_output" 2>/dev/null || true
                rm -rf "$worktree_path/dist" 2>/dev/null || true
                
                echo -e "${GREEN}✓ Cleaned $name${NC}"
            fi
        done
    fi
    
    echo -e "${GREEN}✓ All test artifacts cleaned${NC}"
}

# Main command handling
case "${1:-}" in
    "test")
        run_worktree_tests "${2:-}" "${3:-}"
        ;;
    "test-all")
        run_all_tests "${2:-}"
        ;;
    "status")
        show_test_status
        ;;
    "clean")
        clean_test_artifacts
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        echo -e "${RED}Error: Command required${NC}"
        show_help
        exit 1
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        show_help
        exit 1
        ;;
esac