#!/bin/bash
# Deploy to staging environment with validation

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

echo -e "${BLUE}🚀 Deploying to Staging Environment${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Pre-deployment validation
log_info "Running pre-deployment validation..."
if ./scripts/validate-deployment.sh pre staging; then
    log_success "Pre-deployment validation passed"
else
    log_error "Pre-deployment validation failed"
    exit 1
fi

echo ""
log_info "Switching to staging branch..."
# Ensure we're on staging branch
git checkout staging

# Sync with latest main
log_info "Syncing with latest main branch..."
git fetch upstream
if git rebase upstream/main; then
    log_success "Successfully rebased on upstream/main"
else
    log_error "Rebase conflict detected"
    log_info "To resolve manually:"
    log_info "  git rebase --abort"
    log_info "  git merge upstream/main"
    git rebase --abort
    exit 1
fi

echo ""
log_info "Running path-based build validation..."
# Run staging-specific tests
if ./scripts/path-based-build.sh; then
    log_success "Build validation passed"
else
    log_error "Build validation failed"
    exit 1
fi

echo ""
log_info "Pushing to staging remote..."
# Push to staging remote
if git push staging staging:staging; then
    log_success "Successfully pushed to staging remote"
else
    log_error "Push to staging remote failed"
    exit 1
fi

echo ""
log_info "Waiting for GitHub Pages deployment (2-5 minutes)..."
log_info "Check status at: https://github.com/pwarnock/pwarnock.github.io/deployments"

# Post-deployment validation
sleep 5
log_info "Running post-deployment validation..."
if ./scripts/validate-deployment.sh post staging; then
    log_success "Post-deployment validation passed"
else
    log_warning "Post-deployment validation had warnings"
fi

echo ""
log_success "✨ Staging deployment complete!"
log_info "Next steps:"
log_info "  1. Run full test suite: bun run test:e2e && bun run test:accessibility"
log_info "  2. Verify staging site looks correct"
log_info "  3. If all tests pass: bun run deploy:production"