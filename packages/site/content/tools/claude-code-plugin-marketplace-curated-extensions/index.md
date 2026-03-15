---
title: 'pwarnock-cc-plugins'
description:
  'Curated marketplace of quality-gated Claude Code plugins, skills, and
  integrations organized by category with opinionated best practices for
  AI-assisted development workflows'
date: 2025-12-01T10:00:00Z
categories: ['ai-coding']
tags:
  [
    'claude-code',
    'plugins',
    'skills',
    'mcp',
    'developer-tools',
    'workflow-automation',
    'context-management',
  ]
external_url: 'https://github.com/pwarnock/pwarnock-cc-plugins'
website: 'github.com'
tool_category: 'AI Coding Tools'
slug: 'claude-code-plugin-marketplace-curated-extensions'
aliases: ['/tools/cc-plugins/']
radar:
  quadrant: 'Tools'
  ring: 'Adopt'
---

pwarnock-cc-plugins is a curated marketplace of Claude Code plugins and
reusable skills, organized into functional categories with quality gates that
prioritize depth, security review, and real-world testing over volume. It
provides 11 plugins across 5 categories and 7 marketplace skills for extending
Claude Code's capabilities.

## Core Features

### Plugin Categories

- **Integrations**: Connect Claude Code to external services (Notion CRM,
  Strong's Concordance for biblical study)
- **Developer Tools**: Curated best practices for Vercel and Prisma that go
  beyond generic documentation
- **Workflow**: Cross-session orchestration via gastown-parallel-workflow and
  session retrospectives
- **Knowledge & Context**: Three-tier progressive disclosure system for managing
  large codebase context (constitution, trigger tables, subsystem maps)
- **Search & Discovery**: Semantic search across millions of open source
  examples via githits-mcp

### Marketplace Skills

Seven installable workflow skills:

- **codification-loop** — Capture debugging insights as durable context
- **codified-context-patterns** — Three-tier context framework
- **context-health** — Evaluate project context quality and coverage
- **create-plugin** — Scaffold new Claude Code plugins from templates
- **export-plan** — Convert agent plans into shareable RFCs
- **find-docs** — Navigate plugin development documentation
- **postmortem-writing** — Structured incident postmortem authoring

### Quality Gates

Every plugin passes functional testing, security review for hooks and bash
execution, documentation standards enforcement, and duplication checks against
official Anthropic docs. The marketplace is opinionated — each plugin exists
because it solved a real workflow problem.

## Technical Specifications

- **Platform**: Claude Code plugin system
- **Plugin Format**: `plugin.json` manifests with commands, skills, agents, hooks
- **Integration**: MCP servers, git hooks, YAML frontmatter triggers
- **Installation**: Clone repo + symlink or add to Claude Code plugin path
- **Compatibility**: Claude Code with plugin support enabled

## Unique Advantages

### Curated Over Open

Unlike open plugin registries, this marketplace applies quality gates before
inclusion. Fewer plugins, but each one is tested and documented to production
standards. No duplication of official Anthropic documentation.

### Progressive Disclosure Native

Skills use precise YAML frontmatter trigger descriptions so Claude Code loads
them only when contextually relevant. This keeps the context window efficient
and reduces false activations.

### Composable Design

Plugins work independently but compose naturally. Combine codified-context with
progressive-disclosure for context management. Pair session-retro with beads
for persistent task tracking across sessions.

### Agent-First Philosophy

Designed for AI agents as primary consumers. Clear trigger descriptions,
structured outputs, autonomous operation where appropriate, and `--json`
interfaces for programmatic use.

## Use Cases

- **Workflow Automation**: Automate session retrospectives, code quality gates,
  and context capture without manual intervention
- **Context Management**: Maintain durable project context that survives
  conversation compaction and session boundaries
- **Multi-Agent Coordination**: Orchestrate parallel agent work across git
  worktrees with gastown-parallel-workflow
- **Framework Integration**: Get opinionated Vercel and Prisma patterns that
  reflect real-world usage, not generic docs
- **Plugin Development**: Use create-plugin skill to scaffold new plugins
  following established patterns

## Getting Started

### Installation

```bash
# Clone the marketplace
git clone https://github.com/pwarnock/pwarnock-cc-plugins

# Individual plugins can be symlinked to your Claude Code plugins directory
ln -s /path/to/pwarnock-cc-plugins/plugins/codified-context \
  ~/.claude/plugins/codified-context

# Or add the entire marketplace to your plugin path
```

### Using Skills

```bash
# Skills are available after plugin installation
# Invoke via slash commands in Claude Code
/codification-loop
/context-health
/create-plugin
```

## Realistic Assessment

**Strengths**: The quality-gated approach means every plugin actually works and
is well-documented. The progressive disclosure pattern keeps context windows
efficient. Composable design lets you adopt individual plugins without buying
into the whole ecosystem.

**Tradeoffs**: Smaller catalog than open registries. Opinionated choices may
not match every workflow. Some plugins (gastown, codified-context) have a
learning curve due to their architectural ambition.

## Known Considerations

### Evolving Ecosystem

Claude Code's plugin system is actively developing. Plugin APIs and hook events
may change across versions. The marketplace tracks these changes but some lag
is inevitable.

### Opinionated by Design

This is not a neutral registry. Plugins reflect specific workflow philosophies
(progressive disclosure, codified context, session retrospectives). If your
workflow differs significantly, individual plugins may be more useful than the
full collection.

## Related Tools & Resources

**Claude Code Ecosystem:**

- [Claude Code](/tools/claude-code-conversational-ai-coding-assistant/) —
  Terminal-based AI coding assistant
- [Claude Code Skills](/tools/claude-code-skills-reusable-workflow-instructions/) —
  Reusable workflow instructions
- [Beads](/tools/beads-distributed-task-management-for-agents/) — Distributed
  task management for agents

**Workflow & Context:**

- [Context7](/tools/context7-library-documentation-research-platform/) —
  Library documentation research

## External Links

- [GitHub Repository →](https://github.com/pwarnock/pwarnock-cc-plugins)
- [Claude Code Documentation →](https://docs.anthropic.com/en/docs/claude-code)

---

_This tool overview is part of our comprehensive guide to
[AI development tools](/tools/). Last updated: December 1, 2025._
