# Spacing Scale Refactoring - Automation Guide

## Overview

Phase 1 (proof of concept) is complete:
- ✅ single.html fully refactored
- ✅ list.html fully refactored
- ✅ baseof.html fully refactored
- ✅ Pattern documented and validated
- ��� CSS classes added to main.css

**Remaining work:** 30 files across components, sections, shortcodes, and partials

This guide covers automation for Phase 2-3.

---

## Automation Script

**Location:** `scripts/refactor-spacing-scale.sh`

### What It Does

1. Scans template files for hardcoded spacing utilities (`mb-6`, `p-8`, `gap-4`, etc.)
2. Replaces them with inline `style` attributes using CSS variables
3. Generates a detailed report of changes
4. Supports dry-run mode for validation before committing changes

### Prerequisites

- On branch: `v0.10.0-spacing-scale`
- Bash 4+
- Backup recommended before running

---

## Usage

### Dry-Run (Recommended First)

Test without making changes:

```bash
cd /Users/peter/github/pwarnock.github.io
./scripts/refactor-spacing-scale.sh --dry-run
```

Output shows:
- Which files will be changed
- How many utilities will be replaced
- Detailed report at `/tmp/spacing-refactor-report.txt`

### With Backup

Create backups of all files before refactoring:

```bash
./scripts/refactor-spacing-scale.sh --backup
```

Backups saved as `filename.html.backup` in same directory.

### Refactor Specific Pattern

Process only certain files:

```bash
# Refactor only component files
./scripts/refactor-spacing-scale.sh --backup --file "components/*.html"

# Refactor only section files
./scripts/refactor-spacing-scale.sh --backup --file "sections/*.html"

# Refactor only shortcodes
./scripts/refactor-spacing-scale.sh --backup --file "*.html"  # runs on shortcodes/
```

### Full Refactoring (All 30 Files)

```bash
./scripts/refactor-spacing-scale.sh --backup
```

Processes all files in:
- `layouts/partials/components/`
- `layouts/partials/sections/`
- `layouts/shortcodes/`
- `layouts/partials/` (other)

---

## Step-by-Step Execution Plan

### Phase 2: Component Layer (15 files)

**Highest impact - most reused across site**

1. Run dry-run on components only:
   ```bash
   ./scripts/refactor-spacing-scale.sh --dry-run --file "components/*.html"
   ```

2. Review report for expected changes

3. Execute with backup:
   ```bash
   ./scripts/refactor-spacing-scale.sh --backup --file "components/*.html"
   ```

4. Build and test:
   ```bash
   npm run build
   ```

5. Commit:
   ```bash
   git add -A
   git commit -m "refactor(css): replace spacing utilities in component layer (15 files)"
   ```

### Phase 3: Sections & Shortcodes (11 files)

After Phase 2 is committed:

1. Sections (6 files):
   ```bash
   ./scripts/refactor-spacing-scale.sh --backup --file "sections/*.html"
   npm run build
   git commit -m "refactor(css): replace spacing utilities in sections (6 files)"
   ```

2. Shortcodes (5 files):
   ```bash
   ./scripts/refactor-spacing-scale.sh --backup --file "*.html"  # Will process shortcodes
   npm run build
   git commit -m "refactor(css): replace spacing utilities in shortcodes (5 files)"
   ```

### Phase 4: Remaining Partials (9 files)

Other partial files not in components/sections:

```bash
./scripts/refactor-spacing-scale.sh --backup
npm run build
git commit -m "refactor(css): replace spacing utilities in remaining partials (9 files)"
```

---

## Testing After Refactoring

After each phase, verify:

1. **Build succeeds:**
   ```bash
   npm run build
   ```

2. **No console errors** — Check dev server logs

3. **Visual regression** — Visit key pages:
   - Homepage
   - Blog post listing
   - Individual blog post
   - Tools page
   - Portfolio page

4. **Responsive design** — Test at multiple breakpoints:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)

---

## Rollback Plan

If issues occur:

1. **Full rollback:** Use backed-up `.backup` files
   ```bash
   for f in layouts/**/*.backup; do cp "$f" "${f%.backup}"; done
   ```

2. **Selective rollback:** Restore specific file
   ```bash
   cp layouts/partials/components/card.html.backup layouts/partials/components/card.html
   ```

3. **Git rollback:** If committed
   ```bash
   git revert HEAD
   ```

---

## Known Limitations & Manual Fixes

The automation script handles **~80% of cases** via simple pattern matching. Some files may need manual review:

### Edge Cases Requiring Manual Attention

1. **Responsive gaps/margins with complex breakpoints**
   - Current: `gap-6 lg:gap-8` → becomes `gap: var(--space-6)` (desktop gap lost)
   - Solution: Use responsive utility classes (`.gap-responsive-md`)
   - Example:
     ```html
     <!-- Before -->
     <div class="grid gap-6 lg:gap-8">

     <!-- After (manual) -->
     <div class="grid gap-responsive-md">
     ```

2. **Conditional spacing based on state**
   - Current automation may miss Alpine.js or Hugo conditionals
   - Solution: Manual inspection required

3. **Component-specific responsive spacing**
   - If a component has unique responsive spacing not covered by utility classes
   - Solution: Create new utility class in main.css

### Manual Inspection Checklist

After each phase, scan for:

```bash
# Check for remaining hardcoded spacing
grep -r "class=\"[^\"]*\(mb-\|mt-\|px-\|py-\|p-\|gap-\|mr-\|ml-\|pt-\|pb-\)[0-9]" layouts/partials/components/ || echo "No matches found"
```

If matches found, manually review and apply responsive utility classes as needed.

---

## CSS Variable Reference

All spacing uses these tokens (from `assets/css/main.css`):

```
--space-0: 0
--space-1: 0.25rem
--space-2: 0.5rem
--space-3: 0.75rem
--space-4: 1rem
--space-5: 1.25rem
--space-6: 1.5rem
--space-8: 2rem
--space-10: 2.5rem
--space-12: 3rem
--space-16: 4rem
--space-20: 5rem
--space-24: 6rem
--space-32: 8rem
```

### Available Responsive Utility Classes

```css
.mb-responsive-lg    /* mb-12 → mb-16 @lg */
.mb-responsive-md    /* mb-6 → mb-8 @lg */
.mt-responsive-lg    /* mt-16 → mt-20 @lg */
.p-responsive-md     /* p-8 → p-12 @lg */
.p-responsive-sm     /* p-8 → p-10 @lg */
.gap-responsive-md   /* gap-6 → gap-8 @lg */
```

---

## Commit Message Template

```
refactor(css): replace spacing utilities in [LAYER] ([N] files)

- Replace [N] hardcoded Tailwind spacing utilities with CSS variables
- Use inline style attributes for simple spacing
- Apply responsive utility classes for breakpoint-dependent spacing
- All spacing now uses --space-* tokens
- Maintain visual consistency with zero regressions

Phase [X] of v0.10.0 spacing scale refactoring.

🐋 Generated with [Letta Code](https://letta.com)

Co-Authored-By: Letta <noreply@letta.com>
```

---

## Success Criteria

✅ v0.10.0 is complete when:

- [ ] All 33 template files refactored
- [ ] No hardcoded spacing utilities remain
- [ ] All responsive spacing uses utility classes or CSS variables
- [ ] Build succeeds with no warnings
- [ ] Visual regression testing passes
- [ ] PR review complete
- [ ] Merged to main branch

---

## Next Steps After v0.10.0

Once spacing scale is complete:

1. **Plan v0.11.0** - Mobile navigation & responsive patterns (pw-16)
2. **Plan v0.12.0** - Accessibility enhancements (pw-17)
3. **Plan v0.13.0** - Component partials (pw-18)

Spacing scale established = foundation for cleaner, more maintainable templates.
