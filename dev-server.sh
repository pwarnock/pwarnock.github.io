#!/bin/bash

# Development server script for pwarnock.github.io
# Usage: ./dev-server.sh

echo "Starting Hugo development server..."
echo "Site will be available at: http://localhost:1313"
echo "Portfolio section: http://localhost:1313/portfolio/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

hugo server -D \
  --baseURL=http://localhost:1313 \
  --bind=0.0.0.0 \
  --port=1313 \
  --navigateToChanged