# Release Notes - v0.13.4

## Overview

This release focuses on making the site more data-driven and fixing theme
compatibility issues, particularly with Brave iOS night mode.

## 🚀 New Features

### Data-Driven Configuration

- **Logo Configuration**: Site logo is now configurable via `params.logo` in
  `hugo.toml`
- **Favicon Management**: All favicon paths are now configurable via Hugo
  parameters
- **Profile Images**: Hero profile images use data from `data/hero.toml` with
  fallbacks
- **Hero Content**: All hero titles, descriptions, and colors are now
  data-driven

### Theme & Accessibility Improvements

- **Brave iOS Night Mode Fix**: Prevented browser night mode from interfering
  with Alpine.js fonts
- **Corporate Theme Contrast**: Added accessibility improvements for better
  contrast in Corporate theme
- **Explicit Text Colors**: Alpine.js components now use explicit
  `text-base-content` classes

## 🐛 Bug Fixes

- Fixed Alpine.js fonts defaulting to dark mode on Brave iOS despite theme
  selection
- Resolved browser dark mode interference with theme switching

## 📚 Documentation

- Updated development workflow guide with data-driven configuration guidelines
- Added site configuration documentation for Hugo parameters

## 🔧 Technical Changes

- Modified `color-scheme` meta tag to prevent browser dark mode interference
- Updated navigation, theme selector, and hero templates to use data-driven
  content
- Added configurable favicon parameters to `hugo.toml`

## 📦 Migration Notes

- No breaking changes - all existing functionality preserved
- New configuration options are optional with sensible defaults
- Hero content now uses `data/hero.toml` instead of hardcoded values

## 🤝 Contributors

- Peter Warnock

---

**Release Date**: November 14, 2025 **Framework**: Hugo + Tailwind CSS + DaisyUI
**Status**: ✅ Production Ready</content>
<parameter name="filePath">docs/releases/RELEASE_NOTES_v0.13.4.md
