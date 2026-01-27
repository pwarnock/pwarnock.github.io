# Project Architecture Overview

## High-Level System Design

This Hugo-based static site uses a modern, CI-driven architecture with three core pillars:

1. **Self-Enforcing Release Process** - All version bumps, tags, and deployments are created exclusively by GitHub Actions, never locally
2. **Agent Coordination Strategy** - Uses Claude subagents with context compression to manage complex workflows without bloat
3. **Issue Tracking Integration** - Beads (`bd`) provides git-backed issue tracking with persistent work state

## Core Architectural Principles

### 1. Centralized Release Authority
- `package.json.version` is the single source of truth for all versioning
- Release Controller (`release-controller.yml`) is the only process that updates versions and creates tags
- Developers use `scripts/release.sh` to submit declarative release requests, never imperative commands
- CI enforces this through guardrails that fail unauthorized version changes in PRs

### 2. Declarative Release Requests
- Release intent is captured in `.release/request.json` (type: rc/final/hotfix, description, metadata)
- Controller processes requests idempotently - re-running on same commit either confirms completion or repairs partial state
- Supports three release types: Release Candidate (rc), Final, and Hotfix

### 3. Multi-Stage Build Pipeline
- **Bun** handles JavaScript tooling and dependencies
- **Hugo** generates static site from markdown content
- **GitHub Actions** orchestrates build, deployment, and version management
- Sequential rebase strategy ensures clean merge history (no parallel conflicts)

### 4. Agent Coordination via Subagents
- Uses Claude's native subagents to decompose complex workflows
- Four context engineering strategies minimize token usage:
  - **Isolate Context** - Each agent runs in separate thread
  - **Compress Context** - Summarize handoffs (5000 → 500 tokens)
  - **Cache Context** - Reuse system prompts (90% savings)
  - **Select Context** - Pass only needed information
- Custom agents: cody-executor, beads-manager, context-librarian

### 5. Traceable Deployments
- Every production deployment links to:
  - A Bead entry with metadata and status
  - Git commit, tag, and CI run
  - Deployment artifacts and location
- Provides audit trail for governance and debugging

## Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Release Script | Developer-facing release entry point | `scripts/release.sh` |
| Release Controller | Validates and executes release requests in CI | `.github/workflows/release-controller.yml` |
| Version Gate | Prevents unauthorized version changes in PRs | `.github/workflows/version-consistency.yml` |
| RC Auditor | Identifies and reports stale release candidates | `.github/workflows/orphan-rc-auditor.yml` |
| Hugo Site | Static site generator and content | `content/`, `config/` |
| Beads Integration | Issue tracking and release metadata | `bd` CLI, `.beads/` |

## Development Workflows

### Releasing Final Version
1. Developer: `./scripts/release.sh final`
2. Script: Creates `.release/request.json` with type="final"
3. CI Controller: Bumps version, creates tag, builds, deploys
4. Result: New production version with traceable Bead entry

### Release Candidate (Staging)
1. Developer: `./scripts/release.sh rc`
2. CI: Bumps pre-release version (1.2.0-rc.1, rc.2, etc.)
3. Deploys to staging for testing
4. Later promoted to final with `scripts/release.sh final`

### Hotfix Process
1. Fix implemented on hotfix branch based on production tag
2. Developer: `./scripts/release.sh hotfix`
3. CI: Bumps patch from current production version
4. Builds and deploys immediately

## Critical Workflows

### Sequential Merge Strategy
- Each branch rebases on newly updated main (avoiding parallel conflicts)
- After merge, main moves forward; next branch rebases on new baseline
- Ensures clean linear history

### Failure Handling
- Pre-existing test failures: Engineer must fix or file tracked Bead
- Branch-caused failures: Abort, notify, skip branch
- Deployment failures: Marked in status, next run can repair or increment version
- All failures tracked via Bead system

## Related Documentation

For detailed information, see:
- **[AMP Agent Strategy](../../docs/architecture/AMP_AGENT_STRATEGY.md)** - Subagent patterns and context engineering
- **[Self-Enforcing Release Process](../../docs/architecture/SELF_ENFORCING_RELEASE_PROCESS.md)** - Complete release architecture, implementation phases, and failure modes

## Key Success Metrics

- Release success rate: >95% on first attempt
- Version integrity: Near-zero unauthorized version changes
- 100% of production deployments traceable to Bead + commit + CI run
- Predictable release cycle time (<15 minutes)
- Minimal manual interventions per release
