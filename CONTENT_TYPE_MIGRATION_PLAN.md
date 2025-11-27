# Content Type Migration Plan

## Overview

Audit of 13 blog posts to classify by content type and migrate to new system.

## Current Status

- **Total posts**: 13
- **Already classified**: 2
- **Need classification**: 11

## Already Classified

1. **terminal-upgrades-for-cli-development** → `curated` (external Substack
   content)
2. **phase-1-cody-beads-integration-complete** → `project` (internal milestone)

## Posts Requiring Classification

### Need Review

1. **principles-over-methods** - [REVIEW]
2. **amp-coding-agent-features** - [REVIEW]
3. **chatgpt-atlas-launch** - [REVIEW]
4. **major-infrastructure-overhaul-bun-migration-path-based-builds** - [REVIEW]
5. **my-first-post** - [REVIEW]
6. **stay-grounded-calvin-hobbes** - [REVIEW]
7. **vibe-coding-revolution** - [REVIEW]
8. **exploring-web-components** - [REVIEW]
9. **seth-godin-daily-journal-prompts-calendar** - [REVIEW]
10. **beads-distributed-task-management** - [REVIEW]
11. **grokipedia-0-1-launch** - [REVIEW]

## Classification Criteria

### Original Content

- Written by Peter Warnock
- Original thoughts, tutorials, or technical content
- No external source attribution needed

### Curated Content

- External content with commentary
- Has attribution and source URL
- Embedded from external platforms

### Project Content

- Internal project updates
- Milestones and status reports
- Process documentation

### Embedded Content

- Direct embeds from platforms
- Minimal original commentary
- Platform-specific content

## Migration Tasks

- [ ] Review each post for content type
- [ ] Add `content_type` field to frontmatter
- [ ] Validate with updated validation script
- [ ] Update any missing required fields
- [ ] Test rendering with new badge system
