#!/bin/bash

# Dynamic BaseURL Configuration for Hugo Worktrees
# Detects current worktree and sets appropriate baseURL

set -e

# Get current git branch/worktree
CURRENT_WORKTREE=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
CURRENT_DIR=$(basename $(pwd))

echo "🔍 Detecting environment for worktree: $CURRENT_WORKTREE"
echo "📁 Current directory: $CURRENT_DIR"

# Dynamic baseURL mapping based on worktree
case "$CURRENT_WORKTREE" in
  "main"|"production")
    BASE_URL="https://peterwarnock.com"
    ENV_NAME="production"
    ;;
  "staging")
    BASE_URL="https://staging.peterwarnock.com"
    ENV_NAME="staging"
    ;;
  "feat/"*|"fix/"*|"hotfix/"*)
    BASE_URL="http://localhost:1313"
    ENV_NAME="development"
    ;;
  *)
    # Default to development for unknown branches
    BASE_URL="http://localhost:1313"
    ENV_NAME="development"
    ;;
esac

echo "🚀 Environment: $ENV_NAME"
echo "🌐 BaseURL: $BASE_URL"

# Export environment variables for Hugo
export HUGO_BASEURL="$BASE_URL"
export HUGO_ENV="$ENV_NAME"

# Update config files with dynamic baseURL
update_hugo_config() {
  local config_file="$1"
  local base_url="$2"
  
  if [[ -f "$config_file" ]]; then
    # Create backup
    cp "$config_file" "${config_file}.backup.$(date +%s)"
    
    # Update baseURL
    if [[ "$OSTYPE" == "Darwin" ]]; then
      sed -i '' "s|^baseURL = .*|baseURL = \"$base_url\"|" "$config_file"
    else
      sed -i '' "s|^baseURL = .*|baseURL = \"$base_url\"|" "$config_file"
    fi
    
    echo "✅ Updated $config_file with baseURL: $base_url"
  fi
}

# Update appropriate config file
case "$ENV_NAME" in
  "production")
    update_hugo_config "config/production/hugo.toml" "$BASE_URL"
    ;;
  "staging")
    update_hugo_config "config/staging/hugo.toml" "$BASE_URL"
    ;;
  "development")
    update_hugo_config "config/development/hugo.toml" "$BASE_URL"
    ;;
esac

echo "🎯 Configuration complete!"
echo "🔧 Hugo will use: $HUGO_BASEURL"
echo "📦 Environment: $HUGO_ENV"