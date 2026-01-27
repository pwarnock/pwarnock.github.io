package support

import (
	"context"
	"fmt"
	"os/exec"
	"testing"

	"github.com/pwarnock/go-playwright-testkit/pkg/browser"
	pkgcontext "github.com/pwarnock/go-playwright-testkit/pkg/context"
	"github.com/pwarnock/go-playwright-testkit/pkg/logger"
	"github.com/pwarnock/go-playwright-testkit/pkg/telemetry"
)

// TestContext wraps the library's TestContext with Hugo-specific functionality
type TestContext struct {
	*pkgcontext.TestContext
	HugoServer *HugoServer
}

// NewTestContext creates a new test context for Hugo site testing
func NewTestContext(t *testing.T) *TestContext {
	tc := &TestContext{
		TestContext: pkgcontext.NewTestContext(t, "http://localhost:1313"),
		HugoServer:  NewHugoServer(),
	}

	// Initialize structured logger with OTEL
	structuredLogger := logger.NewStructuredLogger("BDD-Test")
	tc.TestContext.SetStructuredLogger(structuredLogger)

	return tc
}

// Setup sets up test environment with Hugo server
func (tc *TestContext) Setup() error {
	// Set Hugo server as the ServerManager
	tc.TestContext.Server = tc.HugoServer

	// Call parent Setup which will start the server
	if err := tc.TestContext.Setup(); err != nil {
		tc.Logf("Warning: Failed to start Hugo server: %v", err)
		tc.Logf("Tests will run without Hugo server")
		return err
	}

	// Update BaseURL from Hugo server
	tc.BaseURL = tc.HugoServer.GetBaseURL()

	return nil
}

// Teardown cleans up test environment
func (tc *TestContext) Teardown() {
	// Call parent Teardown which handles browser and server cleanup
	tc.TestContext.Teardown()

	// Close structured logger if it's our type
	if sl, ok := tc.StructuredLogger.(*logger.StructuredLogger); ok {
		sl.Close()
	}
}

// SetupBrowser creates and initializes browser instance
func (tc *TestContext) SetupBrowser() error {
	if tc.Browser != nil {
		tc.Logf("Browser already initialized")
		return nil
	}

	tc.Logf("Initializing browser...")

	// Create browser with default options (headless)
	b, err := browser.NewBrowser()
	if err != nil {
		return fmt.Errorf("failed to create browser: %w", err)
	}

	tc.Browser = b
	tc.Logf("Browser initialized successfully")
	return nil
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

// GetPageURL returns a full URL for a page name (Hugo-specific)
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

// WaitForPage waits for a page to become available (Hugo-specific)
func (tc *TestContext) WaitForPage(pageName string) error {
	maxAttempts := 15

	for i := 0; i < maxAttempts; i++ {
		if err := tc.CheckPageExists(pageName); err == nil {
			return nil
		}
		tc.Logf("Waiting for page %s... (attempt %d/%d)", pageName, i+1, maxAttempts)
		// Sleep is handled in loop
	}

	return fmt.Errorf("page %s did not become available within timeout", pageName)
}

func init() {
	// Initialize OTEL on package load if enabled
	if telemetry.IsOTELEnabled() {
		ctx := context.Background()
		shutdown, err := telemetry.InitOTEL(ctx)
		if err != nil {
			fmt.Printf("Warning: Failed to initialize OTEL: %v\n", err)
		} else {
			// Register shutdown to run at exit
			_ = shutdown
		}
	}
}
