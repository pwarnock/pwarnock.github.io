# Pete Warnock - Personal Portfolio & Blog

A modern, fast portfolio website and blog built with Hugo static site generator,
featuring a unified design system and responsive design.

## 🚀 Features

- **Modern Design System**: Unified components with consistent styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS and DaisyUI
- **Fast Performance**: Hugo static site generation with optimized assets
- **Accessibility**: WCAG compliant with semantic HTML and ARIA labels
- **Dark/Light Themes**: Multiple theme options with theme selector
- **Content Management**: Blog posts, portfolio projects, and tools showcase

## 📋 Prerequisites

- **Hugo Extended** v0.152.2 or later (required for Sass/SCSS support)
- **Bun** latest (primary package manager and runtime)
- **Git** (for version control)

## 🛠️ Installation

### 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Hugo Extended

**macOS (Homebrew):**

```bash
brew install hugo
```

**Linux:**

```bash
# Download latest Hugo Extended
curl -L https://github.com/gohugoio/hugo/releases/latest/download/hugo_extended_0.152.2_linux-amd64.tar.gz | tar -xz
sudo mv hugo /usr/local/bin/hugo
```

**Windows:**

```powershell
# Download from https://github.com/gohugoio/hugo/releases/latest
# Extract and add to PATH
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Development Server

```bash
bun run dev
```

Invoke-WebRequest -Uri
"https://github.com/gohugoio/hugo/releases/latest/download/hugo_extended_0.152.2_windows-amd64.zip"
-OutFile "hugo.zip" Expand-Archive -Path "hugo.zip" -DestinationPath "."

# The hugo.exe binary will be ignored by .gitignore

````

**Verify installation:**

```bash
hugo version
# Should show v0.152.2 or later with "extended" in the output
````

### 2. Install Dependencies

```bash
bun install
```

## 🚦 Development

### Start Development Server

```bash
# Using PM2 (recommended for persistent development)
bun run dev

# Or using direct Hugo command
bun run dev:legacy
```

The site will be available at `http://localhost:1313`

### Development Commands

```bash
# View PM2 status
npm run dev:status

# View development logs
npm run dev:logs

# Restart development server
npm run dev:restart

# Stop development server
npm run dev:stop

# Monitor PM2 processes
npm run dev:monitor
```

## 🏗️ Build & Deployment

### Build for Production

```bash
# Build optimized site
bun run build

# Build with CSS processing
bun run build:production
```

### CSS Development

```bash
# Build CSS once
bun run css:build

# Watch CSS for changes
bun run css:watch
```

## 🧪 Testing & Validation

```bash
# Run all validation checks
bun run validate

# Lint configuration files
bun run lint

# Check CSS only
bun run lint:css

# Analyze bundle size
bun run analyze
```

## 📁 Project Structure

```
├── content/           # Site content (Markdown files)
│   ├── blog/         # Blog posts
│   ├── portfolio/    # Portfolio projects
│   └── tools/        # Tools showcase
├── layouts/          # Hugo templates
│   ├── _default/     # Base templates
│   ├── partials/      # Reusable components
│   └── shortcodes/    # Hugo shortcodes
├── static/           # Static assets (images, CSS, JS)
├── assets/           # Source assets (SCSS, unprocessed images)
├── data/            # Data files (YAML/JSON)
└── scripts/         # Utility scripts
```

## 🏗️ Development Framework

This project uses the
[Cody Framework](https://github.com/icodewith-ai/cody-framework) for
professional development workflow management:

- **Version Planning**: Structured feature development with discovery, planning,
  and implementation phases
- **Issue Tracking**: Integrated with beads (beads) for dependency-aware task
  management
- **Release Process**: Automated versioning, retrospectives, and release
  management
- **Documentation**: Living documentation that evolves with the codebase

**Credits**: Special thanks to **Marcelo** of
[Red Pill Blue Pill Studios, LLC](https://github.com/icodewith-ai) for creating
and maintaining the Cody Framework. Contact: marcelo@redpillbluepillstudios.com

## 🎨 Design System

This project uses a unified design system with:

- **Components**: Reusable Button, Badge, Icon, and Card components
- **Design Tokens**: CSS custom properties for consistent theming
- **Responsive Grid**: Mobile-first responsive design patterns
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

### Component Usage

```hugo
{{/* Button component */}}
{{ partial "components/button.html" (dict
  "href" "/about"
  "variant" "primary"
  "size" "md"
  "text" "Learn More"
) }}

{{/* Icon component */}}
{{ partial "components/icon.html" (dict
  "name" "github"
  "size" "sm"
) }}
```

## 📝 Content Management

### Adding Blog Posts

1. Create new file in `content/blog/posts/post-name/index.md`
2. Add front matter with title, date, and metadata
3. Write content in Markdown

### Adding Portfolio Projects

1. Create new directory in `content/portfolio/project-name/`
2. Add `index.md` with project details
3. Include images in the same directory

### Adding Tools

1. Create new directory in `content/tools/tool-name/`
2. Add `index.md` with tool information
3. Follow existing tool structure

## 🌐 Deployment

### GitHub Pages (Current)

The site is automatically deployed via GitHub Actions when pushing to `main`
branch.

### Manual Deployment

```bash
# Build site
npm run build

# Deploy to your hosting provider
# The built site is in the `public/` directory
```

## 🔧 Configuration

- **Site Config**: `hugo.toml`
- **CSS Framework**: Tailwind CSS with DaisyUI components
- **Build Tools**: PostCSS, Hugo Pipes
- **Development**: PM2 process manager

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation: `npm run validate`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 📞 Contact

- **GitHub**: [@pwarnock](https://github.com/pwarnock)
- **LinkedIn**:
  [linkedin.com/in/peterwarnock](https://linkedin.com/in/peterwarnock)
- **Email**: github@peterwarnock.com

---

Built with ❤️ using [Hugo](https://gohugo.io/),
[Tailwind CSS](https://tailwindcss.com/), and
[Cody Framework](https://github.com/icodewith-ai/cody-framework)

# Test change for guardrail
