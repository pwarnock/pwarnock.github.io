#!/bin/bash
#
# WSL Setup Script for pwarnock.github.io
#
# This script automates the setup of the development environment on a
# Debian-based WSL distribution (like Ubuntu).

set -e # Exit immediately if a command exits with a non-zero status.

echo "🚀 Starting WSL environment setup for pwarnock.github.io..."

# 1. Update System Packages
echo "🔄 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install essential dependencies
echo "📦 Installing essential dependencies (curl, git, unzip)..."
sudo apt-get install -y curl git unzip

# 3. Install nvm (Node Version Manager) and Node.js LTS
echo "📦 Installing nvm and Node.js LTS..."
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  # nvm not installed, install it
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Source nvm to use it in the current script
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install the latest LTS version of Node.js
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

echo "✅ Node.js LTS installed via nvm."
node -v
npm -v

# 4. Install Bun
echo "📦 Installing Bun..."
if ! command -v bun &> /dev/null
then
    curl -fsSL https://bun.sh/install | bash
    # Add bun to the path for the current session
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo "✅ Bun installed."
else
    echo "✅ Bun is already installed."
fi
bun -v

# 5. Install Project Dependencies
echo "📦 Installing project dependencies with Bun..."
bun install --frozen-lockfile
echo "✅ Project dependencies installed."

# 6. Install Playwright Browsers & Dependencies
echo "🌐 Installing Playwright browsers and system dependencies for Linux..."
echo "ℹ️ This step might take a few minutes and may require sudo password."
bunx playwright install --with-deps
echo "✅ Playwright setup complete."

echo "🎉 WSL setup complete!"
echo ""
echo "You can now run the development server and tests in separate terminals:"
echo "  Terminal 1: bun run serve:preview"
echo "  Terminal 2: bun run test:e2e"
echo ""
