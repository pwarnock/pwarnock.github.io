# Release Workflow Setup Guide

**Status**: Phase 0-1 Implementation Complete  
**Last Updated**: 2025-11-25

## Overview

This document explains how to configure and use the self-enforcing release
process for v0.21.0+.

The release process consists of two components:

1. **Local Client**: `scripts/release.sh` - creates release requests
2. **CI Controller**: `.github/workflows/release-controller.yml` - processes
   releases automatically

## GitHub Actions Variables Setup

Before using the release workflow, configure these repository variables in
GitHub:

### Required Variables

#### `SITE_CNAME`

- **Description**: Custom domain for GitHub Pages deployment
- **Example Value**: `peterwarnock.com`
- **Used By**: `.github/workflows/release-controller.yml` (deploy-site job)

#### `SITE_URL`

- **Description**: Full URL of deployed site
- **Example Value**: `https://peterwarnock.com`
- **Used By**: `.github/workflows/release-controller.yml` (notifications)

#### `BOT_NAME`

- **Description**: Git committer name for release commits
- **Example Value**: `Release Bot` or `github-actions[bot]`
- **Used By**: `.github/workflows/release-controller.yml` (version & status
  commits)

#### `BOT_EMAIL`

- **Description**: Git committer email for release commits
- **Example Value**: `release-bot@users.noreply.github.com`
- **Used By**: `.github/workflows/release-controller.yml` (version & status
  commits)

### Setup Instructions

1. **Navigate to Repository Settings**
   - Go to:
     https://github.com/pwarnock/pwarnock.github.io/settings/variables/actions

2. **Create Each Variable**
   - Click "New repository variable"
   - Enter name and value
   - Click "Add variable"

3. **Verify Variables**
   ```bash
   # Variables are accessible in workflows as:
   ${{ vars.SITE_CNAME }}
   ${{ vars.SITE_URL }}
   ${{ vars.BOT_NAME }}
   ${{ vars.BOT_EMAIL }}
   ```

### Example Configuration

```
SITE_CNAME=peterwarnock.com
SITE_URL=https://peterwarnock.com
BOT_NAME=Release Bot
BOT_EMAIL=release-bot@users.noreply.github.com
```

## Workflow Files

### 1. Release Request Client: `scripts/release.sh`

**Purpose**: Interactive CLI for creating release requests

**Location**: `scripts/release.sh`

**Usage**:

```bash
# Create release candidate for testing
./scripts/release.sh rc --description "Q4 features and bug fixes"

# Promote RC to production
./scripts/release.sh final --bead pw-701

# Emergency hotfix
./scripts/release.sh hotfix --description "Security patch"
```

**What it does**:

1. Validates clean working tree and correct branch
2. Prompts for release description and beads issue ID
3. Creates `.release/request.json` with release intent
4. Commits and pushes to origin
5. Triggers GitHub Actions controller

### 2. Release Controller: `.github/workflows/release-controller.yml`

**Purpose**: Automated CI-driven release processing

**Location**: `.github/workflows/release-controller.yml`

**Trigger**: Push to main with `.release/request.json` changes

**Jobs** (executed in order):

| Job                     | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `validate-request`      | Parse and validate release request JSON  |
| `build-site`            | Build Hugo site and validate HTML        |
| `compute-version`       | Calculate next semantic version          |
| `deploy-site`           | Deploy to GitHub Pages                   |
| `update-version`        | Update package.json and create git tag   |
| `update-request-status` | Mark release request as succeeded/failed |
| `create-github-release` | Create GitHub release notes              |
| `notify`                | Log release summary                      |

## Release Types

### RC (Release Candidate)

- **Purpose**: Pre-release testing and validation
- **Branch**: Any branch (typically from develop)
- **Version**: `X.Y.Z-rc.1`, `X.Y.Z-rc.2`, etc.
- **Deployment**: Staging/testing environment
- **Usage**:
  ```bash
  ./scripts/release.sh rc --description "Testing Q4 features"
  ```

### Final (Production Release)

- **Purpose**: Promote RC to production
- **Branch**: main (recommended)
- **Version**: `X.Y.Z` (semantic version bump)
- **Deployment**: Production
- **Usage**:
  ```bash
  ./scripts/release.sh final --description "Q4 content and features"
  ```

### Hotfix (Emergency Patch)

- **Purpose**: Critical production fix
- **Branch**: hotfix/\* or production
- **Version**: `X.Y.(Z+1)` (patch bump)
- **Deployment**: Production immediately
- **Usage**:
  ```bash
  ./scripts/release.sh hotfix --description "Critical security fix"
  ```

## Version Computation Logic

The release-controller computes the next version based on release type:

```
Current Version: 0.20.1

rc:     0.20.2-rc.1  (or 0.20.2-rc.2 if RC already exists)
final:  0.20.2       (strip pre-release, bump patch)
hotfix: 0.20.2       (bump patch from current)
```

## Release Request Format

The client creates `.release/request.json`:

```json
{
  "type": "final",
  "targetBranch": "main",
  "currentSha": "abc123def456...",
  "requestedBy": "user@example.com",
  "requestedAt": "2025-11-25T12:34:56Z",
  "status": "pending",
  "description": "Q4 content and features",
  "beadId": "pw-701"
}
```

After release, controller updates with:

```json
{
  "status": "succeeded",
  "completedAt": "2025-11-25T12:35:00Z",
  "deployedVersion": "0.20.2"
}
```

## Complete Release Workflow

### Step 1: Create Release Request

```bash
./scripts/release.sh final --description "Q4 updates" --bead pw-701
```

### Step 2: Review & Confirm

Script shows preview of `.release/request.json`:

```json
{
  "type": "final",
  "targetBranch": "main",
  "description": "Q4 updates",
  "beadId": "pw-701",
  ...
}
```

### Step 3: Commit & Push

Script commits `.release/request.json` and pushes to remote:

```
✓ Release request submitted!
Monitor GitHub Actions for build status
```

### Step 4: GitHub Actions Processes

- Validates request
- Builds site
- Computes version (0.20.2)
- Deploys to peterwarnock.com
- Updates package.json → 0.20.2
- Creates git tag v0.20.2
- Updates .release/request.json status
- Creates GitHub release

### Step 5: Verify Deployment

- Check GitHub Actions logs
- Visit https://peterwarnock.com to confirm
- Review GitHub release created

## Monitoring & Troubleshooting

### Check Release Status

```bash
# View most recent release request
cat .release/request.json | jq .

# Check git tags
git tag | tail -5

# View GitHub Actions logs
# https://github.com/pwarnock/pwarnock.github.io/actions
```

### Common Issues

**Issue**: "Working tree has uncommitted changes"

```bash
git status
git add .
git commit -m "work in progress"
```

**Issue**: "Detached HEAD"

```bash
git checkout main
```

**Issue**: Release failed in GitHub Actions

- Check workflow logs: Actions tab
- Fix issue locally
- Create new release request

**Issue**: `.release/request.json` conflicts

- Remove old request: `rm .release/request.json`
- Create new request: `./scripts/release.sh final`

## Security Considerations

### Git Bot Identity

- Release commits are made by `BOT_NAME` / `BOT_EMAIL`
- Prevents impersonation of human developers
- All releases are traceable in git history

### Protected Branches

- main branch should require status checks
- version-consistency check (future) will prevent manual version edits
- Only release-controller bot can bump versions

### Release Auditing

- All releases tracked in `.release/request.json`
- Linked to beads issues for change tracking
- GitHub releases provide additional audit trail

## Next Steps

### Phase 1 (Current)

✅ Release client created  
✅ Release controller workflow created  
⏳ GitHub Actions variables configured (manual step)

### Phase 2: Canonical Version Management

- Make package.json the single source of truth
- Automatic version sync to Hugo metadata
- Version display in site footer

### Phase 3: Enforce Guardrails

- version-consistency.yml workflow
- Block unauthorized version edits
- Update AGENTS.md with mandatory workflow

### Phase 4: Auditing & Cleanup

- orphan-rc-auditor.yml scheduled job
- RC staleness detection
- Beads integration for deployment tracking

## References

- **Implementation**: `.github/workflows/release-controller.yml`
- **Client**: `scripts/release.sh`
- **Architecture**: `docs/architecture/SELF_ENFORCING_RELEASE_PROCESS.md`
- **Beads Integration**: `pw-701` epic
