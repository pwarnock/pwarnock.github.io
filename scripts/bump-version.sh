#!/bin/bash

# Bump patch version in package.json and hugo.toml
# Usage: ./scripts/bump-version.sh

set -e

CURRENT=$(grep -m 1 '"version"' package.json | sed -E 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/')
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "📦 Bumping version: $CURRENT → $NEW_VERSION"

# Update package.json - match exact pattern with description field after it
SED_CMD="s/\"version\": \"$CURRENT\",$/\"version\": \"$NEW_VERSION\",/"
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i "" "$SED_CMD" package.json
  sed -i "" "s/version = \"$CURRENT\"/version = \"$NEW_VERSION\"/" hugo.toml
else
  sed -i "$SED_CMD" package.json
  sed -i "s/version = \"$CURRENT\"/version = \"$NEW_VERSION\"/" hugo.toml
fi

echo "✓ Updated package.json"
echo "✓ Updated hugo.toml"
echo ""
echo "Version is now: $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit: git add -A && git commit -m 'Bump version to $NEW_VERSION'"
echo "  3. Create release with changelog"
