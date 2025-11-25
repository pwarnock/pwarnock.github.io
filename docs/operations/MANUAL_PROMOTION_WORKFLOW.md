# Manual Promotion Workflow

**Status**: ✅ **IMPLEMENTED** - Safe infrastructure deployment pipeline  
**Updated**: November 25, 2025  
**Issue**: [pw-bua](https://github.com/pwarnock/pwarnock.github.io/issues/pw-bua)  
**Related**:
[Release Workflow](./RELEASE_WORKFLOW.md) |
[Self-Enforcing Release Process](../architecture/SELF_ENFORCING_RELEASE_PROCESS.md)

---

## 🎯 **Implementation Summary**

The **Manual Promotion Workflow** provides a **safe, controlled deployment
pipeline** with manual approval gates between environments. This ensures that
infrastructure changes are properly tested and validated before reaching
production users.

### Key Features Implemented

1. **Three-Stage Release Process** - Development → Staging → Production
2. **Manual Approval Gates** - Human verification at each stage
3. **Automated Testing** - Comprehensive test suites run automatically
4. **Rollback Capabilities** - Quick recovery if issues are detected
5. **Audit Trail** - Complete visibility into deployment decisions

---

## 📋 **Workflow Overview**

### Stage 1: Development → Staging (RC Release)

**Purpose**: Test infrastructure changes in isolated environment

```bash
# Create release candidate for testing
./scripts/release.sh rc --description "Infrastructure changes for v0.15.0"

# Deploy to staging environment
bun run deploy:staging
```

**Validation Steps**:

- ✅ **Automated Tests**: E2E, accessibility, performance
- ✅ **Infrastructure Validation**: Build process, configuration
- ✅ **Manual Review**: Visual inspection, functionality testing
- ✅ **Performance Check**: Load testing, bundle size validation

### Stage 2: Staging → Production (Manual Promotion)

**Purpose**: Manual approval before production deployment

```bash
# After staging validation, promote to production
./scripts/release.sh final --description "Validated infrastructure changes" --bead pw-bua

# Deploy to production
bun run deploy:production
```

**Approval Gates**:

- ✅ **Staging Tests Pass**: All automated tests successful
- ✅ **Manual QA**: Human verification of key functionality
- ✅ **Performance Acceptable**: Load times within thresholds
- ✅ **Security Scan**: No vulnerabilities detected
- ✅ **Feature Flags Ready**: New features properly flagged

### Stage 3: Production Monitoring

**Purpose**: Post-deployment validation and monitoring

```bash
# Monitor production health
bun run test:e2e --project=production
bun run test:accessibility --project=production

# Check analytics and performance
bun run monitor:production
```

**Monitoring Checklist**:

- ✅ **Health Checks**: All endpoints responding correctly
- ✅ **Error Rates**: No increase in 5xx errors
- ✅ **Performance**: Page load times < 3 seconds
- ✅ **Analytics**: Events firing correctly
- ✅ **User Feedback**: No reported issues

---

## 🔧 **Implementation Components**

### 1. Release Script (`scripts/release.sh`)

**Features**:

- **Declarative Release Requests**: JSON-based release intent
- **Branch Validation**: Ensures releases from correct branches
- **Version Management**: Automatic semantic versioning
- **Git Integration**: Creates tags and updates version files

**Usage Examples**:

```bash
# Create RC for testing
./scripts/release.sh rc --description "Infrastructure validation"

# Promote to production
./scripts/release.sh final --bead pw-bua --description "Validated changes"

# Emergency hotfix
./scripts/release.sh hotfix --description "Critical security patch"
```

### 2. Environment Configuration

**Staging Environment**:

- **URL**: `staging.peterwarnock.com` (or branch-based)
- **Purpose**: Pre-production testing
- **Features**: Full feature set, test data
- **Monitoring**: Comprehensive test coverage

**Production Environment**:

- **URL**: `peterwarnock.com`
- **Purpose**: Live user traffic
- **Features**: Stable features only
- **Monitoring**: Real user metrics

### 3. Automated Testing Pipeline

**Pre-Deployment Tests**:

```bash
# Run before staging deployment
bun run test:e2e              # End-to-end functionality
bun run test:accessibility     # WCAG compliance
bun run test:performance      # Load times, bundle size
bun run test:security         # Vulnerability scanning
```

**Post-Deployment Tests**:

```bash
# Run after production deployment
bun run test:smoke            # Critical path validation
bun run test:analytics        # Event tracking verification
bun run monitor:health        # System health checks
```

---

## 🚀 **Deployment Commands**

### Development Workflow

```bash
# 1. Complete development work
git add . && git commit -m "Infrastructure changes"

# 2. Create release candidate
./scripts/release.sh rc --description "Infrastructure improvements"

# 3. Deploy to staging for testing
bun run deploy:staging

# 4. Run comprehensive tests
bun run test:e2e
bun run test:accessibility
bun run test:performance

# 5. Manual QA in staging environment
# (Visit staging URL, verify functionality)

# 6. Promote to production
./scripts/release.sh final --description "Validated infrastructure" --bead pw-bua

# 7. Deploy to production
bun run deploy:production

# 8. Post-deployment monitoring
bun run test:smoke
bun run monitor:health
```

### Emergency Procedures

```bash
# Emergency rollback (if issues detected)
git revert <release-commit>
./scripts/release.sh hotfix --description "Rollback critical issue"

# Quick fix deployment
./scripts/release.sh hotfix --description "Emergency patch"
bun run deploy:production
```

---

## 📊 **Validation Checkpoints**

### Pre-Staging Validation

- [ ] **Code Quality**: All linting and formatting checks pass
- [ ] **Unit Tests**: 100% test coverage maintained
- [ ] **Build Success**: Hugo build completes without errors
- [ ] **Bundle Size**: Within acceptable thresholds
- [ ] **Security Scan**: No new vulnerabilities

### Staging Validation

- [ ] **E2E Tests**: All user journeys working correctly
- [ ] **Accessibility**: WCAG 2.1 AA compliance maintained
- [ ] **Performance**: Page load times < 3 seconds
- [ ] **Mobile Responsive**: All devices display correctly
- [ ] **Feature Flags**: New features properly controlled

### Production Validation

- [ ] **Health Checks**: All endpoints responding correctly
- [ ] **Error Rates**: No increase in server errors
- [ ] **Analytics**: Events tracking properly
- [ ] **User Experience**: No reported issues
- [ ] **Performance**: Metrics within acceptable ranges

---

## 🔍 **Monitoring and Alerting**

### Real-Time Monitoring

**Health Endpoints**:

```bash
# Check system health
curl https://peterwarnock.com/health

# Check build status
curl https://peterwarnock.com/build-info

# Check feature flags
curl https://peterwarnock.com/flags
```

**Performance Metrics**:

- **Page Load Time**: < 3 seconds (target)
- **Time to Interactive**: < 5 seconds (target)
- **Bundle Size**: < 1MB compressed (target)
- **Error Rate**: < 1% (target)

### Alert Configuration

**Critical Alerts**:

- Site downtime or 5xx errors
- Performance degradation > 50%
- Security vulnerabilities detected
- Failed deployments

**Warning Alerts**:

- Performance degradation > 20%
- Bundle size increase > 10%
- Test failures in staging
- Feature flag issues

---

## 🛡️ **Safety Mechanisms**

### Feature Flag Protection

**Gradual Rollout**:

```toml
# Start with 10% of users
[flags.new_infrastructure]
enabled = true
rollout_percentage = 10

# Monitor for 1 hour, then increase
[flags.new_infrastructure]
enabled = true
rollout_percentage = 50

# Full rollout after validation
[flags.new_infrastructure]
enabled = true
rollout_percentage = 100
```

### Rollback Procedures

**Immediate Rollback**:

```bash
# Disable feature flag
# Edit data/feature-flags.toml
[flags.new_infrastructure]
enabled = false

# Deploy flag change
bun run deploy:production
```

**Full Version Rollback**:

```bash
# Revert to previous version
git revert <release-commit>
./scripts/release.sh hotfix --description "Emergency rollback"
bun run deploy:production
```

---

## 📈 **Success Metrics**

### Deployment Quality

- **Zero Downtime**: All deployments seamless to users
- **Fast Rollback**: < 5 minutes to revert if needed
- **High Test Coverage**: > 90% automated test coverage
- **Low Error Rate**: < 1% post-deployment issues

### Developer Experience

- **Clear Process**: Well-documented, predictable workflow
- **Fast Feedback**: Quick validation and testing cycles
- **Safe Deployments**: Multiple safety nets and rollback options
- **Audit Trail**: Complete visibility into deployment history

---

## 🔗 **Related Documentation**

### Core Documentation

- **[Release Workflow](./RELEASE_WORKFLOW.md)** - Complete release process
- **[Self-Enforcing Release Process](../architecture/SELF_ENFORCING_RELEASE_PROCESS.md)** -
  Architecture details
- **[Deployment Notes](./DEPLOYMENT_NOTES.md)** - Technical deployment
  procedures
- **[Rollback Procedures](./ROLLBACK_PROCEDURES.md)** - Emergency recovery

### Testing Documentation

- **[Testing Workflow](../development/TESTING_WORKFLOW.md)** - E2E testing
  patterns
- **[Accessibility Testing](../development/ACCESSIBILITY.md)** - WCAG compliance
- **[Performance Testing](../development/PERFORMANCE.md)** - Load testing
  procedures

### Monitoring Documentation

- **[Environment Configuration](./ENVIRONMENT_CONFIG.md)** - Environment
  settings
- **[Feature Flags](../development/FEATURE_FLAGS.md)** - Feature flag management
- **[Analytics Integration](../development/ANALYTICS.md)** - Event tracking

---

## ✅ **Completion Status**

**Issue**:
[pw-bua](https://github.com/pwarnock/pwarnock.github.io/issues/pw-bua) -
**COMPLETED**

### Deliverables Completed

1. ✅ **Manual Promotion Workflow** - Three-stage deployment process
2. ✅ **Release Script Integration** - Declarative release requests
3. ✅ **Environment Configuration** - Staging and production setup
4. ✅ **Automated Testing Pipeline** - Comprehensive validation at each stage
5. ✅ **Safety Mechanisms** - Feature flags, rollback procedures, monitoring

### Integration Points

- ✅ **Release Workflow** - Integrated with existing release process
- ✅ **GitHub Actions** - Automated CI/CD pipeline integration
- ✅ **Feature Flags** - Safe gradual rollout capabilities
- ✅ **Monitoring** - Real-time health and performance tracking

### Next Steps

1. **Monitor adoption** - Track deployment success rates and issues
2. **Refine process** - Optimize based on team feedback
3. **Expand automation** - Add more automated validation where appropriate
4. **Document learnings** - Capture best practices and improvements

---

## 🎉 **Conclusion**

The **Manual Promotion Workflow** is now **fully implemented** and provides a
**safe, controlled deployment pipeline** for infrastructure changes. This
ensures that:

- **All changes are tested** before reaching production users
- **Manual approval gates** prevent accidental deployments
- **Rollback capabilities** provide quick recovery from issues
- **Complete audit trail** gives visibility into all deployment decisions
- **Feature flags** enable safe gradual rollouts

This implementation establishes a **professional, enterprise-grade deployment
process** that balances safety with velocity, ensuring reliable infrastructure
updates while maintaining development productivity.

**Status**: ✅ **COMPLETE** - Ready for production use
