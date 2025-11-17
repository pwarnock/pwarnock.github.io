#!/bin/bash

##############################################################################
# Release Management Script
#
# Handles pre-release (-rc.N) and post-release tagging
# Usage:
#   ./scripts/release.sh pre    # Create pre-release tag (v0.17.1-rc.1)
#   ./scripts/release.sh post   # Create post-release tag (v0.17.1)
#   ./scripts/release.sh check  # Check current release status
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get current version from hugo.toml
get_current_version() {
  grep "version = " hugo.toml | head -1 | sed 's/.*version = "\(.*\)".*/\1/'
}

# Get latest RC number for current version
get_latest_rc_number() {
  local version=$1
  git tag -l "${version}-rc.*" 2>/dev/null | sed "s/.*-rc\.\([0-9]*\).*/\1/" | sort -n | tail -1
}

# Get latest release tag
get_latest_release_tag() {
  git describe --tags --match "v*" --abbrev=0 2>/dev/null || echo "none"
}

# Check if version is already released
is_version_released() {
  local version=$1
  git tag -l "v${version}" 2>/dev/null | grep -q "v${version}"
}

# Create pre-release tag (RC)
create_prerelease() {
  local version=$(get_current_version)
  local rc_num=$(get_latest_rc_number "v${version}")
  rc_num=$((${rc_num:-0} + 1))
  local rc_tag="v${version}-rc.${rc_num}"

  echo -e "${BLUE}Creating pre-release tag...${NC}"
  echo "Version: ${version}"
  echo "RC Tag: ${rc_tag}"

  # Check if final release already exists
  if is_version_released "$version"; then
    echo -e "${RED}❌ Version v${version} is already released!${NC}"
    echo "Cannot create RC for a released version."
    exit 1
  fi

  # Create annotated tag
  git tag -a "${rc_tag}" -m "Release Candidate: ${rc_tag}

Version: ${version}
RC Number: ${rc_num}
Branch: $(git rev-parse --abbrev-ref HEAD)
Commit: $(git rev-parse --short HEAD)

Ready for testing before production release."

  echo -e "${GREEN}✅ Created ${rc_tag}${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Push tag: FORCE_PUSH=yes git push upstream ${rc_tag}"
  echo "  2. Test in staging environment"
  echo "  3. Run: ./scripts/release.sh post (after successful testing)"
}

# Create post-release tag (production)
create_postrelease() {
  local version=$(get_current_version)
  local release_tag="v${version}"

  echo -e "${BLUE}Creating production release tag...${NC}"
  echo "Version: ${version}"
  echo "Release Tag: ${release_tag}"

  # Check if already released
  if is_version_released "$version"; then
    echo -e "${RED}❌ Version ${release_tag} is already released!${NC}"
    exit 1
  fi

  # Check for RC tags
  local rc_tags=$(git tag -l "${release_tag}-rc.*" 2>/dev/null | wc -l)
  if [ "$rc_tags" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No RC tags found for this version${NC}"
    read -p "Create release without RC testing? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Cancelled."
      exit 1
    fi
  fi

  # Get commit stats
  local last_tag=$(git tag -l "v*" --sort=-version:refname | head -1)
  local commit_count=$(git rev-list --count "${last_tag}..HEAD" 2>/dev/null || echo "unknown")

  # Create annotated tag
  git tag -a "${release_tag}" -m "Release: ${release_tag}

Version: ${version}
Branch: $(git rev-parse --abbrev-ref HEAD)
Commit: $(git rev-parse --short HEAD)
Commits since last release: ${commit_count}

Production release. Deployed to peterwarnock.com"

  echo -e "${GREEN}✅ Created ${release_tag}${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Push tag: FORCE_PUSH=yes git push upstream ${release_tag}"
  echo "  2. Create GitHub Release from tag"
  echo "  3. Archive release notes"
}

# Check current release status
check_status() {
  local version=$(get_current_version)
  local release_tag="v${version}"
  local latest_tag=$(get_latest_release_tag)

  echo -e "${BLUE}Release Status${NC}"
  echo "═══════════════════════════════════════"
  echo "Current version: ${version}"
  echo "Latest release tag: ${latest_tag}"
  echo ""

  if is_version_released "$version"; then
    echo -e "${GREEN}✅ v${version} is RELEASED${NC}"
  else
    local rc_tags=$(git tag -l "v${version}-rc.*" 2>/dev/null)
    if [ -z "$rc_tags" ]; then
      echo -e "${YELLOW}⚠️  v${version} is NOT RELEASED (no RC tags)${NC}"
      echo "Run: ./scripts/release.sh pre"
    else
      echo -e "${YELLOW}⚠️  v${version} is IN RC (pending release)${NC}"
      echo "RC tags: $rc_tags"
      echo "Run: ./scripts/release.sh post"
    fi
  fi
  echo ""
  echo "Recent tags:"
  git tag -l "v*" --sort=-version:refname | head -5 | sed 's/^/  /'
}

# Main
case "${1:-check}" in
  pre)
    create_prerelease
    ;;
  post)
    create_postrelease
    ;;
  check|status)
    check_status
    ;;
  *)
    echo "Usage: ./scripts/release.sh [pre|post|check]"
    echo ""
    echo "  pre   - Create pre-release tag (RC)"
    echo "  post  - Create production release tag"
    echo "  check - Check release status"
    exit 1
    ;;
esac
