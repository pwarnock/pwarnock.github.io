#!/bin/bash

# Production build script for pwarnock.github.io
# Usage: ./build-prod.sh

echo "Building production site for peterwarnock.com..."
echo ""

hugo --gc --ignoreCache --minify --baseURL=https://peterwarnock.com

echo ""
echo "Production build complete!"
echo "Files are in the 'public' directory"
echo "Ready for deployment to GitHub Pages or other hosting"