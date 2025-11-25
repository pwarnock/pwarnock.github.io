# Beads Hygiene & Cleanup Plan

**Date**: 2025-11-25  
**Reference**: Steve Yegge's [Beads Best Practices](https://steve-yegge.medium.com/beads-best-practices-2db636b9760c)

## Current State

- **Total Issues**: 126
- **Open Issues**: 20
- **Closed Issues**: 106
- **Database Size**: 50KB
- **JSONL Lines**: 105
- **Prefix**: `pw-` (short, good)
- **Database Last Recovered**: 2025-11-25 (recovered from JSONL)

## Best Practices Alignment

### ✅ Already Following
- **Short prefix** (`pw-`) - good for readability
- **Git-native tracking** - all issues in `.beads/issues.jsonl` (version controlled)
- **Regular sync** - daemon auto-syncs to JSONL
- **Below size threshold** - 126 issues is healthy (best practice: <500)

### ⚠️ Need to Implement
- **Periodic cleanup** - Remove closed issues older than N days
- **Plan-then-import workflow** - Formalize how we file epics
- **Comprehensive issue filing** - Track all work >2 minutes (currently gaps)
- **Regular hygiene checks** - `bd doctor` weekly
- **Archived history** - Document closed work for future reference

## Cleanup Strategy

### Stage 1: Archive Historical Issues (This Session)

Before cleanup, create an archive of all closed issues for historical reference.

**Goal**: Preserve history while keeping working database small

**Method**:
1. Export all closed issues to `.beads/archive/closed-issues.jsonl`
2. Document closed issues in CHANGELOG-BEADS.md with summaries
3. Link closed issues to Cody version retrospectives where relevant
4. Keep JSONL in git history (can be recovered from git log)

**Issues to Archive** (106 closed):
- v0.20.1 work (26 subtasks) → Link to retrospective.md
- Bug fixes and feature work (80 others) → Document by category

### Stage 2: Establish Cleanup Schedule

**Weekly Hygiene**:
- Run `bd doctor` to check database health
- Review closed issues older than 7 days for archival
- Verify sync status between `.db` and `issues.jsonl`
- Check for orphaned RCs or stale requests

**Monthly Deep Dive**:
- Run `bd cleanup --older-than 14d` (keep last 2 weeks of closed issues)
- Sync changes: `bd sync`
- Export monthly snapshot to archive
- Commit changes and tag with release

**Quarterly Archive**:
- Create formal archive milestone in docs
- Generate CHANGELOG entry
- Review for patterns and improvements

### Stage 3: Issue Filing Standards

**Filing Threshold**: >2 minutes of work

**Categories to Track**:
1. **Features** (`-t feature`) - New site functionality
2. **Bugs** (`-t bug`) - Critical fixes
3. **Tasks** (`-t task`) - Implementation subtasks
4. **Epics** (`-t epic`) - Major feature blocks
5. **Chores** (`-t chore`) - Maintenance, deps, tooling

**Workflow**:
1. Identify work to do (feature, bug, or epic decomposition)
2. Create beads issue(s) immediately
3. Link to parent epic if applicable
4. Track work in Cody version (if feature) or standalone
5. Close when complete with reason/summary

**No Gaps**: Every significant work item should have corresponding beads issue

### Stage 4: Beads-Cody Linkage

**Current State**:
- v0.20.1 version has retrospective linking to closed issues ✅
- v0.21.0 version has pw-701 epic linked ✅
- Future versions should establish epic-to-version mapping

**Process**:
1. When creating Cody version, identify corresponding beads epic
2. Reference epic ID in version.md
3. Create epics before starting work (plan → import)
4. Map phases to beads issues
5. After release, write retrospective linking to closed issues

## Action Items

### Immediate (This Session)

- [ ] Export closed issues archive to `.beads/archive/closed-issues.jsonl`
- [ ] Create CHANGELOG-BEADS.md documenting all closed issues
- [ ] Create this hygiene plan doc ✅
- [ ] Update AGENTS.md with Beads best practices from Yegge
- [ ] Schedule weekly `bd doctor` checks

### This Week

- [ ] Link all 106 closed issues to appropriate version retrospectives
- [ ] Establish archive directory structure
- [ ] Create Beads hygiene checklist for developers
- [ ] Update release process to include "create beads epic" step

### Next Sprint (v0.21.0)

- [ ] Implement pw-701 epic tasks (release process)
- [ ] File beads for all work (comprehensive coverage)
- [ ] Test Beads-Cody workflow end-to-end
- [ ] Document any new best practices discovered

### Monthly

- [ ] Run `bd doctor --fix` if needed
- [ ] Archive closed issues older than 14 days
- [ ] Commit archive snapshot
- [ ] Review for patterns/improvements

## History Preservation

### Git History
- All issues preserved in git history via `.beads/issues.jsonl`
- Can recover any issue with `git log` and `git show`
- Commits tagged with version releases

### Markdown Documentation
- **CHANGELOG-BEADS.md** - Summary of all closed issues, linked to versions
- **Version retrospectives** - Link to specific closed beads issues
- **Cody versions** - Map to beads epics
- **This document** - Hygiene procedures and best practices

### Archive Directory
- `.beads/archive/` - Snapshots of JSONL at milestones
- Organized by quarter/month
- Can restore if needed

### Key Linking Points
```
Release (v0.20.1) 
  ↓ retrospective.md
  ↓ links to: pw-k4b, pw-qhc, pw-jds, pw-w3h, pw-z1w, pw-jfy
  ↓ each links to 20+ subtasks (all in git history)
  ↓ can rebuild full issue tree from any commit
```

## Success Metrics

1. **Database Health**: `bd doctor` passes weekly
2. **Size Management**: <500 open+closed issues total
3. **Cleanup Adoption**: Monthly archive created and committed
4. **Issue Coverage**: All work >2 min has beads issue
5. **Traceability**: Every closed issue linkable to version/commit
6. **No Data Loss**: Can recover any historical issue from git

## References

- [Steve Yegge's Beads Best Practices](https://steve-yegge.medium.com/beads-best-practices-2db636b9760c)
- [AGENTS.md](/AGENTS.md) - Beads workflow documentation
- [.beads/issues.jsonl](/.beads/issues.jsonl) - Current issue database
