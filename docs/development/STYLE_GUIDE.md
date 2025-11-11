# Peter Warnock - Personal Site Style Guide

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
summary: 'Required: Brief summary for homepage and list views (150-200 chars)'
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

### Blog Post Creation Guidelines

**CRITICAL: Summary field is REQUIRED for all blog posts**

The `summary` field in frontmatter is mandatory for proper display on homepage
and section pages. Without it, posts will appear incomplete or broken.

#### Required Blog Post Frontmatter

```yaml
---
title: 'Blog Post Title' # Required: Display title
date: 2025-01-01T00:00:00Z # Required: Publication date
draft: false # Required: Set to false for published posts
description: 'SEO description for search engines' # Required: Meta description
summary: 'Required: Brief summary for homepage and list views (150-200
  characters)' # REQUIRED
tags: ['tag1', 'tag2'] # Optional: For categorization
categories: ['category'] # Optional: For grouping
---
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

#### Image Guidelines for Blog Posts

**Image Storage & Access:**

- **Location**: Place images in `static/images/blog/` for global access
- **Page Resources**: For page-specific images, create page bundles with
  `index.md` and image files
- **Frontmatter**: Always specify `image` parameter for homepage display

**Image Frontmatter (Required for Homepage):**

```yaml
---
title: 'Your Blog Post Title'
image: '/images/blog/your-image.jpg' # Required for homepage latest post card
summary: '150-200 character summary for homepage display'
---
```

**Image Usage Patterns:**

1. **Homepage Latest Post Card**: Uses `image` frontmatter parameter
2. **Content Images**: Use Hugo's figure shortcode for processing
3. **Responsive Images**: Hugo automatically optimizes when using resources

**Example Complete Blog Post:**

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

**Image Processing Best Practices:**

- **Featured Images**: Use `image` parameter for homepage cards
- **Content Images**: Use `{{< figure >}}` shortcode for automatic optimization
- **Sizing**: Hugo automatically resizes images in templates (400x200 for cards)
- **Formats**: Use JPG, PNG, or WebP formats
- **Alt Text**: Always provide descriptive alt text for accessibility

**Template Image Handling:**

The homepage template follows Hugo conventions:

1. **First Priority**: `image` frontmatter parameter
2. **Second Priority**: `thumbnail` parameter
3. **Fallback**: Page resources (feature*, cover*, thumbnail\*)
4. **Final Fallback**: First image in page bundle

**Validation:**

Blog posts are validated automatically:

```bash
# Validate all blog posts
./scripts/validate-blog-post.sh

# Check specific post
./scripts/validate-blog-post.sh content/blog/posts/your-post/

# Full validation includes blog checks
./scripts/validate.sh
```

**Validation Checks:**

- ✅ **Required frontmatter fields**: title, date, draft, description, summary,
  image
- ✅ **Image path existence**: Verifies frontmatter image exists in static
  directory
- ✅ **Summary length**: Recommends 150-200 characters for optimal display
- ✅ **Heading structure**: Ensures no H1 in content (prevents duplicates)
- ✅ **Content images**: Validates image paths in content

**Common Validation Errors:**

- ❌ `Missing required fields: image` → Add
  `image: '/images/blog/your-image.jpg'` to frontmatter
- ❌ `Frontmatter image not found` → Verify image exists in static directory
- ⚠️ `Summary too short/long` → Adjust summary to 150-200 characters
- ❌ `Contains H1 heading` → Remove `# Title` from content, use H2+ instead

#### Validation

Blog posts are validated automatically:

```bash
# Validate all blog posts
npm run validate

# Check specific post
./scripts/validate-blog-post.sh content/blog/posts/your-post/
```

**Validation checks for:**

- Required frontmatter fields (title, date, draft, description, summary)
- Proper heading structure (no H1 in content)
- Image paths and optimization
- Content length and quality

### Heading Structure Guidelines

**CRITICAL: No H1 Titles in Markdown Content**

All content types (blog posts, portfolio items, tools, static pages) must
**NOT** include H1 titles (`# Title`) in their markdown content.

**Why?**

- Hero templates already display the title as an H1 from frontmatter
- Duplicate H1s create accessibility issues for screen readers
- Maintains SEO optimization while ensuring a11y compliance

**Template H1 Display:**

- **Blog Posts**: `hero-blog.html` displays `{{ .context.Title }}` as H1
- **Tools**: `hero-tools.html` displays `{{ .context.Title }}` as H1
- **Portfolio**: `hero-portfolio.html` displays `{{ .context.Title }}` as H1
- **Static Pages**: `single.html` displays `{{ .Title }}` as H1

**Correct Structure:**

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

**Incorrect Structure:**

```markdown
---
title: 'Page Title'
---

# Page Title ← REMOVE THIS - creates duplicate H1

## Content
```

**Content Starts With:**

- **H2** (`## Section Title`) for main content sections
- **Images**, **paragraphs**, or **other elements** directly after frontmatter
- Never H1 titles in markdown content

#### Portfolio Frontmatter Structure

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

**Required Fields:**

- `title`, `date`, `draft`, `description`, `client`, `technologies`,
  `completion_date`, `category`

**Optional Fields:**

- `github_url`: Displays GitHub icon button linking to repository
- `live_url`: Displays "Live Demo" button with external link

**Validation:**

- Use `live_url` (not `demo_url`) to match template expectations
- Technologies array should use consistent naming (e.g., 'React', 'Node.js')
- Categories should be consistent across projects (e.g., 'Web App', 'Educational
  Game')

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

### Theme-Aware Color System

**DaisyUI Theme Variables** (v0.10.2+):

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
  background-color: oklch(
    var(--b2)
  ); /* Base-200 - subtle theme-aware background */
  color: oklch(var(--bc));
}

/* Primary color that adapts to theme */
.btn-system--outline {
  color: oklch(var(--p)); /* Primary color */
  border-color: oklch(var(--p));
}
```

**Available DaisyUI Theme Variables:**

- `--bc`: Base content (text color)
- `--b1`, `--b2`, `--b3`: Base color variations
- `--p`: Primary color
- `--pc`: Primary content (text on primary)
- `--s`: Secondary color
- `--a`: Accent color

**Why theme-aware?** Ensures proper contrast ratios across all themes, WCAG
compliance, and consistent user experience.

### Color & Alpha Standards

**Color Function Notation** (consistent with v0.10.2):

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
- **CRITICAL: Only ONE H1 per page** (handled by templates, not markdown)
- Implement ARIA labels where needed
- Ensure keyboard navigation
- Provide alt text for images

**Heading Best Practices:**

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

## Environment Variables & Security

### URL Configuration Management (v0.12.1+)

**Config Merging Strategy: Main + Development Override**

Use Hugo's config merging to avoid duplication:

#### Configuration Structure

- **Main**: `hugo.toml` → ALL production settings + ALL params
- **Dev Override**: `config/development/hugo.toml` → ONLY dev-specific overrides
- Hugo merges both: dev config inherits all main params while overriding dev-specific values

#### Main Config (hugo.toml)

```toml
baseURL = "https://peterwarnock.com/"

[params]
  # All shared parameters (REQUIRED for footer, etc.)
  github = "https://github.com/pwarnock"
  linkedin = "https://www.linkedin.com/in/peterwarnock"
  twitter = "https://x.com/pwarnock"
  discord = "https://discord.gg/pwarnock"
  newsletter_url = "https://gmail.us8.list-manage.com/..."
  googleAnalytics = "G-SKDDM2GBXN"
```

#### Development Override (config/development/hugo.toml)

```toml
baseURL = "http://localhost:1313"

[params]
  googleAnalytics = ""  # Disable GA in dev
  env = "development"
  # Other params inherited from main config
```

#### Config Merging in PM2 (ecosystem.config.cjs)

```javascript
args: [
  'server',
  '--config', 'config/development/hugo.toml,hugo.toml'
  // Hugo merges: dev overrides + main config
]
```

#### Critical Rules

- ✅ Main config (`hugo.toml`) has ALL production params (not empty!)
- ✅ Development config ONLY overrides what's different
- ✅ Use `--config dev,main` for proper inheritance order
- ❌ Never duplicate params across files
- ❌ Never leave main config with missing params

### Hugo Security Policy (v0.10.2+)

**Environment Variable Access:**

Hugo restricts `getenv()` calls to variables starting with `HUGO_` for security:

```toml
# hugo.toml - Only HUGO_* vars are accessible via getenv()
[security.funcs]
  getenv = ['^HUGO_']
```

**Google Analytics Setup:**

```yaml
# GitHub Actions workflow
env:
  HUGO_ENV: production
  HUGO_GOOGLE_ANALYTICS_ID: ${{ secrets.GOOGLE_ANALYTICS_ID }}

# Hugo template
{{ if eq (getenv "HUGO_ENV") "production" }}
<script async src="https://www.googletagmanager.com/gtag/js?id={{ getenv "HUGO_GOOGLE_ANALYTICS_ID" }}">
```

**GitHub Repository Secrets Required:**

- `GOOGLE_ANALYTICS_ID`: Your GA tracking ID (e.g., `G-SKDDM2GBXN`)

### Footer Git Information

**Dynamic Git Hash Display (v0.10.2+):**

Footer automatically shows current commit hash using data from
`generate-version.js`:

```html
v{{ .Site.Params.version }}{{ with .Site.Data.version.hash }} ({{ . }}){{ end }}
```

Example: `v0.10.2 (163b213)`

**How it works:**

- `generate-version.js` runs during build and creates `data/version.toml` with
  git hash
- Template reads from `.Site.Data.version.hash` (more reliable than `.GitInfo`)
- Falls back gracefully when data file is unavailable

## Push Guardrail System

### Pre-Push Confirmation (v0.10.2+)

**All pushes require explicit confirmation** to prevent accidental deployments.

#### How It Works

- **Husky-managed pre-push hook** runs automatically before any `git push`
- Shows summary of commits being pushed
- Requires typing `'yes'` to confirm deployment
- Prevents accidental production deployments

**Note:** Hook executes on all developer machines (Husky ensures consistency).
CI/CD systems bypass git hooks.

#### Normal Workflow

```bash
git add .
git commit -m "feat: add new feature"
git push
# → Hook prompts: "Type 'yes' to confirm and push"
# → Type: yes
# → Push proceeds
```

#### Emergency Bypass

**Only use in critical situations:**

```bash
./scripts/emergency-push.sh
# → Requires typing 'emergency' to confirm
# → Bypasses Husky hook entirely
```

#### Setup for New Developers

Husky hooks are automatically installed when running `npm install` (via
postinstall script). The pre-push guardrail will be active immediately.

#### Benefits

- ✅ **Prevents accidental pushes** during development
- ✅ **Forces review** of changes before deployment
- ✅ **Maintains production stability**
- ✅ **Easy bypass** for emergencies

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

**For Full-Width Heroes (Homepage, Section Pages):**

```html
<!-- Place hero OUTSIDE main element for edge-to-edge layout -->
{{ partial "components/hero" (dict "context" . "size" "full" "background"
"gradient-primary" "title" .Title "layout" "homepage"
<!-- or "blog", "portfolio", "tools" -->
) }}
```

**For Section Pages with Breadcrumbs:**

```html
<!-- Hero outside main container -->
{{ if eq .Type "blog" }}
<!-- Breadcrumbs above hero -->
{{ if not .Params.hideBreadcrumbs }}
<div class="container mx-auto px-4 py-4">
  <div class="breadcrumbs text-sm">
    <ul>
      <li><a href="/">Home</a></li>
      <li>{{ .Title }}</li>
    </ul>
  </div>
</div>
{{ end }} {{ partial "components/hero" (dict "context" . "size" "full"
"background" "gradient-primary" "title" .Title "layout" "blog" ) }} {{ end }}
```

**Key Pattern: Hero Outside Main Container**

- Place hero **outside** `<main>` element for true edge-to-edge layout
- Main content gets `container mx-auto` for proper content constraints
- This matches homepage pattern and GitHits best practices
- Works for blog, portfolio, tools, and other section pages

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

## Link Annotations & SEO

### Editorial Links (Nofollow Override)

For links that are genuine editorial references to authoritative sources (experts, published research, industry standards), use the "Editorial reference" title attribute to exclude them from `nofollow`:

```markdown
[Expert Name](https://example.com "Editorial reference")
[James Clear's Newsletter](https://jamesclear.com/3-2-1 "Editorial reference")
[Thoughtworks Radar](https://www.thoughtworks.com/radar "Editorial reference")
```

**How it works:**
- Template detects the "Editorial reference" title attribute
- Renders with `rel="noopener"` (no nofollow)
- Hides the title attribute in the HTML output
- Passes link equity to authoritative sources

**When to use:**
- ✅ Citations of industry experts or thought leaders
- ✅ Links to published research or reports
- ✅ References to authoritative sources (Wikipedia, official docs)
- ✅ Expert analysis or deep dives you're citing
- ❌ NOT for affiliate links, sponsored content, or self-promotion
- ❌ NOT for UGC or links you can't personally vouch for

### Regular External Links

All other external links automatically receive `rel="noopener noreferrer"` and function as expected:

```markdown
[Regular Link](https://example.com)
[Link with tooltip](https://example.com "Hover text")
```

## Recent Updates

- **v0.12.1**: Editorial link annotation system for SEO optimization
- **v0.12.0**: H1 duplicate removal across all content types, accessibility
   compliance
- **v0.10.2**: Theme-aware color system, GA environment variables, dynamic git
   hash
- **v0.10.1**: Hero section enhancement
- **v0.10.0**: Spacing scale refactoring, version tracking in footer

## Version History

- **v0.11.0** (Nov 2025): H1 duplicate removal across all content types, heading
  structure standardization
- **v0.10.2** (Nov 2025): Accessibility improvements, theme-aware components,
  security hardening
- **v0.10.1** (Oct 2025): Hero section redesign with 3-column layout
- **v0.10.0** (Oct 2025): Comprehensive spacing scale, footer version display

This style guide should be updated as the project evolves and should serve as
the single source of truth for design and development decisions.
