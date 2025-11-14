#!/bin/bash

##############################################################################
# Version Sync Script
# Syncs package.json version to hugo.toml with optional suffix
# Usage: ./scripts/version-sync.sh [suffix]
##############################################################################

set -e

# Get suffix from argument (optional)
SUFFIX="$1"

# Get current semantic version from package.json
SEMANTIC_VERSION=$(node -p "require('./package.json').version")

# Create full version with suffix if provided
if [ -n "$SUFFIX" ]; then
  FULL_VERSION="${SEMANTIC_VERSION}-${SUFFIX}"
else
  FULL_VERSION="$SEMANTIC_VERSION"
fi

# Update hugo.toml
if grep -q '^version = ' hugo.toml; then
  sed -i.bak "s/version = \".*\"/version = \"$FULL_VERSION\"/" hugo.toml
  rm -f hugo.toml.bak
else
  # Add version section if it doesn't exist
  echo -e "\nversion = \"$FULL_VERSION\"" >> hugo.toml
fi

echo "✅ Version synced:"
echo "   package.json: $SEMANTIC_VERSION"
echo "   hugo.toml: $FULL_VERSION"
if [ -n "$SUFFIX" ]; then
  echo "   suffix: $SUFFIX"
fi