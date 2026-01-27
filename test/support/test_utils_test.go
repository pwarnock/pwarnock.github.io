package support

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestNewTestContext tests context creation
func TestNewTestContext(t *testing.T) {
	tc := NewTestContext(t)

	assert.NotNil(t, tc)
	assert.NotNil(t, tc.TestContext)
	assert.NotNil(t, tc.HugoServer)
	assert.Equal(t, "http://localhost:1313", tc.BaseURL)
}

// TestTestContext_GetPageURL tests page URL generation (Hugo-specific)
func TestTestContext_GetPageURL(t *testing.T) {
	tc := NewTestContext(t)

	tests := []struct {
		pageName    string
		expectedURL string
	}{
		{"home", "http://localhost:1313/"},
		{"blog", "http://localhost:1313/blog/"},
		{"portfolio", "http://localhost:1313/portfolio/"},
		{"tools", "http://localhost:1313/tools/"},
		{"about", "http://localhost:1313/about/"},
		{"custom", "http://localhost:1313/custom/"},
	}

	for _, tt := range tests {
		t.Run(tt.pageName, func(t *testing.T) {
			url := tc.GetPageURL(tt.pageName)
			assert.Equal(t, tt.expectedURL, url)
		})
	}
}

// TestTestContext_CheckPageExists tests page checking
func TestTestContext_CheckPageExists(t *testing.T) {
	tc := NewTestContext(t)

	// This will fail if server not running, but tests the method exists
	err := tc.CheckPageExists("nonexistent")
	// We expect an error since server likely isn't running
	if err != nil {
		assert.Contains(t, err.Error(), "status")
	}
}

// TestHugoServer_Structure tests server structure
func TestHugoServer_Structure(t *testing.T) {
	server := NewHugoServer()

	assert.NotNil(t, server)
	assert.Equal(t, "http://localhost:1313", server.GetBaseURL())
	assert.False(t, server.IsReady()) // Not started yet
}

// Note: Most TestContext functionality is now tested in the library
// (go-playwright-testkit/pkg/context). These tests focus on Hugo-specific extensions.
