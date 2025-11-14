# Peter Warnock - Personal Site Style Guide

This style guide has been organized into focused sections for better
maintainability and navigation.

## 📋 Table of Contents

### Core Architecture

- **[Project Architecture](style-guide/01-project-architecture.md)** - Directory
  structure, template hierarchy, URL patterns
- **[Design System](style-guide/02-design-system.md)** - Color hierarchy,
  typography, component patterns, theme-aware styling

### Content & Templates

- **[Content Guidelines](style-guide/03-content-guidelines.md)** - Front matter,
  blog posts, portfolio items, heading structure
- **[Template Conventions](style-guide/04-template-conventions.md)** - Naming
  conventions, partials, template logic, code blocks

### Technical Implementation

- **[CSS Guidelines](style-guide/05-css-guidelines.md)** - Organization
  strategy, BEM naming, responsive design, build process
- **[Development Workflow](style-guide/06-development-workflow.md)** - Adding
  content, modifying templates, maintenance guidelines

### Quality & Standards

- **[Performance Guidelines](style-guide/07-performance-guidelines.md)** - Image
  optimization, template efficiency, build optimization
- **[Accessibility Standards](style-guide/08-accessibility-standards.md)** -
  Semantic HTML, color contrast, screen reader support

---

## 🚀 Quick Reference

### Critical Rules

- **No H1 titles in markdown content** - handled by templates
- **Summary field REQUIRED for all blog posts** (150-200 chars)
- **Use semantic DaisyUI classes** for hero cards, not CSS variables
- **Separation of concerns** - design tokens in CSS, utilities in templates

### Common Tasks

```bash
# Validate blog posts
./scripts/validate-blog-post.sh

# Build CSS
npm run css:build

# Full validation
npm run lint && npm run validate && npm run build
```

### Front Matter Examples

**Blog Post:**

```yaml
---
title: 'Post Title'
date: 2025-01-01T00:00:00Z
draft: false
description: 'SEO description'
summary: '150-200 character summary for homepage'
image: '/images/blog/featured.jpg'
tags: ['tag1', 'tag2']
categories: ['Development']
---
```

**Portfolio Item:**

```yaml
---
title: 'Project Name'
date: 2024-11-23
draft: false
description: 'Brief project description'
client: 'Personal Project - Category'
technologies: ['React', 'Node.js']
github_url: 'https://github.com/user/repo'
live_url: 'https://example.com/demo'
completion_date: '2024-11'
category: 'Web App'
---
```

---

## 📈 Recent Updates

- **v0.12.1**: Editorial link annotation system for SEO optimization
- **v0.12.0**: H1 duplicate removal across all content types, accessibility
  compliance
- **v0.10.2**: Theme-aware color system, GA environment variables, dynamic git
  hash
- **v0.13.1**: Hero card color restoration - fixed semantic color classes for
  role cards
- **v0.10.1**: Hero section enhancement with 3-column layout
- **v0.10.0**: Spacing scale refactoring, version tracking in footer

---

This style guide serves as the single source of truth for design and development
decisions. Each section contains detailed guidelines, examples, and best
practices for that specific area of the project.
