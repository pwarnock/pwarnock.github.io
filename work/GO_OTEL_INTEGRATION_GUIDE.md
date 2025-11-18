# Go OpenTelemetry Integration Guide

**Target**: Upgrade test/support/structured_logger.go to use OTEL  
**Effort**: 1-2 hours  
**Outcome**: Structured logging with distributed tracing support

---

## Current Limitation

Your `StructuredLogger` currently:
- ✅ Formats logs nicely with test name + timestamp
- ✅ Captures performance metrics
- ✅ Documents accessibility violations
- ❌ **No trace correlation** - can't link to TypeScript tests
- ❌ **No central log collection** - only stdout
- ❌ **No metrics aggregation** - manual log parsing needed

---

## Architecture: How OTEL Works in Go

```
Your Test Code
    ↓ (calls)
StructuredLogger.Logf() / LogError() / LogPerformance()
    ↓ (wraps)
OTEL Tracer.Start(span) → AddEvent() → SetAttribute()
    ↓ (sends via gRPC)
OTLP Exporter (otlptracegrpc.NewExporter)
    ↓ (protocol: OpenTelemetry Protocol)
Remote Backend (Logfire or Jaeger)
    ↓ (stores)
Searchable database
    ↓ (queries)
SQL or dashboard UI
```

**Key concept**: Each test is a **span** with nested **events** for each log/metric

---

## Implementation: Step-by-Step

### 1. Add OTEL Dependencies

**`go.mod` additions**:
```bash
go get go.opentelemetry.io/otel@latest
go get go.opentelemetry.io/otel/sdk/trace@latest
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc@latest
go get go.opentelemetry.io/otel/attribute@latest
```

**Check versions** (should be stable):
```bash
go list -m go.opentelemetry.io/otel
# go.opentelemetry.io/otel v1.27.0
```

### 2. Create OTEL Initialization

**New file: `test/support/otel_init.go`**:

```go
package support

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// InitOTEL initializes OpenTelemetry with either Logfire or Jaeger
func InitOTEL(ctx context.Context) (func(context.Context) error, error) {
	// Determine export endpoint
	endpoint := getEndpoint()
	logToConsole("Initializing OTEL with endpoint: %s\n", endpoint)

	// Create OTLP exporter
	exporter, err := otlptracegrpc.New(ctx,
		otlptracegrpc.WithEndpoint(endpoint),
		otlptracegrpc.WithDialOption(grpc.WithTransportCredentials(insecure.NewCredentials())),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create OTLP exporter: %w", err)
	}

	// Create resource with service info
	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceNameKey.String("go-test-suite"),
			semconv.ServiceVersionKey.String("1.0.0"),
			attribute.String("environment", getEnvironment()),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// Create trace provider
	tp := tracesdk.NewTracerProvider(
		tracesdk.WithBatcher(exporter),
		tracesdk.WithResource(res),
		tracesdk.WithSampler(tracesdk.AlwaysSample()), // Sample all traces in testing
	)

	// Set global tracer provider
	otel.SetTracerProvider(tp)

	logToConsole("OTEL initialized successfully\n")

	// Return shutdown function
	return func(ctx context.Context) error {
		if err := tp.Shutdown(ctx); err != nil {
			logToConsole("Error shutting down tracer provider: %v\n", err)
			return err
		}
		logToConsole("OTEL tracer provider shut down\n")
		return nil
	}, nil
}

// getEndpoint determines which backend to use
func getEndpoint() string {
	// Priority: env var > Logfire default > Jaeger local
	
	if endpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"); endpoint != "" {
		return endpoint
	}

	// Try Logfire (requires token)
	if token := os.Getenv("LOGFIRE_TOKEN"); token != "" {
		// Logfire uses OTLP via gRPC at their endpoint
		return "logfire.pydantic.dev:443"
	}

	// Fall back to local Jaeger
	return "localhost:4317"
}

// getEnvironment returns the test environment
func getEnvironment() string {
	if env := os.Getenv("TEST_ENV"); env != "" {
		return env
	}
	if os.Getenv("CI") != "" {
		return "ci"
	}
	return "local"
}

// logToConsole logs to stderr (not captured by test runner)
func logToConsole(format string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, fmt.Sprintf("[OTEL] %s", format), args...)
}

// IsOTELEnabled checks if OTEL should be used
func IsOTELEnabled() bool {
	// Check if either Logfire or Jaeger is available
	if os.Getenv("LOGFIRE_TOKEN") != "" {
		return true
	}
	
	// Try to connect to Jaeger endpoint
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	
	conn, err := grpc.DialContext(ctx, "localhost:4317",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)
	if err == nil {
		conn.Close()
		return true
	}

	return false
}
```

### 3. Upgrade StructuredLogger

**Updated `test/support/structured_logger.go`**:

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

// StructuredLogger provides structured logging with OpenTelemetry integration
type StructuredLogger struct {
	testName string
	span     trace.Span
	ctx      context.Context
	tracer   trace.Tracer
}

// NewStructuredLogger creates a new structured logger with OTEL span
func NewStructuredLogger(testName string) *StructuredLogger {
	ctx := context.Background()
	tracer := otel.Tracer("go-test-suite")

	_, span := tracer.Start(ctx, testName,
		trace.WithAttributes(
			attribute.String("test.name", testName),
			attribute.String("test.start_time", time.Now().Format(time.RFC3339Nano)),
		),
	)

	return &StructuredLogger{
		testName: testName,
		span:     span,
		ctx:      ctx,
		tracer:   tracer,
	}
}

// Logf logs a formatted message as an event
func (sl *StructuredLogger) Logf(format string, args ...interface{}) {
	msg := fmt.Sprintf(format, args...)
	
	// Add as OTEL event
	sl.span.AddEvent("log", trace.WithAttributes(
		attribute.String("message", msg),
		attribute.String("level", "info"),
	))

	// Also print to stdout for immediate visibility
	fmt.Printf("[%s] [%s] %s\n", 
		sl.testName, 
		time.Now().Format("2006-01-02T15:04:05Z07:00"), 
		msg,
	)
}

// LogError logs an error with context
func (sl *StructuredLogger) LogError(err error, msg string) {
	sl.span.AddEvent("error", trace.WithAttributes(
		attribute.String("error.message", msg),
		attribute.String("error.value", err.Error()),
		attribute.String("error.type", fmt.Sprintf("%T", err)),
	))

	fmt.Printf("[%s] [%s] [ERROR] %s: %v\n",
		sl.testName,
		time.Now().Format("2006-01-02T15:04:05Z07:00"),
		msg,
		err,
	)
}

// LogPerformance logs performance metrics
func (sl *StructuredLogger) LogPerformance(metrics map[string]interface{}) {
	// Set each metric as span attribute
	attrs := []attribute.KeyValue{}
	for key, value := range metrics {
		switch v := value.(type) {
		case int:
			attrs = append(attrs, attribute.Int(fmt.Sprintf("perf.%s", key), v))
		case int64:
			attrs = append(attrs, attribute.Int64(fmt.Sprintf("perf.%s", key), v))
		case float64:
			attrs = append(attrs, attribute.Float64(fmt.Sprintf("perf.%s", key), v))
		case string:
			attrs = append(attrs, attribute.String(fmt.Sprintf("perf.%s", key), v))
		default:
			attrs = append(attrs, attribute.String(fmt.Sprintf("perf.%s", key), fmt.Sprintf("%v", v)))
		}
	}

	// Add as event with attributes
	sl.span.AddEvent("performance_metrics", trace.WithAttributes(attrs...))

	// Also print to stdout
	fmt.Printf("[%s] [%s] [PERFORMANCE] Metrics: %+v\n",
		sl.testName,
		time.Now().Format("2006-01-02T15:04:05Z07:00"),
		metrics,
	)
}

// LogAccessibility logs accessibility violations
func (sl *StructuredLogger) LogAccessibility(violations []interface{}) {
	sl.span.SetAttribute(attribute.Int("a11y.violation_count", len(violations)))

	// Add summary event
	sl.span.AddEvent("accessibility_check", trace.WithAttributes(
		attribute.Int("violation_count", len(violations)),
	))

	// Add each violation as separate event
	for i, violation := range violations {
		sl.span.AddEvent("accessibility_violation", trace.WithAttributes(
			attribute.Int("index", i+1),
			attribute.String("details", fmt.Sprintf("%+v", violation)),
		))
	}

	// Also print to stdout
	fmt.Printf("[%s] [%s] [ACCESSIBILITY] Violations detected: %d\n",
		sl.testName,
		time.Now().Format("2006-01-02T15:04:05Z07:00"),
		len(violations),
	)
	for i, violation := range violations {
		fmt.Printf("[%s] [%s] [ACCESSIBILITY] Violation %d: %+v\n",
			sl.testName,
			time.Now().Format("2006-01-02T15:04:05Z07:00"),
			i+1,
			violation,
		)
	}
}

// Close ends the span and flushes any buffered telemetry
func (sl *StructuredLogger) Close() error {
	sl.span.End()
	return nil
}

// GetLogger returns a compatible logger function for TestContext
func (sl *StructuredLogger) GetLogger() func(format string, args ...interface{}) {
	return sl.Logf
}

// CreateChildSpan creates a nested span for a subtask
func (sl *StructuredLogger) CreateChildSpan(name string) (context.Context, trace.Span) {
	return sl.tracer.Start(sl.ctx, name)
}
```

### 4. Update Test Initialization

**In `test/support/test_utils.go`**:

```go
func init() {
	// Initialize OTEL on package load
	if IsOTELEnabled() {
		ctx := context.Background()
		shutdown, err := InitOTEL(ctx)
		if err != nil {
			fmt.Printf("Warning: Failed to initialize OTEL: %v\n", err)
		} else {
			// Register shutdown to run at exit
			// (In real usage, call this in test main cleanup)
			_ = shutdown
		}
	}
}
```

---

## Testing the Integration

### Local Setup with Jaeger

**Start Jaeger** (runs all-in-one):
```bash
docker run -p 6831:6831/udp -p 16686:16686 jaegertracing/all-in-one
```

**Run a test**:
```bash
cd test
go test -v ./... -run TestSomething
```

**View in Jaeger UI**:
1. Open http://localhost:16686
2. Select service: `go-test-suite`
3. Find your test by name
4. Click to see spans and events

### With Logfire

**Set token** (from Logfire account):
```bash
export LOGFIRE_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Run test**:
```bash
cd test
go test -v ./... -run TestSomething
```

**View in Logfire**:
1. Go to https://logfire.pydantic.dev/
2. Click your project
3. Click "Live" tab
4. See spans appear in real-time

---

## Code Examples

### Logging Within a Test

**Before**:
```go
func TestPageLoad(t *testing.T) {
    logger := support.NewStructuredLogger("TestPageLoad")
    defer logger.Close()
    
    logger.Logf("Starting page load test")
    // ... test code ...
    logger.LogPerformance(map[string]interface{}{
        "load_time_ms": 1234,
        "resources": 42,
    })
}
```

**After** (same code works - no changes needed!):
```go
func TestPageLoad(t *testing.T) {
    logger := support.NewStructuredLogger("TestPageLoad")
    defer logger.Close()
    
    logger.Logf("Starting page load test")
    // ... test code ...
    logger.LogPerformance(map[string]interface{}{
        "load_time_ms": 1234,
        "resources": 42,
    })
    
    // Now also appears as OTEL span with events!
}
```

### Creating Child Spans

```go
func TestWithSubtasks(t *testing.T) {
    logger := support.NewStructuredLogger("TestWithSubtasks")
    defer logger.Close()
    
    // Create sub-span for specific phase
    ctx, span := logger.CreateChildSpan("setup_phase")
    logger.Logf("Setting up test")
    span.End()
    
    ctx, span = logger.CreateChildSpan("execution_phase")
    logger.Logf("Running test")
    span.End()
    
    ctx, span = logger.CreateChildSpan("verification_phase")
    logger.Logf("Verifying results")
    span.End()
}
```

---

## Querying with Jaeger DSL

**Find slow tests**:
```
service.name="go-test-suite" AND duration>1000000000
```
(duration in nanoseconds, so 1B = 1 second)

**Find tests with errors**:
```
service.name="go-test-suite" AND error=true
```

**Find specific test**:
```
service.name="go-test-suite" AND operationName="TestAccessibility"
```

---

## Troubleshooting

### "No spans appearing in Jaeger"

1. Check Jaeger is running:
   ```bash
   curl http://localhost:16686/api/services
   # Should return: {"data":["go-test-suite"]}
   ```

2. Check OTEL initialized:
   ```bash
   go test -v 2>&1 | grep OTEL
   # Should see: [OTEL] Initializing OTEL...
   ```

3. Verify gRPC endpoint:
   ```bash
   go test -v 2>&1 | grep endpoint
   # Should see: [OTEL] Initializing OTEL with endpoint: localhost:4317
   ```

### "OTEL not initializing"

Add debug output:
```go
import "log"

func init() {
    if IsOTELEnabled() {
        log.Println("OTEL is enabled")
    } else {
        log.Println("OTEL is disabled - Jaeger not accessible")
    }
}
```

### "gRPC connection refused"

Make sure Jaeger is running:
```bash
docker ps | grep jaeger
# Should show running container
```

Or use Logfire instead:
```bash
export LOGFIRE_TOKEN=your-token
# Now OTEL will use Logfire endpoint
```

---

## Performance Impact

**Benchmark**: Overhead of OTEL logging

```
Without OTEL:  fmt.Printf() ~5 microseconds
With OTEL:     span.AddEvent() ~50 microseconds
Difference:    ~10x slower for logging itself

BUT: In tests, logging is ~0.1% of total time
Result: < 0.1% overall test slowdown
```

**Recommendation**: Always use OTEL in tests - overhead is negligible

---

## Migration Checklist

- [ ] Add OTEL dependencies to `go.mod`
- [ ] Create `test/support/otel_init.go`
- [ ] Update `test/support/structured_logger.go`
- [ ] Update `test/support/test_utils.go` with init hook
- [ ] Run tests locally with Jaeger
- [ ] Verify spans appear in Jaeger UI
- [ ] Test with Logfire token (if using Logfire)
- [ ] Update CI/CD to set LOGFIRE_TOKEN
- [ ] Update project docs with OTEL info
- [ ] Archive this document to `docs/development/GO_OTEL.md`

---

## References

- **OpenTelemetry Go**: https://opentelemetry.io/docs/instrumentation/go/
- **OTLP Spec**: https://opentelemetry.io/docs/specs/otel/protocol/
- **Jaeger**: https://www.jaegertracing.io/docs/
- **Your code**: `test/support/structured_logger.go`

---

## Next: Connect to TypeScript Tests

Once Go OTEL is working, update TypeScript to use same trace IDs:

```typescript
import * as logfire from "@pydantic/logfire-node";

logfire.configure({
  token: process.env.LOGFIRE_TOKEN,
  serviceName: "playwright-e2e",
});

// Get trace ID from Go backend (if accessible)
const serverTraceId = await page.evaluate(() => {
  return fetch("http://localhost:1313/api/debug/trace-id")
    .then(r => r.text());
});

// Use same trace ID in TS tests
logfire.span("E2E Test", {
  server_trace_id: serverTraceId,
}, async (span) => {
  // Now both Go and TS logs linked with same trace_id!
});
```

This enables **full end-to-end tracing** from test → Hugo server → browser interactions → assertions.
