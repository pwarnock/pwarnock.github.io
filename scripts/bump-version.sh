#!/bin/bash

##############################################################################
# Version Bump Script
# Extracts version from Cody framework and updates hugo.toml
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

# Update hugo.toml
sed -i.bak "s/version = \".*\"/version = \"$VERSION\"/" hugo.toml
rm -f hugo.toml.bak

echo "✅ Version bumped to: $VERSION"
echo "   From: $LATEST_VERSION_DIR"
