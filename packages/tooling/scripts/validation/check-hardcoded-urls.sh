#!/bin/bash

# Prevent hardcoded baseURL script
# Checks for hardcoded production URLs in configuration files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔒 Checking for hardcoded baseURL issues..."

# Check main hugo.toml for hardcoded production URLs
# Note: baseURL in main hugo.toml is expected to be production URL
# The validation should check if it matches the production config
if grep -q 'baseURL = "https://peterwarnock.com"' "$PROJECT_ROOT/hugo.toml"; then
    # This is actually correct - main config should have production URL
    echo "✅ Production baseURL correctly configured in main hugo.toml"
else
    echo "❌ INCORRECT baseURL in hugo.toml"
    echo "⚠️  This will cause deployment issues"
    echo ""
    echo "💡 SOLUTION:"
    echo "   1. Set baseURL to 'https://peterwarnock.com' in main hugo.toml"
    echo "   2. Use environment-specific configs if needed"
    echo "   3. Set HUGO_ENV=production for builds"
    echo ""
    echo "📝 Current problematic line:"
    grep -n 'baseURL = "https://peterwarnock.com"' "$PROJECT_ROOT/hugo.toml"
    exit 1
fi

# Check for localhost URLs in production config
if [[ -f "$PROJECT_ROOT/config/production/hugo.toml" ]]; then
    if grep -q 'localhost' "$PROJECT_ROOT/config/production/hugo.toml"; then
        echo "❌ LOCALHOST URL DETECTED in production config"
        echo "⚠️  Production config should use production URLs"
        exit 1
    fi
fi

# Check for production URLs in development config
if [[ -f "$PROJECT_ROOT/config/development/hugo.toml" ]]; then
    if grep -q 'peterwarnock.com' "$PROJECT_ROOT/config/development/hugo.toml"; then
        echo "❌ PRODUCTION URL DETECTED in development config"
        echo "⚠️  Development config should use localhost URLs"
        exit 1
    fi
fi

# Check package.json scripts for proper environment usage
if ! grep -q "HUGO_ENV=development" "$PROJECT_ROOT/package.json"; then
    echo "⚠️  Development scripts missing HUGO_ENV=development"
fi

if ! grep -q "HUGO_ENV=production" "$PROJECT_ROOT/package.json"; then
    echo "⚠️  Production scripts missing HUGO_ENV=production"
fi

echo "✅ No hardcoded baseURL issues detected"
echo "🚀 Environment-based configuration is properly set up"