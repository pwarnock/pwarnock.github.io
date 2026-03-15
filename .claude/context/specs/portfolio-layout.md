# Portfolio Layout

## Architecture

Portfolio entries are grouped by `category` frontmatter (Web App, Developer Tool, etc.) in `packages/site/layouts/portfolio/list.html`. No pagination — all projects render on a single page across category sections. Filter buttons at the top let visitors show/hide sections by category.

The card partial `packages/site/layouts/partials/components/card-portfolio-enhanced.html` renders each project. The legacy `card-unified.html` and `card-portfolio.html` are unused by this layout.

## Category Color Mapping

Lives in BOTH the card partial AND the list layout (must stay in sync):

```
dict "Web App" "info" "Infrastructure" "success" "API" "accent" "Developer Tool" "secondary" "Educational Game" "warning" "Prototype" "neutral"
```

## Gotchas

- **Nil category guard**: `$category` is nil for entries without `category` frontmatter. Always wrap in `{{ with $category }}` before calling `index $categoryColors .` — same pattern as tools' ring guard.
- **Badge rendering**: DaisyUI v5 badges break in flex rows with multi-line titles (fixed height gets crushed). Rule: 1 badge per card, always `shrink-0`, never in the same flex row as the title.
- **Category color mapping in two places**: The mapping must match between `card-portfolio-enhanced.html` and `portfolio/list.html`. If you add a category, update both.
- **`complement` for uncategorized**: `list.html` uses `complement` to find projects without a category — same pattern as tools' "Other" section. Avoids fragile nil checks.
- **Filter JS**: Vanilla JS toggles `hidden` class on `[data-category]` sections. The "All" button shows everything. No Alpine.js dependency.
- **Tech tags use `technologies`**: Portfolio uses `technologies` (plural, array) not `tags`. The card partial reads `$context.Params.technologies`.
- **Client vs website**: Portfolio uses `client` for attribution; tools uses `website`. Different semantic meaning, don't unify.
