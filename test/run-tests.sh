#!/bin/bash

# Go BDD Test Runner
# This script runs the Go BDD tests with proper setup and teardown

set -e

echo "🧪 Starting Go BDD Test Runner..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "go.mod" ]; then
    echo "❌ go.mod not found. Please run from test/ directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing Go dependencies..."
go mod tidy
go mod download

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
go run github.com/playwright-community/playwright-go install

# Check if Hugo is available
if ! command -v hugo &> /dev/null; then
    echo "⚠️  Hugo is not installed. Please install Hugo for server tests."
fi

# Run tests
echo "🚀 Running BDD tests..."
if [ -n "$1" ] && [ "$1" = "ci" ]; then
    # CI mode - headless and specific output
    go test -v -timeout=10m
else
    # Development mode - with browser visible
    go test -v -timeout=10m
fi

echo "✅ Go BDD tests completed!"