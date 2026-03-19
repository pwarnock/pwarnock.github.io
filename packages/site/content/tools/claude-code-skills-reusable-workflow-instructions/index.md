---
title: 'Claude Code Skills'
description:
  'Reusable instruction packages for Claude — teach it workflows once via SKILL.md files instead of re-explaining every session'
date: 2026-03-14T00:00:00-07:00
categories: ['developer-centric']
tags: ['claude', 'anthropic', 'ai-coding', 'prompt-engineering', 'context-engineering', 'skills']
external_url: 'https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf'
website: 'anthropic.com'
tool_category: 'AI Coding Tools'
radar:
  quadrant: 'Techniques'
  ring: 'Trial'
slug: 'claude-code-skills-reusable-workflow-instructions'
draft: false
---

A skill is a folder with a `SKILL.md` file that teaches Claude how to handle a specific task or workflow. Instead of re-explaining your preferences, processes, and domain expertise every conversation, you codify it once and Claude loads it when relevant.

## How it works

Skills use progressive disclosure — three levels of context loading:

1. **YAML frontmatter** — always loaded into Claude's system prompt. Just enough for Claude to know when to activate the skill.
2. **SKILL.md body** — loaded when Claude thinks the skill is relevant. Full instructions and guidance.
3. **Linked files** (`scripts/`, `references/`, `assets/`) — additional files Claude discovers and navigates as needed.

This minimizes token usage while keeping specialized expertise available.

## Three categories Anthropic has observed

- **Document & asset creation** — consistent output following style guides and templates (e.g., frontend-design skill)
- **Workflow automation** — multi-step processes with validation gates and iteration loops (e.g., skill-creator skill)
- **MCP enhancement** — workflow guidance layered on top of MCP tool access (e.g., Sentry code review skill)

## Why it's on the radar

Already using skills heavily in this project. The technique is the same pattern as Copilot's `.instructions.md` files but with more structure — progressive disclosure, composability (multiple skills active simultaneously), and portability across Claude.ai, Claude Code, and API.

Anthropic's guide covers planning, testing with success metrics (quantitative and qualitative), and distribution via GitHub or skills.sh. The testing framework is worth reading — they suggest tracking trigger accuracy (does it activate for 90% of relevant queries?), workflow completion (X tool calls), and consistency (same request 3-5 times, compare output).

## Links

- [The Complete Guide to Building Skills for Claude (PDF)](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
