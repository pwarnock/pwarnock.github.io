# Cody-Beads Integration Workflow

**Phase 1: Manual Metadata Linking** - Establish conventions connecting feature planning to daily task execution.

---

## Overview

This document explains how **Cody Framework** (feature planning) and **Beads** (daily task management) work together to create a unified development workflow.

### Three-Layer Architecture

```
Planning Layer (Cody)
  Feature concepts → Backlogs → Requirements
         ↓ [Linked via conventions]
Execution Layer (Beads)
  Todo issues → In Progress → Completed
         ↓ [Status aggregated back to Cody]
Delivery Layer
  Release notes → GitHub releases → Live deployment
```

---

## Quick Start (For Team Members)

### When Starting a Feature

1. **Check Cody backlog** for the feature you're working on:
   ```bash
   # Navigate to .cody/project/build/feature-backlog.md
   # Find the feature and note its ID
   ```

2. **Create Beads issues** for implementation tasks:
   ```bash
   # Create issue linked to feature
   bd create "Implement component X" \
     -t task \
     -p 2 \
     --json
   
   # Note the ID (will be bd-NNN)
   ```

3. **Update feature backlog** with issue links:
   ```markdown
   # In .cody/project/build/feature-backlog.md
   ## Feature: My Feature
   - Implementation: See bd-47 for details
   ```

### During Development

1. **Claim work**:
   ```bash
   bd update bd-47 --status in_progress
   ```

2. **Track progress**:
   ```bash
   # See what's ready (not blocked)
   bd ready --json
   
   # Update status
   bd update bd-47 --status review
   ```

3. **Complete work**:
   ```bash
   bd close bd-47 --reason "Completed and merged"
   ```

---

## Naming Conventions

### Beads Issues

Format: `pw-NNN` or auto-generated `bd-NNN`

**Naming examples**:
```bash
# Good: Clear, actionable
bd create "Navigation component restructure" -p 1

# Good: References version
bd create "Add keyboard shortcuts (v0.20.0)" -p 2

# Good: Linked to feature
bd create "Accessibility audit for navigation" -p 1
```

### Version Labels

All issues for a version get labeled with version:

```bash
# During creation
bd create "Issue title" \
  -t feature \
  --json

# Then manually edit .beads/issues.jsonl to add label
# Or update after creation (when bd supports it)
```

**Format**: `version:X.Y.Z` (lowercase, semantic version)

**Examples**:
- `version:0.20.0` - Features for v0.20.0
- `version:0.19.5` - Hotfix issues
- `version:0.21.0` - Next version planning

### Feature Links

In issue descriptions, reference the Cody feature:

```markdown
## Description
Implement enhanced navigation system as specified in v0.20.0 feature backlog.

## Related
- Feature: Enhanced Navigation System (v0.20.0)
- Cody backlog: .cody/project/build/feature-backlog.md
- Requirements: See FEATURE_REQ_NAVIGATION.md
```

---

## Manual Synchronization Process

### Phase 1: Feature Planning → Beads Issues

**When**: After Cody feature backlog is finalized for a version

**Steps**:

1. **Read feature backlog**:
   ```bash
   # Open .cody/project/build/feature-backlog.md
   # Review features and subtasks for the version
   ```

2. **Create Beads issues for each feature/subtask**:
   ```bash
   # Main feature
   bd create "Navigation component restructure (v0.20.0)" \
     -t feature \
     -p 1 \
     --json
   
   # Record the issue ID: bd-47
   
   # Subtask
   bd create "Add keyboard shortcuts (v0.20.0)" \
     -t task \
     -p 2 \
     --deps discovered-from:bd-47 \
     --json
   
   # Record: bd-48
   ```

3. **Update feature backlog** with issue references:
   ```markdown
   ## Feature: Enhanced Navigation System
   - [x] Discovery complete
   - [x] Requirements document
   - [ ] Implementation
     - bd-47: Component restructure
     - bd-48: Keyboard shortcuts (depends on bd-47)
     - bd-49: Mobile improvements (depends on bd-47)
     - bd-50: Accessibility (depends on bd-48, bd-49)
   ```

4. **Commit**:
   ```bash
   git add .beads/issues.jsonl .cody/project/build/feature-backlog.md
   git commit -m "feat: create beads issues for v0.20.0 features"
   ```

### Phase 2: Status Aggregation → Cody Backlog

**When**: Weekly status updates during development

**Steps**:

1. **Query Beads for version**:
   ```bash
   # See all issues for v0.20.0
   # Count completed, in-progress, blocked
   bd ready --json | grep -i "v0.20.0"
   ```

2. **Calculate progress**:
   ```bash
   # Manual calculation (example for v0.20.0)
   Total: 23 issues
   Completed: 12
   In Progress: 7
   Blocked: 2
   Todo: 2
   
   Progress: 12/23 = 52% complete
   ```

3. **Update feature backlog**:
   ```markdown
   ## Feature: Enhanced Navigation System
   - Status: 12/23 issues completed (52%)
   - Issues: bd-47, bd-48, bd-49, bd-50
   - Blocked: bd-49 (waiting for design review), bd-50 (accessibility testing)
   - At risk: None
   ```

4. **Commit**:
   ```bash
   git add .cody/project/build/feature-backlog.md
   git commit -m "docs: update v0.20.0 progress (52% complete)"
   ```

### Phase 3: Release → Release Notes

**When**: Before creating production release tag

**Steps**:

1. **Query completed issues**:
   ```bash
   # Find all completed issues for version
   # (Manual filtering from .beads/issues.jsonl)
   ```

2. **Group by type**:
   - Features (type: feature)
   - Bug fixes (type: bug)
   - Improvements (type: task)

3. **Generate release notes**:
   ```markdown
   # Release v0.20.0

   ## New Features
   - Enhanced Navigation System (bd-47, bd-48, bd-49, bd-50)
     - Restructured component hierarchy
     - Keyboard shortcut support
     - Mobile-optimized navigation
     - Full accessibility compliance

   ## Bug Fixes
   - Fixed focus management in modals (bd-41)
   - Corrected z-index stacking (bd-42)

   ## Performance
   - Reduced bundle size by 8% (bd-35)
   ```

4. **Commit as release notes**:
   ```bash
   git add docs/releases/v0.20.0.md
   git commit -m "docs: v0.20.0 release notes"
   ```

---

## Dependency Tracking

### Creating Dependent Issues

When one task depends on another:

```bash
# Create the blocking task first
bd create "Design navigation component" -t task -p 1 --json
# Returns: bd-47

# Create the dependent task
bd create "Implement navigation component" \
  -t task \
  -p 2 \
  --deps blocks:bd-47 \
  --json
# Returns: bd-48
```

### Using `bd ready`

See which tasks are ready to work on (not blocked):

```bash
# Show all unblocked tasks
bd ready --json

# Filter by status
bd ready --status todo --json

# Filter by version (when label support added)
bd ready --json | grep "version:0.20.0"
```

### Blocking Pattern

```
Feature Requirement
   ↓ (blocks)
Core Implementation
   ↓ (blocks)
Testing & Validation
   ↓ (blocks)
Documentation
   ↓
Release
```

**Example**:
```bash
# Core work
bd create "Implement feature" -p 1 --json  # bd-100

# Testing depends on implementation
bd create "Test feature" -p 2 --deps blocks:bd-100 --json  # bd-101

# Docs depend on testing
bd create "Document feature" -p 2 --deps blocks:bd-101 --json  # bd-102
```

---

## GitHub Integration

### Branch Workflow

```
main (development)
  ↓ Feature branch
feature/my-feature
  ↓ Create PR
  ↓ Tests pass
  ↓ Review approved
  ↓ Merge to main
main (updated)
  ↓ Version bump
  ↓ Pre-release tag
v0.20.0-rc.1 (staging)
  ↓ Test in staging
  ↓ Tests pass
  ↓ Final release tag
v0.20.0 (production)
```

### Linking Issues in PRs

When creating a pull request, reference the Beads issue:

```markdown
# Title
Fix navigation accessibility issues

## Beads Issues
Resolves: bd-50
Related: bd-47, bd-48, bd-49

## Description
Implements full accessibility compliance for enhanced navigation...
```

This creates traceability from PR → Beads → Cody feature.

---

## Weekly Workflow Template

### Monday: Planning
1. Review Cody backlog for current version
2. Check Beads for blockers and at-risk items
3. Create new issues if necessary
4. Update issue priorities

### Tuesday-Thursday: Development
1. Claim issue: `bd update bd-XXX --status in_progress`
2. Work on feature
3. Create PR with issue reference
4. Move to review: `bd update bd-XXX --status review`

### Friday: Status & Planning
1. Complete review: `bd close bd-XXX --reason "Merged"`
2. Update feature backlog with progress
3. Plan next week's issues
4. Identify blockers for standup

---

## Common Scenarios

### Adding a Feature Mid-Sprint

```bash
# Create issue immediately
bd create "New feature for v0.20.0" -t feature -p 2 --json  # bd-X

# Update Cody backlog
# Add to feature list with issue reference

# Move issue to appropriate priority
bd update bd-X --priority 1
```

### Blocking Discovery

Feature can't proceed due to external dependency:

```bash
# Create blocker issue
bd create "Waiting for design review" -t task -p 0 --json  # bd-Y

# Update dependent task
bd update bd-X --deps blocks:bd-Y

# Mark as blocked
bd update bd-X --status blocked

# Update backlog
# Note: bd-X blocked on bd-Y (design review pending)
```

### Splitting Large Feature

Feature is too big, needs breaking down:

```bash
# Original issue
bd create "Enhanced navigation system" -p 1 --json  # bd-47

# Break into subtasks
bd create "Navigation structure" -p 1 --deps blocks:bd-47 --json  # bd-47-1
bd create "Keyboard support" -p 2 --deps blocks:bd-47-1 --json    # bd-47-2
bd create "Mobile optimization" -p 2 --deps blocks:bd-47-1 --json # bd-47-3
bd create "Accessibility audit" -p 2 --deps blocks:bd-47-2 --json # bd-47-4

# Close original as split
bd close bd-47 --reason "Split into bd-47-1 through bd-47-4"
```

---

## Tools & Commands Reference

### Essential Beads Commands

```bash
# List ready work
bd ready --json

# Create issue
bd create "Title" -t feature|bug|task -p 0-4 --json

# Update status
bd update bd-XX --status todo|in_progress|review|blocked|completed

# Update priority (0=critical, 1=high, 2=medium, 3=low, 4=backlog)
bd update bd-XX --priority 2

# Close issue
bd close bd-XX --reason "Completed"

# Search issues
grep "version:0.20.0" .beads/issues.jsonl

# View all issues
cat .beads/issues.jsonl | jq .
```

### Cody Commands

```bash
# Refresh project state
:cody refresh

# Relearn context
:cody relearn

# View backlog
# Navigate to .cody/project/build/feature-backlog.md
```

---

## Troubleshooting

### Issue Not Appearing in `bd ready`

**Cause**: Issue is blocked on another task

**Solution**:
```bash
# Check what's blocking it
grep "bd-XX" .beads/issues.jsonl | jq .

# Update dependency
bd update bd-XX --deps ""  # Clear dependency if incorrect
```

### Unsure Which Issues to Work On

**Solution**:
```bash
# Always run this first
bd ready --json

# This shows all unblocked issues
# Pick one with highest priority
```

### Feature Backlog Out of Sync

**Solution**:
1. Check latest Beads status: `bd ready --json`
2. Count completed vs total for each feature
3. Update feature backlog with current numbers
4. Commit: `git commit -am "docs: sync feature backlog with beads"`

---

## Phase 1 Success Criteria

- [x] Conventions documented (this file)
- [ ] All team members understand naming conventions
- [ ] First feature backlog items have Beads issues
- [ ] `bd ready` shows current work
- [ ] Feature backlog updated weekly
- [ ] Release notes template ready

---

## Next Steps (Phase 2+)

When Phase 1 has been used for 1-2 versions, consider Phase 2:
- Automated script: `backlog-to-beads.js` (parse Cody → create Beads issues)
- Automated script: `beads-to-cody.js` (aggregate status → update Cody)
- Automated script: `issues-to-release-notes.js` (completed issues → release notes)

Phase 2 will eliminate manual syncing while preserving the same workflow.

---

## See Also

- [AGENTS.md](/AGENTS.md) - Beads quick start and issue types
- [CODY_BEADS_INTEGRATION_PLAN.md](/CODY_BEADS_INTEGRATION_PLAN.md) - Full technical roadmap
- [STRATEGIC_ROADMAP.md](/STRATEGIC_ROADMAP.md) - Project roadmap
- `.bd.toml` - Beads configuration
- `.cody/project/build/feature-backlog.md` - Feature planning document
