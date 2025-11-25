#!/bin/bash

# Feature Flag Management Script
# Provides commands to check and toggle Cody Framework features

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS_FILE="$SCRIPT_DIR/../settings.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if feature exists
feature_exists() {
    local feature=$1
    jq -e ".features.${feature}" "$SETTINGS_FILE" >/dev/null 2>&1
}

# Function to check if feature is enabled
feature_enabled() {
    local feature=$1
    jq -r ".features.${feature}.enabled" "$SETTINGS_FILE" 2>/dev/null
}

# Function to get feature description
feature_description() {
    local feature=$1
    jq -r ".features.${feature}.description" "$SETTINGS_FILE" 2>/dev/null
}

# Function to list all features
list_features() {
    echo -e "${BLUE}🎛️  Cody Framework Feature Flags${NC}"
    echo "================================"
    
    if ! jq -e '.features' "$SETTINGS_FILE" >/dev/null 2>&1; then
        echo -e "${YELLOW}No features configured${NC}"
        return
    fi
    
    jq -r '.features | to_entries[] | "\(.key): \(.value.enabled)"' "$SETTINGS_FILE" | while read -r line; do
        feature=$(echo "$line" | cut -d: -f1)
        status=$(echo "$line" | cut -d: -f2)
        description=$(feature_description "$feature")
        
        if [ "$status" = "true" ]; then
            status_icon="✅"
            status_color="${GREEN}"
        else
            status_icon="❌"
            status_color="${RED}"
        fi
        
        echo -e "${status_icon} ${feature}: ${status_color}${status}${NC}"
        [ "$description" != "null" ] && echo -e "   ${description}"
        echo ""
    done
}

# Function to enable/disable feature
set_feature() {
    local feature=$1
    local enabled=$2
    
    if ! feature_exists "$feature"; then
        echo -e "${RED}Error: Feature '$feature' does not exist${NC}"
        return 1
    fi
    
    local temp_file=$(mktemp)
    jq ".features.${feature}.enabled = $enabled" "$SETTINGS_FILE" > "$temp_file"
    mv "$temp_file" "$SETTINGS_FILE"
    
    if [ "$enabled" = "true" ]; then
        echo -e "${GREEN}✅ Feature '$feature' enabled${NC}"
    else
        echo -e "${YELLOW}❌ Feature '$feature' disabled${NC}"
    fi
}

# Main command handling
case "${1:-list}" in
    "list"|"")
        list_features
        ;;
    "enable")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 enable <feature_name>${NC}"
            exit 1
        fi
        set_feature "$2" true
        ;;
    "disable")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 disable <feature_name>${NC}"
            exit 1
        fi
        set_feature "$2" false
        ;;
    "check")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 check <feature_name>${NC}"
            exit 1
        fi
        
        if ! feature_exists "$2"; then
            echo -e "${RED}Feature '$2' does not exist${NC}"
            exit 1
        fi
        
        status=$(feature_enabled "$2")
        if [ "$status" = "true" ]; then
            echo -e "${GREEN}✅ Feature '$2' is enabled${NC}"
        else
            echo -e "${RED}❌ Feature '$2' is disabled${NC}"
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Feature Flag Management Script"
        echo ""
        echo "Usage: $0 [command] [feature_name]"
        echo ""
        echo "Commands:"
        echo "  list                    List all features and their status"
        echo "  enable <feature>        Enable a feature"
        echo "  disable <feature>       Disable a feature"
        echo "  check <feature>         Check if a feature is enabled"
        echo "  help                    Show this help message"
        echo ""
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac