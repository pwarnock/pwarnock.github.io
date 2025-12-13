# Justfile for Peter Warnock's Hugo Site
# Task runner for common development, testing, and deployment workflows
# Now includes @pwarnock/liaison integration for intelligent agent workflows

# Default recipe
default:
    @just --list

# Quick agent setup (liaison + skills)
agent-setup:
    @echo "🤖 Setting up complete agent environment..."
    @just liaison-init
    @just skills-sync
    @just agent-init
    @echo "✅ Agent environment ready!"

# ==============================================================================
# DEVELOPMENT
# ==============================================================================

# Start development server
dev:
    bun run dev

# Start development server with specific port
dev-port port:
    bun run dev --port={{port}}

# Initialize agent environment
agent-init:
    ./scripts/agent-init.sh

# Generate version information
version-generate:
    bun run generate-version

# ==============================================================================
# BUILDING
# ==============================================================================

# Build for production
build:
    bun run build

# Auto-detect optimal build strategy
build-path:
    bun run build:path

# Fast content build (~30s)
build-content:
    bun run build:content

# Comprehensive infrastructure testing (~5min)
build-infra:
    bun run build:infra

# ==============================================================================
# TESTING & VALIDATION
# ==============================================================================

# Run all validation (content, links, portfolio, security)
validate:
    bun run validate

# Run all tests
test:
    bun run test

# Run unit tests (Go + TypeScript)
test-unit:
    bun run test:unit

# Run Go unit tests
test-unit-go:
    cd test && go test -v ./support/...

# Run TypeScript unit tests
test-unit-ts:
    bun run test:unit:ts

# Run end-to-end tests
test-e2e:
    bun run test:e2e

# Run visual regression tests
test-visual:
    bun run test:visual

# Run deployment validation tests
test-deployment:
    bun run test:deployment

# Generate coverage reports
test-coverage:
    bun run test:coverage

# Watch mode for all tests
test-watch:
    bun run test:watch

# Watch mode for E2E tests
test-e2e-watch:
    bun run test:e2e:watch

# Watch mode for unit tests
test-unit-watch:
    bun run test:unit:watch

# ==============================================================================
# CODE QUALITY
# ==============================================================================

# Run all linters (YAML, TOML, CSS)
lint:
    bun run lint

# Format code with Prettier
format:
    bun run format

# Check formatting without changes
format-check:
    bun run format:check

# ==============================================================================
# AI AGENTS & SKILLS
# ==============================================================================

# Sync .skills content from Letta AI repository
skills-sync:
    ./scripts/skills-sync.sh

# Check .skills status
skills-status:
    ./scripts/skills-sync.sh --status

# Force refresh .skills content
skills-force:
    ./scripts/skills-sync.sh --force

# Clean up .skills directory
skills-cleanup:
    ./scripts/skills-sync.sh --cleanup

# Full agent initialization with skills
agent-full: agent-init skills-sync

# ==============================================================================
# LIAISON INTEGRATION
# ==============================================================================

# Liaison CLI - Show all commands
liaison:
    bun liaison --help

# Liaison - Initialize project
liaison-init:
    bun liaison init

# Liaison - Check project status
liaison-status:
    bun liaison status

# Liaison - Plan features
liaison-plan:
    /cody plan

# Liaison - Build features
liaison-build:
    /cody build

# Liaison - Refresh project state
liaison-refresh:
    /cody refresh

# Liaison - List plugins
liaison-plugins:
    bun liaison plugin list

# Liaison - Health check
liaison-health:
    bun liaison health

# Liaison - Start service
liaison-start:
    bun liaison start

# Liaison - Sync project
liaison-sync:
    bun liaison sync

# Full Liaison workflow
liaison-full: liaison-plan liaison-build liaison-refresh

# Liaison + Skills workflow (complete agent setup)
agent-complete: liaison-init skills-sync agent-init

# Liaison project diagnostics
liaison-check: liaison-health liaison-status

# ==============================================================================
# DEPLOYMENT
# ==============================================================================

# Switch to staging environment
env-staging:
    bun run env:staging

# Switch to production environment
env-production:
    bun run env:production

# Switch to main environment
env-main:
    bun run env:main

# Deploy to staging
deploy-staging:
    bun run deploy:staging

# Deploy to production
deploy-production:
    bun run deploy:production

# Sync environment configurations
sync-env:
    bun run sync:env

# ==============================================================================
# DEGIT & TEMPLATES
# ==============================================================================

# Refresh all templates using degit
degit-refresh:
    ./scripts/degit-refresh.sh

# Refresh templates without backup
degit-force:
    ./scripts/degit-refresh.sh --no-backup

# ==============================================================================
# BEADS (ISSUE TRACKING)
# ==============================================================================

# Show ready work (unblocked issues)
bd-ready:
    bd --no-daemon ready --json

# Create new issue
bd-create title type="task" priority="2":
    bd --no-daemon create {{title}} -t {{type}} -p {{priority}} --json

# Update issue status
bd-update issue_id status="in_progress":
    bd --no-daemon update {{issue_id}} --status {{status}} --json

# Complete issue
bd-close issue_id reason="Done":
    bd --no-daemon close {{issue_id}} --reason {{reason}} --json

# Run Beads health check
bd-doctor:
    bd --no-daemon doctor

# Clean up old issues
bd-cleanup days="2":
    bd --no-daemon cleanup --days {{days}}

# ==============================================================================
# WORKTREES
# ==============================================================================

# Start worktree development
worktree-start branch port:
    bun run dev:worktree start {{branch}} {{port}}

# Test worktree
worktree-test branch test_type="e2e":
    bun run test:worktree test {{branch}} {{test_type}}

# Simple worktree development
worktree-simple branch port:
    bun run worktree-simple start {{branch}} {{port}}

# ==============================================================================
# UTILITIES
# ==============================================================================

# Check Git status
git-status:
    @git status --porcelain

# Show Git log
git-log:
    @git log --oneline -10

# Check Git remote HEAD
git-head:
    @git symbolic-ref refs/remotes/origin/HEAD

# Show project structure
tree depth="2":
    @tree -L {{depth}} -I 'node_modules|.git|.beads'

# Clean temporary files
clean:
    @find . -name "*.tmp" -o -name "*.temp" -delete 2>/dev/null || true
    @echo "✅ Cleaned temporary files"

# Check available disk space
disk:
    @df -h .

# Show system information
sysinfo:
    @echo "OS: $(uname -s)"
    @echo "Kernel: $(uname -r)"
    @echo "Architecture: $(uname -m)"
    @echo "Shell: $SHELL"
    @echo "User: $(whoami)"
    @echo "Date: $(date)"

# ==============================================================================
# HELPERS & DIAGNOSTICS
# ==============================================================================

# Check Cody Framework health
cody-health:
    ./scripts/check-cody-health.sh

# Backup Cody Framework
cody-backup:
    ./scripts/backup-cody.sh

# Run performance monitor
perf-monitor:
    ./scripts/performance-monitor.sh

# Check security
security-test:
    ./scripts/test-security.js

# Run accessibility test
a11y-test:
    ./scripts/accessibility-test.sh

# Verify CDN integrity
cdn-check:
    ./scripts/verify-cdn-integrity.sh

# ==============================================================================
# RELEASE MANAGEMENT
# ==============================================================================

# Create release request (rc, final, hotfix)
release type="rc":
    ./scripts/release.sh {{type}}

# Prepare release
release-prep:
    ./scripts/release-prep.sh

# Emergency push
emergency-push:
    ./scripts/emergency-push.sh

# ==============================================================================
# COMPLEX WORKFLOWS
# ==============================================================================

# Full development cycle (init, validate, test, build)
dev-cycle:
    just agent-init
    just validate
    just test:unit
    just build:content

# Full deployment pipeline (build, test, deploy)
deploy-pipeline env="staging":
    just build
    just test:deployment
    just deploy:{{env}}

# Content creation workflow
content-create:
    just agent-init
    just skills-sync
    echo "✅ Ready for content creation"

# Agent preparation workflow
agent-prep:
    just agent-init
    just skills-sync
    just cody-health
    echo "✅ Agent environment prepared"
