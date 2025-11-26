# Infrastructure Manual Promotion Workflow

This guide documents how to manually promote infrastructure changes
(configuration, build system, deployment pipelines) from development through
staging to production.

**Key Principle**: Infrastructure changes are NOT automatically deployed. They
require manual promotion through environment stages for safety and testing.

## Quick Reference

```bash
# 1. Develop on main (includes infrastructure changes)
git checkout main
git pull upstream main

# 2. Promote to staging for testing
bun run deploy:staging

# 3. Run full test suite on staging
bun run test:e2e
bun run test:accessibility
bun run test:performance

# 4. Promote to production (after testing passes)
bun run deploy:production

# 5. Verify production deployment
bun run test:e2e --production
curl -I https://peterwarnock.com
```

## Environment Workflow Diagram

```
┌─────────────┐
│   MAIN      │ ← Development (automatic tests, CI/CD)
│  (dev)      │
└──────┬──────┘
       │ Manual: bun run deploy:staging
       ↓
┌─────────────────────────────────┐
│        STAGING                   │ ← Pre-production (full test suite)
│  (pre-production testing)        │   • E2E tests
└──────┬────────────────────────────┘   • Accessibility
       │ Manual: bun run deploy:production  • Performance
       ↓                              • Infrastructure validation
┌─────────────────────────────────┐
│       PRODUCTION                │ ← Live deployment
│  (live, GitHub Pages)           │   • Post-deployment validation
└─────────────────────────────────┘   • Monitoring
```

## Environment Branches

| Branch         | Remote     | Purpose                 | Auto-Deploy                  | Protection                                    |
| -------------- | ---------- | ----------------------- | ---------------------------- | --------------------------------------------- |
| **main**       | upstream   | Development integration | ✅ Yes (content/config only) | Require PR reviews, status checks             |
| **staging**    | staging    | Pre-production testing  | ❌ Manual promotion          | Restrict force pushes                         |
| **production** | production | Live deployment         | ❌ Manual promotion          | Require linear history, restrict force pushes |

## Promotion Workflow: Main → Staging

### When to Promote to Staging

Promote infrastructure changes to staging in these situations:

- ✅ Hugo configuration changes (hugo.toml)
- ✅ Build system changes (postcss.config.cjs, tailwind.config.js)
- ✅ Layout or template changes (layouts/)
- ✅ CSS architecture changes
- ✅ Build script modifications
- ✅ GitHub Actions workflow changes (non-breaking)
- ✅ Dependency updates
- ✅ Any change requiring full test validation before production

### Step 1: Verify Main is Stable

```bash
# Ensure you're on main with latest changes
git checkout main
git pull upstream main

# Verify builds successfully locally
bun run build:production

# Check that all tests pass
bun run test:e2e
bun run test:accessibility

# Review what changed
git log --oneline -5
```

### Step 2: Deploy to Staging

```bash
# Single command to promote
bun run deploy:staging

# This automatically:
# 1. Checks out staging branch
# 2. Rebases on latest main
# 3. Runs path-based build validation
# 4. Pushes to staging remote
```

**Behind the scenes:**

```bash
# What deploy:staging does:
git checkout staging              # Switch to staging branch
git fetch upstream               # Get latest upstream
git rebase upstream/main         # Apply all main changes
./scripts/path-based-build.sh   # Validate build works
git push staging staging:staging # Push to staging remote
```

### Step 3: Test on Staging

After promotion, run comprehensive tests:

```bash
# End-to-end tests (user journeys)
bun run test:e2e

# Accessibility validation (WCAG compliance)
bun run test:accessibility

# Performance benchmarking
bun run test:performance

# Visual regression testing
bun run test:visual

# All tests together
bun run test:all
```

### Step 4: Manual Validation

Test key infrastructure changes manually:

```bash
# Test build system
hugo --version                    # Check Hugo still works
hugo --gc --minify               # Test minification

# Test CSS processing
grep -E "@import|@plugin" static/css/main.css
# Should return NOTHING (CSS should be processed)

# Test layout changes
bun run dev                       # Start local server
# Manually check: homepage, navigation, responsive design, themes

# Test theme switching
# Click theme switcher, verify styles load correctly

# Test mobile responsiveness
# Check mobile menu, responsive grid, touch targets
```

**Staging URL** (after GitHub Pages deploys):

- Available at: `staging` environment branch on GitHub Pages
- Check version in footer to confirm staging is deployed
- Verify analytics tracking enabled but set to staging

### Step 5: Sign Off for Production

Once staging tests pass:

```bash
# Document what was tested
echo "✅ Staging Validation Checklist:
- [x] E2E tests passed
- [x] Accessibility tests passed
- [x] Performance benchmarks acceptable
- [x] Visual regression tests passed
- [x] Manual infrastructure validation complete
- [x] Mobile responsiveness verified"

# Ready to promote to production
```

## Promotion Workflow: Staging → Production

### Prerequisites

Before promoting to production:

1. ✅ All staging tests passed
2. ✅ No critical bugs found
3. ✅ Infrastructure changes validated
4. ✅ Team approval (if required)
5. ✅ Rollback plan understood

### Step 1: Final Staging Verification

```bash
# Switch to staging to verify state
git checkout staging
git log --oneline -3

# Confirm all tests still pass
bun run test:e2e
bun run test:accessibility

# Check for any new issues
bun run test:all
```

### Step 2: Deploy to Production

```bash
# Single command to promote
bun run deploy:production

# This automatically:
# 1. Checks out production branch
# 2. Rebases on latest staging
# 3. Runs path-based build validation
# 4. Pushes to production remote
# 5. Triggers GitHub Pages deployment
```

**Behind the scenes:**

```bash
# What deploy:production does:
git checkout production         # Switch to production branch
git fetch staging              # Get latest staging
git rebase staging/staging     # Apply all staging changes
./scripts/path-based-build.sh  # Validate build works
git push production production:production # Push to production remote
```

### Step 3: Monitor Deployment

```bash
# Check GitHub Actions workflow
# Visit: https://github.com/pwarnock/pwarnock.github.io/actions
# Latest workflow should show ✅ All checks passed

# Wait for GitHub Pages deployment (2-5 minutes)
# Check deployment status at:
# https://github.com/pwarnock/pwarnock.github.io/deployments

# Verify site is live
curl -I https://peterwarnock.com
# Should return: HTTP/1.1 200 OK
```

### Step 4: Post-Deployment Validation

```bash
# Check version in footer (verify correct deployment)
curl https://peterwarnock.com | grep -o "v[0-9.]*"

# Verify infrastructure changes are active
# 1. Check CSS loads without errors
curl https://peterwarnock.com | grep -c "class="
# Should be non-zero (indicates styles present)

# 2. Test theme switching on live site
# Visit: https://peterwarnock.com
# Click theme switcher, verify styles change

# 3. Test mobile responsiveness
# Visit on mobile device or use browser dev tools
# Verify hamburger menu, responsive grid, mobile navigation

# 4. Check analytics (if applicable)
# Verify Google Analytics tracking working

# 5. Monitor for errors
# Check browser console in dev tools
# Should have no CSS errors, network errors, or JS errors
```

### Step 5: Confirm Production Health

```bash
# Run production-specific tests
bun run test:e2e --base-url https://peterwarnock.com

# Check all pages load correctly
for page in / /about/ /portfolio/ /blog/ /tools/; do
  echo "Testing: $page"
  curl -s -I "https://peterwarnock.com$page" | head -1
done

# Monitor for 1-2 hours
# Watch for: errors in logs, analytics gaps, performance degradation
```

## Special Cases

### Infrastructure Change Rollback

If production deployment has issues:

```bash
# Option 1: Quick rollback (revert to previous stable version)
git checkout production
git reset --hard production~1     # Go back one commit
git push production production:production --force

# Option 2: Fix and re-promote (safer)
git checkout main
# Fix the issue
git commit -am "fix: infrastructure issue"
git push upstream main
bun run deploy:staging            # Test fix on staging
# After validation:
bun run deploy:production         # Promote fixed version

# Option 3: Immediate production fix (emergency only)
git checkout production
# Fix the issue directly
git commit -am "fix: critical production issue"
git push production production:production --force
```

### Sync All Environments

If environments get out of sync:

```bash
# Sync all environment branches with latest main
bun run sync:env

# This:
# 1. Fetches all remotes
# 2. Updates staging from main
# 3. Updates production from staging
# 4. Returns to main branch

# Verify sync
git checkout staging && git log --oneline -1
git checkout production && git log --oneline -1
git checkout main
```

### Cancel In-Flight Promotion

If you need to cancel a promotion before it's fully deployed:

```bash
# If promotion to staging:
git reset --hard upstream/main    # Discard staging changes
git push staging main:staging --force  # Reset staging branch

# If promotion to production (and GitHub Pages hasn't deployed yet):
git reset --hard staging/staging  # Discard production changes
git push production staging:staging --force  # Reset production branch
```

## Validation Checklist

### Before Promoting to Staging

- [ ] All changes committed and pushed to main
- [ ] Local build succeeds: `bun run build:production`
- [ ] Local tests pass: `bun run test:e2e`
- [ ] No uncommitted changes: `git status`
- [ ] Ready to impact staging environment

### Before Promoting to Production

- [ ] Staging tests passed completely
- [ ] Infrastructure changes manually validated
- [ ] No critical bugs found during staging
- [ ] Mobile responsiveness verified
- [ ] CSS processing validated
- [ ] Team approval obtained (if required)
- [ ] Rollback plan understood

### After Production Deployment

- [ ] Site loads without errors: `curl -I https://peterwarnock.com`
- [ ] Version in footer is correct
- [ ] CSS loads (check page for styles)
- [ ] Theme switching works
- [ ] Mobile menu functions
- [ ] Analytics tracking active
- [ ] No JavaScript errors in console
- [ ] No 404 errors for assets

## Environment Configuration

Each environment has specific settings in `config/environments.toml`:

```toml
[environments.staging]
name = "staging"
domain = "staging.pwarnock.github.io"
build_command = "hugo --gc --minify --environment staging"
deploy_remote = "staging"
deploy_branch = "staging"
auto_deploy = true              # Automatic GitHub Pages deployment

[environments.production]
name = "production"
domain = "pwarnock.github.io"
build_command = "hugo --gc --minify --environment production"
deploy_remote = "production"
deploy_branch = "production"
auto_deploy = false             # Manual GitHub Pages deployment
```

## Available Commands

```bash
# Deployment
bun run deploy:staging          # Promote main to staging
bun run deploy:production       # Promote staging to production
bun run sync:env               # Sync all environments with main

# Environment switching
bun run env:staging             # Switch to staging branch
bun run env:production          # Switch to production branch
bun run env:main               # Switch to main branch

# Testing
bun run test:e2e               # End-to-end tests
bun run test:accessibility     # Accessibility tests
bun run test:performance       # Performance tests
bun run test:all              # All tests

# Building
bun run build:production        # Production build
bun run build:staging          # Staging build
bun run dev                    # Development server
```

## Git Remotes

The repository uses three remotes:

```
upstream   → Main GitHub repository (pwarnock/pwarnock.github.io)
staging    → Same repo, used for staging workflow
production → Same repo, used for production workflow
```

View remotes:

```bash
git remote -v
```

Expected output:

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

## Troubleshooting

### Promotion Fails with "Cannot rebase"

**Problem**: `git rebase` fails due to conflicts.

**Solution**:

```bash
# Abort the rebase
git rebase --abort

# Manually merge instead
git merge upstream/main          # For staging
git merge staging/staging        # For production

# Resolve any conflicts
git add .
git commit -m "merge: resolve conflicts"
git push staging/production staging/production:staging/production
```

### Staging Branch Out of Sync

**Problem**: Staging branch is behind main.

**Solution**:

```bash
bun run sync:env     # Syncs all environments
```

### Production Branch Won't Push

**Problem**: Push rejected, possibly due to branch protection.

**Solution**:

```bash
# Verify you're on production branch
git branch                      # Should show: * production

# Check branch protection rules
# Go to: Settings → Branches → production

# If allowed, use force push (carefully)
git push production production:production --force

# Document why force push was needed
```

### Version Not Updating in Footer

**Problem**: Footer still shows old version after deployment.

**Solution**:

```bash
# Verify data/version.toml was updated
cat data/version.toml

# If not updated, run version generation
bun run generate-version

# Commit and re-deploy
git add data/version.toml
git commit -m "chore: update version"
bun run deploy:production
```

## Monitoring & Alerting

### What to Monitor After Production Deployment

- **Site Uptime**: Is https://peterwarnock.com accessible?
- **CSS Loading**: Do styles apply correctly?
- **Performance**: Are page load times acceptable?
- **Errors**: Any JavaScript errors or 404s?
- **Analytics**: Is tracking data flowing correctly?

### Critical Alerts (Immediate Action)

- Site returns 500 error
- CSS completely broken (no styles)
- Navigation non-functional
- Deployment incomplete (GitHub Actions failed)

### Warning Alerts (Investigate Within 1 Hour)

- Performance degradation > 20%
- Broken internal links (404 errors)
- Analytics not tracking
- Theme switching broken

## Related Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment and CI/CD overview
- **[RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md)** - Three-stage release process
  for production versions
- **[ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md)** - Environment variables
  and configuration
- **[AGENTS.md](../../AGENTS.md)** - AI agent development guidelines

## See Also

- GitHub Pages Deployment Status:
  https://github.com/pwarnock/pwarnock.github.io/deployments
- GitHub Actions: https://github.com/pwarnock/pwarnock.github.io/actions
- Production Site: https://peterwarnock.com
