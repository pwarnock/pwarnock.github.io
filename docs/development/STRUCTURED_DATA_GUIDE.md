# Structured Data Implementation Guide

This guide documents the structured data (schema.org) implementation for SEO and
thought leadership signals.

## Overview

The site implements comprehensive structured data to improve search engine
understanding and enable rich snippets. All schemas are data-driven and
conditionally included based on page parameters.

## Available Schema Types

### 1. Article Schema

**File**: `layouts/partials/head/structured-data.html`  
**Trigger**: `{{ if eq .Type "blog" }}`  
**Purpose**: Blog posts with author, date, and publisher information

**Frontmatter Support**:

```yaml
tags: ['tag1', 'tag2']
featured_image: '/images/blog-post.jpg'
```

**Generated Fields**:

- `@type`: "Article"
- `headline`: Page title
- `description`: Page description/summary
- `image`: Featured image with fallback
- `datePublished`: Publication date
- `dateModified`: Last modified date
- `author`: Person schema for Peter Warnock
- `publisher`: Organization schema
- `mainEntityOfPage`: URL reference
- `wordCount`: Hugo word count
- `keywords`: Tags array
- `inLanguage`: Site language code

### 2. TechArticle Schema

**File**: `layouts/partials/head/structured-data.html`  
**Trigger**: `{{ if or (eq .Type "portfolio") (eq .Type "tools") }}`  
**Purpose**: Technical content with programming and educational details

**Frontmatter Support**:

```yaml
technologies: ['JavaScript', 'React', 'Node.js']
category: 'Web Development'
skills: ['Frontend', 'Backend', 'API Design']
```

**Generated Fields**:

- `@type`: "TechArticle"
- `programmingLanguage`: Technologies array
- `about`: Content category
- `educationalLevel`: "Intermediate to Advanced"
- `learningResourceType`: "Tutorial"
- `teaches`: Skills array

### 3. Organization Schema

**File**: `layouts/partials/head/structured-data.html`  
**Trigger**: Integrated with Person and WebSite schemas  
**Purpose**: Professional credibility and company information

**Organization Details**:

- Name: "Peter Warnock Consulting"
- Service catalog with Cloud Architecture, DevOps Transformation, Technical
  Leadership
- Contact point with language support
- Logo and professional details

### 4. BreadcrumbList Schema

**File**: `layouts/partials/head/breadcrumb-schema.html`  
**Trigger**: `{{ if not .Params.hideBreadcrumbs }}`  
**Purpose**: Navigation hierarchy and site structure

**Features**:

- Dynamic breadcrumb generation based on page hierarchy
- Section mapping (posts → blog)
- Proper position numbering
- Conditional inclusion with `hideBreadcrumbs` parameter

### 5. FAQ Schema

**File**: `layouts/partials/head/faq-schema.html`  
**Trigger**: `{{ if .Params.faq }}`  
**Purpose**: Q&A sections with question-answer pairs

**Frontmatter Support**:

```yaml
faq:
  - question: 'What is cloud engineering?'
    answer:
      'Cloud engineering involves designing and managing cloud infrastructure...'
  - question: 'How do I get started with DevOps?'
    answer: 'Start by understanding CI/CD pipelines and automation...'
```

**Generated Fields**:

- `@type`: "FAQPage"
- `mainEntity`: Array of Question/Answer objects

### 6. HowTo Schema

**File**: `layouts/partials/head/howto-schema.html`  
**Trigger**: `{{ if .Params.howto }}`  
**Purpose**: Step-by-step guides and instructional content

**Frontmatter Support**:

```yaml
howto:
  title: 'How to Deploy a Hugo Site'
  description: 'Complete guide to deploying Hugo sites'
  image: '/images/hugo-deployment.jpg'
  total_time: 'PT30M'
  estimated_cost: '0'
  supplies: ['Hugo', 'Git', 'Hosting account']
  tools: ['Terminal', 'Text editor']
  steps:
    - name: 'Install Hugo'
      description: 'Download and install Hugo for your platform'
      image: '/images/hugo-install.jpg'
    - name: 'Create Site'
      description: 'Generate a new Hugo site'
      url: 'https://gohugo.io/getting-started/quick-start/'
```

**Generated Fields**:

- `@type`: "HowTo"
- `totalTime`: ISO 8601 duration format
- `estimatedCost`: Monetary amount
- `supply`: Required supplies array
- `tool`: Required tools array
- `step`: Array of HowToStep objects

### 7. Event Schema

**File**: `layouts/partials/head/event-schema.html`  
**Trigger**: `{{ if .Params.event }}`  
**Purpose**: Speaking engagements, conferences, and presentations

**Frontmatter Support**:

```yaml
event:
  name: 'Cloud Architecture Workshop'
  description: 'Hands-on workshop on cloud architecture patterns'
  start_date: '2024-03-15T09:00:00-07:00'
  end_date: '2024-03-15T17:00:00-07:00'
  status: 'https://schema.org/EventScheduled'
  attendance_mode: 'https://schema.org/OfflineEventAttendanceMode'
  location:
    name: 'Tech Conference Center'
    address:
      street: '123 Tech Street'
      city: 'San Francisco'
      state: 'CA'
      postal_code: '94105'
      country: 'US'
  registration:
    url: 'https://eventbrite.com/e/cloud-workshop'
    price: '299'
    currency: 'USD'
    availability: 'https://schema.org/InStock'
  image: '/images/cloud-workshop.jpg'
  keywords: ['cloud', 'architecture', 'workshop']
  language: 'en-US'
  free: false
```

**Generated Fields**:

- `@type`: "Event"
- `eventStatus`: Event status URL
- `eventAttendanceMode`: Physical/virtual attendance
- `location`: Place or VirtualLocation
- `organizer`: Person schema
- `performer`: Person schema
- `offers`: Registration details
- `isAccessibleForFree`: Boolean

### 8. Review/Rating Schema

**File**: `layouts/partials/head/review-schema.html`  
**Trigger**: `{{ if or .Params.review .Params.rating }}`  
**Purpose**: Product reviews and ratings for tools and portfolio

**Frontmatter Support**:

```yaml
review:
  author: 'Peter Warnock'
  date: '2024-03-01'
  rating: 4.5
  best_rating: 5
  worst_rating: 1
  content: 'Excellent tool for cloud deployment automation'

rating:
  value: 4.5
  best: 5
  worst: 1
  aggregate:
    value: 4.2
    count: 15
    best: 5
    worst: 1
```

**Generated Fields**:

- `@type`: "CreativeWork" with embedded Review/Rating
- `review`: Individual review details
- `aggregateRating`: Aggregate rating information
- `publisher`: Organization information

## Implementation Details

### File Structure

```
layouts/partials/head/
├── structured-data.html     # Article, TechArticle, Organization, Person schemas
├── breadcrumb-schema.html   # BreadcrumbList schema
├── faq-schema.html         # FAQPage schema
├── howto-schema.html       # HowTo schema
├── event-schema.html        # Event schema
├── review-schema.html       # Review/Rating schema
└── page-meta.html          # Includes all schema files
```

### Conditional Inclusion

All schemas are conditionally included in `page-meta.html` based on page
parameters:

```html
<!-- Structured Data -->
<script type="application/ld+json">
  {{ partial "head/structured-data.html" . }}
</script>

<!-- BreadcrumbList Schema -->
{{ if not .Params.hideBreadcrumbs }}
<script type="application/ld+json">
  {{ partial "head/breadcrumb-schema.html" . }}
</script>
{{ end }}

<!-- FAQ Schema -->
{{ if .Params.faq }}
<script type="application/ld+json">
  {{ partial "head/faq-schema.html" . }}
</script>
{{ end }}

<!-- HowTo Schema -->
{{ if .Params.howto }}
<script type="application/ld+json">
  {{ partial "head/howto-schema.html" . }}
</script>
{{ end }}

<!-- Event Schema -->
{{ if .Params.event }}
<script type="application/ld+json">
  {{ partial "head/event-schema.html" . }}
</script>
{{ end }}

<!-- Review/Rating Schema -->
{{ if or .Params.review .Params.rating }}
<script type="application/ld+json">
  {{ partial "head/review-schema.html" . }}
</script>
{{ end }}
```

## Usage Examples

### Blog Post with Article Schema

```markdown
---
title: 'Understanding Cloud Architecture'
description: 'A comprehensive guide to cloud architecture patterns'
date: 2024-03-01
tags: ['cloud', 'architecture', 'aws']
featured_image: '/images/cloud-architecture.jpg'
---

Content here...
```

### Tool Page with TechArticle and Review Schema

```markdown
---
title: 'Cloud Deployment Tool'
description: 'Automated cloud deployment solution'
technologies: ['Go', 'Docker', 'Kubernetes']
category: 'DevOps Tools'
skills: ['Cloud Deployment', 'Containerization']
review:
  author: 'Peter Warnock'
  rating: 4.5
  content: 'Excellent tool for automating deployments'
---

Content here...
```

### Tutorial Page with HowTo Schema

```markdown
---
title: 'Deploy Hugo to Production'
howto:
  title: 'Deploy Hugo Site to Production'
  total_time: 'PT30M'
  steps:
    - name: 'Build Site'
      description: 'Run hugo command to build static site'
    - name: 'Deploy to Server'
      description: 'Copy files to production server'
---

Content here...
```

### Speaking Event with Event Schema

```markdown
---
title: 'Cloud Architecture Workshop'
event:
  name: 'Cloud Architecture Workshop'
  start_date: '2024-03-15T09:00:00-07:00'
  location:
    name: 'Tech Conference Center'
    address:
      city: 'San Francisco'
      country: 'US'
  registration:
    url: 'https://eventbrite.com/e/cloud-workshop'
    price: '299'
---

Content here...
```

## Testing and Validation

### Google Rich Results Test

Use the [Google Rich Results Test](https://search.google.com/test/rich-results)
to validate structured data implementation.

### Schema.org Validator

Use the [Schema.org Validator](https://validator.schema.org/) to check schema
compliance.

### Local Testing

Build the site and inspect generated HTML to verify structured data:

```bash
bun run build:preview
# Check public/index.html for structured data
```

## Best Practices

1. **Use Specific Types**: Choose the most specific schema type for your content
2. **Provide Complete Data**: Fill all required and recommended fields
3. **Use ISO Formats**: Dates should use ISO 8601 format
4. **Validate Regularly**: Test structured data after major changes
5. **Monitor Performance**: Check Google Search Console for structured data
   errors

## SEO Benefits

- **Rich Snippets**: Enhanced search result presentation
- **Better Rankings**: Improved search engine understanding
- **Increased CTR**: Attractive search result features
- **Voice Search**: Better compatibility with voice assistants
- **Knowledge Graph**: Enhanced entity recognition

## Maintenance

- Update schema implementations when schema.org releases new versions
- Monitor Google Search Console for structured data errors
- Test new content types for proper schema generation
- Keep documentation updated with new schema types

## Related Documentation

- [SEO Configuration Guide](../development/SEO.md)
- [Content Guidelines](../development/STYLE_GUIDE.md)
- [Front Matter Reference](../development/FRONTMATTER.md)
