# Deployment & Release Management

Complete guide for deploying changes to production, managing releases, and troubleshooting deployment issues.

**See also:** [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) for the three-stage release process (RC → test → production).

## Quick Links

- **Making a release?** → [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md)
- **Deploying to production?** → [Deployment Checklist](#deployment-checklist)
- **Fixing deployment issues?** → [Critical Issues & Fixes](#critical-issues--fixes)
- **Configuring environments?** → [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md)

## CI/CD Architecture

The project uses **path-based build control** that intelligently routes changes:

| Change Type                                               | Build | Test | Deploy               |
| --------------------------------------------------------- | ----- | ---- | -------------------- |
| **Content** (`content/`, `static/`, `assets/`)            | ✅    | ✅   | ✅ Production        |
| **Build Config** (`hugo.toml`, `layouts/`, `config/`)     | ✅    | ✅   | ✅ Production        |
| **Test-Only** (`test/`, `tests/`, `scripts/`, `.github/`) | ✅    | ✅   | ❌ Verification only |
| **Documentation** (`docs/`, `*.md`)                       | ❌    | ❌   | ❌ Validation only   |

See [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) for full CI/CD integration details.

## Deployment Checklist

### Before Pushing

```bash
# 1. Run pre-commit checks (automatic, but verify)
git status
# Should show all changes staged and pre-commit successful

# 2. Test build locally
bun run build:production
# Check that /public directory has all files

# 3. Test specific functionality
bun run test:ga              # Google Analytics tracking
bun run test:e2e             # End-to-end tests
bun run test:accessibility  # WCAG compliance

# 4. Check version was bumped correctly
grep "version = " hugo.toml
# Should show new version (e.g., 0.17.1)

# 5. Review what you're pushing
git log --oneline -5
git diff HEAD~1 HEAD
```

### Pushing to Production

```bash
# Push to main (with pre-push guardrail confirmation)
FORCE_PUSH=yes git push origin main

# Monitor CI/CD pipeline in GitHub Actions
# Wait for all checks to pass (typically 2-5 minutes)

# Verify deployment
# Visit https://peterwarnock.com and check:
# - Version number in footer (e.g., v0.17.1 8bb3896)
# - Recent changes visible
# - No styling issues
# - Analytics tracking working
```

### Creating a Release

When ready to officially release a version:

```bash
# Stage 1: Create pre-release candidate (for testing)
./scripts/release.sh pre
# Output: v0.17.1-rc.1

# Push RC tag and deploy to staging
FORCE_PUSH=yes git push origin v0.17.1-rc.1
bun run deploy:staging

# Run full test suite
bun run test:e2e
bun run test:accessibility

# If tests pass, create production release
./scripts/release.sh post
# Output: v0.17.1

# Push production tag
FORCE_PUSH=yes git push origin v0.17.1

# Create GitHub Release
# 1. Go to https://github.com/pwarnock/pwarnock.github.io/releases
# 2. Click "Create a new release"
# 3. Select v0.17.1 tag
# 4. Add release notes from `.cody/project/build/v0.17.1/release-notes.md`
# 5. Publish
```

See [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) for detailed release process.

## Critical Issues & Fixes

### 🚨 CSS Processing Issue

**Problem**: After moving CSS files from `assets/` to `static/`, styling breaks because CSS contains unprocessed Tailwind directives.

**Example**:

```css
@import 'tailwindcss';
@plugin "daisyui" {
  themes: all;
}
```

These directives aren't processed by Hugo when in `static/`, resulting in no actual styles being loaded.

**Solution**:

```bash
# ALWAYS process CSS with Tailwind CLI before deployment
bun x tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --minify
```

**Prevention Checklist**:

- ✅ Check if CSS contains `@import` or `@plugin` directives
- ✅ If yes, process with Tailwind CLI **before** moving to static
- ✅ Verify generated CSS contains actual utility classes (not directives)
- ✅ Test locally in browser dev tools to confirm styles load
- ✅ Don't commit unprocessed CSS to static directory

**Why**:

- Hugo processes files in `assets/` with PostCSS
- `static/` files are served as-is (no processing)
- Unprocessed directives break the entire stylesheet

### 🔄 Build Failures Due to Missing CSS

**Problem**: Build succeeds but styles don't load in browser.

**Causes**:

1. CSS not processed before Hugo build
2. Tailwind CLI version mismatch
3. Missing dependencies

**Solution**:

```bash
# Ensure CSS is built BEFORE Hugo
bun install --frozen-lockfile
bun x tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --minify
hugo --gc --minify
```

**Note**: Pre-commit hook and CI/CD handle this automatically. If it happens locally, check that you're using `bun run build:production` (not `hugo` directly).

### 🛑 Deployment Hangs or Times Out

**Problem**: GitHub Actions deployment step appears stuck.

**Causes**:

- Previous deployment still running (concurrency issue)
- Large artifact upload
- Network issues

**Solution**:

1. Check GitHub Actions workflow status
2. If stuck > 10 minutes, cancel and re-run
3. Verify no other deployments are in progress
4. Check artifact size: `du -sh public/`

### 📦 Rollback After Bad Deployment

If something is broken in production:

```bash
# Option 1: Revert to previous release tag
git checkout v0.17.0
git checkout -b hotfix/revert-to-v0.17.0

# Option 2: Create hotfix branch and push directly
git checkout main
git checkout -b hotfix/critical-issue
# Make fixes
git commit -am "fix: critical issue"
git push origin hotfix/critical-issue
# Push to main triggers new deploy

# Option 3: Manual rollback (if needed immediately)
# Go to GitHub Pages settings and select previous deployment
```

### 🔍 Verifying Successful Deployment

After deployment completes:

```bash
# 1. Check site is live
curl -I https://peterwarnock.com
# Should return 200 OK

# 2. Check version in footer
curl https://peterwarnock.com | grep -o "v[0-9.]*"

# 3. Check for CSS loading
curl https://peterwarnock.com | grep -c "class="
# Should be non-zero (indicates styles are present)

# 4. Run end-to-end tests
bun run test:e2e
# All tests should pass

# 5. Check GitHub Actions workflow
# Visit https://github.com/pwarnock/pwarnock.github.io/actions
# Latest workflow should show ✅ All checks passed
```

## Deployment Guardrails

### Pre-Push Guardrail

Before pushing to main, a script confirms:

- Build test passed locally
- All changes reviewed
- Ready for production

```bash
# Automatic confirmation prompt
git push origin main

# Or bypass with environment variable (for CI/automation)
FORCE_PUSH=yes git push origin main
```

### GitHub Pages Environment Protection

Main branch deployments require:

- All CI checks pass (linting, tests, coverage)
- No manual approval needed (auto-deploy on successful checks)

## Troubleshooting

### "Build failed: public directory not found"

The Hugo build didn't generate output. Check:

1. CSS preprocessing ran: `ls static/css/main.css`
2. Hugo config is valid: `hugo config`
3. Content files exist: `ls content/`

### "Deployment to GitHub Pages failed"

Check:

1. Artifact was uploaded: GitHub Actions logs should show "Upload pages artifact"
2. Repository settings: Settings → Pages → Source set to "GitHub Actions"
3. Permissions: Token has `pages: write` permission

### "Version shows as old in footer"

The `versionHash` parameter might not be updating. Check:

1. `hugo.toml` has latest version and hash
2. Pre-commit hook ran: `grep versionHash hugo.toml`
3. Clear browser cache (Ctrl+Shift+Del)

## See Also

- [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) - Three-stage release process with detailed steps
- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) - Environment variables and configuration
- [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md#ci-cd-integration) - Path-based CI/CD decision table
- [AGENTS.md](../../AGENTS.md) - Deployment workflow guidelines
