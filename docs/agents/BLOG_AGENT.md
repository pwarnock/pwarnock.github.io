# Blog Agent Guide

The Blog Agent creates conversational blog posts with proper Hugo frontmatter and SEO optimization.

## Content Types

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `original` | Your own thoughts and analysis | title, summary |
| `curated` | Collected resources with commentary | title, summary, attribution, source_url |
| `embed` | Embedded external content | title, summary, attribution, source_url |
| `project` | Project-based posts | title, summary |

## CLI Usage

### Basic Generation
```bash
bun run agent:blog \
  --title "Why I Switched to Bun" \
  --type original \
  --summary "My experience switching from Node.js to Bun for faster development"
```

### With Optional Fields
```bash
bun run agent:blog \
  --title "Great AI Resources" \
  --type curated \
  --summary "A collection of must-read AI articles" \
  --attribution "Various Authors" \
  --source-url "https://example.com"
```

### Interactive Mode
```bash
bun run agent:blog --interactive
```

## Output Structure

### Frontmatter
```yaml
---
title: "Post Title"
date: 2024-12-26T00:00:00Z
draft: true
tags: ["tag1", "tag2"]
author: "Peter Warnock"
summary: "150-200 char summary"
content_type: original
---
```

### Content Structure
- **No H1 headings** (title comes from frontmatter)
- Sections start with H2 (`##`)
- Personal, conversational tone
- "I" statements for personal perspective

## Style Guidelines

### Do
- Use conversational, personal language
- Include specific examples and anecdotes
- Use active voice
- Be concise

### Don't
- Use AI-sounding phrases ("delve into", "tapestry")
- Be overly formal or academic
- Use H1 headings in content
- Write vague summaries

## Validation

The agent validates against `scripts/validate-blog-post.sh`:

- Required frontmatter fields present
- No H1 headings in content
- Summary length 150-200 characters
- Content type-specific requirements

## Example Interaction

**User:** I want to write a blog post about my experience with Claude Code

**Claude (with create-blog skill):**

1. "What should the title be?"
2. "This sounds like original content. Correct?"
3. "What's a 1-2 sentence summary?"
4. "What key points do you want to cover?"

*Generates content and presents for review*

## Troubleshooting

### Summary too short/long
Adjust to 150-200 characters for optimal SEO display.

### Missing attribution
For curated/embed types, always include `attribution` and `source_url`.

### H1 heading error
Remove any `# Title` from content body. The title comes from frontmatter.
