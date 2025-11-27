#!/bin/bash

# Validate link methodology in markdown content
# Enforces proper patterns and construction methods, not just outcomes

set -e

CONTENT_DIR="content/blog/posts"
TOOLS_DIR="content/tools"
ERRORS=0
WARNINGS=0

echo "🔍 Validating link methodology in blog posts..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# METHODOLOGY CHECKS - How links should be BUILT
# ============================================================================

# Enforce: Tool links MUST use {{< tool-link >}} shortcode
# Reason: Ensures absURL is applied, baseURL is used, no hardcoding
enforce_tool_link_shortcode() {
  local file="$1"
  local basename=$(basename $(dirname "$file"))
  
  # ERROR: Hardcoded peterwarnock.com in markdown (defeats baseURL configuration)
  if grep -q "https://peterwarnock\.com/tools/" "$file"; then
    echo -e "${RED}✗ $basename: HARDCODED DOMAIN DETECTED${NC}"
    echo "  Method: Direct URL instead of {{< tool-link >}}"
    grep -n "https://peterwarnock\.com/tools/" "$file" | sed 's/^/    Line /'
    echo "  Fix: Replace with {{< tool-link \"slug\" \"Text\" >}}"
    ERRORS=$((ERRORS + 1))
  fi
  
  # ERROR: Relative /tools/ links in markdown (not using shortcode layer)
  if grep -q "\[.*\]([/]tools/" "$file"; then
    echo -e "${RED}✗ $basename: MARKDOWN LINK INSTEAD OF SHORTCODE${NC}"
    grep -n "\[.*\]([/]tools/" "$file" | sed 's/^/    Line /'
    echo "  Fix: Use {{< tool-link \"slug\" \"Text\" >}} to leverage absURL"
    ERRORS=$((ERRORS + 1))
  fi
}

# Enforce: All tool-link references must point to existing tools
# Ensures shortcode has valid targets
validate_tool_link_targets() {
  local file="$1"
  local basename=$(basename $(dirname "$file"))
  
  while IFS= read -r line; do
    if [[ $line =~ tool-link\ \"([^\"]+)\" ]]; then
      local slug="${BASH_REMATCH[1]}"
      if [ ! -d "$TOOLS_DIR/$slug" ]; then
        echo -e "${RED}✗ $basename: INVALID TOOL REFERENCE${NC}"
        echo "  Method: {{< tool-link \"$slug\" >}}"
        echo "  Problem: Tool directory not found: $TOOLS_DIR/$slug"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done < <(grep -n "{{< tool-link" "$file")
}

# Enforce: Images use frontmatter (not hardcoded HTML img tags)
# Reason: Allows template layer to optimize, cache-bust, generate responsive imgs
enforce_image_frontmatter_pattern() {
  local file="$1"
  local dir=$(dirname "$file")
  local basename=$(basename "$dir")
  
  # ERROR: Hardcoded <img> tags instead of using frontmatter
  if grep -q "<img.*src=" "$file"; then
    echo -e "${RED}✗ $basename: HARDCODED IMG TAGS${NC}"
    grep -n "<img.*src=" "$file" | head -3 | sed 's/^/    Line /'
    echo "  Fix: Use 'image: filename' in frontmatter instead"
    ERRORS=$((ERRORS + 1))
  fi
  
  # WARNING: Missing image frontmatter (can't optimize/cache-bust)
  if ! grep -q "^image:" "$file"; then
    echo -e "${YELLOW}⚠ $basename: MISSING IMAGE FRONTMATTER${NC}"
    echo "  Current: No image field (template can't optimize)"
    echo "  Required: Add 'image: filename.png' to frontmatter"
    WARNINGS=$((WARNINGS + 1))
  else
    # Verify image file exists if local reference
    local image=$(grep "^image:" "$file" | head -1 | sed 's/^image: *//;s/[[:space:]]*$//')
    if [[ ! "$image" =~ ^https?:// ]] && [[ ! "$image" =~ ^/ ]]; then
      if [ ! -f "$dir/$image" ]; then
        echo -e "${RED}✗ $basename: IMAGE FILE MISSING${NC}"
        echo "  Frontmatter: image: $image"
        echo "  Expected: $dir/$image"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  fi
}

# Enforce: External links use proper URL format
# Reason: Ensures SEO crawlability and proper target handling
enforce_external_link_format() {
  local file="$1"
  local basename=$(basename $(dirname "$file"))
  
  # Check for protocol-relative URLs (should be https://)
  if grep -q "\[.*\](//[^/]" "$file"; then
    echo -e "${YELLOW}⚠ $basename: PROTOCOL-RELATIVE URLS${NC}"
    grep -n "\[.*\](//[^/]" "$file" | sed 's/^/    Line /'
    echo "  Use: https:// instead of //"
    WARNINGS=$((WARNINGS + 1))
  fi
}

# Validate: Shortcode syntax is correct
# Ensures Hugo processes them properly
validate_shortcode_syntax() {
  local file="$1"
  local basename=$(basename $(dirname "$file"))
  
  # Check for malformed shortcode calls - simple pattern check
  while IFS= read -r line; do
    # tool-link should have exactly 2 parameters: slug and text
    if grep -q "tool-link" <<< "$line"; then
      # Check if it follows pattern: {{< tool-link "slug" "text" >}}
      if grep -qE '{{<\s+tool-link\s+"[^"]+"\s+"[^"]+"\s+>}}' <<< "$line"; then
        : # Valid format
      else
        echo -e "${RED}✗ $basename: INVALID SHORTCODE SYNTAX${NC}"
        echo "  Format: {{< tool-link \"slug\" \"Display Text\" >}}"
        grep -n "tool-link" "$file" | sed 's/^/    Line /'
        ERRORS=$((ERRORS + 1))
        return
      fi
    fi
  done < <(grep "tool-link" "$file")
}

# Main validation loop
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
validated=0
for post_dir in "$CONTENT_DIR"/*; do
  if [ -d "$post_dir" ]; then
    post_file="$post_dir/index.md"
    if [ -f "$post_file" ]; then
      validated=$((validated + 1))
      enforce_tool_link_shortcode "$post_file"
      validate_tool_link_targets "$post_file"
      enforce_image_frontmatter_pattern "$post_file"
      enforce_external_link_format "$post_file"
      validate_shortcode_syntax "$post_file"
    fi
  fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 LINK METHODOLOGY VALIDATION RESULTS"
echo "======================================="
echo ""
echo "Posts scanned:     $validated"
echo "Errors found:      $ERRORS"
echo "Warnings found:    $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All link patterns enforce baseURL configuration${NC}"
  echo "✓ Tool links using {{< tool-link >}} shortcode"
  echo "✓ Images using frontmatter pattern"
  exit 0
else
  echo -e "${RED}✗ Link methodology validation failed${NC}"
  echo ""
  echo "Key patterns to enforce:"
  echo "  • Tool links: {{< tool-link \"slug\" \"Text\" >}}"
  echo "  • Images: Use frontmatter 'image:' field"
  echo "  • No hardcoded domains in markdown"
  echo "  • All links constructed via Hugo variables"
  exit 1
fi
