# Testing Gaps Analysis & Improvement Plan

**Date**: November 17, 2025  
**Status**: Gap analysis complete, ready for implementation  
**Priority**: High - Foundation gaps in testing pyramid

---

## Executive Summary

Current testing infrastructure covers **60-70% of ideal coverage**. Core gaps are:
1. **TypeScript/component unit tests** (HIGH) - Foundation layer missing
2. **Bundle size regression gates** (HIGH) - Performance protection missing
3. **Load/stress testing** (MEDIUM) - Capacity unknown
4. **SEO/metadata validation** (MEDIUM) - Site health checks missing
5. **Content validation** (LOW) - Link checker, alt text audit

---

## Current State Assessment

### ✅ What We Have (Solid)

| Layer | Coverage | Status |
|-------|----------|--------|
| **Unit Tests** (Go) | 4.5% | ✅ Foundation exists |
| **BDD Integration** | 9/9 scenarios | ✅ Behavioral coverage |
| **E2E Journeys** | Multi-path | ✅ User workflows |
| **Visual Regression** | Full page snapshots | ✅ Design validation |
| **Performance** | Core Web Vitals + bundle | ✅ Metrics collected |
| **Accessibility** | Axe rules enforcement | ✅ WCAG compliance |
| **Security** | Dependency scanning | ✅ Vulnerability check |
| **Analytics** | GA4 tracking verify | ✅ Event validation |

### ❌ Critical Gaps

#### 1. TypeScript Component Unit Tests
**Problem**: Components tested only via E2E and visual regression  
**Impact**: Can't catch component logic bugs until full integration  
**Solution**: Add Jest/Vitest unit tests for TypeScript components

**Current**: No component units  
**Target**: 70%+ coverage of test/support/ utilities + components  
**Effort**: 3-5 days  
**Tools**: Jest or Vitest (lightweight, fast)

#### 2. Bundle Size Regression Gates
**Problem**: Performance.spec.ts tracks sizes but CI doesn't block large increases  
**Impact**: Can accidentally ship 100KB+ bundle increases  
**Solution**: Add CI gate that fails PR if bundle grows >5% month-over-month

**Current**: Metrics collected, no enforcement  
**Target**: CI blocks PRs with bundle increases > threshold  
**Effort**: 1-2 days  
**Tools**: Playwright (already have), CI script

#### 3. Load/Stress Testing
**Problem**: No concurrent request testing, unknown capacity limits  
**Impact**: Can't tell if site handles HN front page or traffic spike  
**Solution**: Add load test scenarios (100, 500, 1000 concurrent users)

**Current**: None  
**Target**: Know site can handle 1000 concurrent requests  
**Effort**: 2-3 days  
**Tools**: k6 (lightweight) or Artillery

#### 4. SEO/Metadata Validation
**Problem**: No verification of meta tags, structured data, sitemap  
**Impact**: SEO issues silently break on deploy  
**Solution**: Add test to verify Open Graph, canonical, JSON-LD, sitemap

**Current**: None  
**Target**: All pages have proper meta tags, structured data valid  
**Effort**: 1-2 days  
**Tools**: Playwright + schema.org validator

#### 5. Content Validation
**Problem**: No link checker, alt text audit, stale content detection  
**Impact**: Broken links stay in production, accessibility regressions  
**Solution**: Add content validator for links, alt text, outdated content

**Current**: Accessibility tests have some coverage  
**Target**: Zero broken internal links, all images have alt text  
**Effort**: 1-2 days  
**Tools**: Playwright + custom validation

---

## Testing Pyramid Assessment

```
Current vs Ideal

         IDEAL                    CURRENT
    ┌─────────────┐          ┌─────────────┐
    │   E2E (5%)  │          │   E2E (5%)  │  ✅
    ├─────────────┤          ├─────────────┤
    │  Service/   │          │  Service/   │  ⚠️ Minimal
    │ Integration │          │ Integration │
    │   (15%)     │          │   (10%)     │
    ├─────────────┤          ├─────────────┤
    │   Unit      │          │   Unit      │
    │ (80%)       │          │ (5%)        │  ❌ MISSING
    └─────────────┘          └─────────────┘
```

**Gap**: Unit layer should be 80%, currently 5%

---

## Implementation Plan

### Phase 1: Foundation (Unit Testing) - WEEK 1
**Priority**: HIGH  
**Effort**: 3-5 days  
**Blocker for**: Phases 2-5

**Tasks**:
- [ ] Choose test framework (Jest or Vitest)
- [ ] Configure with TypeScript support
- [ ] Set up test/support/ utilities unit tests
- [ ] Add component unit tests (start with 5 critical components)
- [ ] Integrate into CI pipeline
- [ ] Target 50%+ coverage by end of phase

**Success Criteria**:
- Jest/Vitest running in CI
- test/support/ utilities have unit tests
- 5 critical components tested
- Coverage >30%

### Phase 2: Performance Protection - WEEK 1
**Priority**: HIGH  
**Effort**: 1-2 days  
**Dependencies**: Phase 1 optional (can do parallel)

**Tasks**:
- [ ] Update performance.spec.ts to baseline bundle size
- [ ] Create CI script to compare against baseline
- [ ] Fail PR if bundle >5% month-over-month increase
- [ ] Document threshold policy (when to bump baseline)
- [ ] Add to pre-commit hook

**Success Criteria**:
- CI blocks large bundle increases
- Developers aware of bundle impact
- Threshold documented and agreed

### Phase 3: Load Testing - WEEK 2
**Priority**: MEDIUM  
**Effort**: 2-3 days  
**Dependencies**: None

**Tasks**:
- [ ] Choose tool (k6 for simplicity)
- [ ] Create load test scenarios (100, 500, 1000 users)
- [ ] Test key pages (/homepage, /portfolio, /tools)
- [ ] Document baseline response times
- [ ] Add to CI as optional (report-only, don't block)

**Success Criteria**:
- Can handle 500 concurrent users
- Response times <2s at P95
- Load test results reported in CI

### Phase 4: SEO/Metadata - WEEK 2
**Priority**: MEDIUM  
**Effort**: 1-2 days  
**Dependencies**: None

**Tasks**:
- [ ] Add test for Open Graph tags
- [ ] Verify canonical URLs
- [ ] Validate JSON-LD structured data
- [ ] Check sitemap completeness
- [ ] Verify robots.txt and meta robots

**Success Criteria**:
- All pages have proper meta tags
- Structured data validates against schema.org
- Sitemap includes all public pages

### Phase 5: Content Validation - WEEK 3
**Priority**: LOW  
**Effort**: 1-2 days  
**Dependencies**: None

**Tasks**:
- [ ] Add internal link checker
- [ ] Audit all images for alt text
- [ ] Check for stale content (date-based)
- [ ] Validate image optimization
- [ ] Report broken links in CI

**Success Criteria**:
- Zero broken internal links
- All images have meaningful alt text
- Content freshness tracked

---

## Beads Issues (To Create)

### Epic
- **testing-coverage-improvement** - Comprehensive testing gaps closure

### Parent Tasks
- **phase-1-unit-testing** (HIGH, P1) - Jest/Vitest + component tests
- **phase-2-bundle-protection** (HIGH, P1) - CI gates for bundle size
- **phase-3-load-testing** (MEDIUM, P2) - k6 load scenarios
- **phase-4-seo-validation** (MEDIUM, P2) - Meta tags + structured data
- **phase-5-content-validation** (LOW, P3) - Link checker + alt text audit

### Detailed Tasks
Under each phase, sub-tasks for:
- Spike/evaluation
- Implementation
- CI integration
- Documentation
- Testing

---

## Effort Estimate

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 1 (Unit Tests) | 3-5 days | 2-3 dev-days | HIGH |
| Phase 2 (Bundle Protection) | 1-2 days | 0.5-1 dev-day | HIGH |
| Phase 3 (Load Testing) | 2-3 days | 1-2 dev-days | MEDIUM |
| Phase 4 (SEO) | 1-2 days | 0.5-1 dev-day | MEDIUM |
| Phase 5 (Content) | 1-2 days | 0.5-1 dev-day | LOW |
| **TOTAL** | **2-3 weeks** | **5-8 dev-days** | |

---

## Resource Requirements

### Development
- 1 developer for 2-3 weeks (or split across team)
- Test infrastructure knowledge (Playwright, Jest, k6)

### Tooling
- **Jest** ($0) - Unit testing
- **k6** ($0) - Load testing
- **Existing**: Playwright, CI/CD already in place

### CI/CD Changes
- Add Jest run step
- Add bundle size comparison script
- Add k6 load test step (optional report-only)
- ~2 hours configuration

---

## Risk Assessment

### Low Risk
- **Unit testing**: Standard practice, well-documented
- **Bundle gates**: Add gate, fine-tune thresholds
- **SEO tests**: Straightforward assertions

### Medium Risk
- **Load testing**: Need baseline, might uncover infrastructure issues
- **Content validation**: New tooling, potential false positives

### Mitigation
- Phase 1-2 (high priority) proven technologies
- Phase 3+ (medium priority) run report-only until stable
- Gradual threshold enforcement (warn before blocking)

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Unit test coverage | 5% | 50%+ | Week 1 |
| Bundle protection | ❌ | ✅ | Week 1 |
| Load test capacity | Unknown | 500 concurrent | Week 2 |
| SEO validation | ❌ | ✅ | Week 2 |
| Content validation | Partial | ✅ | Week 3 |
| **Total test time** | ~5 min | ~15 min | Week 3 |

---

## Implementation Order

### **Week 1: Foundation**
1. Phase 1 (Unit Tests) - Parallel with Phase 2
2. Phase 2 (Bundle Protection) - Parallel with Phase 1

### **Week 2: Observability**
1. Phase 3 (Load Testing)
2. Phase 4 (SEO Validation)

### **Week 3: Content Health**
1. Phase 5 (Content Validation)

---

## References

- Current testing docs: `docs/development/TESTING.md`
- AGENTS.md: Project workflow guidelines
- Beads: Issue tracking and dependencies

---

## Next Actions

1. Create beads epic: `testing-coverage-improvement`
2. Create phase tasks (5 beads issues)
3. Schedule sprint/allocation
4. Assign owners for each phase
5. Start Phase 1 spike: Evaluate Jest vs Vitest

---

**Status**: ✅ Ready to backlog

All gaps identified, priorities set, effort estimated.  
Ready for team review and resource allocation.
