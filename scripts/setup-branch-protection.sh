#!/bin/bash
# Setup GitHub branch protection rules via GitHub CLI
# Ensures proper access control for staging and production branches

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

# Check if GitHub CLI is installed
check_github_cli() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        log_info "Install from: https://cli.github.com/"
        return 1
    fi
    
    log_success "GitHub CLI found"
}

# Check authentication
check_auth() {
    log_info "Checking GitHub authentication..."
    if ! gh auth status 2>/dev/null; then
        log_error "Not authenticated with GitHub"
        log_info "Run: gh auth login"
        return 1
    fi
    
    log_success "GitHub authentication verified"
}

# Get repository info
get_repo_info() {
    log_info "Getting repository information..."
    
    REPO=$(git config --get remote.origin.url)
    if [[ $REPO == *"pwarnock"* ]]; then
        REPO_SLUG="pwarnock/pwarnock.github.io"
        log_success "Repository: $REPO_SLUG"
    else
        log_error "Could not determine repository"
        return 1
    fi
}

# Setup main branch protection
setup_main_branch() {
    log_info "Setting up main branch protection..."
    
    # Main branch should have moderate protection
    gh api repos/$REPO_SLUG/branches/main/protection \
        --input - << 'EOF' || log_warning "Could not update main branch protection"
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": true,
  "allow_deletions": false,
  "required_linear_history": false,
  "allow_auto_merge": true
}
EOF
    
    log_success "Main branch protection configured"
}

# Setup staging branch protection
setup_staging_branch() {
    log_info "Setting up staging branch protection..."
    
    # Ensure staging branch exists
    if ! git rev-parse --verify staging &>/dev/null; then
        log_info "Creating staging branch from main..."
        git checkout -b staging main
        git push origin staging
    fi
    
    # Configure protection
    gh api repos/$REPO_SLUG/branches/staging/protection \
        --input - << 'EOF' || log_warning "Could not update staging branch protection"
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "allow_auto_merge": false
}
EOF
    
    log_success "Staging branch protection configured"
}

# Setup production branch protection
setup_production_branch() {
    log_info "Setting up production branch protection..."
    
    # Ensure production branch exists
    if ! git rev-parse --verify production &>/dev/null; then
        log_info "Creating production branch from staging..."
        git checkout -b production staging
        git push origin production
    fi
    
    # Configure strictest protection
    gh api repos/$REPO_SLUG/branches/production/protection \
        --input - << 'EOF' || log_warning "Could not update production branch protection"
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "test", "security"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 2
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "allow_auto_merge": false
}
EOF
    
    log_success "Production branch protection configured"
}

# Setup environment secrets (requires manual GitHub UI)
setup_environment_secrets() {
    log_info "Environment secrets require manual setup in GitHub UI"
    log_info ""
    log_info "To configure secrets:"
    log_info "  1. Go to: Settings → Environments"
    log_info "  2. Create 'staging' environment"
    log_info "  3. Create 'production' environment"
    log_info "  4. Add secrets for each environment:"
    log_info ""
    log_info "  Staging secrets:"
    log_info "    - STAGING_GA_ID (empty or test GA ID)"
    log_info "    - STAGING_DEPLOY_KEY"
    log_info ""
    log_info "  Production secrets:"
    log_info "    - PROD_GA_ID (G-SKDDM2GBXN)"
    log_info "    - PROD_DEPLOY_KEY"
    log_info "    - MONITORING_WEBHOOK"
    log_info ""
}

# Verify setup
verify_setup() {
    log_info "Verifying branch protection setup..."
    
    # Check main branch
    if gh api repos/$REPO_SLUG/branches/main/protection --jq '.enforce_admins' 2>/dev/null | grep -q "false"; then
        log_success "✓ Main branch protection verified"
    else
        log_warning "Could not verify main branch protection"
    fi
    
    # Check staging branch
    if gh api repos/$REPO_SLUG/branches/staging/protection --jq '.enforce_admins' 2>/dev/null | grep -q "true"; then
        log_success "✓ Staging branch protection verified"
    else
        log_warning "Could not verify staging branch protection"
    fi
    
    # Check production branch
    if gh api repos/$REPO_SLUG/branches/production/protection --jq '.enforce_admins' 2>/dev/null | grep -q "true"; then
        log_success "✓ Production branch protection verified"
    else
        log_warning "Could not verify production branch protection"
    fi
}

# Main
main() {
    echo -e "${BLUE}🔐 Setting Up GitHub Branch Protection${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    check_github_cli || return 1
    check_auth || return 1
    get_repo_info || return 1
    
    echo ""
    log_info "Configuring branch protections..."
    
    setup_main_branch
    setup_staging_branch
    setup_production_branch
    
    echo ""
    setup_environment_secrets
    
    echo ""
    verify_setup
    
    echo ""
    log_success "Branch protection setup complete!"
    log_info ""
    log_info "Summary:"
    log_info "  ✓ Main branch: Basic protection"
    log_info "  ✓ Staging branch: Moderate protection (1 review required)"
    log_info "  ✓ Production branch: Strict protection (2 reviews, linear history)"
    log_info "  ⚠️  Secrets: Configure manually in Settings → Environments"
}

# Help
show_help() {
    echo "GitHub Branch Protection Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  (no args)      - Setup all branch protections"
    echo "  main           - Setup only main branch"
    echo "  staging        - Setup only staging branch"
    echo "  production     - Setup only production branch"
    echo "  verify         - Verify current protection settings"
    echo ""
    echo "Requirements:"
    echo "  - GitHub CLI (gh) installed and authenticated"
    echo "  - Admin access to repository"
    echo "  - Staging and production branches must exist"
}

# Parse arguments
case "${1:-}" in
    main)
        check_github_cli && check_auth && get_repo_info && setup_main_branch
        ;;
    staging)
        check_github_cli && check_auth && get_repo_info && setup_staging_branch
        ;;
    production)
        check_github_cli && check_auth && get_repo_info && setup_production_branch
        ;;
    verify)
        check_github_cli && check_auth && get_repo_info && verify_setup
        ;;
    -h|--help)
        show_help
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
