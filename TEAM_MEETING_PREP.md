# Team Alignment Meeting: Phase 1 Cody-Beads Integration

**When**: [Schedule for this week]  
**Duration**: 30-45 minutes  
**Attendees**: Full team  
**Tracking Issue**: pw-zyu

---

## Pre-Meeting Reading (5 min)

**All team members should read before meeting:**

- `PHASE_1_QUICK_REFERENCE.md` (2 min read)
- First example in `CODY_BEADS_WORKFLOW.md` section "Common Scenarios" (3 min)

---

## Meeting Agenda

### 1. The Problem (5 min)

**Current state**: We have two systems that don't talk to each other:

- **Cody** (`.cody/project/build/feature-backlog.md`) - What we plan to build
- **Beads** (`.beads/issues.jsonl`) - What we're actually building

**Gap**: When we release, we can't trace which work implemented which features.
Release notes are guesswork.

**Example**:

- Feature: "Enhanced Navigation System"
- Who implemented it? What issues?
- What did we actually ship?
- What should go in release notes?

**Result**: Unclear feature → work → release traceability

### 2. The Solution (5 min)

**Phase 1**: Link them with conventions (no code changes)

```
Feature Backlog (Cody)
    ↓ [Create Beads issues for each feature]
Daily Issues (Beads)
    ↓ [Developers claim, work, close]
Weekly Progress
    ↓ [Lead updates Cody with status]
Feature Backlog (Updated)
    ↓ [Generate release notes]
Release Notes → GitHub Release
```

**Example flow**:

1. Feature "Enhanced Navigation (v0.20.0)" in Cody
2. Create issues: bd-47 (restructure), bd-48 (keyboard), bd-49 (mobile), bd-50
   (a11y)
3. Link in Cody: "See bd-47 through bd-50 for details"
4. Devs work: claim, implement, PR, merge, close issue
5. Weekly: Lead updates Cody → "4/4 completed (100%)"
6. Release: Lead compiles release notes from Beads → GitHub release

### 3. What This Means for You (10 min)

**Developers**:

- Check `bd ready --json` to see what's ready (new habit)
- Claim work: `bd update bd-47 --status in_progress`
- Finish work: `bd close bd-47 --reason "Merged"`
- Reference in PRs: "Resolves bd-47"

**3 conventions to remember**:

1. Issue names include version: "Feature (v0.20.0)"
2. Version labels are: `version:0.20.0` (semantic)
3. Link features and issues bidirectionally

**That's it.** Everything else is lead responsibility.

### 4. Real Example: Enhanced Navigation (10 min)

**Walk through a real v0.20.0 feature step-by-step**:

**Step 1: Feature in Cody** (what we planned)

```markdown
## Feature: Enhanced Navigation System

- [ ] Component restructure
- [ ] Keyboard shortcuts
- [ ] Mobile optimization
- [ ] Accessibility audit
```

**Step 2: Create Beads issues** (what we're doing)

```bash
# Create the main feature
bd create "Navigation component restructure (v0.20.0)" -t feature -p 1
# Returns: bd-47

# Create dependent tasks
bd create "Add keyboard shortcuts (v0.20.0)" -t task -p 2 --deps blocks:bd-47
# Returns: bd-48

bd create "Mobile nav optimization (v0.20.0)" -t task -p 2 --deps blocks:bd-47
# Returns: bd-49

bd create "Accessibility audit (v0.20.0)" -t task -p 2 --deps blocks:bd-48,bd-49
# Returns: bd-50
```

**Step 3: Update Cody** (link them)

```markdown
## Feature: Enhanced Navigation System

- Status: 0/4 issues completed
- Issues: bd-47, bd-48, bd-49, bd-50
- Dependencies:
  1. bd-47 blocks bd-48, bd-49
  2. bd-48, bd-49 block bd-50
```

**Step 4: Daily work** (execute)

```bash
# See what's ready
bd ready --json
# Shows bd-47 (no blockers)

# Dev 1 claims component work
bd update bd-47 --status in_progress
# (creates PR with "Resolves bd-47")
# (merges and closes)

# Now bd-48 and bd-49 are ready
bd update bd-48 --status in_progress
bd update bd-49 --status in_progress
# (both working in parallel)

# Both finish, close
bd close bd-48 --reason "Merged"
bd close bd-49 --reason "Merged"

# Now bd-50 is ready
bd update bd-50 --status in_progress
# (finishes and closes)
```

**Step 5: Weekly update** (Friday)

```markdown
## Feature: Enhanced Navigation System

- Status: 4/4 completed (100%)
- Completed: bd-47 ✓, bd-48 ✓, bd-49 ✓, bd-50 ✓
- Blocked: None
- At risk: None
- Ready for release ✓
```

**Step 6: Release** (Compile notes)

```markdown
# Release Notes v0.20.0

## New Features

- Enhanced Navigation System (bd-47, bd-48, bd-49, bd-50)
  - Restructured component hierarchy
  - Full keyboard navigation support
  - Mobile-optimized interface
  - WCAG AA accessibility compliance
```

### 5. Questions & Discussion (10 min)

**Common questions**:

- "What if I find extra work?" → Create issue, link with `discovered-from`
- "What if something is blocked?" → Dependencies prevent it from showing in
  `bd ready`
- "What if I forget to close an issue?" → Lead will catch it on Friday
- "Can we change the naming?" → Ask, but consistency matters for automation
- "What if we hate this?" → We gather feedback after one version, adjust or move
  to Phase 2

---

## Action Items from Meeting

### Everyone

- [ ] Read `PHASE_1_QUICK_REFERENCE.md` (print or bookmark)
- [ ] Understand the 5 commands
- [ ] Understand the 3 naming conventions
- [ ] Ask questions in Beads issue pw-zyu (not email)

### This Week (Test Run)

- [ ] Pick one feature from v0.20.0
- [ ] 1-2 volunteers create Beads issues
- [ ] Try the workflow
- [ ] Report what works/doesn't

### Next Week (Full Rollout)

- [ ] Everyone uses Phase 1 for new work
- [ ] Lead does Friday backlog update
- [ ] We gather feedback

---

## FAQ (For Meeting)

**Q: Is this mandatory?**  
A: Yes. For one version. After that, we'll evaluate Phase 2. For now, this is
how we work.

**Q: What if Beads breaks?**  
A: We still have Cody. Issues are in git. No data loss.

**Q: Can we skip the version label?**  
A: Not recommended. Enables future automation. Include from day one.

**Q: Why manual and not automated?**  
A: We want to understand the workflow first. After 1-2 versions, we'll automate
syncing.

**Q: What if someone doesn't use Beads?**  
A: Lead catches it on Friday. We'll re-align.

---

## Materials to Share

- [ ] `PHASE_1_QUICK_REFERENCE.md` (print 1 per person)
- [ ] Link to `docs/integration/CODY_BEADS_WORKFLOW.md`
- [ ] Tracking issue: pw-zyu
- [ ] This agenda

---

## Success Looks Like

**After meeting**:

- Team understands the 3-layer architecture
- Everyone can name 3 conventions
- Everyone can do the 5 commands
- Questions are posted in Beads (not email)

**After test run** (2 days):

- Issues created with correct naming
- `bd ready` shows the work
- Feature backlog updated
- Team comfortable enough to use for real

---

## Next Meeting (Friday)

**Kick-off meeting with full rollout**:

- Confirm test run worked
- Celebrate one week
- Answer any follow-up questions
- Set weekly Friday sync time

---

## Contacts & Help

- **Full guide**: `docs/integration/CODY_BEADS_WORKFLOW.md`
- **Quick card**: `PHASE_1_QUICK_REFERENCE.md`
- **Questions**: Create issue in pw-zyu
- **Problems**: Mention in standup
- **Feedback**: Post in pw-zyu

---

**Send this to team 24 hours before meeting**  
**Have everyone read for 5 min**  
**Spend 30 min on meeting**  
**Result: Clear understanding + test run starting**
