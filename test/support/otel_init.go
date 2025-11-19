package support

import (
	"context"
	"fmt"
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
func logToConsole(format string, args ...any) {
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
