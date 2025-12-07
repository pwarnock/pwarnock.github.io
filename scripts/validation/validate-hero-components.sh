#!/bin/bash

# Hero Component Validation Script
# Ensures all hero components follow the standardized patterns

set -e

HERO_DIR="layouts/partials/components"
VALIDATION_ERRORS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Validating hero component standards...${NC}"

# Function to check forbidden patterns
check_forbidden_patterns() {
    local file=$1
    local errors=0
    
    # Check for forbidden background classes
    if grep -q "bg-base-" "$file"; then
        echo -e "${RED}❌ $file: Contains forbidden bg-base-* classes${NC}"
        errors=$((errors + 1))
    fi
    
    # Check for forbidden badge-primary in date badges
    if grep -q "badge-primary" "$file"; then
        echo -e "${RED}❌ $file: Contains forbidden badge-primary (use bg-primary/10)${NC}"
        errors=$((errors + 1))
    fi
    
    # Check for custom font sizes (should use text-4xl lg:text-5xl)
    if grep -q "font-size:" "$file"; then
        echo -e "${RED}❌ $file: Contains custom font-size (use text-4xl lg:text-5xl)${NC}"
        errors=$((errors + 1))
    fi
    
    # Check for missing required hero-content structure
    if ! grep -q "hero-content flex-col lg:flex-row gap-8" "$file"; then
        echo -e "${RED}❌ $file: Missing required hero-content structure${NC}"
        errors=$((errors + 1))
    fi
    
    # Check for missing required text-primary-content
    if ! grep -q "text-primary-content" "$file"; then
        echo -e "${RED}❌ $file: Missing required text-primary-content classes${NC}"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# Function to check required patterns
check_required_patterns() {
    local file=$1
    local errors=0
    
    # Check for required heading structure
    if ! grep -q "text-4xl lg:text-5xl" "$file"; then
        echo -e "${RED}❌ $file: Missing required text-4xl lg:text-5xl classes${NC}"
        errors=$((errors + 1))
    fi
    
    # Check for required inner div structure
    if ! grep -q "text-center lg:text-left max-w-4xl" "$file"; then
        echo -e "${RED}❌ $file: Missing required inner div structure${NC}"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# Validate all hero components
for hero_file in "$HERO_DIR"/hero-*.html; do
    if [ -f "$hero_file" ]; then
        echo -e "${YELLOW}Checking: $(basename "$hero_file")${NC}"
        
        check_forbidden_patterns "$hero_file"
        errors=$?
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + errors))
        
        check_required_patterns "$hero_file"
        errors=$?
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + errors))
        
        if [ $errors -eq 0 ]; then
            echo -e "${GREEN}✅ $(basename "$hero_file"): Passed validation${NC}"
        fi
    fi
done

# Summary
echo ""
if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All hero components passed validation!${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed with $VALIDATION_ERRORS error(s)${NC}"
    echo -e "${YELLOW}Please fix the above issues before committing.${NC}"
    exit 1
fi