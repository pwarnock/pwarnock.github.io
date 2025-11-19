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
	sl.span.SetAttributes(attribute.Int("a11y.violation_count", len(violations)))

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
