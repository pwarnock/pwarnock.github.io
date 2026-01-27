#!/bin/bash

# Quick test runner for development
# Fast feedback with minimal output

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to run quick tests
run_quick_tests() {
    echo -e "${BLUE}🚀 Quick Development Tests${NC}"
    echo -e "${BLUE}========================${NC}"
    echo ""
    
    # 1. Go unit tests (fastest)
    echo -e "${BLUE}🧪 Go Unit Tests${NC}"
    cd test
    if go test -race ./support/...; then
        echo -e "${GREEN}✅ Unit tests passed${NC}"
    else
        echo -e "${RED}❌ Unit tests failed${NC}"
        exit 1
    fi
    cd ..
    echo ""
    
    # 2. Hugo build test
    echo -e "${BLUE}🏗️  Hugo Build Test${NC}"
    if hugo --gc --minify --destination /tmp/hugo-test; then
        echo -e "${GREEN}✅ Hugo build successful${NC}"
        rm -rf /tmp/hugo-test
    else
        echo -e "${RED}❌ Hugo build failed${NC}"
        exit 1
    fi
    echo ""
    
    # 3. Lint check
    echo -e "${BLUE}🔍 Lint Check${NC}"
    if npm run lint 2>/dev/null; then
        echo -e "${GREEN}✅ Linting passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Linting issues found (non-blocking)${NC}"
    fi
    echo ""
    
    echo -e "${GREEN}🎉 All quick tests passed!${NC}"
}

# Function to run specific test type
run_specific_test() {
    case $1 in
        "unit")
            echo -e "${BLUE}🧪 Running unit tests only...${NC}"
            cd test && go test -race ./support/... && cd ..
            ;;
        "build")
            echo -e "${BLUE}🏗️  Running build test only...${NC}"
            hugo --gc --minify --destination /tmp/hugo-test && rm -rf /tmp/hugo-test
            ;;
        "lint")
            echo -e "${BLUE}🔍 Running lint check only...${NC}"
            npm run lint
            ;;
        *)
            echo -e "${RED}Unknown test type: $1${NC}"
            echo "Available: unit, build, lint"
            exit 1
            ;;
    esac
}

# Main execution
if [ $# -eq 0 ]; then
    run_quick_tests
else
    run_specific_test "$1"
fi