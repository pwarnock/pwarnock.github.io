# Upstream Remotes & Git Workflow Guide

This guide explains the **upstream remote** and how to use it for collaborative
development, releases, and deployments.

## Quick Reference

```bash
# Clone repository (sets up origin, upstream, staging, production remotes)
git clone https://github.com/pwarnock/pwarnock.github.io.git
cd pwarnock.github.io

# Verify remotes are configured
git remote -v

# Fetch latest from all remotes
git fetch --all

# Push to upstream (release tags and main branch)
git push upstream main                    # Push main branch to upstream
FORCE_PUSH=yes git push upstream v0.17.1 # Push release tag to upstream
```

## Remote Configuration

The repository uses **four Git remotes** for collaborative development and
deployment:

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│         https://github.com/pwarnock/pwarnock.github.io      │
└─────────────────────────────────────────────────────────────┘
                            ▲
           ┌────────────────┼────────────────┐
           │                │                │
        ┌──▼───┐      ┌─────▼─────┐    ┌────▼──────┐
        │origin│      │  upstream  │    │  staging  │
        └──────┘      └────────────┘    └───────────┘
                                              │
                                         ┌────▼──────┐
                                         │ production│
                                         └───────────┘
```

| Remote         | Purpose                                | Typical Use                                 |
| -------------- | -------------------------------------- | ------------------------------------------- |
| **origin**     | Your fork (if applicable) or main repo | Local development, pushing feature branches |
| **upstream**   | Main repository canonical source       | Pushing releases, main branch, tags         |
| **staging**    | Pre-production testing environment     | Deploying `bun run deploy:staging`          |
| **production** | Production deployment environment      | Deploying `bun run deploy:production`       |

## Remote Setup

### Automatic Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/pwarnock/pwarnock.github.io.git
cd pwarnock.github.io

# Run initialization script (auto-detects and sets up remotes)
./scripts/agent-init.sh

# Verify setup
git remote -v
```

Expected output after setup:

```
origin     https://github.com/pwarnock/pwarnock.github.io.git (fetch)
origin     https://github.com/pwarnock/pwarnock.github.io.git (push)
upstream   https://github.com/pwarnock/pwarnock.github.io.git (fetch)
upstream   https://github.com/pwarnock/pwarnock.github.io.git (push)
staging    https://github.com/pwarnock/pwarnock.github.io.git (fetch)
staging    https://github.com/pwarnock/pwarnock.github.io.git (push)
production https://github.com/pwarnock/pwarnock.github.io.git (fetch)
production https://github.com/pwarnock/pwarnock.github.io.git (push)
```

### Manual Setup (If Needed)

```bash
# Add upstream remote (if not already set)
git remote add upstream https://github.com/pwarnock/pwarnock.github.io.git

# Add staging and production remotes
git remote add staging https://github.com/pwarnock/pwarnock.github.io.git
git remote add production https://github.com/pwarnock/pwarnock.github.io.git

# Fetch from all remotes
git fetch --all

# Verify
git remote -v
```

## Upstream Workflow

### Overview: Main Development Flow

```
Local Development
       ↓
    commit
       ↓
 local branch
       ↓
 git push upstream main
       ↓
GitHub Actions Tests
       ↓
Auto Deploy to Production
       ↓
Live Site
```

### Step 1: Daily Development

Work on the main branch (or feature branches):

```bash
# Update local main from upstream
git fetch upstream
git rebase upstream/main       # Get latest changes

# Make changes
git commit -am "feat: add new feature"

# Verify it builds
bun run build:production
```

### Step 2: Push to Upstream

When ready to share changes with team or deploy:

```bash
# Push to upstream main
git push upstream main

# If rejected due to pre-push guardrails:
# 1. Review pre-push error output
# 2. Fix any issues (linting, tests)
# 3. Re-run: git push upstream main
```

The pre-push hook will:

- ✅ Run linting checks
- ✅ Validate HTML and SEO
- ✅ Check for hardcoded URLs
- ✅ Verify security
- ✅ Run build test
- ✅ Show commit summary
- ⏸️ **Wait for explicit confirmation**

```bash
🚀 Ready to push to upstream

Review these commits:
  commit abc1234 - feat: add new feature
  commit def5678 - fix: address issue

Changed files (3):
  - src/main.css
  - content/blog/_index.md
  - hugo.toml

Push to upstream/main? [y/N]: y
```

Type `y` to confirm push.

### Step 3: GitHub Actions Runs

After push to upstream/main:

1. **Path-based build detection** runs
   - Detects what changed
   - Routes to appropriate build pipeline

2. **Automated tests** run in parallel
   - Linting and code quality
   - Hugo build validation
   - E2E tests (Playwright)
   - Accessibility tests (WCAG)
   - Performance benchmarks

3. **Automatic deployment** (if tests pass)
   - For content/config changes: deploys to production
   - For test-only changes: verification only
   - For docs-only: validation only

4. **Site goes live** with new changes

Monitor status at:

- GitHub Actions: https://github.com/pwarnock/pwarnock.github.io/actions
- Deployments: https://github.com/pwarnock/pwarnock.github.io/deployments

## Release Workflow

### Pushing Release Tags to Upstream

When creating a release:

```bash
# 1. Create release candidate tag
./scripts/release.sh pre
# Output: v0.17.1-rc.1

# 2. Push RC tag to upstream
FORCE_PUSH=yes git push upstream v0.17.1-rc.1

# 3. Deploy to staging
bun run deploy:staging

# 4. Test on staging
bun run test:e2e
bun run test:accessibility

# 5. If tests pass, create production release tag
./scripts/release.sh post
# Output: v0.17.1

# 6. Push production tag to upstream
FORCE_PUSH=yes git push upstream v0.17.1

# 7. Deploy to production
bun run deploy:production

# 8. Create GitHub Release
# Visit: https://github.com/pwarnock/pwarnock.github.io/releases
# Click "Create a new release"
# Select v0.17.1 tag
# Add release notes
# Publish
```

**Note**: `FORCE_PUSH=yes` is required because release tags may be updated
between RC and final versions.

### Tag Format

- **Release candidate**: `v0.17.1-rc.1` (testing tag)
- **Production release**: `v0.17.1` (final tag, no RC suffix)

See [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) for complete release process.

## Pushing Main Branch to Upstream

### Normal Development Push

```bash
# Create feature on local branch
git checkout -b feature/my-feature
git commit -am "feat: implement feature"

# Update with latest upstream
git fetch upstream
git rebase upstream/main

# Push to upstream
git push upstream main
```

### Force Push (Dangerous - Use Carefully)

Sometimes you need to rewrite history (emergency situations only):

```bash
# ❌ DANGER: This rewrites history
git push upstream main --force

# ✅ BETTER: Use --force-with-lease (safer)
git push upstream main --force-with-lease

# This fails if someone else pushed while you were working
# Much safer than --force
```

**When to force push:**

- Emergency rollback of bad code
- Revert to known good commit
- Fix critical production issue

**When NOT to force push:**

- Normal development (use rebase/merge instead)
- Team collaboration (communicate first)
- After others have branched from your changes

## Checking Upstream Status

### View Upstream Remote Info

```bash
# Show upstream URL and branches
git remote -v

# Show upstream branches
git branch -r

# Output:
#   upstream/main
#   upstream/staging
#   upstream/production
```

### Compare Local vs Upstream

```bash
# Check if local is ahead/behind upstream/main
git fetch upstream
git log --oneline --graph --decorate upstream/main..main
# Shows commits local has that upstream doesn't

# Check if local is behind upstream/main
git log --oneline --graph --decorate main..upstream/main
# Shows commits upstream has that local doesn't

# Fetch and rebase to catch up
git fetch upstream
git rebase upstream/main
```

### Troubleshooting Upstream Issues

#### Local branch is behind upstream

```bash
# Problem: Push rejected - local is behind remote
git push upstream main
# error: failed to push some refs to 'upstream'

# Solution: Rebase to catch up
git fetch upstream
git rebase upstream/main

# Then push
git push upstream main
```

#### Conflict during rebase

```bash
# Problem: Rebase hit conflict
# output: CONFLICT (content): Merge conflict in file.txt

# 1. Fix conflicts in your editor
# 2. Stage fixed files
git add file.txt

# 3. Continue rebase
git rebase --continue

# 4. Push
git push upstream main
```

#### Accidentally pushed bad code

```bash
# Problem: Pushed broken code to upstream
# Solution: Create a revert commit (don't force push)

# 1. Find the bad commit
git log --oneline -5

# 2. Create revert commit
git revert abc1234

# 3. Push the revert
git push upstream main

# This is safer than force push and creates clear history
```

## Multi-Remote Development

### Working with Multiple Remotes

If you have a personal fork + main upstream:

```bash
# Remotes might be:
#   origin     = your fork
#   upstream   = main repository

# Push to your fork
git push origin feature-branch

# Create PR on GitHub
# After PR merges to upstream/main

# Pull latest from upstream
git fetch upstream
git rebase upstream/main

# Update your fork
git push origin main
```

### Syncing Your Fork with Upstream

```bash
# Fetch latest from upstream
git fetch upstream

# Make your main match upstream/main
git checkout main
git reset --hard upstream/main

# Push to your fork
git push origin main --force-with-lease
```

## Pre-Push Guardrails

Before pushing to upstream, the pre-push hook validates:

### Checks Performed

1. **Linting** - Code style and quality
   - JavaScript/TypeScript linting
   - YAML/JSON validation
   - Markdown formatting

2. **Building** - Full Hugo build
   - CSS processing
   - Asset optimization
   - Template compilation

3. **Testing** - Build validation
   - HTML output validation
   - Link verification
   - Security checks

4. **Review** - Manual confirmation
   - Shows commits about to push
   - Displays changed files
   - Requires explicit `y` confirmation

### Bypassing Guardrails (Emergency Only)

For emergency pushes (not recommended):

```bash
# Skip all pre-push checks
git push upstream main --no-verify

# Only use when:
# - Production is down
# - Security vulnerability must be patched immediately
# - You've verified changes work locally

# Document why you bypassed checks
```

## GitHub Pages Deployment

### Automatic Deployment Flow

After pushing to upstream/main:

```
Push to upstream/main
         ↓
GitHub Actions Triggered
         ↓
Build & Test Workflow
         ↓
Path-Based Detection
         ↓
Content/Config Changes?
    ✅ Auto-Deploy
         ↓
Test-Only Changes?
    ❌ Verification Only
         ↓
Deploy to GitHub Pages
         ↓
Site Live in ~2-5 minutes
```

### Checking Deployment Status

```bash
# View deployments
# https://github.com/pwarnock/pwarnock.github.io/deployments

# Check latest action run
# https://github.com/pwarnock/pwarnock.github.io/actions

# Verify site is live
curl -I https://peterwarnock.com
# Should return: HTTP/1.1 200 OK

# Check version in footer
curl https://peterwarnock.com | grep -o "v[0-9.]*"
```

## Best Practices

### Daily Workflow

1. **Start day**: `git fetch upstream && git rebase upstream/main`
2. **During work**: Commit frequently, push before taking breaks
3. **Before pushing**: Run `bun run build:production` locally
4. **Push**: `git push upstream main`
5. **Monitor**: Check GitHub Actions for test results

### Commit Messages

Follow conventional commits for clear history:

```bash
# Feature
git commit -m "feat: add new component"

# Bug fix
git commit -m "fix: resolve issue with layout"

# Documentation
git commit -m "docs: update deployment guide"

# Performance
git commit -m "perf: optimize image loading"

# Refactoring
git commit -m "refactor: simplify CSS architecture"

# Tests
git commit -m "test: add accessibility test"

# Chores
git commit -m "chore: update dependencies"
```

Version will auto-bump based on commit type:

- `feat:` → Minor bump (0.17.0 → 0.18.0)
- `fix:`, `refactor:`, `perf:`, `docs:`, `test:` → Patch bump (0.17.0 → 0.17.1)

### Push Frequency

**Better**:

- Push after completing a logical unit of work
- Push before taking breaks
- Push at end of day (backup to remote)

**Avoid**:

- Large batches of commits before pushing
- Pushing incomplete work (mark as WIP if needed)
- Force pushing after pushing to upstream

## Troubleshooting

### "Updates were rejected because the tip of your current branch is behind"

```bash
# Problem: Remote has changes you don't have
git pull --rebase upstream main

# Or manually
git fetch upstream
git rebase upstream/main
git push upstream main
```

### "Permission denied (publickey) fatal: Could not read from remote repository"

```bash
# Problem: SSH key not set up correctly
# Solution: Use HTTPS or fix SSH key

# Check SSH key
ssh -T git@github.com

# If fails, setup SSH key
# https://docs.github.com/en/authentication/connecting-to-github-with-ssh

# Or use HTTPS
git remote set-url upstream https://github.com/pwarnock/pwarnock.github.io.git
```

### "fatal: No upstream tracked by branch 'main'"

```bash
# Problem: Local branch doesn't track upstream branch
# Solution: Set upstream tracking

git branch --set-upstream-to=upstream/main main

# Now you can: git pull (instead of git pull upstream main)
```

## Related Documentation

- **[RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md)** - Three-stage release process
  with tags
- **[INFRASTRUCTURE_PROMOTION_WORKFLOW.md](./INFRASTRUCTURE_PROMOTION_WORKFLOW.md)** -
  Infrastructure change promotion (main → staging → production)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment and CI/CD overview
- **[Git Documentation](https://git-scm.com/doc)** - Official Git reference

## See Also

- GitHub Repository: https://github.com/pwarnock/pwarnock.github.io
- GitHub Actions: https://github.com/pwarnock/pwarnock.github.io/actions
- GitHub Deployments: https://github.com/pwarnock/pwarnock.github.io/deployments
- Production Site: https://peterwarnock.com
