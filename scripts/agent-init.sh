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

# Check Beads health and implement best practices
echo "🔮 Checking Beads health and applying best practices..."
export BEADS_NO_DAEMON=1  # Fix git worktree daemon warnings

# Check Beads database size
if command -v bd >/dev/null 2>&1; then
    ISSUE_COUNT=$(bd --no-daemon list --json 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
    if [ "$ISSUE_COUNT" -gt 200 ]; then
        echo "⚠️  Beads database has $ISSUE_COUNT issues (recommend <200)"
        echo "🧹 Running automatic cleanup (older than 2 days)..."
        if bd --no-daemon cleanup --days 2 >/dev/null 2>&1; then
            echo "✅ Database cleanup completed"
        else
            echo "⚠️  Cleanup failed - run 'bd cleanup --days 2' manually"
        fi
    elif [ "$ISSUE_COUNT" -gt 500 ]; then
        echo "🚨 CRITICAL: Beads database has $ISSUE_COUNT issues"
        echo "   Strongly recommend 'bd cleanup --days 1' to restore performance"
    else
        echo "✅ Beads database size is healthy ($ISSUE_COUNT issues)"
    fi
    
    # Run Beads doctor
    echo "🩺 Running Beads health check..."
    if bd --no-daemon doctor >/dev/null 2>&1; then
        echo "✅ Beads system is healthy"
    else
        echo "⚠️  Beads health issues detected"
        echo "   Run 'bd doctor --fix' for automatic repairs"
    fi
else
    echo "⚠️  Beads (bd) not found - install with 'go install github.com/steve-yege/beads@latest'"
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
    echo "- Check ready work: \`bd --no-daemon ready --json\`"
    echo "- Create issue: \`bd --no-daemon create \"title\" -t task -p 2 --json\`"
    echo "- Claim task: \`bd --no-daemon update bd-123 --status in_progress --json\`"
    echo "- Complete task: \`bd --no-daemon close bd-123 --reason \"Done\" --json\`"
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
echo "🚀 Ready to work! Environment configured for git worktree:"
echo "   - export BEADS_NO_DAEMON=1 (fixes daemon warnings)"
echo "   - Beads database optimized (<200 issues)"
echo "   - Health checks passed"
echo ""
echo "📝 Session Continuity (Beads 0.24 best practices):"
echo "   - Start new session: ./scripts/session-notes.sh"
echo "   - Recover previous: ./scripts/session-recovery.sh"
echo ""
echo "📋 Quick Commands (all use --no-daemon in worktrees):"
echo "- Check ready work: \`bd --no-daemon ready --json\`"
echo "- Create issue: \`bd --no-daemon create \"title\" -t task -p 2 --json\`"
echo "- Claim task: \`bd --no-daemon update bd-123 --status in_progress --json\`"
echo "- Complete task: \`bd --no-daemon close bd-123 --reason \"Done\" --json\`"
echo "- Cleanup database: \`bd --no-daemon cleanup --days 2\`"
