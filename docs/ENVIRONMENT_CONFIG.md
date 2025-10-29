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

Version is automatically extracted from the latest Cody version directory and synced to `hugo.toml` before each build.

**Script:** `scripts/bump-version.sh`

**How it works:**
1. Finds latest version in `.cody/project/build/v*/`
2. Extracts version number (e.g., `v0.10.0-spacing-scale`)
3. Updates `hugo.toml` with the version

**Usage:**

Automatic (runs before build):
```bash
npm run build  # automatically bumps version first
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
3. Run `npm run build` - automatically syncs version to `hugo.toml`
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

The `baseURL` is set in `hugo.toml` but can be overridden via command line flags.

**Production default (in hugo.toml):**
```toml
baseURL = "https://peterwarnock.com/"
```

To use a different `baseURL`, pass it as a flag to Hugo.

### Usage

#### Development (Local)
```bash
npm run dev
# Uses: http://localhost:1313/
# Pass flag to Hugo: npm run dev -- -b http://localhost:1313/
```

#### Production Build (Default)
```bash
npm run build
# Uses: https://peterwarnock.com/ (from hugo.toml)
```

#### Staging Build
```bash
npm run build -- -b https://staging.peterwarnock.com/
```

#### Direct Hugo Commands
```bash
# Development
hugo server -b http://localhost:1313/

# Production
hugo -b https://peterwarnock.com/

# Staging
hugo -b https://staging.peterwarnock.com/
```

### CI/CD Deployment

**Default behavior:** CI/CD should run `npm run build` which uses the production baseURL from `hugo.toml`.

If you need different baseURLs for different environments, modify your build command:

**GitHub Actions (Production):**
```yaml
- name: Build
  run: npm run build
  # Uses: https://peterwarnock.com/
```

**GitHub Actions (Staging):**
```yaml
- name: Build
  run: npm run build -- -b https://staging.peterwarnock.com/
```

**Vercel/Netlify:** These platforms typically don't need custom baseURL flags since the default production URL in `hugo.toml` is correct.

### Why Absolute URLs in Cards

The site uses `.Permalink` (absolute URLs) in card components:
- Better for SEO crawlers
- Required for OpenGraph meta tags
- Required for JSON-LD structured data
- Works correctly with different baseURLs

Links will show `https://peterwarnock.com/blog/` in production and `https://peterwarnock.com/blog/` when built locally (reflecting the configured baseURL).
