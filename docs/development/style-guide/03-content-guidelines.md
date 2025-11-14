# Content Guidelines

## Front Matter Structure

```yaml
---
title: 'Page Title'
date: 2025-01-01T00:00:00Z
draft: false
description: 'Brief description for SEO'
summary: 'Required: Brief summary for homepage and list views (150-200 chars)'
tags: ['tag1', 'tag2']
categories: ['category']
customHTML: false # Set to true for pages with custom HTML layouts
---
```

### Custom HTML Pages

For pages that require custom HTML layouts (like the About page), set
`customHTML: true` in front matter. This removes the prose wrapper and allows
full HTML control:

```yaml
---
title: 'About'
customHTML: true
---
```

When `customHTML: true`:

- Content is rendered without prose styling wrapper
- Full HTML/CSS control is available
- Use DaisyUI components and Tailwind classes directly
- Ideal for landing pages, custom layouts, and interactive components

## Content Organization

- **Blog Posts**: `/content/blog/posts/[slug]/index.md`
- **Portfolio Items**: `/content/portfolio/[project-name]/index.md`
- **Tool Pages**: `/content/tools/[tool-name]/index.md`
- **Static Pages**: `/content/[page-name].md`

## Blog Post Creation Guidelines

**CRITICAL: Summary field is REQUIRED for all blog posts**

The `summary` field in frontmatter is mandatory for proper display on homepage
and section pages. Without it, posts will appear incomplete or broken.

### Required Blog Post Frontmatter

```yaml
---
title: 'Blog Post Title' # Required: Display title
date: 2025-01-01T00:00:00Z # Required: Publication date
draft: false # Required: Set to false for published posts
description: 'SEO description for search engines' # Required: Meta description
summary: 'Required: Brief summary for homepage and list views (150-200
  characters)' # REQUIRED
tags: ['tag1', 'tag2'] # Optional: For categorization
categories: ['category'] # Optional: For grouping
---
```

### Summary Field Requirements

- **Length**: 150-200 characters optimal
- **Purpose**: Display on homepage, blog section page, and RSS feeds
- **Content**: Engaging preview that encourages readers to click
- **Format**: Plain text, no markdown or HTML
- **Validation**: Posts without summary will fail validation

### Blog Post Structure

```markdown
---
title: 'Your Blog Post Title'
date: 2025-01-01T00:00:00Z
draft: false
description: 'SEO-friendly description for search engines'
summary:
  'Engaging 150-200 character summary that appears on homepage and blog listing
  pages'
tags: ['technology', 'web-development']
categories: ['Development']
---

# NO H1 HERE - Title comes from frontmatter

Start your content directly with an introduction paragraph or image.

## First Section

Your main content begins here with H2 headings.

## Additional Sections

Continue with H2 and H3 headings as needed.
```

## Image Guidelines for Blog Posts

### Image Storage & Access

- **Location**: Place images in `static/images/blog/` for global access
- **Page Resources**: For page-specific images, create page bundles with
  `index.md` and image files
- **Frontmatter**: Always specify `image` parameter for homepage display

### Image Frontmatter (Required for Homepage)

```yaml
---
title: 'Your Blog Post Title'
image: '/images/blog/your-image.jpg' # Required for homepage latest post card
summary: '150-200 character summary for homepage display'
---
```

### Image Usage Patterns

1. **Homepage Latest Post Card**: Uses `image` frontmatter parameter
2. **Content Images**: Use Hugo's figure shortcode for processing
3. **Responsive Images**: Hugo automatically optimizes when using resources

### Example Complete Blog Post

```markdown
---
title: 'Your Blog Post Title'
date: 2025-01-01T00:00:00Z
draft: false
description: 'SEO description for search engines'
summary:
  'Engaging 150-200 character summary that appears on homepage and blog listing
  pages'
image: '/images/blog/your-featured-image.jpg' # Required for homepage
tags: ['technology', 'web-development']
categories: ['Development']
---

# NO H1 HERE - Title comes from frontmatter

Start your content directly with an introduction paragraph.

{{< figure src="/images/blog/your-image.jpg" alt="Description" caption="Optional caption" >}}

## First Section

Your main content begins here with H2 headings.
```

### Image Processing Best Practices

- **Featured Images**: Use `image` parameter for homepage cards
- **Content Images**: Use `{{< figure >}}` shortcode for automatic optimization
- **Sizing**: Hugo automatically resizes images in templates (400x200 for cards)
- **Formats**: Use JPG, PNG, or WebP formats
- **Alt Text**: Always provide descriptive alt text for accessibility

### Template Image Handling

The homepage template follows Hugo conventions:

1. **First Priority**: `image` frontmatter parameter
2. **Second Priority**: `thumbnail` parameter
3. **Fallback**: Page resources (feature*, cover*, thumbnail\*)
4. **Final Fallback**: First image in page bundle

### Validation

Blog posts are validated automatically:

```bash
# Validate all blog posts
./scripts/validate-blog-post.sh

# Check specific post
./scripts/validate-blog-post.sh content/blog/posts/your-post/

# Full validation includes blog checks
./scripts/validate.sh
```

### Validation Checks

- ✅ **Required frontmatter fields**: title, date, draft, description, summary,
  image
- ✅ **Image path existence**: Verifies frontmatter image exists in static
  directory
- ✅ **Summary length**: Recommends 150-200 characters for optimal display
- ✅ **Heading structure**: Ensures no H1 in content (prevents duplicates)
- ✅ **Content images**: Validates image paths in content

### Common Validation Errors

- ❌ `Missing required fields: image` → Add
  `image: '/images/blog/your-image.jpg'` to frontmatter
- ❌ `Frontmatter image not found` → Verify image exists in static directory
- ⚠️ `Summary too short/long` → Adjust summary to 150-200 characters
- ❌ `Contains H1 heading` → Remove `# Title` from content, use H2+ instead

## Heading Structure Guidelines

**CRITICAL: No H1 Titles in Markdown Content**

All content types (blog posts, portfolio items, tools, static pages) must
**NOT** include H1 titles (`# Title`) in their markdown content.

### Why?

- Hero templates already display the title as an H1 from frontmatter
- Duplicate H1s create accessibility issues for screen readers
- Maintains SEO optimization while ensuring a11y compliance

### Template H1 Display

- **Blog Posts**: `hero-blog.html` displays `{{ .context.Title }}` as H1
- **Tools**: `hero-tools.html` displays `{{ .context.Title }}` as H1
- **Portfolio**: `hero-portfolio.html` displays `{{ .context.Title }}` as H1
- **Static Pages**: `single.html` displays `{{ .Title }}` as H1

### Correct Structure

```markdown
---
title: 'Page Title'
date: 2025-01-01T00:00:00Z
draft: false
---

# NO H1 HERE - Title comes from frontmatter

## Start with H2 for first section

Content begins here...
```

### Incorrect Structure

```markdown
---
title: 'Page Title'
---

# Page Title ← REMOVE THIS - creates duplicate H1

## Content
```

### Content Starts With

- **H2** (`## Section Title`) for main content sections
- **Images**, **paragraphs**, or **other elements** directly after frontmatter
- Never H1 titles in markdown content

## Portfolio Frontmatter Structure

Portfolio items require specific frontmatter fields for consistent display in
the card grid and detail pages:

```yaml
---
title: 'Project Name' # Required: Display title
date: 2024-11-23 # Required: Publication date
draft: false # Required: Set to false for live projects
description: 'Brief project description' # Required: Used in cards and SEO
client: 'Personal Project - Category' # Required: Project context
technologies: ['Tech1', 'Tech2'] # Required: Array of technologies used
github_url: 'https://github.com/user/repo' # Optional: GitHub repository link
live_url: 'https://example.com/demo' # Optional: Live demo URL (displays "Live Demo" button)
completion_date: '2024-11' # Required: When project was completed
category: 'Web App' # Required: Project category for badges
---
```

### Required Fields

- `title`, `date`, `draft`, `description`, `client`, `technologies`,
  `completion_date`, `category`

### Optional Fields

- `github_url`: Displays GitHub icon button linking to repository
- `live_url`: Displays "Live Demo" button with external link

### Validation

- Use `live_url` (not `demo_url`) to match template expectations
- Technologies array should use consistent naming (e.g., 'React', 'Node.js')
- Categories should be consistent across projects (e.g., 'Web App', 'Educational
  Game')
