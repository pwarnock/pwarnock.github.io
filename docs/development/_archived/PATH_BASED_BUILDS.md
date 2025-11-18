# Path-Based Build Control

## Overview

Path-based build control automatically detects the type of changes and applies
the appropriate build strategy, optimizing for speed and safety.

## Build Types

### 📝 Content Build (Fast)

**Triggered by:** Changes to `content/`, `static/`, `assets/`, `data/`

**Strategy:**

- Quick Hugo build with minimal validation
- Content-specific tests (portfolio validation, link checking)
- Fast feedback for content updates
- **Automatic deployment** for main branch

**Use Case:** Blog posts, portfolio updates, tool additions

### 🔧 Infrastructure Build (Comprehensive)

**Triggered by:** Changes to `.github/`, `scripts/`, `test/`, `layouts/`,
`config/`, etc.

**Strategy:**

- Full Hugo build with comprehensive testing
- Unit tests, E2E tests, linting, security audit
- Performance analysis
- **No automatic deployment** (manual promotion required)

**Use Case:** Template changes, CI/CD updates, dependency changes

### 📚 Documentation Build (Validation)

**Triggered by:** Changes to `docs/`, markdown files

**Strategy:**

- Documentation validation only
- Markdown syntax checking
- Build verification to ensure no breaking changes
- **No deployment** required

**Use Case:** Documentation updates, README changes

## Local Development

### Automatic Detection

```bash
# Automatically detects changes and runs appropriate build
bun run build:path
```

### Force Build Types

```bash
# Force infrastructure build regardless of changes
bun run build:infra

# Force content build
bun run build:content
```

## CI/CD Pipeline

### GitHub Actions Workflow

- **File:** `.github/workflows/path-based-builds.yml`
- **Triggers:** Push to main/develop, PRs to main
- **Jobs:** Change detection → Type-specific build → Deployment (if applicable)

### Change Detection Logic

```yaml
content:
  - 'content/**'
  - 'static/**'
  - 'assets/**'
  - 'data/**'

infrastructure:
  - '.github/**'
  - 'scripts/**'
  - 'test/**'
  - 'tests/**'
  - 'package*.json'
  - 'go.mod'
  - 'go.sum'
  - 'hugo.toml'
  - 'config/**'
  - 'layouts/**'
  - 'archetypes/**'

docs:
  - 'docs/**'
  - '*.md'
```

## Deployment Strategy

### Content Changes

- ✅ **Automatic deployment** to production
- Fast feedback loop
- Safe for content updates

### Infrastructure Changes

- ⚠️ **Manual deployment only**
- Requires human review
- Prevents accidental breaking changes

### Documentation Changes

- 📚 **No deployment** needed
- Validation only

## Benefits

### 🚀 Speed

- **Content builds:** ~30 seconds vs 5+ minutes
- **Infrastructure builds:** Comprehensive but only when needed
- **Documentation builds:** Minimal validation

### 🔒 Safety

- **Infrastructure protection:** No auto-deployment of risky changes
- **Content safety:** Fast but validated deployments
- **Change isolation:** Clear separation of concerns

### 📊 Visibility

- **Build type detection:** Clear indication of what changed
- **Deployment recommendations:** Guidance on next steps
- **Comprehensive logging:** Full audit trail

## Examples

### Scenario 1: Blog Post Update

```bash
# Edit content/blog/posts/new-article.md
git add . && git commit -m "Add new blog post"
bun run build:path
# Output: 📝 Content build triggered
# Result: Fast build + ready for deployment
```

### Scenario 2: Template Update

```bash
# Edit layouts/partials/header.html
git add . && git commit -m "Update header navigation"
bun run build:path
# Output: 🔧 Infrastructure build triggered
# Result: Comprehensive testing + manual deployment required
```

### Scenario 3: Documentation Update

```bash
# Edit docs/development/STYLE_GUIDE.md
git add . && git commit -m "Update style guide"
bun run build:path
# Output: 📚 Documentation build triggered
# Result: Validation only
```

## Troubleshooting

### Unknown Change Type

If changes don't fit predefined categories:

- Falls back to **infrastructure build**
- Comprehensive testing applied
- Manual deployment required

### Mixed Changes

When multiple types of changes are detected:

- **Infrastructure takes priority**
- Most conservative approach
- Ensures safety

### Force Override

Use force flags when automatic detection is incorrect:

```bash
bun run build:infra  # Force infrastructure build
bun run build:content # Force content build
```

## Configuration

### Custom Path Patterns

Edit `.github/workflows/path-based-builds.yml` to adjust detection patterns:

```yaml
content:
  - 'content/**'
  - 'static/**'
  # Add your custom paths
```

### Build Scripts

Local script: `scripts/path-based-build.sh` CI/CD workflow:
`.github/workflows/path-based-builds.yml`

Both use the same detection logic for consistency.
