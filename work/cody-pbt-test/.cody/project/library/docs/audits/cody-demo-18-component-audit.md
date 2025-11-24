# Discovery: Reusable Component Partials (pw-18)

## Executive Summary

**Current State:** 19 component partials with mixed maturity

- **Well-designed:** 7 partials (card.html, badge.html, button.html, icon.html,
  content-card.html, etc.)
- **Redundant/Unused:** 12 partials (card variants, content-card variants,
  legacy files)

**Problem:** Over-parameterized unified components coexist with hardcoded
variants, causing:

1. Confusion about which to use
2. Duplicate functionality
3. Maintenance burden
4. Unused files in codebase

**Goal:** Consolidate to single, well-documented reusable partials

---

## Component Audit Results

### 📊 Actual Usage

#### USED Partials (Primary)

| Partial               | Used In                                      | Purpose                | Lines | Status           |
| --------------------- | -------------------------------------------- | ---------------------- | ----- | ---------------- |
| `card.html`           | sections/posts.html, sections/portfolio.html | Unified card component | 143   | ✅ Well-designed |
| `card-list.html`      | list.html (posts/blog)                       | Hardcoded list card    | 50    | ⚠️ Legacy        |
| `card-unified.html`   | list.html (portfolio/tools)                  | Hardcoded unified card | ~50   | ⚠️ Legacy        |
| `content-card.html`   | sections/content-grid.html                   | Base content card      | ~80   | ✅ Primary       |
| `badge.html`          | Multiple (button, card, nav)                 | Reusable badge         | ~20   | ✅ Minimal       |
| `button.html`         | Multiple (nav, cards, sections)              | Reusable button        | ~30   | ✅ Minimal       |
| `icon.html`           | Multiple (nav, buttons, cards)               | SVG icon wrapper       | ~20   | ✅ Minimal       |
| `social-links.html`   | header, navigation, footer                   | Social link icons      | ~15   | ✅ Specific      |
| `theme-selector.html` | header, navigation                           | Dark mode toggle       | ~80   | ✅ Specific      |
| `navigation.html`     | header.html                                  | Main navigation        | 52    | ✅ Primary       |

#### UNUSED/REDUNDANT Partials

| Partial                        | Reason                                    | Replacement                     |
| ------------------------------ | ----------------------------------------- | ------------------------------- |
| `card-portfolio.html`          | Hardcoded layout, superseded by card.html | Use `card.html` with params     |
| `card-tools.html`              | Hardcoded layout, superseded by card.html | Use `card.html` with params     |
| `content-card-blog.html`       | Never called directly                     | Use `content-card.html`         |
| `content-card-portfolio.html`  | Never called directly                     | Use `content-card.html`         |
| `content-card-tools.html`      | Never called directly                     | Use `content-card.html`         |
| `screenshot-placeholder.html`  | Minimal use                               | Can be integrated into card     |
| `screenshot-with-caption.html` | Minimal use                               | Can be enhanced as card variant |
| `footer-nav.html`              | Specific footer links                     | Could be badge component        |
| `newsletter.html`              | Inline in sections                        | Could be reusable               |

---

## Consolidation Analysis

### Phase 1: Immediate Consolidation (Low Risk)

#### 1️⃣ Replace `card-list.html` → `card.html`

**Current:**

```html
<!-- card-list.html: Hardcoded 50 lines -->
<article class="card">
  <h2>{{ .Title }}</h2>
  <p>{{ .Summary }}</p>
  <time>{{ .Date }}</time>
</article>
```

**Proposed:**

```hugo
<!-- list.html: Use card.html with params -->
{{ partial "components/card.html" (dict
  "context" .
  "variant" "list"    <!-- New variant -->
  "showDate" true
  "showTags" true
) }}
```

**Benefit:** Remove 50 lines of duplicate HTML, use single parameterized
component

#### 2️⃣ Replace `card-unified.html` → `card.html`

**Same as card-list.html**, use different variant params:

```hugo
{{ partial "components/card.html" (dict
  "context" .
  "variant" "unified"    <!-- Different variant -->
  "showMetadata" true
  "showActions" true
) }}
```

#### 3️⃣ Delete Unused Content-Card Variants

```bash
rm layouts/partials/components/content-card-blog.html
rm layouts/partials/components/content-card-portfolio.html
rm layouts/partials/components/content-card-tools.html
```

These are never called. `content-card.html` handles all variants via params.

#### 4️⃣ Consolidate Screenshot Partials

Merge `screenshot-placeholder.html` and `screenshot-with-caption.html` into
card.html as image variants:

```hugo
{{ partial "components/card.html" (dict
  "context" .
  "type" "screenshot"    <!-- New type -->
  "image" "path/to/img"
  "caption" "Screenshot description"
) }}
```

---

### Phase 2: Document API (No Code Changes)

#### `card.html` - Unified Card API

**Current Implementation:** Already parameterized (lines 2-77)

**Parameters:**

```hugo
dict "context" .             // Current page/post context
     "variant" "default"     // Visual style: default, list, unified, screenshot
     "title" ""              // Override title
     "url" ""                // Override link
     "size" "md"             // Size: sm, md, lg
     "content" ""            // Override content
     "tags" slice            // Tag list
     "metadata" dict         // Custom metadata
     "actions" slice         // Custom actions
     "class" ""              // Additional CSS classes
     "ariaLabel" ""          // Accessibility label
```

**Usage Examples:**

```hugo
<!-- Blog post card (simple) -->
{{ partial "components/card.html" (dict "context" . "variant" "list") }}

<!-- Portfolio project (with actions) -->
{{ partial "components/card.html" (dict
  "context" .
  "variant" "unified"
  "actions" (slice
    (dict "href" "/project" "text" "View" "variant" "primary")
  )
) }}

<!-- Screenshot (image focus) -->
{{ partial "components/card.html" (dict
  "context" .
  "type" "screenshot"
  "image" .Params.image
  "caption" .Params.caption
) }}
```

#### `content-card.html` - Content Grid Card

**Current state:** Already parameterized

**Parameters:**

```hugo
dict "context" .
     "type" "post"      // post, portfolio, tool, custom
     "index" 0          // Position in grid (for styling)
```

**Uses:** Already flexible, no changes needed

---

### Phase 3: Unused Files Cleanup

**Files to Delete:**

1. `card-portfolio.html` (56 lines)
2. `card-tools.html` (47 lines)
3. `content-card-blog.html` (53 lines)
4. `content-card-portfolio.html` (68 lines)
5. `content-card-tools.html` (52 lines)

**Total removed:** 276 lines of dead code

**Files to Keep (Working Partials):**

1. ✅ `card.html` - Unified card component
2. ✅ `card-list.html` - Keep until card-list migration (v0.11.0)
3. ✅ `card-unified.html` - Keep until card-unified migration (v0.11.0)
4. ✅ `content-card.html` - Main content card
5. ✅ `badge.html` - Reusable badge
6. ✅ `button.html` - Reusable button
7. ✅ `icon.html` - Icon wrapper
8. ✅ `navigation.html` - Main navigation
9. ✅ `social-links.html` - Social icons
10. ✅ `theme-selector.html` - Theme toggle
11. ✅ `newsletter.html` - Newsletter signup
12. ✅ `screenshot-placeholder.html` - Screenshot container
13. ✅ `screenshot-with-caption.html` - Screenshot with caption
14. ✅ `footer-nav.html` - Footer navigation

---

## Component API Documentation

### Basic Pattern

```hugo
{{/* Import a component partial with parameters */}}
{{ partial "components/COMPONENT.html" (dict
  "param1" value1
  "param2" value2
) }}

{{/* Access parameters in component */}}
{{ .param1 }}
{{ .param2 }}
```

### Reusable Primitives

#### `badge.html`

```hugo
{{ partial "components/badge.html" (dict
  "text" "Tag name"
  "variant" "default|primary|secondary|accent|success|warning|error"
  "size" "sm|md|lg"
) }}
```

#### `button.html`

```hugo
{{ partial "components/button.html" (dict
  "href" "/path"
  "text" "Click me"
  "variant" "primary|secondary|ghost|outline|accent"
  "size" "sm|md|lg"
  "icon" "arrow-right"
  "class" "custom-class"
  "role" "menuitem"
  "ariaCurrent" "page"  // For active nav links
) }}
```

#### `icon.html`

```hugo
{{ partial "components/icon.html" (dict
  "name" "menu|share|calendar|clock|arrow-right|etc"
  "size" "xs|sm|md|lg|xl"
) }}
```

### Complex Compositions

#### `card.html` (Multi-purpose)

```hugo
{{ partial "components/card.html" (dict
  "context" .          // Current page/post
  "variant" "list"     // Visual style
  "size" "md"          // Card size
  "title" ""           // Override
  "metadata" slice     // Custom metadata
  "actions" slice      // CTA buttons
  "tags" slice         // Tag list
) }}
```

#### `navigation.html` (Context-aware)

```hugo
{{/* Renders responsive nav with Alpine.js */}}
{{ partial "components/navigation.html" . }}

{{/* Automatically handles:
  - Mobile dropdown (Alpine.js)
  - Desktop menu bar
  - Active link detection
  - Theme selector
  - Social links
*/}}
```

---

## Migration Path (v0.11.0+)

### Step 1: Phase 1 Cleanup (No Breaking Changes)

- Delete 5 unused content-card variants
- Delete legacy hardcoded card files (keep in list.html calls)
- Commit as "refactor: remove unused component partials"

### Step 2: Phase 2 Documentation

- Update README with component API
- Add code examples
- Document parameters

### Step 3: Phase 3 Migration

- Gradually update list.html to use card.html variants
- Update calls:
  ```diff
  - {{ partial "components/card-list.html" . }}
  + {{ partial "components/card.html" (dict "context" . "variant" "list") }}
  ```

### Step 4: Cleanup Legacy Files

- After all list.html conversions, delete:
  - `card-list.html`
  - `card-unified.html`
  - `card-portfolio.html`
  - `card-tools.html`

---

## Governance Rules

### ✅ When to Create a New Partial:

1. Component used in 3+ places
2. Self-contained functionality
3. Significant markup (>30 lines)
4. Reusable across different contexts

### ❌ When NOT to Create a Partial:

1. Single-use markup
2. Simple wrapper (<20 lines)
3. Tightly coupled to one context
4. Better as section/shortcode

### Naming Conventions:

- `component-name.html` - Reusable across site
- `component-variant.html` - Variant of base component (avoid this, use params
  instead)
- Avoid: `card-blog.html`, `card-portfolio.html` → Use `card.html` with params

---

## Success Criteria

✅ v0.13.0 completion means:

- [ ] Unused partials deleted (276 lines removed)
- [ ] All list.html calls migrated to `card.html`
- [ ] Content-card variants consolidated
- [ ] Component API documented
- [ ] Zero duplicate partials
- [ ] Clear naming convention established

---

## Estimated Effort

| Phase     | Task                   | Files   | Effort      | Risk           |
| --------- | ---------------------- | ------- | ----------- | -------------- |
| 1         | Delete unused partials | 5 files | 1 hour      | Low            |
| 2         | Document API           | README  | 2 hours     | None           |
| 3         | Migrate list.html      | 1 file  | 2 hours     | Medium         |
| 4         | Delete legacy cards    | 4 files | 1 hour      | Low            |
| **Total** |                        |         | **6 hours** | **Low-Medium** |

---

## Summary

**Current Problem:**

- 12 redundant/unused partials
- Confusion about which component to use
- Over-parameterized unified components mixed with hardcoded variants

**Solution:**

1. Delete 5 unused content-card variants (Phase 1)
2. Document card.html + content-card.html API (Phase 2)
3. Migrate list.html to use parameterized card.html (Phase 3)
4. Delete legacy card-\* files (Phase 4)

**Outcome:**

- Clean component library with clear reusability
- Single source of truth per component type
- Easier maintenance and future development
