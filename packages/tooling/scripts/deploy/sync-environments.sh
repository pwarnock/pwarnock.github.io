#!/bin/bash
# Sync environment branches

set -e

echo "🔄 Syncing environment branches..."

# Fetch all remotes
git fetch --all

# Update staging from main
git checkout staging
git rebase upstream/main

# Update production from staging
git checkout production
git rebase staging/staging

# Return to main
git checkout main

echo "✅ Environment sync complete"