# Test Infrastructure Observability

**Status**: Implementation planned (Phase 0: decision pending)  
**Last Updated**: November 17, 2025

---

## Overview

This document covers observability for test infrastructure (logging, tracing, metrics for Go and TypeScript tests).

**Key Goal**: Replace manual log analysis with live tracing, SQL queries, and automatic performance trending.

---

## Decision: Logfire vs OpenTelemetry+Jaeger

### Status
- **Phase 0**: Team decision call pending
- **References**: 
  - `work/DECISION_MATRIX.md` - Visual comparison, scoring, decision framework
  - `work/LOGGING_OBSERVABILITY_RESEARCH.md` - Complete technical analysis
  - `work/00_START_HERE.md` - Navigation guide

### Recommendation
**Primary**: Logfire (1-hour setup, live tracing, SQL queries, free tier)  
**Alternative**: OpenTelemetry + Jaeger (free, self-hosted, full data control)

### Key Metrics
| Aspect | Logfire | OTEL+Jaeger |
|--------|---------|------------|
| Setup time | 1 hour | 2-3 hours |
| Cost | $0-29/month | $0 |
| Live tracing | ✅ Yes | ✅ Yes |
| SQL queries | ✅ Yes | ❌ No |
| Self-hosted | ❌ Cloud | ✅ Yes |
| Ease of use | 5/5 | 3/5 |

---

## Implementation Plan

### Timeline
- **Week of 11/17**: Phase 0 - Team decision + POC
- **Week of 11/24**: Phase 1 - Go test integration
- **Week of 11/26**: Phase 2 - TypeScript instrumentation
- **Week of 12/01**: Phase 3 - Cross-test correlation

### Phase Breakdown

#### Phase 0: Decision & POC
- Create Logfire account and test signup
- Run quick POC with one test file
- Team reviews and votes
- See: `work/LOGFIRE_QUICK_START.md` for 30-minute setup

#### Phase 1: Go OTEL Integration
- Add OpenTelemetry dependencies to `test/support/`
- Update `StructuredLogger` to emit OTEL spans
- Maintain backward compatibility with existing tests
- See: `work/GO_OTEL_INTEGRATION_GUIDE.md` for technical details

#### Phase 2: TypeScript Instrumentation
- Install Logfire SDK (`@pydantic/logfire-node`)
- Wrap Playwright tests with `logfire.span()`
- Replace `console.log()` with structured logging
- See: `work/LOGFIRE_QUICK_START.md` for code examples

#### Phase 3: Cross-Test Correlation
- Add trace ID propagation from Hugo server to tests
- Enable tracing across Go → TS → Browser flow
- Create dashboards for performance tracking
- Set up alerts for regressions

---

## Current State

### Go Tests (`test/support/`)
- Custom `StructuredLogger` with manual formatting
- Format: `[TestName] [ISO8601-Timestamp] [LEVEL] message`
- Methods: `Logf()`, `LogError()`, `LogPerformance()`, `LogAccessibility()`
- **Limitations**: No distributed tracing, no querying, no metrics aggregation

### TypeScript Tests (`tests/`)
- Native `console.log()` only
- Test reporter captures output
- **Limitations**: No correlation with Go logs, no centralized aggregation

### Gap
No way to trace a single request across Go tests → Hugo server → Playwright tests.

---

## Reference Documents

All research and implementation guides in `work/` directory:

| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| `DECISION_MATRIX.md` | Visual comparison & decision framework | Team leads | 15 min |
| `LOGFIRE_QUICK_START.md` | 30-minute hands-on setup | Developers | 20 min |
| `GO_OTEL_INTEGRATION_GUIDE.md` | Technical deep dive for Go | Developers | 30 min |
| `LOGGING_OBSERVABILITY_RESEARCH.md` | Complete technical analysis | Architects | 45 min |
| `IMPLEMENTATION_CHECKLIST.md` | Phase-by-phase task tracking | Everyone | Ongoing |
| `00_START_HERE.md` | Navigation guide | Everyone | 5 min |

### How to Use
1. **Decision makers**: Read `DECISION_MATRIX.md` (15 min) + `RESEARCH_SUMMARY.txt` (5 min)
2. **Developers**: Read `LOGFIRE_QUICK_START.md` (20 min) + `GO_OTEL_INTEGRATION_GUIDE.md` (30 min)
3. **Implementation**: Track progress in `IMPLEMENTATION_CHECKLIST.md`

---

## Beads Issues

Implementation tracked in beads:

```bash
# Phase 0 - Team decision
pw-l2f - Phase 0: Team decision & POC

# Phase 1-3 - Implementation
pw-4up - Phase 1: Go OTEL Integration
pw-bie - Phase 2: TypeScript Instrumentation
pw-15u - Phase 3: Cross-Test Correlation

# Parent
pw-lz0 - Implement Logfire observability for test infrastructure
```

View with: `bd ready --json`

---

## FAQ

### Q: Does Logfire require cloud?
**A**: Yes, Logfire platform is SaaS-only (logfire.pydantic.dev). However, Logfire SDKs are OTEL-based and can export to self-hosted backends (Jaeger, Grafana Tempo) instead.

### Q: What if we can't use SaaS?
**A**: Use pure OpenTelemetry + Jaeger (fully self-hosted, free). Same tracing capability, no cloud dependency.

### Q: How long to implement?
**A**: 1-2 weeks for all 3 phases. Phase 1 (Go) takes 2-3 days, Phase 2 (TS) takes 2-3 days, Phase 3 (correlation) takes 1-2 days.

### Q: What's the ROI?
**A**: 1-2 hours saved per developer per week on debugging, plus automatic performance trending. Positive month 1.

### Q: Can we roll back?
**A**: Yes. OTEL data is standard, can switch backends or revert to current logger without code changes (infrastructure only).

---

## Getting Started

### This Week (Nov 17-21)
1. Read `work/DECISION_MATRIX.md` (15 min)
2. Team discussion & vote
3. Run quick POC (30 min)

### Next Week (Nov 24+)
1. Assign Phase 1 owner
2. Follow `IMPLEMENTATION_CHECKLIST.md`
3. Weekly check-ins

---

## Links

- **Logfire**: https://logfire.pydantic.dev/
- **OpenTelemetry**: https://opentelemetry.io/
- **Jaeger**: https://www.jaegertracing.io/

---

## See Also

- `docs/operations/ENVIRONMENT_CONFIG.md` - Environment setup
- `.cody/` - Framework tracking (read-only)
- `AGENTS.md` - Agent workflow guidelines
