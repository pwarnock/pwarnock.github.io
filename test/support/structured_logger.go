package support

import (
	"fmt"
	"time"
)

// StructuredLogger provides structured logging for the test framework
// Can be easily upgraded to OpenTelemetry later
type StructuredLogger struct {
	testName string
}

// NewStructuredLogger creates a new structured logger
func NewStructuredLogger(testName string) *StructuredLogger {
	return &StructuredLogger{
		testName: testName,
	}
}

// Logf logs a formatted message with structured context
func (sl *StructuredLogger) Logf(format string, args ...interface{}) {
	fmt.Printf("[%s] [%s] ", sl.testName, time.Now().Format("2006-01-02T15:04:05Z07:00"))
	fmt.Printf(format, args...)
	fmt.Println()
}

// LogError logs an error with structured context
func (sl *StructuredLogger) LogError(err error, msg string) {
	fmt.Printf("[%s] [%s] [ERROR] %s: %v\n", sl.testName, time.Now().Format("2006-01-02T15:04:05Z07:00"), msg, err)
}

// LogPerformance logs performance metrics with structured context
func (sl *StructuredLogger) LogPerformance(metrics map[string]interface{}) {
	fmt.Printf("[%s] [%s] [PERFORMANCE] Metrics: %+v\n", sl.testName, time.Now().Format("2006-01-02T15:04:05Z07:00"), metrics)
}

// LogAccessibility logs accessibility violations with structured context
func (sl *StructuredLogger) LogAccessibility(violations []interface{}) {
	fmt.Printf("[%s] [%s] [ACCESSIBILITY] Violations detected: %d\n", sl.testName, time.Now().Format("2006-01-02T15:04:05Z07:00"), len(violations))
	for i, violation := range violations {
		fmt.Printf("[%s] [%s] [ACCESSIBILITY] Violation %d: %+v\n", sl.testName, time.Now().Format("2006-01-02T15:04:05Z07:00"), i+1, violation)
	}
}

// Close shuts down the structured logger
func (sl *StructuredLogger) Close() error {
	return nil
}

// GetLogger returns a compatible logger function for TestContext
func (sl *StructuredLogger) GetLogger() func(format string, args ...interface{}) {
	return sl.Logf
}
