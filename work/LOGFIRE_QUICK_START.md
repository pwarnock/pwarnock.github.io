# Logfire Quick Start: 30-Minute Setup Guide

**Goal**: Get Logfire running with your test suite in 30 minutes  
**Difficulty**: Easy  
**Prerequisites**: npm/go installed, internet connection

---

## Step 1: Create Logfire Account (5 min)

1. Go to https://logfire.pydantic.dev/
2. Click "Get Started"
3. Sign up with GitHub/Google
4. Create a project called "test-suite"
5. You'll get a **Write Token** - save this!

Example token format: `eyJ0eXAiOiJKV1QiLCJhbGc...`

---

## Step 2: Set Up Environment (2 min)

**Create `.env.local`** (Git-ignored):

```bash
LOGFIRE_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
LOGFIRE_SERVICE_NAME=test-suite
LOGFIRE_ENVIRONMENT=development
```

**Or add to CI/CD** (GitHub Actions):

1. Go to Settings → Secrets → New Repository Secret
2. Name: `LOGFIRE_TOKEN`
3. Value: Your token from Step 1

---

## Step 3: Install Logfire (3 min)

### TypeScript Tests

```bash
npm install @pydantic/logfire-node
```

### Go Tests

```bash
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
go get go.opentelemetry.io/otel/sdk/trace
```

---

## Step 4: Configure TypeScript Tests (5 min)

**Create `tests/logfire.setup.ts`**:

```typescript
import * as logfire from '@pydantic/logfire-node';

export function setupLogfire() {
  logfire.configure({
    token: process.env.LOGFIRE_TOKEN,
    serviceName: 'test-suite',
    environment: process.env.LOGFIRE_ENVIRONMENT || 'test',
    advancedOptions: {
      // Optional: use local Jaeger instead of Logfire
      // baseUrl: "http://localhost:4317",
    },
  });

  return logfire;
}
```

**Update `playwright.config.js`**:

```javascript
import { setupLogfire } from './tests/logfire.setup';

setupLogfire();

export default defineConfig({
  testDir: './tests',
  // ... rest of config
});
```

---

## Step 5: Instrument Playwright Tests (10 min)

**Before (current code)**:

```typescript
test('fix heading order violations', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await injectAxe(page);
  const violations = await getViolations(page, {
    rules: { 'heading-order': { enabled: true } },
  });
  console.log('Violations:', violations.length);
  expect(violations.length).toBeGreaterThan(0);
});
```

**After (with Logfire)**:

```typescript
import * as logfire from '@pydantic/logfire-node';

test('fix heading order violations', async ({ page }) => {
  await logfire.span(
    'Test: Heading Order Violations',
    {
      page_url: '/',
    },
    async span => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await injectAxe(page);
      const violations = await getViolations(page, {
        rules: { 'heading-order': { enabled: true } },
      });

      // Replace console.log with logfire
      logfire.info('Heading order check complete', {
        violation_count: violations.length,
      });

      // Log each violation as warning
      violations.forEach((v, i) => {
        logfire.warn(`Heading violation ${i + 1}`, {
          description: v.description,
          target: v.nodes[0]?.target.join(', '),
        });
      });

      expect(violations.length).toBeGreaterThan(0);
      span.end();
    }
  );
});
```

---

## Step 6: Configure Go Tests (5 min)

**Update `test/support/structured_logger.go`**:

```go
package support

import (
	"context"
	"fmt"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type StructuredLogger struct {
	testName string
	span     trace.Span
	ctx      context.Context
}

func NewStructuredLogger(testName string) *StructuredLogger {
	ctx := context.Background()
	tracer := otel.Tracer("go-test-suite")
	_, span := tracer.Start(ctx, testName,
		trace.WithAttributes(
			attribute.String("test.name", testName),
			attribute.String("timestamp", time.Now().Format(time.RFC3339)),
		),
	)

	return &StructuredLogger{
		testName: testName,
		span:     span,
		ctx:      ctx,
	}
}

func (sl *StructuredLogger) Logf(format string, args ...interface{}) {
	msg := fmt.Sprintf(format, args...)
	sl.span.AddEvent("log", trace.WithAttributes(
		attribute.String("message", msg),
	))
	// Also print to stdout for local testing
	fmt.Printf("[%s] [%s] %s\n", sl.testName, time.Now().Format("15:04:05"), msg)
}

func (sl *StructuredLogger) LogError(err error, msg string) {
	sl.span.AddEvent("error", trace.WithAttributes(
		attribute.String("error.message", msg),
		attribute.String("error.value", err.Error()),
	))
}

func (sl *StructuredLogger) LogPerformance(metrics map[string]interface{}) {
	for key, value := range metrics {
		sl.span.SetAttribute(attribute.String(fmt.Sprintf("perf.%s", key), fmt.Sprintf("%v", value)))
	}
}

func (sl *StructuredLogger) LogAccessibility(violations []interface{}) {
	sl.span.SetAttribute(attribute.Int("a11y.violation_count", len(violations)))
	for i, violation := range violations {
		sl.span.AddEvent("accessibility_violation", trace.WithAttributes(
			attribute.Int("index", i+1),
			attribute.String("violation", fmt.Sprintf("%+v", violation)),
		))
	}
}

func (sl *StructuredLogger) Close() error {
	sl.span.End()
	return nil
}

func (sl *StructuredLogger) GetLogger() func(format string, args ...interface{}) {
	return sl.Logf
}
```

---

## Step 7: Run Tests with Logfire (2 min)

**TypeScript:**

```bash
npm run test:e2e
```

**Go:**

```bash
cd test && go test -v ./...
```

**Watch Logfire live view:**

1. Go to https://logfire.pydantic.dev/
2. Click your project
3. Click "Live" tab
4. See spans appear in real-time as tests run ✨

---

## Verification Checklist

- [ ] Environment variable set correctly (`echo $LOGFIRE_TOKEN`)
- [ ] First test runs without error
- [ ] Check Logfire "Live" view - spans appear
- [ ] Can see individual test events logged
- [ ] Performance metrics captured
- [ ] Accessibility violations show as warnings

---

## Common Issues

### "No spans appearing in Logfire"

**Solution**: Check token is correct

```bash
echo $LOGFIRE_TOKEN | head -c 20  # Should not be empty
```

### "ENOTFOUND logfire.pydantic.dev"

**Solution**: Network/DNS issue, check internet connection

```bash
curl https://logfire.pydantic.dev/docs -I
```

### "Rate limited by Logfire"

**Solution**: You've exceeded free tier limits

- Upgrade account or
- Switch to local Jaeger backend (see below)

---

## Alternative: Use Jaeger Instead of Logfire

**Why**: No SaaS account needed, all data stays local

**Setup Jaeger** (1 command):

```bash
docker run -p 6831:6831/udp -p 16686:16686 jaegertracing/all-in-one
```

**Open Jaeger UI**: http://localhost:16686

**Update `.env.local`**:

```bash
# Use local Jaeger instead of Logfire
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
LOGFIRE_DISABLED=true
```

**Update tests to use OTEL directly**:

```typescript
import { basicSetup } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

basicSetup({
  instrumentations: [getNodeAutoInstrumentations()],
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
});
```

---

## Next: SQL Queries

Once tests are running, you can query them with SQL:

**Find all failed accessibility tests:**

```sql
SELECT timestamp, attributes.test_name, events
FROM spans
WHERE attributes.test_name LIKE '%accessibility%'
  AND events.error_count > 0
ORDER BY timestamp DESC
```

**Performance trend over time:**

```sql
SELECT
  DATE(timestamp) as date,
  AVG(CAST(attributes['perf.load_time'] AS FLOAT)) as avg_load_ms,
  MAX(CAST(attributes['perf.load_time'] AS FLOAT)) as max_load_ms
FROM spans
WHERE attributes.test_name = 'homepage_performance'
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 30
```

---

## Getting Help

- **Logfire Docs**: https://logfire.pydantic.dev/docs/
- **Logfire Discord**: https://logfire.pydantic.dev/docs/join-slack/
- **OTEL Docs**: https://opentelemetry.io/docs/
- **Your project docs**: See `docs/operations/OBSERVABILITY.md`

---

## What's Next?

1. **Dashboard**: Create custom dashboard in Logfire for failed tests
2. **Alerts**: Set up Slack notification for test failures
3. **Comparison**: Compare performance before/after changes
4. **CI/CD**: Integrate into GitHub Actions pipeline
5. **Team**: Share Logfire project access with team members

---

**Estimated time to complete**: 30 minutes  
**Cost**: Free (for < 100K spans/month)  
**Result**: Live tracing for all tests with SQL querying
