# Project Guide: pwarnock.github.io
*Consolidated reference for agents working on this Hugo-powered personal website*

## Project Overview

A Hugo-powered personal website featuring:
- Advanced link handling with custom render hooks
- DaisyUI theme system (light, dark, retro, cyberpunk, halloween)
- Social media integration
- Blog posts with search functionality
- Tools directory and experience showcases

## Build Commands

- **Install dependencies**: `npm install` (for TailwindCSS and DaisyUI)
- **Development server**: `hugo server -D` (includes drafts)
- **Production build**: `hugo --minify`
- **Clean build**: `rm -rf public && hugo -d public --minify`
- **Theme build**: `cd themes/hugo-porto && npm run build` (PostCSS + Tailwind)

## Key Features

### Advanced Link Handling
Custom Hugo render hook automatically handles external links:
- External links → new tabs + `rel="nofollow noopener noreferrer"`
- Override with bracket codes: `[nt]` (no tab), `[ot]` (open tab), `[nf]` (nofollow), `[f]` (follow)

### Theme System
- DaisyUI themes with automatic switching (seasonal + system preference)
- Font overrides: Poppins (headings), Roboto (body)
- Theme defaults: Halloween in October, dark mode if preferred, random otherwise

### Social Media
Configured in `data/footer.toml` with support for LinkedIn, GitHub, X, Discord, etc.

## Development Workflow

### Git Workflow
- **Never commit to main directly** - Use feature branches
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Branch naming: `feature/{bead-id}-{description}`
- Pre-commit hooks: YAML/TOML/CSS lint + build validation

### Content Management
- Content in `content/posts/` as page bundles (folders with index.md)
- Front matter: TOML format, required: `title`, `date`, `draft`
- SEO: Include `description` field
- File naming: lowercase, hyphen-separated

### Code Style Guidelines

#### Hugo Templates
- Go template syntax with proper context scoping (`$.Site` vs `.Site`)
- Semantic HTML preferred
- Date formatting: `{{ .Date.Format "2006-01-02" }}`
- Custom link rendering via `layouts/_default/_markup/render-link.html`

#### Theme Customization
- Treat themes as external dependencies
- Override theme files by placing modified versions in `layouts/` with same relative path
- Theme files: `themes/hugo-porto/`
- Override location: `layouts/` (same relative path structure)

#### Python Scripts (if any)
- PEP 8 naming conventions
- Descriptive variable names
- Docstrings for functions
- Graceful error handling

## File Organization

```
/Users/peter/pwarnock.github.io/
├── content/posts/          # Page bundles (folders with index.md)
├── data/                   # TOML data files
├── layouts/                # Hugo template overrides
├── static/                 # Static assets
├── themes/hugo-porto/      # Theme submodule
├── plans/                  # Project planning docs
└── AGENTS.md               # This file (agent guidelines)
```

## Testing & Validation

### Build Validation
- `hugo --minify` - Ensure no build errors
- Check typography styles (`.prose` classes generated)
- Verify responsive design

### Link Rendering Tests
- External links: auto target="_blank" + rel attributes
- Internal links: unchanged
- Bracket codes: `[nt]`, `[ot]`, `[nf]`, `[f]`

### CI/CD (GitHub Actions)
- HTML link validation
- SEO validation
- Accessibility (Lighthouse)
- Performance testing

## Agent Guidelines

### Interaction Style
- Engage in interactive conversations, not one-way execution
- Ask clarifying questions and confirm understanding
- Present options for significant changes and get approval
- Provide progress updates during complex tasks

### Work Tracking
- Track work using Beads (not Markdown todos)
- Create Bead issues for feature branches
- Branch status: `open` → `in-progress` → `completed`

### Planning Approach
- Plan first, implement incrementally
- One feature at a time, commit after each
- Show implementation after building

## Current Status

### ✅ Resolved Issues
- Tailwind typography plugin working correctly
- PostCSS build generating `.prose` styles
- Hugo builds successful (67 pages)

### 🔄 Theme Status
- Using Hugo Porto theme (submodule)
- DaisyUI integration active
- Custom typography configuration in place
- Dark mode and theme switching functional

### 📋 Known Configurations
- Tailwind config centralized in theme directory
- PostCSS using `@tailwindcss/postcss` plugin
- Content paths include layouts and content directories
- DaisyUI themes: light, dark, retro, cyberpunk, halloween

## Submodule Workflow (Important!)

When modifying theme files (`themes/hugo-porto/`):

1. Navigate into submodule: `cd themes/hugo-porto`
2. Make/commit changes: `git commit -am "feat: description"`
3. Push submodule: `git push origin main`
4. Return to root: `cd ../..`
5. Commit reference: `git commit -am "chore: update hugo-porto submodule"`
6. Push parent: `git push`

*Failure to push submodule changes will break CI/CD pipelines*

---

*This guide consolidates essential project information for efficient agent sessions. Last updated: {{ now.Format "2006-01-02" }}*
