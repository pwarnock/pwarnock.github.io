#!/bin/bash

# Session Recovery Helper for Agent Continuity
# Restores context from previous agent sessions

set -e

SESSION_DIR=".beads/sessions"
LATEST_LINK="$SESSION_DIR/latest.md"

if [ ! -L "$LATEST_LINK" ]; then
    echo "ℹ️  No previous session found"
    echo "   Start fresh: ./scripts/session-notes.sh"
    echo "   Check ready work: bd --no-daemon ready --json"
    exit 0
fi

LATEST_SESSION=$(readlink "$LATEST_SESSION")
if [ ! -f "$SESSION_DIR/$LATEST_SESSION" ]; then
    echo "⚠️  Session link broken: $LATEST_LINK -> $LATEST_SESSION"
    echo "   Start new session: ./scripts/session-notes.sh"
    exit 1
fi

echo "📂 Previous Session Recovery"
echo "=========================="
echo ""

# Extract key sections from latest session
if grep -q "## 🎯 Session Goal" "$SESSION_DIR/$LATEST_SESSION"; then
    echo "## Previous Session Goal"
    grep -A 3 "## 🎯 Session Goal" "$SESSION_DIR/$LATEST_SESSION" | grep -v "## 🎯" | sed 's/^/  /'
    echo ""
fi

if grep -q "## 🔄 Work Completed" "$SESSION_DIR/$LATEST_SESSION"; then
    echo "## Recently Completed"
    grep -A 10 "## 🔄 Work Completed" "$SESSION_DIR/$LATEST_SESSION" | grep -E "^\s*- \[x\]" | sed 's/^/  /'
    echo ""
fi

if grep -q "## 🚧 Work In Progress" "$SESSION_DIR/$LATEST_SESSION"; then
    echo "## Still In Progress"
    grep -A 10 "## 🚧 Work In Progress" "$SESSION_DIR/$LATEST_SESSION" | grep -E "^\s*- \[ \]" | sed 's/^/  /'
    echo ""
fi

if grep -q "## 📋 Next Session" "$SESSION_DIR/$LATEST_SESSION"; then
    echo "## Next Session Tasks"
    grep -A 10 "## 📋 Next Session" "$SESSION_DIR/$LATEST_SESSION" | grep -E "^\s*- \[ \]" | sed 's/^/  /'
    echo ""
fi

if grep -q "## 🔍 Context & Discoveries" "$SESSION_DIR/$LATEST_SESSION"; then
    echo "## Context & Discoveries"
    grep -A 20 "## 🔍 Context & Discoveries" "$SESSION_DIR/$LATEST_SESSION" | sed 's/^/  /'
    echo ""
fi

echo "## Current Status Check"
echo "===================="

# Check current Beads status
if command -v bd >/dev/null 2>&1; then
    export BEADS_NO_DAEMON=1
    echo "📊 Current Beads issues:"
    bd --no-daemon list --status in_progress --json 2>/dev/null | jq -r '.[] | "  - \(.id): \(..title) (\(.status))"' | head -5
    echo ""
    echo "🔍 Ready to work on:"
    bd --no-daemon ready --json 2>/dev/null | jq -r '.[] | "  - \(.id): \(.title) (priority: \(.priority))"' | head -5
else
    echo "⚠️  Beads (bd) not found"
fi

echo ""
echo "## Quick Actions"
echo "=============="
echo "📝 Review full session: cat $LATEST_LINK"
echo "🔄 Continue session: ./scripts/session-notes.sh"
echo "📋 Check ready work: bd --no-daemon ready --json"
echo "🩺 Check health: bd --no-daemon doctor"