#!/bin/bash

# Session Notes Helper for Agent Continuity
# Creates rich session notes linking context across agent sessions

set -e

SESSION_DIR=".beads/sessions"
SESSION_FILE="$SESSION_DIR/session-$(date +%Y%m%d-%H%M%S).md"
LATEST_LINK="$SESSION_DIR/latest.md"

# Create sessions directory
mkdir -p "$SESSION_DIR"

# Initialize session template
cat > "$SESSION_FILE" << 'EOF'
# Agent Session Notes

**Started**: $(date)  
**Agent**: Letta Code  
**Project**: pwarnock.github.io  
**Version**: v0.19.4  

## 🎯 Session Goal
[What is the primary objective of this session?]

## 🔄 Work Completed
[Tasks completed during this session - link to Beads issues]

### COMPLETED
- [ ] Task 1 (bd-XXX)
- [ ] Task 2 (bd-YYY)

## 🚧 Work In Progress
[Currently active work - link to Beads issues]

### IN PROGRESS
- [ ] Current task (bd-ZZZ) - [Status: __%]

## 📋 Next Session
[Work to continue in next agent session]

### NEXT
- [ ] Follow-up task 1 (depends on completed work)
- [ ] Follow-up task 2 (blocked items to resolve)

## 🔍 Context & Discoveries
[Important findings, blockers, or context for next session]

### DISCOVERED WORK
- New issue discovered: [title] - create as bd-XXX
- Dependency found: [what blocks what]

### BLOCKERS
- bd-XXX blocked on [reason]
- External dependency: [what's needed]

## 📊 Session Metrics
- **Issues Created**: 0
- **Issues Completed**: 0  
- **Issues In Progress**: 0
- **Dependencies Added**: 0
- **Session Duration**: [calculated on end]

## 🔗 Related Work
- Previous session: [link to previous session notes]
- Feature backlog: `.cody/project/build/feature-backlog.md`
- Active issues: `bd ready --json`

---
*Session end: $(date)*
EOF

# Create symbolic link to latest
ln -sf "$(basename "$SESSION_FILE")" "$LATEST_LINK"

echo "📝 Session notes created: $SESSION_FILE"
echo "🔗 Latest symlink: $LATEST_LINK"
echo ""
echo "## Quick Start for Next Session"
echo "1. Review: cat $LATEST_LINK"
echo "2. Check ready work: bd --no-daemon ready --json"
echo "3. Continue from 'IN PROGRESS' or 'NEXT' sections"
echo ""
echo "💡 Pro tip: Update this file as you work to maintain continuity"