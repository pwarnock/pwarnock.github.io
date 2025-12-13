---
title: 'Crush'
description:
  "The glamourous AI coding agent for your favourite terminal, with multi-model
  support and LSP-enhanced context awareness"
date: 2025-11-27T10:00:00-07:00
categories: ['ai-tools']
tags:
  [
    'ai-coding',
    'developer-tools',
    'command-line',
    'terminal',
    'multi-model',
    'charmbracelet',
  ]
external_url: 'https://charm.sh/crush'
website: 'charm.sh'
tool_category: 'AI Coding Assistants'
slug: 'crush-ai-coding-assistant'
aliases: ['/tools/crush/']
radar:
  quadrant: 'Tools'
  ring: 'Adopt'
---

Crush represents Charmbracelet's entry into the AI coding assistant space,
bringing their signature terminal-first philosophy and "glamourous" design
aesthetic to AI-powered development. Built as a native terminal application,
Crush distinguishes itself through its exceptional multi-model support,
flexible configuration options, and deep integration with developer workflows
through LSP and MCP protocols.

## Core Features

### Terminal-First Design

- **Native CLI Experience**: Fully optimized for terminal workflows with
  keyboard-driven interaction
- **Cross-Platform Support**: First-class support on macOS, Linux, Windows
  (PowerShell and WSL), FreeBSD, OpenBSD, and NetBSD
- **Minimal Resource Footprint**: Lightweight Go-based implementation with
  fast startup and response times
- **Session Management**: Multiple work sessions with context preservation per
  project

### Multi-Model Architecture

- **Provider Flexibility**: Choose from Anthropic, OpenAI, Groq, OpenRouter,
  Google Gemini, Cerebras, HuggingFace, VertexAI, Amazon Bedrock, and more
- **Custom Provider Support**: Add your own OpenAI-compatible or
  Anthropic-compatible APIs
- **Model Switching**: Switch LLMs mid-session while preserving context and
  conversation history
- **Cost Tracking**: Built-in cost tracking and token usage monitoring

### Enhanced Context Awareness

- **LSP Integration**: Uses Language Server Protocol for additional context,
  just like modern IDEs
- **MCP Support**: Extensible via Model Context Protocol (stdio, http, and sse
  transport types)
- **Project Initialization**: Analyzes codebase and creates context files for
  future sessions
- **Git Integration**: Native support for version control workflows with
  attribution options

## Technical Specifications

- **Language**: Go (98%) with minimal Smarty templating
- **Installation**: Homebrew, NPM, Winget, Scoop, Arch Linux, Nix, Debian/Ubuntu,
  Fedora/RHEL, or direct binary download
- **Configuration**: JSON-based with project-local and global options
- **License**: FSL-1.1-MIT (Fair Source License)
- **Repository**: 15.4k+ stars, 883+ forks on GitHub
- **Release Cadence**: Regular updates with 75+ releases

## Installation Methods

### Package Managers

```bash
# Homebrew
brew install charmbracelet/tap/crush

# NPM
npm install -g @charmland/crush

# Winget (Windows)
winget install charmbracelet.crush

# Scoop (Windows)
scoop install crush

# Arch Linux
yay -S crush-bin

# Nix
nix run github:numtide/nix-ai-tools#crush
```

### System Package Installation

```bash
# Debian/Ubuntu
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://repo.charm.sh/apt/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/charm.gpg
echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" | sudo tee /etc/apt/sources.list.d/charm.list
sudo apt update && sudo apt install crush

# Fedora/RHEL
echo '[charm]
name=Charm
baseurl=https://repo.charm.sh/yum/
enabled=1
gpgcheck=1
gpgkey=https://repo.charm.sh/yum/gpg.key' | sudo tee /etc/yum.repos.d/charm.repo
sudo yum install crush
```

### Direct Installation

```bash
# Go install
go install github.com/charmbracelet/crush@latest
```

## Configuration

### Quick Setup

Crush runs great with no configuration. Simply set an API key for your preferred
provider:

```bash
# Environment variables
export ANTHROPIC_API_KEY="your-key-here"
export OPENAI_API_KEY="your-key-here"
export OPENROUTER_API_KEY="your-key-here"
```

### Advanced Configuration

Create `crush.json` with custom settings:

```json
{
  "$schema": "https://charm.land/crush.json",
  "providers": {
    "openai": {
      "type": "openai",
      "api_key": "$OPENAI_API_KEY",
      "models": [
        {
          "id": "gpt-4",
          "name": "GPT-4",
          "context_window": 128000
        }
      ]
    }
  },
  "lsp": {
    "go": { "command": "gopls", "enabled": true },
    "typescript": { "command": "typescript-language-server", "args": ["--stdio"] },
    "nix": { "command": "nil" }
  },
  "mcp": {
    "filesystem": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-server.js"]
    }
  },
  "options": {
    "initialize_as": "AGENTS.md",
    "attribution": {
      "trailer_style": "co-authored-by",
      "generated_with": true
    }
  }
}
```

## Unique Advantages

### Terminal-Optimized Workflow

Crush's native terminal design makes it ideal for developers who spend most
of their time in the command line. Unlike browser-based AI assistants, Crush
integrates seamlessly with existing terminal workflows without breaking focus
or requiring context switching between applications.

### Model Provider Flexibility

The ability to switch between different LLM providers and even add custom
OpenAI-compatible APIs gives developers unprecedented flexibility. This is
particularly valuable for teams that need to use specific models for compliance,
cost, or performance reasons.

### Developer Tool Integration

With built-in LSP support and MCP protocol compatibility, Crush can leverage
the same language intelligence tools that developers already use in their
IDEs. This creates a more consistent and powerful development experience.

## Use Cases

- **Terminal-Centric Development**: Perfect for developers who live in the
  command line and want AI assistance without leaving their terminal
- **Multi-Provider Environments**: Organizations using multiple AI providers or
  requiring custom model configurations
- **IDE-Agnostic Workflows**: Developers who switch between different editors
  but want consistent AI assistance
- **Cost-Conscious Development**: Built-in token tracking and cost monitoring
  for budget-aware development
- **Privacy-Sensitive Projects**: Local model support via Ollama, LM Studio,
  and other OpenAI-compatible local servers

## Getting Started

1. **Installation**: Choose your preferred installation method from the options
   above
2. **API Key Setup**: Set environment variables for your preferred provider or
   configure in crush.json
3. **Project Initialization**: Run `crush` in your project directory to let it
   analyze your codebase
4. **First Session**: Start coding with AI assistance - Crush will prompt for
   permissions on tool usage
5. **Configuration**: Customize LSP servers, MCP connections, and providers as
   needed
6. **Session Management**: Use multiple sessions for different contexts or
   projects
7. **Advanced Features**: Explore custom providers, local models, and attribution
   settings

## External Links

- [Official Website →](https://charm.sh/crush)
- [GitHub Repository →](https://github.com/charmbracelet/crush)
- [Documentation →](https://github.com/charmbracelet/crush/blob/main/README.md)
- [Charm Discord →](https://charm.land/discord)
- [Provider Database (Catwalk) →](https://github.com/charmbracelet/catwalk)
- [Back to Vibe Coding Overview →](/blog/posts/vibe-coding-revolution/)

---

_This tool overview is part of our comprehensive guide to
[vibe coding tools](/blog/posts/vibe-coding-revolution/). Last updated: November
27, 2025._

**Website**: [charm.sh](https://charm.sh)