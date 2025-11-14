# Gemini Added Memories

## Project Overview

This project is Peter Warnock's personal portfolio and blog, built as a modern, fast static website. It leverages the Hugo static site generator for content management and performance, coupled with a robust frontend stack for design and interactivity. The project emphasizes a unified design system, responsive design, fast performance, and accessibility. It also integrates with the "Cody Framework" for structured development workflow management.

**Key Technologies:**

*   **Static Site Generator:** Hugo Extended
*   **Frontend Framework:** Tailwind CSS with DaisyUI components
*   **Asset Processing:** PostCSS
*   **Package Manager:** Bun (with npm fallback)
*   **Development Server:** PM2
*   **Linting:** ESLint (JavaScript), Stylelint (CSS), YAML-lint, Taplo (TOML)
*   **Testing:** Playwright (End-to-End), HTMLProofer (HTML validation), `npm audit` (security)
*   **JavaScript:** Alpine.js (for interactivity)
*   **Version Control:** Git, Husky (pre-commit hooks)

**Architecture:**

The project follows a typical static site architecture:

*   **Content:** Markdown files (`content/`) processed by Hugo.
*   **Layouts:** Hugo templates (`layouts/`) define the structure and presentation.
*   **Assets:** Source assets (SCSS, unprocessed images) in `assets/` are processed by PostCSS and Tailwind CSS into `static/css/main.css`. Static assets like images and favicons are in `static/`.
*   **Data:** Configuration and dynamic data are stored in TOML/YAML files (`data/`).
*   **Scripts:** Utility scripts for various development and validation tasks are located in `scripts/`.
*   **Build Output:** The final static site is generated into the `public/` directory.

## Building and Running

### Prerequisites

*   **Hugo Extended** v0.152.2 or later
*   **Node.js** LTS@latest (for npm/bun scripts)
*   **Git**

### Installation

1.  **Install Hugo Extended:**
    *   `brew install hugo` (macOS)
    *   Refer to `README.md` for Linux/Windows installation instructions.
    *   Verify with `hugo version` (should show "extended").
2.  **Install Node Dependencies:**
    *   `bun install` (recommended) or `npm install`

### Development

*   **Start Development Server (recommended with PM2):**
    ```bash
    bun run dev
    # or npm run dev
    ```
    The site will be available at `http://localhost:1313`.
*   **Start Development Server (legacy/direct Hugo):**
    ```bash
    bun run dev:legacy
    # or npm run dev:legacy
    ```
*   **PM2 Management Commands:**
    *   `bun run dev:status`
    *   `bun run dev:logs`
    *   `bun run dev:restart`
    *   `bun run dev:stop`
    *   `bun run dev:monitor`
*   **CSS Development:**
    *   Build CSS once: `bun run css:build`
    *   Watch CSS for changes: `bun run css:watch`

### Build & Deployment

*   **Build for Production:**
    ```bash
    bun run build
    # or npm run build
    ```
    This command builds the optimized site.
*   **Build with CSS processing (explicit):**
    ```bash
    bun run build:production
    # or npm run build:production
    ```
    The built site is located in the `public/` directory.

### Testing & Validation

*   **Run all validation checks:**
    ```bash
    bun run validate
    # or npm run validate
    ```
    This script performs site build, linting, content validation, URL checks, HTML validation, basic SEO checks, and a security audit.
*   **Linting:**
    *   `bun run lint` (all linters)
    *   `bun run lint:yaml`
    *   `bun run lint:toml`
    *   `bun run lint:css`
*   **End-to-End Tests (Playwright):**
    ```bash
    bun run test:e2e
    # or npm run test:e2e
    ```
*   **Format code:**
    *   `bun run format`
    *   `bun run format:check`

## Development Conventions

*   **Code Style:** Enforced by ESLint, Stylelint, Prettier, YAML-lint, and Taplo. Pre-commit hooks (`husky`) are used to ensure code quality before commits.
*   **Content Structure:**
    *   Blog posts: `content/blog/posts/post-name/index.md`
    *   Portfolio projects: `content/portfolio/project-name/index.md`
    *   Tools: `content/tools/tool-name/index.md`
    *   Front matter is used for metadata in Markdown files.
*   **Design System:** A unified design system is implemented using CSS variables for colors, typography, spacing, etc., defined in `assets/css/main.css`. Tailwind CSS and DaisyUI are used for styling.
*   **Accessibility:** Strong emphasis on WCAG compliance, semantic HTML, ARIA labels, enhanced focus indicators, and reduced motion preferences.
*   **SEO:** Meta tags, Open Graph, Twitter cards, and Schema.org structured data are extensively used and configured in `layouts/_default/baseof.html` and `hugo.toml`.
*   **Scripts:** Utility scripts are located in the `scripts/` directory and are often invoked via `bun run` or `npm run` commands.
*   **Cody Framework:** The project adheres to the "Cody Framework" for development workflow, including version planning, issue tracking (with `beads`), and a structured release process.
