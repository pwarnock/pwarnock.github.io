# DaisyUI Best Practices Guide

## Overview

This guide ensures proper use of DaisyUI's semantic theme system for consistent,
theme-aware components.

## Core Principles

### 1. Use Semantic Color Classes

Always use DaisyUI's semantic color classes instead of manual styling:

```html
<!-- ✅ Correct - Uses DaisyUI semantic colors -->
<div class="card card-primary">
  <div class="card-body">
    <h3 class="card-title">Title</h3>
    <p class="text-sm opacity-90">Description</p>
  </div>
</div>

<!-- ❌ Incorrect - Manual color overrides -->
<div class="card bg-primary/20 text-primary-content">
  <div class="card-body">
    <h3 class="card-title text-primary">Title</h3>
    <p class="text-base-content/90">Description</p>
  </div>
</div>
```

### 2. Leverage Built-in Component Variants

Use DaisyUI's built-in variants for automatic theme adaptation:

```html
<!-- ✅ Correct - Theme-aware -->
<div class="card card-primary card-border hover:shadow-xl">
  <div class="btn btn-primary">
    <div class="badge badge-secondary">
      <!-- ❌ Incorrect - Manual theming -->
      <div class="card bg-gradient-to-br from-primary/25 to-primary/15">
        <div class="btn bg-blue-500 hover:bg-blue-600">
          <div class="badge bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3. Let DaisyUI Handle Text Colors

DaisyUI automatically sets appropriate text colors for contrast:

```html
<!-- ✅ Correct - Automatic contrast -->
<div class="card card-primary">
  <h3 class="card-title">Title</h3>
  <!-- Automatically white on primary -->
  <p class="opacity-90">Description</p>
  <!-- Automatically readable -->
</div>

<!-- ❌ Incorrect - Manual text colors -->
<div class="card card-primary">
  <h3 class="card-title text-primary-content">Title</h3>
  <p class="text-base-content/90">Description</p>
</div>
```

## Component Guidelines

### Cards

Use semantic card classes for theme-aware styling:

```html
<!-- Basic colored cards -->
<div class="card card-primary">
  <!-- Blue background -->
  <div class="card card-secondary">
    <!-- Gray background -->
    <div class="card card-accent">
      <!-- Purple background -->
      <div class="card card-info">
        <!-- Teal background -->

        <!-- With borders -->
        <div class="card card-primary card-border">
          <!-- Hover effects -->
          <div class="card card-primary hover:shadow-xl hover:scale-105"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Buttons

Use semantic button variants:

```html
<div class="btn btn-primary">
  <!-- Blue -->
  <div class="btn btn-secondary">
    <!-- Gray -->
    <div class="btn btn-accent">
      <!-- Purple -->
      <div class="btn btn-success">
        <!-- Green -->
        <div class="btn btn-warning">
          <!-- Yellow -->
          <div class="btn btn-error"><!-- Red --></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Badges

Use semantic badge variants:

```html
<div class="badge badge-primary">
  <!-- Blue -->
  <div class="badge badge-secondary">
    <!-- Gray -->
    <div class="badge badge-info"><!-- Teal --></div>
  </div>
</div>
```

## Theme Integration

### Automatic Theme Adaptation

DaisyUI components automatically adapt to theme changes:

```html
<!-- These will automatically change colors when theme switches -->
<div class="card card-primary">
  <div class="btn btn-secondary">
    <div class="badge badge-accent"></div>
  </div>
</div>
```

### Available Themes

Common themes to test against:

- `light` - Clean light theme
- `dark` - Dark theme for low-light
- `corporate` - Professional business theme
- `cupcake` - Sweet pink theme
- `emerald` - Green nature theme

## Common Mistakes to Avoid

### 1. Manual Color Overrides

```html
<!-- ❌ Don't manually override colors -->
<div class="card card-primary" style="background: custom-color;">
  <div class="card card-primary bg-custom-color"></div>
</div>
```

### 2. Fixed Opacity Values

```html
<!-- ❌ Don't use fixed opacity -->
<div class="card bg-primary/20">
  <!-- ✅ Let DaisyUI handle opacity -->
  <div class="card card-primary"></div>
</div>
```

### 3. Custom Glass Morphism

```html
<!-- ❌ Don't create custom glass effects -->
<div class="card" style="background: rgba(255,255,255,0.1); backdrop-filter: blur();">
  <!-- ✅ Use DaisyUI's built-in styling -->
  <div class="card card-glass">
    <!-- If available -->
    <div class="card"><!-- Standard styling --></div>
  </div>
</div>
```

## Testing Guidelines

### Cross-Theme Testing

Always test components across multiple themes:

1. Switch between light/dark themes
2. Test with colorful themes (cupcake, emerald)
3. Verify contrast ratios in each theme
4. Check hover states and interactions

### Accessibility Testing

- Use DaisyUI's semantic colors for WCAG compliance
- Test with screen readers
- Verify keyboard navigation
- Check color contrast in all themes

## Carousel Specific Guidelines

### Slide Cards

```html
<!-- ✅ Correct - Theme-aware carousel cards -->
<div class="card card-primary card-border hover:shadow-xl transition-all duration-300">
  <div class="card-body p-3 text-center">
    <h3 class="card-title font-semibold">Title</h3>
    <p class="text-sm opacity-90">Description</p>
  </div>
</div>
```

### Slide Container

```html
<!-- ✅ Correct - Transparent slide container -->
<div class="slide-content">
  <!-- Cards handle their own styling -->
</div>

<!-- ❌ Incorrect - Custom slide background -->
<div class="slide-content" style="background: rgba(255,255,255,0.1);">
  <!-- Interferes with card colors -->
</div>
```

## Migration Checklist

When updating existing components:

1. **Remove manual backgrounds**: `bg-primary/20` → `card-primary`
2. **Remove manual text colors**: `text-primary-content` → let DaisyUI handle
3. **Use semantic variants**: `bg-gradient-to-br` → `card-primary`
4. **Add borders if needed**: `card-border`
5. **Test across themes**: Verify in light, dark, and colorful themes
6. **Check accessibility**: Ensure contrast ratios are maintained

## Resources

- [DaisyUI Documentation](https://daisyui.com/)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [Component Gallery](https://daisyui.com/components/)

## Quick Reference

| Component | Semantic Classes      | Auto Theme? |
| --------- | --------------------- | ----------- |
| Card      | `card card-{color}`   | ✅          |
| Button    | `btn btn-{color}`     | ✅          |
| Badge     | `badge badge-{color}` | ✅          |
| Alert     | `alert alert-{color}` | ✅          |
| Input     | `input input-{color}` | ✅          |

Remember: **Let DaisyUI handle theming, don't fight the framework!**
