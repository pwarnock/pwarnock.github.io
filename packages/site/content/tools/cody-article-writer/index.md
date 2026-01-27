---
title: 'Cody Article Writer'
summary: 'AI-assisted article writing skill for Claude Code with structured workflows, style guides, and iterative collaboration.'
date: 2026-01-05T17:00:00Z
draft: false
tags: ['AI Writing', 'Content Creation', 'Claude Code']
author: 'Peter Warnock'
---

Cody Article Writer is an AI-assisted writing system designed for Claude Code. It provides a structured, iterative workflow for producing quality articles with customizable style guides.

## What It Does

The skill guides you through a complete article creation process:

1. **Topic Ideation** - Refine your raw idea with AI collaboration
2. **Style Selection** - Choose or create a voice profile (tone, humor, technical level, formatting preferences)
3. **Title & Thesis** - Craft a compelling title and thesis statement
4. **Outline** - Generate structured sections based on your style guide
5. **Section Confirmation** - Review and adjust the outline structure
6. **Article Writing** - Write section-by-section or as a full draft
7. **Article Approval** - Review and request changes
8. **Editorial Pass** - Optional polish for formatting and prose
9. **Metadata** - Generate title, description, and keywords
10. **Export** - Produce a markdown file with YAML frontmatter

All state is persisted in JSON files, allowing you to resume work after interruptions.

## Key Features

- **Structured Workflow**: Phase-by-phase guidance ensures comprehensive coverage
- **Style Guides**: Customizable voice profiles (tone 0-10, humor, technical depth, formatting preferences)
- **State Persistence**: Drafts saved automatically, resumable sessions
- **Editor Pass**: Optional polish step for quality refinement
- **Frontmatter Generation**: Automatic metadata for Hugo, Jekyll, etc.

## How I Used It

I used Cody Article Writer during my [Demoing Gastown with Cody Article Writer Skill](/blog/posts/demoing-gastown-cody-article-writer/) to write [The Future of AI-Powered Development](/blog/posts/the-future-of-ai-powered-development/).

The workflow demonstrated:

- **Setup**: Extracted the skill into `.claude/skills/`
- **Execution**: Ran the full 10-phase workflow
- **Style**: Used "Tech Professional" profile (tone 7/10, technical 8/10)
- **Output**: Produced a 4,200-word article with proper frontmatter

The skill handled everything from thesis development through export, producing publication-ready markdown.

## Directory Structure

```
cody-projects/article-writer/
├── styles/           # Style guide files (.json)
├── drafts/           # Work-in-progress (.json)
├── articles/         # Exported articles (.md)
└── archive/          # Completed drafts (.json)
```

## Installation

```bash
# Download and extract the skill
unzip cody-article-writer.skill -d .claude/skills/
```

The skill becomes available to any Claude Code instance in that context.

## Usage

Within Claude Code, use natural language commands:

- "write an article about [topic]"
- "continue my article"
- "show my drafts"
- "show my articles"
- "list my writing styles"

## Related

- **Blog Post**: [Demoing Gastown with Cody Article Writer Skill](/blog/posts/demoing-gastown-cody-article-writer/)
- **Article Produced**: [The Future of AI-Powered Development](/blog/posts/the-future-of-ai-powered-development/)
- **Official Repo**: [ibuildwith-ai/cody-article-writer](https://github.com/ibuildwith-ai/cody-article-writer)

---

_Tags: AI Writing, Content Creation, Claude Code_
