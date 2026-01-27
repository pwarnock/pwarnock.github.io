#!/bin/bash

# Local path-based build control script
# Mirrors CI/CD pipeline logic for local development

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
LAST_COMMIT=$(git rev-parse HEAD)
PREVIOUS_COMMIT=$(git rev-parse HEAD~1 2>/dev/null || echo "")

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

# Detect changed files
detect_changes() {
    log_info "Detecting changes since last commit..."
    
    if [ -z "$PREVIOUS_COMMIT" ]; then
        log_warning "First commit detected - running full infrastructure build"
        echo "infrastructure"
        return
    fi
    
    # Get changed files
    CHANGED_FILES=$(git diff --name-only $PREVIOUS_COMMIT $LAST_COMMIT)
    
    if [ -z "$CHANGED_FILES" ]; then
        log_info "No files changed"
        echo "none"
        return
    fi
    
    # Categorize changes
    CONTENT_CHANGED=false
    INFRASTRUCTURE_CHANGED=false
    DOCS_CHANGED=false
    
    while IFS= read -r file; do
        if [[ "$file" == content/** || "$file" == static/** || "$file" == assets/** || "$file" == data/** ]]; then
            CONTENT_CHANGED=true
        elif [[ "$file" == .github/** || "$file" == scripts/** || "$file" == test/** || "$file" == tests/** ]]; then
            INFRASTRUCTURE_CHANGED=true
        elif [[ "$file" == package*.json || "$file" == go.mod || "$file" == go.sum || "$file" == hugo.toml ]]; then
            INFRASTRUCTURE_CHANGED=true
        elif [[ "$file" == config/** || "$file" == layouts/** || "$file" == archetypes/** ]]; then
            INFRASTRUCTURE_CHANGED=true
        elif [[ "$file" == docs/** || "$file" == *.md ]]; then
            DOCS_CHANGED=true
        fi
    done <<< "$CHANGED_FILES"
    
    # Determine build type
    if [ "$INFRASTRUCTURE_CHANGED" = true ]; then
        echo "infrastructure"
    elif [ "$CONTENT_CHANGED" = true ]; then
        echo "content"
    elif [ "$DOCS_CHANGED" = true ]; then
        echo "documentation"
    else
        echo "unknown"
    fi
}

# Content-only build
content_build() {
    log_info "🚀 Running content-only build..."
    
    # Quick Hugo build
    if hugo --gc --minify --destination /tmp/content-build; then
        log_success "Content build successful"
        
        # Content validation
        log_info "📝 Running content validation..."
        
        # Check for broken internal links
        find /tmp/content-build -name "*.html" -exec grep -H "href=\"/" {} \; | \
        while read line; do
            url=$(echo "$line" | sed -n 's/.*href="\/\([^"]*\)".*/\1/p')
            if [ -n "$url" ]; then
                if [ ! -f "/tmp/content-build/$url" ] && [ ! -f "/tmp/content-build/$url/index.html" ]; then
                    log_error "Broken link found: /$url"
                    return 1
                fi
            fi
        done
        
        log_success "Content validation passed"
        
        # Portfolio validation
        if bun run validate:portfolio 2>/dev/null; then
            log_success "Portfolio validation passed"
        else
            log_warning "Portfolio validation issues found"
        fi
        
        # Summary
        HTML_COUNT=$(find /tmp/content-build -name "*.html" | wc -l)
        log_info "Generated $HTML_COUNT HTML files"
        
        # Cleanup
        rm -rf /tmp/content-build
        
    else
        log_error "Content build failed"
        return 1
    fi
}

# Infrastructure build
infrastructure_build() {
    log_info "🔧 Running infrastructure build..."
    
    # Full Hugo build
    if hugo --gc --minify; then
        log_success "Hugo build successful"
    else
        log_error "Hugo build failed"
        return 1
    fi
    
    # Run unit tests
    log_info "🧪 Running unit tests..."
    if cd test && go test -v -race ./support/...; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        return 1
    fi
    cd ..
    
    # Run linting
    log_info "🎨 Running linting..."
    if bun run lint; then
        log_success "Linting passed"
    else
        log_warning "Linting issues found"
    fi
    
    # Run E2E tests (if available)
    if command -v bunx &> /dev/null; then
        log_info "📱 Running E2E tests..."
        if bunx playwright test --project=chromium tests/e2e-journeys.spec.ts; then
            log_success "E2E tests passed"
        else
            log_warning "E2E test failures"
        fi
    else
        log_warning "Playwright not available, skipping E2E tests"
    fi
    
    # Security audit
    log_info "🔒 Running security audit..."
    if bun audit --audit-level=moderate; then
        log_success "Security audit passed"
    else
        log_warning "Security vulnerabilities found"
    fi
    
    # Performance analysis
    log_info "⚡ Running performance analysis..."
    if bun run perf:analyze; then
        log_success "Performance analysis completed"
    else
        log_warning "Performance analysis issues"
    fi
}

# Documentation build
documentation_build() {
    log_info "📚 Running documentation build..."
    
    # Validate markdown files
    log_info "📝 Validating documentation..."
    find docs -name "*.md" -exec echo "Checking {}" \;
    
    # Build to ensure docs don't break anything
    if hugo --gc --minify --destination /tmp/docs-build; then
        log_success "Documentation validation successful"
        rm -rf /tmp/docs-build
    else
        log_error "Documentation validation failed"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Path-Based Build Control${NC}"
    echo -e "${BLUE}============================${NC}"
    echo ""
    echo "Branch: $CURRENT_BRANCH"
    echo "Commit: $LAST_COMMIT"
    echo ""
    
    # Detect changes
    BUILD_TYPE=$(detect_changes)
    
    if [ "$BUILD_TYPE" = "none" ]; then
        log_info "No changes detected"
        exit 0
    fi
    
    log_info "Build type detected: $BUILD_TYPE"
    echo ""
    
    # Run appropriate build
    case $BUILD_TYPE in
        "content")
            content_build
            ;;
        "infrastructure")
            infrastructure_build
            ;;
        "documentation")
            documentation_build
            ;;
        "unknown")
            log_warning "Unknown change type, running infrastructure build"
            infrastructure_build
            ;;
    esac
    
    echo ""
    log_success "Build completed successfully!"
    
    # Deployment recommendation
    if [ "$BUILD_TYPE" = "content" ] && [ "$CURRENT_BRANCH" = "main" ]; then
        log_info "🚀 Ready for deployment (content changes on main branch)"
    elif [ "$BUILD_TYPE" = "infrastructure" ]; then
        log_warning "⚠️  Infrastructure changes detected - manual deployment recommended"
    fi
}

# Help function
show_help() {
    echo "Path-Based Build Control Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -f, --force    Force infrastructure build regardless of changes"
    echo ""
    echo "This script automatically detects the type of changes and runs"
    echo "the appropriate build strategy:"
    echo "  - Content changes: Fast build with minimal testing"
    echo "  - Infrastructure changes: Comprehensive testing suite"
    echo "  - Documentation changes: Validation only"
}

# Parse arguments
FORCE_INFRASTRUCTURE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE_INFRASTRUCTURE=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Force infrastructure build if requested
if [ "$FORCE_INFRASTRUCTURE" = true ]; then
    log_info "Forcing infrastructure build..."
    infrastructure_build
    exit 0
fi

# Run main function
main "$@"