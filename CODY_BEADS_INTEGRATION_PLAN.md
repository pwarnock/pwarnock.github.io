# Cody Framework & Beads Integration Plan

**Date**: November 24, 2025  
**Status**: Strategic Planning  
**Scope**: Unified workflow for professional development with version management and issue tracking

---

## Executive Summary

Integrate Cody Framework (version management, feature backlogs, retrospectives) with Beads issue tracking (dependency-aware task management) to create a **unified development workflow** that:

- **Eliminates silos** between version planning and daily issue tracking
- **Provides visibility** from feature concept → backlog → issue → implementation → release
- **Enables dependency tracking** across versions and work streams
- **Automates workflows** between planning and execution
- **Maintains single source of truth** for project work

---

## Current State

### Cody Framework (`.cody/`)
✅ **What it does**:
- Version management (v0.19.4 current)
- Feature backlogs per version
- Version planning documents (discovery, requirements, implementation plan)
- Retrospectives and release notes
- Living documentation

✅ **Strengths**:
- Structured version lifecycle
- Professional release workflow
- Comprehensive documentation

❌ **Gaps**:
- No issue dependency tracking
- No real-time work status updates
- No connection to daily task management
- Manual status tracking

### Beads Issue Tracking (`.bd.toml`)
✅ **What it does**:
- Dependency-aware task tracking
- JSON-based, git-friendly storage
- Real-time issue status
- Issue templates and workflows
- Quick `bd ready` to see unblocked work

✅ **Strengths**:
- Dependency tracking across issues
- Automatic git syncing
- Easy CLI workflow
- Distributed/offline-friendly

❌ **Gaps**:
- No version/release context
- No feature-level planning
- No retrospectives
- No release notes generation

---

## Integration Vision

### Three-Layer Architecture

```
┌────────────────────────────────────────────────────────┐
│          PLANNING LAYER (Cody)                         │
│   Feature Concepts → Backlogs → Release Planning       │
└─────────────────────┬──────────────────────────────────┘
                      │
         [Bi-directional Integration]
                      │
┌─────────────────────▼──────────────────────────────────┐
│       EXECUTION LAYER (Beads)                          │
│   Backlog Issues → In Progress → Review → Completed    │
└─────────────────────┬──────────────────────────────────┘
                      │
         [Automated Sync & Aggregation]
                      │
┌─────────────────────▼──────────────────────────────────┐
│       RELEASE LAYER (Combined)                         │
│   Completed Work → Retrospective → Release Notes       │
└────────────────────────────────────────────────────────┘
```

---

## Detailed Integration Architecture

### Phase 1: Metadata Linking (No Coding Required)

**Goal**: Connect Cody version features to Beads issues

**Implementation**:
1. **Beads issue labels** include version: `version:0.19.5`, `version:0.20.0`
2. **Beads descriptions** reference Cody backlog: `Feature from cody-backlog #42`
3. **Cody feature-backlog.md** links to issues: `See bd-123 for implementation`
4. **Naming convention**: Issues named like `pw-123` match Cody references

**Example workflow**:
```markdown
# Cody Feature Backlog - v0.20.0
## Feature: Enhanced Navigation System
- [x] Discovery complete
- [x] Requirements document (FEATURE_REQ_NAVIGATION.md)
- [ ] Implementation: See bd-47 through bd-50

# Beads Issues
bd-47: Navigation component restructure (version:0.20.0)
bd-48: Add keyboard shortcuts (version:0.20.0)  ← depends on bd-47
bd-49: Mobile nav improvements (version:0.20.0) ← depends on bd-47
bd-50: Accessibility audit (version:0.20.0)    ← depends on bd-48, bd-49
```

**Benefits**:
- ✅ No code changes needed
- ✅ Clear traceability
- ✅ Humans can navigate both systems
- ✅ Foundation for later automation

---

### Phase 2: Automated Syncing (Scripts)

**Goal**: Keep Cody and Beads synchronized automatically

**Implementation**: Create sync scripts (Bash + JavaScript)

#### 2.1 Generate Issues from Backlog

**Script**: `scripts/sync/backlog-to-beads.js`

```bash
bun run sync:backlog-to-beads
```

**What it does**:
1. Read `.cody/project/build/feature-backlog.md`
2. Parse features and subtasks
3. Create Beads issues with:
   - Title from feature name
   - Description from requirements doc
   - `version:X.Y.Z` label
   - Dependencies between issues
   - Status: "todo" (unstarted)

**Example output**:
```bash
$ bun run sync:backlog-to-beads --version 0.20.0
✓ Scanning feature backlog for v0.20.0
✓ Found 5 features (23 subtasks)
✓ Creating issues...
  ✓ bd-47: Navigation component restructure
  ✓ bd-48: Add keyboard shortcuts (depends on bd-47)
  ✓ bd-49: Mobile nav improvements (depends on bd-47)
  ✓ bd-50: Accessibility audit (depends on bd-48, bd-49)
✓ Synced 23 issues to beads
✓ Update cody/feature-backlog.md with issue links? (y/n)
```

#### 2.2 Aggregate Issue Status to Cody

**Script**: `scripts/sync/beads-to-cody.js`

```bash
bun run sync:beads-to-cody --version 0.20.0
```

**What it does**:
1. Read all Beads issues with `version:X.Y.Z` label
2. Calculate progress per feature
3. Update `.cody/project/build/feature-backlog.md` with:
   - Issue count per feature
   - Completion percentage
   - Blocked issues
   - Risk items

**Example output**:
```markdown
# Feature: Enhanced Navigation System
- Status: 12/23 issues completed (52%)
- Issues: bd-47, bd-48, bd-49, bd-50 (see beads)
- Blocked: 2 (bd-49 waiting for design, bd-50 waiting for testing)
- At risk: bd-50 (accessibility audit)
```

#### 2.3 Generate Release Notes from Completed Issues

**Script**: `scripts/sync/issues-to-release-notes.js`

```bash
bun run sync:issues-to-release-notes --version 0.20.0
```

**What it does**:
1. Query Beads for issues with `version:0.20.0` and status "completed"
2. Group by issue type (feature, bug, improvement)
3. Generate `docs/releases/v0.20.0.md` with:
   - Features added
   - Bugs fixed
   - Performance improvements
   - Breaking changes
   - Thanks to contributors

**Example output**:
```markdown
# Release Notes: v0.20.0

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
- Improved Core Web Vitals (bd-36)
```

---

### Phase 3: Workflow Automation (CI/CD Integration)

**Goal**: Automate transitions between planning and execution

#### 3.1 Automated Issue Creation on Release Planning

**Trigger**: When `.cody/project/build/feature-backlog.md` is updated

**GitHub Action**: `.github/workflows/sync-backlog-to-beads.yml`

```yaml
name: Sync Backlog to Beads

on:
  push:
    paths:
      - '.cody/project/build/feature-backlog.md'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun run sync:backlog-to-beads
      - name: Create PR if issues created
        if: env.ISSUES_CREATED > 0
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update feature backlog links'
          title: 'chore: link new backlog items to beads issues'
```

**Benefit**: Every time Cody backlog is updated, corresponding issues auto-created in Beads

#### 3.2 Automated Status Updates on Issue Change

**Trigger**: When Beads issues are updated (`.beads/issues.jsonl`)

**GitHub Action**: `.github/workflows/sync-beads-to-cody.yml`

```yaml
name: Update Cody Status from Beads

on:
  push:
    paths:
      - '.beads/issues.jsonl'
  schedule:
    - cron: '0 * * * *'  # Hourly
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun run sync:beads-to-cody
      - name: Auto-commit progress updates
        if: env.CHANGES > 0
        run: |
          git config user.name "cody-bot"
          git config user.email "bot@cody.local"
          git add .cody/project/build/feature-backlog.md
          git commit -m "chore: update cody progress from beads"
          git push
```

**Benefit**: Cody backlog always reflects current work status from Beads

#### 3.3 Automated Release Notes on Version Release

**Trigger**: Manual run when preparing release

**Command**: `bun run sync:issues-to-release-notes --version 0.20.0`

**Effect**: 
- Queries all "completed" issues for version
- Generates professional release notes
- Commits to `docs/releases/v0.20.0.md`
- Ready for GitHub release creation

---

### Phase 4: Dashboard & Visibility

**Goal**: Single view of project health and progress

#### 4.1 Progress Dashboard

**Command**: `bun run status:dashboard --version 0.20.0`

**Output**:
```
╔════════════════════════════════════════════════════════════════╗
║           VERSION 0.20.0 PROGRESS DASHBOARD                   ║
╚════════════════════════════════════════════════════════════════╝

CODY PLANNING STATUS
├─ Backlog Features: 5
├─ Discovery: ✓ 5/5 complete
├─ Requirements: ✓ 5/5 complete
└─ Planning: ✓ 5/5 complete

BEADS EXECUTION STATUS
├─ Total Issues: 23
├─ Completed: 12 (52%)
├─ In Progress: 8 (35%)
├─ Blocked: 2 (9%)
├─ Ready to start: 3
└─ Dependencies satisfied: 21/23

RISK ASSESSMENT
├─ Critical path: bd-50 (accessibility)
├─ Dependency chains: 4 max depth
├─ Completion estimate: 2 weeks
└─ Risk items: 2 (documented)

RELEASE READINESS
├─ Issues closed: 12/23 (52%)
├─ Blockers: 2 (need attention)
├─ Testing: 1/5 features audited
└─ Documentation: 4/5 features documented
```

#### 4.2 Real-time Metrics

**Script**: `scripts/sync/metrics.js`

Collects:
- Feature completion %
- Issue burn-down rate
- Dependency health
- Risk tracking
- Contributor metrics

**Exposed via**: JSON API (optional), markdown reports

---

## Detailed Workflows

### Workflow 1: Feature Development (Happy Path)

```
1. PLANNING (Cody)
   ├─ Create feature in feature-backlog.md
   ├─ Write discovery document
   ├─ Create requirements document
   └─ Estimate & assign to version

2. TRANSITION (Automated)
   ├─ Run: bun run sync:backlog-to-beads
   └─ Creates Beads issues with dependencies

3. EXECUTION (Beads)
   ├─ bun run dev  (work on feature)
   ├─ bd update <id> --status in_progress
   ├─ Create PR (links to bd-XX)
   ├─ Code review
   └─ bd update <id> --status completed

4. RELEASE (Combined)
   ├─ Run: bun run sync:issues-to-release-notes
   ├─ Manual review of generated notes
   ├─ Cody retrospective
   └─ Tag & publish release
```

### Workflow 2: Bug Report (Urgent Fix)

```
1. DISCOVERY (Beads - immediate)
   ├─ bd create "Fix homepage bug" -t bug -p 1
   ├─ bd update <id> --status in_progress
   └─ Fix & PR

2. POST-RELEASE (Cody - next planning)
   ├─ Add to feature backlog as lesson learned
   ├─ Update testing strategy
   └─ Reference original issue (bd-XX)

3. METRICS (Automated)
   ├─ Dashboard shows bug trend
   └─ Informs next version planning
```

### Workflow 3: Dependency Blocking (Priority Management)

```
1. DEPENDENCY CREATED
   ├─ bd create "Fix layout system" -t task -p 1
   ├─ bd create "Use new layout in nav" -p 2 --deps bd-47
   └─ bd create "Test responsive layouts" -p 2 --deps bd-47

2. STATUS VISIBLE
   ├─ bd-48 shows "blocked by bd-47"
   ├─ bd-49 shows "blocked by bd-47"
   └─ Dashboard shows 2 items blocked

3. PRIORITIZATION
   ├─ Team focuses on bd-47 (critical path)
   ├─ Once complete: bd-48, bd-49 become "ready"
   └─ Dashboard shows progress change

4. CODY INTEGRATION
   ├─ Cody backlog updated: "2/3 layout features unblocked"
   └─ Risk assessment improved
```

---

## Implementation Roadmap

### Phase 1: Foundation (1-2 days)
- [x] Beads configured (DONE)
- [ ] Establish naming convention (issues = `pw-123`)
- [ ] Add version labels to `.bd.toml`
- [ ] Manual linking in docs (Cody ↔ Beads)
- [ ] Create integration documentation

### Phase 2: Scripting (1 week)
- [ ] `scripts/sync/backlog-to-beads.js` - Create issues from backlog
- [ ] `scripts/sync/beads-to-cody.js` - Aggregate status to Cody
- [ ] `scripts/sync/issues-to-release-notes.js` - Generate release notes
- [ ] `scripts/sync/metrics.js` - Collect health metrics
- [ ] Add to `package.json` scripts

### Phase 3: Automation (1 week)
- [ ] `.github/workflows/sync-backlog-to-beads.yml` - Auto-create issues
- [ ] `.github/workflows/sync-beads-to-cody.yml` - Auto-update status
- [ ] CI/CD integration tests
- [ ] Error handling & logging

### Phase 4: Dashboard (3-5 days)
- [ ] `bun run status:dashboard` command
- [ ] Real-time metrics collection
- [ ] Progress visualization
- [ ] Risk assessment engine

### Phase 5: Polish & Documentation (2-3 days)
- [ ] Create `docs/integration/CODY_BEADS_WORKFLOW.md`
- [ ] Document sync commands
- [ ] Training materials
- [ ] Team onboarding

**Total estimated**: 3-4 weeks for full integration

---

## Technical Details

### Script Architecture

```javascript
// scripts/sync/lib/beads.js
export class BeadsAPI {
  async getIssues(filter) { }
  async createIssue(data) { }
  async updateIssue(id, data) { }
  async queryByVersion(version) { }
  async queryByStatus(status) { }
}

// scripts/sync/lib/cody.js
export class CodyAPI {
  async readBacklog() { }
  async writeBacklog(content) { }
  async readVersion(versionId) { }
  async extractFeatures() { }
}

// scripts/sync/lib/mapper.js
export function mapBacklogToIssues(features) {
  // feature → issue conversion
  // Creates dependencies
  // Assigns version labels
}

export function mapIssuesToBacklog(issues) {
  // Aggregates status
  // Calculates progress
  // Identifies risks
}
```

### Database Schema (Beads Enhancement)

Current `.bd.toml` already supports:
```toml
[labels]
categories = ["infrastructure", "testing", "documentation"]
effort_sizes = ["xs", "sm", "md", "lg", "xl"]
impact_levels = ["critical", "high", "medium", "low"]
```

**Add for Cody integration**:
```toml
[integration]
cody_enabled = true
auto_sync = true
sync_schedule = "hourly"
version_label_format = "version:{semver}"
feature_link_format = "cody-feature:{id}"

[[integration.workflows]]
name = "backlog_to_beads"
trigger = "on_backlog_change"
auto_commit = true

[[integration.workflows]]
name = "beads_to_cody"
trigger = "hourly"
auto_commit = true

[[integration.workflows]]
name = "issues_to_release_notes"
trigger = "manual"
```

---

## Data Flow Diagram

```
┌─────────────────────┐
│   Cody Backlog      │
│  feature-backlog.md │
└──────────┬──────────┘
           │
    [Parse Features]
           │
    ┌──────▼──────────────────────┐
    │ Identify:                    │
    │ - Feature name              │
    │ - Requirements doc          │
    │ - Subtasks                  │
    │ - Dependencies              │
    └──────┬───────────────────────┘
           │
    [Create Issues with Labels]
           │
    ┌──────▼──────────────────┐
    │   Beads Issues          │
    │  .beads/issues.jsonl    │
    └──────┬──────────────────┘
           │
      [Developers work]
           │
    ┌──────▼──────────────────┐
    │ Status updates via:      │
    │ - bd update              │
    │ - PR merge               │
    │ - Commits                │
    └──────┬──────────────────┘
           │
    [Aggregate completed issues]
           │
    ┌──────▼──────────────────┐
    │ Generate Release Notes   │
    │ docs/releases/v0.X.Y.md  │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │ GitHub Release           │
    │ Tag v0.X.Y              │
    └─────────────────────────┘
```

---

## Risk & Constraints

### Technical Risks
1. **Out-of-sync data** if manual edits bypass sync scripts
   - Mitigation: CI/CD automation, validation checks, alert on conflicts

2. **Breaking changes in Cody Framework** affecting sync
   - Mitigation: Version checks, graceful degradation, test coverage

3. **JSON JSONL format changes** in Beads
   - Mitigation: Schema validation, migration scripts

### Process Risks
1. **Team doesn't use Beads for daily work**
   - Mitigation: Training, process documentation, incentives

2. **Cody backlog becomes stale**
   - Mitigation: Auto-sync keeps status current, clear responsibilities

3. **Feature planning and execution drift**
   - Mitigation: Regular retrospectives, dependency tracking

### Constraints
- **Beads 0.24.3**: Stable, mature
- **Cody Framework**: Read-only integration (don't manually edit `.cody/`)
- **GitHub Actions**: Available for automation
- **Team bandwidth**: Need 3-4 weeks for implementation

---

## Success Metrics

### Adoption
- [ ] 100% of features tracked in both systems
- [ ] No manual version updates needed
- [ ] Zero data sync issues
- [ ] Team uses `bd ready` daily

### Quality
- [ ] Release notes auto-generated with <5% manual edits
- [ ] Issue-to-feature traceability 100%
- [ ] Dependency blocking prevents surprises
- [ ] Retrospectives informed by data

### Efficiency
- [ ] Release planning time reduced 30%
- [ ] Issue triage time reduced 20%
- [ ] Release notes generation time reduced 50%
- [ ] Team satisfaction with workflow ↑

---

## Phase 1 Implementation (Start Now)

**Minimal viable integration** - No code changes, immediate benefit:

1. **Establish conventions**
   - Beads issues: `pw-NNN` format
   - Version labels: `version:0.20.0`
   - Feature links: Reference in descriptions
   - Dependencies: Use `--deps` flag

2. **Manual synchronization**
   - When feature backlog changes: Create issues manually
   - When issues complete: Update backlog manually
   - Before release: Collect completed issues for notes

3. **Documentation**
   - `docs/integration/CODY_BEADS_WORKFLOW.md` - How they work together
   - Version templates in `.bd.toml` - Issue templates per version
   - Team guidelines - When to use Cody vs Beads

4. **Team training**
   - How to create version-linked issues
   - How to read dependency information
   - When to update Cody vs Beads

**Time**: 2-3 days  
**Benefit**: Clear traceability, improved visibility, foundation for automation

---

## Phase 2+ (Defer to Later)

Only implement scripting & automation if Phase 1 proves valuable.

---

## See Also

- [AGENTS.md](/AGENTS.md) - Development workflow (includes Beads usage)
- [.bd.toml](/.bd.toml) - Beads configuration (foundation for integration)
- `.cody/project/build/feature-backlog.md` - Version planning (Cody)
- `docs/operations/RELEASE_WORKFLOW.md` - Release process
- `.github/workflows/` - CI/CD automation

---

## Questions & Decisions

### Q: Should integration be manual or automated?
**A**: Start manual (Phase 1), graduate to automated (Phase 2+) if proven valuable

### Q: What if Cody/Beads change incompatibly?
**A**: Use adapter patterns, versioned APIs, graceful degradation

### Q: How to handle older versions?
**A**: Beads issues support version labels retroactively

### Q: Who maintains the integration?
**A**: Initially developer (manual), later CI/CD (automated)

### Q: What about team communication?
**A**: Slack integration (future), email on status changes (future)

---

**Status**: Strategic Plan Ready for Review  
**Next Step**: Implement Phase 1 (manual conventions & documentation)  
**Review**: Come back after Phase 1 to evaluate Phase 2 necessity
