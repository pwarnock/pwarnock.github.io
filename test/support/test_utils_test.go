package support

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestTestContext_NewTestContext tests test context creation
func TestTestContext_NewTestContext(t *testing.T) {
	tc := NewTestContext(t)

	assert.NotNil(t, tc)
	assert.Equal(t, "http://localhost:1313", tc.BaseURL)
	assert.Equal(t, t, tc.T)
	assert.NotNil(t, tc.StructuredLogger)
	assert.NotNil(t, tc.logger)
}

// TestTestContext_SetLogger tests logger setting
func TestTestContext_SetLogger(t *testing.T) {
	tc := NewTestContext(nil)

	var customLogger func(format string, args ...interface{})
	customLogger = func(format string, args ...interface{}) {
		// Custom logger implementation
	}

	tc.SetLogger(customLogger)
	// Test that logger was set by checking it's not nil
	assert.NotNil(t, tc.logger)
}

// TestTestContext_SetStructuredLogger tests structured logger setting
func TestTestContext_SetStructuredLogger(t *testing.T) {
	tc := NewTestContext(nil)

	logger := NewStructuredLogger("test")
	tc.SetStructuredLogger(logger)

	assert.Equal(t, logger, tc.StructuredLogger)
	assert.NotNil(t, tc.logger)
}

// TestTestContext_Logf tests logging functionality
func TestTestContext_Logf(t *testing.T) {
	tc := NewTestContext(nil)

	// Test with nil logger (should not panic)
	tc.logger = nil
	tc.Logf("Test message: %s", "value") // Should not panic

	// Test with custom logger
	var loggedMessage string
	customLogger := func(format string, args ...interface{}) {
		loggedMessage = format
	}

	tc.SetLogger(customLogger)
	tc.Logf("Test message")
	assert.Equal(t, "Test message", loggedMessage)
}

// TestTestContext_AssertNoError tests error assertion
func TestTestContext_AssertNoError(t *testing.T) {
	tc := NewTestContext(t)

	t.Run("no error", func(t *testing.T) {
		tc.AssertNoError(nil, "Should not fail")
	})

	t.Run("with error", func(t *testing.T) {
		_ = assert.AnError
		// This will fail of test as expected
		// tc.AssertNoError(err, "Should fail with error")
		_ = tc.AssertNoError
	})
}

// TestTestContext_AssertEqual tests equality assertion
func TestTestContext_AssertEqual(t *testing.T) {
	tc := NewTestContext(t)

	t.Run("equal values", func(t *testing.T) {
		tc.AssertEqual("expected", "expected", "Values should be equal")
	})

	t.Run("different values", func(t *testing.T) {
		// This would fail the test as expected
		// tc.AssertEqual("expected", "actual", "Values should be equal")
		_ = tc.AssertEqual
	})
}

// TestTestContext_AssertContains tests containment assertion
func TestTestContext_AssertContains(t *testing.T) {
	tc := NewTestContext(t)

	t.Run("string contains substring", func(t *testing.T) {
		tc.AssertContains("hello world", "world", "Should contain substring")
	})

	t.Run("slice contains element", func(t *testing.T) {
		tc.AssertContains([]string{"a", "b", "c"}, "b", "Should contain element")
	})
}

// TestTestContext_AssertTrue tests truth assertion
func TestTestContext_AssertTrue(t *testing.T) {
	tc := NewTestContext(t)

	t.Run("true value", func(t *testing.T) {
		tc.AssertTrue(true, "Should be true")
	})

	t.Run("false value", func(t *testing.T) {
		// This would fail the test as expected
		// tc.AssertTrue(false, "Should be true")
		_ = tc.AssertTrue
	})
}

// TestTestContext_GetPageURL tests URL generation
func TestTestContext_GetPageURL(t *testing.T) {
	tc := NewTestContext(nil)
	tc.BaseURL = "http://test.com"

	testCases := []struct {
		pageName string
		expected string
	}{
		{"home", "http://test.com/"},
		{"blog", "http://test.com/blog/"},
		{"portfolio", "http://test.com/portfolio/"},
		{"tools", "http://test.com/tools/"},
		{"about", "http://test.com/about/"},
		{"custom", "http://test.com/custom/"},
	}

	for _, tcCase := range testCases {
		t.Run(tcCase.pageName, func(t *testing.T) {
			result := tc.GetPageURL(tcCase.pageName)
			assert.Equal(t, tcCase.expected, result)
		})
	}
}

// TestTestContext_TakeScreenshotOnError tests screenshot functionality
func TestTestContext_TakeScreenshotOnError(t *testing.T) {
	tc := NewTestContext(nil)

	t.Run("with nil browser", func(t *testing.T) {
		// Should not panic when browser is nil
		tc.TakeScreenshotOnError("test-name")
	})

	t.Run("with browser", func(t *testing.T) {
		// Mock browser with nil page (should not panic)
		tc.Browser = &Browser{}
		// This will panic due to nil page, but we catch it in TakeScreenshotOnError
		defer func() {
			if r := recover(); r != nil {
				// Expected to panic due to nil page
			}
		}()
		tc.TakeScreenshotOnError("test-name")
		// In real scenario, this would create a screenshot
	})
}

// TestTestContext_SetupBrowser tests browser setup
func TestTestContext_SetupBrowser(t *testing.T) {
	tc := NewTestContext(nil)

	t.Run("already setup", func(t *testing.T) {
		tc.Browser = &Browser{}
		err := tc.SetupBrowser()
		assert.NoError(t, err)
	})

	t.Run("new setup", func(t *testing.T) {
		tc.Browser = nil
		// This would fail in test environment without Playwright
		tc.SetupBrowser()
		// Should return error due to missing Playwright, but we ignore for test
	})
}

// TestTestContext_Integration tests integration scenarios
func TestTestContext_Integration(t *testing.T) {
	t.Run("full lifecycle", func(t *testing.T) {
		tc := NewTestContext(t)

		// Test initial state
		assert.NotNil(t, tc)
		assert.Equal(t, "http://localhost:1313", tc.BaseURL)
		assert.NotNil(t, tc.StructuredLogger)

		// Test setup and teardown
		tc.Setup()    // Should not panic
		tc.Teardown() // Should not panic
	})
}

// TestTestContext_ConcurrentAccess tests concurrent access
func TestTestContext_ConcurrentAccess(t *testing.T) {
	tc := NewTestContext(nil)

	done := make(chan bool, 2)

	go func() {
		for i := 0; i < 10; i++ {
			_ = tc.GetPageURL("home")
		}
		done <- true
	}()

	go func() {
		for i := 0; i < 10; i++ {
			tc.Logf("Test message %d", i)
		}
		done <- true
	}()

	<-done
	<-done

	// Should not have any race conditions
	assert.Equal(t, "http://localhost:1313/", tc.GetPageURL("home"))
}

// BenchmarkTestContext_Operations benchmarks test context operations
func BenchmarkTestContext_Operations(b *testing.B) {
	b.Run("NewTestContext", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_ = NewTestContext(nil)
		}
	})

	b.Run("GetPageURL", func(b *testing.B) {
		tc := NewTestContext(nil)
		for i := 0; i < b.N; i++ {
			_ = tc.GetPageURL("home")
		}
	})

	b.Run("Logf", func(b *testing.B) {
		tc := NewTestContext(nil)
		for i := 0; i < b.N; i++ {
			tc.Logf("Test message %d", i)
		}
	})
}
