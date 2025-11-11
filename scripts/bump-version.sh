#!/bin/bash

##############################################################################
# Version Bump Script
# Extracts version from Cody framework and updates hugo.toml and package.json
# Run this before building to ensure version is in sync
##############################################################################

set -e

# Find the latest version directory
LATEST_VERSION_DIR=$(find .cody/project/build/v* -maxdepth 0 -type d 2>/dev/null | sort -V | tail -1)

if [ -z "$LATEST_VERSION_DIR" ]; then
  echo "⚠️  No version directories found in .cody/project/build/"
  echo "Version remains: $(grep '^version' hugo.toml | head -1)"
  exit 0
fi

# Extract version from directory name (e.g., v0.10.0-spacing-scale → 0.10.0-spacing-scale)
FULL_VERSION=$(basename "$LATEST_VERSION_DIR")
VERSION=${FULL_VERSION#v}  # Remove leading 'v'

# Extract semantic version (major.minor.patch) from VERSION
# Handle formats like "0.13.0-radar" → "0.13.0"
SEMANTIC_VERSION=$(echo "$VERSION" | sed -E 's/^([0-9]+\.[0-9]+\.[0-9]+).*/\1/')

# Update hugo.toml
sed -i.bak "s/version = \".*\"/version = \"$VERSION\"/" hugo.toml
rm -f hugo.toml.bak

# Update package.json with semantic version only (no suffix)
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$SEMANTIC_VERSION\"/" package.json
rm -f package.json.bak

echo "✅ Version bumped:"
echo "   hugo.toml: $VERSION"
echo "   package.json: $SEMANTIC_VERSION"
echo "   From: $LATEST_VERSION_DIR"
