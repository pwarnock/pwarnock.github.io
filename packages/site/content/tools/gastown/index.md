---
title: 'Gastown'
summary: 'Multi-agent orchestrator for Claude Code. Track work with convoys, sling to agents, and coordinate complex workflows.'
date: 2026-01-05T17:00:00Z
draft: false
tags: ['AI Orchestration', 'Multi-Agent Systems', 'Developer Tools']
author: 'Peter Warnock'
---

Gastown (also called "gt") is a multi-agent workspace manager for Claude Code. It provides structured work tracking, agent coordination, and persistent state across sessions.

## What It Does

Gastown solves the problem of managing AI-assisted development at scale:

- **Convoys**: Group related issues and track progress as a unit
- **Sling**: Assign work to specialized agents (polecats)
- **Beads Integration**: Git-backed issue tracking that survives restarts
- **Tmux Sessions**: Run multiple agents in parallel sessions
- **Mayoral Coordination**: AI-powered cross-project coordination

Without Gastown, agents forget work after restarts and coordination is manual. With Gastown, work persists on "hooks" and agents can resume where others left off.

## Core Concepts

### Town Structure

```
~/gt/                          # Your workspace (town)
├── Mayor                      # AI coordinator with full context
├── Rig (project)              # Container for git project + agents
│   ├── Polecats               # Worker agents (ephemeral)
│   ├── Witness                # Monitors workers, handles lifecycle
│   └── Refinery               # Merge queue processor
└── .beads/                    # Git-backed issue tracking
```

### Key Commands

```bash
# Setup
gt install ~/gt --git          # Initialize workspace
gt rig add myproject <url>     # Add a project

# Work tracking
gt convoy create "Feature X" issue-1 issue-2  # Create tracked work group
gt sling issue-1 myproject     # Assign to polecat
gt convoy list                 # View progress

# Agent interaction
gt agents                      # List active sessions
gt mayor attach                # Enter Mayor session (primary interface)

# Configuration
gt config agent list           # View agents
gt completion bash             # Install shell completions
```

## Key Features

- **Persistent Work State**: Beads (git-backed ledger) survives crashes and restarts
- **Multi-Agent Coordination**: Run 20-30 agents without chaos
- **Structured Handoffs**: Agents have mailboxes and identities
- **Formulas**: Define reusable workflows (cook → pour → sling)
- **Dashboard**: Web UI for monitoring convoys and workers
- **Tmux Integration**: Full experience with session management

## How I Used It

I used Gastown to orchestrate a demo combining multiple tools. See [Demoing Gastown with Cody Article Writer Skill](/blog/posts/demoing-gastown-cody-article-writer/) for the full story.

My setup:

- **Workspace**: `~/gt/` with `my-blog-rig` as the primary rig
- **Convoy**: Tracked the demo as `hq-cv-xs52e`
- **Beads**: Used `hq-*` prefix for town-wide issues, `pw-*` for rig-specific
- **Agents**: Ran polecats for task execution

The demo produced two interconnected blog posts:
1. **Meta article**: [Demoing Gastown with Cody Article Writer Skill](/blog/posts/demoing-gastown-cody-article-writer/)
2. **Output article**: [The Future of AI-Powered Development](/blog/posts/the-future-of-ai-powered-development/)

### Integration Issues Encountered

During setup, I hit a BD database prefix mismatch:
- Polecats were named with rig prefix (`pw-my-blog-rig-polecat-1`)
- But trying to access town-wide beads (`hq-polecat-role`)
- **Fix**: Ran `bd migrate --update-repo-id` and created properly-prefixed beads

## Installation

```bash
# Install gt CLI
go install github.com/steveyegge/gastown/cmd/gt@latest

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="$PATH:$HOME/go/bin"

# Initialize workspace
gt install ~/gt --git
cd ~/gt

# Add a project
gt rig add myproject https://github.com/you/repo.git
```

## Shell Completions

```bash
# Bash
source <(gt completion bash)

# Zsh
source <(gt completion zsh)

# Fish
gt completion fish > ~/.config/fish/completions/gt.fish
```

## Related

- **Blog Post**: [Demoing Gastown with Cody Article Writer Skill](/blog/posts/demoing-gastown-cody-article-writer/)
- **Output Article**: [The Future of AI-Powered Development](/blog/posts/the-future-of-ai-powered-development/)
- **Official Repo**: [steveyegge/gastown](https://github.com/steveyegge/gastown)
- **Beads (Issue Tracker)**: [steveyegge/beads](https://github.com/steveyegge/beads)

---

_Tags: AI Orchestration, Multi-Agent Systems, Developer Tools_
