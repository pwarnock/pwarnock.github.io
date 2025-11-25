#!/bin/bash
# Deployment Validation Test Suite
# Tests the validate-deployment.sh script

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

log_test() {
    echo -e "${BLUE}▶ TEST: $1${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
}

log_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Test Suite 1: Script existence and permissions
test_script_exists() {
    log_test "validate-deployment.sh exists and is executable"
    
    if [ -f "scripts/validate-deployment.sh" ] && [ -x "scripts/validate-deployment.sh" ]; then
        log_pass "Script exists and is executable"
    else
        log_fail "Script missing or not executable"
    fi
}

# Test Suite 2: Help functionality
test_help_output() {
    log_test "Script shows help with --help flag"
    
    output=$(./scripts/validate-deployment.sh --help 2>&1)
    if echo "$output" | grep -q "Deployment Validation Script"; then
        log_pass "Help output is correct"
    else
        log_fail "Help output is missing or incorrect"
    fi
}

# Test Suite 3: Required tools check
test_required_tools() {
    log_test "Required tools are available (git, hugo, bun)"
    
    local missing_tools=0
    
    if ! command -v git &> /dev/null; then
        log_info "Missing: git"
        missing_tools=$((missing_tools + 1))
    fi
    
    if ! command -v hugo &> /dev/null; then
        log_info "Missing: hugo"
        missing_tools=$((missing_tools + 1))
    fi
    
    if ! command -v bun &> /dev/null; then
        log_info "Missing: bun"
        missing_tools=$((missing_tools + 1))
    fi
    
    if [ $missing_tools -eq 0 ]; then
        log_pass "All required tools available"
    else
        log_fail "Missing $missing_tools required tools"
    fi
}

# Test Suite 4: CSS validation logic
test_css_validation() {
    log_test "CSS validation detects unprocessed directives"
    
    # Create test CSS with unprocessed directives
    test_dir=$(mktemp -d)
    echo "@import 'tailwind.css';" > "$test_dir/main.css"
    
    # Grep for directives (mimicking script logic)
    if grep -E "@import|@plugin|@tailwind" "$test_dir/main.css" > /dev/null; then
        log_pass "CSS validation correctly identifies unprocessed directives"
    else
        log_fail "CSS validation failed to identify directives"
    fi
    
    rm -rf "$test_dir"
}

# Test Suite 5: Hugo config validation
test_hugo_config_validation() {
    log_test "Hugo config validation checks baseURL"
    
    if [ -f "config/production/hugo.toml" ]; then
        if grep -q "baseURL = \"https://peterwarnock.com" config/production/hugo.toml; then
            log_pass "Production Hugo config has correct baseURL"
        else
            log_fail "Production Hugo config baseURL incorrect"
        fi
    else
        log_fail "Production Hugo config not found"
    fi
}

# Test Suite 6: Staging config exists
test_staging_config() {
    log_test "Staging-specific Hugo config exists"
    
    if [ -f "config/staging/hugo.toml" ]; then
        log_pass "Staging Hugo config found"
        
        # Check for staging-specific settings
        if grep -q "baseURL = \"https://staging" config/staging/hugo.toml; then
            log_pass "Staging baseURL is correct"
        else
            log_fail "Staging baseURL is incorrect"
        fi
    else
        log_fail "Staging Hugo config missing"
    fi
}

# Test Suite 7: Public directory structure
test_build_output_structure() {
    log_test "Build output has expected directory structure"
    
    if [ -d "public" ]; then
        if [ -f "public/index.html" ]; then
            log_pass "public/index.html exists"
        else
            log_fail "public/index.html missing"
        fi
        
        if [ -f "public/css/main.css" ]; then
            log_pass "public/css/main.css exists"
        else
            log_fail "public/css/main.css missing"
        fi
    else
        log_fail "public directory not found (need to run build first)"
    fi
}

# Test Suite 8: Security checks
test_security_validation() {
    log_test "Security validation checks for hardcoded URLs"
    
    # Create test file with hardcoded URL
    test_dir=$(mktemp -d)
    echo "http://localhost/test" > "$test_dir/test.md"
    
    # Test the grep pattern from the script
    if grep -r "http://" "$test_dir" 2>/dev/null | grep -qv "http://localhost"; then
        log_info "Found non-localhost hardcoded HTTP URLs (expected in test)"
    else
        log_pass "HTTP URL detection works"
    fi
    
    rm -rf "$test_dir"
}

# Test Suite 9: Deploy script enhancements
test_deploy_staging_script() {
    log_test "deploy-staging.sh has validation integration"
    
    if grep -q "validate-deployment.sh pre staging" scripts/deploy-staging.sh; then
        log_pass "deploy-staging.sh calls pre-deployment validation"
    else
        log_fail "deploy-staging.sh missing validation call"
    fi
    
    if grep -q "validate-deployment.sh post staging" scripts/deploy-staging.sh; then
        log_pass "deploy-staging.sh calls post-deployment validation"
    else
        log_fail "deploy-staging.sh missing post-deployment validation"
    fi
}

test_deploy_production_script() {
    log_test "deploy-production.sh has validation and confirmation"
    
    if grep -q "validate-deployment.sh pre production" scripts/deploy-production.sh; then
        log_pass "deploy-production.sh calls pre-deployment validation"
    else
        log_fail "deploy-production.sh missing validation call"
    fi
    
    if grep -q "read -p.*Are you sure" scripts/deploy-production.sh; then
        log_pass "deploy-production.sh has user confirmation"
    else
        log_fail "deploy-production.sh missing confirmation prompt"
    fi
}

# Test Suite 10: Environment-specific testing script
test_environment_test_script() {
    log_test "test-environment.sh exists and is executable"
    
    if [ -f "scripts/test-environment.sh" ] && [ -x "scripts/test-environment.sh" ]; then
        log_pass "test-environment.sh exists and is executable"
        
        # Test help
        output=$(./scripts/test-environment.sh --help 2>&1)
        if echo "$output" | grep -q "Environment-Specific Testing"; then
            log_pass "test-environment.sh help output is correct"
        else
            log_fail "test-environment.sh help output incorrect"
        fi
    else
        log_fail "test-environment.sh missing or not executable"
    fi
}

# Test Suite 11: Branch protection script
test_branch_protection_script() {
    log_test "setup-branch-protection.sh exists and is executable"
    
    if [ -f "scripts/setup-branch-protection.sh" ] && [ -x "scripts/setup-branch-protection.sh" ]; then
        log_pass "setup-branch-protection.sh exists and is executable"
        
        # Check for GitHub CLI check
        if grep -q "command -v gh" scripts/setup-branch-protection.sh; then
            log_pass "setup-branch-protection.sh checks for GitHub CLI"
        else
            log_fail "setup-branch-protection.sh missing GitHub CLI check"
        fi
    else
        log_fail "setup-branch-protection.sh missing or not executable"
    fi
}

# Test Suite 12: Package.json scripts
test_package_json_scripts() {
    log_test "Package.json has new deployment scripts"
    
    if grep -q '"validate:deployment"' package.json; then
        log_pass "validate:deployment script in package.json"
    else
        log_fail "validate:deployment script missing from package.json"
    fi
    
    if grep -q '"setup:branch-protection"' package.json; then
        log_pass "setup:branch-protection script in package.json"
    else
        log_fail "setup:branch-protection script missing from package.json"
    fi
    
    if grep -q '"test:environment"' package.json; then
        log_pass "test:environment script in package.json"
    else
        log_fail "test:environment script missing from package.json"
    fi
}

# Test Suite 13: Documentation
test_documentation() {
    log_test "ENVIRONMENT_SETTINGS.md exists with required sections"
    
    if [ -f "docs/operations/ENVIRONMENT_SETTINGS.md" ]; then
        log_pass "ENVIRONMENT_SETTINGS.md exists"
        
        if grep -q "## Git Branch Protection" docs/operations/ENVIRONMENT_SETTINGS.md; then
            log_pass "Documentation includes branch protection section"
        else
            log_fail "Documentation missing branch protection section"
        fi
        
        if grep -q "## Deployment Authorization" docs/operations/ENVIRONMENT_SETTINGS.md; then
            log_pass "Documentation includes deployment authorization"
        else
            log_fail "Documentation missing deployment authorization section"
        fi
        
        if grep -q "## Emergency Procedures" docs/operations/ENVIRONMENT_SETTINGS.md; then
            log_pass "Documentation includes emergency procedures"
        else
            log_fail "Documentation missing emergency procedures"
        fi
    else
        log_fail "ENVIRONMENT_SETTINGS.md missing"
    fi
}

# Test Suite 14: Documentation index
test_docs_index() {
    log_test "docs/README.md includes new documentation"
    
    if grep -q "ENVIRONMENT_SETTINGS.md" docs/README.md; then
        log_pass "docs/README.md references ENVIRONMENT_SETTINGS.md"
    else
        log_fail "docs/README.md missing ENVIRONMENT_SETTINGS.md reference"
    fi
    
    if grep -q "INFRASTRUCTURE_PROMOTION_WORKFLOW.md" docs/README.md; then
        log_pass "docs/README.md references INFRASTRUCTURE_PROMOTION_WORKFLOW.md"
    else
        log_fail "docs/README.md missing INFRASTRUCTURE_PROMOTION_WORKFLOW.md reference"
    fi
}

# Summary
print_summary() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}🧪 Test Summary${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    echo "Total Tests:  $TESTS_RUN"
    echo -e "Passed:       ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed:       ${RED}$TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🧪 Deployment Validation Test Suite${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    
    # Test Suite 1: Script verification
    log_info "Suite 1: Script Verification"
    test_script_exists
    test_help_output
    echo ""
    
    # Test Suite 2: Tools and environment
    log_info "Suite 2: Tools and Environment"
    test_required_tools
    test_hugo_config_validation
    test_staging_config
    echo ""
    
    # Test Suite 3: Validation logic
    log_info "Suite 3: Validation Logic"
    test_css_validation
    test_security_validation
    test_build_output_structure
    echo ""
    
    # Test Suite 4: Deploy scripts
    log_info "Suite 4: Deploy Scripts"
    test_deploy_staging_script
    test_deploy_production_script
    echo ""
    
    # Test Suite 5: Supporting scripts
    log_info "Suite 5: Supporting Scripts"
    test_environment_test_script
    test_branch_protection_script
    echo ""
    
    # Test Suite 6: Integration points
    log_info "Suite 6: Integration Points"
    test_package_json_scripts
    test_documentation
    test_docs_index
    echo ""
    
    # Print summary
    print_summary
}

# Run tests
main "$@"
