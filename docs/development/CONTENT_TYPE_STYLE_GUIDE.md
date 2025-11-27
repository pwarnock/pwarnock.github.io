# Content Type Style Guide

## Overview

This guide defines how to use content types effectively in your Hugo site.
Content types help readers understand the nature and origin of content while
ensuring proper attribution.

## Content Types

### 1. Original Content (`content_type: original`)

**Definition**: Content created specifically for this site by Peter Warnock.

**When to Use**:

- Blog posts written by Peter
- Technical tutorials and guides
- Personal insights and experiences
- Original research or analysis

**Required Fields**:

- `title`
- `date`
- `summary` (150-200 characters recommended)

**Optional Fields**:

- `tags`
- `categories`
- `featured_image`
- `draft`

**Example**:

```yaml
---
title: 'Getting Started with Hugo and Daisy UI'
summary:
  'Learn how to set up a fast static site using Hugo combined with Daisy UI
  components for modern, responsive design without JavaScript bloat.'
date: 2025-01-15T10:00:00Z
draft: false
tags: ['Hugo', 'Daisy UI', 'Web Development']
author: 'Peter Warnock'
---
```

### 2. Curated Content (`content_type: curated`)

**Definition**: Content from external sources, shared with commentary or
analysis.

**When to Use**:

- Sharing articles with your perspective
- Analyzing others' work
- Building on external research
- Responding to industry trends

**Required Fields**:

- `title`
- `date`
- `summary`
- `attribution` (original author/creator)
- `source_url` (original content URL)

**Optional Fields**:

- `tags`
- `categories`
- `featured_image`
- `draft`

**Example**:

```yaml
---
title: 'The Future of AI in Development'
summary: 'Analysis of Sarah Chen\'s predictions about AI coding assistants and their impact on software development workflows.'
date: 2025-01-20T14:30:00Z
content_type: curated
attribution: 'Sarah Chen'
source_url: 'https://example.com/ai-future'
tags: ['AI', 'Development', 'Future Trends']
---
```

### 3. Embedded Content (`content_type: embed`)

**Definition**: Direct embeds from external platforms (tweets, videos, etc.).

**When to Use**:

- Embedding social media posts
- Including video content
- Showcasing external resources
- Referencing platform-specific content

**Required Fields**:

- `title`
- `date`
- `attribution` (original creator)
- `source_url` (original content URL)

**Optional Fields**:

- `tags`
- `categories`
- `draft`

**Example**:

```yaml
---
title: 'Twitter Thread on Microservices'
summary:
  'Thread discussing practical microservices architecture patterns and common
  pitfalls to avoid.'
date: 2025-01-18T09:15:00Z
content_type: embed
attribution: '@techlead'
source_url: 'https://twitter.com/techlead/status/123456789'
tags: ['Microservices', 'Architecture', 'Twitter']
---
```

## Summary Guidelines

### Length Recommendations

- **Optimal**: 150-200 characters
- **Minimum**: 50 characters
- **Maximum**: 300 characters

### Content Guidelines

- **Be specific**: Clearly state what the content is about
- **Include value**: What will readers learn or gain?
- **Use active voice**: "Learn how to..." vs "A tutorial about..."
- **Avoid clickbait**: Be accurate and informative

### Examples by Type

**Original Content**:

> "Learn how to set up a fast static site using Hugo combined with Daisy UI
> components for modern, responsive design without JavaScript bloat."

**Curated Content**:

> "Analysis of Sarah Chen's predictions about AI coding assistants and their
> impact on software development workflows with practical takeaways for
> developers."

**Embedded Content**:

> "Thread discussing practical microservices architecture patterns and common
> pitfalls to avoid from experienced system architect."

## Attribution Formatting

### Curated Content Attribution

- **Format**: Full name or handle of original creator
- **Examples**:
  - `attribution: 'Sarah Chen'`
  - `attribution: '@techlead'`
  - `attribution: 'Mozilla Developer Network'`

### Source URL Guidelines

- **Use direct URLs**: Link to the original content
- **Avoid redirects**: Use canonical URLs when possible
- **Test links**: Ensure URLs are accessible

## Visual Indicators

Content types are automatically displayed with color-coded badges:

- **Original**: Green badge (`badge-success`)
- **Curated**: Blue badge (`badge-info`)
- **Embed**: Yellow badge (`badge-warning`)

These appear on:

- Single post pages (top of article)
- Latest post cards (next to date)
- List views (when implemented)

## SEO Considerations

### Schema.org Markup

Each content type automatically gets appropriate structured data:

- **Original**: Standard Article schema
- **Curated**: Article with `isBasedOn` property
- **Embed**: Article with `embedUrl` property

### Search Benefits

- Clear content provenance for search engines
- Proper attribution signals
- Enhanced rich snippets potential

## Validation Rules

The content validation engine enforces:

1. **Required fields** by content type
2. **URL format validation** for `source_url`
3. **Date format validation**
4. **Summary length recommendations**
5. **Array format validation** for tags

Run validation with:

```bash
node scripts/validation/content-validator.cjs --directory content
```

## Migration Guide

### Converting Existing Content

1. **Identify content type**: Is this original, curated, or embedded?
2. **Add required fields**: Ensure all required fields are present
3. **Write summary**: Create compelling 150-200 character summary
4. **Test validation**: Run the validation engine
5. **Check display**: Verify badges appear correctly

### Bulk Updates

For multiple files, consider using the validation export:

```bash
node scripts/validation/content-validator.cjs --directory content --output audit.json
```

## Best Practices

### Content Creation Workflow

1. **Plan content type** before writing
2. **Gather required metadata** (attribution, URLs)
3. **Write summary first** (helps focus the content)
4. **Validate before publishing**
5. **Test visual display**

### Consistency Tips

- **Use consistent attribution format** across curated content
- **Standardize date formats** (ISO 8601 recommended)
- **Maintain summary length** guidelines
- **Regular validation** to catch issues early

### Quality Assurance

- **Test source URLs** before publishing
- **Verify attribution accuracy**
- **Check summary character count**
- **Run full validation** after content updates

## Troubleshooting

### Common Validation Errors

**Missing Required Field**:

```
❌ Missing required field: summary
```

**Solution**: Add the missing field to frontmatter

**Invalid URL Format**:

```
❌ source_url must be a valid URL
```

**Solution**: Ensure URL includes protocol (http:// or https://)

**Summary Too Short**:

```
⚠️ Summary is too short (recommend 150-200 characters)
```

**Solution**: Expand summary to meet length guidelines

### Display Issues

**Badge Not Showing**:

- Check `content_type` field is set correctly
- Verify template includes content type logic
- Clear Hugo cache if needed

**Attribution Missing**:

- Ensure `attribution` field is present for curated/embed content
- Check content-header.html partial is included

## Support

For questions about content types:

1. Check this guide first
2. Review validation output
3. Test with sample content
4. Consult the technical documentation in `docs/development/CONTENT_TYPES.md`

---

**Last Updated**: November 26, 2025  
**Next Review**: As needed based on content type evolution
