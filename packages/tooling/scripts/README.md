# Build and Deployment Tooling

This directory contains all build, deployment, and utility scripts organized by function.

## Directory Structure

```
scripts/
├── build/          # Build-related scripts (9 scripts)
├── deploy/         # Deployment scripts (6 scripts)
├── validation/     # Validation and verification scripts (14 scripts)
├── agent/          # Agent-related scripts (2 scripts)
├── worktree/       # Git worktree management scripts (3 scripts)
├── sync/           # Synchronization scripts (2 scripts)
└── utils/          # Other utility scripts (29 scripts)
```

## Categories

### Build Scripts
Scripts related to building, versioning, and releasing the application.

- `analyze-bundles.js` - Analyze webpack bundle sizes
- `bump-version.sh` - Bump version numbers
- `bundle-size-protection.js` - Protect against bundle size regressions
- `generate-version.js` - Generate version information
- `path-based-build.sh` - Path-based incremental builds
- `release-prep.sh` - Prepare for release
- `release.sh` - Execute release process
- `version-dev.sh` - Development version management
- `version-sync.sh` - Synchronize versions across files

### Deploy Scripts
Scripts for deploying to various environments.

- `deploy-production.sh` - Deploy to production
- `deploy-staging.sh` - Deploy to staging
- `emergency-push.sh` - Emergency deployment bypass
- `setup-dynamic-baseurl.sh` - Configure dynamic base URLs
- `setup-environments.sh` - Set up deployment environments
- `sync-environments.sh` - Synchronize between environments

### Validation Scripts
Scripts for validating content, configuration, and deployments.

- `change-validation.sh` - Validate changes before commit
- `check-hardcoded-urls.sh` - Find hardcoded URLs
- `content-validator.cjs` - Validate content structure (CommonJS)
- `content-validator.js` - Validate content structure (ES modules)
- `placeholder-detection.sh` - Detect placeholder content
- `schema-validator.cjs` - Validate against schemas
- `validate-blog-post.sh` - Validate blog post format
- `validate-deployment.sh` - Validate deployment
- `validate-hero-components.sh` - Validate hero components
- `validate-hugo-config.cjs` - Validate Hugo configuration
- `validate-links.sh` - Check for broken links
- `validate-portfolio-frontmatter.js` - Validate portfolio metadata
- `validate.sh` - Main validation script
- `verify-cdn-integrity.sh` - Verify CDN integrity

### Agent Scripts
Scripts for agent initialization and integration.

- `agent-init.sh` - Initialize agent environment
- `pm2-agent-integration.sh` - PM2 process manager integration

### Worktree Scripts
Scripts for managing git worktrees.

- `worktree-dev.sh` - Development worktree setup
- `worktree-simple.sh` - Simple worktree creation
- `worktree-tests.sh` - Test worktree functionality

### Sync Scripts
Scripts for synchronizing data between systems.

- `beads-to-cody.js` - Sync beads to Cody
- `release-notes-generator.js` - Generate release notes

### Utility Scripts
Miscellaneous utility scripts for development and maintenance.

See the `utils/` directory for a comprehensive collection of development tools.

## Backward Compatibility

The root `scripts/` directory contains symlinks to commonly used scripts for backward compatibility with existing workflows and documentation. These symlinks point to the organized structure in `packages/tooling/scripts/`.

Total symlinks: 22

## Usage

Scripts can be run from anywhere in the project:

```bash
# Direct path
./packages/tooling/scripts/build/release.sh

# Via symlink (backward compatible)
./scripts/release.sh

# Via justfile (if configured)
just release
```

## Migration Notes

This structure was created as part of the monorepo migration to organize tooling in a logical, discoverable way. All scripts maintain their original functionality and permissions.

- Total scripts: 65
- All shell scripts are executable
- Symlinks maintain backward compatibility
- No breaking changes to existing workflows
