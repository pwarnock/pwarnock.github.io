package support

import (
	"fmt"
	"os/exec"
	"time"
)

// HugoServer manages Hugo development server
type HugoServer struct {
	cmd       *exec.Cmd
	baseURL   string
	isRunning bool
}

// NewHugoServer creates a new Hugo server instance
func NewHugoServer() *HugoServer {
	return &HugoServer{
		baseURL: "http://localhost:1313",
	}
}

// Start starts the Hugo development server
func (h *HugoServer) Start() error {
	if h.isRunning {
		return nil
	}

	// Check if server is already running
	if h.IsServerRunning() {
		h.isRunning = true
		return nil
	}

	// Start Hugo server with port 0 to let OS assign available port
	h.cmd = exec.Command("hugo", "server",
		"-D",
		"--bind", "0.0.0.0",
		"--port", "0", // Let OS assign available port
		"--baseURL", h.baseURL,
		"--navigateToChanged",
		"--disableFastRender",
		"--config", "config/development/hugo.toml",
	)

	h.cmd.Dir = ".." // Run from project root

	// Start server in background
	if err := h.cmd.Start(); err != nil {
		return fmt.Errorf("failed to start Hugo server: %w", err)
	}

	// Wait for server to be ready and detect the actual port
	if err := h.waitForServerAndDetectPort(); err != nil {
		h.Stop()
		return err
	}

	h.isRunning = true
	return nil
}

// Stop stops the Hugo development server
func (h *HugoServer) Stop() error {
	if !h.isRunning || h.cmd == nil {
		return nil
	}

	if err := h.cmd.Process.Kill(); err != nil {
		return fmt.Errorf("failed to stop Hugo server: %w", err)
	}

	h.isRunning = false
	h.cmd = nil
	return nil
}

// IsServerRunning checks if Hugo server is responding
func (h *HugoServer) IsServerRunning() bool {
	cmd := exec.Command("curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", h.baseURL+"/")
	if output, err := cmd.Output(); err == nil {
		return string(output) == "200"
	}
	return false
}

// waitForServer waits for Hugo server to be ready
func (h *HugoServer) waitForServer() error {
	maxAttempts := 30
	for i := 0; i < maxAttempts; i++ {
		if h.IsServerRunning() {
			return nil
		}
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("Hugo server did not start within %d seconds", maxAttempts*2)
}

// waitForServerAndDetectPort waits for Hugo server and detects the actual port
func (h *HugoServer) waitForServerAndDetectPort() error {
	maxAttempts := 30
	for i := 0; i < maxAttempts; i++ {
		// Try to detect the actual port Hugo is using
		if actualURL, err := h.detectServerURL(); err == nil && actualURL != "" {
			h.baseURL = actualURL
			return nil
		}
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("Hugo server did not start within %d seconds", maxAttempts*2)
}

// detectServerURL tries to find the actual URL Hugo server is running on
func (h *HugoServer) detectServerURL() (string, error) {
	// Try common ports that Hugo might use
	ports := []string{"1313", "61124", "61125", "61126"}
	for _, port := range ports {
		url := fmt.Sprintf("http://localhost:%s", port)
		cmd := exec.Command("curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", url)
		if output, err := cmd.Output(); err == nil && string(output) == "200" {
			return url, nil
		}
	}
	return "", fmt.Errorf("could not detect Hugo server URL")
}

// GetBaseURL returns the Hugo server base URL
func (h *HugoServer) GetBaseURL() string {
	return h.baseURL
}
