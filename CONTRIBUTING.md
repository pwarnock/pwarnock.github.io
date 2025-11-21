# Contributing to pwarnock.github.io

## QA Modes: How to Run the Right Tests for Your Change

Our repo has a **QA Modes** system that chooses the right level of checks based
on what you changed. The goal is to give you a _shortest safe path_ for content
edits while keeping strong guarantees for code and templates.

You have three main commands:

- `bun run qa:auto`
  - **Recommended default.**
  - Looks at your changed files (vs `origin/main`) and automatically picks:
    - **Content Fast-Path QA** for clearly content-only changes (Markdown,
      images, etc.)
    - **Full QA** for anything else (layouts, JS/TS, configs, data, tests).
  - The command prints:
    - How many files changed
    - Which mode it chose
    - A short reason (e.g. "All changes are content-eligible" or "Non-content
      paths changed").

- `bun run qa:content`
  - Forces **Content Fast-Path QA**, even if the diff is ambiguous.
  - Use this when you are confident your changes are _only_ in:
    - `content/**`
    - `static/img/**`, `static/images/**`
    - Static media files like `.jpg`, `.png`, `.webp`, `.svg`, `.pdf`
  - This mode runs:
    - A full site build via the content pipeline
    - SEO checks on core pages
    - Accessibility "smoke tests" on representative pages

- `bun run qa:full`
  - Forces **Full QA**.
  - Use this for:
    - Any layout, script, config, or data changes
    - Major feature work or refactors
    - Pre-release / high-risk changes
  - This mode runs the full suite:
    - Build, SEO, accessibility, end-to-end journeys, visual regression,
      performance, and Go BDD tests.

When in doubt, **use `qa:auto`**. It will err on the side of safety and route
you to Full QA whenever it's not clearly a content-only change. If you know
you're working on infra or code, go straight to `qa:full`.

## Development Setup

1. **Prerequisites**
   - Hugo Extended v0.152.2+
   - Bun (latest)
   - Git

2. **Installation**

   ```bash
   bun install
   ```

3. **Local Development**

   ```bash
   bun run dev
   ```

4. **Testing**

   ```bash
   # Run unit tests
   bun run test:unit

   # Run E2E tests
   bun run test:e2e

   # Run QA modes
   bun run qa:auto
   ```

## Code Style

- Follow the existing patterns in the codebase
- Use TypeScript for new code
- Run `bun run lint` before committing
- Format code with `bun run format`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run appropriate QA tests (`bun run qa:auto`)
4. Ensure all tests pass
5. Submit a pull request with a clear description

## Questions?

Check the [docs](./docs/) directory for more detailed information about the
codebase and development processes.
