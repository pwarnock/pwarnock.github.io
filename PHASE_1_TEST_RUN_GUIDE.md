# Phase 1 Test Run Guide

**Timeline**: 2-4 hours (after team alignment meeting)  
**Participants**: 2-3 volunteers + lead  
**Goal**: Verify the workflow works before full rollout  
**Tracking**: Use pw-zyu epic

---

## Feature Selection

### Choose a Feature from v0.20.0

**Candidates** (from feature backlog):

| Feature | Subtasks | Effort | Why Pick |
|---------|----------|--------|----------|
| F89: Manual Promotion Workflow | 3-4 | 2-3 days | Core, well-defined |
| F90: Change Validation | 2-3 | 1-2 days | Smaller, good for first try |
| F91: Environment Configuration | 2-3 | 1-2 days | Infrastructure |
| F92: Documentation Updates | 2-3 | 1 day | Clear scope |

**Recommendation**: Pick **F90 (Change Validation)** for test run
- Clear scope (environment-specific testing)
- 2-3 subtasks (manageable)
- 1-2 days effort (fast iteration)
- Good for testing workflow

---

## Test Run Steps (2-3 hours)

### Phase 1: Setup (10 min)

**Lead**: Do this first
1. Review feature in `.cody/project/build/feature-backlog.md`
2. Identify subtasks
3. Have volunteers ready

**Example (F90: Change Validation)**:
```markdown
## F90: Change Validation
- Environment-specific testing setup
- Validation framework implementation  
- CI/CD integration testing
- Documentation of validation process
```

### Phase 2: Create Beads Issues (30 min)

**Volunteers**: Create issues while lead watches

**Issue 1: Main Feature**
```bash
bd create "Environment-specific testing setup (v0.20.0)" \
  -t feature \
  -p 1 \
  --json
```
→ Returns: bd-1 (example)

**Issue 2: Subtask (depends on Issue 1)**
```bash
bd create "Validation framework implementation (v0.20.0)" \
  -t task \
  -p 2 \
  --deps blocks:bd-1 \
  --json
```
→ Returns: bd-2

**Issue 3: Subtask (depends on Issue 1)**
```bash
bd create "CI/CD integration testing (v0.20.0)" \
  -t task \
  -p 2 \
  --deps blocks:bd-1 \
  --json
```
→ Returns: bd-3

**Issue 4: Subtask (depends on Issues 2 & 3)**
```bash
bd create "Document validation process (v0.20.0)" \
  -t task \
  -p 2 \
  --deps blocks:bd-2,bd-3 \
  --json
```
→ Returns: bd-4

**Observation Points**:
- [ ] Did naming look good? ("... (v0.20.0)")
- [ ] Did volunteers understand -p priority?
- [ ] Did --deps flag work?
- [ ] Issues created in `.beads/issues.jsonl`?

### Phase 3: Verify Beads (10 min)

**Lead**: Show volunteers the work

```bash
# See what's ready
bd ready --json

# Should show:
# - bd-1 is ready (no blockers)
# - bd-2, bd-3 are NOT ready (blocked by bd-1)
# - bd-4 is NOT ready (blocked by bd-2, bd-3)
```

**Observation Points**:
- [ ] `bd ready` shows correct state?
- [ ] Blockers are preventing dependent issues?
- [ ] Volunteers understand the dependency flow?

### Phase 4: Update Feature Backlog (20 min)

**Lead + 1 Volunteer**: Update Cody manually

Edit `.cody/project/build/feature-backlog.md`:

```markdown
## F90: Change Validation
Environment-specific testing and validation

| ID  | Feature                 | Description                              | Priority | Status |
|-----|-------------------------|------------------------------------------|----------|--------|
| F90 | Change Validation       | Environment-specific testing and validation | High | 🟡 In Progress |

### Implementation Issues
- bd-1: Environment-specific testing setup
  - bd-2: Validation framework implementation (depends on bd-1)
  - bd-3: CI/CD integration testing (depends on bd-1)
  - bd-4: Document validation process (depends on bd-2, bd-3)

### Progress
- Status: 0/4 issues completed (0%)
- Ready: bd-1
- In Progress: None
- Blocked: bd-2, bd-3, bd-4
- At risk: None
```

**Observation Points**:
- [ ] Did they find the right section in backlog?
- [ ] Format look correct?
- [ ] Easy to understand the dependency structure?
- [ ] Commit message appropriate? ("docs: add v0.20.0 feature F90 issues")

### Phase 5: Simulate Volunteer Work (30 min)

**Volunteer 1**: Claim issue bd-1

```bash
bd update bd-1 --status in_progress
```

**Observation Points**:
- [ ] Worked without error?
- [ ] Easy to understand?

**Volunteer 1**: Finish issue (pretend they merged a PR)

```bash
bd close bd-1 --reason "Merged environment testing setup"
```

**Then check what's ready**:
```bash
bd ready --json

# Should now show:
# - bd-2 is ready (bd-1 done)
# - bd-3 is ready (bd-1 done)
# - bd-4 is still blocked (needs bd-2 AND bd-3)
```

**Volunteers 2 & 3**: Claim bd-2 and bd-3

```bash
bd update bd-2 --status in_progress
bd update bd-3 --status in_progress
```

**Finish both**:
```bash
bd close bd-2 --reason "Merged validation framework"
bd close bd-3 --reason "Merged CI/CD tests"
```

**Check what's ready**:
```bash
bd ready --json

# Should show bd-4 is now ready
```

**Volunteer 1**: Claim and finish final task

```bash
bd update bd-4 --status in_progress
bd close bd-4 --reason "Merged documentation"
```

**Observation Points**:
- [ ] Did dependencies work as expected?
- [ ] Did `bd ready` update correctly after each close?
- [ ] Did volunteers understand the flow?
- [ ] Would they do this for real?

### Phase 6: Update Progress (10 min)

**Lead**: Update feature backlog with final status

```markdown
## F90: Change Validation
- Status: 4/4 issues completed (100%)
- Ready for v0.20.0 release ✓
```

**Observation Points**:
- [ ] Easy to update?
- [ ] Clear what progress means?

### Phase 7: Debrief (10 min)

**Group discussion**:

**What worked?**
- [ ] Naming conventions clear?
- [ ] Issue creation straightforward?
- [ ] `bd ready` helpful?
- [ ] Dependency tracking worked?
- [ ] Progress visible?

**What was confusing?**
- [ ] Any commands unclear?
- [ ] Backlog updates hard?
- [ ] Naming inconsistencies?
- [ ] Missing documentation?

**What would you change?**
- [ ] Different naming?
- [ ] Different conventions?
- [ ] Clearer instructions?
- [ ] Different tools?

**Record feedback** in pw-zyu epic (create sub-issues as needed)

---

## Success Criteria

**Test run is successful if**:

- ✅ All 4 issues created with correct naming
- ✅ `bd ready` shows correct dependency state
- ✅ Feature backlog updated (twice: initial + final)
- ✅ Volunteers felt confident enough to use for real work
- ✅ No major confusion on commands
- ✅ Feedback captured for full rollout

**If any ✗**: Don't worry. Adjust instructions and try again. That's what test runs are for.

---

## Troubleshooting During Test Run

### Issue creation fails
```bash
# Verify Beads is working
bd ready --json

# Should return issues in JSON
# If error, re-sync:
cd .beads && git pull
```

### `bd ready` not showing expected state
```bash
# Check if dependencies are formatted correctly
# Should be: --deps blocks:id,id
# Not: --deps blocks:id blocks:id

# Can edit .beads/issues.jsonl directly (last resort)
```

### Backlog update formatting is hard
```bash
# Show them the template in PHASE_1_QUICK_REFERENCE.md
# Show them an example in docs/integration/CODY_BEADS_WORKFLOW.md
# Formatting doesn't need to be perfect, just clear
```

---

## What's Not Being Tested

These are lead responsibilities (not part of test run):

- [ ] Weekly Friday aggregation (show as demo)
- [ ] Release notes generation (show template)
- [ ] GitHub release creation (show example)

---

## Test Run Timeline Example

```
14:00  Alignment meeting ends
14:15  Grab 2-3 volunteers
14:25  Select feature F90
14:35  Create 4 Beads issues (30 min)
15:05  Verify in Beads (10 min)
15:15  Update feature backlog (20 min)
15:35  Simulate work flow (30 min)
16:05  Update final status (10 min)
16:15  Debrief & feedback (10 min)
16:30  Done! Ready for full rollout tomorrow
```

---

## After Test Run

### If Everything Worked
- [ ] Celebrate! 
- [ ] Update pw-zyu: "Test run successful"
- [ ] Announce full rollout for next day
- [ ] Confirm Friday kick-off meeting time

### If Issues Found
- [ ] Document what failed
- [ ] Create sub-issues in pw-zyu
- [ ] Adjust instructions
- [ ] Run another quick test
- [ ] Then full rollout

---

## Commit Changes from Test Run

After test run, commit the work:

```bash
git add .beads/issues.jsonl .cody/project/build/feature-backlog.md

git commit -m "test: phase 1 workflow test run with F90

- Created 4 issues: bd-1, bd-2, bd-3, bd-4
- Verified dependency tracking works
- Confirmed bd ready shows correct state
- Updated feature backlog with progress
- Team ready for full rollout"
```

---

## Resources

- **Quick reference**: `PHASE_1_QUICK_REFERENCE.md`
- **Full guide**: `docs/integration/CODY_BEADS_WORKFLOW.md`
- **Tracking**: pw-zyu epic in Beads
- **Backlog**: `.cody/project/build/feature-backlog.md`

---

**Estimated Duration**: 2-3 hours  
**Effort**: Moderate (but worth it)  
**Outcome**: Team confident + ready for real work  
**Success Rate**: Very high (it's just conventions)

**Go test!**
