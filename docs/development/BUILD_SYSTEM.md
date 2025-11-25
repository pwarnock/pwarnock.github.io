# Build System & Path-Based Compilation

Guide to the project's intelligent build system that automatically detects change types and applies optimal compilation strategies.

## Overview

The build system uses path-based detection to optimize build time and testing requirements:

- **Content changes** → Fast Hugo rebuild (~30s) with validation
- **Infrastructure changes** → Comprehensive testing (~5min) including E2E
- **Documentation changes** → Validation only (~1min)

This prevents unnecessary testing when just updating blog posts, while catching infrastructure issues early.

---

## Build Commands

### Automatic Path Detection

```bash
# Smart build - detects change type automatically
bun run build:path

# Forced comprehensive build (all tests)
bun run build:infra

# Forced content-only build (fast)
bun run build:content
```

### Manual Builds

```bash
# Quick preview build
bun run build:preview

# Production build (minified, optimized)
bun run build:production

# Build and analyze bundle size
bun run analyze
```

---

## How Path Detection Works

The `scripts/path-based-build.sh` script analyzes changed files:

### Content Changes (Blog Posts, Portfolio)
**Triggered by**: Changes in `content/` directory

```bash
# What runs:
1. Hugo build
2. Frontmatter validation (bun run validate:portfolio)
3. Link validation (htmltest)
4. No E2E tests (unnecessary)

# Time: ~30-45 seconds
```

**Example**:
```bash
git add content/blog/my-post.md
git commit -m "feat: add blog post"
bun run build:path
# Detects content/ change → runs fast build
```

### Infrastructure Changes (Layout, CSS, Config)
**Triggered by**: Changes in `layouts/`, `assets/`, `config/`, or `.github/workflows/`

```bash
# What runs:
1. Pre-commit hooks (linting, validation)
2. Hugo build (all environments)
3. Unit tests (Vitest, Go)
4. Integration tests (deployment validation)
5. E2E tests (Playwright)
6. Visual regression tests
7. Performance analysis

# Time: ~4-6 minutes
```

**Example**:
```bash
git add layouts/_default/single.html
git commit -m "feat: update single post template"
bun run build:path
# Detects layouts/ change → runs comprehensive build
```

### Documentation Changes
**Triggered by**: Changes in `docs/` directory only

```bash
# What runs:
1. Link validation (all docs)
2. Markdown linting
3. No testing (docs don't affect functionality)

# Time: ~1-2 minutes
```

**Example**:
```bash
git add docs/tutorials/GETTING_STARTED.md
git commit -m "docs: clarify setup instructions"
bun run build:path
# Detects docs/ change → validation only
```

---

## Build Environments

### Development (`config/development/hugo.toml`)
- **Minification**: Disabled (fast reload)
- **Fingerprinting**: Disabled (caching not needed)
- **Build flags**: `-D` (include drafts)
- **Output**: For localhost testing
- **Base URL**: `http://localhost:1313`

### Staging (`config/staging/hugo.toml`)
- **Minification**: Enabled (realistic testing)
- **Fingerprinting**: Enabled (cache validation)
- **Build flags**: Production flags
- **Output**: For pre-production testing
- **Base URL**: Staging domain

### Production (`config/production/hugo.toml`)
- **Minification**: Enabled (optimized)
- **Fingerprinting**: Enabled (cache busting)
- **Analytics**: Production tracking
- **Security headers**: Enabled
- **Output**: For live deployment
- **Base URL**: `https://peterwarnock.com`

### Build Command by Environment

```bash
# Development (with drafts)
HUGO_ENV=development hugo --gc

# Staging (production settings, staging domain)
HUGO_ENV=staging hugo --gc --minify --enableGitInfo

# Production (optimized, production domain)
HUGO_ENV=production hugo --gc --minify --enableGitInfo
```

---

## Build Flow Diagram

```
Changed Files
    ↓
Path Detection
    ├─ content/ → Content Build
    │   ├─ Hugo rebuild
    │   ├─ Validation
    │   └─ ~30s
    │
    ├─ layouts/, assets/, config/ → Infrastructure Build
    │   ├─ Hugo rebuild (all envs)
    │   ├─ Unit tests
    │   ├─ Integration tests
    │   ├─ E2E tests
    │   ├─ Visual tests
    │   └─ ~5min
    │
    └─ docs/ → Documentation Build
        ├─ Link validation
        ├─ Markdown lint
        └─ ~1min
```

---

## Pre-commit Hooks

All builds run pre-commit validation before allowing commits:

```bash
git commit -m "my changes"
# Automatically runs:
# ✅ YAML linting (.github/workflows/)
# ✅ TOML validation (hugo.toml, config/*.toml)
# ✅ CSS linting (Tailwind, DaisyUI)
# ✅ Blog frontmatter validation
# ✅ Markdown linting
# ✅ Secret detection (gitleaks)
# ✅ HTML validation

# If any check fails, commit is rejected
# Fix the issues and retry
```

See `.husky/pre-commit` for implementation details.

---

## Post-Build Cleanup

After successful builds:

```bash
# Remove system-reminder comments from HTML
find public -name '*.html' -exec \
  sed -i '' '/<system-reminder>/,/<\/system-reminder>/d' {} \;

# Clear unnecessary files
rm -rf resources/ .hugo_build.lock
```

---

## CSS & Asset Pipeline

### CSS Processing

```bash
# Watch CSS during development
bun run css:watch

# Build CSS once
bun run css:build

# CSS is processed by:
# 1. Tailwind CSS (@tailwindcss/cli)
# 2. PostCSS (plugins in postcss.config.cjs)
# 3. Hugo asset pipeline
```

**CSS Input**: `assets/css/main.css`  
**CSS Output**: `static/css/main.css`  
**Output Format**: `static/css/main-[hash].css` (production with fingerprint)

### Asset Optimization

```bash
# Analyze build artifacts
bun run analyze

# Output shows:
# - Bundle size breakdown
# - Asset compression ratios
# - Performance metrics
```

---

## Version Management

### Version Sync

The build system keeps version consistent across files:

```bash
# Version lives in package.json
# Build process syncs to data/version.toml
# Which is used in site footer

package.json → build → data/version.toml → site footer
```

### Version Bumping

```bash
# Semantic versioning via commits
git commit -m "feat: new feature"     # Bumps MINOR version
git commit -m "fix: bug fix"          # Bumps PATCH version
git commit -m "docs: documentation"   # No version bump

# Pre-commit hook in .husky/prepare-commit-msg
# Checks for conventional commit format
# Enforces consistent versioning
```

---

## Build Optimization Tips

### Speed Up Development

```bash
# Run just Hugo without tests
hugo server -D

# Build content only (fastest)
bun run build:content

# Skip image processing (if not changing images)
# Comment out image processing in hugo.toml
```

### Monitor Build Performance

```bash
# Time a build
time bun run build:production

# Profile Hugo
hugo --logLevel debug

# Monitor CSS changes
bun run css:watch

# Watch tests while developing
bun run test:watch
```

### Reduce Build Time

1. **Disable minification during development**
   - Already disabled in `config/development/hugo.toml`

2. **Skip image processing**
   - Remove image processing directives if not needed

3. **Use path-based builds**
   - Only runs necessary tests for your changes

4. **Clean cache between builds**
   ```bash
   rm -rf resources/ .hugo_build.lock
   hugo --gc
   ```

---

## Troubleshooting Build Issues

### Build Fails with "CSS not found"

```bash
# CSS file not generating
rm -f static/css/main.css
bun run build:preview
# Wait for Hugo to recompile

# Or rebuild CSS manually
bun run css:build
```

### Build Hangs

```bash
# Kill existing Hugo process
bun run dev:delete

# Clear cache
rm -rf resources/ .hugo_build.lock

# Restart
bun run dev
```

### Port Already in Use

```bash
# Find process using port 1313
lsof -i :1313

# Kill it
kill -9 <PID>

# Or use different port
hugo server --port 1314
```

### Pre-commit Hooks Blocking Commit

```bash
# See what failed
git commit -m "my changes"
# Error message shows which check failed

# Fix the issue
bun run lint:css --fix    # Auto-fix CSS
bun run format            # Auto-format code

# Retry commit
git commit -m "my changes"

# Skip hooks only if absolutely necessary (not recommended)
git commit --no-verify -m "my changes"
```

---

## CI/CD Integration

GitHub Actions uses the same build system:

```yaml
# .github/workflows/build.yml
- name: Detect changes and build
  run: bun run build:path

# This triggers the appropriate build based on what changed
# Content changes → fast build
# Infrastructure → comprehensive testing
# Documentation → validation only
```

---

## Build Artifacts

### Output Directories

- **`public/`** - Final built site (ignored by git, generated on each build)
- **`resources/`** - Hugo cache (ignored by git, regenerated as needed)
- **`static/css/`** - Compiled CSS files

### Keep These in Git

- **`config/`** - Hugo configurations
- **`layouts/`** - Templates
- **`content/`** - Markdown content
- **`assets/`** - Source CSS/SCSS
- **`static/`** - Static files (except compiled CSS)

---

## See Also

- [TESTING_ARCHITECTURE.md](/docs/development/TESTING_ARCHITECTURE.md) - Test types and coverage
- [STYLE_GUIDE.md](/docs/development/STYLE_GUIDE.md) - CSS conventions and design system
- [RELEASE_WORKFLOW.md](/docs/operations/RELEASE_WORKFLOW.md) - How builds connect to releases
- [scripts/path-based-build.sh](/scripts/path-based-build.sh) - Implementation details
