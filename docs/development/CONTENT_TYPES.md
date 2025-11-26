# Content Type System Guide

## Overview

The Content Type System provides a structured way to classify and manage
different types of content on the site. It ensures proper attribution, enhances
SEO with schema.org markup, and provides consistent user experience.

## Content Types

### 1. Original Content (`original`)

Content created specifically for this site.

**Required Fields:**

- `title` - Post title
- `date` - Publication date
- `summary` - Content summary (150-200 characters recommended)

**Optional Fields:**

- `tags` - Array of tags
- `categories` - Array of categories
- `featured_image` - Path to featured image
- `draft` - Boolean for draft status

**Example Frontmatter:**

```yaml
---
title: 'My Original Post'
date: 2025-01-15T10:00:00Z
summary:
  'A comprehensive guide to building modern web applications with Hugo and
  content type systems.'
tags: ['hugo', 'web-development', 'content-management']
featured_image: '/images/posts/my-post.jpg'
content_type: 'original'
---
```

### 2. Curated Content (`curated`)

Content from external sources, shared with commentary or analysis.

**Required Fields:**

- `title` - Post title
- `date` - Publication date
- `summary` - Content summary (150-200 characters recommended)
- `attribution` - Original author/source name
- `source_url` - URL to original content

**Optional Fields:**

- `tags` - Array of tags
- `categories` - Array of categories
- `featured_image` - Path to featured image
- `draft` - Boolean for draft status

**Example Frontmatter:**

```yaml
---
title: 'Understanding Modern CSS Architecture'
date: 2025-01-15T10:00:00Z
summary:
  'An excellent analysis of CSS architectural patterns from Sarah Drasner, with
  additional insights on implementation.'
attribution: 'Sarah Drasner'
source_url: 'https://css-tricks.com/modern-css-architecture'
tags: ['css', 'architecture', 'frontend']
content_type: 'curated'
---
```

### 3. Embedded Content (`embed`)

Direct embeds from external platforms like Substack, Twitter, etc.

**Required Fields:**

- `title` - Post title
- `date` - Publication date
- `attribution` - Original author/source name
- `source_url` - URL to original content

**Optional Fields:**

- `tags` - Array of tags
- `categories` - Array of categories
- `draft` - Boolean for draft status

**Example Frontmatter:**

```yaml
---
title: 'The Future of AI Development'
date: 2025-01-15T10:00:00Z
attribution: 'Tech Newsletter'
source_url: 'https://newsletter.substack.com/p/future-of-ai'
tags: ['ai', 'development', 'future']
content_type: 'embed'
---
{ { < substack "https://newsletter.substack.com/p/future-of-ai" > } }
```

## Display Behavior

### Original Content

- Shows summary in a clean preview format
- No attribution header
- Standard article schema.org markup

### Curated Content

- Shows attribution header with "Curated from [Source]" link
- Displays summary with contextual styling
- Includes "Read Original" link
- Enhanced schema.org with `isBasedOn` property

### Embedded Content

- Shows attribution header with "Embedded from [Source]" link
- Displays summary with contextual styling
- Includes "View Source" link
- Enhanced schema.org with `embedUrl` property

## Schema.org Integration

The system automatically generates appropriate structured data:

### Original Content

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Pete Warnock"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Peter Warnock Consulting"
  }
}
```

### Curated Content

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "[Original Author]"
  },
  "isBasedOn": "[source_url]"
}
```

### Embedded Content

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "[Original Author]"
  },
  "embedUrl": "[source_url]"
}
```

## Validation Rules

The system enforces these validation rules:

1. **Content Type Required**: All content must specify `content_type`
2. **Attribution Required**: `curated` and `embed` types must have `attribution`
3. **Source URL Required**: `curated` and `embed` types must have `source_url`
4. **Summary Required**: `original` and `curated` types must have `summary`

## Migration Guide

### For Existing Content

1. **Review each post** and determine appropriate content type
2. **Add required fields** based on content type
3. **Update frontmatter** with `content_type` field
4. **Test display** to ensure proper rendering

### Migration Checklist

- [ ] Add `content_type` field to all posts
- [ ] Add `attribution` and `source_url` for curated/embed content
- [ ] Ensure all original content has proper `summary`
- [ ] Test rendering for each content type
- [ ] Validate schema.org output

## Best Practices

### Content Classification

- **Original**: Your own thoughts, tutorials, case studies
- **Curated**: External content with your analysis/commentary
- **Embed**: Direct embeds with minimal commentary

### Attribution

- Always use the author's full name
- Include direct links to original source
- Be specific about the source (e.g., "Sarah Drasner" not just "CSS-Tricks")

### Summaries

- Aim for 150-200 characters for optimal SEO
- Focus on the value proposition
- Include relevant keywords naturally

## Troubleshooting

### Common Issues

1. **Build fails**: Check for missing required fields
2. **No attribution displayed**: Verify `attribution` and `source_url` are
   present
3. **Schema.org errors**: Ensure content type configuration is valid

### Debug Commands

```bash
# Test build
hugo build --buildDrafts --buildFuture

# Check specific page
hugo server --buildDrafts --buildFuture -D
```

## Component Reference

### Templates

- `layouts/partials/content/content-header.html` - Attribution display
- `layouts/partials/content/content-preview.html` - Summary display
- `layouts/partials/head/structured-data.html` - Schema.org markup

### Configuration

- `data/content-types.yaml` - Content type definitions and validation rules

## Support

For questions or issues with the content type system:

1. Check this documentation first
2. Review existing examples in the codebase
3. Test with draft content before publishing
4. Validate schema.org output with testing tools

---

_Last updated: 2025-01-26_
