# DaisyUI Design System Integration

## Overview

This project uses DaisyUI's native CSS variable system combined with Tailwind
CSS utilities for consistent design tokens across all components.

## DaisyUI's CSS Variable System

### DaisyUI Native Variables

DaisyUI provides its own comprehensive CSS variable system:

```css
/* Color Variables */
--color-primary: oklch(55% 0.3 240);
--color-primary-content: oklch(98% 0.01 240);
--color-secondary: oklch(70% 0.25 200);
--color-secondary-content: oklch(98% 0.01 200);
--color-accent: oklch(65% 0.25 160);
--color-accent-content: oklch(98% 0.01 160);

/* Sizing Variables */
--radius-selector: 1rem; /* For checkboxes, toggles, badges */
--radius-field: 0.25rem; /* For buttons, inputs, tabs */
--radius-box: 0.5rem; /* For cards, modals, alerts */
--size-selector: 0.25rem; /* Base size for selectors */
--size-field: 0.25rem; /* Base size for fields */

/* Border & Effects */
--border: 1px;
--depth: 1; /* 3D depth effect */
--noise: 0; /* Grain effect */
```

### Theme Customization

```css
[data-theme='mytheme'] {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --radius-field: 0.5rem;
}
```

## Component Usage

### Buttons (DaisyUI Approach)

```html
<!-- Use DaisyUI component classes -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-ghost">Ghost Button</button>

<!-- Size variants -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-md">Medium</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Icons (Tailwind Approach)

```html
<!-- Use Tailwind sizing classes -->
<svg class="w-4 h-4">...</svg>
<!-- 16px -->
<svg class="w-5 h-5">...</svg>
<!-- 20px -->
<svg class="w-6 h-6">...</svg>
<!-- 24px -->
```

### Spacing (Tailwind Approach)

```html
<!-- Use Tailwind spacing utilities -->
<div class="gap-2 p-4 mb-6">
  <!-- gap-2 = 0.5rem gap -->
  <!-- p-4 = 1rem padding -->
  <!-- mb-6 = 1.5rem margin-bottom -->
</div>
```

## File Structure

```
assets/css/
├── main.css              # Main entry point with DaisyUI imports
├── components/
│   ├── buttons.css       # Custom button overrides (minimal)
│   ├── cards.css         # Custom card overrides (minimal)
│   ├── icons.css        # Icon utilities (minimal)
│   └── focus.css        # Focus management styles
├── layout/
│   ├── hero.css         # Hero section styles
│   ├── responsive.css   # Responsive utilities
│   └── embeds.css      # Media embed styles
└── content/
    ├── prose.css        # Typography styles
    ├── code.css         # Code block styles
    └── tables.css      # Table styles
```

## Implementation Notes

### DaisyUI Integration

- **Colors**: Use DaisyUI theme variables (`--color-primary`, etc.)
- **Components**: Use DaisyUI component classes (`btn`, `card`, `navbar`)
- **Theming**: Override DaisyUI variables in `[data-theme]` selectors

### Tailwind Integration

- **Spacing**: Use Tailwind spacing utilities (`gap-2`, `p-4`, `m-6`)
- **Sizing**: Use Tailwind size utilities (`w-6`, `h-6`)
- **Layout**: Use Tailwind layout utilities (`flex`, `grid`, `hidden`)

### Custom CSS (Minimal)

Only use custom CSS for:

- Focus management enhancements
- Custom animations
- Specific component overrides
- Accessibility improvements

## Best Practices

### 1. Prioritize DaisyUI Classes

```html
<!-- ✅ Good: Use DaisyUI component classes -->
<button class="btn btn-primary">Button</button>
<div class="card">Card content</div>
<nav class="navbar">Navigation</nav>

<!-- ❌ Avoid: Custom component classes -->
<button class="my-custom-button">Button</button>
```

### 2. Use Tailwind for Utilities

```html
<!-- ✅ Good: Use Tailwind for spacing/sizing -->
<div class="gap-4 p-6 w-full">
  <div class="hidden md:flex">
    <!-- ❌ Avoid: Custom spacing variables -->
    <div class="custom-spacing" style="gap: var(--space-4)"></div>
  </div>
</div>
```

### 3. Override DaisyUI Variables for Theming

```css
/* ✅ Good: Override DaisyUI theme variables */
[data-theme='corporate'] {
  --color-primary: #4f46e5;
  --radius-field: 0.375rem;
}

/* ❌ Avoid: Custom color systems */
.my-theme {
  --my-primary: #4f46e5;
}
```

### 4. Minimal Custom CSS

Only write custom CSS when absolutely necessary:

- Focus management
- Custom animations
- Accessibility enhancements
- Specific DaisyUI overrides

## Troubleshooting

### Component Not Working

1. **Check DaisyUI classes**: Ensure correct component classes
2. **Verify Tailwind classes**: Check utility class names
3. **Theme variables**: Confirm theme variables are set
4. **CSS specificity**: Check if custom CSS overrides DaisyUI

### Theme Issues

1. **Check data-theme**: Ensure `data-theme` attribute is set
2. **Verify variables**: Confirm theme variables are defined
3. **CSS cascade**: Check selector specificity

### Responsive Issues

1. **Tailwind responsive**: Use `md:`, `lg:`, etc.
2. **DaisyUI responsive**: Some components have responsive variants
3. **Test breakpoints**: Use browser dev tools

## Migration from Custom Variables

### Before (Custom Variables)

```css
:root {
  --space-2: 0.5rem;
  --button-height-md: 2.5rem;
  --icon-size-md: 1.5rem;
}

.custom-button {
  height: var(--button-height-md);
  gap: var(--space-2);
}
```

### After (DaisyUI + Tailwind)

```html
<button class="btn btn-primary gap-2 h-10">
  <!-- gap-2 = Tailwind spacing -->
  <!-- h-10 = Tailwind height -->
</button>
```

## Benefits of This Approach

1. **Consistency**: DaisyUI ensures component consistency
2. **Maintainability**: Less custom CSS to maintain
3. **Performance**: Optimized DaisyUI CSS
4. **Accessibility**: Built-in accessibility features
5. **Theming**: Easy theme customization
6. **Documentation**: Well-documented component system

## When to Use Custom CSS

Only use custom CSS for:

- **Brand-specific styling** not covered by DaisyUI
- **Complex animations** beyond DaisyUI scope
- **Accessibility enhancements** for specific use cases
- **Performance optimizations** for critical components

In most cases, DaisyUI + Tailwind should handle all styling needs.
