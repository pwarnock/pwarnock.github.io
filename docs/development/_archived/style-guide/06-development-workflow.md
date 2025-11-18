# Development Workflow

## Adding New Content Type

1. Create content directory under `/content/`
2. Add `_index.md` for section page
3. Configure in `hugo.toml` if needed
4. Use existing `_default/list.html` and `_default/single.html`

## Modifying Templates

1. Check `_default/` templates first
2. Create specific templates only when necessary
3. Use partials for reusable components
4. Test across all content types

## Adding New Components

1. Create in `partials/components/`
2. Use BEM-style classes
3. Make configurable with parameters
4. Document usage in comments

## Package Management with Bun

### Installation

```bash
bun install --frozen-lockfile  # Reproducible installs (CI/CD)
bun install                    # Development installs
bun update                     # Update dependencies
```

### Security

```bash
bun audit --audit-level=moderate  # Security scanning
```

### Performance

- Bun provides 3-5x faster dependency installation
- Reduced disk usage and better TypeScript support
- No need for node_modules cleanup in CI/CD with Bun's cache

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

### Theme Management

- **Browser Dark Mode Prevention**: `color-scheme` meta tag set to "light" to
  prevent Brave iOS night mode from interfering with Alpine.js fonts and
  components
- **Explicit Text Colors**: Alpine.js components use `text-base-content` classes
  to override browser dark mode defaults
- **Theme Persistence**: User-selected themes are saved to localStorage and
  persist across sessions
- **System Preference Handling**: Respects browser preferences for initial theme
  selection while preventing dark mode interference

### Site Configuration

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

### Testing

- Test template changes across all content types
- Validate HTML and CSS
- Check responsive design
- Verify accessibility compliance
