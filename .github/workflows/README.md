# CI/CD Pipeline - Working Version v1.0

## Overview

This CI/CD pipeline provides reliable build and deployment for the Hugo-based
portfolio site.

## Architecture

- **Single Job Pipeline**: `build-and-deploy`
- **Trigger**: Push to `main` or `uat` branches, PRs to `main`
- **Tools**: Bun, Hugo, GitHub Pages

## Jobs

### Build Job

1. **Checkout**: Recursive submodule checkout
2. **Setup Hugo**: Latest version with extended features
3. **Setup Pages**: Configure for GitHub Pages deployment
4. **Setup Bun**: Latest version for package management
5. **Install Dependencies**: `bun install --frozen-lockfile`
6. **Security Scan**: Audit dependencies for vulnerabilities
7. **Build**: `bun run build` (Hugo production build)
8. **Test Build**: Verify `public` directory exists
9. **Content Validation**:
   - Portfolio validation
   - Internal link checking
10. **Upload Artifact**: Send to GitHub Pages deployment

### Deploy Job

1. **Environment**: `github-pages`
2. **Trigger**: Only on `main` branch after successful build
3. **Action**: `actions/deploy-pages@v4`

## Key Features

- ✅ **Reliable Deployment**: Every main push builds and deploys
- ✅ **Security Scanning**: Automated dependency audits
- ✅ **Content Validation**: Link checking and portfolio validation
- ✅ **Modern Tooling**: Bun + Hugo + GitHub Pages
- ✅ **Version Tracking**: Automatic version data generation

## Version Management

- **Script**: `scripts/generate-version.js`
- **Data**: `data/version.toml`
- **Behavior**: Always uses `package.json` version on main branch
- **Display**: Footer shows `v{version} ({hash})`

## File Structure

```
.github/workflows/
├── cicd.yml              # Working CI/CD pipeline (this file)
└── path-based-builds.yml # Legacy file (can be removed)

scripts/
├── generate-version.js   # Version management script
└── ...                   # Other build scripts

data/
└── version.toml          # Build-time version data
```

## Maintenance Notes

- **Test Locally**: `bun run build` before pushing
- **Version Bumps**: Update `package.json` version
- **Dependencies**: Use `bun install --frozen-lockfile`
- **Hugo Config**: Extended version required for SCSS

## Future Iterations

When making changes to this pipeline:

1. **Backup First**: Copy `cicd.yml` to `cicd-v1.0-backup.yml`
2. **Test Changes**: Use feature branches for testing
3. **Validate**: Ensure builds and deployments work
4. **Document**: Update this README with changes

## Troubleshooting

- **Build Fails**: Check Hugo and Bun versions
- **Deploy Fails**: Verify GitHub Pages permissions
- **Version Wrong**: Run `bun run generate-version`
- **Links Broken**: Check `public/` directory structure

---

**Status**: ✅ **WORKING** - Deployed successfully **Last Updated**: November
19, 2025 **Version**: v0.18.2
