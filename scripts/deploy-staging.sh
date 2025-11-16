#!/bin/bash
# Deploy to staging environment

set -e

echo "🚀 Deploying to staging..."

# Ensure we're on staging branch
git checkout staging

# Sync with latest main
git fetch upstream
git rebase upstream/main

# Run staging-specific tests
./scripts/path-based-build.sh

# Push to staging remote
git push staging staging:staging

echo "✅ Staging deployment complete"