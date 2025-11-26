---
title: 'Beads'
description:
  'Beads is a distributed, Git-backed issue tracker with DAG-based dependencies
  and priority systems designed for AI agents and multi-session project
  management'
date: 2025-11-12T10:00:00Z
categories: ['project-management']
tags:
  [
    'task-management',
    'ai-agents',
    'distributed-systems',
    'git-native',
    'project-planning',
    'workflow-automation',
  ]
external_url: 'https://github.com/steveyegge/beads'
website: 'github.com'
tool_category: 'Task Management & Planning'
slug: 'beads-distributed-task-management-for-agents'
aliases: ['/tools/beads/']
radar:
  quadrant: 'Tools'
  ring: 'Assess'
image: '/images/tools/beads-distributed-task-management-for-agents.png'
---

Beads is a lightweight, distributed task management system built specifically
for AI agents managing complex, multi-session projects. Created by Steve Yegge,
it leverages Git as its distributed database and models work as a directed
acyclic graph (DAG) with explicit dependencies and priority levels, enabling
agents to identify "ready work" and maintain context across sessions without
losing state or requiring a central server.

## Core Features

### Directed Acyclic Graph (DAG) Dependencies

- **Explicit Task Relationships**: Model blocking dependencies, parent-child
  relationships, and thematic links
- **Ready Work Detection**: Automatically surface tasks with no blocking
  dependencies and high priority
- **Dependency Visualization**: View full dependency trees and impact analysis
- **Multi-type Relationships**: Supports "blocks," "related," "parent," and
  "discovered-from" link types

### Priority-Driven Task Management

- **5-Level Priority System**: Critical (0), High (1), Medium (2), Low (3),
  Backlog (4)
- **Priority + Readiness**: Combine priority with dependency status to determine
  actual work urgency
- **Smart Task Sorting**: Get highest-impact unblocked work first
- **Threshold-Based Filtering**: Filter work by priority level and status

### Git-Native Architecture

- **No Central Server**: Uses Git as distributed database for complete
  decentralization
- **Local SQLite Cache**: Fast local queries with automatic sync to Git
- **JSONL Source of Truth**: Single `.beads/issues.jsonl` file committed to Git
- **Custom Merge Driver**: Intelligent conflict resolution for concurrent edits
  from multiple agents
- **Protected Branch Support**: Works with strict Git workflows and branch
  protection rules

### Agent-Friendly Interface

- **JSON-First Output**: Every command supports `--json` for programmatic use
- **MCP Server Support**: Use Claude, OpenAI, or other MCP-compatible clients
  directly with Beads
- **Batch Operations**: Import and export large task sets efficiently
- **Audit Trail**: Complete history of all changes for reconstruction and
  debugging

### Multi-Agent Coordination

- **Distributed by Design**: Multiple agents on different branches/machines can
  coordinate through Git
- **Hash-Based IDs** (v0.20.1+): Collision-resistant task IDs for safe
  concurrent creation
- **No Conflicts**: Concurrent edits merge safely without manual intervention
- **Zero Coordinator**: No central service needed for multi-agent workflows

## Technical Specifications

- **Platform**: CLI (cross-platform), MCP server, Python package
- **Backend**: SQLite (local cache) + Git (distributed sync)
- **Storage**: JSON Lines (`.beads/issues.jsonl`)
- **Database Format**: Extendable schema with custom table support
- **Performance**: Fast queries for <200 issues; performance degrades on larger
  databases
- **Integration Points**: Git hooks, shell completion, CI/CD pipelines, MCP
  servers

## Unique Advantages

### Purpose-Built for AI Agents

Unlike general-purpose issue trackers, Beads' entire design assumes an AI agent
as the primary user. The `--json` interface isn't an afterthought but the
primary way the system works. The DAG model forces you to think about
dependencies explicitly, preventing agents from attempting impossible tasks.

### Distributed Without Compromise

Most distributed systems trade consistency or complexity. Beads uses Git's merge
model (which developers already understand) combined with a custom merge driver,
giving you both safety and simplicity. No background daemons, no eventual
consistency headaches, just Git.

### Framework-Agnostic

Beads works _alongside_ other planning systems rather than replacing them.
Combine with Cody Framework,
[Amp](/tools/amp-free-ad-supported-cli-ai-coding-tool/),
[Cursor](/tools/cursor-ai-first-code-editor/), or traditional planning
documents. Use Beads for execution-level task management while keeping strategic
planning elsewhere.

### Semantic Compaction (Memory Decay)

Beads supports compacting closed issues into embeddings to reduce database size
while maintaining searchability. This feature is especially useful for
long-running projects that accumulate hundreds of closed tasks, though it's
still evolving.

## Use Cases

- **Multi-Session AI Agent Projects**: Maintain task state and priorities across
  agent sessions without loss of context
- **Distributed Team Development**: Multiple developers and agents coordinating
  work across branches and machines
- **Agent Workflow Automation**: Build complex agent workflows where decisions
  depend on task dependencies and priority
- **Structured Planning**: Combine high-level planning documents with
  execution-level task tracking in Beads
- **Concurrent Agent Coordination**: Multiple AI agents working on same project
  in parallel without conflicts
- **Audit & Compliance**: Git-backed audit trail matches source code revisions
  for traceability
- **Discovery & Backlog Management**: Automatically link newly discovered work
  back to original discovery context

## Getting Started

### Installation

```bash
# Via pip (for MCP server)
pip install beads-mcp

# Via npm
npm install -g beads-mcp

# From source
git clone https://github.com/steveyegge/beads
cd beads && pip install -e .
```

### Quick Start

```bash
# Initialize Beads in project
bd init

# Create your first task
bd create "Implement user authentication" -t feature -p 1

# Create a dependent task
bd create "Write auth tests" -t task -p 2 --deps "blocks:bd-1"

# Check what's ready to work on
bd ready --json

# Update task status
bd update bd-1 --status in_progress

# Close completed work
bd close bd-1 --reason "Merged in PR #42"

# View dependency graph
bd dep list bd-1
```

### With MCP Server

```bash
# Start MCP server
beads-mcp

# Connect Claude or your AI tool to the Beads MCP server
# Then ask: "What's my highest priority unblocked work?"
```

## Integration Patterns

### With Cody Framework

Use Beads as the execution-layer task tracker within
[Cody Framework](https://github.com/icodewith-ai/cody-framework) while keeping
feature backlog and retrospectives in `.cody/` directory. Link discovered work
with `discovered-from` dependencies.

### With CI/CD

Automatically close tasks when PRs merge:

```bash
bd close "$TASK_ID" --reason "Merged in PR #$PR_NUMBER"
```

### With Planning Documents

Create tasks from planning documents during planning phase, then track execution
separately. Cross-link with task URLs.

### Multi-Agent Workflows

Each agent commits task updates independently. Git merge driver resolves
concurrent changes. Task statuses propagate on `git pull`.

## Realistic Assessment

Beads solves a genuine problem in distributed AI coordination, but it's not a
drop-in replacement for existing issue trackers. Success depends on your use
case and willingness to adapt your workflow to its model.

**Strengths**: The DAG model genuinely prevents agents from attempting blocked
work. The Git-native design is elegant and requires no infrastructure. The
`--json` interface is first-class, not bolted on.

**Tradeoffs**: You're adopting early-stage software. You'll hit occasional
schema migrations. You can't use it as your sole planning system for large
teams.

## Known Considerations

### Alpha-Quality Development

Beads is under heavy development (v0.20+). Version upgrades occasionally require
manual data adjustments (e.g., the v0.20.1 transition to hash-based IDs). The
API surface evolves, though the core model remains stable. Documentation covers
common paths but not all edge cases.

### Scale Limitations

Optimized for project-scoped databases (< 500 issues). Performance degrades
noticeably beyond 200 tasks. Not suitable for organization-wide issue tracking
or as a GitHub Issues replacement.

### Interface Trade-offs

No rich web dashboard. Most interactions via CLI or `--json` API. Creating
dependent tasks or visualizing large graphs requires piping JSON through `bd`
commands. This is intentional—agents are the primary users.

### Learning Curve

The DAG model requires mental adjustment from linear issue lists. Understanding
when to use blocking vs. related relationships, and how priority + readiness
work together, takes practice.

## Why It Matters (For Agents)

Beads represents a new category: **agent-native infrastructure**. Rather than
add AI features to existing trackers, it asks "what would task coordination look
like if designed for distributed AI from the start?"—and builds that.

The result is a system where agents can reliably discover unblocked work, update
state concurrently without conflicts, and maintain context across distributed
machines and sessions. It's not for everyone, but for agent workflows it's a
genuine innovation.

## Related Tools & Resources

**AI Coding Agents That Benefit from Beads Integration:**

- [Amp](/tools/amp-free-ad-supported-cli-ai-coding-tool/) — Free CLI agent with
  message queueing
- [Claude Code](/tools/claude-code-conversational-ai-coding-assistant/) —
  Terminal-based AI assistant
- [Windsurf](/tools/windsurf-agentic-ide-cognition-ai/) — Agentic IDE with
  autonomous capabilities
- [Cursor](/tools/cursor-ai-first-code-editor/) — AI-first code editor
- [DeepAgent](/tools/deepagent-vs-code-fork-abacus-ai-integration/) — Autonomous
  agent with CLI

**Planning & Context:**

- [Vibe Coding Revolution](/blog/posts/vibe-coding-revolution/) — Overview of
  modern AI coding tools
- [Amp Features Deep Dive](/blog/posts/amp-coding-agent-features/) — Features
  for agent coordination

## External Links

- [Official GitHub Repository →](https://github.com/steveyegge/beads)
- [Beads MCP Server →](https://github.com/steveyegge/beads-mcp)
- [Installation Guide →](https://github.com/steveyegge/beads#installation)
- [CLI Documentation →](https://github.com/steveyegge/beads#usage)
- [Blog Post: Honest Review & Real-World Integration →](/blog/posts/beads-distributed-task-management/)

---

_This tool overview is part of our comprehensive guide to
[AI development tools](/tools/). Last updated: November 12, 2025._

**Website**: [github.com](https://github.com/pwarnock/beads)
