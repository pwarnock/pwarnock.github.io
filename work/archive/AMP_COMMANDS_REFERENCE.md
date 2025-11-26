# Amp Commands Reference

Custom commands for this project. Use them to interact with Cody PBT and Beads
issue tracking.

## Quick Start

```
/cody-help              # Show Cody PBT commands
/ready-work             # Show unblocked issues
/cody-build v1.2.0      # Create new version
/claim-issue bd-40      # Start work on issue
/close-issue bd-40      # Complete issue
```

---

## Commands by Category

### Discovery & Planning

| Command       | Purpose                          |
| ------------- | -------------------------------- |
| `/cody-help`  | Show available Cody PBT commands |
| `/ready-work` | Show work that's ready to start  |

### Building Features

| Command                      | Purpose                         |
| ---------------------------- | ------------------------------- |
| `/cody-build v1.2.0-feature` | Create new version with backlog |
| `/cody-build v1.2.0 "Title"` | Create version with description |

### Issue Tracking

| Command                       | Purpose                 |
| ----------------------------- | ----------------------- |
| `/claim-issue bd-40`          | Start work on issue     |
| `/claim-issue bd-40 "Note"`   | Start with context note |
| `/close-issue bd-40`          | Mark issue complete     |
| `/close-issue bd-40 "Reason"` | Complete with reason    |

---

## Workflow: From Planning to Completion

### 1. Plan a Feature

```
> /cody-help              (understand available commands)
> Use cody-executor: :cody plan
```

### 2. Build the Version

```
> /cody-build v1.2.0-login-page "Login page implementation"
```

Result: Version created, issues generated, session state updated

### 3. Check Ready Work

```
> /ready-work
```

Result: Shows unblocked issues ready to start

### 4. Claim an Issue

```
> /claim-issue bd-40 "Starting login form implementation"
```

Result: Issue marked `in_progress`, session state updated

### 5. Do the Work

```
> [Amp works on the issue]
```

### 6. Close When Done

```
> /close-issue bd-40 "Login form complete and tested"
```

Result: Issue marked `completed`, ready work updated, next task highlighted

---

## Command Details

### /cody-help

Show all Cody PBT framework commands.

```
/cody-help              # Full list
/cody-help plan         # Show :cody plan details
/cody-help build        # Show :cody build details
```

Output: Command list with descriptions and next steps

**Use when**: You need to understand what Cody can do

---

### /ready-work

Show issues ready to start (no blocking dependencies).

```
/ready-work             # Show all ready work
/ready-work --priority 1    # Show high priority only
/ready-work --type bug      # Show bugs only
```

Output: Sorted by priority with recommendations

**Use when**: You want to know what to work on next

---

### /cody-build

Create a new Cody PBT version with feature backlog.

```
/cody-build v1.2.0-feature
/cody-build v1.2.0-feature "Login page implementation"
/cody-build v1.3.0-mobile "Mobile app" 2
```

Output:

- Version created at `.cody/project/build/versions/vX.Y.Z-name/`
- Feature backlog generated
- Issues created in beads (linked to version)
- Session state updated

**Use when**: Starting work on a new feature or release

---

### /claim-issue

Start work on a specific issue.

```
/claim-issue bd-40
/claim-issue bd-40 "Starting implementation"
```

Output:

- Issue status set to `in_progress`
- Session state updated with active issue
- Context prepared

**Use when**: You're ready to start work on an issue

---

### /close-issue

Mark an issue complete.

```
/close-issue bd-40
/close-issue bd-40 "Implementation complete, tests passing"
```

Output:

- Issue status set to `completed`
- Completion reason recorded
- Next ready work shown
- Session state updated

**Use when**: You've finished work on an issue

---

## Integration with Amp

These commands work seamlessly with Amp:

**Option 1: Explicit Commands**

```
> /cody-build v1.2.0-feature
```

Amp reads the markdown file and executes the workflow.

**Option 2: Automatic Delegation**

```
> Build v1.2.0-feature and create issues
```

Amp reads AGENTS.md, understands the subagent pattern, and delegates
automatically.

**Option 3: Mix Both** Use explicit commands when you want precise control, ask
Amp directly when you want intelligent delegation.

---

## Session State Tracking

After each command, `.claude/session-state.json` is updated with:

- Current active task and issue
- Progress (completed, in_progress, pending)
- Agent checkpoints for resumption
- Key decisions and artifacts

**Check status**:

```bash
cat .claude/session-state.json
```

**Resume after interruption**: The session state preserves all context, so you
can pick up exactly where you left off.

---

## Examples

### Example 1: Simple Feature Build

```
> /cody-help
> /cody-build v1.2.0-auth "Authentication system"
> /ready-work
> /claim-issue bd-40 "Starting oauth integration"
> [Amp implements]
> /close-issue bd-40 "OAuth complete and tested"
```

### Example 2: Bug Hunt

```
> /ready-work --priority 0
> /claim-issue bd-5 "Critical bug in database"
> [Amp fixes]
> /close-issue bd-5 "Bug fixed, regression tests added"
> /ready-work
```

### Example 3: Release Management

```
> /cody-build v2.0.0-release "Release 2.0"
> /ready-work
> /claim-issue bd-100
> [Work through version tasks]
> /close-issue bd-100
> /close-issue bd-101
> /close-issue bd-102
> [All tasks done, ready to deploy]
```

---

## Troubleshooting

**Q: Command not found** A: Amp might need to refresh. Run another command to
reload, or check that `.agents/commands/` directory exists.

**Q: Want to see what commands are available** A: Run `/cody-help` or check
`.agents/commands/` directory for markdown files.

**Q: Session state not updated** A: It's auto-updated by context-librarian.
Check `.claude/session-state.json` after each operation.

**Q: Want to reset and start fresh** A: All work is tracked in beads and session
state. You can clear session state and `bd ready` will still show your work.

---

## See Also

- **AMP_AGENT_STRATEGY.md** — Full architecture and reasoning
- **AGENTS.md** — Project guidance for Amp
- **SUBAGENT_QUICK_START.md** — Subagent patterns
- **Session State**: `.claude/session-state.json` — Current session tracking
- **Agent Definitions**: `.claude/agents/*.md` — Specialized agent prompts

---

Created: 2025-11-24  
Last Updated: 2025-11-24  
Status: Ready for Use
