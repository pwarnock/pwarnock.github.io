# Feature Development Checklist

**Status**: Required for all new features  
**Updated**: November 2025  
**References**: [Analytics Module](../../static/js/analytics.js) |
[Testing Workflow](./TESTING_WORKFLOW.md) |
[Feature Flags](../../data/feature-flags.toml)

---

## Overview

This checklist ensures **analytics integration is mandatory** for all new
features. Following this process guarantees that user interactions are tracked,
features are properly tested, and deployments are staged safely.

**Key Principle**: Analytics is not optional. Plan for it in Phase 1, test it in
Phase 2, implement it in Phase 3.

---

## Phase 1: Planning

Before writing any code, define analytics requirements and acceptance criteria.

### Analytics Planning

- [ ] **Identify user actions** to track (CTAs, external links, form
      submissions, section views)
- [ ] **Define event names** in snake_case format:
  - Examples: `tool_download`, `cta_click`, `section_view`, `newsletter_signup`,
    `social_share`
  - Naming rule: `action_object` or `section_action`
- [ ] **Map events to components**:
  - Which buttons? Which forms? Which links? Which page sections?
- [ ] **Define event data** to capture (what context is useful?):
  - `cta_location`, `link_text`, `section_name`, `form_name`, etc.
- [ ] **Create analytics spec document** (can be simple markdown):

  ```markdown
  ## Analytics Events for Feature Name

  | Event           | Trigger                 | Data Collected       | Purpose            |
  | --------------- | ----------------------- | -------------------- | ------------------ |
  | `tool_download` | Click "Download" button | tool_name, file_size | Track tool usage   |
  | `section_view`  | Page load               | section name         | Measure engagement |
  ```

### Feature Scope

- [ ] **Document feature description** (what does it do?)
- [ ] **Define success metrics** (how do we know it works?)
- [ ] **Identify dependent features** (does this require cookie consent? GTM?)
- [ ] **List UI/data requirements** (new page? new component? new API?)

### Team & Timeline

- [ ] **Assign owner** (who is responsible?)
- [ ] **Estimate effort** (planning, testing, implementation, validation)
- [ ] **Create beads issue**:
  ```bash
  bd create "Feature Name" -t feature -p 2 --json
  ```

---

## Phase 2: Testing (Test-Driven Development)

Write failing E2E tests before implementing. Tests verify both feature behavior
AND analytics tracking.

### Create Test File

- [ ] **Create file**: `tests/feature-name.spec.ts`
- [ ] **Use semantic selectors** (role, aria-label, data attributes)
- [ ] **Add test tags** for filtering: `@analytics`, `@feature-tag`, `@e2e`

### Write Analytics Tests

Analytics tests MUST verify that `window.dataLayer` receives the correct events.

**Test Pattern** (from pw-26):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name (pw-XXX)', () => {
  test.beforeEach(async ({ page }) => {
    // Set up dataLayer spy before navigating
    await page.addInitScript(() => {
      (window as any).dataLayerEvents = [];
      (window as any).dataLayer = (window as any).dataLayer || [];
      const originalPush = (window as any).dataLayer.push;
      (window as any).dataLayer.push = function (...args: any[]) {
        (window as any).dataLayerEvents.push(...args);
        return originalPush.apply(this, args);
      };

      // Load Analytics module for test
      if (typeof (window as any).Analytics === 'undefined') {
        (window as any).Analytics = {
          trackEvent: function (eventName: string, eventData: any = {}) {
            (window as any).dataLayer?.push({ event: eventName, ...eventData });
          },
        };
      }
    });
  });

  test('user action triggers analytics event @analytics', async ({ page }) => {
    await page.goto('/page-with-feature');
    await page.waitForTimeout(300);

    // Manually trigger the tracked action
    await page.evaluate(() => {
      (window as any).Analytics.trackEvent('action_name', {
        label: 'Button Text',
      });
    });

    // Verify event in dataLayer
    const events = await page.evaluate(() => {
      return (window as any).dataLayerEvents.filter(
        (e: any) => e.event === 'action_name'
      );
    });

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toMatchObject({
      event: 'action_name',
      label: 'Button Text',
    });
  });
});
```

### Write Feature Tests

- [ ] **Happy path test**: Feature works as intended
- [ ] **Edge case tests**: What if user does something unexpected?
- [ ] **Analytics integration test**: Events fire in correct order
- [ ] **Accessibility test**: Component is keyboard & screen-reader accessible

### Run Tests Locally

```bash
# Run only new tests (should fail initially)
bun run test:e2e -- tests/feature-name.spec.ts

# Watch mode while developing
bun run test:e2e:watch -- tests/feature-name.spec.ts

# Run all tests across browsers
bun run test:e2e
```

- [ ] **Tests fail initially** (expected in TDD)
- [ ] **All tests pass** before moving to Phase 3
- [ ] **Cross-browser passing** (Chromium, Firefox, WebKit)

---

## Phase 3: Implementation

Implement the feature and analytics tracking together.

### Add Component with Tracking

**Button component** (from pw-26):

```html
{{/* Using button partial with tracking parameters */}} {{ partial
"components/button.html" (dict "text" "Download Tool" "href"
"/downloads/tool.zip" "trackingEvent" "tool_download" "trackingLabel" "Premium
Tool v1.0" ) }}
```

The button component automatically adds:

- `data-event` attribute for hook-based tracking
- `onclick` handler that calls `window.Analytics.trackEvent()`
- Accessibility attributes preserved

**Manual tracking** (for non-button elements):

```html
<div class="section" data-section="tools">
  <a
    href="https://external.com"
    onclick="
    if (window.Analytics) {
      window.Analytics.trackExternalClick(this.href, {
        link_text: 'External Site',
        section: 'tools'
      });
    }
  "
  >
    External Link
  </a>
</div>
```

**JavaScript-only tracking** (for dynamic behavior):

```javascript
// Inside your feature code
document.getElementById('my-button').addEventListener('click', function () {
  // Your feature logic here

  // Then track the action
  if (typeof window.Analytics !== 'undefined') {
    window.Analytics.trackEvent('feature_action', {
      action_type: 'submit',
      form_name: 'contact_form',
    });
  }
});
```

### Checklist for Implementation

- [ ] **Add tracking to all interactive elements** (buttons, forms, links)
- [ ] **Use Analytics module** (`window.Analytics.trackEvent()`)
- [ ] **Add data attributes**:
  - `data-event="event_name"`
  - `data-event-label="label_text"`
  - `data-section="section_name"` on body element
- [ ] **Verify Analytics module exists**:
  ```javascript
  // Check in browser console
  console.log(typeof window.Analytics); // should be 'object'
  ```
- [ ] **Test in dev mode** (local testing)
  - Events should appear in console: `[Analytics] Tracking event:`
  - Check dataLayer in browser DevTools

### Integrate with Feature Flags

- [ ] **Add feature flag** to `data/feature-flags.toml`:
  ```toml
  [flags.my_new_feature]
  enabled = false
  description = "New feature X"
  rollout_percentage = 0
  ```
- [ ] **Feature flag check** in template:
  ```html
  {{ if eq (index site.Data.featureFlags.flags "my_new_feature").enabled true }}
  <!-- Feature rendering -->
  {{ end }}
  ```
- [ ] **Start with flag disabled** (safe deployment)

### References

- **Button component**: `layouts/partials/components/button.html` (handles
  tracking automatically)
- **Analytics module**: `static/js/analytics.js` (core tracking library)
- **Feature flags**: `data/feature-flags.toml` (enable/disable features)

---

## Phase 4: Validation

Verify implementation meets all requirements before shipping.

### Local Testing Checklist

- [ ] **Run test suite**:
  ```bash
  bun run test:e2e -- tests/feature-name.spec.ts
  ```
- [ ] **All tests pass** on all browsers (Chromium, Firefox, WebKit)
- [ ] **Analytics events appear** in browser console and DevTools Network tab
- [ ] **Feature flag disabled** (flag is off, feature hidden)
- [ ] **Build succeeds**:
  ```bash
  bun run build:path
  ```

### Analytics Verification

Using browser DevTools:

1. Open **Console** tab → scroll to `[Analytics]` messages
2. Open **Network** tab → search for `gtag` or `dataLayer` calls
3. Look for event payloads:
   ```javascript
   {
     event: "tool_download",
     label: "Tool Name",
     timestamp: "2025-11-24T12:30:45.123Z",
     page_path: "/tools/",
     page_title: "Tools | Site Name"
   }
   ```

### Cross-Browser Testing

Tests run automatically on Chromium, Firefox, and WebKit:

- [ ] **All platforms pass** (Ubuntu, Windows, macOS via GitHub Actions)
- [ ] **No browser-specific failures**
- [ ] **Performance acceptable** (page load < 3s)

### Code Review Checklist

- [ ] **Analytics events are mandatory** (not optional parameters)
- [ ] **Event names follow naming convention** (snake_case)
- [ ] **No hardcoded tracking calls** (use components/Analytics module)
- [ ] **Tests verify tracking** (not just feature behavior)
- [ ] **Feature flag properly configured** (disabled by default)

### Pre-Push Validation

The pre-push hook runs several automatic checks before code reaches the remote:

```bash
# This runs automatically on `git push`
1. bun run build:path         # Path-based tests and build
2. .github/scripts/validate-analytics.sh  # Analytics tracking validation
```

**It validates:**

- ✅ Test suite passes (all browsers)
- ✅ No TypeScript/lint errors
- ✅ **Analytics tracking on all interactive elements** (NEW)
- ✅ Feature flag syntax valid

**Analytics Validation Details**:

The analytics hook checks that all interactive HTML elements have proper
tracking:

**Elements that MUST have tracking:**

- `<button>` tags (all)
- `<a href="...">` tags (external links only)
- Elements with `role="button"`
- `<input type="submit">` tags
- Elements with `onclick` attribute

**Required attributes:**

- `data-event="event_name"` (snake_case)
- `data-event-label="human_readable_label"`

**OR**: Generated by `button.html` component (safe)

```html
{{ partial "components/button.html" (dict "trackingEvent" "event_name") }}
```

**Allowed exceptions** (no tracking needed):

- Internal navigation links: `<a href="/...">`
- Anchor links: `<a href="#...">`
- Disabled elements: `disabled` or `aria-disabled="true"`
- Hidden elements: `display:none`, `visibility:hidden`, `hidden` attribute
- Explicit opt-out: `<button data-no-track>...</button>`

**If validation fails:**

1. Add `data-event` and `data-event-label` attributes to interactive elements
2. OR use the `button.html` component with `trackingEvent` parameter
3. OR mark element as `data-no-track` if it's truly non-interactive
4. Retry: `git push`

**To bypass** (not recommended):

```bash
git push --no-verify
```

**To test validation manually:**

```bash
# Validate modified files
.github/scripts/validate-analytics.sh

# Validate entire project
.github/scripts/validate-analytics.sh all
```

---

## Phase 5: Feature Flag & Deployment

Roll out safely using staged enablement.

### Enable Feature Flag

Start with 0% rollout, gradually increase:

**Step 1: Staging (10%)**

```toml
[flags.my_new_feature]
enabled = true
rollout_percentage = 10
```

- Deploy to staging environment
- Monitor analytics events in real dashboards
- Verify no errors in server logs

**Step 2: Ramp (50%)**

```toml
[flags.my_new_feature]
enabled = true
rollout_percentage = 50
```

- Monitor performance metrics
- Check error rates stay normal
- Verify analytics data quality

**Step 3: Full Rollout (100%)**

```toml
[flags.my_new_feature]
enabled = true
rollout_percentage = 100
```

- All users have access
- Analytics should show meaningful user engagement
- Keep monitoring for 24 hours

### Deployment Process

1. **Create release request**:

   ```bash
   ./scripts/release.sh rc  # Release candidate
   ```

   Describes:
   - Features included in this release
   - Analytics events added
   - Any breaking changes

2. **Release controller runs** (automated via CI):
   - Updates `package.json` version
   - Builds Hugo site
   - Deploys to GitHub Pages
   - Creates git tag
   - Updates Beads issue

3. **Post-Deployment Monitoring**:
   - [ ] Check Google Analytics dashboard for events
   - [ ] Verify no JavaScript errors in browser console
   - [ ] Confirm feature appears as expected
   - [ ] Monitor error logs for 24 hours

### Rollback Procedure

If issues occur after deployment:

```bash
# Option 1: Disable feature flag (quick fix)
# Edit data/feature-flags.toml
[flags.my_new_feature]
enabled = false
rollout_percentage = 0
```

```bash
# Option 2: Full version rollback
git log --oneline | head -10      # Find previous working version
git revert <commit-sha>           # Revert the release
./scripts/release.sh hotfix       # Create hotfix release
```

---

## Example Workflows

### Example 1: Adding a Download Button to Tools Section

**Phase 1: Planning**

- Analytics event: `tool_download`
- Data: `tool_name`, `version`, `file_size`
- UI: New button on each tool card

**Phase 2: Testing** (tests/tools-download.spec.ts)

```typescript
test('download button tracks analytics event @analytics', async ({ page }) => {
  await page.goto('/tools/');

  // Trigger download tracking
  await page.evaluate(() => {
    window.Analytics.trackEvent('tool_download', {
      tool_name: 'My Tool',
      version: '1.0.0',
    });
  });

  // Verify event
  const events = await page.evaluate(() => {
    return (window as any).dataLayerEvents.filter(
      (e: any) => e.event === 'tool_download'
    );
  });

  expect(events.length).toBeGreaterThan(0);
});
```

**Phase 3: Implementation**

```html
{{ partial "components/button.html" (dict "text" "Download" "href"
"/download/tool.zip" "trackingEvent" "tool_download" "trackingLabel" .Title ) }}
```

**Phase 4: Validation**

- ✅ Tests pass on all browsers
- ✅ Events appear in Google Analytics
- ✅ Feature flag disabled
- ✅ Build succeeds

**Phase 5: Deployment**

- Enable flag at 10%, monitor for 1 hour
- Ramp to 50%, check data quality for 4 hours
- Full rollout (100%), monitor for 24 hours

### Example 2: Cookie Consent Banner (from pw-27)

**Key Pattern**: Feature-flagged component with full analytics integration.

See full example: `layouts/partials/components/cookie-consent.html`

**Analytics Events**:

- `cookie_consent` →
  `{ action: 'accept_all' | 'reject_non_essential' | 'open_preferences' }`

**Tests** (14 tests, 42 total with browser matrix):

- Banner visibility based on flag
- Consent choice storage
- Cross-session persistence
- Analytics integration
- Accessibility compliance

See: `tests/cookie-consent.spec.ts`

---

## Common Issues & Troubleshooting

| Issue                              | Cause                           | Solution                                                         |
| ---------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| **Analytics events not appearing** | dataLayer not initialized       | Check `window.dataLayer` exists before calling `trackEvent()`    |
| **Tests timing out**               | Page not fully loaded           | Add `await page.waitForLoadState('networkidle')`                 |
| **Event data missing**             | Event name or data format wrong | Verify naming convention: snake_case, correct properties in test |
| **Feature flag not working**       | Syntax error in TOML            | Validate TOML: `bun run validate`                                |
| **Cross-browser test fails**       | Browser-specific behavior       | Test individually: `--project=chromium` flag                     |
| **Rollout goes wrong**             | Insufficient monitoring         | Set flag to 0%, investigate, fix, re-enable slowly               |

---

## Component Reference

### Button Component (Automatic Tracking)

**File**: `layouts/partials/components/button.html`

Add tracking by passing parameters:

```html
{{ partial "components/button.html" (dict "text" "Click Me" "trackingEvent"
"button_click" "trackingLabel" "Hero CTA" ) }}
```

Generates:

- `data-event="button_click"`
- `data-event-label="Hero CTA"`
- `onclick` handler with `window.Analytics.trackEvent()`

### Analytics Module (Manual Tracking)

**File**: `static/js/analytics.js`

Available methods:

```javascript
window.Analytics.trackEvent(eventName, eventData); // Generic event
window.Analytics.trackSectionView(section); // Page section view
window.Analytics.trackExternalClick(url, context); // External link
window.Analytics.trackCTAClick(ctaText, ctaLocation); // CTA button
window.Analytics.trackNewsletterSignup(); // Newsletter signup
window.Analytics.trackSocialShare(network); // Social share
```

### Feature Flags

**File**: `data/feature-flags.toml`

Structure:

```toml
[flags.feature_name]
enabled = false
description = "What this feature does"
rollout_percentage = 0
```

Check in templates:

```html
{{ if eq (index site.Data.featureFlags.flags "feature_name").enabled true }}
<!-- Feature HTML -->
{{ end }}
```

---

## Related Documentation

- **[Testing Workflow](./TESTING_WORKFLOW.md)** — Complete E2E testing patterns
- **[Analytics Tracking Implementation](../../static/js/analytics.js)** — Module
  source code
- **[Feature Flags Configuration](../../data/feature-flags.toml)** — All
  available flags
- **[Cookie Consent Example](../../layouts/partials/components/cookie-consent.html)**
  — Full feature example

---

## Pre-Commit Hook Integration

The pre-push hook validates features before they reach git:

```bash
# Runs automatically on: git push
bun run build:path
```

**Validation includes:**

- ✅ E2E tests pass (all browsers)
- ✅ No TypeScript/lint errors
- ✅ Analytics events properly structured
- ✅ Feature flags have correct syntax
- ✅ Build succeeds without warnings

**If hook fails:**

```bash
# Fix issues locally, then retry
git push  # Hook will run again
```

---

## Success Checklist (Before Shipping)

- [ ] Analytics events identified in Phase 1
- [ ] E2E tests written and passing in Phase 2
- [ ] Tracking integrated into all components in Phase 3
- [ ] All validation checks pass in Phase 4
- [ ] Feature flag staged rollout in Phase 5
- [ ] Analytics dashboard shows real user data
- [ ] No errors in browser console or server logs
- [ ] Beads issue closed with completion notes
- [ ] Post-deployment monitoring completed (24 hours)

---

## Next Steps (After Feature Complete)

1. **Document analytics events** in feature description
2. **Create dashboard** in Google Analytics for new events
3. **Set up alerts** for anomalies (e.g., zero events after 1 hour)
4. **Schedule 1-week review** to assess user engagement
5. **Iterate** based on user behavior data
