#!/bin/bash

# CDN Integrity Verification Script
# Verifies all CDN URLs are accessible and integrity hashes match

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CDN_CONFIG="$PROJECT_ROOT/data/cdn.toml"

echo "🔍 Verifying CDN integrity..."

# Function to calculate SHA384 hash
calculate_sha384() {
    local url="$1"
    curl -s "$url" | sha384sum | cut -d' ' -f1
}

# Function to verify integrity
verify_integrity() {
    local url="$1"
    local expected_hash="$2"
    
    echo "  Checking $url"
    
    # Check if URL is accessible
    if ! curl -s --head "$url" > /dev/null; then
        echo "  ❌ URL not accessible: $url"
        return 1
    fi
    
    # Calculate current hash
    local current_hash=$(calculate_sha384 "$url")
    
    # Compare hashes
    if [[ "$current_hash" == "$expected_hash" ]]; then
        echo "  ✅ Integrity verified"
        return 0
    else
        echo "  ❌ Integrity mismatch!"
        echo "     Expected: $expected_hash"
        echo "     Current:  $current_hash"
        echo "     Update with:"
        echo "     integrity = \"sha384-$current_hash\""
        return 1
    fi
}

# Parse CDN config and verify each entry
echo "📋 Reading CDN configuration from $CDN_CONFIG"

# Extract AlpineJS entry (we only care about JS with integrity for now)
if grep -q "alpinejs" "$CDN_CONFIG"; then
    echo "🏔️  Verifying AlpineJS..."
    url=$(awk '/name = "alpinejs"/ {found=1} found && /url = / {print $3; exit}' "$CDN_CONFIG" | tr -d '"')
    expected_hash=$(awk '/name = "alpinejs"/ {found=1} found && /integrity = / {print $3; exit}' "$CDN_CONFIG" | tr -d '"' | sed 's/sha384-//')
    
    if [[ -z "$url" || -z "$expected_hash" ]]; then
        echo "❌ Could not extract AlpineJS URL or integrity hash"
        exit 1
    fi
    
    if ! verify_integrity "$url" "$expected_hash"; then
        echo "❌ CDN integrity verification failed"
        exit 1
    fi
else
    echo "ℹ️  No AlpineJS entry found in CDN config"
fi

echo "✅ All CDN integrity checks passed"
exit 0