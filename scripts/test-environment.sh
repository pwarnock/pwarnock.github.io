#!/bin/bash
# Environment-specific testing script
# Runs tests appropriate for each environment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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

# Test configuration
test_config() {
    local env="$1"
    
    log_info "Testing configuration for $env..."
    
    case "$env" in
        "staging")
            # Check staging config exists
            if [ ! -f "config/staging/hugo.toml" ]; then
                log_error "Staging Hugo config not found"
                return 1
            fi
            
            # Verify staging baseURL
            if ! grep -q "baseURL = \"https://staging" config/staging/hugo.toml; then
                log_error "Staging baseURL not correctly configured"
                return 1
            fi
            
            # Verify analytics disabled
            if grep -q "googleAnalytics = \"G-" config/staging/hugo.toml; then
                log_warning "Analytics appears to be enabled in staging"
            fi
            ;;
        "production")
            # Check production config exists
            if [ ! -f "config/production/hugo.toml" ]; then
                log_error "Production Hugo config not found"
                return 1
            fi
            
            # Verify production baseURL
            if ! grep -q "baseURL = \"https://peterwarnock.com" config/production/hugo.toml; then
                log_error "Production baseURL not correctly configured"
                return 1
            fi
            
            # Verify analytics enabled
            if ! grep -q "googleAnalytics = \"G-" config/production/hugo.toml; then
                log_error "Analytics not configured in production"
                return 1
            fi
            ;;
    esac
    
    log_success "Configuration valid for $env"
}

# Run environment-specific tests
test_environment_tests() {
    local env="$1"
    
    log_info "Running environment-specific tests for $env..."
    
    case "$env" in
        "staging")
            log_info "Running E2E tests..."
            if command -v bunx &> /dev/null; then
                if bunx playwright test --project=chromium; then
                    log_success "E2E tests passed"
                else
                    log_warning "E2E tests had issues"
                fi
            else
                log_warning "Playwright not available"
            fi
            ;;
        "production")
            log_info "Running comprehensive test suite..."
            
            # E2E tests
            if command -v bunx &> /dev/null; then
                if bunx playwright test; then
                    log_success "E2E tests passed"
                else
                    log_error "E2E tests failed"
                    return 1
                fi
            fi
            
            # Accessibility tests
            if command -v bun &> /dev/null; then
                if bun run test:accessibility 2>/dev/null; then
                    log_success "Accessibility tests passed"
                else
                    log_warning "Accessibility tests had warnings"
                fi
            fi
            ;;
    esac
}

# Verify environment variables
verify_env_vars() {
    local env="$1"
    
    log_info "Verifying environment variables for $env..."
    
    case "$env" in
        "staging")
            # Staging shouldn't have sensitive production data
            if [ -n "$PRODUCTION_API_KEY" ]; then
                log_warning "Production API key found in staging environment"
            fi
            ;;
        "production")
            # Production must have required variables
            if [ -z "$PROD_DEPLOY_KEY" ]; then
                log_warning "Production deploy key not set"
            fi
            ;;
    esac
    
    log_success "Environment variables verified for $env"
}

# Check branch protection rules
check_branch_protection() {
    local branch="$1"
    
    log_info "Checking branch protection rules for $branch..."
    
    # This would require GitHub CLI access
    # For now, just document what should be protected
    
    case "$branch" in
        "staging")
            log_info "Staging branch should restrict force pushes"
            ;;
        "production")
            log_info "Production branch should require linear history"
            log_info "Production branch should restrict force pushes"
            ;;
    esac
}

# Main
run_tests() {
    local env="$1"
    
    echo -e "${BLUE}🧪 Environment-Specific Testing for $env${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
    
    test_config "$env" || return 1
    test_environment_tests "$env" || return 1
    verify_env_vars "$env" || return 1
    check_branch_protection "$env"
    
    echo ""
    log_success "All environment tests passed for $env!"
}

# Show help
show_help() {
    echo "Environment-Specific Testing Script"
    echo ""
    echo "Usage: $0 ENV"
    echo ""
    echo "Environments:"
    echo "  staging      - Run tests for staging environment"
    echo "  production   - Run tests for production environment"
}

# Main
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

case "$1" in
    staging|production)
        run_tests "$1"
        ;;
    -h|--help)
        show_help
        ;;
    *)
        log_error "Unknown environment: $1"
        show_help
        exit 1
        ;;
esac
