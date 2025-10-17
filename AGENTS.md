# Agent Guidelines for pwarnock.github.io

## Build Commands
- **Install dependencies**: `npm install` (installs Node.js dependencies for TailwindCSS and DaisyUI)
- **Development server**: `hugo server -D` (includes drafts)
  - Note: Do not start the dev server in interactive mode as it will hang the agent session. Use build commands for comparisons instead.
- **Production build**: `hugo --minify`
- **Clean build**: `rm -rf public && hugo -d public --minify`

## Code Style Guidelines

### General
- Avoid hardcoding values; use theme variables, data files, or configuration options instead
- Prefer reusable, configurable components over layout-specific overrides

### Hugo Templates
- Use Go template syntax with proper context scoping (`$.Site` vs `.Site`)
- Prefer semantic HTML in templates
- Use Hugo's built-in functions for date formatting: `{{ .Date.Format "2006-01-02" }}`
- **Render Hooks**: Custom link rendering is implemented in `layouts/_default/_markup/render-link.html` for automatic external link handling with per-link override capability

### Content Front Matter
- Use TOML format for front matter (preferred)
- Required fields: `title`, `date`, `draft`
- Use lowercase, hyphen-separated filenames
- Include `description` for SEO

### Python Scripts
- Follow PEP 8 naming conventions
- Use descriptive variable names
- Include docstrings for functions
- Handle errors gracefully with try/except blocks

### File Organization
- Content in `content/posts/` as page bundles (folders with index.md)
- Static assets in `static/` directory
- Data files in TOML format in `data/` directory

### Git Workflow
- **Never commit directly to main branch** - Always create feature branches for changes
- Use conventional commit messages (e.g., `feat: add dark mode toggle`, `fix: resolve mobile layout issue`)
- Keep drafts as `draft: true` until ready
- Test builds locally before pushing
- Pre-commit hooks run YAML lint, TOML lint, CSS lint, and build to catch errors early
- **Branch tracking with Beads**: Create a Bead issue for each feature branch. Use branch naming convention: `feature/{bead-id}-{description}` (e.g., `feature/pwarnock.github.io-52-tailwind-purging`)

### Branch Management with Beads
- Every feature branch must have a corresponding Bead issue
- Branch names follow pattern: `feature/{bead-id}-{kebab-case-description}`
- When creating a branch, reference the Bead ID in commit messages
- Close Bead issues only after branch is merged to main
- Use Beads to track branch status: `open` (branch created), `in-progress` (actively working), `completed` (merged)

### Testing and Validation
- **Build validation**: Run `hugo --minify` to ensure the site builds without errors
- **Link rendering test**: Create test content with various link types to verify render hook functionality:
  - External links (should auto-get target="_blank" and rel="nofollow")
  - Internal links (should remain unchanged)
  - Links with comment codes (<!--nt-->, <!--ot-->, <!--nf-->, <!--f-->)
- **CI checks**: Push changes to trigger GitHub Actions CI, which includes:
  - HTML link validation (htmltest)
  - SEO validation
  - Accessibility testing (Lighthouse)
  - Performance testing
- **Local accessibility check**: Use browser dev tools or Lighthouse extension to audit pages

### Work Tracking
We track work in Beads instead of Markdown. Run `bd quickstart` to see how.

### Development Workflow
- **Plan First**: Before implementing any feature, create a detailed plan and get user approval.
- **Incremental Changes**: Implement one feature at a time, committing after each.
- **Show Implementation**: After building, demonstrate how features are implemented.

### Agent Interaction Guidelines
- **Interactive Conversations**: When users ask questions or provide instructions, engage in back-and-forth dialogue rather than immediately executing tasks. Ask clarifying questions, confirm understanding, and explain reasoning before proceeding with implementation.
- **Proactive Communication**: Don't just "do" tasks silently - explain what you're about to do, why you're doing it, and ask if the user agrees with the approach.
- **User Confirmation**: For significant changes or when multiple approaches are possible, present options and get user approval before implementing.
- **Progress Updates**: Provide regular updates during complex tasks, and pause for feedback at logical checkpoints.
- **Question-Driven Workflow**: Treat conversations as collaborative problem-solving sessions rather than one-way command execution.

### Theme Customization
- Theme switching is implemented with DaisyUI themes (light, dark, retro, cyberpunk, halloween).
- Use the palette button in the navbar to cycle themes.
- Themes are configured in `tailwind.config.js` and color variables are mapped in `static/css/custom.css`.
- Font overrides use theme fonts (Poppins for headings, Roboto for body), loaded in `layouts/partials/head.html`.
- Treat themes as external dependencies. Do not modify files in `themes/` directly. Instead, use Hugo's layout overrides by placing modified versions in the site's `layouts/` directory with the same relative path (e.g., override `themes/theme-name/layouts/partials/example.html` by creating `layouts/partials/example.html`).
- Theme defaults: Halloween theme in October, dark theme if system prefers dark mode, random theme otherwise (when no localStorage value exists).

### Social Media Configuration
- Social links are configured in `data/footer.toml` under the `[[social]]` sections
- Supported platforms include: LinkedIn, GitHub, X (Twitter), Discord, Facebook, Instagram, YouTube, Telegram, WhatsApp, and more
- To add Discord: Create a `[[social]]` entry with `type = "discord"` and `id = "YOUR_DISCORD_USERNAME_OR_INVITE_CODE"`
- Custom social templates can be overridden by creating `layouts/partials/footer/socials.html`

### Submodule Workflow

When making changes to a submodule (like `themes/hugo-porto`), follow these critical steps to ensure changes are correctly tracked and deployed:

1.  **Navigate into the Submodule**: Change directory into the submodule (e.g., `cd themes/hugo-porto`).
2.  **Make and Commit Changes**: Implement your desired changes and commit them *within the submodule*. Use clear, descriptive commit messages (e.g., `git commit -am "feat: descriptive commit message"`).
3.  **Push Submodule Changes**: Push the submodule's changes to its *own remote repository* (e.g., `git push origin main` or to the appropriate branch). This makes the new commit accessible to CI/CD pipelines.
4.  **Return to Parent Repository**: Navigate back to the main project's root directory (`cd ../..`).
5.  **Commit Updated Submodule Reference**: The main repository will now detect that the submodule's reference has changed. Commit this updated reference in the parent repository (e.g., `git commit -am "chore: update hugo-porto submodule"`).
6.  **Push Parent Repository**: Push the main repository's changes to its remote (`git push`).

**Important**: Failure to push submodule changes to their own remote repository (Step 3) will result in CI/CD failures, as the pipeline will be unable to fetch the new submodule commit.