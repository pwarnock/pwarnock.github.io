# Version v0.9.1-bugfixes

## Overview

Post-release bug fixes and CI/CD pipeline stabilization for v0.9.0 design
system.

## Objectives

- Fix navigation component logo display regression
- Stabilize GitHub Actions CI/CD pipeline
- Improve build configuration

## Key Fixes

- Restored logo display in navigation header
- Fixed PostCSS configuration in Hugo build
- Removed npm install flags causing LightningCSS installation failures
- Added stylelint configuration for CSS linting

## Release Summary

- **Status**: ✅ COMPLETED
- **Release Date**: October 27, 2025
- **Git Tag**: v0.9.1
- **Commits**: 10
- **Key Issues Resolved**: Navigation logo fix, CI/CD pipeline stabilization

## Changes

1. **Navigation Logo Fix** - Refactored button partial usage in navigation
   component to restore logo display
2. **CI/CD Updates** - Removed --no-optional flag, added PostCSS CLI, configured
   Hugo build settings
3. **Build Configuration** - Added .stylelintrc.json for CSS validation,
   disabled JS config in Hugo assets

## Dependencies

- Hugo build system
- PostCSS pipeline
- GitHub Actions CI/CD
- npm dependencies
