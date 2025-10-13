# Hugo Development Guide

> Comprehensive reference for vibe coding and spec-driven development with Hugo

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Archetypes](#archetypes)
- [Front Matter](#front-matter)
- [Template System](#template-system)
- [Content Management](#content-management)
- [Development Workflow](#development-workflow)
- [Best Practices](#best-practices)

## Quick Start

### Prerequisites

- Hugo v0.128.0+ (extended edition)
- Git
- Command line familiarity

### Basic Setup

```bash
# Create new site
hugo new site my-project
cd my-project

# Initialize git and add theme
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
echo "theme = 'ananke'" >> hugo.toml

# Start development server
hugo server -D
```

## Project Structure

```
my-project/
├── archetypes/          # Content templates
│   └── default.md
├── content/             # Site content
│   ├── posts/
│   └── _index.md
├── data/                # Data files (JSON, YAML, TOML)
├── layouts/             # Template files
│   ├── _default/
│   └── partials/
├── static/              # Static assets
├── themes/              # Theme files
└── hugo.toml           # Site configuration
```

## Archetypes

Archetypes provide consistent content templates for spec-driven development.

### Default Archetype

```yaml
# archetypes/default.md
---
date: '{{ .Date }}'
draft: true
title: '{{ replace .File.ContentBaseName `-` ` ` | title }}'
---
```

### Custom Content Type Archetype

```yaml
# archetypes/posts.md
---
date: '{{ .Date }}'
draft: true
title: '{{ replace .File.ContentBaseName `-` ` ` | title }}'
author: '{{ .Site.Params.defaultAuthor }}'
tags: []
categories: []
description: ""
featured_image: ""
---

## Overview

Brief description of the content.

## Key Points

- Point 1
- Point 2
- Point 3

## Implementation Notes

Technical details and considerations.
```

### Bundle Archetype

```
archetypes/
├── galleries/
│   ├── images/
│   │   └── .gitkeep
│   └── index.md
└── default.md
```

### Usage

```bash
# Use default archetype
hugo new content posts/my-post.md

# Use specific archetype
hugo new content --kind tutorials posts/tutorial-post.md

# Create bundle
hugo new galleries/my-gallery
```

## Front Matter

### Supported Formats

**YAML (Recommended)**
```yaml
---
title: "My Post"
date: 2024-01-15T10:00:00Z
draft: false
tags: ["hugo", "development"]
params:
  author: "John Doe"
  custom_field: "value"
---
```

**TOML**
```toml
+++
title = "My Post"
date = 2024-01-15T10:00:00Z
draft = false
tags = ["hugo", "development"]
[params]
  author = "John Doe"
  custom_field = "value"
+++
```

**JSON**
```json
{
  "title": "My Post",
  "date": "2024-01-15T10:00:00Z",
  "draft": false,
  "tags": ["hugo", "development"],
  "params": {
    "author": "John Doe",
    "custom_field": "value"
  }
}
```

### Reserved Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Page title |
| `date` | string | Creation date |
| `draft` | bool | Draft status |
| `weight` | int | Sort order |
| `type` | string | Content type override |
| `layout` | string | Template override |
| `aliases` | array | URL redirects |
| `params` | map | Custom parameters |

### Custom Parameters

```yaml
---
title: "API Documentation"
params:
  api_version: "v2.1"
  endpoint: "/api/users"
  methods: ["GET", "POST", "PUT"]
  auth_required: true
---
```

## Template System

### Basic Syntax

```go
{{ $variable := "value" }}
{{ .Title }}
{{ .Params.author }}
{{ strings.ToLower .Title }}
```

### Context and Variables

```go
<!-- Current context -->
<h1>{{ .Title }}</h1>

<!-- Template context within blocks -->
{{ range .Pages }}
  <h2>{{ .Title }}</h2>
  <p>Site title: {{ $.Site.Title }}</p>
{{ end }}

<!-- Variable assignment -->
{{ $author := .Params.author }}
{{ $publishDate := .Date.Format "2006-01-02" }}
```

### Functions and Pipes

```go
<!-- Function calls -->
{{ add 1 2 3 }}
{{ strings.Replace .Title " " "-" -1 }}

<!-- Pipes -->
{{ .Title | strings.ToLower | strings.Replace " " "-" }}
{{ .Content | truncate 150 }}
```

### Conditionals and Loops

```go
<!-- Conditionals -->
{{ if .Params.featured }}
  <div class="featured">{{ .Title }}</div>
{{ else }}
  <div class="regular">{{ .Title }}</div>
{{ end }}

<!-- Loops -->
{{ range .Site.Pages }}
  <article>
    <h2>{{ .Title }}</h2>
    <time>{{ .Date.Format "2006-01-02" }}</time>
  </article>
{{ end }}
```

### Template Lookup Order

1. `layouts/posts/single.html`
2. `layouts/_default/single.html`
3. `themes/theme-name/layouts/posts/single.html`
4. `themes/theme-name/layouts/_default/single.html`

## Content Management

### Content Types

Content types are determined by directory structure:

```
content/
├── posts/           # Type: posts
├── docs/            # Type: docs
├── projects/        # Type: projects
└── _index.md        # Homepage
```

### Page Bundles

**Leaf Bundle**
```
content/
└── posts/
    └── my-post/
        ├── index.md     # Content file
        ├── image1.jpg   # Page resource
        └── image2.jpg   # Page resource
```

**Branch Bundle**
```
content/
└── posts/
    ├── _index.md        # Section page
    ├── post-1.md
    └── post-2.md
```

### Taxonomies

```yaml
# hugo.toml
[taxonomies]
  tag = "tags"
  category = "categories"
  author = "authors"
```

```yaml
# Front matter
---
title: "My Post"
tags: ["hugo", "web-development"]
categories: ["tutorials"]
authors: ["john-doe"]
---
```

### Menus

```yaml
# Front matter
---
title: "About"
menu:
  main:
    weight: 10
    name: "About Us"
---
```

```toml
# hugo.toml
[[menu.main]]
  name = "Home"
  url = "/"
  weight = 10

[[menu.main]]
  name = "Posts"
  url = "/posts/"
  weight = 20
```

## Development Workflow

### 1. Content Creation

```bash
# Create new content
hugo new content posts/new-feature.md
hugo new content docs/api-reference.md

# Create with specific archetype
hugo new content --kind api docs/users-endpoint.md
```

### 2. Development Server

```bash
# Standard development
hugo server

# Include drafts
hugo server -D

# Include future posts
hugo server -F

# Include expired content
hugo server -E

# Bind to specific address
hugo server --bind 0.0.0.0 --port 8080
```

### 3. Building

```bash
# Production build
hugo

# Build with drafts
hugo -D

# Build to specific directory
hugo -d public

# Minify output
hugo --minify
```

### 4. Content Management Commands

```bash
# List content
hugo list drafts
hugo list future
hugo list expired

# Convert content
hugo convert toYAML
hugo convert toTOML
hugo convert toJSON
```

## Best Practices

### File Organization

```
content/
├── _index.md                    # Homepage
├── about/
│   └── index.md                # About page
├── posts/
│   ├── _index.md               # Posts section
│   ├── 2024-01-15-first-post/
│   │   ├── index.md            # Post content
│   │   └── featured.jpg        # Post image
│   └── 2024-01-20-second-post.md
└── docs/
    ├── _index.md
    ├── getting-started.md
    └── api/
        ├── _index.md
        └── endpoints.md
```

### Front Matter Standards

```yaml
---
# Required fields
title: "Descriptive Title"
date: 2024-01-15T10:00:00Z
draft: false

# SEO fields
description: "Brief description for meta tags"
keywords: ["keyword1", "keyword2"]

# Organization
tags: ["tag1", "tag2"]
categories: ["category"]
weight: 10

# Custom parameters
params:
  author: "Author Name"
  reading_time: 5
  difficulty: "beginner"
  version: "1.0"
---
```

### Template Best Practices

```go
<!-- Use semantic HTML -->
<article class="post">
  <header>
    <h1>{{ .Title }}</h1>
    <time datetime="{{ .Date.Format "2006-01-02" }}">
      {{ .Date.Format "January 2, 2006" }}
    </time>
  </header>
  
  <main>
    {{ .Content }}
  </main>
  
  {{ if .Params.tags }}
  <footer>
    <ul class="tags">
      {{ range .Params.tags }}
      <li><a href="{{ "/tags/" | relURL }}{{ . | urlize }}">{{ . }}</a></li>
      {{ end }}
    </ul>
  </footer>
  {{ end }}
</article>
```

### Performance Optimization

```go
<!-- Image processing -->
{{ $image := .Resources.GetMatch "featured.jpg" }}
{{ $resized := $image.Resize "800x" }}
<img src="{{ $resized.RelPermalink }}" alt="{{ .Title }}">

<!-- Minification -->
{{ $css := resources.Get "css/main.css" | minify }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">

<!-- Caching -->
{{ $posts := where .Site.RegularPages "Type" "posts" }}
{{ $posts = $posts | first 10 }}
```

### Configuration Management

```toml
# hugo.toml
baseURL = 'https://example.com'
languageCode = 'en-us'
title = 'My Hugo Site'
theme = 'my-theme'

# Build configuration
[build]
  writeStats = true

# Markup configuration
[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
  [markup.highlight]
    style = 'github'
    lineNos = true

# Custom parameters
[params]
  author = 'Site Author'
  description = 'Site description'
  version = '1.0.0'
```

---

## Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Hugo Themes](https://themes.gohugo.io/)
- [Hugo Discourse](https://discourse.gohugo.io/)
- [Hugo GitHub](https://github.com/gohugoio/hugo)

---

*Last updated: {{ now.Format "2006-01-02" }}*