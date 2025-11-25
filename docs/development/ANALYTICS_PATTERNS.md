# Analytics Implementation Patterns

**Reference**: [FEATURE_DEVELOPMENT_CHECKLIST.md](./FEATURE_DEVELOPMENT_CHECKLIST.md) | [Analytics Module](../../static/js/analytics.js) | [Testing Examples](../../tests/analytics-tracking.spec.ts)

This guide provides canonical patterns for implementing analytics tracking across the project.

---

## Quick Reference

### Pattern 1: Button with Tracking (Most Common)

```html
{{ partial "components/button.html" (dict
  "text" "Download"
  "href" "/downloads/tool.zip"
  "trackingEvent" "tool_download"
  "trackingLabel" "My Tool v1.0"
) }}
```

**What happens**:
- Button component adds `data-event="tool_download"` attribute
- Button component adds `onclick` handler that calls `window.Analytics.trackEvent()`
- Event payload includes label, page path, and timestamp automatically
- No additional manual work needed

**When to use**: Any button, link, or CTA with user interaction tracking

---

### Pattern 2: Data Attributes (When Not Using Button Component)

```html
<a href="https://external.com" 
   data-event="external_link_click"
   data-event-label="External Resource">
  External Link
</a>
```

**What happens**:
- Analytics module auto-detects external link clicks (script hook in `analytics.js` line 100-115)
- Automatically sends event to dataLayer with link text and section
- No onclick handler needed

**When to use**: Links, buttons, or elements where you can't use the button component

---

### Pattern 3: Manual JavaScript Tracking

```html
<button onclick="
  // Your feature logic here
  doSomething();
  
  // Then track the event
  if (window.Analytics) {
    window.Analytics.trackEvent('feature_action', {
      action_type: 'submit',
      form_name: 'contact_form'
    });
  }
">
  Submit
</button>
```

**What happens**:
- `window.Analytics` object is available globally after page load
- `trackEvent()` method sends event to GTM dataLayer
- All events include automatic properties: `timestamp`, `page_path`, `page_title`

**When to use**: Dynamic behavior, form submissions, or complex interactions

---

## Event Naming Convention

All event names follow **snake_case** with this pattern:

```
{action}_{object}  or  {section}_{action}
```

### Examples

**Action + Object**:
- `button_click` - Generic button click
- `tool_download` - Download button in tools section
- `link_click` - Any link
- `form_submit` - Form submission

**Section + Action**:
- `blog_view` - Page view in blog section
- `portfolio_filter` - Filter interaction in portfolio
- `newsletter_signup` - Newsletter signup form

**Custom Events**:
- `cta_click` - Call-to-action click
- `social_share` - Social sharing
- `external_link_click` - External link click (auto-tracked)

### Best Practices

✅ **Good**:
- `tool_download`
- `newsletter_signup`
- `external_link_click`
- `cta_click_hero`

❌ **Avoid**:
- `download` (too generic)
- `clicked` (vague action)
- `toolDownload` (use snake_case)
- `user_tool_download_click` (too verbose)

---

## Event Data Structure

Every event has this structure:

```javascript
{
  event: "event_name",           // Required: snake_case event name
  label: "Button Text",          // Optional: user-facing label
  section: "tools",              // Optional: page section
  timestamp: "2025-11-25T...",   // Automatic: ISO timestamp
  page_path: "/blog/",           // Automatic: current path
  page_title: "Blog Post Title"   // Automatic: page title
}
```

### Common Properties

| Property | Type | Source | Example |
|----------|------|--------|---------|
| `event` | string | Required | `tool_download` |
| `label` | string | data-event-label attr | `"My Tool v1.0"` |
| `section` | string | body data-section | `"tools"` |
| `timestamp` | ISO string | Auto-generated | `2025-11-25T18:30:45Z` |
| `page_path` | string | Auto-extracted | `/tools/` |
| `page_title` | string | Auto-extracted | `Tools - Peter Warnock` |

### Custom Properties

Add custom properties by passing a data object:

```javascript
window.Analytics.trackEvent('tool_download', {
  tool_name: 'My Tool',
  version: '1.0.0',
  file_size: '5.2MB'
});
```

Resulting event in dataLayer:

```javascript
{
  event: 'tool_download',
  tool_name: 'My Tool',
  version: '1.0.0',
  file_size: '5.2MB',
  timestamp: '2025-11-25T18:30:45Z',
  page_path: '/tools/',
  page_title: 'Tools - Peter Warnock'
}
```

---

## Implementation Workflow

### Step 1: Plan Events (Before Coding)

Create an analytics spec:

```markdown
## Feature: Newsletter Signup

| Event | Trigger | Data |
|-------|---------|------|
| `newsletter_signup` | Form submit | email, source |
| `newsletter_error` | Validation fails | error_type |
```

Add this to your Beads issue description.

### Step 2: Add Tests (TDD)

```typescript
test('newsletter signup tracks event @analytics', async ({ page }) => {
  await page.goto('/');
  
  // Trigger signup
  await page.evaluate(() => {
    window.Analytics?.trackEvent('newsletter_signup', {
      email: 'test@example.com',
      source: 'footer'
    });
  });
  
  // Verify in dataLayer
  const events = await page.evaluate(() => {
    return (window as any).dataLayerEvents.filter(
      (e: any) => e.event === 'newsletter_signup'
    );
  });
  
  expect(events.length).toBeGreaterThan(0);
  expect(events[0].email).toBe('test@example.com');
});
```

### Step 3: Implement with Tracking

**Option A: Button component** (recommended):

```html
{{ partial "components/button.html" (dict
  "text" "Subscribe"
  "trackingEvent" "newsletter_signup"
  "trackingLabel" "Footer Newsletter"
) }}
```

**Option B: Data attributes**:

```html
<button 
  data-event="newsletter_signup"
  data-event-label="Footer Newsletter"
  onclick="submitNewsletter()">
  Subscribe
</button>
```

**Option C: JavaScript**:

```javascript
document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.email.value;
  
  // Submit form
  submitNewsletter(email).then(() => {
    // Track the event
    if (window.Analytics) {
      window.Analytics.trackEvent('newsletter_signup', {
        email: email,
        source: 'footer'
      });
    }
  });
});
```

### Step 4: Test Locally

```bash
# Run tests
bun run test:e2e -- tests/newsletter.spec.ts

# View events in console (look for "[Analytics] Tracking event:" messages)
# Open DevTools → Application → dataLayer (if GTM is configured)
```

### Step 5: Validate Pre-Push

```bash
# Pre-push hook automatically runs:
git push

# Or run manually:
.github/scripts/validate-analytics.sh
```

---

## Feature-Flagged Features with Analytics

For features disabled by default, ensure analytics module is injected in tests:

```typescript
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // Inject Analytics module for test environment
    if (typeof (window as any).Analytics === 'undefined') {
      (window as any).Analytics = {
        trackEvent: function(eventName: string, eventData: any = {}) {
          (window as any).dataLayer?.push({ 
            event: eventName, 
            ...eventData 
          });
        }
      };
    }
  });
});
```

Set up dataLayer spy in beforeEach:

```typescript
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).dataLayerEvents = [];
    (window as any).dataLayer = (window as any).dataLayer || [];
    const originalPush = (window as any).dataLayer.push;
    (window as any).dataLayer.push = function(...args: any[]) {
      (window as any).dataLayerEvents.push(...args);
      return originalPush.apply(this, args);
    };
  });
});
```

See full example: [tests/analytics-tracking.spec.ts](../../tests/analytics-tracking.spec.ts)

---

## Common Patterns by Feature Type

### External Links

**Pattern**: Auto-tracked by analytics.js line 100-115

```html
<a href="https://external.com" data-event="external_link_click">
  External Link
</a>
```

**Auto-collected data**:
- `url`: the href
- `link_text`: the button/link text
- `section`: body data-section attribute
- `target`: link target attribute (e.g., "_blank")

No onclick handler needed.

### Forms

**Pattern**: Track on submit

```html
<form onsubmit="
  if (window.Analytics) {
    window.Analytics.trackEvent('contact_form_submit', {
      form_name: 'contact',
      fields: ['name', 'email', 'message']
    });
  }
  return true;
">
  <!-- form fields -->
</form>
```

### Page Sections

**Pattern**: Auto-tracked on page load

Add to body tag in templates:

```html
<body data-section="blog">
```

Analytics module (line 92-97) automatically tracks:

```javascript
window.addEventListener('load', function() {
  const section = document.body.getAttribute('data-section');
  if (section) {
    Analytics.trackSectionView(section);
  }
});
```

This sends event: `{ event: 'blog_view', section: 'blog' }`

### CTAs (Call-to-Action)

**Pattern**: Use button component

```html
{{ partial "components/button.html" (dict
  "text" "Get In Touch"
  "href" "/contact/"
  "trackingEvent" "cta_click"
  "trackingLabel" "Hero CTA"
) }}
```

Or manual tracking:

```javascript
window.Analytics.trackCTAClick('Get In Touch', 'Hero');
```

---

## Analytics Validation Hook

The pre-push hook validates all interactive elements have tracking:

**Required attributes**:
- `data-event="event_name"` - Event name
- `data-event-label="label"` - User-facing label

**Exception patterns** (auto-excluded):
- Internal navigation: `href="/..."`
- Anchor links: `href="#..."`
- Disabled elements: `disabled` or `aria-disabled="true"`
- Hidden elements: `display:none`, `visibility:hidden`, `hidden`
- Explicit opt-out: `data-no-track` attribute
- Navigation menus: `role="none"`

**Bypass** (if needed):
```bash
git push --no-verify  # Not recommended
```

---

## Analytics Module API Reference

See [static/js/analytics.js](../../static/js/analytics.js) for full implementation.

### Methods

```javascript
// Generic event tracking
window.Analytics.trackEvent(eventName, eventData)

// Section view (auto-called on page load)
window.Analytics.trackSectionView(section)

// External link click (auto-called on link click)
window.Analytics.trackExternalClick(url, context)

// CTA click
window.Analytics.trackCTAClick(ctaText, ctaLocation)

// Newsletter signup
window.Analytics.trackNewsletterSignup()

// Social share
window.Analytics.trackSocialShare(network)
```

### Example

```javascript
// Track custom event
window.Analytics.trackEvent('feature_interaction', {
  feature_name: 'tool_filter',
  filter_type: 'language',
  value: 'go'
});

// Track CTA click
window.Analytics.trackCTAClick('Download Now', 'Hero Section');

// Track social share
window.Analytics.trackSocialShare('twitter');
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Events not appearing | dataLayer not initialized | Ensure `window.dataLayer` exists (GTM configured) |
| Hook validation fails | Missing data-event attrs | Add `data-event` and `data-event-label` to interactive elements |
| Tests not capturing events | Analytics not injected | Use `page.addInitScript()` to inject for test env |
| Event data missing | Wrong property names | Check event object structure matches expected format |
| Hook ignores file | File excluded by pattern | Check skip logic in validate-analytics.sh (line 159-187) |
| Async events not captured | Events fire after page unload | Add `await page.waitForLoadState('networkidle')` |

---

## Related Documentation

- **[Feature Development Checklist](./FEATURE_DEVELOPMENT_CHECKLIST.md)** — Full 5-phase workflow
- **[Testing Workflow](./TESTING_WORKFLOW.md)** — E2E test patterns
- **[Analytics Module Source](../../static/js/analytics.js)** — Full implementation
- **[Button Component](../../layouts/partials/components/button.html)** — Automatic tracking
- **[Example: Cookie Consent](../../layouts/partials/components/cookie-consent.html)** — Complete feature
- **[E2E Test Examples](../../tests/analytics-tracking.spec.ts)** — Working test patterns

---

## Quick Checklist for New Features

- [ ] **Plan**: Identify events to track (Event Planning in checklist Phase 1)
- [ ] **Test**: Write E2E tests with dataLayer spy (Testing in Phase 2)
- [ ] **Implement**: Add tracking via button component or data attributes (Phase 3)
- [ ] **Validate**: Run `git push` to trigger hook validation (Phase 4)
- [ ] **Document**: Add analytics spec to Beads issue
- [ ] **Deploy**: Feature flag disabled by default, staged rollout (Phase 5)

---

**Last Updated**: November 2025
