# Design - v0.9.1-bugfixes

## Overview

This patch release focused on fixing regressions introduced in v0.9.0 and
stabilizing the build pipeline.

## Architecture Changes

### Navigation Component Refactoring

- Removed button partial dependency that was causing logo display regression
- Implemented direct `<a>` tag with component classes for consistency
- Maintained accessibility attributes (aria-label, role="button")
- Preserved logo image styling and hover effects

### CI/CD Pipeline Stabilization

- Removed `--no-optional` flag from npm install to allow LightningCSS
  installation
- Added PostCSS CLI global installation in GitHub Actions
- Updated Hugo configuration to disable JS config in assets
- Added .stylelintrc.json for CSS validation

## Technical Decisions

1. **Button Partial Removal**: Reverted to using component classes directly
   instead of partial, which was more reliable for the navigation logo use case

2. **LightningCSS Support**: Enabled optional dependencies to allow LightningCSS
   (Tailwind CSS v4 dependency) to install properly

3. **Hugo Build Config**: Added `noJSConfigInAssets = true` to prevent
   unnecessary JS processing in asset pipeline

## Dependencies

- Hugo (latest stable)
- Tailwind CSS v4.1.16 with LightningCSS
- PostCSS CLI
- GitHub Actions for CI/CD
