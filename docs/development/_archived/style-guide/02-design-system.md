# Design System

## Color Hierarchy

- **Primary**: Main brand color (used for H1, primary actions)
- **Secondary**: Supporting color (used for H2, secondary elements)
- **Accent**: Highlight color (used for H3, accents, links)
- **Base**: Text color (body content)
- **Muted**: Subtle text (metadata, dates)

## Typography Scale

- **H1**: Page titles, main headings
- **H2**: Section headings, card titles
- **H3**: Subsection headings, card subtitles
- **Body**: Main content text
- **Small**: Metadata, dates, captions

## Component Patterns

### Content Cards

Used across blog, portfolio, and tools sections:

- Consistent 3-column grid layout
- Unified styling with configurable colors
- Responsive design (mobile-first)
- Hover states and transitions

### Section Pages

All section pages (`blog/`, `portfolio/`, `tools/`) use:

- `layouts/_default/list.html` template
- Hero section with description
- Grid of content cards
- Pagination where applicable

### Single Pages

All single items use:

- `layouts/_default/single.html` template
- Full-width content layout
- Breadcrumb navigation
- Related content section

## Theme-Aware Color System

### DaisyUI Theme Variables (v0.10.2+)

For theme-aware components that work across all DaisyUI themes (light, dark,
dracula, etc.):

```css
/* Use DaisyUI theme variables instead of hardcoded colors */
.btn-system--ghost {
  background-color: transparent;
  color: oklch(var(--bc)); /* Base content - adapts to theme */
  border-color: transparent;
}

.btn-system--ghost:hover:not(:disabled) {
  background-color: oklch(var(--b2)); /* Base-200 - subtle theme-aware background */
  color: oklch(var(--bc));
}

/* Primary color that adapts to theme */
.btn-system--outline {
  color: oklch(var(--p)); /* Primary color */
  border-color: oklch(var(--p));
}
```

### Available DaisyUI Theme Variables

- `--bc`: Base content (text color)
- `--b1`, `--b2`, `--b3`: Base color variations
- `--p`: Primary color
- `--pc`: Primary content (text on primary)
- `--s`: Secondary color
- `--a`: Accent color

**Why theme-aware?** Ensures proper contrast ratios across all themes, WCAG
compliance, and consistent user experience.

## Color & Alpha Standards

### Color Function Notation (consistent with v0.10.2)

```css
/* STANDARD: Use rgba() - more readable for transparency */
background-color: rgba(255, 255, 255, 0.8);
color: rgba(0, 0, 0, 0.5);

/* STANDARD: Use decimal alpha values (not percentages) */
opacity: 0.1; /* YES - decimal */
opacity: 10%; /* NO - use decimals in this project */
```

**Why decimals?** Matches design token scale (0.05, 0.1, 0.2, etc.) and is more
precise.

### Color Variables (define in `:root`)

```css
:root {
  --color-primary: rgb(59, 130, 246); /* Base color */
  --color-primary-50: rgba(59, 130, 246, 0.05);
  --color-primary-25: rgba(59, 130, 246, 0.25);
  --color-primary-80: rgba(59, 130, 246, 0.8);
}
```

## Gradient Text Style

For branded gradient text effects, use this pattern:

```html
<h1
  class="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
>
  Your Text
</h1>
```

### Variations for different elements

- **h2**: `text-3xl lg:text-4xl`
- **h3**: `text-2xl lg:text-3xl`
- **subtitle**: `text-xl lg:text-2xl`
- **card title**: `text-lg lg:text-xl`

### Key classes for gradient effect

- `bg-gradient-to-r from-primary to-secondary` - Creates left-to-right gradient
- `bg-clip-text text-transparent` - Applies gradient to text only

### Usage examples

- "Apply gradient text to hero titles"
- "Use gradient effect on section headings"
- "Add gradient to feature cards"

## Hero Card Color Implementation

### PRODUCTION-APPROVED APPROACH

Use DaisyUI semantic color classes for hero role cards:

- Primary roles: `text-primary` class
- Secondary roles: `text-secondary` class
- Accent roles: `text-accent` class

### FORBIDDEN APPROACH

DO NOT use CSS variables for hero cards:

- ❌ `style="color: oklch(var(--p))"`
- ❌ `style="color: oklch(var(--s))"`
- ❌ `style="color: oklch(var(--a))"`

### RATIONALE

Production site demonstrates correct implementation using semantic DaisyUI
classes that provide proper theme adaptation and color distinction. CSS
variables should only be used for custom components where semantic classes don't
exist.

## Hero Carousel System

### Component Architecture

The hero carousel is a modular, data-driven component system that displays
multiple hero variants in a rotating carousel format.

#### Core Components

- **`hero-carousel.html`** - Main carousel container with Alpine.js state
  management
- **`carousel/slides.html`** - Dynamic slide rendering based on `hero.toml` data
- **`carousel/navigation.html`** - Previous/next navigation controls
- **`carousel/indicators.html`** - Slide position indicators
- **`carousel/script.html`** - Alpine.js carousel logic and interactions

#### Data Configuration

Carousel slides are configured in `data/hero.toml`:

```toml
[[slides]]
id = "classic"
partial = "hero-classic"
title = "Professional Profile"
description = "Meet the AI-first fullstack developer and cloud architect"
active = true
order = 1
```

**Required fields:**

- `id` - Unique slide identifier
- `partial` - Template partial to render
- `title` - Display title for indicators and accessibility
- `description` - Slide description for accessibility
- `active` - Whether slide is included in carousel
- `order` - Display order (lower numbers first)

#### Slide Variants

Available hero slide templates:

1. **`hero-classic`** - Professional profile with role cards
2. **`hero-intro`** - Open source showcase with feature grid
3. **`hero-showcase`** - Featured projects display (inactive)
4. **`hero-philosophy`** - Development philosophy (inactive)

#### Styling Guidelines

##### Glass Morphism Design

Carousel slides use glass morphism effects for visual depth:

```css
.hero-slide {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

##### Responsive Spacing

- **Desktop**: `min-height: 320px` for slide content
- **Mobile**: `min-height: 280px` for slide content
- **Hero container**: `85vh` height (reduced from `100vh`)

##### Animation Standards

- **Slide transitions**: CSS transforms with `translateX()`
- **Hover effects**: `translateY(-4px)` and `scale(1.02)`
- **Duration**: 300ms for all transitions
- **Easing**: `ease-in-out` for smooth animations

#### Accessibility Requirements

- **ARIA labels**: All navigation controls properly labeled
- **Keyboard navigation**: Full tab and arrow key support
- **Screen readers**: Slide titles and descriptions announced
- **Reduced motion**: Respects `prefers-reduced-motion`

#### Testing Standards

E2E tests verify:

- Slide content matches `hero.toml` data
- Navigation functionality works
- Accessibility features are present
- Responsive behavior across viewports

#### Performance Considerations

- **Alpine.js**: Lightweight reactive state management
- **CSS transforms**: Hardware-accelerated animations
- **Lazy loading**: Only active slide content fully rendered
- **Bundle impact**: Minimal JavaScript footprint
