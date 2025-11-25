# Project Context: pwarnock.github.io

## Overview
This is the personal portfolio and blog website for Peter Warnock. It is a static site built with **Hugo** and styled using **TailwindCSS** and **DaisyUI**. The project uses **Bun** as the primary JavaScript runtime and package manager. It features a sophisticated testing and deployment pipeline with automated QA modes.

## Tech Stack
*   **Static Site Generator:** Hugo (Extended)
*   **Runtime/Package Manager:** Bun
*   **Styling:** TailwindCSS, DaisyUI, PostCSS
*   **Scripting:** TypeScript (in `src/`), Shell scripts (in `scripts/`)
*   **Testing:** Playwright (E2E/Visual), Vitest (Unit), Go (BDD)
*   **Process Management:** PM2 (for dev server)

## Key Commands

### Setup
```bash
bun install
```

### Development
*   **Start Dev Server:** `bun run dev` (Uses PM2 to manage Hugo and Tailwind watchers)
*   **View Logs:** `bun run dev:logs`
*   **Stop Dev Server:** `bun run dev:stop`
*   **Legacy Dev Server:** `bun run dev:legacy` (Runs standard `hugo server`)

### Building
*   **Production Build:** `bun run build`
*   **Preview Build:** `bun run build:preview`

### Testing & QA
The project uses a "QA Mode" system to optimize testing based on changes:
*   **Auto QA (Recommended):** `bun run qa:auto` (Automatically selects content vs. full QA)
*   **Content QA:** `bun run qa:content` (Fast path for markdown/image changes only)
*   **Full QA:** `bun run qa:full` (Full suite: build, SEO, accessibility, E2E, visual)
*   **Unit Tests:** `bun run test:unit`
*   **E2E Tests:** `bun run test:e2e`
*   **Validation:** `bun run validate` (Runs a standard validation script)

### Linting & Formatting
*   **Lint:** `bun run lint` (YAML, TOML, CSS)
*   **Format:** `bun run format` (Prettier)

## Project Structure
*   `assets/`: Assets processed by Hugo pipes (CSS, JS).
*   `config/`: Environment-specific configuration (`development`, `staging`, `production`).
*   `content/`: Site content in Markdown (`blog/`, `portfolio/`, etc.).
*   `docs/`: Comprehensive project documentation.
*   `layouts/`: Hugo HTML templates.
*   `public/`: Output directory for the built site.
*   `scripts/`: Shell and Node.js scripts for build, test, and maintenance tasks.
*   `src/`: TypeScript source code for utilities and tools.
*   `static/`: Static assets copied directly to build (images, icons).
*   `test/` & `tests/`: Testing infrastructure and test files.

## Development Conventions
*   **Package Manager:** Always use `bun` instead of `npm` or `yarn`.
*   **Styles:** Use TailwindCSS utility classes. Avoid custom CSS unless necessary.
*   **Content:** New content goes in `content/`. Follow existing frontmatter patterns.
*   **Testing:** Always run `bun run qa:auto` before pushing changes.
*   **Documentation:** Keep documentation in `docs/` updated when changing processes.

## Important Files
*   `hugo.toml`: Main site configuration.
*   `package.json`: Dependencies and scripts.
*   `tailwind.config.js`: Tailwind configuration.
*   `CONTRIBUTING.md`: Detailed contribution guidelines.
*   `AGENTS.md`: Workflow guide for AI agents.
