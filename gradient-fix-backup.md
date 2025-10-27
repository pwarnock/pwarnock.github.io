# Gradient Fix Changes - Backup for Step-by-Step Implementation

## Changes Made (to be applied one at a time):

### 1. CSS Loading Fix (CRITICAL)
**File**: `layouts/_default/baseof.html`
**Line 180**: Change from static CSS to Hugo asset pipeline
```html
<!-- BEFORE -->
<link rel="stylesheet" href="/css/main.css">

<!-- AFTER -->
{{ $css := resources.Get "css/main.css" | css.PostCSS | minify }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">
```

### 2. Hero Section Gradient Classes
**File**: `layouts/partials/sections/hero.html`
**Line 2**: Ensure gradient classes are present
```html
<section class="hero min-h-[60vh] sm:min-h-[70vh] hero-gradient hero-gradient-accent relative overflow-hidden" aria-labelledby="hero-heading">
```

### 3. CSS Gradient Variables (Optional - for visibility)
**File**: `assets/css/main.css`
**Lines 13-14**: Increase gradient opacity for visibility
```css
/* BEFORE */
--hero-gradient-accent-from: hsl(262, 83%, 58% / 0.3); /* Purple */
--hero-gradient-accent-to: hsl(25, 95%, 53% / 0.3); /* Orange */

/* AFTER */
--hero-gradient-accent-from: hsl(262, 83%, 58% / 0.6); /* Purple */
--hero-gradient-accent-to: hsl(25, 95%, 53% / 0.6); /* Orange */
```

### 4. Inline Style Override (Last resort)
**File**: `layouts/partials/sections/hero.html`
**Line 2**: Add inline style as backup
```html
<section class="hero min-h-[60vh] sm:min-h-[70vh] hero-gradient hero-gradient-accent relative overflow-hidden" style="background: linear-gradient(135deg, hsl(262, 83%, 58% / 0.6) 0%, hsl(280, 100%, 50% / 0.8) 50%, hsl(25, 95%, 53% / 0.6) 100%) !important;" aria-labelledby="hero-heading">
```

## Implementation Order:
1. **CSS Loading Fix** (most critical - this was the root cause)
2. **Test gradient visibility**
3. **If needed, increase opacity in CSS variables**
4. **If still not visible, use inline style override**

## Root Cause Analysis:
The gradient wasn't visible because `baseof.html` was loading static `/css/main.css` instead of processing `assets/css/main.css` through Hugo's asset pipeline. This meant custom gradient classes weren't included in the compiled CSS.

## Current Status:
- Hero section has correct classes: `hero-gradient hero-gradient-accent`
- CSS variables are defined in assets/css/main.css
- Asset pipeline fix should resolve the issue