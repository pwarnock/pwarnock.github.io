# Agent Guidelines for pwarnock.github.io

## Build Commands
- **Install dependencies**: `npm install` (installs Node.js dependencies for TailwindCSS and DaisyUI)
- **Development server**: `hugo server -D` (includes drafts)
- **Production build**: `hugo --minify`
- **Clean build**: `hugo -d public --minify`

## Code Style Guidelines

### General
- Avoid hardcoding values; use theme variables, data files, or configuration options instead
- Prefer reusable, configurable components over layout-specific overrides

### Hugo Templates
- Use Go template syntax with proper context scoping (`$.Site` vs `.Site`)
- Prefer semantic HTML in templates
- Use Hugo's built-in functions for date formatting: `{{ .Date.Format "2006-01-02" }}`

### Content Front Matter
- Use TOML format for front matter (preferred)
- Required fields: `title`, `date`, `draft`
- Use lowercase, hyphen-separated filenames
- Include `description` for SEO

### Python Scripts
- Follow PEP 8 naming conventions
- Use descriptive variable names
- Include docstrings for functions
- Handle errors gracefully with try/except blocks

### File Organization
- Content in `content/posts/` as page bundles (folders with index.md)
- Static assets in `static/` directory
- Data files in TOML format in `data/` directory

### Git Workflow
- Use conventional commit messages
- Keep drafts as `draft: true` until ready
- Test builds locally before pushing

### Testing and Validation
- **Build validation**: Run `hugo --minify` to ensure the site builds without errors
- **CI checks**: Push changes to trigger GitHub Actions CI, which includes:
  - HTML link validation (htmltest)
  - SEO validation
  - Accessibility testing (Lighthouse)
  - Performance testing
- **Local accessibility check**: Use browser dev tools or Lighthouse extension to audit pages

### Work Tracking
We track work in Beads instead of Markdown. Run `bd quickstart` to see how.

### Development Workflow
- **Plan First**: Before implementing any feature, create a detailed plan and get user approval.
- **Incremental Changes**: Implement one feature at a time, committing after each.
- **Show Implementation**: After building, demonstrate how features are implemented.

### Theme Customization
- Theme switching is implemented with DaisyUI themes (light, dark, retro, cyberpunk, halloween).
- Use the palette button in the navbar to cycle themes.
- Themes are configured in `tailwind.config.js` and color variables are mapped in `static/css/custom.css`.
- Font overrides use theme fonts (Poppins for headings, Roboto for body), loaded in `layouts/partials/head.html`.
- Treat themes as external dependencies. Do not modify files in `themes/` directly. Instead, use Hugo's layout overrides by placing modified versions in the site's `layouts/` directory with the same relative path (e.g., override `themes/theme-name/layouts/partials/example.html` by creating `layouts/partials/example.html`).
- Theme defaults: Halloween theme in October, dark theme if system prefers dark mode, random theme otherwise (when no localStorage value exists).