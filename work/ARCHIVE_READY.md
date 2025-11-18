# Ready to Archive

These files have been fully consolidated into new authoritative sources. Ready to move to `docs/_archived/` directory.

## Files Ready for Archival

### 1. docs/operations/RELEASE_MANAGEMENT.md
- **Status**: ✅ Fully consolidated into DEPLOYMENT.md
- **Original size**: 500 lines (705 total)
- **Content merged**:
  - ✅ Semantic Versioning strategy
  - ✅ Version Naming Convention
  - ✅ Branch Strategy
  - ✅ Pre-Release Checklist (comprehensive 5-section version)
  - ✅ Post-Release Monitoring and Alerting
  - ✅ Tools and Resources list
  - ✅ Best Practices (guardrails, development, release, security)
  - ✅ Escalation Procedures (Level 1-3)
  - ✅ Metrics and KPIs
  - ✅ CI/CD Workflow Architecture overview
  - ✅ Continuous Improvement section
  
- **Reason for archival**: All content preserved in DEPLOYMENT.md; no longer need two deployment docs at different governance levels

---

### 2. docs/operations/DEPLOYMENT_NOTES.md
- **Status**: ✅ Fully consolidated into DEPLOYMENT.md
- **Original size**: 346 lines (402 total)
- **Content merged**:
  - ✅ CSS Processing Issue (with root cause, solution, prevention)
  - ✅ GitHub Pages Deployment Failure (3 solution options)
  - ✅ CI/CD Pipeline Configuration Critical (permissions, job structure)
  - ✅ Build Failures Due to Missing CSS
  - ✅ Deployment Hangs or Times Out
  - ✅ Rollback After Bad Deployment
  - ✅ Version Management & Releases (sync, update process, rollback strategy)
  - ✅ Pre-Deployment Checklist
  - ✅ Recovery Steps
  - ✅ Lessons Learned

- **Reason for archival**: All operational knowledge preserved in DEPLOYMENT.md; no longer need separate notes doc

---

## Consolidation Metrics

| Metric | Value |
|--------|-------|
| Original lines | 1,107 |
| Consolidated lines | 759 |
| Deduplication | 348 lines (31%) |
| Information loss | 0% |
| Cross-references added | 3 (RELEASE_WORKFLOW, RELEASE_PROCESS, ENVIRONMENT_CONFIG) |
| New sections added | 2 (Quick Links, CSS Validation subsection) |
| Checklists merged | 6 (pre-commit, code quality, content, performance, security, post-release) |

---

## Archive Actions

When ready to complete consolidation:

```bash
# Move to archive directory
mkdir -p docs/_archived/operations
git mv docs/operations/RELEASE_MANAGEMENT.md docs/_archived/operations/RELEASE_MANAGEMENT.md
git mv docs/operations/DEPLOYMENT_NOTES.md docs/_archived/operations/DEPLOYMENT_NOTES.md

# Update .gitignore if needed (probably not - we keep _archived/)
# Just ensure they're not linked from anywhere

# Verify no broken links
grep -r "RELEASE_MANAGEMENT\|DEPLOYMENT_NOTES" docs/ --exclude-dir=_archived
# Should return nothing or only from docs/README.md archive list

# Commit
git add docs/
git commit -m "docs: archive RELEASE_MANAGEMENT.md and DEPLOYMENT_NOTES.md (consolidated into DEPLOYMENT.md)"
```

---

## Verification Before Archive

Before moving files to archive, verify:

- [x] DEPLOYMENT.md has all critical sections
- [x] DEPLOYMENT.md has all error messages and solutions
- [x] DEPLOYMENT.md has all checklists
- [x] DEPLOYMENT.md has branch strategy
- [x] DEPLOYMENT.md has release notes template
- [x] DEPLOYMENT.md has monitoring thresholds
- [x] DEPLOYMENT.md has escalation procedures
- [x] No external links point to RELEASE_MANAGEMENT.md (only internal doc updates)
- [x] No external links point to DEPLOYMENT_NOTES.md
- [x] docs/README.md updated to reflect consolidation
- [x] DEPLOYMENT.md has cross-references instead of duplication

---

## Cross-References to Authoritative Sources

To maintain clean separation without duplication, DEPLOYMENT.md references:

1. **RELEASE_WORKFLOW.md** - For three-stage release mechanics and scripts
   - Why: Technical reference for executing releases
   - What it covers: RC tagging, testing, final release with `./scripts/release.sh`

2. **RELEASE_PROCESS.md** - For Cody Framework workflow
   - Why: Framework-specific approach to version development
   - What it covers: `:cody` commands, beads integration, retrospectives

3. **ENVIRONMENT_CONFIG.md** - For environment setup
   - Why: Separate operational concern (staging vs production config)
   - What it covers: Environment variables, secrets management

4. **AGENTS.md** - For auto-versioning details
   - Why: Framework automation guidance
   - What it covers: Pre-commit hook behavior, version bumping logic

---

## Impact on Documentation Index

Updated `docs/README.md`:
- ✅ DEPLOYMENT.md status: ⚠️ WIP → ✅ Consolidated
- ✅ Added consolidation note: "Merged from: RELEASE_MANAGEMENT.md + DEPLOYMENT_NOTES.md"
- ✅ Added archive entries for consolidated files
- ✅ Removed from "In Progress" section

---

## Final Notes

This consolidation:
- **Maintains context**: All critical information preserved with full detail
- **Eliminates redundancy**: 31% reduction through deduplication
- **Improves navigation**: Single authoritative source for deployment procedures
- **Preserves separation of concerns**: References other docs instead of duplicating
- **No information loss**: All checklists, procedures, error solutions intact

Ready to archive when user confirms.
