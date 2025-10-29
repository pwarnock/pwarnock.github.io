#!/bin/bash
# Diff Letta config against schema and prompt for updates

set -e

SCHEMA_FILE=".letta.schema.json"
CONFIG_FILE=".letta/settings.json"
TEMPLATE_FILE=".letta.example/settings.json"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ Schema file not found: $SCHEMA_FILE"
  exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "⚠️  Config file not found: $CONFIG_FILE"
  echo "Run: npm run letta:config:init"
  exit 1
fi

# Extract schema version
SCHEMA_VERSION=$(jq -r '.version' "$SCHEMA_FILE" 2>/dev/null || echo "unknown")
CONFIG_VERSION=$(jq -r '.metadata.version' "$CONFIG_FILE" 2>/dev/null || echo "unknown")

echo "📋 Letta Configuration Update Check"
echo "Schema version: $SCHEMA_VERSION"
echo "Config version: $CONFIG_VERSION"
echo ""

# Check for new top-level properties in schema
echo "Checking for schema changes..."

SCHEMA_KEYS=$(jq -r '.properties | keys[]' "$SCHEMA_FILE" | sort)
CONFIG_KEYS=$(jq -r 'keys[]' "$CONFIG_FILE" | sort)

# Find missing keys
MISSING_KEYS=$(comm -23 <(echo "$SCHEMA_KEYS") <(echo "$CONFIG_KEYS") || echo "")

if [ -z "$MISSING_KEYS" ]; then
  echo "✓ Config is up to date with schema"
  exit 0
fi

echo ""
echo "⚠️  New properties available:"
echo "$MISSING_KEYS" | sed 's/^/  - /'
echo ""

# Show what new properties would look like from template
echo "Preview of new template:"
echo ""
echo "New fields from template:"
jq --arg key "$(echo "$MISSING_KEYS" | head -1)" '.[$key]' "$TEMPLATE_FILE" 2>/dev/null || jq '.' "$TEMPLATE_FILE" | head -20

echo ""
echo "Update options:"
echo "  1. Auto-merge new properties: npm run letta:config:update -- --merge"
echo "  2. Review and accept manually: npm run letta:config:update -- --review"
echo "  3. Skip for now"
echo ""
echo "Run with --merge or --review flag to proceed, or nothing to skip."
