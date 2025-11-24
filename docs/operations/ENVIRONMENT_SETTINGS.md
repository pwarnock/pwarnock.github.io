# Environment-Specific Settings and Permissions

This guide documents environment-specific configuration, permissions, and security settings for development, staging, and production environments.

## Overview

Each environment has distinct requirements for:
- **Hugo configuration** - baseURL, analytics, feature flags
- **Git permissions** - branch protection, force push restrictions
- **Deployment permissions** - who can deploy to each environment
- **Analytics tracking** - environment-specific identifiers
- **Secrets management** - API keys, tokens, credentials

## Environment Configurations

### Development Environment

**Purpose**: Local development and testing

**Hugo Configuration** (`config/development/hugo.toml`):
```toml
baseURL = "http://localhost:1313"

[params]
  googleAnalytics = ""      # Analytics disabled
  env = "development"
```

**Key Settings**:
- ✅ Analytics disabled
- ✅ All features available for testing
- ✅ Drafts and future content visible
- ✅ Full debug output

**Permissions**:
- Any developer can deploy locally
- No external access required
- Local .env files not committed to git

### Staging Environment

**Purpose**: Pre-production testing and validation

**Hugo Configuration** (`config/staging/hugo.toml`):
```toml
baseURL = "https://staging.pwarnock.github.io"

[params]
  env = "staging"
  googleAnalytics = ""      # Analytics disabled (or test account)
  showBeta = true
  betaMessage = "This is a staging environment"
```

**Key Settings**:
- ✅ Analytics disabled or set to test account
- ✅ Beta banner shown to testers
- ✅ Database isolated from production
- ✅ CDN can be different from production
- ✅ Credentials for staging-only services
- ❌ Production API keys not used
- ❌ Production database not accessed

**Permissions**:
- Branch protection: Restrict force pushes
- Require PR reviews before merging
- Deploy only after status checks pass
- Limited manual testing team access
- GitHub Pages deployment triggered by push to staging branch

**Staging Branch Rules** (`.github/BRANCH_PROTECTION.md`):
```
- Enforce PR reviews: 1 approval required
- Dismiss stale PR approvals: enabled
- Require status checks before merge: enabled
- Require branches to be up to date before merge: enabled
- Include administrators: yes
- Restrict who can push to branch: deployment team only
- Restrict who can dismiss pull request reviews: admins only
```

### Production Environment

**Purpose**: Live site for public access

**Hugo Configuration** (`config/production/hugo.toml`):
```toml
baseURL = "https://peterwarnock.com"

[params]
  googleAnalytics = "G-SKDDM2GBXN"  # Production analytics
  env = "production"
```

**Key Settings**:
- ✅ Analytics enabled with production tracking ID
- ✅ All monitoring and alerting active
- ✅ CDN configured and optimized
- ✅ Security headers enabled
- ✅ Rate limiting active
- ✅ Regular backups enabled
- ❌ Draft content not published
- ❌ Debug output disabled
- ❌ Test data not present

**Permissions** (Strictest):
- Branch protection: Require linear history
- Branch protection: Restrict force pushes (admin only, with justification)
- Require PR reviews from code owners
- Require status checks pass before merge
- Deploy only after all reviews and checks pass
- Limited deployment team (ideally 2-3 trusted members)
- Deployment requires explicit confirmation
- Automatic rollback capability

**Production Branch Rules** (`.github/BRANCH_PROTECTION.md`):
```
- Enforce PR reviews: 2+ approvals required
- Dismiss stale PR approvals: enabled
- Require status checks before merge: enabled
- Require branches to be up to date before merge: enabled (strict)
- Require linear history: enabled
- Include administrators: yes
- Restrict who can push to branch: deployment team only (1-2 people)
- Restrict who can dismiss pull request reviews: admins only
- Auto-delete head branches: enabled (cleanup)
```

## Secrets and Environment Variables

### Development Secrets
Store locally in `.env` (not committed):
```bash
# Local development (never commit)
HUGO_ENV=development
LOCAL_DEV_PORT=1313
```

### Staging Secrets
Configured in GitHub repository settings → Environments → staging:
```
STAGING_GA_ID=           # Empty or test GA ID
STAGING_API_ENDPOINT=    # If applicable
STAGING_DEPLOY_KEY=      # For automated staging deploys
```

### Production Secrets
Configured in GitHub repository settings → Environments → production:
```
PROD_GA_ID=G-SKDDM2GBXN  # Production Google Analytics
PROD_API_ENDPOINT=       # If applicable
PROD_DEPLOY_KEY=         # For automated production deploys
MONITORING_WEBHOOK=      # For deployment notifications
```

## Git Branch Protection

### Branch Protection Configuration

Use GitHub Settings → Branches to configure:

| Setting | Development | Staging | Production |
|---------|-------------|---------|-----------|
| **Require PR reviews** | No | Yes (1) | Yes (2) |
| **Require status checks** | No | Yes | Yes |
| **Require branches up to date** | No | Yes | Yes (strict) |
| **Require linear history** | No | No | Yes |
| **Allow force pushes** | Yes | No | Admin only |
| **Allow deletions** | Yes | No | No |
| **Auto-delete branches** | No | Yes | Yes |
| **Require code owner review** | No | No | Yes |

### Enforcing Permissions

All environment branches should have:
```bash
# Main branch (development)
- Require at least 1 review
- Require status checks to pass

# Staging branch
- Require at least 1 review
- Require all status checks to pass
- Dismiss stale reviews
- Restrict force pushes to admins

# Production branch
- Require at least 2 reviews (including code owners)
- Require all status checks to pass
- Require linear history
- Restrict force pushes to admins (with log)
- Restrict deletions to admins
```

## Deployment Authorization

### Who Can Deploy Where

**Development** (Local):
- ✅ Any developer

**Staging**:
- ✅ Developers (via PR to staging branch)
- ✅ CI/CD pipeline (automated on PR merge)
- ✅ Code review required (minimum 1 approval)

**Production**:
- ✅ Designated release manager or team lead
- ✅ CI/CD pipeline (automated on PR merge after checks)
- ✅ Code review required (minimum 2 approvals)
- ⚠️ Explicit confirmation prompt before push
- ⚠️ Deployment notifications sent to team

### Deployment Workflow

```
Local Development
    ↓
  commit
    ↓
  git push origin feature-branch
    ↓
  Create Pull Request to main
    ↓
  Code review (1+ approval)
    ↓
  Merge to main
    ↓
  GitHub Actions tests (auto-deploy to staging)
    ↓
STAGING (Ready for QA)
    ↓
Manual Testing (QA team)
    ↓
Create Pull Request: staging → production
    ↓
Code review (2+ approvals)
    ↓
Approval to deploy production
    ↓
bun run deploy:production (with confirmation)
    ↓
GitHub Actions deployment
    ↓
PRODUCTION (Live)
```

## Analytics Configuration

### Development
- ✅ Analytics disabled (no tracking)
- Purpose: Avoid polluting analytics data

### Staging
- ✅ Analytics disabled or test account
- Purpose: QA can test tracking without affecting production metrics

### Production
- ✅ Analytics enabled with production ID
- Tracking ID: `G-SKDDM2GBXN`
- Purpose: Monitor user behavior and performance

## Security Headers

Configure security headers per environment:

```
# Staging (less strict, enable features)
X-Frame-Options: ALLOWALL
X-Content-Type-Options: nosniff

# Production (strict)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Environment Variables

### Hugo Environment Variables

```bash
# Development
HUGO_ENV=development

# Staging
HUGO_ENV=staging

# Production
HUGO_ENV=production
```

### Build Configuration Variables

```bash
# Content build (fast)
CONTENT_BUILD=true

# Infrastructure build (comprehensive)
INFRASTRUCTURE_BUILD=true

# Production build (with optimization)
PROD_BUILD=true
```

## Deployment Checklist by Environment

### Before Deploying to Staging
- [ ] All tests passing locally
- [ ] Code review approved (≥1)
- [ ] Branch is up to date with main
- [ ] No security vulnerabilities detected
- [ ] CSS processed correctly
- [ ] Hugo configuration valid for staging

### Before Deploying to Production
- [ ] Staging fully tested by QA team
- [ ] All tests passing in staging
- [ ] Code review approved (≥2)
- [ ] Production configuration verified
- [ ] Analytics tracking confirmed
- [ ] No sensitive data in code
- [ ] Rollback plan documented
- [ ] Team notified of deployment
- [ ] Monitoring and alerting active

## Environment-Specific Features

### Beta Features
Features available only in staging:
- New experimental components
- UI redesigns under testing
- Performance optimizations
- Database schema changes

Enable with config flag:
```toml
[params]
  showBeta = true       # Staging only
  betaMessage = "..."
```

### Debug Mode
Debug output enabled only in development:
- Detailed logging
- Extended error messages
- Performance metrics
- Development-only endpoints

## Access Control Matrix

| Action | Dev | Staging | Production |
|--------|-----|---------|-----------|
| **Deploy** | Any dev | Dev (via PR) | Release manager (2 reviews) |
| **Force push** | Yes | No | Admin only |
| **Delete branch** | Yes | No | No |
| **Merge without review** | Yes | No | No |
| **Direct commit** | Yes | No | No |
| **See analytics** | No | No | Yes (team) |
| **Modify secrets** | No | Admins | Admins only |
| **Emergency rollback** | N/A | Team lead | Team lead (with log) |

## Implementation Scripts

### Validate Environment Configuration
```bash
./scripts/validate-deployment.sh pre staging
./scripts/validate-deployment.sh pre production
```

### Test Environment-Specific Settings
```bash
./scripts/test-environment.sh staging
./scripts/test-environment.sh production
```

### Deploy to Environment
```bash
bun run deploy:staging        # Deploy to staging
bun run deploy:production     # Deploy to production
```

## Monitoring and Alerts

### Staging Alerts
- ⚠️ Build failures
- ⚠️ Failed tests
- ℹ️ Deployment notifications (optional)

### Production Alerts
- 🔴 Build failures (immediate)
- 🔴 Failed tests (immediate)
- 🔴 Site unavailable (immediate)
- 🔴 Performance degradation (within 1 hour)
- 🟡 Analytics not tracking (within 1 hour)
- 🟡 Broken links detected (within 4 hours)

## Emergency Procedures

### Rollback to Previous Version

**Staging**:
```bash
git checkout staging
git reset --hard <previous-commit>
git push staging staging:staging --force
```

**Production**:
```bash
git checkout production
git reset --hard <previous-commit>
git push production production:production --force
# Document the rollback reason in commit message or log
```

### Emergency Production Deployment
Only when:
- Production is down
- Critical security vulnerability
- Data loss risk

```bash
# Bypass validation (carefully)
FORCE_PUSH=yes git push production production:production --no-verify
# Document immediately
```

## See Also

- [INFRASTRUCTURE_PROMOTION_WORKFLOW.md](./INFRASTRUCTURE_PROMOTION_WORKFLOW.md) - Manual promotion through environments
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment procedures
- [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) - Release process and versioning
