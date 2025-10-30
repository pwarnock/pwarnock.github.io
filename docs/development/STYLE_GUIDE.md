# Cody Demo Hugo Site - Style Guide

## Project Architecture

### Directory Structure

```
content/
├── _index.md              # Homepage content
├── about.md               # About page (single page)
├── blog/                  # Blog section
│   ├── _index.md          # Blog section page
│   └── posts/             # Individual blog posts
├── portfolio/             # Portfolio section
│   ├── _index.md          # Portfolio section page
│   └── [project-name]/    # Individual portfolio items
└── tools/                 # Tools section
    ├── _index.md          # Tools section page
    └── [tool-name]/       # Individual tool pages
```

### Template Hierarchy

```
layouts/
├── _default/              # Fallback templates for all content types
│   ├── baseof.html        # Base template (header, footer, structure)
│   ├── single.html        # Single item pages (posts, portfolio items)
│   └── list.html          # Section pages (blog/, portfolio/, tools/)
├── partials/
│   ├── components/        # Reusable UI components
│   │   ├── card.html      # Generic card component
│   │   ├── content-card.html # Unified content card (blog/portfolio/tools)
│   │   └── [other-components]
│   ├── sections/          # Page section templates
│   │   ├── content-grid.html # Homepage 3-column layout
│   │   ├── hero.html      # Hero sections
│   │   └── [other-sections]
│   ├── header.html        # Site header
│   ├── footer.html        # Site footer
│   └── [other-partials]
└── shortcodes/            # Content shortcodes
```

## Design System

### Color Hierarchy

- **Primary**: Main brand color (used for H1, primary actions)
- **Secondary**: Supporting color (used for H2, secondary elements)
- **Accent**: Highlight color (used for H3, accents, links)
- **Base**: Text color (body content)
- **Muted**: Subtle text (metadata, dates)

### Typography Scale

- **H1**: Page titles, main headings
- **H2**: Section headings, card titles
- **H3**: Subsection headings, card subtitles
- **Body**: Main content text
- **Small**: Metadata, dates, captions

### Component Patterns

#### Content Cards

Used across blog, portfolio, and tools sections:

- Consistent 3-column grid layout
- Unified styling with configurable colors
- Responsive design (mobile-first)
- Hover states and transitions

#### Section Pages

All section pages (`blog/`, `portfolio/`, `tools/`) use:

- `layouts/_default/list.html` template
- Hero section with description
- Grid of content cards
- Pagination where applicable

#### Single Pages

All single items use:

- `layouts/_default/single.html` template
- Full-width content layout
- Breadcrumb navigation
- Related content section

## Content Guidelines

### Front Matter Structure

```yaml
---
title: 'Page Title'
date: 2025-01-01T00:00:00Z
draft: false
description: 'Brief description for SEO'
tags: ['tag1', 'tag2']
categories: ['category']
customHTML: false # Set to true for pages with custom HTML layouts
---
```

#### Custom HTML Pages

For pages that require custom HTML layouts (like the About page), set
`customHTML: true` in front matter. This removes the prose wrapper and allows
full HTML control:

```yaml
---
title: 'About'
customHTML: true
---
```

When `customHTML: true`:

- Content is rendered without prose styling wrapper
- Full HTML/CSS control is available
- Use DaisyUI components and Tailwind classes directly
- Ideal for landing pages, custom layouts, and interactive components

### Content Organization

- **Blog Posts**: `/content/blog/posts/[slug]/index.md`
- **Portfolio Items**: `/content/portfolio/[project-name]/index.md`
- **Tool Pages**: `/content/tools/[tool-name]/index.md`
- **Static Pages**: `/content/[page-name].md`

### URL Structure

- Blog: `/blog/posts/[slug]/`
- Portfolio: `/portfolio/[project-name]/`
- Tools: `/tools/[tool-name]/`
- Sections: `/blog/`, `/portfolio/`, `/tools/`

## Template Conventions

### Naming Conventions

- **Files**: kebab-case (e.g., `content-card.html`)
- **Classes**: BEM-style (e.g., `content-card__title`)
- **IDs**: kebab-case for unique elements
- **Variables**: camelCase in Go templates

### Partial Organization

- `partials/components/` - Reusable UI components
- `partials/sections/` - Page section layouts
- `partials/` - Site-wide elements (header, footer)

### Template Logic

- Use `with` blocks for safe variable access
- Conditional rendering with `if` statements
- Loop through collections with `range`
- Pass context explicitly to partials

## CSS Guidelines

### CSS Organization Strategy

**CRITICAL PRINCIPLE**: Separation of Concerns

- **`assets/css/main.css`**: Design system ONLY (colors, spacing tokens, custom
  components)
  - Used for global styles, design tokens, component definitions
  - Processed by PostCSS → Tailwind → minified
- **Templates**: Tailwind utility classes for layout and styling
  - Use `class="text-lg font-bold"` in HTML
  - Never define Tailwind classes in `assets/css/main.css`
- **Why**: Prevents CSS bloat, enables tree-shaking, maintains performance

**DO:**

```css
/* assets/css/main.css - Component definitions */
@import 'tailwindcss';
@plugin "daisyui" {
  themes: all;
}

:root {
  --color-primary: #3b82f6;
  --space-4: 1rem;
}

.btn-system {
  @apply px-4 py-2;
}
```

**DON'T:**

```css
/* DON'T - This goes in templates, not CSS */
.my-button {
  padding: 1rem;
  color: blue;
}
.hidden {
  display: none;
} /* Tailwind already handles this */
```

### BEM Naming Convention

**Pattern**: `.component[-element][--modifier]`

```css
/* Component */
.btn-system {
  @apply px-4 py-2 rounded;
}

/* Element (use single underscore for sub-parts) */
.btn-system__icon {
  @apply ml-2;
}

/* Modifier (use double dash for variants) */
.btn-system--primary {
  @apply bg-primary text-white;
}

/* Multiple modifiers allowed */
.btn-system--primary--lg {
  @apply px-6 py-3 text-lg;
}
```

**Key Rules:**

- Component names are descriptive: `.card-unified`, `.btn-system`,
  `.badge-system`
- Elements describe parts of a component: `__header`, `__body`, `__footer`
- Modifiers describe state or variation: `--primary`, `--disabled`, `--active`
- Always use kebab-case for readability

### Color & Alpha Standards

**Color Function Notation** (consistent with v0.10.0):

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

**Color Variables** (define in `:root`):

```css
:root {
  --color-primary: rgb(59, 130, 246); /* Base color */
  --color-primary-50: rgba(59, 130, 246, 0.05);
  --color-primary-25: rgba(59, 130, 246, 0.25);
  --color-primary-80: rgba(59, 130, 246, 0.8);
}
```

### Vendor Prefixes Policy

**ALLOWED ONLY when necessary** (must have inline comment explaining):

```css
/* Allowed: gradient text effect requires -webkit prefix */
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Allowed: font rendering enhancement */
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;

/* NOT allowed: random prefixes without reason */
/* -moz-transform: rotate(45deg); */  ← This is handled by browsers natively now
```

**Rule**: Each vendor prefix must have a comment explaining why it's needed.

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Use Tailwind CSS utility classes in templates
- Custom CSS in `assets/css/main.css` only for design tokens and components

### Color Usage

- Semantic color names (primary, secondary, accent)
- Consistent with design system
- Accessibility compliant (WCAG AA)

### Gradient Text Style

For branded gradient text effects, use this pattern:

```html
<h1
  class="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
>
  Your Text
</h1>
```

**Variations for different elements:**

- **h2**: `text-3xl lg:text-4xl`
- **h3**: `text-2xl lg:text-3xl`
- **subtitle**: `text-xl lg:text-2xl`
- **card title**: `text-lg lg:text-xl`

**Key classes for gradient effect:**

- `bg-gradient-to-r from-primary to-secondary` - Creates left-to-right gradient
- `bg-clip-text text-transparent` - Applies gradient to text only

**Usage examples:**

- "Apply gradient text to hero titles"
- "Use gradient effect on section headings"
- "Add gradient to feature cards"

### CSS Build & Processing

**Development Workflow**:

```bash
# Watch CSS changes during development
npm run css:watch

# Build CSS with PostCSS + Tailwind
npm run css:build

# Full build with Hugo
npm run build
```

**Production Workflow**:

```bash
# Always rebuild CSS before production build
npm run css:build

# Verify build succeeds
npm run build

# Run linting before commit (lints SOURCE CSS only)
npm run lint
```

**CRITICAL**: CSS must be processed by PostCSS before deployment. Static CSS
files must not contain `@import` or `@plugin` directives.

### Linting Strategy: Source vs Generated

**Linting covers SOURCE CSS only** (`assets/css/main.css`):

- `npm run lint` checks the hand-written source CSS
- `.stylelintrc.json` ignores `static/css/main.css` (generated output)

**Why ignore generated CSS?**

- `static/css/main.css` is generated by PostCSS + Tailwind from source
- Tailwind-generated utilities intentionally use patterns that violate standard
  linting:
  - Responsive variants with colons: `.max-lg:drawer-open`
  - Modern CSS features: `hue-degree-notation`, custom CSS syntax
  - Vendor prefixes and browser-specific features
- If source CSS is valid and PostCSS succeeds, generated output is safe
- Linting generated code would create false positives without value

**Safety guarantee:**

- Pre-commit linting validates source CSS
- Build process catches PostCSS/Tailwind errors
- Pipeline only deploys if build succeeds
- No need to lint generated output

### Linting & Code Quality

**Before Committing:**

```bash
npm run lint      # Must pass
npm run validate  # Must pass
npm run build     # Must succeed
```

**Linting Exemptions** (only when absolutely necessary):

```css
/* stylelint-disable rule-name -- Reason: Explain why this exception is needed */
.my-class {
  /* Exemption code here */
}
/* stylelint-enable rule-name */
```

**Exemption Rules:**

- Only exempt if: (1) browser bug requires it, (2) design requirement, (3) temp
  workaround with issue created
- Always include comment explaining why
- Use narrowest possible scope (`disable-line` preferred over disabling entire
  block)
- Create GitHub issue for temporary exemptions

### Design System Architecture

**Layer Structure**:

```
1. @import "tailwindcss"      ← Core Tailwind utilities
2. @plugin "daisyui"          ← DaisyUI component library
3. :root { --custom-props }   ← Custom design tokens
4. .component-system { }      ← Custom component definitions
5. @media queries             ← Responsive overrides
```

**Valid Content in `assets/css/main.css`**:

- ✅ Design tokens (`--color-*`, `--space-*`)
- ✅ Custom component definitions (`.btn-system`)
- ✅ Custom utilities with `@apply`
- ✅ Override Tailwind defaults

**Invalid Content in `assets/css/main.css`**:

- ❌ Tailwind utility classes (use in templates instead)
- ❌ Page-specific styles (create in templates)
- ❌ Random one-off rules (add to components or utilities)

## Development Workflow

### Adding New Content Type

1. Create content directory under `/content/`
2. Add `_index.md` for section page
3. Configure in `hugo.toml` if needed
4. Use existing `_default/list.html` and `_default/single.html`

### Modifying Templates

1. Check `_default/` templates first
2. Create specific templates only when necessary
3. Use partials for reusable components
4. Test across all content types

### Adding New Components

1. Create in `partials/components/`
2. Use BEM-style classes
3. Make configurable with parameters
4. Document usage in comments

## Performance Guidelines

### Image Optimization

- Use WebP format when possible
- Implement lazy loading
- Specify dimensions for CLS
- Use responsive images

### Template Efficiency

- Minimize template nesting
- Use `where` function for filtering
- Cache expensive operations
- Avoid N+1 queries in loops

### Build Optimization

- Enable minification in production
- Use resource bundling
- Implement caching headers
- Monitor bundle sizes

## Accessibility Standards

### Semantic HTML

- Use proper heading hierarchy (h1-h6)
- Implement ARIA labels where needed
- Ensure keyboard navigation
- Provide alt text for images

### Color Contrast

- Meet WCAG AA standards (4.5:1)
- Don't rely on color alone
- Test with color blindness simulators
- Provide focus indicators

### Screen Reader Support

- Use proper landmark elements
- Implement skip links
- Provide descriptive link text
- Test with screen readers

## Maintenance Guidelines

### Documentation

- Update this style guide when making changes
- Document custom shortcodes
- Maintain component library
- Keep README files current

### Version Control

- Commit templates and content separately
- Use semantic versioning for releases
- Tag releases in git
- Maintain changelog

### Testing

- Test template changes across all content types
- Validate HTML and CSS
- Check responsive design
- Verify accessibility compliance

## Common Patterns

### Hero Section

```html
{{ partial "sections/hero.html" (dict "context" . "title" .Title "description"
.Params.description "image" .Params.image ) }}
```

### Content Grid

```html
{{ partial "sections/content-grid.html" (dict "context" . "items" .Pages "title"
"Recent Posts" "cardType" "blog" ) }}
```

### Card Component

```html
{{ partial "components/content-card.html" (dict "context" . "item" .item
"cardType" .cardType "showDate" true "showDescription" true ) }}
```

This style guide should be updated as the project evolves and should serve as
the single source of truth for design and development decisions.
