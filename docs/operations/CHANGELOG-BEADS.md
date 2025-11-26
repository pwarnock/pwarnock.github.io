# Beads Issue Tracking Changelog

## Archive Overview

This document preserves history of all closed issues. Issues are archived
monthly and linked to Cody versions and git history for complete traceability.

**Archive Strategy**:

- All issues preserved in `.beads/issues.jsonl` (git-tracked)
- Closed issues documented here with links
- Monthly snapshots created and committed
- Recoverable from any git commit via `git log` and `git show`

---

## v0.20.1 Audit & Consolidation (2025-11-25)

**Epic**: pw-k4b  
**Dates**: 2025-11-25 10:40 - 10:42  
**Reference**: `.cody/project/build/versions/v0.20.1-audit-consolidation/retrospective.md`

### Master Task

- **pw-k4b** - v0.20.1: Audit & Consolidation (Epic) [CLOSED]

### Work Tasks (26 items)

#### Task 1: Mark Verified Versions (10 subtasks)

- **pw-qhc** - Mark 10 verified versions complete (Task 1) [CLOSED]
- **pw-b1h** - Mark v0.4.0-testing verified complete [CLOSED]
- **pw-5u1** - Mark v0.6.0-hero-recreation verified complete [CLOSED]
- **pw-se8** - Mark v0.7.0-tools-section verified complete [CLOSED]
- **pw-5u5** - Mark v0.8.0-upstream-integration verified complete [CLOSED]
- **pw-qy0** - Mark v0.8.1-bug-fixes verified complete [CLOSED]
- **pw-b4g** - Mark v0.10.3-hero-standardization verified complete [CLOSED]
- **pw-5pe** - Mark v0.12.0-blog-layout-optimization verified complete [CLOSED]
- **pw-clr** - Mark v0.12.1-twitter-embed-fix verified complete [CLOSED]
- **pw-054** - Mark v0.14.0-infrastructure-overhaul verified complete [CLOSED]
- **pw-hzq** - Mark v0.16.0-hero-carousel-system verified complete [CLOSED]

#### Task 2: Audit Incomplete Versions (6 subtasks)

- **pw-jds** - Audit 6 incomplete versions (Task 2) [CLOSED]
- **pw-gtp** - Audit v0.15.0-deployment-workflows [CLOSED]
- **pw-brw** - Audit v0.8.2 [CLOSED]
- **pw-4oi** - Audit v0.9.0-design-system [CLOSED]
- **pw-e8x** - Audit v0.9.1-bugfixes [CLOSED]
- **pw-1cm** - Audit v0.9.2-mobile-content [CLOSED]
- **pw-74c** - Audit v0.9.3-security [CLOSED]

#### Task 3: Document Findings

- **pw-w3h** - Document audit findings in retrospective.md [CLOSED]

#### Task 4: Plan Recovery

- **pw-z1w** - Plan recovery strategy for v0.21.0 [CLOSED]

#### Task 5: Infrastructure

- **pw-jfy** - Resolve DB-JSONL sync mismatch and verify beads integration
  [CLOSED]

**Summary**: Comprehensive audit of version history, database recovery, and
documentation. All 26 items completed and closed.

---

## Production Bugs (November 2025)

| ID     | Title                                                                  | Closed     | Severity |
| ------ | ---------------------------------------------------------------------- | ---------- | -------- |
| pw-yr4 | CRITICAL: Site title missing from production - CSS processing conflict | 2025-11-05 | Critical |

**Summary**: CSS processing bug causing template variables to render empty in
production. Fixed and verified.

---

## Open Issues (20)

**High Priority (1)**:

- pw-701 - Implement Self-Enforcing Release Process (Epic)

**Medium Priority (19)**:

- pw-702-705 - Release process phases
- pw-zyu - Phase 1: Cody-Beads integration rollout
- pw-g5f - Implement Beads 0.24 best practices
- pw-qwe - Testing Coverage Improvement
- Additional testing/accessibility issues

---

## Historical Patterns

### By Issue Type

- **Epics**: 4 (planning/architecture)
- **Tasks**: 101 (implementation work)
- **Features**: 10 (major features)
- **Bugs**: 7 (defects)
- **Chores**: 4 (maintenance)

### By Status

- **Closed**: 106 (84%)
- **Open**: 20 (16%)

### By Priority

- **Critical (0)**: 0
- **High (1)**: 1
- **Medium (2)**: 111
- **Low (3)**: 12
- **Backlog (4)**: 2

---

## Archive Timeline

### 2025 Q4

- **2025-11-25**: Initial Beads hygiene setup. Recovered database from JSONL,
  archived v0.20.1 work (26 issues), documented best practices

---

## Recovery Instructions

### Recover Historical Issue

```bash
# View issue at specific commit
git show <commit>:.beads/issues.jsonl | grep "pw-123"

# View all issues at tag
git show v0.20.1:.beads/issues.jsonl | wc -l

# Check issue history timeline
git log --oneline .beads/issues.jsonl | head -20
```

### Restore Issue from Archive

```bash
# Issues are in git history - can be reviewed/restored anytime
bd list --json  # Current state
git log -p .beads/issues.jsonl | grep pw-123  # Historical view
```

### Export Monthly Snapshot

```bash
bd list --json > .beads/archive/issues-2025-11.json
git add .beads/archive/ && git commit -m "archive: monthly issues snapshot"
```

---

## References

- **Beads Best Practices**:
  https://steve-yegge.medium.com/beads-best-practices-2db636b9760c
- **Hygiene Plan**: `/docs/operations/BEADS_HYGIENE_PLAN.md`
- **Workflow Documentation**: `/AGENTS.md`
- **Version History**: `.cody/project/build/versions/*/retrospective.md`
