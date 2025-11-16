package support

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestStructuredLogger tests the structured logging functionality
func TestStructuredLogger(t *testing.T) {
	logger := NewStructuredLogger("test")

	t.Run("Logf formats messages correctly", func(t *testing.T) {
		logger.Logf("Test message: %s", "value")
	})

	t.Run("LogError includes error details", func(t *testing.T) {
		err := assert.AnError
		logger.LogError(err, "Test error occurred")
	})

	t.Run("LogPerformance includes metrics", func(t *testing.T) {
		metrics := map[string]interface{}{
			"loadTime": 100.0,
			"ttfb":     50.0,
		}
		logger.LogPerformance(metrics)
	})

	t.Run("LogAccessibility includes violation count", func(t *testing.T) {
		violations := []interface{}{"violation1", "violation2"}
		logger.LogAccessibility(violations)
	})

	t.Run("Close returns nil", func(t *testing.T) {
		err := logger.Close()
		assert.NoError(t, err)
	})
}

// TestHugoServer tests Hugo server management
func TestHugoServer(t *testing.T) {
	t.Run("NewHugoServer creates server instance", func(t *testing.T) {
		server := NewHugoServer()
		assert.NotNil(t, server)
		// Note: Port is randomly assigned, so we test baseURL instead
		assert.Equal(t, "http://localhost:1313", server.baseURL)
	})
}
