#!/bin/bash

# Setup pseudo upstream remotes for staging and production environments
# Creates logical separation between environments while using same physical repo

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

# Configuration
MAIN_REPO="https://github.com/pwarnock/pwarnock.github.io.git"
STAGING_REMOTE="staging"
PRODUCTION_REMOTE="production"

# Check if remotes already exist
check_existing_remotes() {
    log_info "Checking existing remotes..."
    
    local remotes=$(git remote)
    
    if echo "$remotes" | grep -q "$STAGING_REMOTE"; then
        log_warning "Staging remote already exists"
        return 1
    fi
    
    if echo "$remotes" | grep -q "$PRODUCTION_REMOTE"; then
        log_warning "Production remote already exists"
        return 1
    fi
    
    return 0
}

# Create pseudo upstream remotes
create_remotes() {
    log_info "Creating pseudo upstream remotes..."
    
    # Create staging remote (points to same repo but used for staging workflow)
    git remote add "$STAGING_REMOTE" "$MAIN_REPO"
    log_success "Added $STAGING_REMOTE remote"
    
    # Create production remote (points to same repo but used for production workflow)
    git remote add "$PRODUCTION_REMOTE" "$MAIN_REPO"
    log_success "Added $PRODUCTION_REMOTE remote"
    
    # Fetch from new remotes
    log_info "Fetching from new remotes..."
    git fetch "$STAGING_REMOTE"
    git fetch "$PRODUCTION_REMOTE"
    
    log_success "All remotes configured and fetched"
}

# Create environment-specific branches
create_branches() {
    log_info "Setting up environment-specific branches..."
    
    # Create staging branch if it doesn't exist
    if ! git show-ref --verify --quiet refs/heads/staging; then
        git checkout -b staging main
        log_success "Created staging branch from main"
        git checkout main
    else
        log_info "Staging branch already exists"
    fi
    
    # Create production branch if it doesn't exist
    if ! git show-ref --verify --quiet refs/heads/production; then
        git checkout -b production main
        log_success "Created production branch from main"
        git checkout main
    else
        log_info "Production branch already exists"
    fi
}

# Setup branch protection rules (documentation)
setup_protection() {
    log_info "Setting up branch protection documentation..."
    
    cat > .github/BRANCH_PROTECTION.md << 'EOF'
# Branch Protection Strategy

## Environment Branches

### Main Branch
- **Purpose:** Development integration
- **Protection:** 
  - Require PR reviews
  - Require status checks to pass
  - Include administrators

### Staging Branch
- **Purpose:** Pre-production testing
- **Protection:**
  - Require PR reviews from main
  - Require all status checks
  - Restrict force pushes

### Production Branch
- **Purpose:** Production deployment
- **Protection:**
  - Require PR reviews from staging
  - Require all status checks
  - Restrict force pushes
  - Require linear history

## Workflow

1. **Development** → main branch
2. **Staging** → staging branch (PR from main)
3. **Production** → production branch (PR from staging)

## Remote Usage

```bash
# Push to staging environment
git push staging staging:staging

# Push to production environment
git push production production:production

# Sync with main
git fetch upstream && git rebase upstream/main
```
EOF
    
    log_success "Created branch protection documentation"
}

# Create deployment scripts
create_deployment_scripts() {
    log_info "Creating deployment scripts..."
    
    # Staging deployment script
    cat > scripts/deploy-staging.sh << 'EOF'
#!/bin/bash
# Deploy to staging environment

set -e

echo "🚀 Deploying to staging..."

# Ensure we're on staging branch
git checkout staging

# Sync with latest main
git fetch upstream
git rebase upstream/main

# Run staging-specific tests
./scripts/path-based-build.sh

# Push to staging remote
git push staging staging:staging

echo "✅ Staging deployment complete"
EOF

    # Production deployment script
    cat > scripts/deploy-production.sh << 'EOF'
#!/bin/bash
# Deploy to production environment

set -e

echo "🚀 Deploying to production..."

# Ensure we're on production branch
git checkout production

# Sync with latest staging
git fetch staging
git rebase staging/staging

# Run production-specific tests
./scripts/path-based-build.sh

# Push to production remote
git push production production:production

echo "✅ Production deployment complete"
EOF

    # Environment sync script
    cat > scripts/sync-environments.sh << 'EOF'
#!/bin/bash
# Sync environment branches

set -e

echo "🔄 Syncing environment branches..."

# Fetch all remotes
git fetch --all

# Update staging from main
git checkout staging
git rebase upstream/main

# Update production from staging
git checkout production
git rebase staging/staging

# Return to main
git checkout main

echo "✅ Environment sync complete"
EOF

    # Make scripts executable
    chmod +x scripts/deploy-staging.sh
    chmod +x scripts/deploy-production.sh
    chmod +x scripts/sync-environments.sh
    
    log_success "Created deployment scripts"
}

# Create environment configuration
create_env_config() {
    log_info "Creating environment configuration..."
    
    cat > config/environments.toml << 'EOF'
# Environment Configuration

[environments.staging]
name = "staging"
domain = "staging.pwarnock.github.io"
build_command = "hugo --gc --minify --environment staging"
deploy_remote = "staging"
deploy_branch = "staging"
auto_deploy = true

[environments.production]
name = "production"
domain = "pwarnock.github.io"
build_command = "hugo --gc --minify --environment production"
deploy_remote = "production"
deploy_branch = "production"
auto_deploy = false

[environments.development]
name = "development"
domain = "localhost:1313"
build_command = "hugo server --buildDrafts --buildFuture"
deploy_remote = "upstream"
deploy_branch = "main"
auto_deploy = false
EOF
    
    log_success "Created environment configuration"
}

# Update package.json with environment scripts
update_package_json() {
    log_info "Updating package.json with environment scripts..."
    
    # Add new scripts to package.json
    bun pkg set scripts.deploy:staging="./scripts/deploy-staging.sh"
    bun pkg set scripts.deploy:production="./scripts/deploy-production.sh"
    bun pkg set scripts.sync:env="./scripts/sync-environments.sh"
    bun pkg set scripts.env:staging="git checkout staging"
    bun pkg set scripts.env:production="git checkout production"
    bun pkg set scripts.env:main="git checkout main"
    
    log_success "Updated package.json with environment scripts"
}

# Show status
show_status() {
    log_info "Environment setup status:"
    echo ""
    
    echo "📋 Remotes:"
    git remote -v | grep -E "(staging|production)"
    echo ""
    
    echo "🌿 Branches:"
    git branch | grep -E "(staging|production)" || echo "  No environment branches found"
    echo ""
    
    echo "📜 Available Commands:"
    echo "  bun run deploy:staging     - Deploy to staging"
    echo "  bun run deploy:production  - Deploy to production"
    echo "  bun run sync:env          - Sync all environments"
    echo "  bun run env:staging        - Switch to staging environment"
    echo "  bun run env:production     - Switch to production environment"
    echo "  bun run env:main           - Switch to main development"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Setting Up Pseudo Upstream Remotes${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo ""
    
    # Check if remotes already exist
    if check_existing_remotes; then
        create_remotes
        create_branches
        setup_protection
        create_deployment_scripts
        create_env_config
        update_package_json
        
        echo ""
        log_success "Environment setup complete!"
        show_status
    else
        log_warning "Remotes already configured"
        show_status
        
        echo ""
        log_info "To reset and reconfigure:"
        echo "  git remote remove staging"
        echo "  git remote remove production"
        echo "  git branch -D staging production"
        echo "  ./scripts/setup-environments.sh"
    fi
}

# Help function
show_help() {
    echo "Pseudo Upstream Remotes Setup"
    echo ""
    echo "This script sets up environment-specific remotes and branches"
    echo "for safe deployment workflows."
    echo ""
    echo "Creates:"
    echo "  - staging remote (points to main repo)"
    echo "  - production remote (points to main repo)"
    echo "  - staging branch (for pre-production testing)"
    echo "  - production branch (for production deployment)"
    echo "  - Deployment scripts"
    echo "  - Environment configuration"
    echo ""
    echo "Usage: $0"
}

# Parse arguments
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"