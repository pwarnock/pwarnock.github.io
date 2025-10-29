#!/bin/bash
# Initialize .letta/settings.json from template with actual project paths and metadata

set -e

echo "📝 Initializing Letta configuration..."

mkdir -p .letta

# Get the actual project root (current directory)
PROJECT_ROOT="$(pwd)"

# Get machine hostname
MACHINE_HOSTNAME="$(hostname)"

# Get current timestamp
SYNC_TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ -f ".letta/settings.json" ]; then
  echo "⚠️  .letta/settings.json already exists."
  echo ""
  echo "To regenerate with current paths:"
  echo "  rm .letta/settings.json && npm run letta:config:init"
  exit 0
fi

# Copy template and substitute placeholders
cp .letta.example/settings.json .letta/settings.json
sed -i.bak "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" .letta/settings.json
sed -i.bak "s|{{MACHINE_HOSTNAME}}|$MACHINE_HOSTNAME|g" .letta/settings.json
sed -i.bak "s|{{SYNC_TIMESTAMP}}|$SYNC_TIMESTAMP|g" .letta/settings.json
rm -f .letta/settings.json.bak

echo "✓ Created .letta/settings.json from template"
echo "✓ Substituted paths with: $PROJECT_ROOT"
echo "✓ Machine: $MACHINE_HOSTNAME"
echo "✓ Timestamp: $SYNC_TIMESTAMP"
echo ""
echo "Next steps:"
echo "  1. Get your project block ID: letta code (check output)"
echo "  2. Update 'localSharedBlockIds.project' in .letta/settings.json"
echo "  3. Commit to sync with Letta memory"
