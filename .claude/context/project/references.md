# Project References

This file documents key articles, patterns, and external references that inform the project's design and implementation.

## Teresa Torres Task Management System

**Source:** [How I AI: Teresa Torres on Claude Code & Obsidian Task Management](https://www.chatprd.ai/how-i-ai/teresa-torres-claude-code-obsdian-task-management)
**Author:** Claire Vo
**Published:** January 19, 2026
**Archived:** January 26, 2026

### Summary

Teresa Torres demonstrates building personalized AI-powered productivity systems by combining Claude Code with Obsidian. The system emphasizes "pair programming for everything" through custom automation rather than conforming to rigid off-the-shelf tools.

### Key System Components

**1. Personalized Task Manager**
- Slash commands (e.g., `/today`) trigger Python scripts
- Tasks stored as markdown files with YAML frontmatter metadata
- Daily compilation: due tasks, overdue items, research digests
- Natural language task creation parsed by Claude

**2. Automated Research Assistant**
- Python cron jobs query arXiv (daily) and Google Scholar (weekly)
- Custom summarization focusing on methodology and effect size
- Daily digest feeds into task management automatically
- Manual PDF filtering prevents information overload

**3. Granular Context Library** ("Lazy Prompting")
- Multiple focused markdown files instead of monolithic context
- Organized by topic with index files for navigation
- Claude intelligently loads only relevant context per request
- Iteratively updated based on conversation learnings

### Implementation Patterns

**Task Structure:**
```yaml
---
type: feature|bug|research
due_date: YYYY-MM-DD
tags: [category, priority, domain]
---

# Task Title

## Description
[Task details]

## Checklist
- [ ] Subtask 1
- [ ] Subtask 2

## Notes
[Embedded context]
```

**Context Organization:**
- Break up monolithic CLAUDE.md into role-based context files
- Use index files for discovery without loading full content
- Load context dynamically based on active role/task
- Store learnings in dated session files

### Techniques Applied to This Project

This implementation adapts Teresa's patterns:

1. **Modular Context System**
   - `.claude/context/roles/` - Role-specific instructions
   - `.claude/context/project/` - Project-wide knowledge
   - `.claude/context/session/learnings/` - Session discoveries
   - Routing logic in `CLAUDE.md` for intelligent loading

2. **Natural Language Task Creation**
   - `/today` skill - Daily task digest
   - `create-task` skill - Conversational task capture
   - Auto-categorization (fix→bug, urgent→P0)
   - Integration with Beads issue tracker

3. **Learning Discovery System**
   - Micro-context pattern: YAML source definitions
   - Dynamic source loading from `.claude/learning/sources/`
   - Extensible without code changes
   - Monitors: blog posts, tech radar, docs, bookmarks

4. **Session Learning Capture**
   - End-of-session prompts ("What did you learn?")
   - Dated learning files for continuity
   - Links to related Beads issues
   - Structured format: learnings, successes, improvements, patterns

### Outcomes

- **Data Portability:** Local markdown storage (not cloud-locked)
- **Reduced Friction:** CLI > GUI for developer workflows
- **Intelligent Context:** Load only what's needed, when needed
- **Knowledge Continuity:** Session learnings survive compaction
- **Extensibility:** Add learning sources via YAML (no code)

### Key Quote

> "Breaking context into modular, indexed files enables more efficient AI collaboration"

This principle drives the entire `.claude/context/` architecture.

---

## Standards and Conventions

### TypeScript Code Quality

**Zero Tolerance for Warnings:**
All TypeScript code must compile without errors or warnings. This includes:

- Type declarations must be complete (no implicit `any`)
- Module imports must resolve correctly
- `@types/node` installed for Node.js APIs
- `process`, `console`, and standard globals properly typed
- No unused variables or parameters

**Why This Matters:**
- Warnings indicate type safety gaps
- Runtime errors often hide behind ignored warnings
- Clean compilation = predictable behavior
- Professional code quality standard

**Implementation:**
```bash
# Must pass cleanly
bun tsc --noEmit

# No "// @ts-ignore" bypasses without justification
# No suppressing legitimate type errors
```

**Reference PR:** The agents package must maintain zero-warning compilation at all times.

### Progressive Disclosure in Documentation

**Skills follow 3-level loading:**
1. Metadata (name + description) - Always loaded (~100 words)
2. SKILL.md body - Loaded when skill triggers (<2,000 words)
3. Bundled resources - Loaded as needed (unlimited)

**Context files follow similar pattern:**
- Core concepts in main file
- Detailed patterns in `references/`
- Working examples in `examples/`
- Utilities in `scripts/`

### Git Commit Standards

From `docs/agents/README.md`:
- **NEVER** skip hooks (`--no-verify`) unless explicitly requested
- Pre-commit hooks prevent bad code from entering history
- Fixing lint/test failures is required, not optional
- Clean git history reflects professional development

### Beads Issue Tracking

- Use `bd create` for strategic multi-session work
- Priority scale: 0 (critical) to 4 (backlog)
- Track dependencies with `bd dep add`
- Close issues when truly complete: `bd close <id>`
- Sync at session end: `bd sync`

---

## Additional References

*To be added as the project evolves*

