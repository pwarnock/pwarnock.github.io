---
title: 'Beads'
description:
  "Beads is a distributed, Git-backed issue tracker with DAG-based dependencies
  and priority systems designed for AI agents and multi-session project management"
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
---

Beads is a lightweight, distributed task management system built specifically for
AI agents managing complex, multi-session projects. Created by Steve Yegge, it
leverages Git as its distributed database and models work as a directed acyclic
graph (DAG) with explicit dependencies and priority levels, enabling agents to
identify "ready work" and maintain context across sessions without losing state
or requiring a central server.

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
Combine with Cody Framework, Cursor, Amp, or traditional planning documents.
Use Beads for execution-level task management while keeping strategic planning
elsewhere.

### Semantic Compaction (Memory Decay)

As agents close tasks, old issues can be semantically compacted into embeddings,
reducing database clutter while maintaining searchability. Perfect for
long-running agent projects that accumulate hundreds of closed tasks.

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

## Known Considerations

### Early Stage

Beads is young—still v0.20+. Migration between versions can require manual data
adjustments. Documentation covers basics but not all edge cases. Schema changes
happen occasionally.

### Scale Limits

Designed for project-scoped databases (< 500 issues). Performance degrades on
larger task sets. Not suitable for organization-wide issue tracking.

### Limited UI

Web UI is minimal. Most interactions happen via CLI or programmatic API. No rich
web dashboard like GitHub Issues.

### Learning Curve

The DAG model takes mental adjustment from linear issue tracking. Understanding
when to use blocking vs. related relationships requires practice.

## Why Beads Matters

Beads represents a new category of tools: **agent-native infrastructure**. It
doesn't try to be GitHub Issues with AI features. Instead, it asks "what would
an issue tracker look like if designed for distributed AI coordination?" and
builds exactly that.

The DAG model, Git-native architecture, and agent-first interface make it
uniquely suited for the next generation of AI-driven development workflows.

## External Links

- [Official GitHub Repository →](https://github.com/steveyegge/beads)
- [Beads MCP Server →](https://github.com/steveyegge/beads-mcp)
- [Installation Guide →](https://github.com/steveyegge/beads#installation)
- [CLI Documentation →](https://github.com/steveyegge/beads#usage)
- [Blog Post: Distributed Task Management for AI Agents →](/blog/posts/beads-distributed-task-management/)

---

_This tool overview is part of our comprehensive guide to
[AI development tools](/tools/). Last updated: November 12, 2025._
