# DaisyUI Migration Plan

## Overview

Migrate from custom CSS variables system to pure DaisyUI component classes for
better standardization and maintainability.

## Current State Analysis

### Current Hybrid Approach

- **DaisyUI**: Used for theming (`--color-primary`, etc.)
- **Custom CSS**: Used for component styling (`.btn-system`, custom variables)
- **Tailwind**: Used for utilities (`gap-2`, `p-4`, etc.)

### Working Components

- ✅ Navigation with custom `.btn-system` classes
- ✅ Theme switcher with custom styling
- ✅ Social links with custom styling
- ✅ Responsive design
- ✅ Alpine.js integration

## Migration Strategy

### Phase 1: Component Mapping

Map current custom components to DaisyUI equivalents:

#### Buttons

```html
<!-- Current -->
<button class="btn-system btn-system--md btn-system--ghost">Button Text</button>

<!-- Target DaisyUI -->
<button class="btn btn-ghost">Button Text</button>
```

#### Navigation

```html
<!-- Current -->
<nav class="navbar bg-base-100 shadow-lg sticky top-0 z-40">
  <div class="navbar-start">...</div>
  <div class="navbar-center">...</div>
  <div class="navbar-end">...</div>
</nav>

<!-- Target DaisyUI -->
<div class="navbar bg-base-100 shadow-lg sticky top-0 z-40">
  <div class="navbar-start">...</div>
  <div class="navbar-center">...</div>
  <div class="navbar-end">...</div>
</div>
```

#### Icons

```html
<!-- Current -->
<svg class="icon-system icon-system--md">...</svg>

<!-- Target DaisyUI + Tailwind -->
<svg class="w-6 h-6">...</svg>
```

### Phase 2: CSS Cleanup

Remove custom CSS variables and classes:

#### Remove Custom Variables

```css
/* Remove these */
--space-1: 0.25rem;
--space-2: 0.5rem;
--button-height-sm: 2rem;
--icon-size-md: 1.5rem;
/* etc */
```

#### Remove Custom Classes

```css
/* Remove these */
.btn-system { ... }
.btn-system--md { ... }
.icon-system { ... }
/* etc */
```

#### Keep Only DaisyUI Overrides

```css
/* Keep minimal overrides like this */
.btn:focus-visible {
  outline: 2px solid oklch(var(--p));
  outline-offset: 2px;
}
```

### Phase 3: HTML Updates

Update all HTML to use DaisyUI classes:

#### Navigation Component

```html
<!-- Update layouts/partials/components/navigation.html -->
<div
  class="navbar bg-base-100 shadow-lg sticky top-0 z-40"
  x-data="{ mobileMenuOpen: false, socialMenuOpen: false }"
>
  <!-- Mobile Menu -->
  <div class="navbar-start">
    <div class="dropdown" :class="{ 'dropdown-open': mobileMenuOpen }">
      <button
        tabindex="0"
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="btn btn-ghost lg:hidden"
      >
        <svg class="w-6 h-6">...</svg>
      </button>
      <!-- Mobile menu dropdown -->
    </div>
    <a href="/" class="btn btn-ghost text-xl">
      <img src="/img/logo.png" class="h-8 w-8 rounded" />
      Peter Warnock
    </a>
  </div>

  <!-- Desktop Navigation -->
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a href="/" class="btn btn-ghost">Home</a></li>
      <!-- More nav items -->
    </ul>
  </div>

  <!-- Theme & Social -->
  <div class="navbar-end">
    <!-- Theme switcher -->
    <div class="dropdown dropdown-end">
      <button class="btn btn-ghost btn-circle">
        <svg class="w-6 h-6">...</svg>
      </button>
      <!-- Theme dropdown -->
    </div>

    <!-- Social links -->
    <div class="hidden md:flex">
      <a href="https://github.com/pwarnock" class="btn btn-ghost btn-circle">
        <svg class="w-5 h-5">...</svg>
      </a>
      <!-- More social links -->
    </div>
  </div>
</div>
```

### Phase 4: Testing & Validation

- [ ] All navigation elements work
- [ ] Theme switcher functional
- [ ] Mobile responsive design
- [ ] Social links working
- [ ] Alpine.js interactions
- [ ] Accessibility features

### Phase 5: Documentation Updates

- Update CSS documentation to reflect DaisyUI approach
- Update component documentation
- Update development workflow
- Archive custom CSS approach

## Migration Benefits

### Advantages

1. **Standardization**: Follow DaisyUI conventions
2. **Documentation**: Well-documented component system
3. **Community**: Larger community support
4. **Maintenance**: Less custom CSS to maintain
5. **Performance**: Optimized DaisyUI CSS
6. **Accessibility**: Built-in accessibility features

### Trade-offs

1. **Learning Curve**: Team needs DaisyUI knowledge
2. **Customization**: Less control over specific styling
3. **Migration Effort**: Significant refactoring required
4. **Breaking Changes**: Potential for existing customizations

## Implementation Timeline

### Week 1: Preparation

- [ ] Document current component usage
- [ ] Create component mapping guide
- [ ] Set up development branch

### Week 2: Core Components

- [ ] Migrate button system
- [ ] Migrate navigation structure
- [ ] Migrate icon system

### Week 3: Layout & Content

- [ ] Migrate layout components
- [ ] Migrate content styling
- [ ] Test responsive design

### Week 4: Polish & Launch

- [ ] Accessibility testing
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Merge to main

## Risk Mitigation

### Technical Risks

- **Breaking Changes**: Use feature flags for gradual rollout
- **Styling Issues**: Maintain fallback CSS during transition
- **Performance**: Monitor bundle size and loading times

### Process Risks

- **Team Training**: Provide DaisyUI documentation and training
- **Rollback Plan**: Keep current system in parallel branch
- **Testing**: Comprehensive testing before launch

## Success Criteria

### Functional Requirements

- [ ] All current features work identically
- [ ] No visual regressions
- [ ] Theme switcher works perfectly
- [ ] Mobile navigation functional
- [ ] Social links accessible

### Technical Requirements

- [ ] Bundle size doesn't increase significantly
- [ ] Performance metrics maintained or improved
- [ ] Accessibility compliance maintained
- [ ] Cross-browser compatibility

### Maintainability Requirements

- [ ] Code is easier to understand
- [ ] Documentation is comprehensive
- [ ] Future changes are simpler
- [ ] Team can work independently

## Next Steps

1. **Get Stakeholder Approval**: Review migration plan with team
2. **Create Development Branch**: `feature/daisyui-migration`
3. **Start Phase 1**: Begin component mapping
4. **Set Up Monitoring**: Track migration progress
5. **Schedule Implementation**: Block out development time

## Resources

### DaisyUI Documentation

- [Official Docs](https://daisyui.com/)
- [Component Gallery](https://daisyui.com/components/)
- [Theme Customization](https://daisyui.com/docs/themes/)

### Migration Tools

- [Component Mapping Script](scripts/migrate-components.js)
- [CSS Validation Tool](scripts/validate-daisyui.js)
- [Visual Regression Testing](scripts/visual-test.js)

This migration will modernize the codebase while maintaining all existing
functionality and improving long-term maintainability.
