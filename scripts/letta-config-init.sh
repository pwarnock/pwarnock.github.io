#!/bin/bash
# Initialize .letta/settings.json from template with actual project paths

set -e

echo "📝 Initializing Letta configuration..."

mkdir -p .letta

# Get the actual project root (current directory)
PROJECT_ROOT="$(pwd)"

if [ -f ".letta/settings.json" ]; then
  echo "⚠️  .letta/settings.json already exists."
  echo ""
  echo "To regenerate with current paths:"
  echo "  rm .letta/settings.json && npm run letta:config:init"
  exit 0
fi

# Copy template and substitute {{PROJECT_ROOT}} with actual path
cp .letta.example/settings.json .letta/settings.json
sed -i.bak "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" .letta/settings.json
rm -f .letta/settings.json.bak

echo "✓ Created .letta/settings.json from template"
echo "✓ Substituted paths with: $PROJECT_ROOT"
echo ""
echo "Next steps:"
echo "  1. Get your project block ID: letta code (check output)"
echo "  2. Update 'localSharedBlockIds.project' in .letta/settings.json"
echo "  3. Commit to sync with Letta memory"
