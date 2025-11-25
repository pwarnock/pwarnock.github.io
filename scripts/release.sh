#!/bin/bash
set -euo pipefail

###############################################################################
# Self-Enforcing Release Process Client
# Usage: ./scripts/release.sh [rc|final|hotfix] [--description "text"] [--bead ID]
#
# This script creates a declarative release request that GitHub Actions will
# process. It is the ONLY supported way to initiate a release.
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RELEASE_REQUEST_FILE="$REPO_ROOT/.release/request.json"
RELEASE_DIR="$(dirname "$RELEASE_REQUEST_FILE")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
RELEASE_TYPE=""
DESCRIPTION=""
BEAD_ID=""
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_SHA=$(git rev-parse HEAD)
REQUESTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REQUESTED_BY=$(git config user.email || echo "unknown")

###############################################################################
# Functions
###############################################################################

print_header() {
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
  exit 1
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

usage() {
  cat <<EOF
${BLUE}Self-Enforcing Release Process${NC}

${YELLOW}Usage:${NC}
  ./scripts/release.sh [TYPE] [OPTIONS]

${YELLOW}Types:${NC}
  rc      - Create release candidate (pre-release testing)
  final   - Promote RC to production release
  hotfix  - Emergency patch from current production

${YELLOW}Options:${NC}
  --description TEXT    Release summary (required for final/hotfix)
  --bead ID            Link to beads issue (optional)
  --dry-run            Show what would happen (don't commit/push)
  --help               Show this message

${YELLOW}Examples:${NC}
  # Create RC for testing
  ./scripts/release.sh rc --description "Q3 features and bug fixes"

  # Promote RC to production
  ./scripts/release.sh final --bead pw-701

  # Emergency hotfix
  ./scripts/release.sh hotfix --description "Security patch for CVE-2025-1234"

${YELLOW}Process:${NC}
  1. Script validates working tree and branch
  2. Creates .release/request.json with release intent
  3. Commits request to git
  4. Pushes to remote (triggers GitHub Actions)
  5. GitHub Actions validates, bumps version, creates tag, deploys

${YELLOW}Full Documentation:${NC}
  See docs/architecture/SELF_ENFORCING_RELEASE_PROCESS.md
EOF
  exit "${1:-0}"
}

check_prerequisites() {
  print_info "Checking prerequisites..."

  # Check git
  if ! command -v git &>/dev/null; then
    print_error "git not found in PATH"
  fi

  # Check working tree is clean
  if ! git diff-index --quiet HEAD --; then
    print_error "Working tree has uncommitted changes. Commit or stash them first."
  fi

  # Check we're on a valid branch
  if [[ "$CURRENT_BRANCH" == "HEAD" ]]; then
    print_error "Detached HEAD. Check out a branch first."
  fi

  print_success "Prerequisites OK"
}

validate_branch_for_release() {
  local release_type="$1"

  case "$release_type" in
    rc)
      # RC can come from any branch
      print_info "Release candidate can be created from any branch"
      ;;
    final)
      # Final should be from main or a release branch
      if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "release/"* ]]; then
        print_warning "Final releases typically come from 'main' or 'release/*' branches"
        print_warning "You are on '$CURRENT_BRANCH'"
        read -p "Continue anyway? (yes/no): " confirm
        if [[ "$confirm" != "yes" ]]; then
          print_error "Release cancelled"
        fi
      fi
      ;;
    hotfix)
      # Hotfix comes from production or a hotfix branch
      if [[ "$CURRENT_BRANCH" != "production" && "$CURRENT_BRANCH" != "hotfix/"* ]]; then
        print_warning "Hotfix releases should come from 'production' or 'hotfix/*' branches"
        print_warning "You are on '$CURRENT_BRANCH'"
        read -p "Continue anyway? (yes/no): " confirm
        if [[ "$confirm" != "yes" ]]; then
          print_error "Release cancelled"
        fi
      fi
      ;;
  esac
}

prompt_for_description() {
  local release_type="$1"

  if [[ -z "$DESCRIPTION" ]]; then
    case "$release_type" in
      rc)
        print_info "Release candidate - brief description of RC scope (optional)"
        ;;
      final)
        print_info "Final release - what's in this release? (required)"
        ;;
      hotfix)
        print_info "Hotfix - why is this needed? (required)"
        ;;
    esac

    if [[ "$release_type" == "final" || "$release_type" == "hotfix" ]]; then
      read -p "Description: " DESCRIPTION
      if [[ -z "$DESCRIPTION" ]]; then
        print_error "Description required for $release_type releases"
      fi
    else
      read -p "Description (optional): " DESCRIPTION
    fi
  fi
}

prompt_for_bead() {
  if [[ -z "$BEAD_ID" ]]; then
    print_info "Link to beads issue? (optional, format: pw-NNN)"
    read -p "Beads ID: " BEAD_ID

    if [[ -n "$BEAD_ID" ]]; then
      # Validate format
      if ! [[ "$BEAD_ID" =~ ^pw-[a-z0-9]+$ ]]; then
        print_error "Invalid beads ID format. Use 'pw-NNN' (e.g., pw-701)"
      fi
    fi
  fi
}

create_release_request() {
  local release_type="$1"

  # Create .release directory if it doesn't exist
  mkdir -p "$RELEASE_DIR"

  # Build JSON object
  local json_payload='{
    "type": "'$release_type'",
    "targetBranch": "'$CURRENT_BRANCH'",
    "currentSha": "'$CURRENT_SHA'",
    "requestedBy": "'$REQUESTED_BY'",
    "requestedAt": "'$REQUESTED_AT'",
    "status": "pending"'

  if [[ -n "$DESCRIPTION" ]]; then
    json_payload="$json_payload"',
    "description": "'"$(echo "$DESCRIPTION" | sed 's/"/\\"/g')"'"'
  fi

  if [[ -n "$BEAD_ID" ]]; then
    json_payload="$json_payload"',
    "beadId": "'$BEAD_ID'"'
  fi

  json_payload="$json_payload"'
  }'

  # Write to file
  echo "$json_payload" | jq '.' > "$RELEASE_REQUEST_FILE"

  print_success "Release request created at $RELEASE_REQUEST_FILE"
}

show_release_request() {
  echo ""
  print_info "Release Request Details:"
  echo ""
  jq '.' "$RELEASE_REQUEST_FILE" | sed 's/^/  /'
  echo ""
}

commit_and_push() {
  local release_type="$1"
  local commit_msg="release: create $release_type release request"

  if [[ "$CURRENT_BRANCH" == "main" ]]; then
    # Direct commit to main
    print_info "Committing release request directly to main..."
    git add "$RELEASE_REQUEST_FILE"
    git commit -m "$commit_msg"
    git push origin "$CURRENT_BRANCH"
  else
    # Create a feature branch and PR
    local feature_branch="release/$release_type/$(date +%s)"
    print_info "Creating feature branch: $feature_branch"
    git checkout -b "$feature_branch"
    git add "$RELEASE_REQUEST_FILE"
    git commit -m "$commit_msg"
    git push origin "$feature_branch"

    print_success "Feature branch pushed"
    print_info "Create a PR to main to initiate release"
  fi
}

###############################################################################
# Main Script
###############################################################################

main() {
  # Parse arguments
  if [[ $# -eq 0 ]]; then
    usage
  fi

  RELEASE_TYPE="$1"
  shift || true

  # Parse optional arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --description)
        DESCRIPTION="$2"
        shift 2
        ;;
      --bead)
        BEAD_ID="$2"
        shift 2
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --help)
        usage 0
        ;;
      *)
        print_error "Unknown option: $1"
        ;;
    esac
  done

  # Validate release type
  if ! [[ "$RELEASE_TYPE" =~ ^(rc|final|hotfix)$ ]]; then
    print_error "Release type must be 'rc', 'final', or 'hotfix'"
  fi

  print_header "Self-Enforcing Release Process - Phase 0-1"

  check_prerequisites
  validate_branch_for_release "$RELEASE_TYPE"
  prompt_for_description "$RELEASE_TYPE"
  prompt_for_bead
  create_release_request "$RELEASE_TYPE"
  show_release_request

  # Show next steps
  echo ""
  print_info "Next Steps:"
  echo "  1. Review the release request above"
  echo "  2. Push to GitHub (releases are processed by GitHub Actions)"
  echo "  3. GitHub Actions will validate, bump version, and deploy"
  echo ""

  if [[ "${DRY_RUN:-false}" == "true" ]]; then
    print_warning "DRY RUN: Not pushing to remote"
    exit 0
  fi

  # Confirm push
  read -p "Proceed with commit and push? (yes/no): " confirm
  if [[ "$confirm" != "yes" ]]; then
    print_error "Release cancelled"
  fi

  commit_and_push "$RELEASE_TYPE"

  print_success "Release request submitted!"
  print_info "Monitor GitHub Actions for build status"
  echo ""
}

main "$@"
