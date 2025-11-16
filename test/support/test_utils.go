package support

import (
	"fmt"
	"os/exec"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// TestContext holds shared test state
type TestContext struct {
	HugoServer       *HugoServer
	Browser          *Browser
	BaseURL          string
	T                *testing.T
	logger           func(format string, args ...interface{})
	StructuredLogger *StructuredLogger
}

// NewTestContext creates a new test context
func NewTestContext(t *testing.T) *TestContext {
	tc := &TestContext{
		T:       t,
		BaseURL: "http://localhost:1313",
	}

	// Initialize structured logger
	tc.StructuredLogger = NewStructuredLogger("BDD-Test")

	if t != nil {
		tc.logger = t.Logf
	} else {
		tc.logger = tc.StructuredLogger.GetLogger()
	}
	return tc
}

// SetLogger sets the logger function
func (tc *TestContext) SetLogger(logger func(format string, args ...interface{})) {
	tc.logger = logger
}

// SetStructuredLogger sets the structured logger
func (tc *TestContext) SetStructuredLogger(logger *StructuredLogger) {
	tc.StructuredLogger = logger
	tc.logger = logger.GetLogger()
}

// Logf logs a formatted message
func (tc *TestContext) Logf(format string, args ...interface{}) {
	if tc.logger != nil {
		tc.logger(format, args...)
	}
}

// Setup sets up test environment
func (tc *TestContext) Setup() {
	// Start Hugo server
	tc.HugoServer = NewHugoServer()
	err := tc.HugoServer.Start()
	if err != nil {
		tc.Logf("Warning: Failed to start Hugo server: %v", err)
		tc.Logf("Tests will run without Hugo server")
	}

	// Browser will be created on-demand by step definitions
}

// Teardown cleans up test environment
func (tc *TestContext) Teardown() {
	tc.Logf("Cleaning up test environment...")

	if tc.Browser != nil {
		tc.Logf("Closing browser...")
		if err := tc.Browser.Close(); err != nil {
			tc.Logf("Error closing browser: %v", err)
		}
		tc.Browser = nil
	}

	if tc.HugoServer != nil {
		tc.Logf("Stopping Hugo server...")
		if err := tc.HugoServer.Stop(); err != nil {
			tc.Logf("Error stopping Hugo server: %v", err)
		}
		tc.HugoServer = nil
	}

	tc.Logf("Test environment cleanup completed")
}

// SetupBrowser creates and initializes browser instance
func (tc *TestContext) SetupBrowser() error {
	if tc.Browser != nil {
		tc.Logf("Browser already initialized")
		return nil // Already setup
	}

	tc.Logf("Initializing browser...")
	browser, err := NewBrowser()
	if err != nil {
		return fmt.Errorf("failed to create browser: %w", err)
	}

	tc.Browser = browser
	tc.Logf("Browser initialized successfully")
	return nil
}

// AssertNoError asserts no error occurred
func (tc *TestContext) AssertNoError(err error, msgAndArgs ...interface{}) {
	assert.NoError(tc.T, err, msgAndArgs...)
}

// AssertEqual asserts two values are equal
func (tc *TestContext) AssertEqual(expected, actual interface{}, msgAndArgs ...interface{}) {
	assert.Equal(tc.T, expected, actual, msgAndArgs...)
}

// AssertContains asserts a string contains a substring
func (tc *TestContext) AssertContains(s, contains interface{}, msgAndArgs ...interface{}) {
	assert.Contains(tc.T, s, contains, msgAndArgs...)
}

// AssertTrue asserts a condition is true
func (tc *TestContext) AssertTrue(value bool, msgAndArgs ...interface{}) {
	assert.True(tc.T, value, msgAndArgs...)
}

// TakeScreenshotOnError takes a screenshot if an error occurs
func (tc *TestContext) TakeScreenshotOnError(testName string) {
	if tc.Browser != nil {
		screenshotDir := "test-results/screenshots"
		exec.Command("mkdir", "-p", screenshotDir).Run()

		screenshotPath := fmt.Sprintf("%s/%s-error.png", screenshotDir, testName)
		err := tc.Browser.TakeScreenshot(screenshotPath)
		if err != nil {
			tc.Logf("Failed to take screenshot: %v", err)
		} else {
			tc.Logf("Screenshot saved to: %s", screenshotPath)
		}
	}
}

// CheckPageExists checks if a page responds correctly
func (tc *TestContext) CheckPageExists(pageName string) error {
	url := tc.GetPageURL(pageName)

	cmd := exec.Command("curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", url)
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to check page %s: %w", pageName, err)
	}

	statusCode := string(output)
	if statusCode != "200" {
		return fmt.Errorf("page %s returned status %s", pageName, statusCode)
	}

	return nil
}

// GetPageURL returns a full URL for a page name
func (tc *TestContext) GetPageURL(pageName string) string {
	switch pageName {
	case "home":
		return tc.BaseURL + "/"
	case "blog":
		return tc.BaseURL + "/blog/"
	case "portfolio":
		return tc.BaseURL + "/portfolio/"
	case "tools":
		return tc.BaseURL + "/tools/"
	case "about":
		return tc.BaseURL + "/about/"
	default:
		return tc.BaseURL + "/" + pageName + "/"
	}
}

// WaitForPage waits for a page to become available
func (tc *TestContext) WaitForPage(pageName string) error {
	maxAttempts := 15

	for i := 0; i < maxAttempts; i++ {
		if err := tc.CheckPageExists(pageName); err == nil {
			return nil
		}
		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("page %s did not become available within %d seconds", pageName, maxAttempts*2)
}
