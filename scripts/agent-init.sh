#!/bin/bash

# Agent Initialization Script
# Checks for Cody Framework updates and provides AGENTS.md guidance

set -e

echo "🤖 Agent Initialization"
echo "======================"

# Check for Cody Framework updates
echo "📡 Checking for Cody Framework updates..."
UPDATE_CHECK=$(./.cody/config/scripts/upgrade-check.sh 2>/dev/null || echo '{"status":"error","message":"Could not check for updates"}')

if echo "$UPDATE_CHECK" | jq -e '.status == "update_available"' >/dev/null 2>&1; then
    LOCAL_VERSION=$(echo "$UPDATE_CHECK" | jq -r '.local_version')
    REMOTE_VERSION=$(echo "$UPDATE_CHECK" | jq -r '.remote_version')
    echo "⚠️  UPDATE AVAILABLE: Cody Framework $REMOTE_VERSION (current: $LOCAL_VERSION)"
    echo "   Run ':cody upgrade' to update"
    echo ""
elif echo "$UPDATE_CHECK" | jq -e '.status == "up_to_date"' >/dev/null 2>&1; then
    VERSION=$(echo "$UPDATE_CHECK" | jq -r '.local_version')
    echo "✅ Cody Framework is up to date (v$VERSION)"
    echo ""
else
    echo "⚠️  Could not check for framework updates"
    echo "   Manual check: ./.cody/config/scripts/upgrade-check.sh"
    echo ""
fi

# Check .cody health
echo "🏥 Checking .cody directory health..."
if [ -x "./scripts/check-cody-health.sh" ]; then
    if ./scripts/check-cody-health.sh >/dev/null 2>&1; then
        echo "✅ .cody directory is healthy"
    else
        echo "⚠️  .cody directory health issues detected"
        echo "   Run './scripts/check-cody-health.sh' for details"
    fi
else
    echo "ℹ️  Health check script not available"
fi
echo ""

# Display AGENTS.md key information
echo "📖 Agent Guidelines (from AGENTS.md)"
echo "==================================="
echo ""

# Extract key sections from AGENTS.md
if [ -f "AGENTS.md" ]; then
    echo "## Issue Tracking"
    grep -A 5 "## Issue Tracking with bd" AGENTS.md | head -7 | sed 's/^##/#/' | sed 's/^###/##/'
    echo ""

    echo "## .cody Access Rules"
    grep -A 3 "**STRICT RULE:" AGENTS.md | head -5
    echo ""

    echo "## Quick Commands"
    echo "- Check ready work: \`bd ready --json\`"
    echo "- Create issue: \`bd create \"title\" -t task -p 2 --json\`"
    echo "- Claim task: \`bd update bd-123 --status in_progress --json\`"
    echo "- Complete task: \`bd close bd-123 --reason \"Done\" --json\`"
    echo ""

    echo "## Available :cody Commands"
    grep "^- \`:cody" AGENTS.md | sed 's/^/- /'
    echo ""

    echo "📋 Full documentation: AGENTS.md"
else
    echo "⚠️  AGENTS.md not found!"
fi
echo ""

# Sync .skills submodule if present and feature enabled
echo "📦 Checking .skills submodule..."
if [ -f ".cody/config/scripts/feature-flags.sh" ]; then
    SKILLS_ENABLED=$("./.cody/config/scripts/feature-flags.sh" check skills_integration 2>/dev/null | grep -q "enabled" && echo "true" || echo "false")
else
    SKILLS_ENABLED="false"
fi

if [ "$SKILLS_ENABLED" = "true" ]; then
    if [ -f ".gitmodules" ] && grep -q "\.skills" .gitmodules; then
        echo "🔄 Syncing .skills submodule..."
        if git submodule update --depth 1 --remote .skills; then
            echo "✅ .skills submodule synced successfully"
        else
            echo "⚠️  Failed to sync .skills submodule"
            echo "   Run 'git submodule update --depth 1 --remote .skills' manually"
        fi
    else
        echo "ℹ️  .skills submodule not configured"
    fi
else
    echo "ℹ️  .skills integration is disabled"
    echo "   Enable with: ./.cody/config/scripts/feature-flags.sh enable skills_integration"
fi
echo ""

echo ""
echo "🚀 Ready to work! Use 'bd ready --json' to see available tasks."
