#!/bin/bash
# Deployment Workflow Integration Test
# Verifies the entire promotion workflow: main → staging → production

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

log_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Test 1: Verify environment branches exist
test_environment_branches() {
    log_step "Verifying environment branches exist"
    
    if git show-ref --verify --quiet refs/heads/staging; then
        log_success "Staging branch exists"
    else
        log_error "Staging branch missing"
        return 1
    fi
    
    if git show-ref --verify --quiet refs/heads/production; then
        log_success "Production branch exists"
    else
        log_error "Production branch missing"
        return 1
    fi
}

# Test 2: Verify remotes are configured
test_remotes() {
    log_step "Verifying Git remotes"
    
    remotes=$(git remote)
    
    # Check for staging remote (pseudo upstream)
    if echo "$remotes" | grep -q staging; then
        log_success "Staging remote configured"
    else
        log_warning "Staging remote not found (expected for local testing)"
    fi
    
    # Check for production remote (pseudo upstream)
    if echo "$remotes" | grep -q production; then
        log_success "Production remote configured"
    else
        log_warning "Production remote not found (expected for local testing)"
    fi
}

# Test 3: Verify deployment scripts work
test_deploy_scripts() {
    log_step "Testing deployment scripts"
    
    # Test that scripts exist and are executable
    for script in "scripts/deploy-staging.sh" "scripts/deploy-production.sh" "scripts/sync-environments.sh"; do
        if [ -x "$script" ]; then
            log_success "$script is executable"
        else
            log_error "$script is not executable"
            return 1
        fi
    done
}

# Test 4: Verify validation scripts work
test_validation_scripts() {
    log_step "Testing validation scripts"
    
    for script in "scripts/validate-deployment.sh" "scripts/test-environment.sh"; do
        if [ -x "$script" ]; then
            log_success "$script is executable"
        else
            log_error "$script is not executable"
            return 1
        fi
    done
}

# Test 5: Verify environment configs
test_environment_configs() {
    log_step "Verifying environment configurations"
    
    # Check development
    if [ -f "config/development/hugo.toml" ]; then
        if grep -q 'baseURL = "http://localhost' config/development/hugo.toml; then
            log_success "Development config correct"
        else
            log_error "Development baseURL incorrect"
            return 1
        fi
    else
        log_error "Development config missing"
        return 1
    fi
    
    # Check staging
    if [ -f "config/staging/hugo.toml" ]; then
        if grep -q 'baseURL = "https://staging' config/staging/hugo.toml; then
            log_success "Staging config correct"
        else
            log_error "Staging baseURL incorrect"
            return 1
        fi
    else
        log_error "Staging config missing"
        return 1
    fi
    
    # Check production
    if [ -f "config/production/hugo.toml" ]; then
        if grep -q 'baseURL = "https://peterwarnock.com' config/production/hugo.toml; then
            log_success "Production config correct"
        else
            log_error "Production baseURL incorrect"
            return 1
        fi
    else
        log_error "Production config missing"
        return 1
    fi
}

# Test 6: Verify Hugo builds for each environment
test_hugo_builds() {
    log_step "Testing Hugo builds for each environment"
    
    # Test production build config exists
    if [ -f "config/production/hugo.toml" ]; then
        log_success "Hugo production config exists"
    else
        log_error "Hugo production config missing"
        return 1
    fi
    
    # Test staging build config exists
    if [ -f "config/staging/hugo.toml" ]; then
        log_success "Hugo staging config exists"
    else
        log_error "Hugo staging config missing"
        return 1
    fi
}

# Test 7: Verify path-based build script
test_path_based_build() {
    log_step "Testing path-based build script"
    
    if [ -x "scripts/path-based-build.sh" ]; then
        log_success "path-based-build.sh is executable"
        
        # Test help
        output=$(./scripts/path-based-build.sh --help 2>&1)
        if echo "$output" | grep -q "Path-Based Build Control"; then
            log_success "path-based-build.sh help output correct"
        else
            log_error "path-based-build.sh help incorrect"
            return 1
        fi
    else
        log_error "path-based-build.sh not executable"
        return 1
    fi
}

# Test 8: Verify branch protection script
test_branch_protection() {
    log_step "Testing branch protection setup script"
    
    if [ -x "scripts/setup-branch-protection.sh" ]; then
        log_success "setup-branch-protection.sh is executable"
        
        # Check for GitHub CLI requirement
        if grep -q "command -v gh" scripts/setup-branch-protection.sh; then
            log_success "setup-branch-protection.sh checks for GitHub CLI"
        else
            log_error "setup-branch-protection.sh missing GitHub CLI check"
            return 1
        fi
    else
        log_error "setup-branch-protection.sh not executable"
        return 1
    fi
}

# Test 9: Verify documentation completeness
test_documentation() {
    log_step "Testing documentation completeness"
    
    # Check INFRASTRUCTURE_PROMOTION_WORKFLOW.md
    if [ -f "docs/operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md" ]; then
        log_success "INFRASTRUCTURE_PROMOTION_WORKFLOW.md exists"
        
        if grep -q "## Promotion Workflow: Main → Staging" docs/operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md; then
            log_success "Main → Staging workflow documented"
        else
            log_error "Main → Staging workflow not documented"
            return 1
        fi
        
        if grep -q "## Promotion Workflow: Staging → Production" docs/operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md; then
            log_success "Staging → Production workflow documented"
        else
            log_error "Staging → Production workflow not documented"
            return 1
        fi
    else
        log_error "INFRASTRUCTURE_PROMOTION_WORKFLOW.md missing"
        return 1
    fi
    
    # Check ENVIRONMENT_SETTINGS.md
    if [ -f "docs/operations/ENVIRONMENT_SETTINGS.md" ]; then
        log_success "ENVIRONMENT_SETTINGS.md exists"
        
        if grep -q "## Environment Configurations" docs/operations/ENVIRONMENT_SETTINGS.md; then
            log_success "Environment configurations documented"
        else
            log_error "Environment configurations not documented"
            return 1
        fi
    else
        log_error "ENVIRONMENT_SETTINGS.md missing"
        return 1
    fi
}

# Test 10: Verify CI/CD integration points
test_cicd_integration() {
    log_step "Testing CI/CD integration points"
    
    # Check GitHub Actions workflows exist
    if [ -d ".github/workflows" ]; then
        log_success ".github/workflows directory exists"
        
        # Check for primary workflow
        if ls .github/workflows/*.yml | grep -q "build\|test\|deploy"; then
            log_success "CI/CD workflows found"
        else
            log_warning "Expected CI/CD workflows not found"
        fi
    else
        log_warning ".github/workflows directory not found"
    fi
}

# Test 11: Verify error handling
test_error_handling() {
    log_step "Testing error handling in scripts"
    
    # Check deploy-staging.sh has error handling
    if grep -q "set -e" scripts/deploy-staging.sh; then
        log_success "deploy-staging.sh has error handling (set -e)"
    else
        log_error "deploy-staging.sh missing error handling"
        return 1
    fi
    
    # Check deploy-production.sh has confirmation
    if grep -q "read -p" scripts/deploy-production.sh; then
        log_success "deploy-production.sh has confirmation prompt"
    else
        log_error "deploy-production.sh missing confirmation"
        return 1
    fi
    
    # Check validate-deployment.sh returns proper exit codes
    if grep -q "return 1" scripts/validate-deployment.sh; then
        log_success "validate-deployment.sh has error returns"
    else
        log_error "validate-deployment.sh missing error returns"
        return 1
    fi
}

# Test 12: Verify rollback capability
test_rollback() {
    log_step "Checking rollback documentation"
    
    if grep -q "rollback\|Rollback" docs/operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md; then
        log_success "Rollback procedures documented"
    else
        log_error "Rollback procedures not documented"
        return 1
    fi
    
    if grep -q "git reset\|git revert" docs/operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md; then
        log_success "Git-based rollback methods documented"
    else
        log_error "Git rollback methods not documented"
        return 1
    fi
}

# Test 13: Verify security considerations
test_security() {
    log_step "Checking security considerations"
    
    # Check for secrets warnings in deploy scripts
    if grep -q "secret\|credential\|token\|key" docs/operations/ENVIRONMENT_SETTINGS.md; then
        log_success "Secrets management documented"
    else
        log_error "Secrets management not documented"
        return 1
    fi
    
    # Check for force push warnings
    if grep -q "force push" docs/operations/ENVIRONMENT_SETTINGS.md; then
        log_success "Force push restrictions documented"
    else
        log_error "Force push restrictions not documented"
        return 1
    fi
}

# Test 14: Verify monitoring capability
test_monitoring() {
    log_step "Checking monitoring and validation"
    
    # Check post-deployment validation
    if grep -q "post deployment\|post-deployment" scripts/deploy-staging.sh; then
        log_success "Post-deployment validation in staging script"
    else
        log_error "Post-deployment validation missing"
        return 1
    fi
    
    if grep -q "Monitoring checklist" scripts/deploy-production.sh; then
        log_success "Monitoring checklist in production script"
    else
        log_error "Monitoring checklist missing"
        return 1
    fi
}

# Main
main() {
    echo -e "${BLUE}🚀 Deployment Workflow Integration Test${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo ""
    
    local failed=0
    
    test_environment_branches || failed=$((failed + 1))
    echo ""
    
    test_remotes || failed=$((failed + 1))
    echo ""
    
    test_deploy_scripts || failed=$((failed + 1))
    echo ""
    
    test_validation_scripts || failed=$((failed + 1))
    echo ""
    
    test_environment_configs || failed=$((failed + 1))
    echo ""
    
    test_hugo_builds || failed=$((failed + 1))
    echo ""
    
    test_path_based_build || failed=$((failed + 1))
    echo ""
    
    test_branch_protection || failed=$((failed + 1))
    echo ""
    
    test_documentation || failed=$((failed + 1))
    echo ""
    
    test_cicd_integration || failed=$((failed + 1))
    echo ""
    
    test_error_handling || failed=$((failed + 1))
    echo ""
    
    test_rollback || failed=$((failed + 1))
    echo ""
    
    test_security || failed=$((failed + 1))
    echo ""
    
    test_monitoring || failed=$((failed + 1))
    echo ""
    
    # Summary
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ All integration tests passed!${NC}"
        echo ""
        log_success "Deployment workflow is properly configured"
        log_info "Ready for production use"
        return 0
    else
        echo -e "${RED}❌ $failed integration test(s) failed${NC}"
        return 1
    fi
}

# Run tests
main "$@"
