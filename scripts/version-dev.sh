#!/bin/bash

##############################################################################
# Enhanced Version Development Script
# Combines bun version bump with development cycle start
# Usage: bun run version:dev [suffix]
##############################################################################

set -e

# Get suffix from argument or prompt
SUFFIX="$1"
if [ -z "$SUFFIX" ]; then
  echo "Enter development suffix (e.g., 'hero-color-fix'):"
  read -r SUFFIX
fi

if [ -z "$SUFFIX" ]; then
  echo "❌ Error: Suffix is required"
  echo "Usage: $0 [suffix]"
  exit 1
fi

# Validate suffix format (lowercase, hyphens only)
if [[ ! "$SUFFIX" =~ ^[a-z0-9-]+$ ]]; then
  echo "❌ Error: Suffix must contain only lowercase letters, numbers, and hyphens"
  exit 1
fi

echo "🔄 Starting development cycle with suffix: $SUFFIX"

# Bump version using bun
echo "📦 Bumping patch version..."
bun pm version patch

# Get new semantic version
SEMANTIC_VERSION=$(node -p "require('./package.json').version")

# Create full version with suffix
FULL_VERSION="${SEMANTIC_VERSION}-${SUFFIX}"

# Update hugo.toml with full version
if grep -q '^version = ' hugo.toml; then
  sed -i.bak "s/version = \".*\"/version = \"$FULL_VERSION\"/" hugo.toml
  rm -f hugo.toml.bak
else
  # Add version section if it doesn't exist
  echo -e "\nversion = \"$FULL_VERSION\"" >> hugo.toml
fi

# Check if version already exists in feature backlog
BACKLOG_FILE=".cody/project/build/feature-backlog.md"
if grep -q "v$FULL_VERSION" "$BACKLOG_FILE"; then
  echo "⚠️  Version v$FULL_VERSION already exists in feature backlog"
else
  echo ""
  echo "📝 Would you like to add v$FULL_VERSION to feature backlog? (y/n)"
  read -r ADD_TO_BACKLOG
  
  if [[ "$ADD_TO_BACKLOG" =~ ^[Yy]$ ]]; then
    # Get next feature ID
    LAST_ID=$(grep -o 'F[0-9]\+' "$BACKLOG_FILE" | sort -V | tail -1 | sed 's/F//')
    NEXT_ID=$((LAST_ID + 1))
    
    echo ""
    echo "Enter brief description for this version (e.g., 'Hero color restoration'):"
    read -r DESCRIPTION
    
    # Add to feature backlog
    BACKLOG_ENTRY="
## v$FULL_VERSION - 🔴 Not Started
$DESCRIPTION

| ID  | Feature                 | Description                              | Priority | Status |
|-----|-------------------------|------------------------------------------|----------|--------|
| F$NEXT_ID | Development Cycle    | $DESCRIPTION | High | 🔴 Not Started |
"

    echo "$BACKLOG_ENTRY" >> "$BACKLOG_FILE"
    echo "✅ Added to feature backlog as F$NEXT_ID"
  fi
fi

echo ""
echo "✅ Development cycle started:"
echo "   Semantic version: $SEMANTIC_VERSION"
echo "   Development version: $FULL_VERSION"
echo "   Suffix: $SUFFIX"
echo ""
echo "📝 Next steps:"
echo "   1. Run ':cody version build v$FULL_VERSION' to create Cody version"
echo "   2. Create beads issues for development work"
echo "   3. When ready for release: bun run version:release"