---
date: 2025-12-01
draft: false
title: 'Claude Code Plugin Marketplace'
description:
  'Curated marketplace of quality-gated Claude Code plugins, skills, and
  integrations for extending AI-assisted development workflows.'
client: 'Personal Project'
technologies:
  ['Claude Code', 'Bash', 'YAML', 'Markdown', 'MCP', 'Git Hooks']
github_url: 'https://github.com/pwarnock/pwarnock-cc-plugins'
completion_date: '2025-12'
category: 'Developer Tool'
---

A curated collection of 11 Claude Code plugins and 7 marketplace skills,
organized into a quality-gated marketplace that prioritizes depth over breadth.
Each plugin is tested, security-reviewed, and documented to production standards
rather than duplicating official Anthropic documentation.

## Project Overview

Claude Code's plugin system enables extending the AI coding assistant with
custom commands, hooks, agents, and skills. This marketplace emerged from
building real-world plugins for daily development work and recognizing the need
for a curated, opinionated collection rather than a sprawling registry.

## Architecture

### Plugin Categories

The marketplace organizes plugins into five functional categories:

**Integrations** — Connect Claude Code to external services. Includes a personal
CRM backed by Notion, and a biblical study tool using Strong's Concordance.

**Developer Tools** — Curated best practices for specific frameworks. Vercel
deployment skills and Prisma ORM patterns that go beyond generic documentation.

**Workflow** — Cross-session orchestration and retrospectives. The
gastown-parallel-workflow plugin enables multi-agent coordination across git
worktrees, while session-retro captures learnings at session boundaries.

**Knowledge & Context** — Context management infrastructure. The
codified-context plugin implements a three-tier progressive disclosure system
(constitution, trigger tables, subsystem maps) for managing large codebases.

**Search & Discovery** — The githits-mcp plugin provides semantic search across
millions of open source code examples via MCP server integration.

### Marketplace Skills

Seven reusable workflow skills available for installation:

- **codification-loop** — Capture debugging insights as durable context
- **codified-context-patterns** — Three-tier context framework
- **context-health** — Evaluate project context quality
- **create-plugin** — Scaffold new Claude Code plugins
- **export-plan** — Turn agent plans into shareable RFCs
- **find-docs** — Navigate plugin development documentation
- **postmortem-writing** — Structured postmortem authoring

## Quality Gates

Every plugin passes through a review process before inclusion:

- **Functional testing** across Claude Code sessions
- **Security review** for hooks and bash execution
- **Documentation standards** with clear trigger descriptions
- **No duplication** of official Anthropic documentation
- **Opinionated design** — each plugin solves a specific workflow problem

## Technical Implementation

### Plugin Structure

Each plugin follows Claude Code's plugin specification with `plugin.json`
manifests, organized component directories for commands, skills, agents, and
hooks, and MCP server configurations where needed.

### Progressive Disclosure

Skills use YAML frontmatter with precise trigger descriptions so Claude Code
loads them only when relevant, keeping the context window efficient. This
pattern itself became a reusable skill (progressive-disclosure).

### Git Hook Integration

Several plugins include hooks that fire on Claude Code events (PreToolUse,
PostToolUse, Stop, SessionStart) enabling automated workflows like session
retrospectives and code quality gates.

## Design Philosophy

**Quality over quantity** — Better to have 11 well-tested plugins than 100
untested ones. Each plugin exists because it solved a real workflow problem.

**Composable** — Plugins work independently but compose naturally. Use
codified-context with progressive-disclosure, or session-retro with beads task
tracking.

**Agent-native** — Designed for AI agents as primary users. Clear trigger
descriptions, structured outputs, and autonomous operation where appropriate.

## Impact

- Reduced context-switching between tools during development sessions
- Established reusable patterns for plugin development adopted by other
  developers
- Demonstrated that plugin marketplaces benefit from curation and quality gates
  rather than open submission
