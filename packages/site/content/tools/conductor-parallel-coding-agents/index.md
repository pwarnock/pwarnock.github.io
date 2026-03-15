---
title: 'Conductor'
description:
  'macOS app for running multiple Claude Code agents in parallel across isolated git worktrees with Linear and GitHub integration'
date: 2026-03-14T00:00:00-07:00
categories: ['developer-centric']
tags: ['ai-coding', 'developer-tools', 'agents', 'worktrees', 'parallel']
external_url: 'https://www.conductor.build/'
website: 'conductor.build'
tool_category: 'AI Coding Tools'
radar:
  quadrant: 'Tools'
  ring: 'Assess'
slug: 'conductor-parallel-coding-agents'
draft: true
---

macOS app from Melty Labs for running multiple Claude Code (or Codex) agents simultaneously across isolated git worktrees. Each workspace gets its own branch and copy of the repo.

## What it does

- Runs parallel Claude Code instances across worktrees with a visual UI
- Integrates with Linear and GitHub — inject issues as context, open PRs from the app
- Lets you hand off plans between agents, provide feedback mid-run, and review code
- Handles all the git worktree management for you

## Why it's on the radar

The parallel worktree pattern is something I already do manually. Conductor puts a UI on it and adds the Linear integration, which could be useful for turning a backlog into parallel agent work. The target audience is senior devs and tech leads whose day is a series of interruptions — chunk out well-defined tasks and let agents work them in parallel.

Haven't tried it yet.

## Open questions

- macOS only for now — Windows and Linux coming
- How does it compare to just running multiple Claude Code sessions in tmux?
- Does the overhead of the UI and worktree management justify itself over a script?

## Links

- [conductor.build](https://www.conductor.build/)
- [Docs](https://docs.conductor.build/)
