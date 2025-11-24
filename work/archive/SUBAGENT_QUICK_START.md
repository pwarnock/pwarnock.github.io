# Subagent Quick Start Guide

**TL;DR**: Use specialized agents instead of one monolithic Amp. Prevents freezing, faster, cheaper.

---

## Quick Patterns

### Pattern 1: Run a Cody Command
```
User: "Create v1.2.0-feature version"

Amp: "Use cody-executor to run :cody version build v1.2.0-feature"

cody-executor returns:
{
  "command": ":cody version build v1.2.0-feature",
  "status": "success",
  "version": "v1.2.0-feature",
  "message": "Version created"
}
```

### Pattern 2: Track Issues
```
User: "Check what work is ready"

Amp: "Use beads-manager to show ready work"

beads-manager returns:
{
  "action": "bd ready",
  "status": "success",
  "issues": [
    { "id": "bd-40", "title": "Feature X", "priority": 1 },
    { "id": "bd-41", "title": "Bug Y", "priority": 1 }
  ]
}
```

### Pattern 3: Hand Off Between Agents
```
cody-executor finishes :cody build
  ↓
context-librarian summarizes results (compresses from 2000→300 tokens)
  ↓
beads-manager creates issues from summary
  ↓
test-coordinator receives minimal context + test requirements
```

### Pattern 4: Resume Agent
```
# Agent was running: agentId=xyz789
# It got interrupted

Amp: "Resume agent xyz789 and continue testing"

Agent picks up with full previous context, no reload needed
```

---

## Key Commands by Agent

### cody-executor
```bash
:cody help                          # Show commands
:cody plan                          # Plan phase
:cody build                         # Build phase
:cody version build v1.2.0-feature # Create version
:cody refresh                       # Refresh memory
```

### beads-manager
```bash
bd ready --json                     # Get unblocked work
bd create "Title" -t bug -p 1 --json # Create issue
bd update bd-42 --status in_progress --json # Claim work
bd close bd-42 --reason "Done" --json # Complete work
```

### context-librarian
```
# Used internally, not direct commands
# Call when: handing off between agents, preventing bloat
# Returns: Compressed summary + session state
```

### code-executor
```bash
bash commands                       # Run any terminal command
# Examples:
npm run build
git commit -m "message"
docker run ...
```

### documentation
```
# Used for docs updates
# Examples:
Update /docs/README.md
Create new guide
Fix broken links
```

---

## Session Recovery Checklist

If Amp gets interrupted:

1. **Check session state**: Read `.claude/session-state.json`
2. **Identify current task**: `sessionState.current.activeTask`
3. **Find agent checkpoint**: `sessionState.agents[agent].resumeId`
4. **Resume agent**: `Resume agent <resumeId>`
5. **Continue work**: Agent picks up where it left off

---

## Preventing Freezing

### ✅ DO

- **Delegate to specialized agents** (cody-executor, beads-manager, etc)
- **Compress context** before handing off to next agent
- **Use --json flags** for all CLI operations
- **Create checkpoints** every 15-20 minutes
- **Resume agents** instead of restarting fresh
- **Keep session state file updated**

### ❌ DON'T

- Try to hold all context in one agent
- Pass raw logs between agents (summarize instead)
- Forget to use --json flags
- Leave session state file out of date
- Restart agents from scratch (resume them instead)

---

## Real Example: Feature Implementation

```
User: "Implement the login page feature"

Amp coordinates:

1. cody-executor: Run :cody build
   → Creates v1.2.0-login-page version
   → Returns: version path, generated tasks

2. context-librarian: Summarize results
   → Compresses Cody output to 2 paragraphs
   → Notes: "5 tasks generated, ready for dev"

3. beads-manager: Create issues from summary
   → bd create "Implement login form" 
   → bd create "Add password reset"
   → bd create "Add OAuth integration"
   → Returns: Issues bd-40 through bd-42 created

4. context-librarian: Prepare handoff
   → Summarizes for test-coordinator: "These 5 features ready for testing"
   → Compresses from 4000→400 tokens

5. test-coordinator: Start testing
   → Runs tests against v1.2.0-login-page
   → Creates bug issues for failures
   → Links bugs to parent feature bd-40

6. beads-manager: Track completion
   → bd close bd-40 --reason "Login page complete"
   → Links all child issues as completed

Result: Feature shipped, no freezing, clear audit trail
```

---

## Token Usage: Before vs After

### Before (Monolithic Amp)
```
Single agent holds:
- All Cody PBT docs (2000 tokens)
- All beads docs (1500 tokens)
- Full project history (3000 tokens)
- Tool definitions (500 tokens)
- Conversation history (8000 tokens)
Total: 15,000+ tokens per operation
Speed: 30-60 seconds per task
Risk: Context bloat, freezing
```

### After (Specialized Subagents)
```
cody-executor holds:
- Cody PBT docs only (1000 tokens)
- Conversation (2000 tokens)
Total: 3000 tokens

beads-manager holds:
- Beads docs only (800 tokens)
- Conversation (1500 tokens)
Total: 2300 tokens

context-librarian summarizes (300 tokens)

Result: 5-10 second operations, no freezing
Savings: 70% fewer tokens, 5-10x faster
```

---

## Session State File Template

Keep at: `.claude/session-state.json`

```json
{
  "sessionId": "T-abc123...",
  "startTime": "2025-11-24T10:00:00Z",
  
  "current": {
    "phase": "build",
    "activeTask": "Run tests",
    "activeIssue": "bd-40"
  },
  
  "progress": {
    "completed": [
      "Create version v1.2.0-login-page",
      "Generate feature backlog"
    ],
    "inProgress": [
      "Run tests"
    ],
    "pending": [
      "Deploy to staging"
    ]
  },
  
  "agents": {
    "cody-executor": {
      "lastUsed": "2025-11-24T14:20:00Z",
      "resumeId": "xyz789",
      "status": "ready"
    },
    "beads-manager": {
      "lastUsed": "2025-11-24T14:25:00Z",
      "status": "ready"
    }
  }
}
```

---

## Troubleshooting

**Q: Agent is freezing**
A: You're probably not delegating. Use subagents instead of holding all context.

**Q: Don't know what work is ready**
A: Run `beads-manager: bd ready --json` to see unblocked issues

**Q: Agent lost context**
A: Check session state file for `agents[agentName].resumeId` and resume with that ID

**Q: Commands not parsing**
A: Always use `--json` flag on CLI commands (e.g., `:cody build --json`)

**Q: Session keeps getting longer**
A: Use context-librarian to compress before handing off to next agent

---

## Next Steps

1. Review `AMP_AGENT_STRATEGY.md` for full architecture
2. Try delegating a simple task: `Use cody-executor to run :cody help`
3. Track the session state file and notice how it stays compact
4. Experiment with context compression when handing off
5. Build confidence with small tasks before complex workflows

---

For detailed information, see:
- `AMP_AGENT_STRATEGY.md` - Full architecture and reasoning
- `.claude/agents/*.md` - Individual agent prompts
- `AGENTS.md` - Updated with subagent info
- `.claude/session-state.json` - Session recovery reference
