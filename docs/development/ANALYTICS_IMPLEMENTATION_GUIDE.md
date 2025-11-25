# Analytics Implementation Guide

**Status**: ✅ **IMPLEMENTED** - Analytics patterns and implementation guide for
new features  
**Updated**: November 25, 2025  
**Issue**: [pw-xn4](https://github.com/pwarnock/pwarnock.github.io/issues/pw-xn4)  
**Related**:
[Feature Development Checklist](../development/FEATURE_DEVELOPMENT_CHECKLIST.md)
|
[Analytics Validation](../development/ANALYTICS_FEATURE_DEVELOPMENT_WORKFLOW.md)

---

## 🎯 **Implementation Summary**

The **Analytics Implementation Guide** provides **comprehensive patterns and
implementation guidance** for adding analytics to new features. This serves as
the definitive reference for developers to ensure consistent, effective
analytics tracking across all features.

### Key Features Implemented

1. **Standardized Event Patterns** - Consistent naming conventions and data
   structures
2. **Implementation Templates** - Ready-to-use code examples for common
   scenarios
3. **Component Integration** - Automatic tracking via existing components
4. **Testing Patterns** - E2E test templates for analytics validation
5. **Best Practices** - Performance, privacy, and data quality guidelines

---

## 📋 **Analytics Architecture Overview**

### 1. Data Flow Architecture

```
User Interaction → Component → Analytics Module → dataLayer → Google Analytics
```

**Components**:

- **Interactive Elements** - Buttons, links, forms with tracking attributes
- **Analytics Module** - `window.Analytics` for manual tracking
- **Data Layer** - `window.dataLayer` for GTM integration
- **Google Analytics** - Production analytics platform

### 2. Event Types

| Event Type             | Purpose                     | Examples                                                 |
| ---------------------- | --------------------------- | -------------------------------------------------------- |
| **User Actions**       | Track user interactions     | `button_click`, `link_click`, `form_submit`              |
| **Content Engagement** | Measure content consumption | `page_scroll`, `time_on_page`, `video_play`              |
| **Navigation**         | Track user journeys         | `page_view`, `section_view`, `search_query`              |
| **Conversion**         | Track goal completion       | `newsletter_signup`, `download_complete`, `contact_form` |
| **Error Tracking**     | Monitor issues              | `javascript_error`, `form_error`, `broken_link`          |

---

## 🔧 **Implementation Patterns**

### 1. Button Click Tracking

**Automatic Tracking (Recommended)**:

```html
{{ partial "components/button.html" (dict "text" "Download Tool" "href"
"/downloads/tool.zip" "trackingEvent" "tool_download" "trackingLabel" "Premium
Tool v1.0" "trackingData" (dict "tool_name" "Premium Tool" "version" "1.0.0") )
}}
```

**Manual Tracking**:

```html
<button
  data-event="tool_download"
  data-event-label="Premium Tool v1.0"
  onclick="window.Analytics.trackEvent('tool_download', {
    tool_name: 'Premium Tool',
    version: '1.0.0',
    file_size: '2.5MB'
  })"
>
  Download Tool
</button>
```

**Generated Output**:

```javascript
{
  event: 'tool_download',
  tool_name: 'Premium Tool',
  version: '1.0.0',
  file_size: '2.5MB',
  page_path: '/tools/premium-tool/',
  page_title: 'Premium Tool | Peter Warnock',
  timestamp: '2025-11-25T15:30:00.000Z'
}
```

### 2. Link Click Tracking

**External Links**:

```html
<a
  href="https://github.com/pwarnock"
  target="_blank"
  rel="noopener noreferrer"
  data-event="external_link_click"
  data-event-label="GitHub Profile"
  onclick="window.Analytics.trackExternalClick(this.href, {
     link_text: 'GitHub Profile',
     section: 'about'
   })"
>
  GitHub Profile
</a>
```

**Internal Navigation**:

```html
<a
  href="/blog/new-post"
  data-event="navigation_click"
  data-event-label="Blog Post: New Post"
  onclick="window.Analytics.trackEvent('navigation_click', {
     destination: '/blog/new-post',
     link_text: 'Blog Post: New Post',
     section: 'blog'
   })"
>
  Read New Post
</a>
```

### 3. Form Tracking

**Form Submission**:

```html
<form
  id="contact-form"
  onsubmit="window.Analytics.trackEvent('form_submit', {
        form_name: 'contact_form',
        form_type: 'contact'
      })"
>
  <!-- Form fields -->
  <button type="submit">Send Message</button>
</form>
```

**Form Validation Errors**:

```html
<script>
  document
    .getElementById('contact-form')
    .addEventListener('submit', function (e) {
      if (!this.checkValidity()) {
        window.Analytics.trackEvent('form_error', {
          form_name: 'contact_form',
          error_type: 'validation',
          field_errors: getValidationErrors(),
        });
      }
    });
</script>
```

### 4. Content Engagement Tracking

**Scroll Depth Tracking**:

```html
<script>
  // Track when user scrolls to 50% and 90% of page
  window.addEventListener('scroll', function () {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercent === 50 && !window.scroll50Tracked) {
      window.Analytics.trackEvent('page_scroll', {
        scroll_depth: 50,
        page_type: 'blog_post',
      });
      window.scroll50Tracked = true;
    }

    if (scrollPercent === 90 && !window.scroll90Tracked) {
      window.Analytics.trackEvent('page_scroll', {
        scroll_depth: 90,
        page_type: 'blog_post',
      });
      window.scroll90Tracked = true;
    }
  });
</script>
```

**Time on Page Tracking**:

```html
<script>
  // Track time spent on page
  let startTime = Date.now();
  let timeTracked = false;

  window.addEventListener('beforeunload', function () {
    if (!timeTracked) {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      window.Analytics.trackEvent('time_on_page', {
        time_seconds: timeOnPage,
        page_type: 'blog_post',
        engagement_level:
          timeOnPage > 60 ? 'high' : timeOnPage > 30 ? 'medium' : 'low',
      });
      timeTracked = true;
    }
  });
</script>
```

---

## 🧩 **Component Integration**

### 1. Button Component

**Usage**:

```html
{{ partial "components/button.html" (dict "text" "Click Me" "href"
"/destination" "style" "primary" "trackingEvent" "cta_click" "trackingLabel"
"Hero CTA Button" "trackingData" (dict "section" "hero" "variant" "A") ) }}
```

**Available Parameters**:

- `trackingEvent` - Event name (required for tracking)
- `trackingLabel` - Human-readable label
- `trackingData` - Additional data object (optional)

**Generated HTML**:

```html
<button
  class="btn btn-primary"
  data-event="cta_click"
  data-event-label="Hero CTA Button"
  onclick="window.Analytics.trackEvent('cta_click', {
          section: 'hero',
          variant: 'A'
        })"
>
  Click Me
</button>
```

### 2. Card Component

**Usage**:

```html
{{ partial "components/card.html" (dict "title" "Tool Name" "description" "Tool
description" "link" "/tools/tool-name" "trackingEvent" "tool_card_click"
"trackingLabel" "Tool Name Card" ) }}
```

### 3. Navigation Component

**Usage**:

```html
{{ partial "components/nav-item.html" (dict "url" "/about" "title" "About"
"trackingEvent" "navigation_click" "trackingLabel" "About Page" "trackingData"
(dict "menu" "header" "position" 2) ) }}
```

---

## 🧪 **Testing Patterns**

### 1. E2E Test Template

**Basic Event Tracking Test**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Analytics Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Set up dataLayer spy
    await page.addInitScript(() => {
      (window as any).dataLayerEvents = [];
      (window as any).dataLayer = (window as any).dataLayer || [];
      const originalPush = (window as any).dataLayer.push;
      (window as any).dataLayer.push = function (...args: any[]) {
        (window as any).dataLayerEvents.push(...args);
        return originalPush.apply(this, args);
      };

      // Mock Analytics module
      (window as any).Analytics = {
        trackEvent: function (eventName: string, eventData: any = {}) {
          (window as any).dataLayer?.push({ event: eventName, ...eventData });
        },
      };
    });
  });

  test('button click triggers analytics event', async ({ page }) => {
    await page.goto('/page-with-feature');

    // Click the tracked button
    await page.click('[data-event="button_click"]');

    // Verify event in dataLayer
    const events = await page.evaluate(() => {
      return (window as any).dataLayerEvents.filter(
        (e: any) => e.event === 'button_click'
      );
    });

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toMatchObject({
      event: 'button_click',
      button_text: 'Click Me',
    });
  });
});
```

### 2. Component Integration Test

```typescript
test('button component tracks events correctly', async ({ page }) => {
  await page.goto('/page-with-button-component');

  // Click button component
  await page.click('button[data-event="cta_click"]');

  // Verify tracking data
  const events = await page.evaluate(() => {
    return (window as any).dataLayerEvents.filter(
      (e: any) => e.event === 'cta_click'
    );
  });

  expect(events[0]).toMatchObject({
    event: 'cta_click',
    section: 'hero',
    variant: 'A',
  });
});
```

### 3. Form Tracking Test

```typescript
test('form submission tracks analytics', async ({ page }) => {
  await page.goto('/contact');

  // Fill and submit form
  await page.fill('#name', 'Test User');
  await page.fill('#email', 'test@example.com');
  await page.click('#submit-button');

  // Verify form submission event
  const events = await page.evaluate(() => {
    return (window as any).dataLayerEvents.filter(
      (e: any) => e.event === 'form_submit'
    );
  });

  expect(events.length).toBe(1);
  expect(events[0]).toMatchObject({
    event: 'form_submit',
    form_name: 'contact_form',
    form_type: 'contact',
  });
});
```

---

## 📊 **Event Naming Conventions**

### 1. Naming Rules

**Format**: `snake_case` (lowercase with underscores)

**Pattern**: `action_object` or `section_action`

**Examples**:

- ✅ `button_click`
- ✅ `tool_download`
- ✅ `form_submit`
- ✅ `page_scroll`
- ✅ `external_link_click`

**Avoid**:

- ❌ `buttonClick` (camelCase)
- ❌ `Button_Click` (PascalCase)
- ❌ `button-click` (kebab-case)
- ❌ `BUTTON_CLICK` (UPPER_CASE)

### 2. Standard Event Names

| Category         | Event Names                                     | Description        |
| ---------------- | ----------------------------------------------- | ------------------ |
| **User Actions** | `button_click`, `link_click`, `form_submit`     | User interactions  |
| **Content**      | `page_scroll`, `time_on_page`, `video_play`     | Content engagement |
| **Navigation**   | `page_view`, `section_view`, `search_query`     | User navigation    |
| **Conversion**   | `newsletter_signup`, `download_complete`        | Goal completion    |
| **Errors**       | `javascript_error`, `form_error`, `broken_link` | Error tracking     |

### 3. Data Property Standards

**Required Properties**:

- `event` - Event name (string)
- `page_path` - Current page path (auto-added)
- `page_title` - Current page title (auto-added)
- `timestamp` - Event timestamp (auto-added)

**Common Properties**:

- `section` - Page section (string)
- `button_text` - Button text (string)
- `link_text` - Link text (string)
- `form_name` - Form identifier (string)
- `tool_name` - Tool name (string)
- `destination` - Navigation destination (string)

---

## 🔒 **Privacy and Compliance**

### 1. Data Collection Guidelines

**Allowed Data**:

- ✅ User interactions (clicks, scrolls, form submissions)
- ✅ Page navigation and content engagement
- ✅ Technical information (browser, device)
- ✅ Anonymous user identifiers

**Prohibited Data**:

- ❌ Personal information (names, emails, phone numbers)
- ❌ Sensitive information (passwords, credit cards)
- ❌ Location data (GPS coordinates)
- ❌ Personal identifiers (SSN, government IDs)

### 2. Cookie Consent Integration

**Cookie Consent Check**:

```javascript
// Only track if user has consented
function trackWithConsent(eventName, data) {
  if (window.CookieConsent && window.CookieConsent.hasConsent()) {
    window.Analytics.trackEvent(eventName, data);
  } else {
    console.log('Analytics blocked: No consent given');
  }
}
```

**Consent Categories**:

- **Essential**: Required for site functionality
- **Analytics**: Website analytics and performance
- **Marketing**: Advertising and personalization
- **Social**: Social media integration

### 3. Data Retention

**Retention Periods**:

- **User Interactions**: 26 months
- **Page Views**: 26 months
- **Error Data**: 13 months
- **Form Data**: Never store personal information

**Data Anonymization**:

- IP addresses anonymized
- User IDs randomized
- Location data generalized
- Personal information excluded

---

## ⚡ **Performance Optimization**

### 1. Event Batching

**Batch Multiple Events**:

```javascript
// Batch events to reduce network calls
const eventBatch = [];
let batchTimeout = null;

function batchEvent(eventName, data) {
  eventBatch.push({ event: eventName, ...data });

  if (batchTimeout) clearTimeout(batchTimeout);

  batchTimeout = setTimeout(() => {
    if (eventBatch.length > 0) {
      eventBatch.forEach(event => {
        window.dataLayer.push(event);
      });
      eventBatch.length = 0;
    }
  }, 1000); // Batch for 1 second
}
```

### 2. Lazy Loading

**Load Analytics on Demand**:

```javascript
// Only load analytics when user interacts
let analyticsLoaded = false;

function loadAnalytics() {
  if (!analyticsLoaded) {
    // Load Google Analytics
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SKDDM2GBXN';
    script.async = true;
    document.head.appendChild(script);

    analyticsLoaded = true;
  }
}

// Load on first user interaction
document.addEventListener('click', loadAnalytics, { once: true });
document.addEventListener('scroll', loadAnalytics, { once: true });
```

### 3. Conditional Tracking

**Environment-Based Tracking**:

```javascript
// Only track in production
const isProduction = window.location.hostname === 'peterwarnock.com';

function trackEvent(eventName, data) {
  if (isProduction) {
    window.dataLayer.push({ event: eventName, ...data });
  } else {
    console.log('Analytics:', eventName, data); // Debug in development
  }
}
```

---

## 📈 **Analytics Dashboard Setup**

### 1. Google Analytics Configuration

**Custom Events**:

- Go to **Admin → Events → Create Event**
- Configure event name matching
- Set up conversion tracking
- Create custom dimensions

**Custom Dimensions**: | Dimension | Scope | Description |
|-----------|-------|-------------| | `page_section` | Hit | Page section where
event occurred | | `button_text` | Hit | Text of clicked button | | `form_name`
| Hit | Identifier for submitted form | | `tool_category` | Hit | Category of
downloaded tool |

### 2. Goals and Conversions

**Goal Setup**:

1. **Newsletter Signup**: Event `newsletter_signup`
2. **Tool Download**: Event `tool_download`
3. **Contact Form**: Event `form_submit` with `form_name: 'contact'`
4. **Page Engagement**: Event `time_on_page` with `engagement_level: 'high'`

**Conversion Tracking**:

- Set up goal values for business metrics
- Configure funnel visualization
- Set up attribution modeling
- Create custom reports

### 3. Custom Reports

**Event Report**:

- **Dimension**: Event Name
- **Metrics**: Total Events, Unique Events, Event Value
- **Filters**: Exclude internal traffic

**Content Report**:

- **Dimension**: Page Path
- **Metrics**: Page Views, Avg. Time on Page, Bounce Rate
- **Secondary Dimension**: Event Name

**Conversion Report**:

- **Dimension**: Source/Medium
- **Metrics**: Conversions, Conversion Rate
- **Secondary Dimension**: Goal Completion Location

---

## 🔍 **Debugging and Troubleshooting**

### 1. Debug Mode

**Enable Debug Logging**:

```javascript
// Enable debug mode in development
window.Analytics.debug = true;

// This will log all events to console
window.Analytics.trackEvent('test_event', { test: true });
// Console: [Analytics] Tracking event: test_event { test: true }
```

**Chrome DevTools**:

1. Open **Console** tab
2. Filter by `[Analytics]` messages
3. Check `window.dataLayer` contents
4. Monitor Network tab for GA requests

### 2. Common Issues

**Events Not Appearing**:

```javascript
// Check if dataLayer exists
console.log('dataLayer exists:', typeof window.dataLayer !== 'undefined');

// Check if Analytics module exists
console.log('Analytics exists:', typeof window.Analytics !== 'undefined');

// Check dataLayer contents
console.log('dataLayer contents:', window.dataLayer);
```

**Incorrect Event Names**:

```javascript
// Verify event naming convention
function validateEventName(eventName) {
  const isValid = /^[a-z][a-z0-9_]*$/.test(eventName);
  if (!isValid) {
    console.error('Invalid event name:', eventName);
    console.log('Use snake_case: action_object or section_action');
  }
  return isValid;
}
```

**Missing Data Properties**:

```javascript
// Validate required properties
function validateEventData(eventData) {
  const required = ['event', 'page_path', 'timestamp'];
  const missing = required.filter(prop => !eventData[prop]);

  if (missing.length > 0) {
    console.error('Missing required properties:', missing);
  }

  return missing.length === 0;
}
```

### 3. Testing Checklist

**Before Deployment**:

- [ ] All events use snake_case naming
- [ ] Required properties are included
- [ ] No personal information is tracked
- [ ] Events fire correctly in browser
- [ ] Data appears in Google Analytics
- [ ] Cookie consent is respected
- [ ] Performance impact is minimal

**After Deployment**:

- [ ] Events appear in real-time reports
- [ ] Custom dimensions are populated
- [ ] Goals are tracking conversions
- [ ] No JavaScript errors in console
- [ ] Site performance is unaffected

---

## 📚 **Reference Examples**

### 1. Complete Feature Implementation

**Blog Post with Analytics**:

```html
{{ partial "head.html" . }}

<body data-section="blog">
  <article>
    <h1>{{ .Title }}</h1>
    <div class="content">
      {{ .Content }}
    </div>

    <!-- CTA Button -->
    {{ partial "components/button.html" (dict
      "text" "Subscribe to Newsletter"
      "href" "#newsletter"
      "trackingEvent" "newsletter_click"
      "trackingLabel" "Blog Post CTA"
      "trackingData" (dict "post_title" .Title "post_category" .Params.category)
    ) }}

    <!-- Social Share -->
    <div class="social-share">
      {{ partial "components/social-button.html" (dict
        "platform" "twitter"
        "url" .Permalink
        "title" .Title
        "trackingEvent" "social_share"
        "trackingLabel" "Twitter Share"
        "trackingData" (dict "platform" "twitter" "content_type" "blog_post")
      ) }}
    </div>
  </article>

  <!-- Scroll tracking script -->
  <script>
  let scrollTracked = { 25: false, 50: false, 75: false, 90: false };

  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );

    Object.keys(scrollTracked).forEach(depth => {
      if (scrollPercent >= parseInt(depth) && !scrollTracked[depth]) {
        window.Analytics.trackEvent('page_scroll', {
          scroll_depth: parseInt(depth),
          page_type: 'blog_post',
          post_title: '{{ .Title }}'
        });
        scrollTracked[depth] = true;
      }
    });
  });
  </script>
</body>
</html>
```

### 2. Tool Page with Download Tracking

```html
{{ partial "head.html" . }}

<body data-section="tools">
  <main>
    <h1>{{ .Title }}</h1>
    <p>{{ .Description }}</p>

    <!-- Download Button -->
    {{ partial "components/button.html" (dict
      "text" "Download Tool"
      "href" .Params.download_url
      "trackingEvent" "tool_download"
      "trackingLabel" .Title
      "trackingData" (dict
        "tool_name" .Title
        "tool_category" .Params.category
        "file_size" .Params.file_size
        "version" .Params.version
      )
    ) }}

    <!-- Documentation Link -->
    <a href="{{ .Params.docs_url }}"
       target="_blank"
       data-event="documentation_click"
       data-event-label="Tool Documentation"
       onclick="window.Analytics.trackExternalClick(this.href, {
         tool_name: '{{ .Title }}',
         link_type: 'documentation'
       })">
      View Documentation
    </a>
  </main>
</body>
</html>
```

---

## 🔗 **Related Documentation**

### Core Documentation

- **[Feature Development Checklist](../development/FEATURE_DEVELOPMENT_CHECKLIST.md)** -
  Complete 5-phase workflow
- **[Analytics Validation](../development/ANALYTICS_FEATURE_DEVELOPMENT_WORKFLOW.md)** -
  Validation and enforcement
- **[Component Library](../development/COMPONENT_LIBRARY.md)** - Available
  components with tracking

### Technical Documentation

- **[Analytics Module](../../static/js/analytics.js)** - Core tracking library
- **[Feature Flags](../../data/feature-flags.toml)** - Analytics feature
  configuration
- **[Testing Patterns](../development/TESTING_WORKFLOW.md)** - E2E testing for
  analytics

### Operational Documentation

- **[Google Analytics Setup](./GOOGLE_ANALYTICS_SETUP.md)** - GA configuration
  guide
- **[Privacy Compliance](./PRIVACY_COMPLIANCE.md)** - GDPR and privacy
  guidelines
- **[Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)** - Analytics
  performance tips

---

## ✅ **Completion Status**

**Issue**:
[pw-xn4](https://github.com/pwarnock/pwarnock.github.io/issues/pw-xn4) -
**COMPLETED**

### Deliverables Completed

1. ✅ **Analytics Implementation Guide** - Comprehensive patterns and examples
2. ✅ **Event Naming Conventions** - Standardized naming rules and examples
3. ✅ **Component Integration** - Automatic tracking via existing components
4. ✅ **Testing Patterns** - E2E test templates for analytics validation
5. ✅ **Best Practices** - Performance, privacy, and data quality guidelines

### Implementation Coverage

- ✅ **Button Tracking** - Automatic and manual tracking patterns
- ✅ **Link Tracking** - Internal and external link tracking
- ✅ **Form Tracking** - Submission and validation error tracking
- ✅ **Content Engagement** - Scroll depth and time on page tracking
- ✅ **Privacy Compliance** - GDPR compliance and data protection

### Developer Resources

- ✅ **Code Templates** - Ready-to-use implementation examples
- ✅ **Testing Templates** - E2E test patterns for validation
- ✅ **Debugging Guide** - Troubleshooting common issues
- ✅ **Performance Tips** - Optimization techniques and best practices

### Next Steps

1. **Developer Training** - Conduct training sessions on analytics
   implementation
2. **Template Library** - Create reusable analytics component templates
3. **Automation Tools** - Develop tools for automated analytics testing
4. **Monitoring Dashboard** - Set up analytics health monitoring

---

## 🎉 **Conclusion**

The **Analytics Implementation Guide** is now **fully implemented** and provides
**comprehensive patterns and implementation guidance** for adding analytics to
new features. This ensures:

- **Consistent Implementation** - Standardized patterns across all features
- **Developer-Friendly** - Clear examples and ready-to-use templates
- **Quality Assurance** - Testing patterns and validation procedures
- **Privacy Compliant** - GDPR-compliant data collection practices
- **Performance Optimized** - Efficient tracking with minimal impact

This implementation establishes a **professional analytics framework** that
enables data-driven decision making while maintaining user privacy and site
performance.

**Status**: ✅ **COMPLETE** - Ready for developer use
