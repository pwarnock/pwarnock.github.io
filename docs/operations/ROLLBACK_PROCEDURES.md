# Rollback Procedures

Guide for safely rolling back deployments in case of issues, including staging and production rollback procedures, communications, and verification steps.

## Overview

Rollback is the process of reverting a deployment to a previous known-good state. This guide covers procedures for both staging and production environments.

**Key Principles**:
- **Automation first**: Use scripts and git tools, not manual file editing
- **Documentation**: Always log the reason for rollback
- **Verification**: Test the rollback before declaring success
- **Communication**: Notify team immediately of rollbacks
- **Monitoring**: Watch for issues after rollback completes

---

## When to Rollback

### Immediate Rollback (Do Not Wait for Review)

Rollback immediately without waiting for investigation if:
- 🔴 **Production is down** (errors on all pages)
- 🔴 **Critical functionality broken** (site unusable)
- 🔴 **Security issue discovered** (vulnerability in live code)
- 🔴 **Data loss occurring** (content or user data affected)

### Expedited Rollback (Within 15 minutes)

Rollback quickly if:
- 🟡 **Major feature broken** (significantly impacts users)
- 🟡 **Performance degradation** (site very slow)
- 🟡 **Layout/design broken** (pages look wrong)
- 🟡 **Integration issues** (third-party services failing)

### Consider Hotfix (Don't Rollback Immediately)

Don't rollback; instead create a hotfix if:
- 🟢 **Minor bug** (small subset affected, easy to fix)
- 🟢 **Content error** (typo or factual issue)
- 🟢 **Style issue** (visual tweak needed)
- 🟢 **Performance** (slow but not critical)

---

## Staging Rollback

### Procedure: Quick Rollback

**When**: Staging builds fail or tests don't pass
**Time**: 2-5 minutes
**Risk**: Low (only affects testing environment)

```bash
# 1. Get list of recent commits
git log --oneline staging -10

# 2. Identify the commit to revert to (before the bad commit)
# Example: Previous working staging deployment

# 3. Reset staging branch to previous commit
git checkout staging
git reset --hard <previous-good-commit-hash>

# 4. Force push to staging remote
# Note: We're using force push on staging (acceptable practice)
git push staging staging:staging --force

# 5. Monitor deployment
bun run dev:logs

# 6. Verify staging is working
bun run validate:deployment post staging
```

### Procedure: Revert Commit

**When**: You want to keep the commit history (recommended)
**Time**: 5-10 minutes
**Risk**: Low (staging only)

```bash
# 1. Check recent commits
git log --oneline staging -5

# 2. Revert the problematic commit
git checkout staging
git revert <commit-hash>

# 3. Push the revert commit
git push staging staging:staging

# 4. Monitor deployment
bun run dev:logs

# 5. Verify
bun run validate:deployment post staging
```

**Advantage**: Creates a new commit that documents the rollback  
**Disadvantage**: Adds a commit to history (but this is often good for documentation)

### Example: Staging Rollback

```bash
# See what's on staging
git log --oneline staging -5
# a1b2c3d fix: update blog styles
# d4e5f6g feat: add new section
# g7h8i9j feat: deployment improvements ← This is good
# j0k1l2m docs: cleanup architecture

# Last staging deployment was good, so reset to g7h8i9j
git checkout staging
git reset --hard g7h8i9j

# Force push to trigger redeploy
git push staging staging:staging --force

# Watch logs to confirm build
bun run dev:logs

# After 1-2 minutes, verify
bun run validate:deployment post staging
```

---

## Production Rollback

### Decision Tree

```
Production Issue Detected
  ↓
Is the site down completely?
  ├─ YES → IMMEDIATE ROLLBACK (proceed to "Immediate Rollback")
  └─ NO → Is it a security issue?
        ├─ YES → IMMEDIATE ROLLBACK
        └─ NO → Can it be hotfixed in <30 min?
               ├─ YES → Create HOTFIX and push
               └─ NO → Quick Assessment (5 min)
                      → ROLLBACK if confirmed critical
                      → Otherwise gather info (15 min max)
```

### Immediate Rollback Procedure

**When**: Site down, security issue, critical failure  
**Time**: 10-15 minutes  
**Risk**: Medium (affects live users, but necessary)

```bash
# 1. Declare incident (if not already done)
#    Notify team in #incidents Slack channel
#    "Production issue: [brief description]"
#    "Initiating rollback to [previous version]"

# 2. Identify rollback target
git log --oneline production -5

# 3. Reset production branch
git checkout production
git reset --hard <previous-good-commit-hash>

# 4. Force push to production remote
#    This triggers GitHub Pages deployment
git push production production:production --force

# 5. Monitor deployment (2-3 minutes)
#    Check GitHub Actions for deployment status
#    Watch monitoring dashboards if available

# 6. Verify production is working
bun run validate:deployment post production https://peterwarnock.com

# 7. Post-rollback communication
#    Message in #incidents: "Rollback complete. Verifying..."
#    After verification: "Production restored to [commit hash]"

# 8. Schedule post-mortem
#    Create investigation issue for what went wrong
#    Prevent recurrence with additional tests/checks
```

### Example: Production Rollback

```bash
# Issue: Homepage shows 500 error
# Time: 2:15 PM

# 1. Notify team
# → Slack #incidents: "Production down - rolling back"

# 2. Check recent production commits
git log --oneline production -5
# a1b2c3d fix: update analytics tracking ← Likely culprit
# d4e5f6g feat: add new section
# g7h8i9j feat: deployment improvements
# j0k1l2m docs: cleanup architecture ← Last known good

# 3. Reset to last known good
git checkout production
git reset --hard j0k1l2m

# 4. Force push to trigger deployment
git push production production:production --force

# 5. Monitor GitHub Actions
#    (Should take 2-3 minutes)

# 6. Verify site is up
curl -I https://peterwarnock.com
# Should see 200 OK

# 7. Update team
# → Slack: "Site restored. Investigating root cause."

# 8. Create issue for investigation
# → Issue: "Production incident: Analytics tracking caused 500 errors"
#   Include: commit hash, timestamp, impact duration
```

### Staged Rollback (Alternative to Immediate)

Use this if you have time (5-10 minutes) to think clearly:

```bash
# 1. Verify the issue exists
curl https://peterwarnock.com
# Confirm what's broken

# 2. Review what changed in recent commits
git log --oneline production -10
git diff <previous-commit> HEAD

# 3. If a specific commit is the problem, revert just that commit
git checkout production
git revert <problematic-commit-hash>

# 4. Push the revert
git push production production:production

# 5. Verify
bun run validate:deployment post production https://peterwarnock.com
```

**Advantage**: Creates documentation of what caused the issue  
**Trade-off**: Takes slightly longer but adds clarity

---

## Post-Rollback Procedures

### Immediate Actions (Right After Rollback)

1. **Verify service is healthy**
   ```bash
   # Check homepage loads
   curl -I https://peterwarnock.com
   
   # Validate build artifacts
   bun run validate:deployment post production https://peterwarnock.com
   
   # Spot check key pages
   # - Homepage: https://peterwarnock.com/
   # - Blog: https://peterwarnock.com/blog/
   # - About: https://peterwarnock.com/about/
   # - Portfolio: https://peterwarnock.com/portfolio/
   ```

2. **Monitor for issues**
   - Watch server logs for errors (if available)
   - Check analytics to confirm traffic resuming
   - Review user feedback (if available)

3. **Communicate with team**
   ```
   ✅ Production rollback complete
   
   Rolled back to: [commit hash]
   Previous version: [what changed]
   
   Status: All systems operational
   Performance: [normal/degraded/excellent]
   Next steps: [investigation/hotfix/monitoring]
   ```

4. **Create investigation issue**
   ```
   Issue: Production Incident - [brief title]
   
   Timeline:
   - HH:MM - Issue detected: [symptoms]
   - HH:MM - Rollback initiated to [hash]
   - HH:MM - Service restored
   
   Root cause analysis:
   - Changed: [what changed]
   - Why it broke: [technical reason]
   - Why it wasn't caught: [testing gap]
   
   Prevention:
   - Add test: [test to prevent recurrence]
   - Update procedure: [procedure improvement]
   - Documentation: [docs to update]
   ```

### Within 24 Hours

1. **Complete root cause analysis**
   - Identify exactly what caused the issue
   - Document in investigation issue
   - Assign team members to follow-up items

2. **Determine if hotfix is needed**
   - If the issue is critical: Create hotfix branch, test thoroughly, deploy
   - If the issue is optional: Schedule for next release

3. **Implement prevention**
   - Add test that would have caught the issue
   - Update CI/CD checks if needed
   - Document the scenario in testing guide

4. **Close the incident**
   - Summarize findings
   - Thank team for quick response
   - Schedule post-mortem if major incident

---

## Monitoring During/After Rollback

### Health Checks

Run these commands to verify rollback was successful:

```bash
# 1. Homepage accessible
curl -s https://peterwarnock.com/ | grep -q "<!DOCTYPE" && echo "✅ Homepage loads"

# 2. CSS/JS loaded
curl -s https://peterwarnock.com/ | grep -q ".css\|.js" && echo "✅ Assets loaded"

# 3. No server errors
curl -s -I https://peterwarnock.com/ | grep -q "^HTTP.*200" && echo "✅ HTTP 200 OK"

# 4. Blog accessible
curl -s -I https://peterwarnock.com/blog/ | grep -q "^HTTP.*200" && echo "✅ Blog loads"

# 5. Analytics event tracked (if applicable)
# Check Google Analytics for incoming traffic
```

Or use the validation script:
```bash
bun run validate:deployment post production https://peterwarnock.com
```

### What to Watch

| Metric | Normal | Warning | Alert |
|--------|--------|---------|-------|
| **Page Load Time** | <3s | 3-5s | >5s |
| **Error Rate** | <0.1% | 0.1-1% | >1% |
| **Traffic** | Baseline | ±20% | Unusual drop |
| **CPU/Memory** | <50% | 50-80% | >80% |

---

## Communication Template

### Announcement (During Rollback)

```
🚨 Production Issue & Rollback

Timeline:
- HH:MM AM - Issue detected
- HH:MM AM - Rollback initiated
- HH:MM AM - Service restored

Impact:
- Duration: ~5 minutes
- Affected: [homepage / blog / specific feature]
- Severity: [Critical / High / Medium]

Status: ✅ RESOLVED - Service restored and verified

Next: Root cause analysis underway. More details to follow.
```

### Follow-up (After Investigation)

```
✅ Incident Resolved - Root Cause Found

Root Cause: [Technical explanation]
- What changed: [Specific commit]
- Why it broke: [Technical reason]
- Why tests missed it: [Testing gap]

Prevention: [What we're doing to prevent recurrence]
- Adding test: [Specific test]
- Monitoring: [New monitoring]
- Documentation: [Updated guidance]

Timeline:
- HH:MM AM - Issue detected (duration: 5 min)
- HH:MM AM - Rollback to previous version
- HH:MM PM - Root cause identified
- [Date] - Prevention measures implemented

Thank you for your patience!
```

---

## Prevention Strategies

### Test Coverage

Add these test types to catch issues before production:

1. **Integration tests** - Deployment workflow validation
   ```bash
   bun run test:deployment
   ```

2. **E2E tests** - Critical user journeys
   ```bash
   bunx playwright test
   ```

3. **Visual regression** - Design changes
   ```bash
   bun run test:visual
   ```

4. **Performance monitoring** - Speed degradation
   ```bash
   bun run perf:analyze
   ```

5. **Security scanning** - Dependency vulnerabilities
   ```bash
   npm audit
   ```

### Pre-deployment Checklist

Before any production deployment:

```bash
# 1. All tests passing
bun run test:deployment
bun run test:e2e
bun run test:visual

# 2. Build successful
bun run build:production

# 3. No security issues
npm audit --omit=dev

# 4. Configuration correct
cat config/production/hugo.toml | grep baseURL
cat config/production/hugo.toml | grep googleAnalytics

# 5. Documentation updated
grep -r "version 0.X.Y" docs/

# 6. Team approval
# Create PR, get 2 code reviews

# 7. Staging verified
# Deploy to staging, team tests

# 8. Ready for production
git push production production:production
```

### Build Safeguards

1. **Pre-commit hooks** - Catch errors before push
   ```bash
   # Automatic linting, testing, validation
   git commit -m "..."
   ```

2. **Branch protection** - Require reviews for main/staging/production
   ```bash
   # GitHub Settings → Branches → Branch protection rules
   ```

3. **CI/CD checks** - Automated testing on every push
   ```yaml
   # .github/workflows/test.yml
   ```

4. **Environment-specific validation**
   ```bash
   # Before staging deploy
   ./scripts/validate-deployment.sh pre staging
   
   # Before production deploy
   ./scripts/validate-deployment.sh pre production
   ```

---

## Rollback Checklists

### Quick Reference: Staging Rollback

```
☐ Identify the problematic commit
☐ git checkout staging
☐ git reset --hard <previous-good-commit>
☐ git push staging staging:staging --force
☐ Wait 2-3 minutes for deployment
☐ bun run validate:deployment post staging
☐ Verify site looks correct
☐ Create investigation issue
```

### Quick Reference: Production Rollback

```
☐ Notify team immediately (#incidents)
☐ git checkout production
☐ git reset --hard <previous-good-commit>
☐ git push production production:production --force
☐ Monitor GitHub Actions (2-3 minutes)
☐ curl -I https://peterwarnock.com (verify 200 OK)
☐ bun run validate:deployment post production https://peterwarnock.com
☐ Spot-check key pages (homepage, blog, portfolio)
☐ Post status update: "Rollback complete, service restored"
☐ Create incident investigation issue
☐ Schedule root cause analysis
```

---

## Emergency Contacts

In case of critical production issues:

- **On-call engineer**: [Determined by team rotation]
- **Team lead**: [Contact information]
- **Escalation**: [Higher management if needed]

---

## See Also

- [ENVIRONMENT_SETTINGS.md](/docs/operations/ENVIRONMENT_SETTINGS.md) - Permissions and branch protection
- [DEPLOYMENT_TESTING.md](/docs/operations/DEPLOYMENT_TESTING.md) - Testing procedures
- [INFRASTRUCTURE_PROMOTION_WORKFLOW.md](/docs/operations/INFRASTRUCTURE_PROMOTION_WORKFLOW.md) - Normal deployment flow
- [README.md](/docs/README.md) - Documentation index
