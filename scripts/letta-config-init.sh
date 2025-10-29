#!/bin/bash
# Initialize .letta/settings.json from template

set -e

echo "📝 Initializing Letta configuration..."

mkdir -p .letta

if [ -f ".letta/settings.json" ]; then
  echo "⚠️  .letta/settings.json already exists. Skipping."
  echo ""
  echo "To update from template:"
  echo "  cp .letta.example/settings.json .letta/settings.json"
  exit 0
fi

# Copy template
cp .letta.example/settings.json .letta/settings.json

echo "✓ Created .letta/settings.json from template"
echo ""
echo "Next steps:"
echo "  1. Edit .letta/settings.json with your local paths"
echo "  2. Get your project block ID: letta code (check output)"
echo "  3. Update 'localSharedBlockIds.project' value"
echo "  4. Commit to sync with Letta memory"
