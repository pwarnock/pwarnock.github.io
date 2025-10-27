# Deployment Notes & Critical Fixes

## 🚨 Critical Issues

### 1. CSS Processing Issue

### Problem
When moving CSS files from `assets/` to `static/` to bypass PostCSS issues, the CSS file still contained unprocessed Tailwind directives:
```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: all;
}
```

### Solution
**ALWAYS** process CSS with Tailwind CLI before moving to static:
```bash
npx tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --postcss
```

### Why This Happens
- Hugo's `assets/` directory processes files with PostCSS
- Moving to `static/` bypasses PostCSS processing
- Unprocessed `@import` directives break styling
- CSS loads but contains no actual styles

### Prevention Checklist
Before any deployment:
1. ✅ Check if CSS contains `@import` or `@plugin` directives
2. ✅ If yes, process with Tailwind CLI first
3. ✅ Verify generated CSS contains actual utility classes
4. ✅ Test locally before pushing

## 🔄 Deployment Process

### Standard Deployment
```bash
# 1. Build and test locally
npm run build

# 2. If CSS issues, process manually
npx tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --postcss

# 3. Test again
npm run build

# 4. Commit and push
git add .
git commit -m "deployment: ..."
git push upstream main
```

### CI/CD Pipeline Issues
- PostCSS binary not found in CI environment
- Solution: Pre-process CSS or use static files
- Never rely on Hugo's PostCSS in CI

## 📋 Pre-Deployment Checklist

### CSS Validation
- [ ] CSS file contains actual styles (not just @import directives)
- [ ] All Tailwind classes are present in compiled CSS
- [ ] DaisyUI components are styled correctly
- [ ] No PostCSS processing errors

### Build Validation
- [ ] `npm run build` completes successfully
- [ ] 209+ pages generated
- [ ] No CSS processing errors
- [ ] Site loads correctly in dev server

### Git Validation
- [ ] All changes committed
- [ ] Pushed to upstream/main
- [ ] CI/CD pipeline completes successfully

## 🚨 Recovery Steps

If Site Styling Breaks:
1. **Immediate**: Check CSS file content
2. **Process**: `npx tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --postcss`
3. **Test**: `npm run build`
4. **Deploy**: Commit and push

## 📝 Lessons Learned

1. **Never bypass PostCSS without processing CSS first**
2. **Always verify CSS contains actual styles, not directives**
3. **Test locally after any CSS changes**
4. **Document CSS processing requirements**

---

### 2. GitHub Pages Deployment Issue

### Problem
Deployment fails with "The process '/usr/bin/git' failed with exit code 128"

### Simple Solution (REVERTED)
Use the proven `peaceiris/actions-gh-pages@v4` workflow:
```yaml
name: Deploy Hugo site to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        submodules: recursive
        fetch-depth: 0

    - name: Setup Hugo
      uses: peaceiris/actions-hugo@v3
      with:
        hugo-version: 'latest'
        extended: true

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build with Hugo
      run: hugo --minify --gc

    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./public
```

### Why This Works
- No complex Pages configuration needed
- Proven deployment method
- Simple permissions (contents: read, deployments: write)
- No Git authentication issues

### Root Causes
1. **Repository Settings**: GitHub Pages not configured to accept deployments from GitHub Actions
2. **Token Permissions**: GITHUB_TOKEN lacks necessary permissions
3. **Branch Protection**: Main branch has restrictions preventing deployment

### Solutions

#### Option 1: Repository Settings (Recommended)
1. Go to repository Settings → Pages
2. Set "Source" to "GitHub Actions" 
3. Ensure deployment branch is "main"
4. Save settings

#### Option 2: Branch Protection
1. Go to Settings → Branches → main
2. Check if restrictions prevent GitHub Actions
3. Add GitHub Actions to allowed list if needed

#### Option 3: Token Permissions
1. Verify workflow has correct permissions:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

### Verification
After fixing, check:
- [ ] Pages source is set to "GitHub Actions"
- [ ] No branch protection conflicts
- [ ] Workflow completes successfully

---

**Last Updated**: October 27, 2025  
**Critical Issues**: 
1. ✅ CSS processing with Tailwind directives - RESOLVED
2. ✅ GitHub Pages deployment failure - RESOLVED

---

## 🚨 CI/CD Pipeline Configuration - CRITICAL

### Problem
Multiple workflow files caused confusion and deployment failures:
- `deploy.yml` - Simple single-job workflow (limited functionality)
- `cicd.yml` - Robust multi-job pipeline (correct approach)

### Solution - ALWAYS USE THE ROBUST CI/CD PIPELINE

The correct CI/CD pipeline (`cicd.yml`) must have:

#### 1. Proper Permissions
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

#### 2. Separate Build and Deploy Jobs
```yaml
jobs:
  build:    # Builds and tests
  deploy:   # Only runs after successful build
```

#### 3. Concurrency Control
```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

#### 4. Official GitHub Pages Actions
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

#### 5. Environment Configuration
```yaml
deploy:
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
```

### Why This Matters
- **Single-job workflows** (like `deploy.yml`) have limited functionality
- **Multi-job pipelines** provide proper artifact handling and testing
- **Official actions** ensure compatibility and security
- **Environment setup** enables proper GitHub Pages integration

### Prevention Checklist
Before any deployment changes:
1. ✅ Verify `cicd.yml` is the active workflow
2. ✅ Check permissions include `pages: write` and `id-token: write`
3. ✅ Ensure separate build/deploy jobs exist
4. ✅ Confirm official GitHub Pages actions are used
5. ✅ Validate environment configuration is present
6. ✅ Remove or disable `deploy.yml` if it exists

### Recovery Steps
If deployment fails:
1. **Check workflow**: Verify `cicd.yml` is being used
2. **Verify permissions**: Ensure proper GitHub Pages permissions
3. **Check environment**: Confirm `github-pages` environment exists
4. **Review logs**: Look for artifact upload/deployment errors
5. **Restore pipeline**: Copy from this document if needed

### NEVER USE
- Single-job workflows for production deployments
- `peaceiris/actions-gh-pages@v4` (use official `actions/deploy-pages@v4`)
- Missing environment configuration
- Incorrect permissions (only `contents: read` is insufficient)

---

**CRITICAL REMINDER**: Always maintain the robust `cicd.yml` pipeline structure. Never revert to simplified single-job workflows for production deployments.
