# Discovery: Spacing Scale & CSS Organization (pw-15)

## Current State Assessment

### ✅ What's Working

- **Spacing tokens defined** in `assets/css/main.css` (--space-0 through --space-32)
- **Design system structure** is solid (colors, typography, component base styles)
- **Component base classes** exist (.btn-system, .card-system, .badge-system, .icon-system)

### ❌ What's Broken

- **250+ hardcoded spacing utilities** scattered across 33 template files
- **No use of CSS variables** in templates — templates use `mb-6`, `p-8`, `gap-4` directly
- **Inconsistent patterns** across files (some use responsive spacing, some don't)
- **No documentation** of how to apply spacing tokens in templates

## Audit Results

### Files Affected (33 total)

**Core Layouts (3 files):**

- `layouts/_default/single.html` — ~25 hardcoded spacing values
- `layouts/_default/list.html` — ~12 hardcoded spacing values
- `layouts/_default/baseof.html` — multiple hardcoded values

**Partials - Components (10 files):**

- Components: badge, button, card, card-list, card-portfolio, card-tools, card-unified
- Content cards: content-card, content-card-blog, content-card-portfolio, content-card-tools
- Navigation: footer-nav, navigation, theme-selector

**Partials - Sections (6 files):**

- hero, posts, portfolio, skills, tools, content-grid

**Shortcodes (5 files):**

- about-hero, call-to-action, expertise-cards, hero, newsletter-section, placeholder, screenshot, technology-stack

**Other Partials (9 files):**

- footer, header, hero, list-header, list-pagination, newsletter-section, screenshot-placeholder, screenshot-with-caption, social-links

### Common Violations Pattern

**Spacing utilities that should use tokens:**

```
mb-{n}    → var(--space-{n})
mt-{n}    → var(--space-{n})
px-{n}    → var(--space-{n})
py-{n}    → var(--space-{n})
p-{n}     → var(--space-{n})
gap-{n}   → var(--space-{n})
mr-{n}    → var(--space-{n})
ml-{n}    → var(--space-{n})
pt-{n}    → var(--space-{n})
pb-{n}    → var(--space-{n})
```

**Examples from audit:**

- `p-8 lg:p-12` (single.html:24) → Should use CSS variables + responsive fallback
- `mb-12 lg:mb-16` (single.html:20) → var(--space-12) on mobile, var(--space-16) on lg
- `gap-2`, `mb-6`, `mb-8` hardcoded throughout
- `px-4 py-2` (badge, buttons) → Should be vars

### Responsive Spacing Challenge

Current approach uses responsive Tailwind utilities:

```html
<div class="p-8 lg:p-12"><!-- Works, but not using tokens --></div>
```

With CSS variables, we need to handle responsive differently since CSS variables can't use media queries directly. Options:

1. **Keep Tailwind responsive** but map to token values
2. **Use CSS @apply** to create token-based utilities in main.css
3. **Hybrid**: Tailwind for responsiveness + CSS vars for values

## Recommended Approach

### Phase 1: Document Pattern (Proof of Concept)

1. Create refactoring guide with 1-2 examples
2. Show conversion pattern for different spacing scenarios
3. Test pattern in `single.html` (highest impact file)

### Phase 2: Implement & Validate

1. Refactor `single.html` using documented pattern
2. Validate spacing looks identical after changes
3. Confirm token usage reduces CSS complexity

### Phase 3: Systematic Refactoring

1. Break remaining 32 files into bite-sized chunks (5-8 files per micro-task)
2. Create checklist for consistency across all files
3. Document "no more hardcoded spacing" rule for future development

## Scope Estimates

| Task                                              | Complexity | Files | Tokens     |
| ------------------------------------------------- | ---------- | ----- | ---------- |
| Document pattern + proof of concept (single.html) | Medium     | 1     | ~1 hour    |
| Refactor components layer                         | Medium     | 15    | ~3 hours   |
| Refactor sections + shortcodes                    | Low        | 12    | ~2 hours   |
| Refactor remaining partials                       | Low        | 6     | ~1.5 hours |
| **Total**                                         |            | 33    | ~7.5 hours |

## Decision Required

**For v0.10.0, should we:**

1. **Document + Proof of Concept** (single.html) → Then schedule remaining files for v0.11.0+
2. **Full refactoring** → All 33 files in one release
3. **Component layer first** (15 files) → Highest impact for template reusability

Recommended: **Option 1** — Document well, prove pattern works, keep scope tight for agent-driven development.

## Next Steps

1. Create refactoring pattern document with examples
2. Convert single.html as proof of concept
3. Document results and lessons learned
4. Decide on remaining file distribution across future versions
