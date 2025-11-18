# Header Navigation System

## Overview

The header navigation uses Alpine.js for interactivity, DaisyUI for styling, and
a custom CSS component system for consistent design.

## Architecture

### HTML Structure

```html
<nav
  class="navbar bg-base-100 shadow-lg sticky top-0 z-40"
  role="navigation"
  aria-label="Main navigation"
  x-data="{ mobileMenuOpen: false, socialMenuOpen: false }"
>
  <!-- Mobile Menu & Logo -->
  <div class="navbar-start">...</div>

  <!-- Desktop Navigation -->
  <div class="navbar-center hidden lg:flex">...</div>

  <!-- Theme Switcher & Social Links -->
  <div class="navbar-end">...</div>
</nav>
```

### Alpine.js Integration

- **Mobile Menu**: `x-data="{ mobileMenuOpen: false }"`
- **Social Menu**: `x-data="{ socialMenuOpen: false }"`
- **Theme Switcher**: `x-data="{ themeOpen: false }"`
- **Click Outside**: `@click.outside="variable = false"`

### Component Dependencies

#### Alpine.js (Self-hosted)

- **Location**: `assets/js/alpinejs.min.js`
- **Version**: 3.14.1
- **Loading**: Always loaded via `layouts/partials/head/cdn.html`
- **Purpose**: Interactive dropdowns, theme switching, mobile menu

#### DaisyUI Integration

- **Colors**: Use DaisyUI theme variables (`--color-primary`, etc.)
- **Components**: Use DaisyUI component classes (`btn`, `card`, `navbar`)
- **Theming**: Override DaisyUI variables in `[data-theme]` selectors

#### Tailwind Integration

- **Spacing**: Use Tailwind spacing utilities (`gap-2`, `p-4`, `m-6`)
- **Sizing**: Use Tailwind size utilities (`w-6`, `h-6`)
- **Layout**: Use Tailwind layout utilities (`flex`, `grid`, `hidden`)

#### Custom CSS (Minimal)

Only use custom CSS for:

- Focus management enhancements
- Custom animations
- Specific component overrides
- Accessibility improvements

## Features

### Mobile Navigation

- **Hamburger Menu**: Visible on mobile (`lg:hidden`)
- **Dropdown**: Alpine.js powered with smooth transitions
- **Touch Optimized**: `touch-manipulation` class for better mobile UX

### Desktop Navigation

- **Horizontal Menu**: `menu menu-horizontal` classes
- **Responsive**: Hidden on mobile (`hidden lg:flex`)
- **Current Page**: `aria-current="page"` for accessibility

### Theme Switcher

- **Dropdown Menu**: 24+ themes available
- **Data Source**: `data/themes.yaml`
- **Accessibility**: ARIA labels and keyboard navigation
- **Persistence**: Local storage for theme preference

### Social Links

- **Desktop**: Always visible (`hidden md:flex`)
- **Mobile**: Collapsed into dropdown (`md:hidden`)
- **Networks**: GitHub, LinkedIn, Twitter/X, Discord
- **Security**: `rel="noopener noreferrer"` attributes

## File Structure

```
layouts/partials/
├── components/
│   ├── navigation.html          # Main navigation component
│   ├── theme-selector-data.html # Theme switcher (data-driven)
│   └── icon.html              # Icon helper component
├── head/
│   └── cdn.html              # Alpine.js loading
└── header.html                # Theme management scripts

assets/css/
├── main.css                  # CSS variables and imports
└── components/
    ├── buttons.css            # Button system
    ├── icons.css             # Icon system
    └── focus.css             # Focus management

data/
├── themes.yaml               # Theme definitions
└── cdn.toml                 # CDN configuration
```

## Implementation Details

### Theme Switching

```javascript
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
```

### Mobile Menu Toggle

```html
<button
  @click="mobileMenuOpen = !mobileMenuOpen"
  class="btn-system btn-system--ghost btn-system--md lg:hidden"
>
  <!-- Hamburger Icon -->
</button>
```

### Social Links Configuration

Social links are hardcoded in navigation template but could be moved to data
file for easier management.

## Troubleshooting

### Common Issues

#### Alpine.js Not Working

- **Check**: Alpine.js script loading in `<head>`
- **Fix**: Ensure `assets/js/alpinejs.min.js` exists
- **Verify**: `x-data` attributes present in HTML

#### CSS Variables Missing

- **Symptoms**: No spacing, wrong sizes, invisible elements
- **Check**: CSS variables defined in `main.css`
- **Fix**: Add missing `--space-*`, `--icon-size-*`, etc.

#### Mobile Menu Not Visible

- **Cause**: Missing `lg:hidden` class or icon variables
- **Fix**: Ensure icon sizes defined and responsive classes working

#### Theme Switcher Not Working

- **Check**: `setTheme()` function in `header.html`
- **Verify**: Theme data in `themes.yaml`
- **Fix**: Ensure Alpine.js loaded and dropdown classes correct

### Debug Steps

1. **Check Alpine.js**: Look for `x-data` attributes in browser dev tools
2. **Verify CSS**: Check if CSS variables are applied in computed styles
3. **Test Responsive**: Use browser dev tools to test mobile/desktop views
4. **Console Errors**: Check for JavaScript errors

## Performance Considerations

### Alpine.js Self-hosting

- **Pros**: No external dependency, faster loading
- **Cons**: Manual version updates required
- **Bundle Size**: ~45KB minified

### CSS Optimization

- **Variables**: Reusable design tokens
- **Components**: Modular CSS architecture
- **Tailwind**: Utility-first for rapid development

### Accessibility

- **ARIA Labels**: All interactive elements labeled
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Screen Readers**: Semantic HTML structure

## Future Improvements

### Potential Enhancements

1. **Data-driven Social Links**: Move to `data/social.yaml`
2. **Search Integration**: Add search to navigation
3. **User Preferences**: More theme customization options
4. **Performance**: Lazy load non-critical components
5. **Analytics**: Track navigation usage patterns

### Maintenance Tasks

1. **Regular Updates**: Keep Alpine.js current
2. **Theme Review**: Add/remove themes based on usage
3. **Accessibility Audit**: Regular WCAG compliance checks
4. **Performance Monitoring**: Bundle size and loading metrics
