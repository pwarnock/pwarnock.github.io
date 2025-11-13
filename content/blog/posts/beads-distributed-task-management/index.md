---
title: 'Beads: Distributed Task Management for AI Agents'
date: 2025-11-12T10:00:00Z
draft: true
tags: ['AI-Coding', 'Development-Tools', 'Task-Management', 'Agents', 'Project-Planning']
author: 'Peter Warnock'
description: "Beads is a distributed issue tracker built for AI agents. Its DAG-based dependency model, priority system, and Git integration make it ideal for complex multi-agent projects—despite early growing pains."
image: 'featured-image.png'
---

One of the biggest challenges with AI coding agents is maintaining context and continuity across sessions. Steve Yegge's [Beads](https://github.com/steveyegge/beads) addresses this with a novel approach: a graph-based, Git-backed issue tracking system designed specifically for AI agents that need persistent memory across long-running projects.

## What Makes Beads Different

Most issue trackers treat tasks as isolated units. Beads builds something more sophisticated: a **directed acyclic graph (DAG)** where tasks have explicit dependencies, priorities, and visibility into what work is ready to tackle. This is crucial for agents.

### The DAG Priority System

Beads' core innovation is thinking of tasks not as a flat list but as a graph with relationships:

- **Blocking relationships**: Task A blocks task B until A completes
- **Discovered-from links**: When an agent finds new work, it can link it to the discovery context
- **Parent-child relationships**: Break complex features into subtasks
- **Related tasks**: Connect thematically similar work

Combined with **priority levels (0-4)**, this creates a rich decision space. An agent can ask: "What high-priority work has no blockers?" and immediately know what to tackle next.

```bash
# Automatically surface unblocked, ready work
bd ready --json
```

This is fundamentally different from sorting by priority alone. A task might be P0 critical but still be blocked because it depends on work elsewhere. The DAG prevents agents from thrashing on impossible tasks.

## Git-Native Design

Beads uses Git as its distributed database. No server, no daemon. Here's the elegance:

1. **Local SQLite cache** (`.beads/`) for fast queries—ignored by Git
2. **JSONL source of truth** (`.beads/issues.jsonl`) commits to Git
3. **Auto-sync**: Changes export to JSONL (with debounce), imports on `git pull`
4. **Custom merge driver**: Handles concurrent edits from multiple agents without conflicts

This architecture means:

- Multiple agents can work on the same project simultaneously
- Version control gives you complete audit trail
- Zero infrastructure overhead
- Works with protected branches and strict Git workflows

As an agent developer, you get something remarkable: **distributed coordination without a coordinator**.

## The Growing Pains

Beads is young, and that shows. When I started using it with the [Cody Framework](https://github.com/icodewith-ai/cody-framework), I hit several rough edges:

### Migration Challenges

Early versions had different schema structures. Upgrading from v0.19 to v0.20+ required careful data migration. The hash-based ID system introduced in v0.20.1 is much better for multi-worker environments, but the transition wasn't seamless.

### Documentation Gaps

The README covers the basics well, but subtle behaviors (like the debounce delay for JSONL exports, or how the merge driver handles deleted vs. closed issues) require reading source code or trial and error.

### Incomplete CLI Coverage

Some operations feel awkward on the command line. Creating dependent tasks or visualizing the full dependency tree requires piping JSON around. The web UI is minimal compared to GitHub Issues.

### Performance on Large Projects

With 200+ issues, some queries get noticeably slower. This isn't a dealbreaker, but it means Beads works better for project-scoped databases than organization-wide issue tracking.

## Why It Still Works

Despite these friction points, Beads' core design is sound. Here's why I keep using it:

### Integration with Planning Frameworks

Beads plays well with other planning systems. In the Cody Framework, we use Beads for **tactical work items** (individual tasks, bugs, features) while keeping **strategic planning** in markdown documents. They complement rather than compete.

The `bd create` with `--deps discovered-from` gives you a natural way to surface work discovered during planning sessions back to the execution layer.

### Agent-Friendly by Default

Every command has a `--json` flag. The output is clean, parseable, and sufficient for building agent workflows:

```bash
# Get ready work as JSON
bd ready --json

# Update multiple tasks based on agent decisions
bd update bd-123 --status in_progress --json
bd close bd-456 --reason "Fixed in PR #789" --json
```

This isn't bolted on—it's a first-class interface. You can build entire agent workflows around Beads without ever touching the human-friendly CLI.

### MCP Server Support

The [Beads MCP server](https://github.com/steveyegge/beads-mcp) bridges the gap between Claude, OpenAI, and Beads. Your agent can directly ask "what's my highest-priority unblocked work?" and get a curated list.

## The Framework Advantage

What excites me most is how Beads changes the conversation about agent workflows. Instead of asking "how do we prevent agents from forgetting?" we ask "how do we structure the problem so agents can reliably solve it?"

The DAG forces you to think deeply about dependencies. The ready-work detection prevents agents from attempting impossible tasks. The Git integration gives you an audit trail that matches your source code's revision history.

## Getting Started

If you're building multi-session projects or working with teams of agents:

1. **Install**: `pip install beads-mcp` or `npm install -g beads-mcp`
2. **Initialize**: `bd init` creates `.beads/issues.jsonl`
3. **Create work**: `bd create "Task name" -t task -p 2`
4. **Set dependencies**: `bd add-dep bd-1 --blocks bd-2`
5. **Check ready work**: `bd ready --json`

The initial friction is real, but once you internalize the DAG model, the workflow becomes natural.

## The Verdict

Beads is solving a genuine problem at the intersection of distributed systems, AI coordination, and developer tooling. It's young enough to have rough edges but mature enough to carry real projects. The DAG-based dependency model is genuinely innovative—I haven't seen this thinking applied to issue tracking elsewhere.

For AI agent projects in particular, it's worth the learning curve. The architecture acknowledges that agents think differently than humans, and it optimizes for agent decision-making rather than retrofitting existing workflows.

Not quite production-ready for large orgs, but absolutely ready for teams experimenting with AI-driven development. The growing pains are worth the gain.

---

*Have thoughts on Beads or distributed task management for agents? I'd love to hear about your experience. Reach out on [X](https://x.com/pwarnock) or [LinkedIn](https://www.linkedin.com/in/pwarnock/).*

**Related Tools**: Beads integrates well with [Cody Framework](https://github.com/icodewith-ai/cody-framework) for structured agent workflows, and works great with [OpenCode](/tools/opencode-flexible-ai-coding-platform/) for distributed team development.
