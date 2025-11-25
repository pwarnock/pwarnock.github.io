#!/bin/bash

################################################################################
# Beads Monthly Hygiene Procedure
# 
# Performs monthly maintenance on beads database:
# - Health check
# - Archive closed issues older than 14 days
# - Generate status report
# - Sync changes to git
#
# Usage: ./scripts/beads-monthly-hygiene.sh
# Recommended: Run on first Monday of each month at 9 AM
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_DATE=$(date +%Y-%m-%d)
ARCHIVE_MONTH=$(date +%Y-%m)

echo -e "${BLUE}🧹 BEADS MONTHLY HYGIENE PROCEDURE${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""
echo "Date: $ARCHIVE_DATE"
echo "Repository: $REPO_ROOT"
echo ""

# Step 1: Health Check
echo -e "${YELLOW}Step 1: Running database health check...${NC}"
if bd doctor; then
    echo -e "${GREEN}✅ Database health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Database has issues - check output above${NC}"
fi
echo ""

# Step 2: Create Archive
echo -e "${YELLOW}Step 2: Creating monthly archive...${NC}"
mkdir -p "$REPO_ROOT/.beads/archive"
ARCHIVE_FILE="$REPO_ROOT/.beads/archive/issues-${ARCHIVE_DATE}.json"

if [ -f "$REPO_ROOT/.beads/issues.jsonl" ]; then
    # Convert JSONL to JSON array for cleaner storage
    echo -e "${BLUE}Converting issues.jsonl to archive format...${NC}"
    jq -s '.' "$REPO_ROOT/.beads/issues.jsonl" > "$ARCHIVE_FILE" || {
        # Fallback: simple copy if jq not available
        cp "$REPO_ROOT/.beads/issues.jsonl" "$ARCHIVE_FILE"
    }
    echo -e "${GREEN}✅ Archive created: $ARCHIVE_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  No issues.jsonl found${NC}"
fi
echo ""

# Step 3: Cleanup old closed issues
echo -e "${YELLOW}Step 3: Cleaning up closed issues older than 14 days...${NC}"
if command -v bd &> /dev/null; then
    # Get count before
    BEFORE=$(bd list --json 2>/dev/null | jq 'length' || echo "unknown")
    
    # Run cleanup
    bd cleanup --older-than 14d || echo "⚠️  Cleanup skipped or no old issues"
    
    # Get count after
    AFTER=$(bd list --json 2>/dev/null | jq 'length' || echo "unknown")
    
    echo -e "${GREEN}✅ Cleanup complete (before: $BEFORE, after: $AFTER)${NC}"
else
    echo -e "${YELLOW}⚠️  beads CLI not found - skipping cleanup${NC}"
fi
echo ""

# Step 4: Generate Status Report
echo -e "${YELLOW}Step 4: Generating status report...${NC}"
REPORT_FILE="$REPO_ROOT/.beads/reports/status-${ARCHIVE_DATE}.json"
mkdir -p "$REPO_ROOT/.beads/reports"

if command -v bd &> /dev/null; then
    bd status --json > "$REPORT_FILE" 2>/dev/null || echo "{}" > "$REPORT_FILE"
    echo -e "${GREEN}✅ Status report: $REPORT_FILE${NC}"
    
    # Display summary
    echo ""
    echo "Summary:"
    jq '.summary' "$REPORT_FILE" 2>/dev/null | sed 's/^/  /'
else
    echo -e "${YELLOW}⚠️  beads CLI not found - skipping report${NC}"
fi
echo ""

# Step 5: Commit Changes
echo -e "${YELLOW}Step 5: Committing changes to git...${NC}"
cd "$REPO_ROOT"

if git diff --quiet .beads/ 2>/dev/null; then
    echo -e "${YELLOW}ℹ️  No changes to commit${NC}"
else
    git add .beads/
    git commit -m "chore: beads monthly hygiene and archival ($ARCHIVE_DATE)" || {
        echo -e "${YELLOW}⚠️  Commit failed - changes may already be staged${NC}"
    }
    echo -e "${GREEN}✅ Changes committed${NC}"
fi
echo ""

# Step 6: Summary
echo -e "${BLUE}SUMMARY${NC}"
echo -e "${BLUE}=======${NC}"
if command -v bd &> /dev/null; then
    bd status --json | jq '.summary' | sed 's/^/  /'
else
    echo "  (beads CLI not available for summary)"
fi
echo ""
echo -e "${GREEN}✅ Monthly hygiene procedure complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review status report: $REPORT_FILE"
echo "  2. Check git log: git log -1 --oneline"
echo "  3. Verify sync: git status .beads/"
echo ""
