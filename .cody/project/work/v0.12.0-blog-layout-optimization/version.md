# Version v0.12.0-blog-layout-optimization

**Status:** Planning  
**Created:** 2025-11-05  
**Priority:** High

## Version Summary

Major improvements to blog post layout, image handling, and media embed support
following best practices from GitHits and DaisyUI research.

## Features

### Blog Layout Optimization

- Implement DaisyUI `card-side` layout for responsive blog posts
- Optimize image sizing to 320x240px (mobile) and 288x216px (desktop)
- Improve text wrapping and visual hierarchy
- Enhanced responsive design with proper mobile/desktop behavior

### Image Management

- Restore missing blog post images from git history
- Fix image path resolution for thumbnails
- Add proper image sizing and object-fit handling
- Implement skeleton placeholders for posts without images

### Media Embed Support

- Create YouTube shortcode with privacy-enhanced embeds
- Fix CSP configuration to allow YouTube embeds
- Add proper iframe security policies
- Support for responsive video containers

### Configuration & Validation

- Environment-based configuration system (dev/prod)
- Blog post validation scripts
- Hardcoded URL checking
- Updated development guidelines

### Documentation

- Update STYLE_GUIDE.md with blog post creation guidelines
- Add image requirements and best practices
- Document validation processes

## Technical Changes

- Updated `layouts/partials/components/card-list.html`
- Created `layouts/shortcodes/youtube.html`
- Modified CSP in `layouts/_default/baseof.html`
- Added environment configs in `config/`
- Created validation scripts in `scripts/`
- Restored images to `static/images/blog/`

## Success Criteria

- [x] Blog posts display with optimal image sizes
- [x] YouTube embeds work properly
- [x] All missing images restored
- [x] Responsive layout works on mobile/desktop
- [x] Validation scripts functional
- [x] Documentation updated

## Release Notes

This release significantly improves the blog reading experience with properly
sized images, working YouTube embeds, and responsive design following industry
best practices.
