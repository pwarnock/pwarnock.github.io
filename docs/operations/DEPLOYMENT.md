# Deployment & Release Management

Complete guide for deploying changes to production, managing releases, versioning, and troubleshooting deployment issues.

**See also:**
- [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) - Three-stage release process (RC → test → production) with script automation
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) - Cody Framework workflow integration
- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) - Environment variables and configuration

## Quick Links

- **Making a release?** → [Three-Stage Release Process](#three-stage-release-process)
- **Deploying to production?** → [Deployment Checklist](#deployment-checklist)
- **Fixing deployment issues?** → [Critical Issues & Fixes](#critical-issues--fixes)
- **Need version info?** → [Version Management](#version-management--releases)
- **Monitoring after deploy?** → [Post-Release Validation](#post-release-validation)

## CI/CD Architecture Overview

The project uses **path-based build control** that intelligently routes changes based on what was modified:

| Change Type | Examples | Build | Test | Deploy |
|---|---|---|---|---|
| **Content** | `content/`, `static/`, `assets/` | ✅ | ✅ | ✅ Production |
| **Build Config** | `hugo.toml`, `layouts/`, `config/` | ✅ | ✅ | ✅ Production |
| **Test-Only** | `test/`, `tests/`, `scripts/`, `.github/` | ✅ | ✅ | ❌ Verification only |
| **Documentation** | `docs/`, `*.md` | ❌ | ❌ | ❌ Validation only |

**See [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md#ci-cd-integration) for detailed CI/CD integration with workflow files.**

## Deployment Checklist

### Before Pushing to Main

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

### CSS Validation (Critical)

Before deployment, verify CSS processing:

```bash
# 1. Check if CSS contains unprocessed directives
grep -E "@import|@plugin" static/css/main.css
# Should return NOTHING - if it shows results, CSS needs processing

# 2. If unprocessed directives found, process with Tailwind CLI
bun x tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --minify

# 3. Verify generated CSS contains actual utility classes
grep -c "class=" static/css/main.css
# Should be non-zero and contain actual CSS rules, not directives

# 4. Test locally in browser dev tools
bun run dev
# Verify all styles load correctly
```

**Why this matters:**
- Hugo processes files in `assets/` with PostCSS
- Files in `static/` are served as-is (no processing)
- Unprocessed `@import` or `@plugin` directives break the entire stylesheet

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

### Guardrails

Before pushing to main, a pre-push script confirms:

- Build test passed locally
- All changes reviewed
- Ready for production

```bash
# Automatic confirmation prompt on normal push
git push origin main

# Or bypass with environment variable (for CI/automation)
FORCE_PUSH=yes git push origin main
```

**GitHub Pages Environment Protection:**
- Main branch deployments require all CI checks to pass
- No manual approval needed (auto-deploy on successful checks)

## Three-Stage Release Process

The release process has three stages: Pre-Release (RC) → Testing → Production Release.

**See [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) for detailed step-by-step process with diagrams and scripts.**

Quick reference:

```bash
# Stage 1: Create pre-release candidate (for testing)
./scripts/release.sh pre
# Output: v0.17.1-rc.1

# Push RC tag and deploy to staging
FORCE_PUSH=yes git push upstream v0.17.1-rc.1
bun run deploy:staging

# Stage 2: Run full test suite
bun run test:e2e
bun run test:accessibility

# If tests pass, create production release
./scripts/release.sh post
# Output: v0.17.1

# Push production tag
FORCE_PUSH=yes git push upstream v0.17.1

# Create GitHub Release
# 1. Go to https://github.com/pwarnock/pwarnock.github.io/releases
# 2. Click "Create a new release"
# 3. Select v0.17.1 tag
# 4. Add release notes
# 5. Publish
```

## Version Management & Releases

### Semantic Versioning

We follow `MAJOR.MINOR.PATCH` semantic versioning:

- **MAJOR** (e.g., 1.0.0): Breaking changes, major redesigns, technology stack changes
- **MINOR** (e.g., 0.17.0): New features, significant content additions, UI improvements
- **PATCH** (e.g., 0.17.1): Bug fixes, content updates, minor improvements

### Version Naming Convention

Versions use descriptive names during development, clean semver for production:

```
Development (feature branches): v[major.minor.patch]-[descriptive-name]
Production (releases): v[major.minor.patch]
```

Examples:
- `v0.10.0-spacing-scale` (feature branch - development only)
- `v0.10.0` (production release - no feature name)

**Critical**: Feature branch names should NOT leak to production version strings.

### Auto-Versioning

Versions are automatically bumped on each commit via pre-commit hook:

- **Patch bumps** (default): For `fix:`, `refactor:`, `docs:` commits
- **Minor bumps**: For `feature:` or `feat:` commits, new components, or beads feature issues
- **Manual bumps**: Use `:cody build` or specify `--patch` when needed

Hugo.toml is automatically updated with the new version and versionHash on each commit.

**See [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md#auto-versioning-diagram) for detailed auto-versioning flow.**

### Version Synchronization

Version numbers must be synchronized across three locations:

1. **package.json**: `"version": "x.y.z"`
2. **hugo.toml**: `version = "x.y.z"` + `versionHash = "commit-hash"`
3. **Footer display**: Shows version (e.g., "v0.17.1 8bb3896")

Auto-versioning pre-commit hook handles this automatically. To manually synchronize:

```bash
# Update package.json
npm version 0.17.1 --no-git-tag-v

# Update hugo.toml
grep "version = " hugo.toml  # Check current

# Commit
git add package.json hugo.toml
git commit -m "version: bump to 0.17.1"

# Pre-commit hook will auto-update versionHash
```

### Version Update Process

When creating a release:

```bash
# 1. Ensure versions are synchronized
grep "version = " hugo.toml      # Should match package.json
grep "version" package.json

# 2. Create Git Tag
git tag -a v0.17.1 -m "Release v0.17.1: [Description]"

# 3. Push Tag
FORCE_PUSH=yes git push upstream v0.17.1

# 4. Create GitHub Release
gh release create v0.17.1 \
  --title "v0.17.1: [Feature Summary]" \
  --notes-file docs/releases/v0.17.1.md
```

### Rollback Strategy

GitHub Releases make rollback straightforward and safe:

```bash
# Emergency rollback to previous stable version
git checkout v0.17.0
git push upstream main --force
```

**Benefits of GitHub Releases:**
- ✅ **Immutable Snapshot**: Exact point-in-time code state
- ✅ **Documentation**: Release notes capture what changed
- ✅ **Rollback Safety**: Quick recovery from deployment issues
- ✅ **Team Visibility**: Clear communication of deployed versions
- ✅ **Asset Management**: Can attach build artifacts if needed

## Pre-Release Validation

### Pre-Commit Validation (MUST PASS)

Before pushing any changes:

- [ ] `bun run lint` - No linting errors
- [ ] `bun run validate` - All validation checks pass
- [ ] `bun run build` - Site builds successfully
- [ ] Local testing passes
- [ ] No uncommitted changes
- [ ] CSS has been processed (no @import/@plugin directives in static/)

### Code Quality Checklist

- [ ] All code reviewed and approved (via PR)
- [ ] No linting errors or warnings
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No direct commits to main (use PR workflow)

### Content Review Checklist

- [ ] All content proofread
- [ ] Images optimized and accessible
- [ ] Links verified and working
- [ ] SEO metadata complete

### Performance & Accessibility Checklist

- [ ] Core Web Vitals within acceptable ranges
- [ ] Lighthouse accessibility score > 90
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

### Security Checklist

- [ ] Dependencies scanned for vulnerabilities
- [ ] Content Security Policy validated
- [ ] Security headers configured
- [ ] No sensitive data exposed

## Post-Release Validation

### Immediate Deployment Verification

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

### Automated Monitoring

Post-release monitoring should verify:

- [ ] Site accessibility from multiple locations (uptime monitoring)
- [ ] Core Web Vitals within thresholds (performance monitoring)
- [ ] No 404 errors in logs (link checking)
- [ ] SSL certificate valid (security monitoring)
- [ ] DNS resolution correct (infrastructure)

### Manual Validation

- [ ] Homepage loads correctly
- [ ] Navigation functional
- [ ] Forms and interactive elements working
- [ ] Mobile responsive design
- [ ] Theme switching functional
- [ ] Search functionality (if implemented)

### Performance Monitoring

- [ ] Google Analytics data flowing correctly
- [ ] Core Web Vitals metrics within targets
- [ ] Page load times acceptable
- [ ] Resource loading performance normal

### Alerting Thresholds

**Critical Alerts** (page-down severity):
- Site downtime > 5 minutes
- 404 error rate > 5%
- Performance degradation > 50%
- Security vulnerabilities detected

**Warning Alerts** (investigate within 1 hour):
- Performance metrics degradation (10-50%)
- Broken links detected
- Accessibility score drop > 10 points

## Critical Issues & Fixes

### 🚨 CSS Processing Issue

**Problem**: After moving CSS files from `assets/` to `static/`, styling breaks because CSS contains unprocessed Tailwind directives.

**Example of broken CSS**:
```css
@import 'tailwindcss';
@plugin "daisyui" {
  themes: all;
}
```

These directives aren't processed by Hugo when in `static/`, resulting in no actual styles being loaded. The file loads, but contains no rules—total style failure.

**Why This Happens**:
- Hugo processes files in `assets/` directory with PostCSS (converts directives to CSS)
- Files in `static/` are served as-is with no processing
- Unprocessed directives are invalid CSS and break the stylesheet
- Browser loads empty stylesheet, all Tailwind classes fail to apply

**Solution**:

```bash
# ALWAYS process CSS with Tailwind CLI BEFORE moving to static
bun x tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --minify

# Verify processing succeeded
grep -E "@import|@plugin" static/css/main.css
# Should return NOTHING

# Verify output contains actual CSS
grep -c "class=" static/css/main.css
# Should be non-zero
```

**Prevention Checklist**:

- ✅ Check if CSS contains `@import` or `@plugin` directives
- ✅ If yes, process with Tailwind CLI **before** moving to static
- ✅ Verify generated CSS contains actual utility classes (not directives)
- ✅ Test locally in browser dev tools to confirm styles load
- ✅ Don't commit unprocessed CSS to static directory

---

### 🔄 Build Failures Due to Missing CSS

**Problem**: Build succeeds but styles don't load in browser.

**Root Causes**:
1. CSS not processed before Hugo build
2. Tailwind CLI version mismatch
3. Missing dependencies (node_modules)

**Solution**:

```bash
# Ensure CSS is built BEFORE Hugo
bun install --frozen-lockfile
bun x tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --minify
hugo --gc --minify
```

**Note**: Pre-commit hook and CI/CD handle this automatically. If it happens locally, ensure you're using `bun run build:production` (not `hugo` directly).

---

### 🛑 Deployment Hangs or Times Out

**Problem**: GitHub Actions deployment step appears stuck.

**Root Causes**:
- Previous deployment still running (concurrency issue)
- Large artifact upload stalling
- Network issues or resource constraints

**Solution**:

1. Check GitHub Actions workflow status at actions page
2. If stuck > 10 minutes:
   - Cancel the workflow
   - Re-run it
   - Check for competing deployments
3. Verify artifact size isn't excessive:
   ```bash
   du -sh public/
   # Typical: 5-15MB
   ```

---

### 📦 Rollback After Bad Deployment

If something is broken in production:

```bash
# Option 1: Revert to previous release tag
git checkout v0.17.0
git checkout -b hotfix/revert-to-v0.17.0
git push origin hotfix/revert-to-v0.17.0
# Push to main triggers new deploy

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

---

### ⚠️ GitHub Pages Deployment Failure

**Problem**: Deployment fails with error messages like "The process '/usr/bin/git' failed with exit code 128"

**Root Causes**:
1. Repository Settings: GitHub Pages not configured to accept deployments from GitHub Actions
2. Token Permissions: GITHUB_TOKEN lacks necessary permissions
3. Branch Protection: Main branch has restrictions preventing deployment
4. Workflow Configuration: Missing required permissions or environment setup

**Solution - Option 1: Repository Settings (Recommended)**:

1. Go to repository Settings → Pages
2. Set "Source" to "GitHub Actions"
3. Ensure deployment is configured correctly
4. Save settings

**Solution - Option 2: Verify Workflow Permissions**:

Ensure workflow has correct permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**Solution - Option 3: Check Branch Protection**:

1. Go to Settings → Branches → main
2. If restrictions exist, add GitHub Actions to allowed list
3. Verify deploy job environment is set to `github-pages`

**Verification**:

After fixing, check:
- [ ] Pages source is set to "GitHub Actions"
- [ ] No branch protection conflicts
- [ ] Workflow has correct permissions
- [ ] Deployment job uses `github-pages` environment
- [ ] Workflow completes successfully

---

### 🔍 CI/CD Pipeline Configuration Critical

**Problem**: Multiple workflow files with different strategies cause confusion and failures.

**Why This Matters**:

- **Single-job workflows** (like old `deploy.yml`) have limited functionality
- **Multi-job pipelines** provide proper artifact handling and testing
- **Official actions** ensure compatibility and GitHub Pages integration
- **Environment setup** enables proper deployment authorization

**Correct Configuration Requirements**:

1. **Proper Permissions**:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

2. **Separate Build and Deploy Jobs**:
   ```yaml
   jobs:
     build:  # Builds and tests
       ...
     deploy:  # Only runs after successful build
       ...
   ```

3. **Concurrency Control**:
   ```yaml
   concurrency:
     group: 'pages'
     cancel-in-progress: false
   ```

4. **Official GitHub Pages Actions**:
   - `actions/configure-pages@v5`
   - `actions/upload-pages-artifact@v3`
   - `actions/deploy-pages@v4`

5. **Environment Configuration**:
   ```yaml
   deploy:
     environment:
       name: github-pages
       url: ${{ steps.deployment.outputs.page_url }}
   ```

**Prevention Checklist**:

Before any deployment changes:

1. ✅ Verify primary workflow is in use
2. ✅ Check permissions include `pages: write` and `id-token: write`
3. ✅ Ensure separate build/deploy jobs exist
4. ✅ Confirm official GitHub Pages actions are used
5. ✅ Validate environment configuration is present
6. ✅ Remove or disable alternate/simplified workflows

**Recovery Steps**:

If deployment fails:

1. **Check workflow**: Verify correct pipeline is active
2. **Verify permissions**: Ensure proper GitHub Pages permissions exist
3. **Check environment**: Confirm `github-pages` environment exists
4. **Review logs**: Look for artifact upload/deployment errors
5. **Restore pipeline**: Copy known-good configuration if needed

---

## Troubleshooting

### "Build failed: public directory not found"

The Hugo build didn't generate output. Check:

1. CSS preprocessing ran: `ls static/css/main.css`
2. Hugo config is valid: `hugo config`
3. Content files exist: `ls content/`

---

### "Deployment to GitHub Pages failed"

Check:

1. Artifact was uploaded: GitHub Actions logs should show "Upload pages artifact"
2. Repository settings: Settings → Pages → Source set to "GitHub Actions"
3. Permissions: Token has `pages: write` permission
4. Environment: Deploy job uses `github-pages` environment

---

### "Version shows as old in footer"

The `versionHash` parameter might not be updating. Check:

1. `hugo.toml` has latest version and hash
2. Pre-commit hook ran: `grep versionHash hugo.toml`
3. Clear browser cache (Ctrl+Shift+Del)

---

### "Style issues after deployment"

Check CSS processing:

1. `grep -E "@import|@plugin" static/css/main.css`
   - Should return NOTHING
   - If it shows results, CSS needs Tailwind CLI processing
2. Verify CSS was processed before Hugo:
   - `bun x tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --minify`
3. Test locally before pushing:
   - `bun run dev && check browser dev tools`

---

### "404 errors or broken links after deploy"

Check:

1. All content files were built: `ls public/ | wc -l`
2. Link validation passed: `bun run test:e2e`
3. Hugo build didn't skip files: `hugo --gc --minify` locally

---

## Branch Strategy

### Main Branches

- **main**: Production-ready code, always deployable
- **develop** (future): Integration branch for features
- **release/vX.X.X**: Release preparation branch

### Feature Branches

- **feature/feature-name**: New feature development
- **bugfix/issue-description**: Bug fixes
- **hotfix/critical-fix**: Emergency production fixes

**Important**: All changes to main must come through Pull Requests. No direct commits to main.

---

## Release Communication

### Release Notes Template

```markdown
# Release vX.X.X - [Release Name]

## 🚀 Features

- [Feature description]
- [Another feature]

## 🐛 Bug Fixes

- [Bug fix description]
- [Another bug fix]

## 🔧 Improvements

- [Improvement description]
- [Performance optimization]

## 📚 Documentation

- [Documentation update]

## 🛠️ Technical Changes

- [Technical change]
- [Dependency update]

## 📈 Performance

- [Performance improvement]
- [Core Web Vitals update]

## 🔒 Security

- [Security fix]
- [Dependency security update]

## 🚦 Deployment

- Deployed to production: [Date]
- Rollback available: vX.X.X-previous
```

### Communication Channels

#### Internal Team
- GitHub release notes
- Team chat notifications
- Email summary for major releases

#### Public (if applicable)
- Blog post for major releases
- Twitter announcements
- LinkedIn updates

---

## Continuous Improvement

### Process Reviews

- **Quarterly**: Release process evaluation
- **Incident Post-mortems**: Learning from failures
- **Stakeholder Feedback**: User and team input
- **Industry Best Practices**: Staying current

### Metrics and KPIs

- **Release Frequency**: How often we release
- **Lead Time**: Time from code to production
- **Failure Rate**: Percentage of failed deployments
- **Recovery Time**: Time to restore service

---

## See Also

- [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) - Three-stage release mechanics with scripts and diagrams
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) - Cody Framework workflow integration
- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) - Environment variables and configuration
- [AGENTS.md](../../AGENTS.md) - Auto-versioning and deployment workflow guidelines
