# Scripts Organization & Reference

Guide to the project's 30+ build, deployment, and utility scripts organized by function.

## Organization

All scripts are in the `scripts/` directory and accessible via `bun run` commands defined in `package.json`.

**Philosophy**: Scripts are organized by purpose, not by tool. Each script should:
- Have a clear, single responsibility
- Support `--help` flag for documentation
- Use consistent error handling (`set -e`, proper exit codes)
- Log output with colored status indicators
- Return meaningful exit codes for CI/CD

---

## Build Scripts

### `scripts/generate-version.js`
**Purpose**: Sync version from `package.json` to `data/version.toml` for site footer  
**Called by**: Runs before every production build  
**Command**: `bun run generate-version`

```bash
# Reads package.json version
# Writes to data/version.toml for Hugo
```

### `scripts/path-based-build.sh`
**Purpose**: Intelligent build system that detects change type and runs appropriate tests  
**Called by**: `bun run build:path`  
**Triggers**: Content vs infrastructure vs documentation builds

```bash
# Analyzes changed files
# Runs appropriate tests based on changes:
# - content/ → Fast rebuild
# - layouts/, assets/, config/ → Full testing
# - docs/ → Validation only
```

See [BUILD_SYSTEM.md](/docs/development/BUILD_SYSTEM.md) for details.

---

## Deployment Scripts

### `scripts/deploy-staging.sh`
**Purpose**: Deploy to staging environment  
**Called by**: `bun run deploy:staging`  
**Target**: `staging` branch on GitHub  
**Steps**:
1. Verify git working directory clean
2. Build site
3. Run pre-deployment validation
4. Push to staging branch
5. Wait for GitHub Actions
6. Run post-deployment tests

### `scripts/deploy-production.sh`
**Purpose**: Deploy to production environment  
**Called by**: `bun run deploy:production`  
**Target**: `production` branch on GitHub  
**Steps**:
1. Verify on `main` branch
2. Verify all tests passing
3. Final verification checks
4. Push to production branch
5. Monitor GitHub Actions deployment
6. Post-deployment health checks

### `scripts/sync-environments.sh`
**Purpose**: Sync environment branches (staging → production)  
**Called by**: `bun run sync:env`  
**Use case**: After testing in staging, promotes to production

```bash
# Brings production branch up to date with staging
# Only if all tests pass in staging
```

---

## Validation & Testing Scripts

### `scripts/validate-deployment.sh`
**Purpose**: Pre and post-deployment validation  
**Called by**: `bun run validate:deployment`  
**Checks**:
- Hugo configuration valid
- CSS processing complete
- Build output structure correct
- Deploy scripts executable
- Environment configs present
- Documentation complete

**Usage**:
```bash
# Pre-deployment check
./scripts/validate-deployment.sh pre staging

# Post-deployment verification
./scripts/validate-deployment.sh post production https://peterwarnock.com
```

### `scripts/validate.sh`
**Purpose**: Comprehensive project validation  
**Called by**: `bun run validate`  
**Runs**:
1. Linting (YAML, TOML, CSS)
2. Blog validation
3. Security checks
4. HTML validation

### `scripts/validate-portfolio-frontmatter.js`
**Purpose**: Validate blog post frontmatter  
**Called by**: `bun run validate:portfolio`  
**Checks**:
- All required fields present (title, date, summary, draft, tags)
- Date format valid (YYYY-MM-DD)
- No draft posts in main branch
- Tags are valid strings

---

## Testing Scripts

### `scripts/run-all-unit-tests.sh`
**Purpose**: Run all unit tests (TypeScript + Go)  
**Called by**: `bun run test:unit`  
**Supports**:
- `--watch` - Watch mode
- `--coverage` - Coverage report
- `--ui` - Vitest UI dashboard

### `scripts/dev-test-runner.sh`
**Purpose**: Watch mode for any test type  
**Called by**: `bun run test:watch`, `bun run test:e2e:watch`, etc.  
**Modes**:
- `--watch e2e` - Watch E2E tests
- `--watch visual` - Watch visual regression
- `--watch performance` - Watch performance tests

### `test/deployment_validation.test.sh`
**Purpose**: 27 comprehensive deployment validation tests  
**Called by**: `bun run test:deployment`  
**Coverage**:
- Script existence and permissions
- Hugo configuration validation
- CSS processing
- Build output structure
- Deployment integration
- Environment configs

### `test/deployment_workflow.integration.sh`
**Purpose**: 14 deployment workflow integration tests  
**Called by**: `bun run test:deployment:integration`  
**Coverage**:
- Environment branch setup
- Git remote configuration
- Environment-specific builds
- CI/CD integration points
- Error handling and rollback

---

## Development Utilities

### `scripts/dev-cycle-start.sh`
**Purpose**: Initialize development session  
**Called by**: `bun run dev:start`  
**Sets up**:
- Dev environment variables
- PM2 processes
- Displays available commands
- Shows active tasks from beads

### `scripts/performance-monitor.sh`
**Purpose**: Monitor build performance metrics  
**Called by**: `bun run perf:monitor`  
**Tracks**:
- Build time
- Bundle size
- Asset compression
- Core Web Vitals

### `scripts/pm2-agent-integration.sh`
**Purpose**: Start PM2 with agent integration  
**Called by**: `bun run dev:agent`  
**For**: AI agent development coordination

---

## Setup & Configuration Scripts

### `scripts/setup-branch-protection.sh`
**Purpose**: Configure GitHub branch protection rules  
**Called by**: `bun run setup:branch-protection`  
**Sets**:
- Require status checks (tests must pass)
- Require code review
- Require branches up to date
- Require commit signing (optional)

### `scripts/letta-config-init.sh`
**Purpose**: Initialize Letta AI configuration  
**Called by**: `bun run letta:config:init`  
**Creates**: `.letta/` configuration for agent setup

### `scripts/letta-config-update.sh`
**Purpose**: Update Letta configuration  
**Called by**: `bun run letta:config:update`  
**Refreshes**: Agent definitions and settings

---

## Maintenance Scripts

### `scripts/agent-init.sh`
**Purpose**: Initialize agent session  
**Checks**:
- Cody Framework updates available
- `.cody` directory health
- Display key guidelines
- Show available tasks from beads

### `scripts/check-cody-health.sh`
**Purpose**: Verify `.cody` directory integrity  
**Checks**:
- Required directories exist
- Critical files present
- No corruption detected

### `scripts/backup-cody.sh`
**Purpose**: Backup `.cody` directory  
**Creates**: Timestamped backup with verification  
**Use**: Before any emergency access to `.cody/`

---

## Specialized Scripts

### `scripts/version-sync.sh`
**Purpose**: Sync version across all files  
**Called by**: `bun run version:sync`  
**Updates**:
- `data/version.toml` (site footer)
- Build metadata
- Release notes

### `scripts/version-dev.sh`
**Purpose**: Set development version  
**Called by**: `bun run version:dev`  
**Sets**: Version to `X.Y.Z-dev` for development builds

### `scripts/release-prep.sh`
**Purpose**: Prepare release  
**Called by**: `bun run release:prep`  
**Steps**:
1. Validate version bumped
2. Verify tests passing
3. Create release notes
4. Prepare git tags

### `scripts/verify-cdn-integrity.sh`
**Purpose**: Verify CDN asset integrity  
**Called by**: `bun run verify:cdn`  
**Checks**:
- CSS/JS files accessible
- No missing assets
- Correct checksums
- Performance acceptable

### `scripts/test-environment.sh`
**Purpose**: Verify environment setup  
**Called by**: `bun run test:environment`  
**Validates**:
- All required tools installed
- Versions correct
- Permissions set properly
- Configurations valid

---

## JavaScript/TypeScript Utilities

### `src/qaCli.ts`
**Purpose**: QA automation CLI  
**Called by**: `bun run qa:auto|content|full`  
**Modes**:
- `qa:auto` - Automated quality checks
- `qa:content` - Content-specific validation
- `qa:full` - Comprehensive audit

### `scripts/analyze-bundles.js`
**Purpose**: Analyze bundle composition  
**Called by**: `bun run analyze:bundles`  
**Output**:
- Size breakdown
- Compression ratios
- Optimization opportunities

### `scripts/test-ga-tracking.js`
**Purpose**: Verify Google Analytics tracking  
**Called by**: `bun run test:ga`  
**Checks**:
- GA tags present
- Events configured
- Tracking codes valid

### `scripts/test-security.js`
**Purpose**: Run security validation  
**Called by**: `bun run test-security`  
**Checks**:
- No hardcoded secrets
- Dependencies audited
- HTTPS enabled
- Headers secure

---

## Script Patterns & Best Practices

### Standard Script Structure

```bash
#!/bin/bash
set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No color

# Help text
show_help() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]
Description: Brief description of what this does

Options:
  --help     Show this help text
  --verbose  Enable verbose output
  --debug    Enable debug output

Examples:
  $(basename "$0")
  $(basename "$0") --verbose

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --help) show_help; exit 0 ;;
    --verbose) VERBOSE=true; shift ;;
    --debug) set -x; shift ;;
    *) echo "Unknown option: $1"; show_help; exit 1 ;;
  esac
done

# Logging
log() { echo -e "${BLUE}ℹ${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*"; exit 1; }

# Main script
log "Starting process..."
# ... implementation ...
success "Process complete"
```

### Error Handling

All scripts should:
```bash
set -e                    # Exit on any error
trap 'error "Failed"' ERR # Clean up on error

# Check prerequisites
command -v hugo > /dev/null || error "Hugo not installed"

# Validate inputs
[[ -z "$VAR" ]] && error "Variable not set"
```

---

## Running Scripts

### Via `bun run`

```bash
# Most common way - provides nice output
bun run <script-name>

# Examples
bun run build:path
bun run test:unit
bun run deploy:staging
```

### Direct Execution

```bash
# Run script directly
./scripts/validate-deployment.sh pre staging

# Make sure script is executable
chmod +x scripts/my-script.sh
```

### With Environment Variables

```bash
# Set env for script execution
DEBUG=true bun run validate
VERBOSE=true ./scripts/deploy-staging.sh
```

---

## Adding New Scripts

### Checklist

- [ ] Script has single, clear responsibility
- [ ] Placed in appropriate subdirectory (build/, deploy/, test/, dev/, setup/)
- [ ] Includes `--help` flag with usage
- [ ] Uses consistent logging (GREEN, RED, YELLOW, BLUE)
- [ ] Has `set -e` for error handling
- [ ] Returns proper exit codes (0=success, 1=error)
- [ ] Added to `package.json` scripts section
- [ ] Documented in this file

### Template

```bash
#!/bin/bash
set -e

# Script documentation in package.json
# "my-script": "bash scripts/[category]/my-script.sh --help"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
  cat << EOF
Usage: my-script.sh [OPTIONS]
Does something specific and important

Options:
  --help     Show this help
  --debug    Enable debug output
EOF
}

[[ "$1" == "--help" ]] && { show_help; exit 0; }
[[ "$1" == "--debug" ]] && set -x

success() { echo -e "${GREEN}✓${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*"; exit 1; }

success "Script executed successfully"
```

---

## Troubleshooting Scripts

### Script Not Found

```bash
# Add to package.json scripts section
"my-script": "bash scripts/my-script.sh"

# Then run
bun run my-script
```

### Permission Denied

```bash
# Make script executable
chmod +x scripts/my-script.sh

# Or run with bash explicitly
bash scripts/my-script.sh
```

### Script Fails with Error

```bash
# Run with debug output
DEBUG=true bun run my-script

# Or with bash debug mode
bash -x scripts/my-script.sh

# Check exit code
bun run my-script; echo $?  # 0=success, 1=error
```

---

## See Also

- [BUILD_SYSTEM.md](/docs/development/BUILD_SYSTEM.md) - Build process and optimization
- [TESTING_ARCHITECTURE.md](/docs/development/TESTING_ARCHITECTURE.md) - Test scripts and coverage
- [RELEASE_WORKFLOW.md](/docs/operations/RELEASE_WORKFLOW.md) - Release scripts and process
- [package.json](/package.json) - All `bun run` commands mapped to scripts
