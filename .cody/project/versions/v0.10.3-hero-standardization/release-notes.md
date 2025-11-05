# Release Notes v0.10.3-hero-standardization

## 🎯 Hero Standardization Complete

### ✨ New Features

- **Full-Width Hero Backgrounds** - All single pages now have consistent visual
  impact
- **Responsive Title Sizing** - Implemented `clamp(1.75rem, 4vw + 1rem, 3rem)`
  for optimal readability
- **Breadcrumb Navigation** - New reusable component with proper hierarchy
- **Enhanced Accessibility** - Proper ARIA attributes and semantic HTML5
  structure

### 🎨 Visual Improvements

- **Color Contrast Fixed** - Date visibility improved with
  `text-primary-content`
- **Duplicate Content Removed** - Eliminated redundant subtitles and breadcrumbs
- **Consistent Styling** - Unified hero design across blog, portfolio, and tools

### 🔧 Technical Updates

- **Dynamic URL Generation** - Fixed hardcoded URLs via ecosystem.config.cjs
- **Semantic Structure** - Proper header/main/article landmarks
- **Responsive Design** - Better mobile and desktop experience

### 📱 User Experience

- **Better Navigation** - Breadcrumbs show clear content hierarchy
- **Improved Readability** - Responsive titles scale properly across devices
- **Accessibility Compliant** - WCAG standards with screen reader support

## 🔄 Migration Notes

No breaking changes. Existing content will automatically benefit from new hero
styling and breadcrumb navigation.

## 🐛 Bug Fixes

- Fixed invisible date text on gradient backgrounds
- Removed duplicate breadcrumb navigation
- Fixed URL generation in local development

## 📊 Stats

- **10 files modified**
- **478 insertions, 152 deletions**
- **4 new hero components created**
- **1 new breadcrumb component**
