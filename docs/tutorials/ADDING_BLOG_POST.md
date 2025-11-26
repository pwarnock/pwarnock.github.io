# Adding a Blog Post

Step-by-step guide for creating and publishing blog posts, including content
structure, frontmatter requirements, validation, and deployment.

## Quick Start

```bash
# 1. Create new post file
touch content/blog/my-post-title.md

# 2. Add content with frontmatter (see template below)
# 3. View at http://localhost:1313/blog/my-post-title/
# 4. When ready: git add, commit, push to main
```

---

## Blog Directory Structure

```
content/blog/
├── _index.md                        # Blog listing page (don't edit)
├── my-first-post.md                 # Blog post 1
├── another-great-article.md         # Blog post 2
├── exploring-web-components.md      # Example: existing post
└── ...
```

### Naming Convention

- Use **lowercase** with **hyphens** between words
- Reflects the URL slug exactly
- Examples:
  - `my-new-post.md` → `/blog/my-new-post/`
  - `exploring-web-components.md` → `/blog/exploring-web-components/`
  - `lessons-learned-2025.md` → `/blog/lessons-learned-2025/`

---

## Frontmatter Template

Every blog post must have YAML frontmatter at the top:

```markdown
---
title: 'Your Post Title'
date: 2025-01-15
summary: 'Brief summary that appears on blog listing page'
draft: false
tags: ['tag1', 'tag2', 'tag3']
---

# Your Post Title

Post content starts here...
```

### Frontmatter Fields

| Field       | Required | Type    | Purpose                            | Example                              |
| ----------- | -------- | ------- | ---------------------------------- | ------------------------------------ |
| **title**   | ✅ Yes   | String  | Post heading & browser tab title   | `"Exploring Web Components"`         |
| **date**    | ✅ Yes   | Date    | Publication date (YYYY-MM-DD)      | `2025-01-15`                         |
| **summary** | ✅ Yes   | String  | Preview text on blog listing       | `"Deep dive into web components..."` |
| **draft**   | ✅ Yes   | Boolean | `false` to publish, `true` to hide | `false`                              |
| **tags**    | ✅ Yes   | Array   | Category tags for filtering        | `["web", "components", "tutorial"]`  |

### Frontmatter Examples

**Minimal Valid Frontmatter**:

```markdown
---
title: 'My First Post'
date: 2025-01-15
summary: 'This is my first blog post'
draft: false
tags: ['first']
---
```

**Comprehensive Frontmatter**:

```markdown
---
title: 'Building a Design System with Web Components'
date: 2025-01-15
summary:
  'Learn how to create reusable, maintainable UI components using modern web
  standards'
draft: false
tags: ['web', 'components', 'design-system', 'tutorial']
---
```

---

## Content Structure

### Recommended Post Structure

````markdown
---
title: 'Post Title'
date: 2025-01-15
summary: 'Brief summary'
draft: false
tags: ['tag']
---

# Post Title

Brief introduction paragraph that hooks the reader. Explain what the post is
about and why it matters.

## Section 1: Setup

Provide context and explain key concepts.

```bash
# Code examples help readers follow along
code here
```
````

### Subsection: Important Detail

Deeper explanation of key points.

## Section 2: Implementation

Step-by-step walkthrough.

```typescript
// Show working code
const example = () => {
  return 'code';
};
```

## Section 3: Results

Show outcomes or benefits.

## Conclusion

Wrap up the main points and suggest next steps.

## See Also

- [Link to related post](/blog/related-post/)
- [External resource](https://example.com)

````

### Best Practices

✅ **Do**:
- Start with an engaging introduction
- Use clear section headings
- Include working code examples
- Add images/diagrams where helpful
- Conclude with takeaways
- Link to related posts
- Keep paragraphs short (3-4 sentences max)
- Use active voice ("I learned" not "It was learned")

❌ **Don't**:
- Skip frontmatter fields
- Use `draft: true` then push (remove draft or keep unpublished)
- Write extremely long posts without section breaks
- Include TODO comments
- Leave broken links
- Repeat content from other posts without linking

---

## Markdown Reference

### Headings
```markdown
# H1 - Page title (use once per post)
## H2 - Main sections
### H3 - Subsections
#### H4 - Minor points (rarely needed)
````

### Text Formatting

```markdown
**bold text** _italic text_ ~~strikethrough~~ `inline code`
```

### Lists

```markdown
- Unordered item 1
- Unordered item 2
  - Nested item
  - Another nested

1. Ordered item 1
2. Ordered item 2
   1. Nested ordered
   2. Another nested
```

### Links

```markdown
[Link text](https://example.com) [Relative link](/blog/other-post/)
[Link with title](https://example.com 'hover text')
```

### Images

```markdown
![Alt text for image](https://example.com/image.png)
![Local image](/images/my-image.png)
```

### Code Blocks

````markdown
```javascript
// Language specified for syntax highlighting
const greeting = 'Hello, world!';
console.log(greeting);
```

```bash
# Shell script example
echo "Hello from shell"
```

```go
// Go example
func main() {
    fmt.Println("Hello, Go!")
}
```
````

### Blockquotes

```markdown
> This is a quote It can span multiple lines
>
> And have multiple paragraphs
```

### Horizontal Rule

```markdown
---
```

---

## Creating Your First Post

### Step 1: Create File

```bash
# Create the markdown file
touch content/blog/my-first-post.md
```

### Step 2: Add Frontmatter & Content

```bash
cat > content/blog/my-first-post.md << 'EOF'
---
title: "My First Blog Post"
date: 2025-01-15
summary: "I'm starting a blog to share my thoughts on web development"
draft: false
tags: ["getting-started", "personal"]
---

# My First Blog Post

I'm excited to start sharing my thoughts and experiences on web development.

## What This Blog Is About

This blog will cover topics like:
- Web components and modern standards
- Performance optimization
- Best practices and lessons learned

## Let's Get Started

I'll be posting regularly about topics that interest me.

Thanks for reading!
EOF
```

### Step 3: Preview Locally

```bash
# If dev server is running, view at:
# http://localhost:1313/blog/my-first-post/

# If not running, start it:
bun run dev

# Then navigate to the post URL
```

### Step 4: Validate

```bash
# Check frontmatter is valid
bun run validate:portfolio

# Expected output:
# ✅ my-first-post: Valid
```

### Step 5: Commit & Push

```bash
# Add the new post file
git add content/blog/my-first-post.md

# Commit with descriptive message
git commit -m "feat: add blog post about my first post"

# Push to GitHub
git push origin feature/my-first-post

# Or directly to main (if working directly)
git push origin main
```

---

## Advanced: Post with Code Examples

### TypeScript Example

````markdown
---
title: 'TypeScript Tips and Tricks'
date: 2025-01-15
summary: 'Practical TypeScript patterns I use regularly'
draft: false
tags: ['typescript', 'programming']
---

# TypeScript Tips and Tricks

Here are some useful TypeScript patterns.

## Discriminated Unions

Discriminated unions help ensure type safety:

```typescript
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handle<T>(result: Result<T>) {
  if (result.status === 'success') {
    console.log(result.data); // ✅ TypeScript knows it's T
  } else {
    console.error(result.error); // ✅ TypeScript knows it's Error
  }
}
```
````

This pattern is safer than optional fields.

## Generic Constraints

```typescript
interface Named {
  name: string;
}

function getName<T extends Named>(obj: T): string {
  return obj.name; // ✅ TypeScript knows T has 'name'
}
```

Constraints ensure you only accept compatible types.

````

### Bash Script Example

```markdown
---
title: "Useful Bash Scripts for Development"
date: 2025-01-15
summary: "Shell scripts that improve my development workflow"
draft: false
tags: ["bash", "productivity"]
---

# Useful Bash Scripts for Development

Here are some scripts I use daily.

## Quick Build

```bash
#!/bin/bash
# build.sh - Quick build script

set -e  # Exit on error

echo "🔨 Building..."
npm install
npm run build

echo "✅ Build complete"
````

Run with: `./build.sh`

```

---

## Tags & Categorization

### Choosing Tags

Use tags to help readers find related content:

**Good tag examples**:
- Topic: `web`, `javascript`, `typescript`, `css`, `performance`
- Type: `tutorial`, `story`, `guide`, `tips`, `review`
- Audience: `beginner`, `intermediate`, `advanced`

**Avoid**:
- Hashtag-style tags: Don't use `#tag` (just `tag`)
- Redundant tags: Don't use both `javascript` and `js`
- Single-letter tags: Avoid `a`, `b`, `x`
- Extremely specific tags used once: `my-custom-obscure-topic`

### Tag List

Review these existing tags and use where appropriate:

```

web, javascript, typescript, css, html, performance, tutorial, tips, tools,
testing, accessibility, design-system, components, web-components, beginner,
intermediate, advanced, guide, story, framework, design, architecture,
optimization, productivity, career, learning, best-practices, case-study, review

````

---

## Editing Existing Posts

### Update Published Post

```bash
# 1. Edit the post file
vim content/blog/my-post.md

# 2. Make your changes

# 3. Preview locally
# Auto-reload at http://localhost:1313/blog/my-post/

# 4. Commit updates
git add content/blog/my-post.md
git commit -m "docs: update blog post about my topic"

# 5. Push to main
git push origin main

# Auto-deploys to production in ~2 minutes
````

### Hide a Post (Draft Mode)

To hide a published post temporarily:

```markdown
---
draft: true # This hides the post from listing
---
```

### Delete a Post

```bash
# Remove the file
git rm content/blog/old-post.md

# Commit the deletion
git commit -m "docs: remove outdated blog post"

# Push
git push origin main
```

---

## Publishing Workflow

### Development → Staging → Production

1. **Local Development**

   ```bash
   # Create/edit post on feature branch
   git checkout -b feature/new-blog-post
   # Edit content/blog/my-post.md
   # Verify at http://localhost:1313/
   ```

2. **Test & Commit**

   ```bash
   # Run validation
   bun run validate:portfolio

   # Commit and push
   git add content/blog/my-post.md
   git commit -m "feat: add blog post about my topic"
   git push origin feature/new-blog-post
   ```

3. **Code Review**

   ```bash
   # Create pull request on GitHub
   # Request review from team
   # Discuss any feedback
   # Get approval
   ```

4. **Merge to Main**

   ```bash
   # After approval, merge PR
   # GitHub automatically deploys to staging
   ```

5. **Auto-Deploy to Production**
   ```bash
   # After staging verification:
   # Promotion to production happens automatically
   # View at https://peterwarnock.com/blog/my-post/
   ```

---

## Validation & Checks

### Pre-commit Validation

When you commit, these checks run automatically:

```bash
git add content/blog/my-post.md
git commit -m "feat: add new blog post"

# Checks run automatically:
# ✅ Frontmatter validation
# ✅ Required fields present
# ✅ Date format correct
# ✅ No draft posts in main branch
# ✅ Markdown linting
```

### Manual Validation

```bash
# Run validation manually
bun run validate:portfolio

# Output shows status of all posts:
# ✅ post-1: Valid
# ✅ post-2: Valid
# ❌ post-3: Missing title field
```

### Common Validation Errors

| Error                   | Cause                  | Fix                                              |
| ----------------------- | ---------------------- | ------------------------------------------------ |
| `Missing title field`   | Frontmatter incomplete | Add `title: "Your Title"`                        |
| `Invalid date format`   | Date not YYYY-MM-DD    | Change `date: "2025-1-15"` to `date: 2025-01-15` |
| `Missing summary`       | Summary field omitted  | Add `summary: "..."`                             |
| `Draft must be boolean` | Draft value invalid    | Change to `draft: false` (not `"false"`)         |

---

## Troubleshooting

### Post Not Showing Up

```bash
# 1. Check file location
ls content/blog/my-post.md

# 2. Check frontmatter is valid
head -20 content/blog/my-post.md

# 3. Run validation
bun run validate:portfolio

# 4. Check Hugo logs
bun run dev:logs

# 5. Clear cache and rebuild
rm -rf resources
bun run dev
```

### Special Characters in Title

Use quotes for titles with special characters:

```markdown
---
title: "C++ Tips: const & References"  # Quotes needed
title: 'TypeScript 5.0: "What\'s New"'  # Or single quotes with escaping
---
```

### Code Block Not Rendering

Make sure backticks are correct:

````markdown
# CORRECT - 3 backticks

```javascript
code here
```
````

# WRONG - 2 backticks (won't work)

`javascript code here `

```

### Post Appears but URL is Wrong

Check filename matches desired URL:

```

File: content/blog/my-post.md → URL: /blog/my-post/ File:
content/blog/cool-feature.md → URL: /blog/cool-feature/

Spaces become hyphens: File: content/blog/my blog post.md → URL:
/blog/my-blog-post/

```

---

## Best Practices Checklist

Before publishing your post:

- [ ] **Frontmatter** - All fields present and valid
  - [ ] title: Not too long, descriptive
  - [ ] date: Today's date (YYYY-MM-DD)
  - [ ] summary: 1-2 sentences, compelling
  - [ ] draft: `false` to publish
  - [ ] tags: 2-4 relevant tags

- [ ] **Content** - Well-written and clear
  - [ ] Introduction hooks the reader
  - [ ] Section headings organize content
  - [ ] Code examples work and are tested
  - [ ] Conclusion summarizes key points
  - [ ] Links are correct and working

- [ ] **Technical** - Follows standards
  - [ ] Markdown syntax is valid
  - [ ] No broken image links
  - [ ] No TODO comments
  - [ ] Spelling and grammar checked

- [ ] **Testing** - Validated locally
  - [ ] `bun run validate:portfolio` passes
  - [ ] Post displays at `http://localhost:1313/blog/my-post/`
  - [ ] Links to other posts work
  - [ ] Images load correctly

- [ ] **Git** - Properly committed
  - [ ] File in `content/blog/` directory
  - [ ] Filename matches URL slug
  - [ ] Commit message describes post topic
  - [ ] Ready for code review

---

## See Also

- [GETTING_STARTED.md](/docs/tutorials/GETTING_STARTED.md) - Local setup guide
- [docs/development/STYLE_GUIDE.md](/docs/development/STYLE_GUIDE.md) - Writing style guidelines
- [docs/operations/DEPLOYMENT_NOTES.md](/docs/operations/DEPLOYMENT_NOTES.md) - How blogs are deployed
- [README.md](/docs/README.md) - Full documentation index
```
