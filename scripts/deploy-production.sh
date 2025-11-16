#!/bin/bash
# Deploy to production environment

set -e

echo "🚀 Deploying to production..."

# Ensure we're on production branch
git checkout production

# Sync with latest staging
git fetch staging
git rebase staging/staging

# Run production-specific tests
./scripts/path-based-build.sh

# Push to production remote
git push production production:production

echo "✅ Production deployment complete"