# Subagent Handoff: Fix Analytics Violations

**Branch**: `fix/analytics-violations`  
**Worktree**: `work/fix-analytics-violations/`  
**Working Directory**: Use worktree, not main directory

## Overview

Analytics validation hook now enforces `data-event` and `data-event-label`
attributes on all interactive elements. This branch has 18 remaining violations
to fix (2 already fixed on main).

**Violations Summary**: 18 files, 20 violations total

- 5 files: buttons (forms, navigation, toggles, CTAs)
- 3 files: external links
- 1 file: Alpine.js @click handlers
- 1 file: Cookie consent banner
- 1 file: Carousel controls

## What You Need to Know

### Analytics Pattern

Every interactive element (button, link, form) must have:

```html
<button data-event="event_name" data-event-label="Human Readable Label">
  Text
</button>
<a href="..." data-event="external_link_click" data-event-label="Link Text"
  >Text</a
>
```

### Naming Convention (snake_case)

- `button_click` - Generic button
- `external_link_click` - Link to external URL
- `form_submit` - Form submission
- `navigation_toggle` - Toggle navigation/menu
- `theme_toggle` - Theme switcher
- `newsletter_signup` - Newsletter form
- `carousel_next` / `carousel_prev` - Carousel navigation
- `carousel_indicator` - Carousel indicator

### Exceptions (do NOT track these)

- ✅ Internal navigation links (`href="/..."`) - auto-tracked by section views
- ✅ Anchor links (`href="#..."`) - navigation within page
- ✅ Disabled elements - user can't interact with them
- ✅ Hidden elements - not visible to users
- ✅ `data-no-track` attribute - explicit opt-out for special cases
- ✅ Alpine.js components with `@click` to local functions - already tracked by
  form/input events

### Files to Fix (in priority order)

## Priority 1: Core Components (fix first)

### 1. `/layouts/partials/components/cookie-consent.html` (5 violations, lines 27, 30, 33, 36, 39, 42)

**What**: Cookie consent banner buttons **Fix**: Add data-event attributes to 3
buttons:

- Accept button:
  `data-event="cookie_consent_accept" data-event-label="Accept All"`
- Reject button:
  `data-event="cookie_consent_reject" data-event-label="Essential Only"`
- Preferences button:
  `data-event="cookie_consent_preferences" data-event-label="Preferences"`

**Note**: Script already calls `window.CookieConsent?.accept()` etc. Just add
the attributes.

### 2. `/layouts/partials/components/newsletter.html` (1 violation, line 24)

**What**: Newsletter signup submit button **Fix**: Add to
`<button type="submit">`:

```html
data-event="newsletter_signup" data-event-label="Subscribe"
```

### 3. `/layouts/partials/components/hero-intro.html` (1 violation, line 59)

**What**: External GitHub link **Fix**: Add to the GitHub link:

```html
data-event="external_link_click" data-event-label="GitHub Repository"
```

## Priority 2: Navigation/UI Controls (fix second)

### 4. `/layouts/partials/components/theme-selector-data.html` (1 violation, line 7)

**What**: Theme switcher dropdown button with Alpine.js `@click` **Fix**: Add to
button:

```html
data-event="theme_toggle" data-event-label="Theme Selector"
```

**Note**: Alpine.js `@click="themeOpen = !themeOpen"` is fine (just toggling
state)

### 5. `/layouts/partials/components/navigation.html` (1 violation, line 40)

**What**: Social media menu toggle button with Alpine.js **Fix**: Add to button:

```html
data-event="social_menu_toggle" data-event-label="Social Links"
```

**Note**: Alpine.js `@click="socialMenuOpen = !socialMenuOpen"` is fine

### 6. `/layouts/partials/components/hero-tools.html` (3 violations, lines 79, 80, 81)

**What**: Tool filtering buttons (All Tools, AI Tools, Traditional) **Fix**: Add
to each button:

```html
data-event="tool_filter" data-event-label="All Tools" data-event="tool_filter"
data-event-label="AI Tools" data-event="tool_filter"
data-event-label="Traditional Tools"
```

**Note**: These use plain `<button>` elements, not Alpine.js

## Priority 3: Content & Carousel (fix last)

### 7. `/layouts/partials/components/carousel/navigation.html` (2 violations, lines 4, 12)

**What**: Previous/Next buttons for carousel **Fix**: Add to each button:

```html
data-event="carousel_prev" data-event-label="Previous Slide"
data-event="carousel_next" data-event-label="Next Slide"
```

### 8. `/layouts/partials/components/carousel/indicators.html` (1 violation, line 7)

**What**: Carousel dot indicators (slide selectors) **Fix**: Add to button:

```html
data-event="carousel_indicator" data-event-label="Go to slide"
```

### 9. `/layouts/partials/content/chunked-content.html` (1 violation, line 27)

**What**: Some kind of button in chunked content **Fix**: Look at the file and
determine what button does, then add appropriate event:

```html
data-event="content_action" data-event-label="Button Label"
```

### 10. `/layouts/partials/content/lazy-content.html` (1 violation, line 10)

**What**: Some kind of button in lazy-loaded content **Fix**: Look at the file
and determine what button does, then add appropriate event:

```html
data-event="content_action" data-event-label="Button Label"
```

### 11. `/layouts/_default/single.html` (2 remaining violations, lines 114, 121)

**What**: Footer navigation buttons (Back and Top buttons) **Fix**: These are
partially done. Need to finish:

- Line 114: Scroll to top button - add
  `data-event="scroll_to_top" data-event-label="Back to Top"`
- Line 121: Back button - add
  `data-event="navigation_back" data-event-label="Footer Back"`

**Status**: 2 back buttons already fixed on main (lines 26, 137). Just need
these 2.

## How to Execute

### Step 1: Check out the worktree

```bash
cd work/fix-analytics-violations/
```

### Step 2: Verify violations still exist

```bash
.github/scripts/validate-analytics.sh all
# Should show ~18 violations
```

### Step 3: Fix each file (use Read tool, then edit_file)

For each violation:

1. **Read** the file to see context
2. **Determine** what the button/link does
3. **Choose** appropriate event name from naming convention
4. **Add** data-event and data-event-label attributes
5. **Verify** syntax is correct

### Step 4: Validate fixes

```bash
.github/scripts/validate-analytics.sh all
# Should show 0 violations when complete
```

### Step 5: Commit

```bash
git add layouts/
git commit -m "fix: Add analytics tracking to interactive elements

- Add data-event attributes to cookie consent banner (5 buttons)
- Add data-event attributes to newsletter form submit
- Add data-event attributes to theme selector toggle
- Add data-event attributes to social menu toggle
- Add data-event attributes to hero tools filter buttons (3)
- Add data-event attributes to carousel navigation (2)
- Add data-event attributes to carousel indicators
- Add data-event attributes to content action buttons (2)
- Add data-event attributes to single page navigation buttons (2)
- Add data-event attributes to external GitHub link
- Add data-event attributes to hero intro GitHub link

All interactive elements now tracked per pw-an0 validation hook
Validation: 0 violations found"
```

### Step 6: Create pull request

After commit:

1. Push branch: `git push origin fix/analytics-violations`
2. Create PR on GitHub
3. PR description should reference: "Fixes analytics violations detected by
   pw-an0 validation hook"

## File-by-File Checklist

- [ ] `/layouts/partials/components/cookie-consent.html` (5 buttons)
- [ ] `/layouts/partials/components/newsletter.html` (1 submit button)
- [ ] `/layouts/partials/components/hero-intro.html` (1 external link)
- [ ] `/layouts/partials/components/theme-selector-data.html` (1 Alpine toggle)
- [ ] `/layouts/partials/components/navigation.html` (1 Alpine toggle)
- [ ] `/layouts/partials/components/hero-tools.html` (3 filter buttons)
- [ ] `/layouts/partials/components/carousel/navigation.html` (2 nav buttons)
- [ ] `/layouts/partials/components/carousel/indicators.html` (1 indicator
      button)
- [ ] `/layouts/partials/content/chunked-content.html` (1 button)
- [ ] `/layouts/partials/content/lazy-content.html` (1 button)
- [ ] `/layouts/_default/single.html` (2 footer buttons)

## Expected Outcome

After fixes:

- ✅ All 20 violations resolved
- ✅ `.github/scripts/validate-analytics.sh all` shows 0 violations
- ✅ Pre-push hook passes
- ✅ Build succeeds
- ✅ PR merged to main
- ✅ Analytics tracking enforced for all future features

## Important Notes

1. **Do NOT change functionality** - only add attributes
2. **Preserve existing attributes** - don't remove or modify class, id, onclick,
   etc.
3. **Keep formatting consistent** - add attributes before closing `>` bracket
4. **Test the script** - run validation hook after each file to catch issues
   early
5. **Use semantic names** - match event names to user actions

## Questions?

Refer to:

- `docs/development/FEATURE_DEVELOPMENT_CHECKLIST.md` - Analytics patterns
- `.github/scripts/validate-analytics.sh` - Validation logic
- `static/js/analytics.js` - Analytics module reference
- Previous PRs: pw-26 (Analytics), pw-27 (Cookie Consent) for examples

**Start with Priority 1 files** - they're most important and most complete.
