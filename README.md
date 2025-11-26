# Pete Warnock - Personal Portfolio & Blog

A modern, fast portfolio website and blog built with Hugo static site generator,
featuring a unified design system and responsive design.

**New to the project?** Start with
[docs/tutorials/GETTING_STARTED.md](/docs/tutorials/GETTING_STARTED.md)  
**Full documentation index:** [docs/README.md](/docs/README.md)  
**Development workflow:** [AGENTS.md](/AGENTS.md)

## 🚀 Features

- **Modern Design System**: Unified components with consistent styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS and DaisyUI
- **Fast Performance**: Hugo static site generation with optimized assets
- **Accessibility**: WCAG compliant with semantic HTML and ARIA labels
- **Dark/Light Themes**: Multiple theme options with theme selector
- **Content Management**: Blog posts, portfolio projects, and tools showcase

## 📋 Quick Start

### Prerequisites

- **Hugo Extended** v0.120 or later
- **Bun** latest (primary package manager and runtime)
- **Git** (for version control)
- **Go** ≥1.21 (for test utilities)

### Installation

```bash
# Clone repository
git clone https://github.com/pwarnock/pwarnock.github.io.git
cd pwarnock.github.io

# Install dependencies
bun install

# Start development server
bun run dev

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

```
├── config/              # Hugo environment configs (dev, staging, production)
├── content/             # Site content (Markdown)
│   ├── blog/           # Blog posts
│   └── portfolio/      # Portfolio projects
├── layouts/            # Hugo templates
├── static/             # Static files (CSS, images)
├── src/                # TypeScript utilities
├── test/               # Test infrastructure
├── tests/              # E2E and visual tests
├── scripts/            # Build and deployment scripts
├── docs/               # Project documentation
├── package.json        # Dependencies
└── hugo.toml           # Hugo configuration
```

## 🔧 Configuration

- **Site Config**: `hugo.toml`
- **Environment Configs**: `config/{development,staging,production}/hugo.toml`
- **CSS Framework**: Tailwind CSS with DaisyUI components
- **Build Tools**: PostCSS, Hugo Pipes
- **Development**: PM2 process manager

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
