# Agent Guidelines for pwarnock.github.io

## Build Commands
- **Development server**: `hugo server -D` (includes drafts)
- **Production build**: `hugo --minify`
- **Clean build**: `hugo -d public --minify`

## Code Style Guidelines

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