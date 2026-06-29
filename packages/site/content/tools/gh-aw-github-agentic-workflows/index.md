---
title: 'gh-aw'
description:
  'GitHub Agentic Workflows — define repo automation in markdown, run coding agents in Actions with sandboxed execution'
date: 2026-03-14T00:00:00-07:00
categories: ['developer-centric']
tags: ['ai-coding', 'developer-tools', 'github', 'automation', 'ci-cd', 'agents']
external_url: 'https://github.github.com/gh-aw/'
website: 'github.github.com/gh-aw'
tool_category: 'AI Coding Tools'
radar:
  quadrant: 'Tools'
  ring: 'Assess'
slug: 'gh-aw-github-agentic-workflows'
draft: false
---

GitHub's take on running coding agents (Copilot, Claude, Codex) inside Actions workflows. You write automation in markdown instead of YAML. The interesting part is the security model — read-only by default, sandboxed execution, tool allowlisting, and network isolation for anything that writes.

Still early. GitHub themselves say "use it with caution, and at your own risk."

## What it does

- Defines repo automations in markdown files
- Triggers on issues, PRs, discussions, or schedules
- Runs whichever coding agent you point it at
- Handles things like issue triage, doc updates, test improvements, CI failure analysis

## Why it's on the radar

Interesting middle ground between "agent does everything on your laptop" and "agent is a black box SaaS." Running agents inside Actions means you get the audit trail, the permissions model, and the existing GitHub infrastructure for free. The markdown-as-workflow definition is worth watching — could make agent automation more accessible than writing custom Actions YAML.

## Open questions

- How well does the sandbox actually contain agents that want to do more?
- What's the cost profile when agents burn Actions minutes?
- How does it compare to just calling an agent API from a regular workflow?

## Links

- [gh-aw docs](https://github.github.com/gh-aw/)
