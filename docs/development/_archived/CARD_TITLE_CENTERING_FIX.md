# Hero Card Title Centering Fix

## Problem

Hero carousel card titles were not centering despite having `text-center` class
due to DaisyUI's `.card-title` CSS overriding text alignment.

## Root Cause

DaisyUI's `.card-title` class has its own CSS that was overriding the
`text-center` class, even with `!important` modifier due to CSS specificity and
load order.

## Solution

**Remove DaisyUI's `card-title` class** from hero card titles and use standard
heading classes with `text-center`.

### Before (Not Working)

```html
<h3 class="card-title text-base lg:text-lg font-semibold text-base-content mb-1 !text-center">
  {{ .title }}
</h3>
```

### After (Working)

```html
<h3 class="text-base lg:text-lg font-semibold text-base-content mb-1 text-center">{{ .title }}</h3>
```

## Files Changed

- `layouts/partials/components/hero-classic.html` - Removed `card-title` from
  role cards
- `layouts/partials/components/hero-intro.html` - Removed `card-title` from
  feature cards

## CSS Cleanup

Removed unnecessary CSS overrides from `assets/css/components/carousel.css`:

```css
/* Removed - no longer needed */
.slide-content .card .card-title,
.slide-content .card-body .card-title,
.slide-content .text-center .card-title {
  font-weight: 700;
  letter-spacing: -0.025em;
  text-align: center !important;
}
```

## Verification

- ✅ Hero card titles are now properly centered
- ✅ Consistent with content grid cards (which were already centered)
- ✅ Maintains semantic heading structure (`h3` elements)
- ✅ Preserves responsive typography classes
- ✅ Works across all themes

## SEO & Accessibility Compliance

- ✅ Proper heading hierarchy maintained (`h3` within sections)
- ✅ Text alignment improves readability
- ✅ Consistent visual design across page sections
- ✅ No impact on screen reader functionality

## Best Practice Documentation

This approach aligns with DaisyUI best practices:

- Use semantic HTML structure without conflicting component classes
- Apply utility classes directly when component classes interfere
- Maintain theme-aware styling through DaisyUI's color system
- Ensure consistent text alignment across similar elements
