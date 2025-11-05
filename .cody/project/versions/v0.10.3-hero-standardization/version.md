# Version v0.10.3-hero-standardization

## Overview

Complete hero standardization and breadcrumb system implementation across all
content types.

## Features Added

- Full-width hero backgrounds for all single pages (blog, portfolio, tools)
- Responsive title sizing with clamp() for better readability
- Reusable breadcrumbs component with proper navigation hierarchy
- Enhanced accessibility with proper ARIA attributes

## Technical Improvements

- Fixed date color visibility with text-primary-content
- Removed duplicate breadcrumbs and subtitle content
- Updated ecosystem config for dynamic URL generation
- Established semantic HTML5 structure with proper landmarks

## Files Modified

- layouts/\_default/baseof.html: Hero logic and breadcrumb placement
- layouts/\_default/single.html: Cleaned up duplicate elements
- layouts/partials/components/hero-\*.html: Responsive titles & color fixes
- layouts/partials/components/breadcrumbs.html: New navigation component
- ecosystem.config.cjs: Dynamic URL configuration

## Impact

- Consistent visual impact across all content types
- Improved accessibility and screen reader support
- Better responsive design with proper title scaling
- Enhanced user navigation with breadcrumb system
