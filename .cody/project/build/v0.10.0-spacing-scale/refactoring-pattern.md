# Refactoring Pattern: Spacing Scale with CSS Variables

## Goal
Replace 250+ hardcoded Tailwind spacing utilities with CSS variable tokens while maintaining responsive behavior.

## CSS Variable Reference

From `assets/css/main.css`:
```css
--space-0: 0
--space-1: 0.25rem
--space-2: 0.5rem
--space-3: 0.75rem
--space-4: 1rem
--space-5: 1.25rem
--space-6: 1.5rem
--space-8: 2rem
--space-10: 2.5rem
--space-12: 3rem
--space-16: 4rem
--space-20: 5rem
--space-24: 6rem
--space-32: 8rem
```

## Pattern Mapping

### Pattern 1: Simple Spacing (No Responsive)

**Before:**
```html
<div class="mb-6">
  <h1>Title</h1>
</div>
```

**After:**
```html
<div style="margin-bottom: var(--space-6)">
  <h1>Title</h1>
</div>
```

**When to use:** Single spacing value with no responsive variants

---

### Pattern 2: Responsive Spacing

**Before:**
```html
<header class="mb-12 lg:mb-16">
  <!-- content -->
</header>
```

**After (Option A - CSS class):**
Create utility class in main.css:
```css
.mb-responsive-lg {
  margin-bottom: var(--space-12);
}

@media (min-width: 1024px) {
  .mb-responsive-lg {
    margin-bottom: var(--space-16);
  }
}
```

Then use:
```html
<header class="mb-responsive-lg">
  <!-- content -->
</header>
```

**After (Option B - Inline style with CSS variable fallback):**
```html
<header style="--mb-mobile: var(--space-12); --mb-lg: var(--space-16); margin-bottom: var(--mb-mobile);" class="lg:[margin-bottom:var(--mb-lg)]">
  <!-- content -->
</header>
```

**Recommendation:** Use Option A (CSS class) for maintainability.

---

### Pattern 3: Multi-Direction Spacing (Padding)

**Before:**
```html
<div class="p-8 lg:p-12">
  Content
</div>
```

**After (CSS class):**
```css
.p-responsive-md {
  padding: var(--space-8);
}

@media (min-width: 1024px) {
  .p-responsive-md {
    padding: var(--space-12);
  }
}
```

Usage:
```html
<div class="p-responsive-md">
  Content
</div>
```

---

### Pattern 4: Gap (Flex/Grid)

**Before:**
```html
<div class="flex flex-wrap gap-2">
  <button>Item 1</button>
  <button>Item 2</button>
</div>
```

**After:**
```html
<div class="flex flex-wrap" style="gap: var(--space-2)">
  <button>Item 1</button>
  <button>Item 2</button>
</div>
```

Or create utility class:
```css
.gap-sm {
  gap: var(--space-2);
}

.gap-md {
  gap: var(--space-4);
}

.gap-lg {
  gap: var(--space-6);
}
```

---

### Pattern 5: Complex Responsive (Multiple Values)

**Before:**
```html
<div class="p-4 lg:p-8 gap-2 lg:gap-4">
  Content
</div>
```

**After:**
```css
.card-responsive {
  padding: var(--space-4);
  gap: var(--space-2);
}

@media (min-width: 1024px) {
  .card-responsive {
    padding: var(--space-8);
    gap: var(--space-4);
  }
}
```

Usage:
```html
<div class="card-responsive">
  Content
</div>
```

---

## Implementation Strategy for single.html

### Step 1: Identify All Spacing Classes
Scan `layouts/_default/single.html` for:
- `mb-*`, `mt-*`, `p-*`, `px-*`, `py-*`, `gap-*`, `ml-*`, `mr-*`

### Step 2: Group by Pattern
- **Pattern 1** (no responsive): Use inline style
- **Pattern 2** (responsive): Create CSS utility classes
- **Pattern 3+** (complex): Create semantic CSS classes

### Step 3: Create Supporting CSS Classes in main.css

Example additions to `assets/css/main.css`:

```css
/* Spacing Utility Classes for Templates */

/* Responsive margin bottom */
.mb-responsive-lg {
  margin-bottom: var(--space-12);
}

@media (min-width: 1024px) {
  .mb-responsive-lg {
    margin-bottom: var(--space-16);
  }
}

.mb-responsive-md {
  margin-bottom: var(--space-6);
}

@media (min-width: 1024px) {
  .mb-responsive-md {
    margin-bottom: var(--space-8);
  }
}

/* Responsive padding */
.p-responsive-hero {
  padding: var(--space-8);
}

@media (min-width: 1024px) {
  .p-responsive-hero {
    padding: var(--space-12);
  }
}

/* Gap utilities */
.gap-sm { gap: var(--space-2); }
.gap-md { gap: var(--space-4); }
.gap-lg { gap: var(--space-6); }
```

### Step 4: Update single.html

Replace:
```html
<header class="text-center mb-12 lg:mb-16 relative">
  <div class="p-8 lg:p-12">
```

With:
```html
<header class="text-center mb-responsive-lg relative">
  <div class="p-responsive-hero">
```

---

## Benefits

✅ **Consistency** — All spacing uses tokens, no arbitrary values
✅ **Maintainability** — Change token value, updates everywhere
✅ **Scalability** — Easy to add responsive variants
✅ **Documentation** — CSS variables are self-documenting
✅ **Less Context** — Agent can reason about spacing in one place

---

## Validation Checklist

Before considering refactoring complete:
- [ ] All hardcoded spacing replaced with CSS variables
- [ ] Visual appearance identical to before
- [ ] Responsive breakpoints still work correctly
- [ ] No inline `style` attributes (except where necessary)
- [ ] New CSS classes documented in main.css
- [ ] No regression in template rendering
