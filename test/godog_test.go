package main

import (
	"fmt"
	"os"
	"testing"

	"github.com/cucumber/godog"
	"github.com/cucumber/godog/colors"
	"pwarnock-tests/step_definitions"
	"pwarnock-tests/support"
)

var opts = godog.Options{
	Output:      colors.Colored(os.Stdout),
	Format:      "pretty",
	Concurrency: 1, // Run scenarios sequentially to prevent browser conflicts
}

var testCtx *support.TestContext

func TestFeatures(t *testing.T) {
	status := godog.TestSuite{
		Name:                 "pwarnock-bdd-tests",
		TestSuiteInitializer: InitializeTestSuite,
		ScenarioInitializer:  InitializeScenario,
		Options:              &opts,
	}.Run()

	if status > 0 {
		t.Fatalf("Failed to run feature tests: %d", status)
	}
}

func InitializeTestSuite(ctx *godog.TestSuiteContext) {
	ctx.BeforeSuite(func() {
		fmt.Println("Starting BDD test suite...")
		// Initialize test context (will be set up per scenario)
	})

	ctx.AfterSuite(func() {
		// Cleanup after all tests
		fmt.Println("BDD test suite completed.")
	})
}

func InitializeScenario(ctx *godog.ScenarioContext) {
	// Register step definitions with nil context initially
	// Context will be set in BeforeScenario
	navSteps := step_definitions.NewNavigationSteps(nil)
	navSteps.RegisterSteps(ctx)

	a11ySteps := step_definitions.NewAccessibilitySteps(nil)
	a11ySteps.RegisterSteps(ctx)

	perfSteps := step_definitions.NewPerformanceSteps(nil)
	perfSteps.RegisterSteps(ctx)

	// Set up scenario hooks
	ctx.BeforeScenario(func(scenario *godog.Scenario) {
		// Create test context for this scenario
		testCtx = support.NewTestContext(nil)
		// Set up a logger that includes scenario information
		testCtx.SetLogger(func(format string, args ...interface{}) {
			// For now, just print to stdout since we don't have T available
			fmt.Printf("[%s] ", scenario.Name)
			fmt.Printf(format, args...)
			fmt.Println()
		})

		// Initialize structured logger for enhanced logging
		testCtx.SetStructuredLogger(support.NewStructuredLogger("BDD-Test"))
		testCtx.Setup()

		// Update step definitions with proper context
		navSteps.SetTestContext(testCtx)
		a11ySteps.SetTestContext(testCtx)
		perfSteps.SetTestContext(testCtx)
	})

	// Register cleanup
	ctx.AfterScenario(func(scenario *godog.Scenario, err error) {
		// Take screenshot if test failed
		if err != nil && testCtx != nil {
			testCtx.TakeScreenshotOnError(scenario.Name)
		}

		// Cleanup test environment
		if testCtx != nil {
			testCtx.Teardown()
		}
	})
}

func main() {
	opts.Paths = []string{"features"}
	status := godog.TestSuite{
		Name:                 "pwarnock-bdd-tests",
		TestSuiteInitializer: InitializeTestSuite,
		ScenarioInitializer:  InitializeScenario,
		Options:              &opts,
	}.Run()

	os.Exit(status)
}
