# Claude Context Index

**Master index for all Claude Code context files.** Use this to find the right context for your role and task.

## What is Context?

Context files in `.claude/context/` provide role-specific and session-specific guidance for Claude agents operating in this repository. They define how to approach tasks, what principles to follow, and what systems are in place.

The context system is organized into five categories:
- **Codified Context** - Constitution, routing, failure modes, subsystem map (load always or by trigger)
- **Roles** - Instructions for specific agent roles (e.g., Refinery, Developer)
- **Project** - Project-wide context and shared understanding
- **Specs** - On-demand subsystem deep-dives
- **Session** - Learnings and state accumulated during the current session

## Quick Navigation

**Loading rules** → Load `constitution.md` for any task. Load `trigger-tables.md` when routing. Load `failure-modes.md` when debugging. Load `subsystem-map.md` when exploring.

**What's my role?** → See [Roles](#roles)

**I need to understand the project** → See [Project Context](#project-context)

**I'm continuing work from a previous session** → See [Session Learnings](#session-learnings)

## Codified Context Infrastructure

| File | Purpose | When to Load |
|------|---------|-------------|
| [constitution.md](./constitution.md) | Non-negotiable project rules and conventions | Every task |
| [trigger-tables.md](./trigger-tables.md) | File pattern → context/skill routing | When routing queries |
| [failure-modes.md](./failure-modes.md) | Symptom → cause → fix mappings | When debugging |
| [subsystem-map.md](./subsystem-map.md) | Directory → subsystem ownership | When exploring codebase |
| [specs/](./specs/) | On-demand subsystem deep-dives | When deep context needed |

## Roles

### Refinery
**File**: [roles/refinery.md](./roles/refinery.md)

**Purpose**: Defines the Refinery agent's role as the merge queue processor for peterwarnock_com.

**When to use**:
- You are the Refinery agent starting a new session
- You need to understand the propulsion principle and hook system
- You're executing patrol wisps or handling merge conflicts
- You need to check sequential rebase protocols

**Key Concepts**:
- The Propulsion Principle: when work is on your hook, you execute immediately
- ZFC Compliance: agent-driven decisions, not delegated to code
- mol-refinery-patrol: the patrol molecule defining your work steps
- Capability Ledger: your merge history is a permanent record

**Links to Docs**:
- Release and merge workflows: [docs/operations/RELEASE_WORKFLOW.md](../../docs/operations/RELEASE_WORKFLOW.md)
- Development patterns: [docs/development/](../../docs/development/)

---

## Project Context

The `project/` directory contains shared project-level context files that apply across all roles.

**Files**:
- **`architecture.md`** - System architecture and component relationships
  - High-level architectural decisions
  - Core components (self-enforcing releases, agent coordination, issue tracking)
  - Links to detailed architectural documentation

- **`conventions.md`** - Coding standards and project conventions
  - TypeScript, testing, naming, documentation, git commit standards
  - Content bundle and frontmatter validation rules

- **`workflows.md`** - Development, release, deployment, and issue tracking workflows
  - Quick start guides for each workflow
  - QA modes (auto/content/full) documentation

- **`references.md`** - External articles, patterns, and standards
  - Teresa Torres task management system (chatprd.ai article)
  - TypeScript code quality standards (zero warnings policy)
  - Progressive disclosure patterns
  - Key implementation patterns and quotes

---

## Session Learnings

The `session/learnings/` directory accumulates knowledge gained during the current session.

**Purpose**: Store discoveries, fixes, and insights that should be preserved between agent restarts within a session.

**Files** (when created):
- Individual markdown files capturing specific learnings
- Named by discovery date/agent or topic (e.g., `2026-01-26-playwright-fix.md`)

**When to use**:
- You discover a non-obvious solution and want it available to the next agent
- You resolve a bug and document how you fixed it
- You identify a pattern or anti-pattern worth recording
- You learn something about the codebase that isn't in formal docs

**How to Use**:
1. Create a new file in `session/learnings/` with a descriptive name
2. Document what you learned, why it matters, and how to apply it
3. Include code examples if relevant
4. Link to related documentation or issues

---

## How the Router Works

The Claude Code context system uses a router to determine which context files to load based on:

1. **Agent Role** - The agent's configured role determines the primary context file
2. **Task Type** - Special instructions apply based on what you're trying to do
3. **Session State** - Previous learnings are automatically injected into your context
4. **Project Principles** - Shared context applies to all agents

### Loading Sequence

When Claude Code starts an agent:

```
1. Load base project context (if exists)
   └─ principles.md, systems.md, architecture.md

2. Detect agent role and load role context
   └─ roles/{role-name}.md

3. Check for active session state
   └─ Load all files from session/learnings/

4. Apply any task-specific overrides
   └─ From CLAUDE.md or inline instructions

5. Inject context into the system message
   └─ Agent has full context for execution
```

### Priority Order

When context files conflict, this order applies (later overrides earlier):

1. Default Claude Code behavior
2. Project-level context (project/)
3. Role context (roles/)
4. Session learnings (session/learnings/)
5. Inline task instructions (from user or CLAUDE.md)

---

## File Organization

```
.claude/context/
├── index.md                    ← YOU ARE HERE
├── constitution.md             (Non-negotiable project rules)
├── trigger-tables.md           (File pattern → routing)
├── failure-modes.md            (Symptom → cause → fix)
├── subsystem-map.md            (Directory → ownership)
├── specs/                      (On-demand subsystem deep-dives)
├── roles/
│   ├── refinery.md             (Merge queue processor)
│   ├── developer.md            (General development)
│   └── personal-assistant.md   (Daily planning)
├── project/
│   ├── architecture.md         (System design decisions)
│   ├── conventions.md          (Coding standards)
│   ├── workflows.md            (Dev/release/deploy workflows)
│   └── references.md           (External patterns & standards)
└── session/
    └── learnings/
        └── [session-specific discoveries]
```

---

## Creating New Context Files

Before creating a new context file, ask:

1. **Is this role-specific?** → Add to `roles/`
2. **Is this shared across all roles?** → Add to `project/`
3. **Is this a session discovery?** → Add to `session/learnings/`
4. **Is this a one-off instruction?** → Put it in CLAUDE.md instead

**Naming Convention**:
- `{role-name}.md` for roles (all lowercase, hyphenated)
- `{topic}.md` for project context (descriptive, simple)
- `{date}-{topic}.md` for session learnings (YYYY-MM-DD format)

**Template for New Role Context**:
```markdown
# [Role Name] Context

## Purpose
[One sentence: What is this role responsible for?]

## Principles
[Key decision-making principles for this role]

## Startup Protocol
[What to do when you first start]

## Key Tasks
[Major work categories]

## Decision Domain
[What decisions does this role make?]

## Anti-Patterns
[What NOT to do]

## Key Commands
[Important CLI/git commands]

## Links
[References to authoritative documentation]
```

---

## Integration with CLAUDE.md

The `.claude/context/` directory complements the root-level `CLAUDE.md` file:

- **CLAUDE.md**: Project-wide instructions, recovery procedures, meta-patterns
- **context/**: Agent and session-specific context, role definitions, learnings

When both exist, both are loaded. The context system is more structured and role-aware, while CLAUDE.md handles top-level project guidance.

---

## Authoritative Documentation

For detailed guidance on specific topics, consult the main documentation:

### Development
- [Getting Started](../../docs/tutorials/GETTING_STARTED.md) - Local setup
- [Development Workflow](../../docs/development/) - Patterns and processes
- [Testing](../../docs/development/TESTING_ARCHITECTURE.md) - Test strategy
- [Style Guide](../../docs/development/STYLE_GUIDE.md) - Code style

### Operations
- [Deployment](../../docs/operations/DEPLOYMENT.md) - Deploy procedures
- [Release Workflow](../../docs/operations/RELEASE_WORKFLOW.md) - Release management
- [Environment Configuration](../../docs/operations/ENVIRONMENT_CONFIG.md) - Env setup

### Integration
- [Cody/Beads Workflow](../../docs/integration/CODY_BEADS_WORKFLOW.md) - Issue tracking

---

## Status and Expansion

| Directory | Files | Status | Next Steps |
|-----------|-------|--------|-----------|
| (root) | constitution.md, trigger-tables.md, failure-modes.md, subsystem-map.md | Active | Evolve with project |
| specs/ | README.md (template) | Active | Generate on-demand as subsystems need deep context |
| roles/ | refinery.md, developer.md, personal-assistant.md | Complete | Maintain as roles evolve |
| project/ | architecture.md, conventions.md, workflows.md, references.md | Complete | Update when architecture changes |
| session/learnings/ | (per-session) | Active | Populate during sessions with discoveries |

---

**Last Updated**: 2026-03-01
**Created by**: Claude Code context bootstrap
