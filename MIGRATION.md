# Monorepo Migration Guide

This document describes the migration from single-package structure to bun workspaces monorepo with mise tool management.

## Migration Overview

**Branch**: `monorepo-migration`
**Date**: 2026-01-24
**Phases**: 0-9 (completed)
**Commits**: 10 incremental commits with rollback checkpoints

## What Changed

### Architecture

**Before**: Single package with all code in root `src/`, `scripts/`, Hugo files at root
**After**: Bun workspaces monorepo with packages separated by concern

### Tool Management

**Before**: Manual tool installation (Hugo, Bun, Go, just)
**After**: mise-managed tool versions locked in `.mise.toml`

### Directory Structure

```diff
- src/                          # All TypeScript code
-   ├── agents/                 # Content generation
-   ├── utils/                  # Shared utilities
-   └── qa*.ts                  # QA tooling
- scripts/                      # All scripts
- hugo.toml                     # Hugo config at root
- content/                      # Site content at root

+ packages/
+   ├── site/                   # Hugo site + frontend
+   │   ├── hugo.toml          # Hugo config moved here
+   │   ├── content/           # Site content moved here
+   │   ├── layouts/
+   │   ├── static/
+   │   └── assets/
+   ├── agents/                 # @pwarnock/agents
+   │   └── src/               # From src/agents/
+   ├── qa-tools/               # @pwarnock/qa-tools
+   │   └── src/               # From src/qa*.ts
+   └── tooling/                # @pwarnock/tooling
+       └── scripts/            # From scripts/
+ shared/                       # @pwarnock/shared
+   └── src/                    # From src/utils/
+ scripts/                      # Symlinks for backward compatibility
```

### Import Paths

**Before:**
```typescript
import { validation } from '../utils/validation.js';
import { blogAgent } from './agents/blog-agent.js';
```

**After:**
```typescript
import { validation } from '@pwarnock/shared/utils';
import { blogAgent } from '@pwarnock/agents';
```

### Commands

**Before:**
```bash
hugo server              # Dev server
hugo --gc --minify       # Build
bun test                 # Tests
```

**After:**
```bash
mise install             # Install all tools
just dev                 # Dev server (or: bun run dev)
just build               # Build (or: bun run build)
just test-all            # All tests
bun pm ls               # List workspaces
```

## Migration Phases

### Phase 0: Tool Version Management (Commit 1)
- Created `.mise.toml` with Hugo 0.154.5, Go 1.25, Bun 1.3.6, just 1.46.0
- Added `mise-check` and `mise-sync` to justfile
- **Rollback**: `git reset --hard HEAD~1`

### Phase 1: Workspace Structure (Commit 2)
- Updated root `package.json` with `workspaces: ["packages/*", "shared"]`
- Created workspace directories and placeholder `package.json` files
- **Rollback**: `git reset --hard HEAD~2`

### Phase 2: Shared Code Migration (Commit 3)
- Moved `src/utils/` → `shared/src/utils/`
- Created shared exports in `shared/src/index.ts`
- **Rollback**: `git reset --hard HEAD~3`

### Phase 3-5: Package Migrations (Commit 4)
- Moved agents: `src/agents/` → `packages/agents/src/`
- Moved QA tools: `src/qa*.ts` → `packages/qa-tools/src/`
- Moved scripts: `scripts/` → `packages/tooling/scripts/` with backward-compatible symlinks
- Updated all imports to use `@pwarnock/*` workspace names
- **Rollback**: `git reset --hard HEAD~4`

### Phase 6: Hugo Site Migration (Commit 5)
- Moved Hugo files to `packages/site/`: `hugo.toml`, `content/`, `layouts/`, `static/`, `assets/`
- Updated validation scripts to use git root: `git rev-parse --show-toplevel`
- Updated `lychee.toml` to point to `packages/site/public`
- **Rollback**: `git reset --hard HEAD~5`

### Phase 7: Test Configuration (Commit 6)
- Updated `vitest.config.ts` to include all workspaces
- Updated `playwright.config.ts` to use `packages/site/public`
- Added workspace test commands to justfile
- **Rollback**: `git reset --hard HEAD~6`

### Phase 8: CI/CD Updates (Commit 7)
- Added mise-action to all GitHub Actions workflows
- Updated public directory paths from `./public` to `./packages/site/public`
- Updated artifact upload/download paths
- **Rollback**: `git reset --hard HEAD~7`

### Phase 9: Documentation and Cleanup (Current)
- Updated README.md with monorepo structure
- Created MIGRATION.md (this file)
- Updated .gitignore for workspace artifacts
- **Rollback**: `git reset --hard HEAD~8`

## Rollback Procedures

### Rollback to Before Migration

```bash
# Find the commit hash before Phase 0
git log --oneline | grep "feat: implement mobile-first responsive design refinement"

# Reset to that commit
git reset --hard f8cc811

# Reinstall dependencies
bun install

# Verify everything works
just build
just test-all
```

### Partial Rollback (Phase-by-Phase)

```bash
# Rollback to specific phase (example: after Phase 6)
git reset --hard HEAD~2  # Undo Phase 9 and Phase 8

# Clean workspace artifacts
rm -rf packages/*/node_modules packages/*/dist shared/dist

# Reinstall dependencies
bun install

# Verify
just build
```

### Full Clean Reinstall

```bash
# If anything is broken, start fresh
rm -rf node_modules packages/*/node_modules shared/node_modules
rm -rf packages/*/dist shared/dist
rm -rf packages/site/public

# Reinstall
bun install

# Rebuild
just build
```

## Verification Checklist

After migration (or rollback), verify all systems:

- [ ] `mise doctor` - All tools installed correctly
- [ ] `mise current` - Correct versions active
- [ ] `bun pm ls` - All workspaces recognized
- [ ] `just build` - Production build succeeds
- [ ] `just test-all` - All tests pass (Go + TypeScript + E2E)
- [ ] `just dev` - Development server works
- [ ] `just validate` - Validation checks pass (links, portfolio, security)
- [ ] Pre-commit hooks work (try committing a test file)
- [ ] CI/CD workflows pass (check GitHub Actions)

## Benefits of Monorepo Structure

1. **Reproducible Builds**: mise locks tool versions across all machines
2. **Better Organization**: Clear separation of concerns (site, agents, qa-tools, tooling)
3. **Dependency Isolation**: Each workspace has only needed dependencies
4. **Shared Code**: Common utilities in `shared/` workspace
5. **Fast Installs**: Bun workspace hoisting reduces duplication
6. **Preserved Workflow**: justfile still works, no team retraining required
7. **Multi-Ecosystem**: Hugo (Go), TypeScript, shell scripts all managed together

## Common Issues and Solutions

### Issue: "Hugo not found"
**Solution**: Run `mise install hugo@0.154.5`

### Issue: "Workspace not found"
**Solution**: Run `bun install` to sync workspace links

### Issue: "Import path errors"
**Solution**: Check that imports use `@pwarnock/*` workspace names, not relative paths across workspaces

### Issue: "Pre-commit hooks fail"
**Solution**: Ensure scripts use `git rev-parse --show-toplevel` for path resolution

### Issue: "Tests fail after migration"
**Solution**: Check that test configs point to correct workspace paths (vitest.config.ts, playwright.config.ts)

### Issue: "CI/CD fails"
**Solution**: Ensure workflows have mise-action setup and use `packages/site/public` paths

## Migration Statistics

- **Total Commits**: 10
- **Files Modified**: ~150
- **TypeScript Files Migrated**: 48
- **Scripts Migrated**: 65
- **Symlinks Created**: 23
- **Tests Passing**: 469/475 (99%)
- **Test Failures**: 6 pre-existing (not introduced by migration)
- **Build Time**: ~30s (unchanged)
- **Install Time**: ~5s with mise cache

## Future Improvements

1. **Incremental Builds**: Add turbo or nx for smart caching
2. **Workspace Scripts**: Consolidate duplicate scripts across workspaces
3. **Test Isolation**: Move tests into respective workspaces
4. **Documentation Site**: Generate docs from workspace structure
5. **Dependency Analysis**: Add tools to visualize workspace dependencies

## Contact

For questions about the migration:
- GitHub: [@pwarnock](https://github.com/pwarnock)
- Email: github@peterwarnock.com

---

**Last Updated**: 2026-01-24
**Migration Branch**: `monorepo-migration`
**Status**: ✅ Complete
