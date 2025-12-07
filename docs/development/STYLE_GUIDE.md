# Style Guide

Complete guide to architecture, design system, CSS, templates, content,
development workflow, performance, and accessibility standards.

## Quick Links

- **Setting up content?** → [Content Guidelines](#content-guidelines)
- **Writing styles?** → [CSS Guidelines](#css-guidelines)
- **Building templates?** → [Template Conventions](#template-conventions)
- **Need design decisions?** → [Design System](#design-system)
- **Accessibility questions?** →
  [Accessibility Standards](#accessibility-standards)

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Design System](#design-system)
3. [CSS Guidelines](#css-guidelines)
4. [Template Conventions](#template-conventions)
5. [Content Guidelines](#content-guidelines)
6. [Development Workflow](#development-workflow)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility Standards](#accessibility-standards)

---

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

### URL Structure

- Blog: `/blog/posts/[slug]/`
- Portfolio: `/portfolio/[project-name]/`
- Tools: `/tools/[tool-name]/`
- Sections: `/blog/`, `/portfolio/`, `/tools/`

---

## Design System

### Color Hierarchy

- **Primary**: Main brand color (used for H1, primary actions)
- **Secondary**: Supporting color (used for H2, secondary elements)
- **Accent**: Highlight color (used for H3, accents, links)
- **Base**: Text color (body content)
- **Muted**: Subtle text (metadata, dates)

### Typography Scale

- **H1 (Hero)**: `text-5xl` desktop, primary page title in hero
- **H1 (Non-hero)**: `text-3xl lg:text-4xl` (bold), main page title
- **H2**: `text-3xl` (bold), section headings
- **H3**: `text-2xl` (semibold), subsection headings
- **Card Title**: `text-xl lg:text-2xl` (semibold)
- **Body**: `text-base` (1rem) or `text-lg` (1.125rem)
- **Small**: `text-sm` (0.875rem), metadata, secondary text
- **Tiny**: `text-xs` (0.75rem), tags, legal text

### Color System Implementation

#### Semantic Variables (DaisyUI + Tokens)

We use a semantic color system that adapts to themes automatically. Avoid
hardcoded hex values.

- **Surfaces**:
  - `bg-base-100`: Default card/page background
  - `bg-base-200`: Secondary background, hover states (replaces opacity hacks)
  - `bg-base-300`: Borders, dividers
- **Text**:
  - `text-base-content`: Primary text
  - `text-base-content/80`: Secondary text (prefer opacity over gray hex)
  - `text-base-content/60`: Muted/Metadata
- **Brand**:
  - `text-primary`: Links, accents, primary headings
  - `text-secondary`: Subheadings, badges

#### Hover States

Use `base-200` for subtle interactive states to ensure visibility across all
themes:

```css
.element:hover {
  background-color: var(--color-base-200); /* Auto-swaps in light/dark/cyber */
}
```

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

### Theme-Aware Color System

#### DaisyUI Theme Variables (v0.10.2+)

For theme-aware components that work across all DaisyUI themes (light, dark,
dracula, etc.):

```css
/* Use DaisyUI theme variables instead of hardcoded colors */
.btn-system--ghost {
  background-color: transparent;
  color: var(--color-base-content); /* Base content - adapts to theme */
  border-color: transparent;
}

.btn-system--ghost:hover:not(:disabled) {
  background-color: var(
    --color-base-200
  ); /* Base-200 - subtle theme-aware background */
  color: var(--color-base-content);
}

/* Primary color that adapts to theme */
.btn-system--outline {
  color: var(--color-primary); /* Primary color */
  border-color: var(--color-primary);
}
```

#### Prose Typography Exceptions

In `assets/css/content/prose.css`, specific elements use `!important` to
override Tailwind Typography defaults and ensure accessibility and theme
compatibility:

```css
/* Force theme colors for strong/bold text */
.prose strong,
.prose b {
  color: var(--color-base-content) !important;
  font-weight: var(--font-weight-bold) !important;
}

/* Force theme colors for list items */
.prose li {
  color: var(--color-base-content) !important;
}

.prose li::marker {
  color: var(--color-base-content) !important;
}
```

#### Prose Layout & Centering

To ensure consistent centering and readability for long-form content (blog
posts, etc.), we use a specific layout strategy in
`assets/css/content/prose.css`:

1.  **Container Centering**: The `.prose` container itself is centered with
    `margin-left: auto`, `margin-right: auto`, and constrained to
    `max-width: 65ch` (approx. 65 characters) for optimal reading comfort.
2.  **Child Element Centering**: Direct children of `.prose` (like `p`,
    `h1`-`h6`, `ul`, `ol`, `blockquote`) _also_ have these properties explicitly
    set. This ensures that even if the container context changes or if a child
    element behaves unexpectedly (like breaking out of a container), the text
    content remains strictly centered and readable.

```css
/* Container */
.prose {
  max-width: 65ch;
  margin-left: auto;
  margin-right: auto;
}

/* Children (explicit centering) */
.prose p,
.prose h1,
.prose h2,
.prose ul,
/* ... etc */ {
  max-width: 65ch;
  margin-left: auto;
  margin-right: auto;
}
```

#### Available DaisyUI Theme Variables

- `--bc`: Base content (text color)
- `--b1`, `--b2`, `--b3`: Base color variations
- `--p`: Primary color
- `--pc`: Primary content (text on primary)
- `--s`: Secondary color
- `--a`: Accent color

**Why theme-aware?** Ensures proper contrast ratios across all themes, WCAG
compliance, and consistent user experience.

### Color & Alpha Standards

#### Color Function Notation (consistent with v0.10.2)

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

#### Color Variables (define in `:root`)

```css
:root {
  --color-primary: rgb(59, 130, 246); /* Base color */
  --color-primary-50: rgba(59, 130, 246, 0.05);
  --color-primary-25: rgba(59, 130, 246, 0.25);
  --color-primary-80: rgba(59, 130, 246, 0.8);
}
```

### Gradient Text Style

For branded gradient text effects, use this pattern:

```html
<h1
  class="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
>
  Your Text
</h1>
```

#### Variations for different elements

- **h2**: `text-3xl lg:text-4xl`
- **h3**: `text-2xl lg:text-3xl`
- **subtitle**: `text-xl lg:text-2xl`
- **card title**: `text-lg lg:text-xl`

#### Key classes for gradient effect

- `bg-gradient-to-r from-primary to-secondary` - Creates left-to-right gradient
- `bg-clip-text text-transparent` - Applies gradient to text only

### Hero Card Color Implementation

#### PRODUCTION-APPROVED APPROACH

Use DaisyUI semantic color classes for hero role cards:

- Primary roles: `text-primary` class
- Secondary roles: `text-secondary` class
- Accent roles: `text-accent` class

#### FORBIDDEN APPROACH

DO NOT use CSS variables for hero cards:

- ❌ `style="color: oklch(var(--p))"` (Incorrect DaisyUI v5 syntax)
- ❌ `style="color: oklch(var(--s))"` (Incorrect DaisyUI v5 syntax)
- ❌ `style="color: oklch(var(--a))"` (Incorrect DaisyUI v5 syntax)

#### CORRECT DAISYUI V5.5 SYNTAX

Use proper DaisyUI v5.5 variable names:

- ✅ `style="color: var(--color-primary)"`
- ✅ `style="color: var(--color-secondary)"`
- ✅ `style="color: var(--color-accent)"`
- ✅ `style="color: var(--color-base-content)"`
- ✅ `style="background-color: var(--color-base-200)"`

#### RATIONALE

Production site demonstrates correct implementation using semantic DaisyUI
classes that provide proper theme adaptation and color distinction. CSS
variables should only be used for custom components where semantic classes don't
exist.

### Hero Carousel System

#### Component Architecture

The hero carousel is a modular, data-driven component system that displays
multiple hero variants in a rotating carousel format.

##### Core Components

- **`hero-carousel.html`** - Main carousel container with Alpine.js state
  management
- **`carousel/slides.html`** - Dynamic slide rendering based on `hero.toml` data
- **`carousel/navigation.html`** - Previous/next navigation controls
- **`carousel/indicators.html`** - Slide position indicators
- **`carousel/script.html`** - Alpine.js carousel logic and interactions

##### Data Configuration

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

##### Slide Variants

Available hero slide templates:

1. **`hero-classic`** - Professional profile with role cards
2. **`hero-intro`** - Open source showcase with feature grid
3. **`hero-showcase`** - Featured projects display (inactive)
4. **`hero-philosophy`** - Development philosophy (inactive)

##### Styling Guidelines

###### Glass Morphism Design

Carousel slides use glass morphism effects for visual depth:

```css
.hero-slide {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

###### Responsive Spacing

- **Desktop**: `min-height: 320px` for slide content
- **Mobile**: `min-height: 280px` for slide content
- **Hero container**: `85vh` height (reduced from `100vh`)

###### Animation Standards

- **Slide transitions**: CSS transforms with `translateX()`
- **Hover effects**: `translateY(-4px)` and `scale(1.02)`
- **Duration**: 300ms for all transitions
- **Easing**: `ease-in-out` for smooth animations

##### Accessibility Requirements

- **ARIA labels**: All navigation controls properly labeled
- **Keyboard navigation**: Full tab and arrow key support
- **Screen readers**: Slide titles and descriptions announced
- **Reduced motion**: Respects `prefers-reduced-motion`

##### Testing Standards

E2E tests verify:

- Slide content matches `hero.toml` data
- Navigation functionality works
- Accessibility features are present
- Responsive behavior across viewports

##### Performance Considerations

- **Alpine.js**: Lightweight reactive state management
- **CSS transforms**: Hardware-accelerated animations
- **Lazy loading**: Only active slide content fully rendered
- **Bundle impact**: Minimal JavaScript footprint

---

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

#### DO

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

#### DON'T

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

#### Pattern: `.component[-element][--modifier]`

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

#### Key Rules

- Component names are descriptive: `.card-unified`, `.btn-system`,
  `.badge-system`
- Elements describe parts of a component: `__header`, `__body`, `__footer`
- Modifiers describe state or variation: `--primary`, `--disabled`, `--active`
- Always use kebab-case for readability

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

#### Grid & Spacing Consistency Pattern

For multi-column layouts with stacked content:

- Use `gap-4` for consistent horizontal spacing between grid columns
- Use `space-y-4` for consistent vertical spacing within stacked child elements
- This ensures visual balance: horizontal gap matches vertical spacing
- Example: 3-column grid with 2-column featured item + 1-column stacked right
  panel:
  ```html
  <div class="grid gap-4 lg:grid-cols-3">
    <div class="lg:col-span-2"><!-- featured item --></div>
    <div class="space-y-4">
      <div><!-- card 1 --></div>
      <div><!-- card 2 --></div>
    </div>
  </div>
  ```
- On mobile: single column, `gap-4` still applies vertically for consistency
- Rationale: DaisyUI cards have internal padding; `gap-4` + `space-y-4` creates
  rhythm without excessive margin stacking

### Color Usage

- Semantic color names (primary, secondary, accent)
- Consistent with design system
- Accessibility compliant (WCAG AA)

### CSS Build & Processing

#### Development Workflow

```bash
# Watch CSS changes during development
bun run css:watch

# Build CSS with PostCSS + Tailwind
bun run css:build

# Full build with Hugo
bun run build
```

#### Production Workflow

```bash
# Always rebuild CSS before production build
bun run css:build

# Verify build succeeds
bun run build

# Run linting before commit (lints SOURCE CSS only)
bun run lint
```

**CRITICAL**: CSS must be processed by PostCSS before deployment. Static CSS
files must not contain `@import` or `@plugin` directives.

### Linting Strategy: Source vs Generated

#### Linting covers SOURCE CSS only (`assets/css/main.css`)

- `bun run lint` checks the hand-written source CSS
- `.stylelintrc.json` ignores `static/css/main.css` (generated output)

#### Why ignore generated CSS?

- `static/css/main.css` is generated by PostCSS + Tailwind from source
- Tailwind-generated utilities intentionally use patterns that violate standard
  linting:
  - Responsive variants with colons: `.max-lg:drawer-open`
  - Modern CSS features: `hue-degree-notation`, custom CSS syntax
  - Vendor prefixes and browser-specific features
- If source CSS is valid and PostCSS succeeds, generated output is safe
- Linting generated code would create false positives without value

#### Safety guarantee

- Pre-commit linting validates source CSS
- Build process catches PostCSS/Tailwind errors
- Pipeline only deploys if build succeeds
- No need to lint generated output

### Linting & Code Quality

#### Before Committing

```bash
bun run lint      # Must pass
bun run validate  # Must pass
bun run build     # Must succeed
```

#### Linting Exemptions (only when absolutely necessary)

```css
/* stylelint-disable rule-name -- Reason: Explain why this exception is needed */
.my-class {
  /* Exemption code here */
}
/* stylelint-enable rule-name */
```

#### Exemption Rules

- Only exempt if: (1) browser bug requires it, (2) design requirement, (3) temp
  workaround with issue created
- Always include comment explaining why
- Use narrowest possible scope (`disable-line` preferred over disabling entire
  block)
- Create GitHub issue for temporary exemptions

### Design System Architecture

#### Layer Structure

```
1. @import "tailwindcss"      ← Core Tailwind utilities
2. @plugin "daisyui"          ← DaisyUI component library
3. :root { --custom-props }   ← Custom design tokens
4. .component-system { }      ← Custom component definitions
5. @media queries             ← Responsive overrides
```

#### Valid Content in `assets/css/main.css`

- ✅ Design tokens (`--color-*`, `--space-*`)
- ✅ Custom component definitions (`.btn-system`)
- ✅ Custom utilities with `@apply`
- ✅ Override Tailwind defaults

#### Invalid Content in `assets/css/main.css`

- ❌ Tailwind utility classes (use in templates instead)
- ❌ Page-specific styles (create in templates)
- ❌ Random one-off rules (add to components or utilities)

---

## Template Conventions

### Hero Component Standards

**CRITICAL**: All hero components MUST follow these exact patterns to prevent
color/style inconsistencies:

#### Standard Hero Structure

```html
<!-- Section Hero (NOT single item) -->
<div class="hero-content flex-col lg:flex-row gap-8">
  <div class="text-center lg:text-left max-w-4xl">
    <h1
      id="[section]-title"
      class="font-bold text-primary-content mb-4 text-4xl lg:text-5xl"
    >
      {{ .context.Title }}
    </h1>
    <p
      class="text-xl lg:text-2xl text-primary-content/80 font-medium"
      role="doc-subtitle"
    >
      {{ .context.Description }}
    </p>
  </div>
</div>
```

#### Single Item Hero Structure

```html
<!-- Single blog/portfolio/tool item -->
<div class="hero-content flex-col lg:flex-row gap-8">
  <div class="text-center lg:text-left max-w-4xl">
    <!-- Date badge (EXACT styling) -->
    <div
      class="inline-flex items-center bg-primary/10 text-primary-content rounded-full text-sm font-medium mb-6"
      style="gap: var(--space-2); padding: var(--space-2) var(--space-4)"
    >
      <!-- SVG icon + date content -->
    </div>

    <!-- Title (EXACT classes) -->
    <h1
      id="[section]-title"
      class="font-bold text-primary-content mb-6 leading-tight text-4xl lg:text-5xl"
    >
      {{ .context.Title }}
    </h1>

    <!-- Tags (if applicable) -->
    <div class="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
      {{ range .context.Params.tags }}
      <span
        class="badge badge-outline badge-lg text-primary-content border-primary-content/30 hover:bg-primary/20 transition-all duration-300 cursor-default"
      >
        {{ . }}
      </span>
      {{ end }}
    </div>
  </div>
</div>
```

#### Forbidden Patterns

- ❌ NEVER add `bg-base-*` classes to hero wrappers
- ❌ NEVER use custom font sizes - always `text-4xl lg:text-5xl`
- ❌ NEVER change `text-primary-content` colors
- ❌ NEVER modify `hero-content` structure
- ❌ NEVER use `badge-primary` for date badges - use `bg-primary/10`

#### Required Classes

- ✅ Container: `hero-content flex-col lg:flex-row gap-8`
- ✅ Inner: `text-center lg:text-left max-w-4xl`
- ✅ Headings: `font-bold text-primary-content text-4xl lg:text-5xl`
- ✅ Date badge: `bg-primary/10 text-primary-content rounded-full`
- ✅ Tags: `badge badge-outline badge-lg text-primary-content`

#### Base Template Usage

Use the standardized base template for new heroes:

```html
{{ partial "components/hero-base.html" (dict "context" . "section" "tools"
"isSingle" true) }}
```

#### Validation

All hero components are automatically validated on commit to ensure compliance
with these standards. Run manually with:

```bash
./scripts/validation/validate-hero-components.sh
```

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

#### Data-Driven Reusable Components

For components that render different content types (blog, portfolio, tools,
etc.):

1. **Design for flexibility**: Accept a `section` parameter to control behavior
2. **Use conditional logic**: Branch on the section type to handle different
   data structures
3. **Configure via parameters**: Pass colors, headings, CTA text, and URLs as
   dict parameters
4. **Example pattern**:

   ```go-template
   {{ $section := .section }}
   {{ $color := .color | default "accent" }}

   {{ if eq $section "blog" }}
     <!-- Blog-specific rendering -->
   {{ else if eq $section "portfolio" }}
     <!-- Portfolio-specific rendering -->
   {{ end }}
   ```

5. **Benefits**: Eliminates duplication, maintains consistent styling,
   simplifies maintenance
6. **Reference**: See `hero-featured-item.html` for complete implementation
   handling blog/portfolio/tools sections with different metadata and layouts

### Code Block Rendering

#### Custom Code Block Handler (render-codeblock.html)

Code blocks are rendered through Hugo's custom markup override system with
daisyUI styling:

```markdown
# In your content, use standard fenced code blocks with language indicator

\`\`\`bash bd ready --json bd create "Task" -t task \`\`\`
```

#### Rendering

- Automatically wrapped in semantic `<figure>` elements
- Language label displayed in figcaption header
- Styled with daisyUI base colors and tokens
- Syntax highlighting via Hugo's goldmark (github style)
- Line numbers enabled by default

#### CSS Classes Applied (assets/css/main.css)

```css
.code-block           /* Figure wrapper with bg-base-200 */
.code-block figcaption /* Language label with bg-base-300 */
.code-block pre       /* Code area with bg-base-100 */
.code-block code      /* Code text with theme colors */
```

#### Implementation

- Override file: `layouts/_default/_markup/render-codeblock.html`
- Styles: `assets/css/main.css` (lines 616-635)
- Applied to all content types (blog, portfolio, tools)
- DRY and consistent across entire site

---

## Content Guidelines

### Content Types

All content must specify a `content_type` field in front matter. This determines
validation requirements and display behavior.

#### Available Content Types

**Original** (`content_type: original`)

- Content created specifically for this site
- Required fields: `title`, `date`, `summary`
- Optional fields: `tags`, `categories`, `featured_image`, `draft`

**Curated** (`content_type: curated`)

- Content from external sources, shared with commentary
- Required fields: `title`, `date`, `summary`, `attribution`, `source_url`
- Optional fields: `tags`, `categories`, `featured_image`, `draft`

**Embedded Content** (`content_type: embed`)

- Direct embeds from external platforms
- Required fields: `title`, `date`, `attribution`, `source_url`
- Optional fields: `tags`, `categories`, `draft`

**Project** (`content_type: project`)

- Internal project updates, milestones, and status reports
- Required fields: `title`, `date`, `summary`
- Optional fields: `tags`, `categories`, `author`, `draft`, `thumbnail`

### Front Matter Structure

```yaml
---
title: 'Page Title'
date: 2025-01-01T00:00:00Z
content_type: original # Required: original, curated, embed, or project
draft: false
description: 'Brief description for SEO'
summary: 'Required: Brief summary for homepage and list views (150-200 chars)'
tags: ['tag1', 'tag2']
categories: ['category']
customHTML: false # Set to true for pages with custom HTML layouts
---
```

#### Content Type Examples

**Original Content Example:**

```yaml
---
title: 'My Technical Article'
date: 2025-01-01T00:00:00Z
content_type: original
summary: 'A deep dive into modern web development practices and tools.'
tags: ['web-development', 'javascript', 'best-practices']
---
```

**Curated Content Example:**

```yaml
---
title: 'External Article Summary'
date: 2025-01-01T00:00:00Z
content_type: curated
summary: 'John Doe shares insights on cloud architecture patterns.'
attribution: 'John Doe'
source_url: 'https://example.com/article'
tags: ['cloud', 'architecture', 'patterns']
---
```

**Project Update Example:**

```yaml
---
title: 'Phase 1 Complete: New Feature Launch'
date: 2025-01-01T00:00:00Z
content_type: project
summary: 'Complete implementation of new feature with comprehensive testing.'
author: 'Peter Warnock'
tags: ['project-management', 'milestone', 'development']
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

### Voice and Tone

**CRITICAL: Use First-Person Voice (I/me)**

All content must use first-person perspective. This is a personal portfolio and
blog.

#### ✅ Correct (First Person)

- "I developed this application to solve..."
- "My approach to this problem was..."
- "I learned that..."
- "In my experience..."

#### ❌ Incorrect (Third Person/We)

- "We developed this application..."
- "The team's approach was..."
- "Our experience shows..."
- "Developers learned that..."

#### Why First Person?

- **Personal Portfolio**: This represents my individual work and experience
- **Authentic Voice**: Readers connect with personal stories and insights
- **Clear Attribution**: Avoids ambiguity about who did the work
- **Professional Standard**: Personal portfolios use first-person voice

### Content Organization

- **Blog Posts**: `/content/blog/posts/[slug]/index.md` (Page Bundle -
  **Recommended**)
- **Portfolio Items**: `/content/portfolio/[project-name]/index.md` (Page
  Bundle)
- **Tool Pages**: `/content/tools/[tool-name]/index.md` (Page Bundle)
- **Static Pages**: `/content/[page-name].md` (Single File)

### Page Bundles (Recommended for Blog Posts)

Page bundles (directories with `index.md`) are the recommended approach for blog
posts because they:

- **Keep related assets together** (images, downloads, etc.)
- **Simplify image paths** (just filename, no full path needed)
- **Better organization** (self-contained content units)
- **Easier deployment** (assets travel with content)

#### Page Bundle Structure

```
content/blog/posts/my-post/
├── index.md          # Main content with frontmatter
├── featured-image.png  # Post hero image
├── screenshot.jpg      # Additional images
└── diagram.svg        # Supporting assets
```

#### Frontmatter for Page Bundles

```yaml
---
title: 'My Blog Post'
date: 2025-01-01T00:00:00Z
draft: false
description: 'SEO description'
summary: 'Brief summary for homepage (150-200 chars)'
image: 'featured-image.png' # Just filename, no path needed
tags: ['tag1', 'tag2']
---
```

### Blog Post Creation Guidelines

**RECOMMENDED: Use Page Bundles for all blog posts**

Page bundles (directories with `index.md`) are the recommended approach for
better organization and asset management.

**CRITICAL: Summary field is REQUIRED for all blog posts**

The `summary` field in frontmatter is mandatory for proper display on homepage
and section pages. Without it, posts will appear incomplete or broken.

#### Required Blog Post Frontmatter (Page Bundle)

```yaml
---
title: 'Blog Post Title' # Required: Display title
date: 2025-01-01T00:00:00Z # Required: Publication date
draft: false # Required: Set to false for published posts
description: 'SEO description for search engines' # Required: Meta description
summary: 'Required: Brief summary for homepage and list views (150-200
  characters)' # REQUIRED
image: 'featured-image.png' # Recommended: Just filename for page bundles
tags: ['tag1', 'tag2'] # Optional: For categorization
categories: ['category'] # Optional: For grouping
---
```

#### Creating a New Blog Post (Page Bundle)

```bash
# Create new blog post directory
mkdir content/blog/posts/my-new-post

# Create index.md with frontmatter
touch content/blog/posts/my-new-post/index.md

# Add images to the same directory
cp my-image.png content/blog/posts/my-new-post/featured-image.png
```

#### Summary Field Requirements

- **Length**: 150-200 characters optimal
- **Purpose**: Display on homepage, blog section page, and RSS feeds
- **Content**: Engaging preview that encourages readers to click
- **Format**: Plain text, no markdown or HTML
- **Validation**: Posts without summary will fail validation

#### Blog Post Structure

```markdown
---
title: 'Your Blog Post Title'
date: 2025-01-01T00:00:00Z
draft: false
description: 'SEO-friendly description for search engines'
summary:
  'Engaging 150-200 character summary that appears on homepage and blog listing
  pages'
tags: ['technology', 'web-development']
categories: ['Development']
---

# NO H1 HERE - Title comes from frontmatter

Start your content directly with an introduction paragraph or image.

## First Section

Your main content begins here with H2 headings.

## Additional Sections

Continue with H2 and H3 headings as needed.
```

### Image Guidelines for Blog Posts

#### Image Storage & Access

- **Location**: Place images in `static/images/blog/` for global access
- **Page Resources**: For page-specific images, create page bundles with
  `index.md` and image files
- **Frontmatter**: Always specify `image` parameter for homepage display

#### Image Frontmatter (Required for Homepage)

```yaml
---
title: 'Your Blog Post Title'
image: '/images/blog/your-image.jpg' # Required for homepage latest post card
summary: '150-200 character summary for homepage display'
---
```

#### Image Usage Patterns

1. **Homepage Latest Post Card**: Uses `image` frontmatter parameter
2. **Content Images**: Use Hugo's figure shortcode for processing
3. **Responsive Images**: Hugo automatically optimizes when using resources

#### Example Complete Blog Post

```markdown
---
title: 'Your Blog Post Title'
date: 2025-01-01T00:00:00Z
draft: false
description: 'SEO description for search engines'
summary:
  'Engaging 150-200 character summary that appears on homepage and blog listing
  pages'
image: '/images/blog/your-featured-image.jpg' # Required for homepage
tags: ['technology', 'web-development']
categories: ['Development']
---

# NO H1 HERE - Title comes from frontmatter

Start your content directly with an introduction paragraph.

{{< figure src="/images/blog/your-image.jpg" alt="Description" caption="Optional caption" >}}

## First Section

Your main content begins here with H2 headings.
```

#### Image Processing Best Practices

- **Featured Images**: Use `image` parameter for homepage cards
- **Content Images**: Use `{{< figure >}}` shortcode for automatic optimization
- **Sizing**: Hugo automatically resizes images in templates (400x200 for cards)
- **Formats**: Use JPG, PNG, or WebP formats
- **Alt Text**: Always provide descriptive alt text for accessibility

#### Template Image Handling

The homepage template follows Hugo conventions:

1. **First Priority**: `image` frontmatter parameter
2. **Second Priority**: `thumbnail` parameter
3. **Fallback**: Page resources (feature*, cover*, thumbnail\*)
4. **Final Fallback**: First image in page bundle

#### Validation

Blog posts are validated automatically:

```bash
# Validate all blog posts
./scripts/validate-blog-post.sh

# Check specific post
./scripts/validate-blog-post.sh content/blog/posts/your-post/

# Full validation includes blog checks
./scripts/validate.sh
```

#### Validation Checks

- ✅ **Required frontmatter fields**: title, date, draft, description, summary,
  image
- ✅ **Image path existence**: Verifies frontmatter image exists in static
  directory
- ✅ **Summary length**: Recommends 150-200 characters for optimal display
- ✅ **Heading structure**: Ensures no H1 in content (prevents duplicates)
- ✅ **Content images**: Validates image paths in content

#### Common Validation Errors

- ❌ `Missing required fields: image` → Add
  `image: '/images/blog/your-image.jpg'` to frontmatter
- ❌ `Frontmatter image not found` → Verify image exists in static directory
- ⚠️ `Summary too short/long` → Adjust summary to 150-200 characters
- ❌ `Contains H1 heading` → Remove `# Title` from content, use H2+ instead

### Heading Structure Guidelines

**CRITICAL: No H1 Titles in Markdown Content**

All content types (blog posts, portfolio items, tools, static pages) must
**NOT** include H1 titles (`# Title`) in their markdown content.

#### Why?

- Hero templates already display the title as an H1 from frontmatter
- Duplicate H1s create accessibility issues for screen readers
- Maintains SEO optimization while ensuring a11y compliance

#### ⚠️ **CRITICAL: No HTML H1 Tags in Content**

**NEVER include HTML `<h1>` tags in markdown content files:**

```markdown
---
title: 'Page Title' # ✅ This becomes the page H1
---

## ✅ Correct: H2 for main sections

## Main Content Section

### ✅ Correct: H3 for subsections

#### Subsection details

#### ❌ FORBIDDEN: HTML H1 in content

<h1>This creates a second H1 on the page</h1>
```

**Problems with HTML H1s in content:**

- **Multiple H1s per page** (accessibility violation)
- **Screen reader confusion** (which heading is the main topic?)
- **SEO dilution** (what is this page really about?)
- **Document outline corruption** (broken heading hierarchy)

**Correct Approach:**

- Use `##` for main content sections (becomes H2)
- Use `###` for subsections (becomes H3)
- Use `####` for details (becomes H4)
- **Never** write `<h1>` tags in markdown content

#### Template H1 Display

- **Blog Posts**: `hero-blog.html` displays `{{ .context.Title }}` as H1
- **Tools**: `hero-tools.html` displays `{{ .context.Title }}` as H1
- **Portfolio**: `hero-portfolio.html` displays `{{ .context.Title }}` as H1
- **Static Pages**: `single.html` displays `{{ .Title }}` as H1

#### Correct Structure

```markdown
---
title: 'Page Title'
date: 2025-01-01T00:00:00Z
draft: false
---

# NO H1 HERE - Title comes from frontmatter

## Start with H2 for first section

Content begins here...
```

#### Incorrect Structure

```markdown
---
title: 'Page Title'
---

# Page Title ← REMOVE THIS - creates duplicate H1

## Content
```

#### Content Starts With

- **H2** (`## Section Title`) for main content sections
- **Images**, **paragraphs**, or **other elements** directly after frontmatter
- Never H1 titles in markdown content

### Portfolio Frontmatter Structure

Portfolio items require specific frontmatter fields for consistent display in
the card grid and detail pages:

```yaml
---
title: 'Project Name' # Required: Display title
date: 2024-11-23 # Required: Publication date
draft: false # Required: Set to false for live projects
description: 'Brief project description' # Required: Used in cards and SEO
client: 'Personal Project - Category' # Required: Project context
technologies: ['Tech1', 'Tech2'] # Required: Array of technologies used
github_url: 'https://github.com/user/repo' # Optional: GitHub repository link
live_url: 'https://example.com/demo' # Optional: Live demo URL (displays "Live Demo" button)
completion_date: '2024-11' # Required: When project was completed
category: 'Web App' # Required: Project category for badges
---
```

#### Required Fields

- `title`, `date`, `draft`, `description`, `client`, `technologies`,
  `completion_date`, `category`

#### Optional Fields

- `github_url`: Displays GitHub icon button linking to repository
- `live_url`: Displays "Live Demo" button with external link

#### Validation

- Use `live_url` (not `demo_url`) to match template expectations
- Technologies array should use consistent naming (e.g., 'React', 'Node.js')
- Categories should be consistent across projects (e.g., 'Web App', 'Educational
  Game')

---

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

### Package Management with Bun

#### Installation

```bash
bun install --frozen-lockfile  # Reproducible installs (CI/CD)
bun install                    # Development installs
bun update                     # Update dependencies
```

#### Security

```bash
bun audit --audit-level=moderate  # Security scanning
```

#### Performance

- Bun provides 3-5x faster dependency installation
- Reduced disk usage and better TypeScript support
- No need for node_modules cleanup in CI/CD with Bun's cache

### Maintenance Guidelines

#### Documentation

- Update this style guide when making changes
- Document custom shortcodes
- Maintain component library
- Keep README files current

#### Version Control

- Commit templates and content separately
- Use semantic versioning for releases
- Tag releases in git
- Maintain changelog

#### Theme Management

- **Browser Dark Mode Prevention**: `color-scheme` meta tag set to "light" to
  prevent Brave iOS night mode from interfering with Alpine.js fonts and
  components
- **Explicit Text Colors**: Alpine.js components use `text-base-content` classes
  to override browser dark mode defaults
- **Theme Persistence**: User-selected themes are saved to localStorage and
  persist across sessions
- **System Preference Handling**: Respects browser preferences for initial theme
  selection while preventing dark mode interference

#### Site Configuration

- **Logo Parameter**: Site logo is configurable via `params.logo` in `hugo.toml`
  (defaults to `/img/logo.png`)
- **Favicon Parameters**: Favicon paths are configurable via `params.favicon_*`
  parameters in `hugo.toml`
- **Profile Image**: Hero profile image is data-driven via `data/hero.toml` with
  fallback to `/img/profile.jpg`
- **Hero Content**: All hero titles, descriptions, and colors are data-driven
  via `data/hero.toml`
- **Data-Driven Assets**: All site assets and content should use Hugo parameters
  or data files for easy customization and maintenance

#### Testing

- Test template changes across all content types
- Validate HTML and CSS
- Check responsive design
- Verify accessibility compliance

---

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

---

## Accessibility Standards

### Semantic HTML

- Use proper heading hierarchy (h1-h6)
- **CRITICAL: Only ONE H1 per page** (handled by templates, not markdown)
- Implement ARIA labels where needed
- Ensure keyboard navigation
- Provide alt text for images

#### Heading Best Practices

- **H1**: Page title (displayed by hero template from frontmatter)
- **H2**: Main content sections (`## Section Title`)
- **H3**: Subsections (`### Subsection`)
- **H4-H6**: Nested content as needed
- **Never**: H1 titles in markdown content (creates duplicates)

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

---

## See Also

- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Detailed accessibility standards and
  WCAG compliance
- [TESTING.md](./TESTING.md) - Testing infrastructure and strategies
- [BUN_MIGRATION_GUIDE.md](./BUN_MIGRATION_GUIDE.md) - Bun package manager usage
- [VERSIONING_GUIDELINES.md](./VERSIONING_GUIDELINES.md) - Semantic versioning
  and auto-bumping
