# Phase 1 Quick Reference Card

**Print this or bookmark it**. Keep these 5 commands and 3 conventions handy.

---

## 3 Naming Conventions

### 1. Issues: Descriptive + Version

```
Good:  "Add keyboard shortcuts (v0.20.0)"
       "Navigation component restructure (v0.20.0)"

Bad:   "fix"
       "work"
       "feature 1"
```

### 2. Version Label: Semantic Format

```
version:0.20.0    ✅
version:0.20      ❌
v0.20.0           ❌
```

### 3. Feature Link in Description

```markdown
## Description

Implement X as specified in v0.20.0 feature backlog

## Related

- Feature: Name of feature (v0.20.0)
- Cody: .cody/project/build/feature-backlog.md
```

---

## 5 Essential Commands

### 1. See What's Ready

```bash
bd ready --json
```

Shows all unblocked tasks. Start here every day.

### 2. Create an Issue

```bash
bd create "Description (vX.Y.Z)" -t feature -p 2 --json
```

Returns issue ID (bd-123). Copy it.

### 3. Claim Work

```bash
bd update bd-123 --status in_progress
```

Before working on something, claim it.

### 4. Finish Work

```bash
bd close bd-123 --reason "Merged"
```

After PR is merged, close the issue.

### 5. Link Dependent Issues

```bash
bd create "Subtask" -t task --deps blocks:bd-123 --json
```

If task X depends on task Y, use `--deps blocks:Y`.

---

## Weekly Workflow

### Monday

```bash
# See what's ready
bd ready --json

# Claim a task
bd update bd-123 --status in_progress
```

### Tuesday-Thursday

```bash
# Work, create PR, reference issue
# In PR description: "Resolves bd-123"

# Move to review
bd update bd-123 --status review
```

### Friday

```bash
# Finish
bd close bd-123 --reason "Merged"

# Lead updates Cody backlog
# (lead responsibility, not yours)
```

---

## Common Scenarios

### I'm starting a feature

1. Check Cody backlog: `.cody/project/build/feature-backlog.md`
2. Create Beads issue: `bd create "Feature (vX.Y.Z)" -t feature`
3. Create subtask issues: `bd create "Subtask" -t task --deps blocks:parent-id`
4. Reference in Cody: "See bd-123 for details"

### My task is blocked

```bash
# Instead of status "blocked", you just can't claim it
# The dependency prevents it from showing in "bd ready"

# Lead will unblock when blocker is done
# Then it shows in "bd ready"
```

### I found extra work

```bash
# Create issue for it
bd create "Found: thing X (vX.Y.Z)" -t bug -p 2 --json

# Link to what found it
bd update new-id --deps discovered-from:original-id
```

### Release is coming

1. Lead counts completed issues per feature
2. Lead updates Cody backlog: "10/15 completed (67%)"
3. Lead generates release notes from Beads issues
4. All done!

---

## Three-Layer Architecture (Simplified)

```
What we plan                    (Cody)
     ↓ Links to
What we're doing                (Beads)
     ↓ Generates
What we shipped                 (Release Notes)
```

**Your job**: Keep Beads updated (claim, work, close)  
**Lead's job**: Update Cody weekly, generate release notes  
**Result**: Traceability from plan → work → release

---

## Do's and Don'ts

### ✅ DO

- Use `bd ready` to see what's available
- Include version in issue name: "v0.20.0"
- Create issues before starting work
- Reference Beads issues in PRs
- Ask questions if unsure

### ❌ DON'T

- Create markdown TODO lists (use Beads instead)
- Forget to claim issues (so others don't duplicate)
- Leave issues in "in_progress" after merging (close them)
- Use confusing issue names like "fix" or "work"
- Update Cody backlog directly (lead does that)

---

## When You're Stuck

### "What should I work on?"

```bash
bd ready --json
```

Pick the highest priority unblocked task.

### "How do I create an issue?"

```bash
bd create "Description (vX.Y.Z)" -t feature -p 1 --json
```

### "How do I reference an issue in a PR?"

```
In PR description:
Resolves bd-123
Related: bd-124, bd-125
```

### "Can I see all issues for v0.20.0?"

```bash
grep "v0.20.0" .beads/issues.jsonl
```

### "Still confused?"

1. Read: `docs/integration/CODY_BEADS_WORKFLOW.md` (section 2: Quick Start)
2. Search: Look for your scenario in "Common Scenarios"
3. Ask: Create a Beads issue to discuss

---

## File Locations

| What             | Where                                     |
| ---------------- | ----------------------------------------- |
| This guide       | `docs/integration/CODY_BEADS_WORKFLOW.md` |
| Feature planning | `.cody/project/build/feature-backlog.md`  |
| Open issues      | `.beads/issues.jsonl` or `bd ready`       |
| Beads config     | `.bd.toml`                                |
| Commands         | `AGENTS.md` → Beads section               |

---

## Version Numbers (SemVer)

```
v0.20.0
↓  ↓  ↓
|  |  |
|  |  └─ Patch (bug fixes, minor changes)
|  └──── Minor (new features, backward compatible)
└─────── Major (breaking changes)
```

Use in issue names: "Feature name (v0.20.0)"

---

## Quick Commit Message Example

```bash
git commit -m "feat: implement keyboard shortcuts for navigation

Resolves bd-48
Related: bd-47

- Added Escape key to close menus
- Added Tab to navigate items
- Added Enter to activate items
- Added test coverage
"
```

Then: `bd update bd-48 --status review`

After merge: `bd close bd-48 --reason "Merged"`

---

## Keyboard Shortcuts

**None yet.** Just use the commands above.

---

## Help Quick Links

| Question                   | Answer                                    |
| -------------------------- | ----------------------------------------- |
| How do I start?            | `bd ready --json`                         |
| How do I create an issue?  | `bd create "Title (vX.Y.Z)" -t type`      |
| How do I finish?           | `bd close id --reason "Merged"`           |
| What should I name things? | "Description (vX.Y.Z)"                    |
| How do I link issues?      | `--deps blocks:id`                        |
| What's the big picture?    | Three layers: Plan → Do → Ship            |
| Where's the full guide?    | `docs/integration/CODY_BEADS_WORKFLOW.md` |
| What if I'm stuck?         | Ask in Beads issue or check examples      |

---

## Remember

**Phase 1 is intentionally simple and manual.**

- No fancy automation yet
- Just conventions and discipline
- After 1-2 versions, we'll evaluate Phase 2 (automation)
- Your feedback on what's painful will inform the decision

**You're helping establish a sustainable workflow.**

---

**Print this card** or save as bookmark  
**Use for 2 weeks** until it becomes automatic  
**Give feedback** on what works and what doesn't

Questions? Check `docs/integration/CODY_BEADS_WORKFLOW.md` or create a Beads
issue.
