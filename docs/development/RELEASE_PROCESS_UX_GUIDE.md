# Release Process UX & Operations Guide

**Reference**: [Self-Enforcing Release Process](../architecture/SELF_ENFORCING_RELEASE_PROCESS.md) | [AGENTS.md](/AGENTS.md)

This guide documents the user experience (UX) and operational workflows for the self-enforcing release process. It complements the technical architecture document with practical examples, troubleshooting, and best practices.

---

## Quick Start for Developers

### Creating a Release Candidate (RC)

Release candidates allow testing before production deployment.

```bash
./scripts/release.sh rc --description "Add new feature X and bug fixes"
```

**What happens**:
1. Script validates working tree is clean
2. Creates `.release/request.json` with RC metadata
3. Commits and pushes to main
4. GitHub Actions automatically:
   - Detects the release request
   - Bumps version: `v0.20.0` → `v0.20.1-rc.1`
   - Builds and deploys to staging environment
   - Tags commit with new version

**Checklist before running**:
- [ ] All commits are pushed to main
- [ ] Working tree is clean (`git status`)
- [ ] You've tested locally (`bun run build:path`)
- [ ] Feature is complete and ready for testing

**Output to expect**:
```
═══════════════════════════════════════════════════════════
Self-Enforcing Release Process
═══════════════════════════════════════════════════════════

ℹ️  Release Type: rc
ℹ️  Current branch: main
ℹ️  Release request will be pushed to main

Creating release request...
✓ Release request created at .release/request.json
✓ Changes committed
✓ Pushed to remote

═══════════════════════════════════════════════════════════
Release request submitted!
═══════════════════════════════════════════════════════════

Next steps:
1. Watch GitHub Actions: https://github.com/.../actions
2. When build succeeds, staging environment is updated
3. Test the new version in staging
4. When ready for production, run: ./scripts/release.sh final
```

### Promoting RC to Production (Final Release)

After testing an RC, promote it to production.

```bash
./scripts/release.sh final --description "Q4 2025 release: features + bug fixes"
```

**What happens**:
1. Script validates that an RC exists
2. Creates final release request
3. GitHub Actions:
   - Strips RC pre-release tag: `v0.20.1-rc.1` → `v0.20.1`
   - Builds and deploys to production
   - Creates GitHub Release with release notes
   - Updates Beads with release metadata

**Important**: 
- RC must have been tested and working
- Final version takes precedence (don't run RC again after final)

### Emergency Hotfix

For critical bugs in production.

```bash
./scripts/release.sh hotfix --description "Security: Fix auth bypass vulnerability"
```

**What happens**:
1. Script creates hotfix release request
2. Version bumped from current production
3. Deployed immediately to production
4. No staging step (assumes critical urgency)

**Use only for**:
- Critical bugs affecting users
- Security vulnerabilities
- Data loss issues

**Not for**:
- Regular feature development (use RC/final)
- Minor polish (wait for next release)

---

## Release Request File Format

Every release creates a `.release/request.json` file:

```json
{
  "type": "rc",
  "description": "Add new feature X and bug fixes",
  "branch": "main",
  "requested_by": "developer@example.com",
  "requested_at": "2025-11-25T18:30:00Z",
  "sha": "abc123def456...",
  "status": "pending",
  "bead_id": "pw-123",
  "ci_run_url": "https://github.com/.../actions/runs/123456",
  "deployed_at": "2025-11-25T18:35:00Z",
  "deployed_version": "v0.20.1-rc.1"
}
```

**Fields**:
- `type`: Release type (rc, final, hotfix)
- `description`: What's included in this release
- `branch`: Which branch this release targets (always main)
- `requested_by`: Developer email (auto-detected)
- `requested_at`: UTC timestamp when request was created
- `sha`: Git commit SHA being released
- `status`: Current state (pending → in_progress → succeeded/failed)
- `bead_id`: Optional Beads issue ID for tracking
- `ci_run_url`: GitHub Actions workflow run URL
- `deployed_at`: Timestamp of successful deployment
- `deployed_version`: Final version deployed

---

## Understanding Release Workflow

### Three-Phase Release Process

**Phase 1: Request** (Developer)
```
Developer runs: ./scripts/release.sh [type]
         ↓
Creates: .release/request.json
         ↓
Commits & pushes to main
```

**Phase 2: Validation** (GitHub Actions - automatic)
```
release-controller.yml detects request
         ↓
Validates schema and current state
         ↓
Computes next version from package.json
         ↓
Updates package.json with new version
```

**Phase 3: Build & Deploy** (GitHub Actions - automatic)
```
Hugo builds static site
         ↓
Generates data/version.json with new version
         ↓
Deploys to GitHub Pages (or CDN)
         ↓
Creates git tag (v0.20.1-rc.1)
         ↓
Updates .release/request.json with status
```

### Concurrent Requests Prevention

**What if two developers try to release simultaneously?**

Release controller includes safeguards:
1. Checks if release is already in_progress
2. If concurrent request detected, later request fails with clear error
3. Developer must wait for first release to complete

**Prevention**: Always check GitHub Actions before creating new release request.

---

## Monitoring a Release

### Check Release Status

```bash
# View current release request
cat .release/request.json | jq .

# Watch GitHub Actions
# https://github.com/yourusername/yourrepo/actions

# Track in Beads (once integrated)
bd show pw-123  # See release metadata
```

### Release Workflow Run

GitHub Actions will show progress:

1. **Validate Request** - Checks request is well-formed
2. **Compute Version** - Determines next version
3. **Update Version** - Bumps package.json
4. **Build Site** - Runs Hugo build
5. **Deploy Site** - Uploads to hosting
6. **Create Tag** - Creates git tag
7. **Update Beads** - Records release (if Beads CLI available)

Each step shows:
- ✅ Passed
- ❌ Failed (with error message)

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Release request fails validation** | Malformed JSON or duplicate request | Check `.release/request.json` format, delete if corrupted |
| **Build fails** | Code doesn't compile | Fix errors locally, commit, and retry |
| **Deploy fails** | Network or permissions issue | Check GitHub Actions logs, retry via Actions UI |
| **Tag creation fails** | Tag already exists | CI handles this - usually safe to retry |
| **Wrong version deployed** | Concurrent releases | Always check Actions before requesting |

---

## Advanced: Version Numbering

### Semantic Versioning

This project uses **semantic versioning**: `MAJOR.MINOR.PATCH(-PRERELEASE)`

**Examples**:
- `v0.20.0` - Initial release
- `v0.20.1-rc.1` - Release candidate 1 (testing)
- `v0.20.1-rc.2` - Release candidate 2 (more testing)
- `v0.20.1` - Final production release (RC promoted)
- `v0.21.0` - Minor version bump (new features)
- `v1.0.0` - Major version bump (breaking changes)

### Version Bump Rules

**RC (Release Candidate)**:
- Bumps patch: `v0.20.0` → `v0.20.1-rc.1`
- Next RC: `v0.20.1-rc.1` → `v0.20.1-rc.2`
- Purpose: Pre-release testing before production

**Final (Production Release)**:
- Promotes RC: `v0.20.1-rc.X` → `v0.20.1`
- Or bumps patch: `v0.20.0` → `v0.20.1`
- Purpose: Live deployment to all users

**Hotfix (Emergency Patch)**:
- Bumps patch from deployed: `v0.20.1` → `v0.20.2`
- Skips RC phase (urgency)
- Purpose: Critical production fixes

### Version Flow

```
v0.20.0 (released)
    ↓
./scripts/release.sh rc
    ↓
v0.20.1-rc.1 (staging)
    ↓ [testing phase]
./scripts/release.sh rc (again)
    ↓
v0.20.1-rc.2 (staging)
    ↓ [more testing]
./scripts/release.sh final
    ↓
v0.20.1 (production) ← RELEASED
    ↓
[new feature work]
    ↓
./scripts/release.sh rc
    ↓
v0.20.2-rc.1 (staging)
    ↓ [rinse and repeat]
```

---

## Operations: Release Cadence

### Recommended Release Schedule

**Regular Releases** (Weekly or Bi-weekly):
```bash
# Monday morning
./scripts/release.sh rc --description "Week 1: Features X, Y; Bug fixes Z"
# Test Tuesday-Wednesday
./scripts/release.sh final --description "Week 1 release"
# Deployed to production Wednesday evening
```

**Hotfixes** (As-needed):
```bash
# Critical bug discovered Friday afternoon
./scripts/release.sh hotfix --description "Fix: Production database connection error"
# Deployed immediately
```

### Release Notes

Every final release should document:
- **What's new**: Features added
- **Fixes**: Bugs resolved
- **Known issues**: Anything broken or incomplete
- **Breaking changes**: If any

Example:

```markdown
## v0.20.1 - November 25, 2025

### New Features
- Add dark mode toggle
- Implement analytics tracking
- Cookie consent banner

### Bug Fixes
- Fix hero section alignment on mobile
- Resolve footer link color in dark mode
- Fix analytics data not persisting

### Known Issues
- Cookie banner may flicker on slow connections (investigating)

### Breaking Changes
None
```

---

## Troubleshooting

### Release Stuck in "pending"

**Symptoms**: Release request created 10+ minutes ago, still shows `pending` status.

**Causes**:
1. GitHub Actions is slow
2. Workflow trigger didn't fire
3. Runner unavailable

**Solutions**:
1. Wait 5 more minutes (GitHub can be slow)
2. Check Actions tab: `https://github.com/.../actions`
3. If no workflow running:
   - Commit a trivial change: `git commit --allow-empty -m "Trigger workflow"`
   - Push: `git push`
4. If still stuck:
   - Delete `.release/request.json`
   - Commit and push
   - Try again: `./scripts/release.sh rc ...`

### Version Mismatch (Deployed ≠ package.json)

**Symptoms**: Website shows v0.20.1 in footer but `package.json` shows v0.20.0

**Cause**: Partial release failure - version updated but deployment failed

**Solution**:
1. Check `.release/request.json` status field
2. If `in_progress`, wait for workflow to complete
3. If `failed`:
   - Check Actions logs for error
   - Fix the issue (e.g., deploy permissions)
   - Re-run workflow via Actions UI: "Re-run jobs"
   - Check deploy completed: `git log --oneline | head -5` (should show version bump)

### Release Won't Start

**Symptoms**: Running `./scripts/release.sh rc` fails with error.

**Common errors**:

| Error | Solution |
|-------|----------|
| "Working tree is not clean" | Run `git status` and commit all changes first |
| "Not on main branch" | Run `git checkout main` |
| "Failed to push" | Check git remote, authentication, or network |
| "Can't parse package.json" | Ensure valid JSON syntax |

---

## Related Documentation

- **[Self-Enforcing Release Process](../architecture/SELF_ENFORCING_RELEASE_PROCESS.md)** — Technical architecture
- **[AGENTS.md](/AGENTS.md)** — Release workflow for AI agents
- **[Deployment Guide](./DEPLOYMENT.md)** — Environment-specific deployment details
- **[Release Controller Source](.github/workflows/release-controller.yml)** — GitHub Actions workflow

---

## Best Practices

1. **Test RCs thoroughly** before promoting to final
2. **Write clear descriptions** - they become release notes
3. **Keep releases small** - weekly is better than monthly
4. **Monitor deployment** - check GitHub Actions until green
5. **Update Beads** - link releases to Beads issues for traceability
6. **Document hotfixes** - record why emergency release was needed
7. **Archive old requests** - clean up `.release/` after release succeeds

---

**Last Updated**: November 2025
