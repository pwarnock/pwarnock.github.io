# Implementation Checklist

**Use this to track progress on observability upgrade**

---

## Phase 0: Decision & Planning

### Team Decision
- [ ] Logfire account created (https://logfire.pydantic.dev)
- [ ] Decision made: **Logfire** OR **OTEL+Jaeger**
- [ ] Team trained on chosen approach
- [ ] Budget approved (if using Logfire)
- [ ] Timeline agreed upon

### Spike/POC
- [ ] Sample test instrumented locally
- [ ] First traces appear in live view
- [ ] Team review of approach
- [ ] Go/no-go decision made
- [ ] Phase 1 team assigned

---

## Phase 1: Go Test Framework

### Environment Setup
- [ ] LOGFIRE_TOKEN (or OTEL_EXPORTER_OTLP_ENDPOINT) set
- [ ] .env.local created (git-ignored)
- [ ] CI/CD secret configured

### Dependencies
- [ ] Go OTEL packages added to go.mod
  - [ ] go.opentelemetry.io/otel
  - [ ] go.opentelemetry.io/otel/sdk/trace
  - [ ] go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
  - [ ] go.opentelemetry.io/otel/attribute
- [ ] Dependencies vendor'd if needed
- [ ] go mod tidy run

### Code Changes
- [ ] Create test/support/otel_init.go
- [ ] Update test/support/structured_logger.go
- [ ] Update test/support/test_utils.go (init hook)
- [ ] Add child span creation method
- [ ] Backward compatibility verified (old code still works)

### Testing
- [ ] Local test run with Jaeger/Logfire
- [ ] Traces appear in live view
- [ ] Performance metrics captured
- [ ] Accessibility violations logged as events
- [ ] Error logging works correctly
- [ ] Output still appears in stdout

### Documentation
- [ ] Update test/README.md
- [ ] Add setup instructions for new developers
- [ ] Document environment variables
- [ ] Add troubleshooting guide
- [ ] Code comments added to new files

### Code Review
- [ ] PR created and reviewed
- [ ] Changes approved by team lead
- [ ] No performance regressions
- [ ] Tests still pass
- [ ] CI/CD integration works

### Merge & Deployment
- [ ] Branch merged to main
- [ ] CI/CD tests pass
- [ ] Verify traces in CI logs
- [ ] Team notified of change

---

## Phase 2: TypeScript Tests

### Dependencies
- [ ] Logfire npm package installed
  - [ ] `npm install @pydantic/logfire-node`
  - [ ] OR for Jaeger: OTEL JS packages
- [ ] package.json updated
- [ ] package-lock.json checked in

### Test Setup
- [ ] Create tests/logfire.setup.ts (or OTEL equivalent)
- [ ] Configure initialization
- [ ] Integrate with playwright.config.js
- [ ] Set environment variables

### Code Changes - Accessibility Tests
- [ ] accessibility-critical.spec.ts updated
- [ ] console.log → logfire.warn for violations
- [ ] Span wrapping: logfire.span()
- [ ] Violation details logged as attributes
- [ ] Test structure unchanged (backward compatible)

### Code Changes - Performance Tests
- [ ] performance.spec.ts updated
- [ ] Performance metrics logged via logfire.info
- [ ] Load times captured as attributes
- [ ] Resource counts logged
- [ ] Bundle sizes recorded
- [ ] Caching headers logged

### Code Changes - Other Tests
- [ ] Other spec files reviewed for logging improvements
- [ ] console.log replaced with structured logging
- [ ] Consistent attribute naming across files

### Testing
- [ ] `npm run test:e2e` runs without errors
- [ ] Spans appear in live view (Logfire or Jaeger)
- [ ] Trace IDs visible in test output
- [ ] Can search spans by test name
- [ ] Performance metrics aggregated

### Documentation
- [ ] Update tests/README.md
- [ ] Document logfire.span() usage
- [ ] Add examples for logging patterns
- [ ] Document attribute naming convention
- [ ] Add SQL query examples

### Code Review
- [ ] PR created and reviewed
- [ ] TypeScript types correct
- [ ] No console.log calls remain
- [ ] Span naming is consistent
- [ ] Performance acceptable (< 0.5s overhead)

### Merge & Deployment
- [ ] Branch merged to main
- [ ] CI runs with traces
- [ ] Team can access live view
- [ ] Performance baseline established

---

## Phase 3: Cross-Test Correlation

### Trace ID Propagation
- [ ] Hugo server exposes trace ID endpoint
  - [ ] GET /api/debug/trace-id returns current trace
  - [ ] OR: read from request context
- [ ] TypeScript tests retrieve server trace ID
  - [ ] Before page.goto()
  - [ ] Store for later use
- [ ] Both sides use same trace ID
  - [ ] server_trace_id attribute
  - [ ] client_trace_id attribute
  - [ ] parent_trace_id for relationships

### Implementation
- [ ] Go server (if applicable) logs trace propagation
- [ ] TypeScript tests access and use server trace
- [ ] Test correlation working locally
- [ ] Test correlation working in CI/CD

### Testing
- [ ] Single trace visible for full test run
- [ ] Can see: test → server → browser flow
- [ ] Query: `SELECT * FROM spans WHERE trace_id = ?`
- [ ] Can identify bottlenecks across layers

### Dashboards & Alerting
- [ ] Create Logfire dashboard for test metrics
- [ ] Performance trend chart
- [ ] Failed test indicator
- [ ] Accessibility violation count
- [ ] Alert on performance regression (if using Logfire)
- [ ] Alert on test failures (optional)

### Documentation
- [ ] Documented how to access dashboards
- [ ] Documented how to query test data
- [ ] SQL query examples for common scenarios
- [ ] Performance baseline documented
- [ ] Created runbook for debugging slow tests

### Team Training
- [ ] Demo to all team members
- [ ] Show live view during test run
- [ ] Demonstrate SQL queries
- [ ] Show dashboard
- [ ] Answer questions

---

## CI/CD Integration

### GitHub Actions
- [ ] LOGFIRE_TOKEN secret added
- [ ] OTEL_EXPORTER_OTLP_ENDPOINT set (if Jaeger)
- [ ] Test workflow runs with observability
- [ ] Traces sent from CI/CD
- [ ] Can filter CI runs in Logfire/Jaeger

### Monitoring
- [ ] CI test results correlated with traces
- [ ] Can identify flaky tests via trace data
- [ ] Performance tracked across builds
- [ ] Historical data available

### Maintenance
- [ ] Token rotation scheduled (if using Logfire)
- [ ] Jaeger storage cleanup setup (if self-hosted)
- [ ] Cost monitoring (if using Logfire)
- [ ] Performance monitored for regressions

---

## Post-Implementation

### Knowledge Transfer
- [ ] Team trained on new tools
- [ ] Documentation updated
- [ ] Wiki/docs site reflects new approach
- [ ] Runbooks created for common tasks

### Metrics Baseline
- [ ] Performance metrics established
- [ ] Test duration baseline recorded
- [ ] Accessibility violation baseline recorded
- [ ] Resource usage baseline recorded

### Retrospective
- [ ] Team feedback collected
- [ ] What went well documented
- [ ] What could be improved noted
- [ ] Follow-up items logged as issues

### Optimization (Optional)
- [ ] Identify slowest tests (from trace data)
- [ ] Plan performance improvements
- [ ] Baseline before optimization
- [ ] Measure improvements after changes

---

## Success Criteria

### Phase 1: Go Logger
- [x] OTEL spans appearing in backend
- [x] All existing tests still pass
- [x] stdout output still works (backward compatible)
- [x] Team can view traces locally

### Phase 2: TypeScript Tests
- [x] Logfire/Jaeger receives playwright test traces
- [x] Violation details captured with context
- [x] Performance metrics recorded
- [x] No significant test slowdown (< 1% overhead)

### Phase 3: Correlation & Beyond
- [x] Can trace single request across Go + TS
- [x] Dashboard shows test metrics
- [x] SQL queries work for all common use cases
- [x] Team using live view for debugging

---

## Issues Tracker

### If using bd (beads):
```bash
# Create tracking issues for each phase
bd create "Phase 1: Go OTEL Integration" -t task -p 1
bd create "Phase 2: TypeScript Instrumentation" -t task -p 1 --deps discovered-from:phase-1-id
bd create "Phase 3: Cross-Test Correlation" -t task -p 2 --deps discovered-from:phase-2-id

# Track progress
bd update <id> --status in_progress
bd update <id> --status completed --reason "Done"
```

### If using GitHub Issues:
- Link to PR for each phase
- Use checklist items for tracking
- Reference trace data in discussions

---

## Rollback Plan

### If Logfire becomes problematic:
- [x] Continue sending traces to Logfire OR switch to Jaeger
- [x] OTEL data can be re-exported elsewhere
- [x] No code changes needed (just endpoint configuration)
- [x] Historical data remains accessible

### If performance impacts tests:
- [x] Disable non-critical event logging
- [x] Reduce sampling rate
- [x] Keep only error/warning spans
- [x] Revert to previous StructuredLogger if needed

### If cost becomes high:
- [x] Switch from Logfire to OTEL+Jaeger (free)
- [x] No code changes, just infrastructure change
- [x] All functionality preserved

---

## Timeline Estimate

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Planning | 3-5 days | Mon 11/17 | Fri 11/21 |
| Phase 1 | 2-3 days | Mon 11/24 | Wed 11/26 |
| Phase 2 | 2-3 days | Wed 11/26 | Fri 11/28 |
| Phase 3 | 1-2 days | Mon 12/01 | Tue 12/02 |
| **Total** | **1-2 weeks** | **Mon 11/17** | **Tue 12/02** |

---

## Contact & Questions

- **Technical Questions**: See GO_OTEL_INTEGRATION_GUIDE.md and LOGFIRE_QUICK_START.md
- **Architecture Questions**: See LOGGING_OBSERVABILITY_RESEARCH.md
- **Decision Questions**: See DECISION_MATRIX.md
- **Quick Reference**: See README_OBSERVABILITY.md

---

## Done! 🎉

When all items are checked:
1. Team has modern observability infrastructure
2. Tests produce searchable, correlatable traces
3. Performance trends automatically tracked
4. Debugging time reduced by 50%+
5. Foundation for production monitoring ready

Time to celebrate and use the live view to catch bugs in real-time! 🚀
