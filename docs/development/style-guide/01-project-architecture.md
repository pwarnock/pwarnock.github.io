# Project Architecture

## Directory Structure

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

## Template Hierarchy

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

## URL Structure

- Blog: `/blog/posts/[slug]/`
- Portfolio: `/portfolio/[project-name]/`
- Tools: `/tools/[tool-name]/`
- Sections: `/blog/`, `/portfolio/`, `/tools/`
