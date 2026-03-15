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

The pattern that keeps showing up in AI coding tools is the gap between what a model *can* do and what it *does* do without context. I hit this with [Claude Code](/tools/claude-code-conversational-ai-coding-assistant/) — it's capable enough, but every new session starts from zero. Skills close that gap by letting you codify workflows once instead of re-explaining them.

This site runs about a dozen skills now. Blog post creation, tech radar entries, draft review, portfolio generation — each one is a `SKILL.md` file that Claude loads when it recognizes the task. The interesting part isn't the format (it's just markdown with YAML frontmatter). It's the progressive disclosure: Claude only loads the full instructions when it thinks the skill is relevant, which keeps token usage reasonable while making specialized expertise available on demand.

## What makes this different from Copilot instructions

[GitHub Copilot](/tools/github-copilot-2025-update-multi-model-ai-assistant/) has a similar concept with `.instructions.md` files, and there's a [growing community repo](https://github.com/github/awesome-copilot/tree/main/instructions) collecting them. Skills take the same idea further — they compose (multiple skills active simultaneously), they support linked assets like scripts and reference files, and they work across Claude.ai, Claude Code, and the API.

The real difference is behavioral: Copilot instructions shape *how* code gets written. Skills shape *what Claude does* — full multi-step workflows with validation gates, iteration loops, and tool orchestration. It's the difference between "use tabs not spaces" and "here's how to create, review, and publish a blog post end to end."

## What I've learned using them

The hardest part is trigger accuracy — writing a description that activates the skill for the right queries without false positives. Anthropic's guide suggests testing this: run the same request 3-5 times, track whether the skill fires, and measure output consistency. In practice I've found that specific verb phrases in the description ("Use when the user wants to review drafts") work better than noun-heavy descriptions.

Skills that wrap [MCP tool access](/tools/claude-code-plugin-marketplace-curated-extensions/) tend to be the most valuable — they add workflow guidance on top of raw capability. A Playwright MCP server gives Claude browser automation; a skill tells it *when* to screenshot, *what* to ask the user, and *how* to handle feedback loops.

## Links

- [The Complete Guide to Building Skills for Claude (PDF)](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
