package support

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestHugoServer_NewHugoServer tests constructor
func TestHugoServer_NewHugoServer(t *testing.T) {
	server := NewHugoServer()

	assert.NotNil(t, server)
	assert.Equal(t, "http://localhost:1313", server.GetBaseURL())
}

// TestHugoServer_Start tests server start functionality
func TestHugoServer_Start(t *testing.T) {
	t.Run("returns nil if already running", func(t *testing.T) {
		server := NewHugoServer()
		// Set internal state directly for testing
		server.isRunning = true

		err := server.Start()
		assert.NoError(t, err)
	})
}

// TestHugoServer_Stop tests server stop functionality
func TestHugoServer_Stop(t *testing.T) {
	t.Run("returns nil if not running", func(t *testing.T) {
		server := NewHugoServer()
		server.isRunning = false

		err := server.Stop()
		assert.NoError(t, err)
	})

	t.Run("returns nil if cmd is nil", func(t *testing.T) {
		server := NewHugoServer()
		server.isRunning = true
		server.cmd = nil

		err := server.Stop()
		assert.NoError(t, err)
		// Note: isRunning should be false after successful stop
	})
}

// TestHugoServer_IsServerRunning tests server running check
func TestHugoServer_IsServerRunning(t *testing.T) {
	server := NewHugoServer()

	// Test with invalid URL - should return false
	server.baseURL = "invalid-url"
	assert.False(t, server.IsServerRunning())
}

// TestHugoServer_GetBaseURL tests base URL retrieval
func TestHugoServer_GetBaseURL(t *testing.T) {
	server := NewHugoServer()
	server.baseURL = "http://test:1234"

	assert.Equal(t, "http://test:1234", server.GetBaseURL())
}

// TestHugoServer_Integration tests integration scenarios
func TestHugoServer_Integration(t *testing.T) {
	t.Run("full lifecycle", func(t *testing.T) {
		server := NewHugoServer()

		// Test initial state
		assert.Equal(t, "http://localhost:1313", server.GetBaseURL())
		assert.False(t, server.isRunning)

		// Test stop when not running (should be safe)
		err := server.Stop()
		assert.NoError(t, err)
		assert.False(t, server.isRunning)
	})
}

// BenchmarkHugoServer_Operations benchmarks server operations
func BenchmarkHugoServer_Operations(b *testing.B) {
	b.Run("GetBaseURL", func(b *testing.B) {
		server := NewHugoServer()
		for i := 0; i < b.N; i++ {
			_ = server.GetBaseURL()
		}
	})

	b.Run("NewHugoServer", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_ = NewHugoServer()
		}
	})
}
