# Getting Started - Local Development Setup

Complete guide to setting up the project for local development, including
prerequisites, environment setup, and running tests.

## Prerequisites

Before starting, ensure you have these tools installed:

### Required Tools

| Tool        | Version       | Purpose                              | Install                                     |
| ----------- | ------------- | ------------------------------------ | ------------------------------------------- |
| **Git**     | ≥2.30         | Version control                      | `brew install git`                          |
| **Bun**     | Latest        | JavaScript runtime & package manager | `curl -fsSL https://bun.sh/install \| bash` |
| **Hugo**    | ≥0.120        | Static site generator                | `brew install hugo`                         |
| **Go**      | ≥1.21         | Test utilities language              | `brew install go`                           |
| **Node.js** | ≥18 (via Bun) | Included with Bun                    | (Bun provides Node.js)                      |

### Optional but Recommended

| Tool           | Purpose                   | Install                                  |
| -------------- | ------------------------- | ---------------------------------------- |
| **GitHub CLI** | Branch protection setup   | `brew install gh`                        |
| **Docker**     | Containerized environment | `brew install docker`                    |
| **VS Code**    | Code editor               | `brew install --cask visual-studio-code` |

### Verify Installation

```bash
# Check all required tools
git --version      # ≥2.30
bun --version      # Latest
hugo version       # ≥0.120
go version         # ≥1.21

# Expected output
# git version 2.x.x
# 1.x.x
# Hugo Static Site Generator v0.x.x
# go version go1.21.x
```

---

## Project Setup (First Time)

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/pwarnock/pwarnock.github.io.git
cd pwarnock.github.io

# Verify you're on main branch
git branch
# * main
#   staging
#   production
```

### Step 2: Install Dependencies

```bash
# Install npm/bun packages
bun install

# This will:
# - Download all npm dependencies
# - Set up pre-commit hooks (Husky)
# - Install Go test utilities
```

### Step 3: Verify Installation

```bash
# Check Hugo config
hugo config

# Check Bun packages
bun -v

# List available npm scripts
bun run

# Expected output: 100+ scripts listed
```

### Step 4: First Build

```bash
# Build the site for development
bun run build:preview

# This generates the 'public/' directory with the built site
# You should see output like:
# Hugo 0.x.x ...
# Built in 2.5 seconds
```

### Step 5: Start Development Server

```bash
# Start Hugo development server (port 1313)
bun run dev

# Expected output:
# ▶ Starting hugo-dev process
# ✔ Successfully started

# In another terminal, monitor logs:
bun run dev:logs
```

### Verify Server is Running

```bash
# In another terminal
curl http://localhost:1313

# You should see the HTML of the homepage
```

Open browser: **http://localhost:1313**

You should see your site homepage. The server auto-reloads on file changes.

---

## Project Structure Tour

```
pwarnock.github.io/
├── config/                          # Hugo configuration
│   ├── development/hugo.toml        # Dev-specific config
│   ├── staging/hugo.toml            # Staging config
│   └── production/hugo.toml         # Production config
├── content/                         # Site content
│   ├── blog/                        # Blog posts
│   │   ├── my-first-post.md
│   │   └── _index.md
│   ├── portfolio/                   # Portfolio projects
│   ├── about/                       # About page
│   └── _index.md                    # Homepage
├── layouts/                         # Hugo templates
│   ├── _default/
│   │   ├── baseof.html              # Base template
│   │   ├── single.html              # Single page template
│   │   └── list.html                # List/index template
│   └── partials/                    # Reusable components
├── static/                          # Static files (CSS, images, etc.)
├── assets/                          # Source assets (SCSS, uncompiled)
├── data/                            # Hugo data files
├── docs/                            # Documentation
│   ├── README.md                    # Documentation index
│   ├── development/                 # Development guides
│   ├── operations/                  # Operational guides
│   └── tutorials/                   # Tutorials (this file)
├── scripts/                         # Build and deploy scripts
│   ├── build/                       # Build-related scripts
│   ├── deploy/                      # Deployment scripts
│   ├── test/                        # Test scripts
│   └── dev/                         # Development utilities
├── src/                             # TypeScript source code
│   ├── utils/                       # Utility functions
│   └── *.test.ts                    # Unit tests
├── test/                            # Test infrastructure
│   ├── support/                     # Go test utilities
│   ├── features/                    # BDD feature files
│   ├── step_definitions/            # BDD step implementations
│   └── deployment_*.sh              # Integration tests
├── tests/                           # Playwright E2E tests
│   ├── e2e/                         # End-to-end tests
│   ├── visual/                      # Visual regression tests
│   └── performance/                 # Performance tests
├── package.json                     # Dependencies and scripts
├── hugo.toml                        # Main Hugo config
├── playwright.config.ts             # E2E test config
├── vitest.config.ts                 # Unit test config
└── AGENTS.md                        # Development workflow guide
```

### Key Directories for Development

- **`content/`** - Edit content here (markdown files)
- **`layouts/`** - Edit templates and components
- **`src/`** - TypeScript utilities and components
- **`static/`** - CSS, images, fonts
- **`docs/`** - Documentation
- **`scripts/`** - Build/deploy automation

---

## Common Development Workflows

### Adding a Blog Post

```bash
# 1. Create a new blog post file
touch content/blog/my-new-post.md

# 2. Add frontmatter and content
cat << 'EOF' > content/blog/my-new-post.md
---
title: "My New Post"
date: 2025-01-15
summary: "Brief summary for listing page"
draft: false
tags: ["tag1", "tag2"]
---

# My New Post

Post content goes here...
EOF

# 3. View in browser
# Navigate to http://localhost:1313/blog/my-new-post/
# You should see the post immediately (auto-reload)

# 4. Validate frontmatter
bun run validate:portfolio

# 5. When ready, add to git
git add content/blog/my-new-post.md
git commit -m "feat: add blog post about my topic"
```

### Making Template Changes

```bash
# 1. Edit a template file
# Example: layouts/_default/single.html

# 2. Changes auto-reload in browser
# Refresh http://localhost:1313/blog/any-post/ to see changes

# 3. Visual regression test
bun run test:visual

# 4. Review visual diffs
# Look for unintended changes

# 5. Update baselines if intentional
bunx playwright test --grep @visual --update-snapshots

# 6. Commit changes
git add layouts/
git commit -m "feat: update single post template styling"
```

### Updating Styles

```bash
# 1. Edit Tailwind/CSS
# Edit: assets/css/main.css or component files

# 2. Hugo auto-compiles CSS
# Check static/css/main.css is updated

# 3. Verify in browser
# http://localhost:1313 (auto-reload)

# 4. Test styling
bun run test:visual

# 5. Commit
git add assets/ static/css/
git commit -m "feat: update homepage styling"
```

### Running Tests Locally

```bash
# Unit tests
bun run test:unit

# Integration tests (deployment validation)
bun run test:deployment

# E2E tests (requires built site)
bun run build:preview
bunx playwright test

# Visual regression tests
bun run test:visual

# All tests (comprehensive)
bun run test:unit && bun run test:deployment && bunx playwright test

# Watch mode (auto-rerun on changes)
bun run test:unit:watch
bun run test:e2e:watch
bun run test:visual:watch
```

---

## Environment Variables

### Development Environment

No special `.env` file needed for local development.

Optional configurations:

```bash
# Create .env (not committed to git)
touch .env

# Optional variables:
HUGO_ENV=development        # Already set by dev script
LOCAL_DEV_PORT=1313         # Default, can override
ANALYTICS_ENABLED=false     # Disable tracking locally
```

### Configuration Files

Development-specific config is in `config/development/hugo.toml`:

- `baseURL = "http://localhost:1313"`
- Analytics disabled
- All features enabled for testing

---

## Pre-commit Hooks

The project uses Husky to run quality checks before each commit.

### What Gets Checked

When you run `git commit`, these validations run automatically:

1. **Linting** - Code style checks
   - YAML validation (GitHub Actions workflows)
   - CSS linting (Stylelint)
   - Markdown linting (markdownlint-cli)

2. **Security** - Secret detection
   - Gitleaks scans for exposed credentials
   - Hardcoded password detection

3. **Blog Validation** - Frontmatter checks
   - Required fields present
   - Date format correct
   - No draft posts accidentally published

### If Validation Fails

```bash
# If pre-commit checks fail
git commit -m "my changes"

# Error output will show what failed
# Fix the issue and try again
# Example: Fix CSS linting errors
bun run lint:css --fix

# Retry commit
git commit -m "my changes"
```

### Bypass Hooks (Only When Necessary)

```bash
# Skip pre-commit checks (NOT RECOMMENDED)
git commit --no-verify -m "my changes"

# Better: Fix the issues
bun run format       # Auto-fix formatting
bun run lint:css     # Show CSS issues
# Then commit normally
```

---

## Git Workflow

### Working with Branches

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# Work on feature
# Edit files
# Run tests
# Commit when ready

git add .
git commit -m "feat: add my feature"

# Push feature branch
git push origin feature/my-feature

# Create pull request on GitHub
# - Request review from team
# - GitHub runs automated tests
# - Get approval before merging

# After approval, merge to main
# (On GitHub, click "Merge pull request")

# Update local main
git checkout main
git pull origin main
```

### Commit Message Format

Follow conventional commits for automatic version bumping:

```bash
# New feature (minor version bump)
git commit -m "feat: add dark mode toggle"

# Bug fix (patch version bump)
git commit -m "fix: correct blog post title rendering"

# Documentation (no version bump)
git commit -m "docs: update README with setup instructions"

# Refactoring (patch if fixing bugs, no bump otherwise)
git commit -m "refactor: simplify navigation component"

# Chore (maintenance, no version bump)
git commit -m "chore: update dependencies"

# With detailed description
git commit -m "feat: add dark mode toggle

- Add theme toggle button to header
- Persist preference in localStorage
- Update color variables for dark mode
- Add tests for theme switching"
```

---

## Troubleshooting

### Hugo Server Won't Start

```bash
# Issue: "Port 1313 already in use"
# Solution: Kill existing process or use different port

# Kill Hugo process
bun run dev:delete

# Or use different port
hugo server --port 1314 --bind 0.0.0.0

# Verify Hugo is working
hugo version
hugo config
```

### Dependencies Won't Install

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install

# If still failing, check Bun installation
bun upgrade
bun install
```

### Tests Failing

```bash
# Run test with verbose output
bun run test:unit -- --reporter=verbose

# Run specific test file
bun run test:unit src/utils/validators.test.ts

# Debug test in browser
bun run test:unit -- --ui
```

### CSS Not Updating

```bash
# Hugo CSS compilation issue
# Delete compiled CSS and rebuild
rm static/css/main.css
bun run dev

# Wait for Hugo to recompile
# Should see output: "Generated 1 content file"
```

### Blog Post Not Appearing

```bash
# Check if frontmatter is valid
# The file must have proper YAML frontmatter:
# ---
# title: "My Post"
# date: 2025-01-15
# draft: false
# ---

# Check for typos in filename/path
# Should be: content/blog/my-post.md
# Not: content/blogs/my-post.md

# Run validation
bun run validate:portfolio

# Check Hugo logs for errors
bun run dev:logs
```

### Port Already in Use

```bash
# Find what's using port 1313
lsof -i :1313

# Kill the process
kill -9 <PID>

# Or use a different port
hugo server --port 1314
```

---

## Performance Tips

### Speed Up Development

```bash
# Rebuild only changed content (faster)
hugo server -D

# Disable minification in dev (faster builds)
# Already disabled in development/hugo.toml

# Skip image processing
# Comment out image processing in config if not needed

# Use Bun watch mode for TypeScript
bun run test:unit:watch
```

### Monitor Performance

```bash
# Check build time
time hugo

# Analyze bundle size
bun run perf:analyze

# Watch test performance
bun run test:perf:watch
```

---

## Next Steps

After setting up:

1. **Read** [AGENTS.md](/AGENTS.md) - Development workflow
2. **Read**
   [docs/development/STYLE_GUIDE.md](/docs/development/STYLE_GUIDE.md) - Code
   conventions
3. **Add** your first blog post or content change
4. **Run** `bun run test:unit` to verify setup
5. **Review** [docs/operations/](/docs/operations/) for deployment info

---

## See Also

- [AGENTS.md](/AGENTS.md) - Development workflow and guidelines
- [docs/development/STYLE_GUIDE.md](/docs/development/STYLE_GUIDE.md) - Code
  style and conventions
- [docs/development/TESTING_ARCHITECTURE.md](/docs/development/TESTING_ARCHITECTURE.md) -
  Testing guide
- [docs/operations/DEPLOYMENT_NOTES.md](/docs/operations/DEPLOYMENT_NOTES.md) -
  Deployment procedures
- [README.md](/docs/README.md) - Full documentation index
