#!/bin/bash

##############################################################################
# Release Preparation Script
# Removes suffix from hugo.toml version for clean release
# Usage: ./scripts/release-prep.sh
##############################################################################

set -e

# Get current version from hugo.toml
if grep -q '^[[:space:]]*version = ' hugo.toml; then
  CURRENT_VERSION=$(grep '^[[:space:]]*version = ' hugo.toml | head -1 | sed 's/.*version = "\(.*\)".*/\1/')
else
  echo "❌ Error: No version found in hugo.toml"
  exit 1
fi

# Get semantic version from package.json
SEMANTIC_VERSION=$(node -p "require('./package.json').version")

# Check if current version has suffix
if [[ "$CURRENT_VERSION" == "$SEMANTIC_VERSION" ]]; then
  echo "ℹ️  Version is already clean (no suffix): $CURRENT_VERSION"
  echo "   Ready for release!"
  exit 0
fi

# Extract semantic version from current (remove suffix)
CURRENT_SEMANTIC=$(echo "$CURRENT_VERSION" | sed -E 's/^([0-9]+\.[0-9]+\.[0-9]+).*/\1/')

# Verify semantic versions match
if [[ "$CURRENT_SEMANTIC" != "$SEMANTIC_VERSION" ]]; then
  echo "❌ Error: Version mismatch detected"
  echo "   hugo.toml semantic part: $CURRENT_SEMANTIC"
  echo "   package.json version: $SEMANTIC_VERSION"
  echo "   Run './scripts/version-sync.sh' to fix first"
  exit 1
fi

# Update hugo.toml to remove suffix
sed -i.bak "s/version = \"$CURRENT_VERSION\"/version = \"$SEMANTIC_VERSION\"/" hugo.toml
rm -f hugo.toml.bak

echo "✅ Release preparation completed:"
echo "   Previous: $CURRENT_VERSION"
echo "   Clean: $SEMANTIC_VERSION"
echo ""
echo "📝 Next steps:"
echo "   1. Review changes with: git diff"
echo "   2. Commit changes: git add . && git commit -m \"chore: release v$SEMANTIC_VERSION\""
echo "   3. Create git tag: git tag v$SEMANTIC_VERSION"
echo "   4. Push to remote: git push origin main --tags"