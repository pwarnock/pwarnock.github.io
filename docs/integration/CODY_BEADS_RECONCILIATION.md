# Cody Framework ↔ Beads Reconciliation

**Date**: November 17, 2025  
**Status**: Complete reconciliation with recommendations

---

## Summary

**Beads issues** (pw-lz0, pw-l2f, pw-4up, pw-bie, pw-15u) have been created for
**test infrastructure observability**, which is infrastructure/tooling work, not
a feature version.

**Key insight**: This work should be tracked in beads (not Cody Framework),
because:

- It's infrastructure/tooling (dependencies, configuration)
- It's not a user-facing feature version (no v0.X.X release needed)
- It's a multi-phase implementation that needs dependency tracking
- Beads is optimized for this use case (dependency-aware issue tracking)

---

## Separation of Concerns

### Cody Framework (.cody/)

**Purpose**: User-facing features and versions  
**Manages**: Feature backlog, versions (v0.X.X), releases, retrospectives  
**Example**: v0.17.0-test-infrastructure-observability

**Rule**: Only modify via `:cody` commands, never manually edit

### Beads (bd issues)

**Purpose**: Work items, tasks, dependencies, execution tracking  
**Manages**: All work (tasks, bugs, features), blocking relationships, ready
work  
**Example**: pw-l2f, pw-4up (Phase tasks)

**Rule**: Use `bd` CLI only, no markdown TODOs

### Docs (/docs/ and work/)

**Purpose**: Guides, references, operational documentation  
**Manages**: OBSERVABILITY.md (canonical), work/ (detailed research)

**Rule**: Check /docs/README.md index before creating docs

---

## Current State: Beads Issues Only

The observability work **should remain as beads issues** because:

1. **Not a user-facing feature**
   - Users don't see a "logging & observability" feature release
   - It's infrastructure enablement for internal tests
   - No product roadmap impact

2. **Pure infrastructure/tooling**
   - Dependencies (OpenTelemetry, Logfire SDKs)
   - Configuration changes (environment variables, OTEL init)
   - Developer experience improvement (live tracing, SQL queries)

3. **Dependency-heavy work**
   - Phase 0 blocks Phase 1
   - Phase 1 blocks Phase 2
   - Phase 2 blocks Phase 3
   - Beads is perfect for this (dependency tracking)

4. **Execution-focused**
   - Needs granular task tracking
   - Needs blocking relationships
   - Needs `status` and `priority` management
   - Beads provides all of this

---

## Recommendation: Create Version Only If Needed

### Option A: Beads-Only (RECOMMENDED)

```
Status: Infrastructure work
Tracking: Beads issues pw-l2f, pw-4up, pw-bie, pw-15u, pw-lz0
Timeline: 1-2 weeks
Impact: Internal only (test infrastructure)

✅ Use this approach for:
- Infrastructure work
- Tooling improvements
- Developer experience (internal)
- Maintenance and setup tasks
```

### Option B: Add to Cody Framework (If you want version tracking)

```
If decided to create a version:
:cody version add
Name: v0.17.0-test-observability
Description: Implement Logfire/OTEL for test infrastructure

Then:
- Feature backlog.md gets new entry
- Version folder created at .cody/project/versions/v0.17.0-test-observability/
- Beads issues link to version
- Release notes tracked automatically

❌ Probably not needed because:
- No user-facing release
- Internal infrastructure work
- Doesn't warrant full version bump
```

---

## How Beads and Cody Framework Interact

### If You Add a Version

```
.cody/project/versions/v0.17.0-test-observability/
├── version.md          (auto-managed by Cody)
├── tasklist.md         (references beads issues)
├── design.md           (architecture decisions)
├── retrospective.md    (lessons learned)
└── release-notes.md    (what changed)

Beads Issues (pw-l2f, pw-4up, etc.)
├── Execute the actual work
├── Track dependencies
└── Link to version in description
```

### If You Keep It Beads-Only (Recommended)

```
Beads Issues (pw-l2f, pw-4up, pw-bie, pw-15u, pw-lz0)
├── Track work
├── Manage dependencies
└── No version.md (internal work)

.cody/feature-backlog.md
└── No entry needed (not a user-facing feature)
```

---

## Current Setup (What I Created)

### Beads Issues (Fully Reconciled)

- ✅ **pw-lz0** (parent) - Implement Logfire observability for test
  infrastructure
- ✅ **pw-l2f** (Phase 0) - Team decision & POC (blocker)
- ✅ **pw-4up** (Phase 1) - Go OTEL Integration (depends on Phase 0)
- ✅ **pw-bie** (Phase 2) - TypeScript Instrumentation (depends on Phase 1)
- ✅ **pw-15u** (Phase 3) - Cross-Test Correlation (depends on Phase 2)

### Documentation

- ✅ `docs/operations/OBSERVABILITY.md` - Operational guide
- ✅ `work/` directory - Research and implementation guides
- ✅ `RECONCILIATION_SUMMARY.md` - Documents reconciliation

### NOT in Cody Framework

- ❌ No feature-backlog.md entry (internal work)
- ❌ No version created (infrastructure, not feature)
- ❌ No .cody/project/versions/ entry (would be over-engineering)

---

## AGENTS.md Compliance

### ✅ Beads Usage

- All work tracked in `bd` issues
- No markdown TODOs (all in beads)
- Proper issue types: task (infrastructure work)
- Dependencies defined (blocks, discovered-from)
- Ready work visible: `bd ready --json`

### ✅ Documentation

- Operational guide in `/docs/operations/OBSERVABILITY.md`
- Follows index in `/docs/README.md`
- Research docs in `work/` (project-specific)
- No duplication across multiple docs

### ✅ Cody Framework

- Not modified manually
- Used only as reference for context
- Beads is the execution system
- Framework used for actual features (not infrastructure)

### ✅ No Mixing

- Framework handles features (v0.X.Y versions)
- Beads handles work (issues, dependencies)
- Docs handle references (guides, operational)

---

## Decision Tree

```
Is this work user-facing?
  ├─ YES → Create Cody Framework version (v0.X.Y)
  │       Add to feature-backlog.md
  │       Create version folder
  │       Use beads for execution
  │
  └─ NO → Keep in beads only
          No version bump needed
          No feature-backlog.md entry
          Track as infrastructure/tooling
```

**For observability work:**  
→ **NO, keep in beads only** (infrastructure, not user-facing)

---

## If You Later Decide to Create a Version

Run:

```bash
:cody version add
```

Then fill in:

```
Name: v0.17.0-test-observability
Description: Implement Logfire/OpenTelemetry for comprehensive test infrastructure observability
Feature: Distributed tracing, live debugging, performance trending across Go and TypeScript tests
```

Then update beads issues to reference the version.

---

## File Locations Summary

```
Project Root/
├── AGENTS.md                           ← You are here
├── CODY_BEADS_RECONCILIATION.md        ← This file
├── RECONCILIATION_SUMMARY.md           ← First reconciliation
├── .cody/
│   └── project/
│       ├── build/feature-backlog.md    ← Cody Framework features (NOT updated)
│       └── versions/                   ← Cody Framework versions (NOT created)
├── docs/
│   └── operations/
│       └── OBSERVABILITY.md            ← Canonical operational guide (NEW)
├── work/
│   ├── 00_START_HERE.md                ← Navigation guide
│   ├── DECISION_MATRIX.md              ← Decision framework
│   ├── LOGFIRE_QUICK_START.md          ← Quick setup
│   ├── GO_OTEL_INTEGRATION_GUIDE.md    ← Technical guide
│   ├── LOGGING_OBSERVABILITY_RESEARCH.md ← Full analysis
│   ├── IMPLEMENTATION_CHECKLIST.md     ← Task breakdown
│   ├── README_OBSERVABILITY.md         ← Additional guide
│   └── RESEARCH_SUMMARY.txt            ← Executive summary
└── .beads/
    └── issues.jsonl                    ← Auto-synced beads data
```

---

## Next Steps

### If Keeping Beads-Only (Recommended)

1. Team reviews DECISION_MATRIX.md
2. Vote on Logfire vs OTEL+Jaeger (pw-l2f status: in_progress)
3. Start Phase 1 once Phase 0 complete
4. Use `bd ready --json` to see next tasks
5. No Cody Framework changes needed

### If Creating a Version (Optional)

1. Run `:cody version add` when Phase 1 starts
2. Fill in version details
3. Cody Framework auto-creates folder structure
4. Update issue descriptions to reference version
5. Create release notes after all 3 phases complete

---

## FAQ

### Q: Should infrastructure work go in Cody Framework?

**A**: No. Cody Framework is for user-facing feature versions. Use beads for all
work execution.

### Q: Why not create a v0.17.0 version?

**A**: Because users don't see a "new observability feature" release. It's
internal tooling. If you wanted to market it as a feature (e.g., "Improved test
debugging with live tracing"), then create a version.

### Q: Can we change this later?

**A**: Yes. If you decide this should be a version, run `:cody version add` and
link the beads issues to it.

### Q: What if Phase 3 becomes big?

**A**: Still use beads. If it grows into a major initiative, consider creating a
version at that point.

### Q: Who decides if something is "user-facing"?

**A**: Ask: Would a user (or stakeholder) care about this in release notes? If
no, use beads only.

---

## Compliance Checklist

- ✅ Beads issues created with proper structure
- ✅ Dependencies defined (Phase blocking)
- ✅ No manual Cody Framework edits
- ✅ Operational docs in /docs/
- ✅ Research docs in work/
- ✅ No markdown TODOs (all in beads)
- ✅ No version created (not needed for infrastructure)
- ✅ Ready to start Phase 0 (team decision)

---

## References

- **AGENTS.md**: Project workflow guidelines
- **Cody Framework**: .cody/ directory (read-only, managed by framework)
- **Beads**: .beads/issues.jsonl (auto-synced, CLI-managed)
- **Docs**: docs/ and work/ directories (manually maintained)

---

**Status**: ✅ READY

Beads and Cody Framework are properly reconciled.  
Infrastructure work tracked in beads (correct approach).  
No version needed (would be over-engineering).  
Ready to proceed with Phase 0 team decision.
