# Cody Framework Release Process

This document describes the professional release workflow for this project using the Cody Framework.

## Overview

The Cody Framework provides a structured approach to version management, issue tracking, and releases:

1. **Planning Phase** (`:cody plan`) - Discover requirements, create PRD
2. **Building Phase** (`:cody build`) - Create feature backlog and versions
3. **Version Development** (`:cody version build`) - Implement features and conclude with retrospective
4. **Release** - Tag version and create GitHub release
5. **Refresh** (`:cody refresh update`) - Update project documents

## Release Workflow

### Step 1: Start Build Phase

When ready to plan the next version cycle:

```bash
:cody build
```

This creates the feature backlog from your planning documents.

### Step 2: Create and Build Versions

To work on a specific version:

```bash
:cody version build
```

This will:
- Ask which version to build from the feature backlog
- Create version folder with design.md and tasklist.md
- Guide you through implementation

### Step 3: Implement Features

Follow the tasklist and implement features. **Critical process**:

1. **Before each commit**: Run validation
   ```bash
   npm run lint        # Linting
   npm run validate    # Validation
   npm run build       # Build verification
   ```

2. **Commit to git** with clear commit messages
3. **No direct commits to main** - All changes via PR

### Step 4: Conclude Version

When all tasks are completed:

1. **Create Retrospective** - Copy `.cody/config/templates/build/version/retrospective.md` and document:
   - What went well
   - Challenges encountered
   - Key learnings
   - Metrics

2. **Update Feature Backlog** - Mark version as `🟢 Completed`

3. **Create/Update Release Notes** - Document changes in `.cody/project/build/release-notes.md`

4. **Tag Release**
   ```bash
   git tag -a vX.X.X -m "Release vX.X.X: [Description]"
   ```

5. **Create GitHub Release**
   ```bash
   gh release create vX.X.X --title "vX.X.X - [Name]" --notes-file RELEASE_NOTES_vX.X.X.md
   ```

### Step 5: Refresh Project Documents

After completing a version:

```bash
:cody refresh update
```

This updates project documentation based on changes implemented.

## Issue Tracking: Using `bd` (beads)

**Important**: This project uses `bd` (beads) for issue tracking, NOT TodoWrite.

### bd Commands

```bash
# Check ready work
bd ready --json

# Create issue
bd create "Issue title" -t bug|feature|task|epic|chore -p 0-4 --json

# Update issue status
bd update bd-123 --status in_progress --json

# Link discovered work
bd create "Found bug" -p 1 --deps discovered-from:bd-456 --json

# Close issue
bd close bd-123 --reason "Completed" --json
```

### Priority Levels
- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Issue Types
- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

## Version Naming Convention

Versions follow semantic versioning with descriptive names:

```
v[major.minor.patch]-[descriptive-name]
```

Examples:
- `v0.10.0-spacing-scale` (feature branch during development)
- `v0.10.0` (production release - NO feature name)

**Important**: Feature branch names should NOT leak to production version strings.

## Pre-Release Checklist

Before creating a GitHub release:

- [ ] All features implemented and tested
- [ ] `npm run lint` passes
- [ ] `npm run validate` passes
- [ ] `npm run build` succeeds
- [ ] Retrospective created and documented
- [ ] Feature backlog marked as completed
- [ ] Release notes updated with changes
- [ ] Git tag created
- [ ] Commit history is clean

## Release Guardrails

✅ **DO:**
- Use PR-based workflow (release branch → PR → review → merge)
- Run pre-commit validation (lint, validate, build)
- Create retrospectives documenting learnings
- Update feature backlog after completing versions
- Use `bd` for issue tracking

❌ **DON'T:**
- Commit directly to main
- Skip validation steps
- Use feature branch names in production versions
- Use TodoWrite for tracking (use `bd` instead)
- Merge PRs without GitHub Actions passing

## Continuous Improvement

After each release:

1. **Review Retrospective** - What worked? What didn't?
2. **Update Process** - Document any improvements
3. **Train Team** - Share learnings with team members
4. **Refine Workflow** - Adjust process based on experience

## Next Release (v0.11.0)

When ready to start v0.11.0:

1. Ensure feature backlog is updated with new features
2. Run `:cody build` (if not already done)
3. Run `:cody version build` and select v0.11.0
4. Follow the workflow above

---

**Last Updated**: October 30, 2025 (v0.10.0 closure)  
**Framework**: Cody Framework v1  
**Status**: Professional multi-version workflow established
