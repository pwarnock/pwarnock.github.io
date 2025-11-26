# Amp Agent Strategy: Cody PBT + Beads Integration Plan

**Status**: Planning | **Version**: 1.0 | **Date**: 2025-11-24

## Executive Summary

Your Cody PBT/Beads integration froze due to **context bloat and ineffective
agent delegation**. This plan restructures Amp to use **four context engineering
strategies** + **Claude's native subagent system** to prevent freezing and
maximize effectiveness.

**Key Insight**: Don't try to do everything in one agent. Instead:

1. **Isolate context** (separate agent per domain)
2. **Compress context** (summarize at handoff points)
3. **Cache context** (reuse boilerplate via prompt caching)
4. **Select context** (only pass what each agent needs)

---

## The Problem: Why It Froze

1. **Context Bloat**: Amp tried to hold all Cody PBT commands, all beads
   commands, all project context, all tool definitions simultaneously
2. **Token Overhead**: Each operation was re-evaluating massive system prompts
3. **No Delegation**: No mechanism to hand off specialized work to focused
   agents
4. **Circular Dependencies**: OpenCode → Cody → Beads → back to OpenCode with
   full context each time

---

## Solution Architecture

### Core Principle: Specialized Subagents with Isolated Contexts

```
Amp (Main Coordinator)
├── Cody Executor (focused on :cody commands only)
├── Beads Manager (focused on bd issue tracking only)
├── Context Librarian (summarizes & maintains state)
├── Code Executor (bash/file operations only)
├── Documentation Agent (content/docs only)
└── [Other domain specialists as needed]
```

Each subagent gets:

- **Its own context window** (no pollution from other tasks)
- **Minimal system prompt** (only relevant instructions)
- **Specific tool access** (e.g., Cody agent gets bash for cody commands only)
- **Clear responsibility boundary** (one job, done well)

---

## Implementation Plan

### Phase 1: Subagent System Definition

Create specialized agents as `.claude/agents/` markdown files:

#### 1. Cody Executor Agent

**File**: `.claude/agents/cody-executor.md`

```yaml
name: cody-executor
description:
  Executes :cody framework commands (plan, build, version, etc). Use for any
  Cody PBT workflow.
tools: Bash, Read, Glob
model: sonnet
```

**Prompt**: Focused on `:cody` command execution, understands PBT structure,
knows to use `--json` flag for parsing.

#### 2. Beads Manager Agent

**File**: `.claude/agents/beads-manager.md`

```yaml
name: beads-manager
description:
  Manages bd issue tracking, queries, filtering, status updates. Use for all
  beads/bd operations.
tools: Bash, Read, Glob
model: sonnet
```

**Prompt**: Understands bd CLI, JSONL format, ready-work detection, issue
creation patterns, dependency linking.

#### 3. Context Librarian Agent

**File**: `.claude/agents/context-librarian.md`

```yaml
name: context-librarian
description:
  Summarizes state, extracts key decisions, prepares handoff notes. Use to
  prevent context bloat.
tools: Read, Grep, Write
model: sonnet
```

**Prompt**: Extracts essential info, creates session recovery docs, identifies
context for next agent.

#### 4. Code Executor Agent

**File**: `.claude/agents/code-executor.md`

```yaml
name: code-executor
description:
  Executes bash commands, file operations, exploratory scripting. Use for
  terminal tasks.
tools: Bash, Read, Write, Edit, Glob, Grep
model: sonnet
```

**Prompt**: Safety-first bash operator, asks before destructive ops, provides
readable output.

#### 5. Documentation Agent

**File**: `.claude/agents/documentation.md`

```yaml
name: documentation
description:
  Maintains docs, updates README, creates guides. Use for content-only work.
tools: Read, Write, Edit, Grep
model: sonnet
```

**Prompt**: Follows style guide, updates doc index, consolidates related docs,
maintains canonical sources.

---

### Phase 2: Context Engineering Strategies

#### Strategy 1: Isolate Context

- **What**: Each agent has separate conversation thread
- **How**: Use `resume` parameter to continue an agent session without reloading
  full context
- **Example**:

  ```
  > Use cody-executor to run `:cody build`
  # Returns: agentId="abc123"

  > Resume agent abc123, now add v1.2.0 version
  # Continues with same context, no reload
  ```

- **Benefit**: Each agent only holds relevant context for its domain

#### Strategy 2: Compress Context

- **What**: Summarize interactions at handoff points
- **How**: Use context-librarian before delegating to next agent
- **Example**:

  ```
  > Use context-librarian: "Summarize what we just did with :cody build,
    extract key decisions, prepare for test-coordinator agent"
  # Returns: 1-2 paragraph summary + key variables

  > Use test-coordinator with this summary: [compressed context]
  ```

- **Benefit**: Next agent receives 500 tokens instead of 5000

#### Strategy 3: Cache Context

- **What**: Reuse system prompts for repeated task types
- **How**: Use Claude's prompt caching for boilerplate
- **Implementation**:

  ```python
  # First request - caches the agent definition
  response = client.messages.create(
    model="claude-sonnet-4-5",
    system=[
      {
        "type": "text",
        "text": "[cody-executor instructions]",
        "cache_control": {"type": "ephemeral"}  # Cache this
      }
    ],
    messages=[...]
  )

  # Subsequent requests with same system prompt get cache hit
  # Saves 90% of input tokens on agent definition
  ```

- **Benefit**: Agents boot fast, 10x cheaper repeated operations

#### Strategy 4: Select Context

- **What**: Pass only needed context to each agent
- **How**: Extract relevant subset before handoff
- **Example**:

  ```
  # Full state includes:
  # - 50 version history items
  # - 200 completed issues
  # - Project architecture docs
  # - Style guides

  # But version-builder only needs:
  # - Latest version number
  # - Current feature backlog
  # - Version template
  # → Pass 3 items instead of 250
  ```

- **Benefit**: Agent stays focused, fewer hallucinations

---

### Phase 3: Integration Points

#### How Amp Uses Subagents

**Pattern 1: Sequential Delegation**

```
User: "Implement the plan we devised in @T-abc123"

Amp (main):
1. "Use context-librarian to extract relevant parts of that thread"
   → Gets: objectives, architecture, technical decisions
2. "Use cody-executor: run :cody plan to set up version"
   → Gets: version created, PRD ready
3. "Use code-executor to scaffold the feature"
   → Gets: basic structure in place
4. Summarize results back to user
```

**Pattern 2: Parallel Delegation (for independent tasks)**

```
User: "Update docs, run tests, commit changes"

Amp delegates in parallel:
- documentation agent → update /docs/README.md
- test-coordinator agent → run test suite
- code-executor agent → git commit

Then collects results and reports status.
```

**Pattern 3: Handoff with Compression**

```
cody-executor builds version
  ↓
context-librarian summarizes (500 tokens instead of 2000)
  ↓
test-coordinator receives summary + test requirements
  ↓
context-librarian summarizes test results
  ↓
deployment-engineer receives summary + deployment checklist
```

---

### Phase 4: Cody PBT + Beads Optimization

#### Cody Executor Best Practices

```bash
# Always use --json for parsing
:cody build --json

# Let cody-executor understand:
# - `.cody/project/plan/` structure
# - `.cody/project/build/versions/` structure
# - Command output format
# - When to use `--json` flag

# Results fed to beads-manager:
cody-executor output (raw)
  ↓
beads-manager parses and creates issues
  ↓
linking via `discovered-from` dependencies
```

#### Beads Manager Best Practices

```bash
# Check ready work first
bd ready --json

# Claim work
bd update <id> --status in_progress --json

# Link discovered work
bd create "Found bug" -p 1 --deps discovered-from:<parent-id> --json

# Complete work
bd close <id> --reason "Done" --json

# Store results for history
bd list --status=completed --limit=20 --json > session-summary.json
```

---

### Phase 5: State Management & Handoff Notes

#### Session State File (`.claude/session-state.json`)

```json
{
  "sessionId": "T-abc123...",
  "startTime": "2025-11-24T10:00:00Z",
  "currentTask": "Build v1.2.0-feature",
  "context": {
    "activeVersion": "v1.2.0-feature",
    "lastCodyCommand": ":cody build",
    "latestBeadsId": "bd-42",
    "keyDecisions": [
      "Use subagents to prevent context bloat",
      "Isolate cody-executor and beads-manager"
    ]
  },
  "agentCheckpoints": {
    "cody-executor": "agentId=xyz789",
    "beads-manager": "ready for next query"
  },
  "nextSteps": ["Run tests", "Deploy to staging"]
}
```

#### Handoff Protocol

When Amp hands off to subagent:

1. **Prepare**: Context librarian extracts relevant subset
2. **Invoke**: Pass compressed context + specific prompt
3. **Monitor**: Track agentId for resumption
4. **Retrieve**: Collect results
5. **Summarize**: Context librarian creates handoff notes
6. **Store**: Update session state file

---

## Implementation Steps

### Week 1: Foundation

```bash
# 1. Create agent definitions
mkdir -p .claude/agents/
# Create: cody-executor.md, beads-manager.md, context-librarian.md,
#         code-executor.md, documentation.md

# 2. Add to AGENTS.md
# Document subagent patterns and when to use each

# 3. Create test script
cat > ./scripts/test-subagent-delegation.sh << 'EOF'
#!/bin/bash
# Test Amp's subagent coordination
# 1. Run :cody help via cody-executor
# 2. Run bd ready via beads-manager
# 3. Test handoff between agents
EOF
chmod +x ./scripts/test-subagent-delegation.sh
```

### Week 2: Integration

```bash
# 1. Test cody-executor
# Commands: :cody help, :cody plan, :cody build --json

# 2. Test beads-manager
# Commands: bd ready --json, bd create, bd update, bd close

# 3. Test context-librarian
# Parse output from other agents, create summaries

# 4. Document patterns in AGENTS.md
```

### Week 3: Validation

```bash
# 1. Run full workflow:
#    User query → cody-executor → beads-manager → test-coordinator
# 2. Verify context doesn't bloat
# 3. Check token usage stays reasonable
# 4. Test session resumption
```

### Week 4: Hardening

```bash
# 1. Add error handling
# 2. Implement rollback mechanisms
# 3. Document edge cases
# 4. Create recovery procedures
```

---

## Expected Outcomes

### Before (With Freezing)

- Context explodes to 100k+ tokens
- Each operation is slow (30-60s)
- Amp gets confused about state
- Cody + Beads commands conflict

### After (With Subagents)

- Each agent stays under 20k tokens
- Operations complete in 5-10s
- Clear state via session file
- Agents work independently then report results

---

## Tools & Configuration

### Agent Definitions (YAML Frontmatter)

```markdown
---
name: agent-name
description: 'Clear, actionable description with USE PROACTIVELY if needed'
tools: Tool1, Tool2, Tool3
model: sonnet # or opus for complex reasoning
permissionMode: default # or acceptEdits, bypassPermissions
---

# System prompt as markdown

Your detailed role, approach, and constraints here.
```

### Prompt Caching Setup

```python
# In Amp's implementation
response = client.messages.create(
    model="claude-sonnet-4-5",
    system=[
        {
            "type": "text",
            "text": "[Cached Cody PBT reference]",
            "cache_control": {"type": "ephemeral"}  # 5 min TTL
        },
        {
            "type": "text",
            "text": "[Cached beads best practices]",
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[...]
)
```

---

## Success Criteria

- [ ] Subagents defined and working
- [ ] Context stays under 25k tokens per agent
- [ ] Handoff time < 2 seconds
- [ ] Cody + Beads integration works without conflicts
- [ ] Session state file tracks all operations
- [ ] No freezing on complex workflows
- [ ] Cache hits > 80% on repeated operations

---

## Quick Reference: When to Use Each Agent

| Agent                 | Use When                      | Example                          |
| --------------------- | ----------------------------- | -------------------------------- |
| **cody-executor**     | Any `:cody` command needed    | "Run :cody build"                |
| **beads-manager**     | Issue tracking required       | "Check ready work, create issue" |
| **context-librarian** | Preventing bloat, handing off | "Summarize for next agent"       |
| **code-executor**     | Terminal/bash operations      | "Clone repo, run tests"          |
| **documentation**     | Docs need updating            | "Update /docs/README.md"         |

---

## Fallback: If Freezing Occurs

1. **Immediate**: Restart with fresh agent context
2. **Recovery**: Use `bd ready --json` to restore state
3. **Prevention**: Reduce context via context-librarian
4. **Long-term**: Review which agent held too much context

---

## Next Actions

1. Review this plan with team
2. Create agent definition files
3. Run test suite on subagent delegation
4. Document patterns in AGENTS.md
5. Begin Week 1 implementation

---

## References

- Claude API Docs: Subagents (prompt caching, context isolation)
- AI Agent Orchestration Patterns (Azure Architecture)
- Context Engineering Guide (LangChain/Anthropic)
- Your existing: AGENTS.md, bd best practices, Cody PBT structure
