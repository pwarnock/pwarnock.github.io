# Environment Configuration

## Version Management

### Version Display Strategy

The site displays version information in the footer using Hugo's best practices:

**Example:** `v0.10.0-spacing-scale (a1c39b2)`

The footer shows:

- Version from `hugo.toml` (`site.Params.version`)
- Git commit hash when available (`.GitInfo.AbbreviatedHash`)

The git commit hash provides visibility into what's deployed:

- Local dev builds show the current commit
- Production builds show the commit that was deployed
- Different commits = different versions = easy to track changes

### Automatic Version Bumping

Version is automatically extracted from the latest Cody version directory and
synced to `hugo.toml` before each build.

**Script:** `scripts/bump-version.sh`

**How it works:**

1. Finds latest version in `.cody/project/build/v*/`
2. Extracts version number (e.g., `v0.10.0-spacing-scale`)
3. Updates `hugo.toml` with the version

**Usage:**

Automatic (runs before build):

```bash
bun run build  # automatically bumps version first
```

Manual:

```bash
bash scripts/bump-version.sh
```

Example output:

```
✅ Version bumped to: 0.10.0-spacing-scale
   From: .cody/project/build/v0.10.0-spacing-scale
```

### Workflow

1. Complete work in a version branch (e.g., `v0.10.0-spacing-scale`)
2. Create `version.md` in `.cody/project/build/v{version}/`
3. Run `bun run build` - automatically syncs version to `hugo.toml`
4. Version displays in footer with git commit

No manual version management needed!

---

## baseURL Configuration

The site uses Hugo's `baseURL` to generate absolute URLs for:

- Internal links (for SEO crawlability)
- Open Graph meta tags (for social sharing)
- Canonical URLs (for SEO deduplication)
- JSON-LD structured data (for search engines)

### Why Absolute URLs Matter

Search engines prefer absolute URLs in:

- Canonical tags: `<link rel="canonical" href="https://domain.com/page">`
- OpenGraph: `<meta property="og:url" content="https://domain.com/page">`
- Sitemap.xml: `<loc>https://domain.com/page</loc>`
- JSON-LD: `"url": "https://domain.com/page"`

### Setup

Hugo uses **config merging** to combine main and environment-specific configs:

1. **Main config** (`hugo.toml`) - Contains all production settings, all params
2. **Environment override** (`config/development/hugo.toml`) - Only overrides
   dev-specific settings

**Main config (hugo.toml):**

```toml
baseURL = "https://peterwarnock.com/"

[params]
  # All production parameters (social links, newsletter, etc.)
  github = "https://github.com/pwarnock"
  linkedin = "https://www.linkedin.com/in/peterwarnock"
  newsletter_url = "https://gmail.us8.list-manage.com/..."
  googleAnalytics = "G-SKDDM2GBXN"
```

**Development override (config/development/hugo.toml):**

```toml
# Development overrides only
baseURL = "http://localhost:1313"

[params]
  googleAnalytics = ""  # Disable GA in development
  env = "development"
```

**Note:** All other params (github, linkedin, newsletter, etc.) are inherited
from the main config during development.

### Usage

#### Development (Local)

```bash
bun run dev
# Runs: hugo server --config config/development/hugo.toml,hugo.toml
# Merges: development baseURL + main params = http://localhost:1313 with all params
```

#### Production Build (Default)

```bash
bun run build
# Runs: hugo --config hugo.toml (main config only)
# Uses: https://peterwarnock.com/ with all production settings
```

#### Direct Hugo Commands

```bash
# Development (merged configs)
hugo server --config config/development/hugo.toml,hugo.toml

# Production (main config only)
hugo --gc --minify --config hugo.toml
```

### CI/CD Deployment

**Default behavior:** CI/CD should run `bun run build` which uses the production
baseURL from `hugo.toml`.

If you need different baseURLs for different environments, modify your build
command:

**GitHub Actions (Production):**

```yaml
- name: Build
  run: bun run build
  # Uses: https://peterwarnock.com/
```

**GitHub Actions (Staging):**

```yaml
- name: Build
  run: bun run build -- -b https://staging.peterwarnock.com/
```

**Vercel/Netlify:** These platforms typically don't need custom baseURL flags
since the default production URL in `hugo.toml` is correct.

### Why Absolute URLs in Cards

The site uses `.Permalink` (absolute URLs) in card components:

- Better for SEO crawlers
- Required for OpenGraph meta tags
- Required for JSON-LD structured data
- Works correctly with different baseURLs

Links will show `https://peterwarnock.com/blog/` in production and
`https://peterwarnock.com/blog/` when built locally (reflecting the configured
baseURL).

---

## Google Tag Manager (GTM) Configuration

Analytics tracking is environment-aware and only fires in production builds.

### GTM Setup

- **Container ID:** `GTM-N9CR6KJ5` (set via `HUGO_GTM_CONTAINER_ID` env var)
- **Mode:** Production-only (controlled by `HUGO_ENV` environment variable)
- **Development Behavior:** GTM script is NOT loaded in dev

### How It Works

**Template (layouts/\_default/baseof.html):**

```html
<!-- Google Tag Manager -->
{{ if eq (getenv "HUGO_ENV") "production" }}
<script>
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(
    window,
    document,
    'script',
    'dataLayer',
    '{{ getenv "HUGO_GTM_CONTAINER_ID" }}'
  );
</script>
{{ end }}
```

The template checks `HUGO_ENV`:

- `production` → GTM script loads and fires
- `development` → GTM script is NOT included

### Development (No Tracking)

```bash
bun run dev
# HUGO_ENV defaults to "development"
# GTM script is skipped via {{ if }} condition
# No analytics data sent to Google
```

### Production Builds (Tracking Enabled)

```bash
# Local test build with production environment
HUGO_ENV=production bun run build
# GTM script is included
# Analytics tracking is active

# CI/CD automatically sets HUGO_ENV=production before build
```

### Verification

To verify GTM is not firing in dev:

```bash
bun run dev
# Open: http://localhost:1313
# Check DevTools Network tab for "googletagmanager.com" requests
# Should NOT see any requests (GTM script not loaded)

# Compare with production build:
HUGO_ENV=production bun run build
# After build, check public/index.html for GTM script
grep -r "googletagmanager.com" public/ | head -5
# Should show GTM script in HTML
```

### Configuration

**Production Settings (hugo.toml):**

```toml
googleAnalytics = 'G-SKDDM2GBXN'  # Used for GA4
```

**Development Settings (config/development/hugo.toml):**

```toml
[params]
  googleAnalytics = ""  # Explicitly disabled
  env = "development"
```

**CI/CD Environment Variables:**

The following must be set for production builds:

```bash
HUGO_ENV=production
HUGO_GTM_CONTAINER_ID=GTM-N9CR6KJ5
```
