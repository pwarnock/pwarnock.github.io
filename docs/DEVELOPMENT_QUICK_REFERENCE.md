# Development Quick Reference

## Package Management (Bun)

### Installation

```bash
bun install [--frozen-lockfile]  # Install dependencies
bun update                      # Update all dependencies
bun add <package>               # Add production dependency
bun add -D <package>            # Add dev dependency
bun remove <package>             # Remove dependency
```

### Security

```bash
bun audit [--audit-level=moderate]  # Security audit
```

### Scripts

```bash
bun run <script-name>           # Run npm script
bun run dev                     # Development server
bun run build                   # Production build
bun run lint                    # Code linting
```

## Hugo Commands

### Development

```bash
hugo server -D --bind 0.0.0.0 --baseURL http://localhost:1313
hugo server --config config/development/hugo.toml
```

### Production

```bash
hugo --gc --minify --enableGitInfo
hugo --gc --minify --environment production
```

### Build Variants

```bash
bun run build:production        # Production build
bun run build:preview          # Preview build
bun run build:path              # Path-based build detection
```

## Testing

### E2E Tests (Playwright)

```bash
bunx playwright test            # Run all E2E tests
bunx playwright test --project=chromium  # Specific browser
bunx playwright test --update-snapshots   # Update visual baselines
bunx playwright install --with-deps        # Install browsers
```

### Go BDD Tests

```bash
cd test && go test -v ./...           # Run all Go tests
cd test && go test -v -race ./support/  # Unit tests with race detection
cd test && ./run-tests.sh               # Full BDD suite
```

### Code Quality

```bash
bun run lint                       # All linting (YAML, TOML, CSS)
bun run lint:yaml                  # YAML linting
bun run lint:toml                  # TOML linting
bun run lint:css                   # CSS linting
bun run format                     # Prettier formatting
```

## Content Management

### Validation

```bash
bun run validate                   # General validation
bun run validate:portfolio          # Portfolio frontmatter validation
```

### Blog Development

```bash
# Create new post
hugo new blog/posts/new-post.md

# Validate post
bun run validate:portfolio
```

## Performance & Security

### Performance Analysis

```bash
bun run perf:analyze               # Build with stats
bun run perf:monitor              # Performance monitoring
```

### Security

```bash
bun run test-security              # Security tests
bun audit --audit-level=moderate   # Dependency audit
```

## Deployment

### Production Deployment

```bash
bun run build:production        # Build for production
git push origin main            # Deploy to GitHub Pages (automatic)
```

### Environment Management

```bash
bun run deploy:staging          # Deploy to staging
bun run deploy:production       # Deploy to production
bun run sync:env               # Sync environments
```

### Branch Management

```bash
git checkout staging             # Switch to staging branch
git checkout production          # Switch to production branch
git checkout main               # Switch to main branch
```

## Version Management

### Semantic Versioning

```bash
bun run version:patch           # Bump patch version
bun run version:minor           # Bump minor version
bun run version:major           # Bump major version
bun run version:sync            # Sync version files
```

### Release Preparation

```bash
bun run release:prep            # Prepare for release
bun run version:release         # Complete release process
```

## Development Workflow

### Daily Development

```bash
# 1. Start development server
bun run dev

# 2. Make changes
# Edit content, templates, or styles

# 3. Test changes
bun run lint
bun run validate

# 4. Commit changes
git add .
git commit -m "feat: add new feature"
```

### Before Release

```bash
# 1. Full test suite
bun run test:e2e
cd test && go test -v ./...

# 2. Security audit
bun audit --audit-level=moderate

# 3. Production build test
bun run build:production

# 4. Deploy
git push origin main
```

## Troubleshooting

### Common Issues

#### Dependency Issues

```bash
# Clean install
rm -rf node_modules bun.lock
bun install

# Update specific package
bun update package-name
```

#### Build Issues

```bash
# Clean build
rm -rf public/
bun run build:production

# Debug build
hugo --gc --minify --verbose
```

#### Test Issues

```bash
# Install Playwright browsers
bunx playwright install --with-deps

# Run specific test
bunx playwright test tests/e2e-journeys.spec.ts
```

## Environment Variables

### Development

```bash
export HUGO_ENV=development
export HUGO_GTM_CONTAINER_ID=GTM-N9CR6KJ5
```

### Production

```bash
export HUGO_ENV=production
export HUGO_GTM_CONTAINER_ID=GTM-N9CR6KJ5
```

## Quick Commands Cheat Sheet

```bash
# Development
bun run dev                    # Start dev server
bun install                    # Install deps
bun run lint                   # Check code quality
bun run build:production        # Production build

# Testing
bunx playwright test            # E2E tests
cd test && go test ./...       # Go tests

# Deployment
git push origin main            # Deploy to production
bun run deploy:staging         # Deploy to staging

# Utilities
bun update                     # Update deps
bun audit                      # Security check
bun run format                  # Format code
```

---

_This quick reference covers the most common development tasks. For detailed
guides, see the specific documentation in the `docs/` directory._
