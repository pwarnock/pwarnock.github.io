#!/bin/bash
# Deploy to production environment with validation

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

echo -e "${BLUE}🚀 Deploying to Production Environment${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Pre-deployment validation for production
log_info "Running pre-deployment validation for production..."
if ./scripts/validate-deployment.sh pre production; then
    log_success "Pre-deployment validation passed"
else
    log_error "Pre-deployment validation failed"
    exit 1
fi

echo ""
log_info "Switching to production branch..."
# Ensure we're on production branch
git checkout production

# Sync with latest staging
log_info "Syncing with latest staging branch..."
git fetch staging
if git rebase staging/staging; then
    log_success "Successfully rebased on staging/staging"
else
    log_error "Rebase conflict detected"
    log_info "To resolve manually:"
    log_info "  git rebase --abort"
    log_info "  git merge staging/staging"
    git rebase --abort
    exit 1
fi

echo ""
log_info "Running production build validation..."
# Run production-specific tests
if ./scripts/path-based-build.sh; then
    log_success "Build validation passed"
else
    log_error "Build validation failed"
    exit 1
fi

echo ""
log_warning "⚠️  About to push to PRODUCTION. This will deploy to peterwarnock.com"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_error "Production deployment cancelled"
    exit 1
fi

echo ""
log_info "Pushing to production remote..."
# Push to production remote
if git push production production:production; then
    log_success "Successfully pushed to production remote"
else
    log_error "Push to production remote failed"
    exit 1
fi

echo ""
log_info "GitHub Actions workflow triggered..."
log_info "Check deployment status at: https://github.com/pwarnock/pwarnock.github.io/deployments"
log_info "Check workflow run at: https://github.com/pwarnock/pwarnock.github.io/actions"

# Post-deployment validation
sleep 10
log_info "Running post-deployment validation..."
if ./scripts/validate-deployment.sh post production https://peterwarnock.com; then
    log_success "Post-deployment validation passed"
else
    log_warning "Post-deployment validation had warnings"
fi

echo ""
log_success "✨ Production deployment initiated!"
log_info "Site will be live in 2-5 minutes"
log_info "Monitoring checklist:"
log_info "  ✓ Check: https://peterwarnock.com (should load)"
log_info "  ✓ Verify footer version matches expected"
log_info "  ✓ Check browser console for errors"
log_info "  ✓ Verify analytics tracking enabled"
log_info "  ✓ Test theme switcher"
log_info "  ✓ Test mobile menu"

echo ""
log_warning "If there are critical issues, rollback to previous version:"
log_info "  git push production <previous-hash>:production"