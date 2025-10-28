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
title: "Page Title"
date: 2025-01-01T00:00:00Z
draft: false
description: "Brief description for SEO"
tags: ["tag1", "tag2"]
categories: ["category"]
customHTML: false  # Set to true for pages with custom HTML layouts
---
```

#### Custom HTML Pages
For pages that require custom HTML layouts (like the About page), set `customHTML: true` in front matter. This removes the prose wrapper and allows full HTML control:

```yaml
---
title: "About"
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

### Class Naming
- Component-based: `.component-name`
- Modifiers: `.component-name--modifier`
- Elements: `.component-name__element`

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Use Tailwind CSS utility classes
- Custom CSS only when necessary

### Color Usage
- Semantic color names (primary, secondary, accent)
- Consistent with design system
- Accessibility compliant (WCAG AA)

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
{{ partial "sections/hero.html" (dict 
  "context" . 
  "title" .Title 
  "description" .Params.description
  "image" .Params.image
) }}
```

### Content Grid
```html
{{ partial "sections/content-grid.html" (dict
  "context" .
  "items" .Pages
  "title" "Recent Posts"
  "cardType" "blog"
) }}
```

### Card Component
```html
{{ partial "components/content-card.html" (dict
  "context" .
  "item" .item
  "cardType" .cardType
  "showDate" true
  "showDescription" true
) }}
```

This style guide should be updated as the project evolves and should serve as the single source of truth for design and development decisions.