# Pete Warnock - Personal Portfolio & Blog

A modern, fast portfolio website and blog built with Hugo static site generator,
featuring a unified design system and responsive design.

**New to the project?** Start with
[docs/tutorials/GETTING_STARTED.md](/docs/tutorials/GETTING_STARTED.md)  
**Full documentation index:** [docs/README.md](/docs/README.md)  
**Development workflow:** [AGENTS.md](/AGENTS.md)  
**Documentation structure:**  
- [Development guides](/docs/development/) - Development patterns and workflows  
- [Operations guides](/docs/operations/) - Deployment and operational procedures  
- [Integration guides](/docs/integration/) - Tool integration workflows  
- [Strategy docs](/docs/strategy/) - Project strategy and planning  
- [Tutorials](/docs/tutorials/) - Getting started guides  
- [Release notes](/docs/releases/) - Version release history

## 🚀 Features

- **Modern Design System**: Unified components with consistent styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS and DaisyUI
- **Fast Performance**: Hugo static site generation with optimized assets
- **Accessibility**: WCAG compliant with semantic HTML and ARIA labels
- **Dark/Light Themes**: Multiple theme options with theme selector
- **Content Management**: Blog posts, portfolio projects, and tools showcase

## 📋 Quick Start

### Prerequisites

- **mise** (tool version manager - manages Hugo, Bun, Go, just)
  - Install: `curl https://mise.run | sh`
  - Tool versions are locked in `.mise.toml`
- **Git** (for version control)

All other tools (Hugo 0.154.5, Bun 1.3.6, Go 1.25, just 1.46.0) are managed by mise

### Installation

```bash
# Clone repository
git clone https://github.com/pwarnock/pwarnock.github.io.git
cd pwarnock.github.io

# Install mise and all tools (Hugo, Bun, Go, just)
mise install

# Install dependencies
bun install

# Start development server
just dev  # or: bun run dev

# Open browser to http://localhost:1313
```

See [docs/tutorials/GETTING_STARTED.md](/docs/tutorials/GETTING_STARTED.md) for
detailed setup instructions.

## 🛠️ Development

### Common Commands

```bash
# Start development server
bun run dev

# View dev logs
bun run dev:logs

# Run all tests
bun run test:unit
bun run test:deployment

# Build for production
bun run build

# Validate changes
bun run validate
```

See [AGENTS.md](/AGENTS.md) for comprehensive workflow guide.

## 📝 Adding Content

### Blog Posts

```bash
# Create new blog post
touch content/blog/my-new-post.md

# Add frontmatter and markdown content
# See docs/tutorials/ADDING_BLOG_POST.md for complete guide
```

### Portfolio Projects

```bash
# Create new project directory
mkdir -p content/portfolio/project-name

# Add project details in index.md
```

See [docs/tutorials/ADDING_BLOG_POST.md](/docs/tutorials/ADDING_BLOG_POST.md)
for detailed content creation workflow.

## 🧪 Testing & Validation

```bash
# Run all unit tests
bun run test:unit

# Run deployment validation tests
bun run test:deployment

# Run E2E tests
bunx playwright test

# Run visual regression tests
bun run test:visual

# Check everything
bun run validate
```

See
[docs/development/TESTING_ARCHITECTURE.md](/docs/development/TESTING_ARCHITECTURE.md)
for comprehensive testing guide.

## 🌐 Deployment

Automated deployment via GitHub Actions to staging and production branches.

**Staging**: `git push origin staging`  
**Production**: `git push origin production`

See [docs/operations/DEPLOYMENT.md](/docs/operations/DEPLOYMENT.md) for detailed
deployment procedures.

## 🚨 Emergency Procedures

If production is down:

1. Notify team immediately
2. Run rollback: See
   [docs/operations/ROLLBACK_PROCEDURES.md](/docs/operations/ROLLBACK_PROCEDURES.md)
3. Verify service restored
4. Post incident investigation issue

## 📚 Documentation

All project documentation lives in `/docs/`:

- **Getting Started**:
  [docs/tutorials/GETTING_STARTED.md](/docs/tutorials/GETTING_STARTED.md)
- **Adding Content**:
  [docs/tutorials/ADDING_BLOG_POST.md](/docs/tutorials/ADDING_BLOG_POST.md)
- **Full Index**: [docs/README.md](/docs/README.md)
- **Development**: [docs/development/](/docs/development/)
- **Operations**: [docs/operations/](/docs/operations/)

## 🏗️ Project Structure

This is a **bun workspaces monorepo** with tool versions managed by **mise**.

```
├── .mise.toml                    # Tool version locks (Hugo, Go, bun, just)
├── package.json                  # Root workspace configuration
├── justfile                      # Task orchestration (390-line command hub)
├── packages/
│   ├── site/                     # Hugo site + frontend
│   │   ├── hugo.toml            # Hugo configuration
│   │   ├── content/             # Site content (blog, portfolio)
│   │   ├── layouts/             # Hugo templates
│   │   ├── static/              # Static assets
│   │   ├── assets/              # Build-time assets (Tailwind)
│   │   └── package.json         # Site dependencies
│   ├── agents/                   # Content generation agents
│   │   ├── src/agents/          # Blog, portfolio, tech-radar agents
│   │   └── package.json         # @pwarnock/agents
│   ├── qa-tools/                 # QA infrastructure
│   │   ├── src/                 # QA automation, observability
│   │   └── package.json         # @pwarnock/qa-tools
│   └── tooling/                  # Build/deploy scripts
│       ├── scripts/             # 65 scripts in 7 categories
│       └── package.json         # @pwarnock/tooling
├── shared/                       # Shared utilities and types
│   ├── src/utils/               # Common utilities
│   ├── src/types/               # TypeScript types
│   └── package.json             # @pwarnock/shared
├── test/                         # Go test infrastructure (root level)
├── tests/                        # Playwright E2E tests (root level)
├── scripts/                      # Symlinks to packages/tooling/scripts/ (backward compat)
└── docs/                         # Project documentation
```

**Workspace Dependencies:**
- `packages/agents` → depends on `@pwarnock/shared`
- `packages/qa-tools` → depends on `@pwarnock/shared`
- `packages/site` → standalone (Hugo site)
- `shared` → no dependencies (utilities only)

## 🔧 Configuration

- **Tool Versions**: `.mise.toml` (Hugo 0.154.5, Bun 1.3.6, Go 1.25, just 1.46.0)
- **Site Config**: `packages/site/hugo.toml`
- **Environment Configs**: `packages/site/config/{development,staging,production}/hugo.toml`
- **CSS Framework**: Tailwind CSS with DaisyUI components (in `packages/site/`)
- **Build Tools**: PostCSS, Hugo Pipes
- **Development**: PM2 process manager
- **Workspace Config**: Root `package.json` with `workspaces: ["packages/*", "shared"]`

### Workspace-Specific Commands

```bash
# Run command in specific workspace
just test-workspace agents        # Test agents workspace
bun run --filter @pwarnock/site build  # Build site workspace

# Workspace dependencies
bun pm ls                        # List all workspaces
```

## 🤝 Contributing

1. Read [docs/tutorials/GETTING_STARTED.md](/docs/tutorials/GETTING_STARTED.md)
2. Create feature branch from `main`
3. Make changes following
   [docs/development/STYLE_GUIDE.md](/docs/development/STYLE_GUIDE.md)
4. Run tests: `bun run validate`
5. Submit pull request

See [CONTRIBUTING.md](/CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE)
file for details.

## 📞 Contact

- **GitHub**: [@pwarnock](https://github.com/pwarnock)
- **LinkedIn**:
  [linkedin.com/in/peterwarnock](https://linkedin.com/in/peterwarnock)
- **Email**: github@peterwarnock.com

---

Built with ❤️ using [Hugo](https://gohugo.io/),
[Tailwind CSS](https://tailwindcss.com/), and [Bun](https://bun.sh/)
