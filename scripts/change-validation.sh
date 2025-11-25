#!/bin/bash

################################################################################
# Change Validation Script
# 
# Environment-specific testing and validation for infrastructure changes.
# Ensures that changes are properly validated before reaching production.
#
# Usage:
#   ./scripts/change-validation.sh staging     # Validate for staging deployment
#   ./scripts/change-validation.sh production  # Validate for production deployment
#   ./scripts/change-validation.sh pre-push    # Run before git push
#
# Exit codes:
#   0 = All validations passed
#   1 = Validation failures found
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters for statistics
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0
VALIDATIONS_WARNINGS=0

# Environment detection
CURRENT_ENV="${1:-}"
VALIDATION_TYPE="${1:-}"

################################################################################
# Utility Functions
################################################################################

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((VALIDATIONS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((VALIDATIONS_WARNINGS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((VALIDATIONS_FAILED++))
}

log_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Get current git branch
get_current_branch() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"
}

# Get changed files
get_changed_files() {
    local base_branch="${1:-main}"
    
    if git rev-parse --verify "$base_branch" >/dev/null 2>&1; then
        git diff --name-only "$base_branch...HEAD" 2>/dev/null || echo ""
    else
        git diff --name-only HEAD~1 2>/dev/null || echo ""
    fi
}

################################################################################
# Configuration Validation
################################################################################

validate_hugo_config() {
    local env="$1"
    
    log_info "Validating Hugo configuration for $env..."
    
    local config_file="config/$env/hugo.toml"
    
    if [[ ! -f "$config_file" ]]; then
        log_error "Hugo config not found: $config_file"
        return 1
    fi
    
    # Check required sections
    local required_sections=("baseURL" "title" "languageCode")
    for section in "${required_sections[@]}"; do
        if ! grep -q "^$section\s*=" "$config_file"; then
            log_error "Missing required section: $section"
            return 1
        fi
    done
    
    # Environment-specific validations
    case "$env" in
        "staging")
            # Staging should have staging URL
            if ! grep -q "baseURL.*staging" "$config_file"; then
                log_warning "Staging config should contain staging URL"
            fi
            
            # Analytics should be disabled or test-only
            if grep -q "googleAnalytics.*G-.*[A-Z0-9]" "$config_file"; then
                log_warning "Production analytics detected in staging config"
            fi
            ;;
        "production")
            # Production must have production URL
            if ! grep -q "baseURL.*peterwarnock.com" "$config_file"; then
                log_error "Production config missing correct baseURL"
                return 1
            fi
            
            # Analytics should be configured
            if ! grep -q "googleAnalytics.*G-" "$config_file"; then
                log_warning "Production analytics not configured"
            fi
            ;;
    esac
    
    log_success "Hugo configuration valid for $env"
    return 0
}

validate_feature_flags() {
    local env="$1"
    
    log_info "Validating feature flags for $env..."
    
    local flags_file="data/feature-flags.toml"
    
    if [[ ! -f "$flags_file" ]]; then
        log_warning "Feature flags file not found: $flags_file"
        return 0
    fi
    
    # Check TOML syntax
    if command_exists bun; then
        if bun run validate-toml "$flags_file" 2>/dev/null; then
            log_success "Feature flags TOML syntax valid"
        else
            log_error "Feature flags TOML syntax invalid"
            return 1
        fi
    else
        log_warning "TOML validation not available (bun not found)"
    fi
    
    # Environment-specific flag checks
    case "$env" in
        "staging")
            # Staging can have experimental flags enabled
            local experimental_flags=$(grep -c "enabled = true" "$flags_file" 2>/dev/null || echo "0")
            log_info "Found $experimental_flags enabled flags in staging"
            ;;
        "production")
            # Production should have minimal experimental flags
            local experimental_flags=$(grep -c "enabled = true" "$flags_file" 2>/dev/null || echo "0")
            if [[ $experimental_flags -gt 5 ]]; then
                log_warning "High number of enabled flags in production ($experimental_flags)"
            fi
            ;;
    esac
    
    log_success "Feature flags validated for $env"
    return 0
}

################################################################################
# Build Validation
################################################################################

validate_build() {
    local env="$1"
    
    log_info "Validating build process for $env..."
    
    # Set environment
    export HUGO_ENV="$env"
    
    # Run Hugo build
    if command_exists hugo; then
        local build_output
        if build_output=$(hugo --environment "$env" --minify 2>&1); then
            log_success "Hugo build successful for $env"
            
            # Check for warnings in build output
            if echo "$build_output" | grep -q "WARN"; then
                log_warning "Build completed with warnings"
                echo "$build_output" | grep "WARN" | head -5
            fi
        else
            log_error "Hugo build failed for $env"
            echo "$build_output" | head -10
            return 1
        fi
    else
        log_warning "Hugo not available for build validation"
        return 0
    fi
    
    # Validate output directory
    local public_dir="public"
    if [[ -d "$public_dir" ]]; then
        local file_count=$(find "$public_dir" -type f | wc -l)
        log_info "Build generated $file_count files"
        
        # Check for essential files
        local essential_files=("index.html" "sitemap.xml")
        for file in "${essential_files[@]}"; do
            if [[ -f "$public_dir/$file" ]]; then
                log_success "Essential file present: $file"
            else
                log_warning "Essential file missing: $file"
            fi
        done
    else
        log_error "Build output directory not found: $public_dir"
        return 1
    fi
    
    return 0
}

################################################################################
# Testing Validation
################################################################################

validate_unit_tests() {
    log_info "Running unit tests..."
    
    if command_exists bun; then
        if bun run test:unit 2>/dev/null; then
            log_success "Unit tests passed"
        else
            log_error "Unit tests failed"
            return 1
        fi
    elif command_exists npm; then
        if npm run test:unit 2>/dev/null; then
            log_success "Unit tests passed"
        else
            log_error "Unit tests failed"
            return 1
        fi
    else
        log_warning "No package manager available for unit tests"
        return 0
    fi
}

validate_e2e_tests() {
    local env="$1"
    local test_scope="basic"
    
    log_info "Running E2E tests for $env..."
    
    # Determine test scope based on environment
    case "$env" in
        "staging")
            test_scope="basic"  # Quick smoke tests
            ;;
        "production")
            test_scope="full"   # Comprehensive tests
            ;;
    esac
    
    if command_exists bunx; then
        case "$test_scope" in
            "basic")
                if bunx playwright test --project=chromium --grep "smoke|critical" 2>/dev/null; then
                    log_success "Basic E2E tests passed"
                else
                    log_warning "Basic E2E tests had issues"
                fi
                ;;
            "full")
                if bunx playwright test 2>/dev/null; then
                    log_success "Full E2E tests passed"
                else
                    log_error "Full E2E tests failed"
                    return 1
                fi
                ;;
        esac
    else
        log_warning "Playwright not available for E2E tests"
        return 0
    fi
}

validate_accessibility_tests() {
    log_info "Running accessibility tests..."
    
    if command_exists bun; then
        if bun run test:accessibility 2>/dev/null; then
            log_success "Accessibility tests passed"
        else
            log_warning "Accessibility tests had warnings"
        fi
    else
        log_warning "Accessibility tests not available"
        return 0
    fi
}

validate_performance_tests() {
    local env="$1"
    
    log_info "Running performance validation for $env..."
    
    # Check bundle size
    local baseline_file=".bundle-baseline.json"
    if [[ -f "$baseline_file" ]]; then
        if command_exists node; then
            if node scripts/bundle-size-protection.js 2>/dev/null; then
                log_success "Bundle size validation passed"
            else
                log_warning "Bundle size validation failed"
            fi
        else
            log_warning "Node not available for bundle size validation"
        fi
    else
        log_warning "Bundle baseline not found"
    fi
    
    # Environment-specific performance checks
    case "$env" in
        "production")
            # Production should meet performance thresholds
            if command_exists bunx; then
                if bunx playwright test --grep "performance|lighthouse" 2>/dev/null; then
                    log_success "Performance tests passed"
                else
                    log_warning "Performance tests had issues"
                fi
            fi
            ;;
    esac
}

################################################################################
# Security Validation
################################################################################

validate_security() {
    local env="$1"
    
    log_info "Running security validation for $env..."
    
    # Check for secrets in code
    if command_exists gitleaks; then
        if gitleaks detect --no-git --verbose 2>/dev/null; then
            log_success "No secrets detected"
        else
            log_error "Potential secrets detected"
            return 1
        fi
    else
        log_warning "Gitleaks not available for secret detection"
    fi
    
    # Check dependencies for vulnerabilities
    if command_exists bun; then
        if bun audit 2>/dev/null; then
            log_success "No security vulnerabilities found"
        else
            log_warning "Security vulnerabilities detected"
        fi
    elif command_exists npm; then
        if npm audit --audit-level moderate 2>/dev/null; then
            log_success "No security vulnerabilities found"
        else
            log_warning "Security vulnerabilities detected"
        fi
    fi
    
    # Environment-specific security checks
    case "$env" in
        "staging")
            # Staging should not have production secrets
            if [[ -n "$PRODUCTION_API_KEY" ]] || [[ -n "$PROD_DB_PASSWORD" ]]; then
                log_error "Production secrets found in staging environment"
                return 1
            fi
            ;;
        "production")
            # Production must have security headers
            log_info "Production security headers should be configured"
            ;;
    esac
    
    log_success "Security validation completed for $env"
}

################################################################################
# Analytics Validation
################################################################################

validate_analytics() {
    local env="$1"
    
    log_info "Validating analytics configuration for $env..."
    
    # Run analytics validation script
    if [[ -f ".github/scripts/validate-analytics.sh" ]]; then
        if .github/scripts/validate-analytics.sh 2>/dev/null; then
            log_success "Analytics validation passed"
        else
            log_warning "Analytics validation had issues"
        fi
    else
        log_warning "Analytics validation script not found"
    fi
    
    # Environment-specific analytics checks
    case "$env" in
        "staging")
            # Staging should use test analytics
            log_info "Staging should use test/training analytics"
            ;;
        "production")
            # Production must have real analytics
            log_info "Production should have production analytics configured"
            ;;
    esac
}

################################################################################
# Pre-Push Validation
################################################################################

validate_pre_push() {
    log_info "Running pre-push validation..."
    
    local current_branch
    current_branch=$(get_current_branch)
    
    log_info "Current branch: $current_branch"
    
    # Get changed files
    local changed_files
    changed_files=$(get_changed_files)
    
    if [[ -z "$changed_files" ]]; then
        log_info "No changes detected"
        return 0
    fi
    
    log_info "Changed files:"
    echo "$changed_files" | head -10
    
    # Determine validation scope based on changes
    local has_config_changes=false
    local has_content_changes=false
    local has_script_changes=false
    local has_style_changes=false
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        case "$file" in
            config/*|*.toml|hugo.toml)
                has_config_changes=true
                ;;
            content/*|*.md)
                has_content_changes=true
                ;;
            scripts/*|*.js|*.ts)
                has_script_changes=true
                ;;
            assets/css/*|*.scss|*.css)
                has_style_changes=true
                ;;
        esac
    done <<< "$changed_files"
    
    # Run appropriate validations
    if [[ "$has_config_changes" == true ]]; then
        log_info "Configuration changes detected, running config validation..."
        validate_hugo_config "development"
    fi
    
    if [[ "$has_script_changes" == true ]]; then
        log_info "Script changes detected, running unit tests..."
        validate_unit_tests
    fi
    
    if [[ "$has_style_changes" == true ]]; then
        log_info "Style changes detected, running build validation..."
        validate_build "development"
    fi
    
    # Always run analytics validation for interactive elements
    validate_analytics "development"
    
    log_success "Pre-push validation completed"
}

################################################################################
# Main Validation Logic
################################################################################

run_environment_validation() {
    local env="$1"
    
    log_header "Environment-Specific Validation: $env"
    
    # Configuration validation
    validate_hugo_config "$env"
    validate_feature_flags "$env"
    
    # Build validation
    validate_build "$env"
    
    # Testing validation
    validate_unit_tests
    validate_e2e_tests "$env"
    validate_accessibility_tests
    validate_performance_tests "$env"
    
    # Security validation
    validate_security "$env"
    
    # Analytics validation
    validate_analytics "$env"
    
    log_success "Environment validation completed for $env"
}

show_summary() {
    log_header "Validation Summary"
    
    echo "✅ Passed: $VALIDATIONS_PASSED"
    echo "⚠️  Warnings: $VALIDATIONS_WARNINGS"
    echo "❌ Failed: $VALIDATIONS_FAILED"
    echo ""
    
    if [[ $VALIDATIONS_FAILED -gt 0 ]]; then
        log_error "Validation failed with $VALIDATIONS_FAILED errors"
        return 1
    elif [[ $VALIDATIONS_WARNINGS -gt 0 ]]; then
        log_warning "Validation passed with $VALIDATIONS_WARNINGS warnings"
        return 0
    else
        log_success "All validations passed successfully"
        return 0
    fi
}

show_help() {
    cat <<EOF
${BLUE}Change Validation Script${NC}

${YELLOW}Usage:${NC}
  $0 staging          - Validate for staging environment
  $0 production       - Validate for production environment
  $0 pre-push         - Run pre-push validation
  $0 -h, --help       - Show this help

${YELLOW}Validations:${NC}
  • Configuration validation (Hugo, feature flags)
  • Build validation (Hugo build, output verification)
  • Testing validation (unit, E2E, accessibility, performance)
  • Security validation (secrets, dependencies)
  • Analytics validation (tracking, events)

${YELLOW}Exit Codes:${NC}
  0 - All validations passed
  1 - Validation failures found

${YELLOW}Examples:${NC}
  $0 staging
  $0 production
  $0 pre-push
EOF
}

################################################################################
# Script Entry Point
################################################################################

main() {
    local validation_type="${1:-}"
    
    case "$validation_type" in
        "staging"|"production")
            run_environment_validation "$validation_type"
            ;;
        "pre-push")
            log_header "Pre-Push Validation"
            validate_pre_push
            ;;
        "-h"|"--help")
            show_help
            exit 0
            ;;
        "")
            log_error "Validation type required"
            show_help
            exit 1
            ;;
        *)
            log_error "Unknown validation type: $validation_type"
            show_help
            exit 1
            ;;
    esac
    
    show_summary
}

# Run main function with all arguments
main "$@"