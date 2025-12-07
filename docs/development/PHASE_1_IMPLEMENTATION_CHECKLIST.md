# Phase 1: Cody-Beads Integration Implementation Checklist

**Status**: 🟢 Ready to Begin  
**Timeline**: 2-3 days  
**Risk Level**: Minimal (no code changes)  
**Effort**: Documentation + team training

---

## Deliverables

### Documentation (Completed)

- [x] `docs/integration/CODY_BEADS_WORKFLOW.md` - Complete 4,200-line guide
  - Three-layer architecture explanation
  - Quick start for team members
  - Naming conventions (pw-XXX, version labels)
  - Manual synchronization procedures (3 phases)
  - Dependency tracking examples
  - Weekly workflow template
  - Common scenarios and troubleshooting
  - Command reference

- [x] Update `docs/README.md` - Add integration section
- [x] Update `AGENTS.md` - Add Phase 1 workflow instructions

### Team Setup

- [ ] **Team alignment meeting** (30 min)
  - Explain three-layer architecture
  - Walk through example feature → issues → release
  - Q&A on conventions and process
  - Set expectations for Phase 1

- [ ] **Test run with next feature**
  - Select upcoming feature from backlog
  - Create Beads issues for all subtasks
  - Update feature backlog with issue references
  - Verify `bd ready` shows the work
  - Have team member claim and work on a task

- [ ] **Process verification** (1 day after test run)
  - Issues are being created with correct naming
  - Feature backlog is being updated
  - `bd ready` is showing current work
  - Developers understand the workflow

### Rollout

- [ ] **Kick-off meeting** (30 min)
  - Review documentation
  - Confirm everyone understands conventions
  - Share Phase 1 success criteria
  - Establish weekly sync cadence

- [ ] **First week monitoring**
  - Check daily for convention compliance
  - Answer questions about naming/process
  - Adjust if needed
  - Document any clarifications

- [ ] **Weekly status updates**
  - Aggregate Beads status to feature backlog
  - Update v0.20.0 progress in Cody
  - Share progress with team

---

## Success Criteria

### ✅ Phase 1 Success Indicators

- [ ] **Documentation**: All team members can reference workflow
  - Test: Can new team member find CODY_BEADS_WORKFLOW.md?
  - Test: Can they understand the three-layer architecture?

- [ ] **Conventions**: Issues follow naming standards
  - Test: Issues are named descriptively (not "fix" or "work")
  - Test: Issues include version (e.g., "v0.20.0")
  - Test: Features and subtasks are linked

- [ ] **Workflow**: Beads to Cody sync happens weekly
  - Test: Feature backlog updated with completion %
  - Test: `bd ready` shows current work
  - Test: Blocked issues are noted in backlog

- [ ] **Team understanding**: No confusion between systems
  - Test: All new work goes to Beads, not markdown TODOs
  - Test: Team knows to check `bd ready` first
  - Test: Release notes created from Beads, not guesswork

- [ ] **Release notes**: Auto-generatable from Beads
  - Test: Can compile release notes from completed issues
  - Test: Notes are complete and organized by type
  - Test: Manual editing is <10%

---

## Implementation Timeline

### Day 1: Setup & Documentation (Completed ✓)

- [x] Create `docs/integration/CODY_BEADS_WORKFLOW.md`
- [x] Update documentation index
- [x] Update AGENTS.md with Phase 1 instructions
- **Time**: 4-6 hours

### Day 2: Team Training & Test Run

- [ ] Schedule and run team alignment meeting
  - Duration: 30-45 minutes
  - Attendees: Full team
  - Materials: CODY_BEADS_WORKFLOW.md, example walkthrough
- [ ] Test run with existing feature
  - Select feature from `.cody/project/build/feature-backlog.md`
  - Have 1-2 team members create Beads issues
  - Update feature backlog together
  - Verify `bd ready` works
  - **Time**: 2-3 hours

### Day 3: Rollout & Verification

- [ ] Kick-off with full team
  - Confirm understanding
  - Answer questions
  - Set expectations
  - **Time**: 30 minutes

- [ ] First week observation
  - Monitor issue creation for compliance
  - Answer questions in real-time
  - Document any clarifications
  - **Time**: 1-2 hours spread across week

- [ ] First status update
  - Gather Beads status for v0.20.0
  - Update feature backlog
  - Share with team
  - **Time**: 1-2 hours

---

## Phase 1 in Action: Example

### Scenario: Starting v0.20.0 (Enhanced Navigation)

**Step 1: Planning** (Cody)

```markdown
# Feature Backlog - v0.20.0

## Feature: Enhanced Navigation System

### Subtasks:

- [ ] Component restructure
- [ ] Keyboard shortcuts
- [ ] Mobile optimization
- [ ] Accessibility audit
```

**Step 2: Execution** (Beads) - Team creates issues:

```bash
# Component restructure (blocker)
bd create "Navigation component restructure (v0.20.0)" -t feature -p 1 --json
# Returns: bd-47

# Keyboard shortcuts (depends on bd-47)
bd create "Add keyboard shortcuts (v0.20.0)" -t task -p 2 --deps blocks:bd-47 --json
# Returns: bd-48

# Mobile (depends on bd-47)
bd create "Mobile nav optimization (v0.20.0)" -t task -p 2 --deps blocks:bd-47 --json
# Returns: bd-49

# Accessibility (depends on bd-48, bd-49)
bd create "Accessibility audit (v0.20.0)" -t task -p 2 --deps blocks:bd-48,bd-49 --json
# Returns: bd-50
```

**Step 3: Update Backlog** (Cody) - Link issues:

```markdown
## Feature: Enhanced Navigation System

- Status: 0/4 issues completed (0%)
- Issues: bd-47, bd-48, bd-49, bd-50
- Implementation plan:
  1. bd-47: Component restructure (start first - blocks others)
  2. bd-48: Keyboard shortcuts (start after bd-47)
  3. bd-49: Mobile optimization (start after bd-47)
  4. bd-50: Accessibility audit (start after bd-48 & bd-49)
```

**Step 4: Daily Work** (Beads)

```bash
# See what's ready
bd ready --json
# Shows bd-47 is ready (no blockers)

# Dev claims work
bd update bd-47 --status in_progress

# Dev finishes, creates PR
# In PR: "Resolves bd-47"

# PR reviewed and merged
bd close bd-47 --reason "Merged"

# Now bd-48 and bd-49 show as ready!
```

**Step 5: Weekly Update** (Cody)

```markdown
## Feature: Enhanced Navigation System

- Status: 1/4 issues completed (25%)
- Completed: bd-47 ✓
- In Progress: bd-48 (keyboard shortcuts)
- Ready: bd-49 (mobile, after bd-47 complete)
- Blocked: bd-50 (waiting for bd-48 & bd-49)
- Risk: None
```

**Step 6: Release** (Both systems)

```bash
# Before release, check Beads
# All 4 issues should be closed

# Generate release notes from Beads issues
# Title from issues, grouped by type
# Create docs/releases/v0.20.0.md
# Create GitHub release tag v0.20.0
# Deploy to production
```

---

## Monitoring & Adjustment

### Weekly Checks

Every Friday:

1. **Check Beads status** for current version:

   ```bash
   bd ready --json
   # Count todo, in_progress, completed
   ```

2. **Update Cody backlog** with progress:

   ```markdown
   - Status: X/Y issues completed (ZZ%)
   - Ready: [list of ready issues]
   - In Progress: [current work]
   - Blocked: [issues waiting on something]
   ```

3. **Identify blockers**:
   - What's preventing progress?
   - Can we unblock it?
   - Need to change priority?

4. **Team standup**:
   - What's completed this week?
   - What's in progress?
   - What's blocking?
   - Any process improvements?

### Adjustments for Phase 2

After Phase 1 runs for 1-2 versions, evaluate:

- **Did the workflow help?**
  - Could you see progress clearly?
  - Did it prevent scope creep?
  - Did it help with release notes?

- **What was painful?**
  - Manual syncing took too long?
  - Hard to remember to update backlog?
  - Issues got out of sync?

- **Readiness for Phase 2?**
  - Should we automate syncing?
  - Do we need scripting?
  - Is current manual approach sufficient?

---

## Common Questions

### Q: What if we're mid-sprint when we start?

**A**: Finish current work without Phase 1. Start with next feature. No rush.

### Q: Can we skip version labels?

**A**: Not recommended. Version labels enable future automation. Include them
from day one.

### Q: Do all issues need to be in Beads?

**A**: For Phase 1, yes. All features and subtasks should have Beads issues.
Helps with release notes.

### Q: What if someone forgets to update the backlog?

**A**: Catch it at weekly sync. It's okay to miss a week. Just update next time.

### Q: Can we use a different naming scheme?

**A**: The `pw-XXX` or `bd-XXX` pattern is flexible. Key is: consistent,
descriptive, version-aware.

---

## Escalation Path

### If Issues Aren't Clear

1. **Team member**: Ask in chat with example
2. **AI Agent**: Can reference CODY_BEADS_WORKFLOW.md
3. **Lead**: Review and clarify in team meeting
4. **Document**: Add scenario to workflow guide

### If Process Feels Burdensome

1. **Collect feedback** from team
2. **Analyze pain points**:
   - Is it the conventions?
   - Is it manual syncing?
   - Is it missing tooling?
3. **Adjust or move to Phase 2**

### If Backlog Gets Out of Sync

1. **Don't panic** - Just sync at next weekly update
2. **Use `bd ready` as source of truth**
3. **Update backlog from Beads**, not other way
4. **Consider Phase 2** if syncing becomes tedious

---

## Resources

- **Main guide**: `docs/integration/CODY_BEADS_WORKFLOW.md`
- **Quick reference**: `AGENTS.md` → Beads section
- **Configuration**: `.bd.toml`
- **Feature planning**: `.cody/project/build/feature-backlog.md`
- **Open issues**: `bd ready --json`

---

## Sign-Off

**Phase 1 Implementation Ready**: ✅  
**Documentation Complete**: ✅  
**Team Training Materials**: ✅  
**Example Walkthrough**: ✅

**Ready to Start**: Yes  
**Estimated Duration**: 2-3 days  
**Expected Outcome**: Clear feature → issue → release traceability

---

**Status**: 🟢 Implementation Ready  
**Next Step**: Schedule team alignment meeting  
**Target Start**: This week  
**Expected Completion**: End of week
