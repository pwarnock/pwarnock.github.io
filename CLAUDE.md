# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio and blog for Peter Warnock, built with **Hugo static site generator** using a modern design system with **Tailwind CSS** and **DaisyUI** components. The project features comprehensive testing infrastructure, automated deployment, and advanced development workflows.

**Key Technologies:**
- **Hugo** v0.120+ (static site generator)
- **Bun** (package manager and runtime)
- **Tailwind CSS v4** with DaisyUI components
- **TypeScript** for utilities and testing
- **Go** for testing infrastructure and BDD scenarios

## Common Development Commands

### Development & Building
```bash
# Start development server (main command)
bun run dev

# Build for production
bun run build

# Generate version information (run before builds)
bun run generate-version

# Path-based builds (automatically detects change type)
bun run build:path        # Auto-detect optimal build strategy
bun run build:content     # Fast content build (~30s)
bun run build:infra       # Comprehensive infrastructure testing (~5min)
```

### Testing & Validation
```bash
# Run all validation (content, links, portfolio, security)
bun run validate

# Individual test suites
bun run test:unit                # Go unit tests
bun run test:unit:ts            # TypeScript unit tests with Vitest
bun run test:e2e                # Playwright end-to-end tests
bun run test:visual             # Visual regression tests
bun run test:coverage           # Generate coverage reports
bun run test:deployment         # Deployment validation tests

# Watch mode testing
bun run test:watch              # Watch all tests
bun run test:e2e:watch         # Watch E2E tests
bun run test:unit:watch        # Watch unit tests
```

### Code Quality & Linting
```bash
bun run lint                   # Run all linters (YAML, TOML, CSS)
bun run format                 # Format code with Prettier
bun run format:check           # Check formatting without changes
```

### Deployment
```bash
# Environment switching
bun run env:staging            # Switch to staging branch
bun run env:production         # Switch to production branch
bun run env:main               # Switch to main branch

# Deploy to environments (requires proper permissions)
bun run deploy:staging         # Deploy to staging
bun run deploy:production      # Deploy to production

# Environment sync
bun run sync:env               # Sync environment configurations
```

## High-Level Architecture

### Directory Structure
```
├── content/                    # Site content (Markdown files)
│   ├── blog/                 # Blog posts
│   ├── portfolio/            # Portfolio projects
│   └── tools/                # Tool showcases
├── layouts/                   # Hugo templates and components
│   ├── _default/             # Default page templates
│   ├── partials/             # Reusable components
│   └── shortcodes/           # Hugo shortcodes
├── config/                    # Environment-specific configurations
│   ├── development/          # Development environment
│   ├── staging/              # Staging environment
│   └── production/           # Production environment
├── static/                    # Static assets (CSS, images)
├── src/                       # TypeScript utilities and CLI tools
├── test/                      # Go testing infrastructure and BDD scenarios
├── tests/                     # Playwright E2E and visual tests
├── scripts/                   # Build, deployment, and utility scripts
├── docs/                      # Comprehensive project documentation
├── .cody/                     # Cody Framework for project management
└── hugo.toml                  # Main Hugo configuration
```

### Multi-Layer Testing Architecture

This project features enterprise-grade testing across multiple layers:

1. **Unit Tests (Go)**: `test/support/` - Core functionality and utilities
   - Command: `cd test && go test -v ./support/...`
   - Coverage: 4.5% baseline with structured logging

2. **BDD Tests (Godog)**: `test/features/` - Behavior-driven development scenarios
   - Coverage: 9/9 scenarios across accessibility, functionality, performance
   - Command: `cd test && go test -v ./...`

3. **End-to-End Tests (Playwright)**: `tests/` - User journey testing
   - Visual regression, performance benchmarks, cross-browser testing
   - Command: `bunx playwright test`

4. **Integration Tests**: `test/deployment_*.sh` - Deployment and workflow validation

### Content Management System

#### Blog Posts
- **Location**: `content/blog/`
- **Format**: Markdown with YAML frontmatter
- **Validation**: Automatic frontmatter validation via `scripts/validate-blog-post.sh`
- **Required fields**: title, date, draft, tags, description
- **Workflow**: See `docs/tutorials/ADDING_BLOG_POST.md`

#### Portfolio Projects
- **Location**: `content/portfolio/project-name/`
- **Format**: Directory with `index.md` and supporting assets
- **Validation**: `scripts/validate-portfolio-frontmatter.js`

#### Tools Showcase
- **Location**: `content/tools/`
- **Format**: Markdown with structured metadata
- **API**: Automatically generates `public/tools/index.json`

### Deployment Architecture

#### Multi-Environment Strategy
- **Development**: Local Hugo server with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live site at https://peterwarnock.com

#### Release Process
- **Mandatory**: All releases go through `scripts/release.sh`
- **Three-stage**: RC → Test → Production pipeline
- **Automated**: Release controller handles version bumps and deployment
- **Guardrails**: CI blocks manual version edits, enforces proper workflow

#### CI/CD Pipeline
- **GitHub Actions** with multi-environment matrix (Ubuntu, Windows, macOS)
- **Path-based builds** for optimized deployment times
- **Quality gates** with automated testing and security scanning
- **Deployment validation** with 27 unit + 14 integration tests

### Design System & Styling

#### CSS Framework
- **Tailwind CSS v4** with PostCSS pipeline
- **DaisyUI components** for consistent UI elements
- **Custom CSS variables** defined in design system
- **Dark/light themes** with theme selector

#### Component Architecture
- **Location**: `layouts/partials/components/`
- **Pattern**: Reusable, accessible components with ARIA labels
- **Naming**: BEM methodology for CSS classes
- **Guidelines**: See `docs/development/STYLE_GUIDE.md`

### Issue Tracking & Project Management

#### Beads Database (Primary System)
- **CLI**: `bd` commands for all issue tracking
- **Location**: `.beads/issues.jsonl` (auto-synced with git)
- **Integration**: Links to Cody Framework features
- **Workflow**: See `docs/integration/CODY_BEADS_WORKFLOW.md`

#### Cody Framework
- **Project Management**: `.cody/` directory
- **Version Tracking**: Semantic versioning with automated release notes
- **Feature Planning**: Three-phase process (plan → build → version)
- **Commands**: All prefixed with `:cody`

### Development Workflow Guidelines

#### Before Starting Work
1. **Run agent initialization**: `./scripts/agent-init.sh`
2. **Check ready work**: `bd ready --json`
3. **Claim task**: `bd update <id> --status in_progress`

#### Content Creation Workflow
1. **Create content** in appropriate `content/` directory
2. **Validate frontmatter** using validation scripts
3. **Test locally** with `bun run dev`
4. **Run validation** with `bun run validate`
5. **Commit and push** following git workflow

#### Code Quality Standards
- **TypeScript**: Strict mode for utilities and tooling
- **CSS**: Tailwind + DaisyUI with custom design tokens
- **Accessibility**: WCAG 2.1 AA compliance required
- **Testing**: All new features require appropriate test coverage

### Important Rules & Constraints

#### NEVER Edit These Files Directly
- `.cody/` directory - Managed by Cody Framework
- `package.json.version` - Managed by release controller
- Generated Hugo files in `public/` directory

#### ALWAYS Use These Systems
- **Issue tracking**: `bd` CLI commands (never markdown TODOs)
- **Version management**: `scripts/release.sh` (never manual edits)
- **Environment config**: `config/{environment}/hugo.toml` files
- **Documentation updates**: Add to existing docs in `/docs/` namespace

#### Testing Requirements
- **Content changes**: Run `bun run validate` before commit
- **Infrastructure changes**: Run `bun run test:deployment`
- **All changes**: Test in development environment before deployment

### Emergency Procedures

#### Production Issues
1. **Notify immediately** via appropriate channels
2. **Rollback**: See `docs/operations/ROLLBACK_PROCEDURES.md`
3. **Verify service restoration**
4. **Document incident** and create retrospective

#### Framework Issues
1. **Run health check**: `./scripts/check-cody-health.sh`
2. **Create backup**: `./scripts/backup-cody.sh`
3. **Document all access** in issue tracker
4. **Consider framework reinstall** if corruption suspected

### Key Documentation References

- **Getting Started**: `docs/tutorials/GETTING_STARTED.md`
- **Development Workflow**: `AGENTS.md` (this file's parent)
- **Release Management**: `docs/operations/RELEASE_WORKFLOW.md`
- **Testing Architecture**: `docs/development/TESTING_ARCHITECTURE.md`
- **Style Guide**: `docs/development/STYLE_GUIDE.md`
- **Documentation Index**: `docs/README.md` (master index)

### Performance & Optimization

#### Build Optimization
- **Path-based builds**: Automatically detects optimal build strategy
- **Asset optimization**: Hugo pipes with minification and compression
- **Bundle analysis**: `bun run analyze:bundles` for optimization insights
- **CDN verification**: `scripts/verify-cdn-integrity.sh`

#### Monitoring & Observability
- **OpenTelemetry integration**: Structured logging and tracing
- **Performance monitoring**: `scripts/performance-monitor.sh`
- **Security testing**: `scripts/test-security.js`
- **Accessibility testing**: `scripts/accessibility-test.sh`

This project represents a modern, enterprise-grade approach to static site development with comprehensive testing, automated deployment, and advanced development workflows. Always consult the documentation index and use the established systems rather than creating parallel processes.