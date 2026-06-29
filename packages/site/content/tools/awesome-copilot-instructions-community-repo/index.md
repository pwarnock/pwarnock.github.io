---
title: 'Copilot Custom Instructions'
description:
  'The technique of shipping .instructions.md files in your repo to give GitHub Copilot persistent, scoped context'
date: 2026-03-14T00:00:00-07:00
categories: ['developer-centric']
tags: ['github-copilot', 'ai-coding', 'prompt-engineering', 'instructions', 'context-engineering']
external_url: 'https://github.com/github/awesome-copilot/tree/main/instructions'
website: 'github.com/github/awesome-copilot'
tool_category: 'AI Coding Tools'
radar:
  quadrant: 'Techniques'
  ring: 'Trial'
slug: 'awesome-copilot-instructions-community-repo'
draft: false
---

Copilot supports `.instructions.md` files that live in your repo and give it persistent context — coding standards, framework conventions, architectural constraints. Same idea as CLAUDE.md for Claude Code or AGENTS.md for Codex, but with per-topic scoping so you can have separate instruction files for different concerns.

## The technique

Instead of repeating context in every prompt, codify it once as a file. Copilot loads relevant instruction files based on the workspace and files you're editing. The [awesome-copilot repo](https://github.com/github/awesome-copilot/tree/main/instructions) has 160+ community-maintained examples to start from or adapt.

## Why it's on the radar

This is the same pattern emerging across every AI coding tool — persistent, repo-level context that travels with the code. Copilot's version is worth trialing because:

- It's per-topic scoped (one file per concern), not one monolithic file
- The community library gives you a starting point instead of writing from scratch
- The pattern is transferable — good instruction files can be adapted for Claude Code or Codex

Currently trying: `context-engineering`, `self-explanatory-code-commenting`, `playwright-typescript`, `nextjs`, `github-actions-ci-cd-best-practices`.

## What to figure out

- Which instruction files actually improve output vs just adding token noise
- How well they compose when multiple apply to the same file
- Whether Copilot's per-topic scoping is better than a single CLAUDE.md approach, or if it leads to fragmentation
- How to keep instruction files from going stale as the codebase evolves

## Links

- [awesome-copilot instructions](https://github.com/github/awesome-copilot/tree/main/instructions)
