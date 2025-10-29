#!/bin/bash

# Update Hugo version based on current git branch and commit
# If on main/master: use package.json version
# If on feature branch: use branch-name + short-hash

set -e

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHORT_HASH=$(git rev-parse --short HEAD)

# Get package version as fallback
PACKAGE_VERSION=$(node -p "require('./package.json').version")

# Determine version to use
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    VERSION="$PACKAGE_VERSION"
else
    VERSION="${BRANCH}-${SHORT_HASH}"
fi

# Update hugo.toml
if [ -f "hugo.toml" ]; then
    # Use sed to replace the version line
    sed -i.bak "s/version = \".*\"/version = \"$VERSION\"/" hugo.toml && rm hugo.toml.bak
    echo "✓ Updated version to: $VERSION (branch: $BRANCH)"
else
    echo "❌ hugo.toml not found"
    exit 1
fi