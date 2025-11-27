---
title: 'Just - Modern Make Replacement'
date: 2025-11-26T12:00:00Z
draft: false
description:
  'Just is a modern command runner that serves as an upgraded replacement for
  make, with support for inheritance between commands and parameter passing.'
summary:
  'A command runner that saves time and provides command inheritance, perfect
  for development workflows and AI agent integration.'
tags: ['CLI', 'Build Tools', 'Productivity', 'Terminal']
external_url: 'https://github.com/casey/just'
github_url: 'https://github.com/casey/just'
---

## Overview

Just is a modern command runner that provides a much-needed upgrade to
traditional makefiles. It offers a cleaner syntax, better error handling, and
powerful features like command inheritance and parameter passing that make it
ideal for development workflows.

## Key Features

- **Clean Syntax**: Simple, readable command definitions without make's complex
  syntax
- **Command Inheritance**: Commands can inherit and extend other commands
- **Parameter Passing**: Pass parameters between commands for flexible workflows
- **Cross-Platform**: Works consistently across different operating systems
- **Shell Integration**: Integrates seamlessly with existing shell environments

## Common Use Cases

### Global Task Runner

Create a global `~/.justfile` for general-purpose tasks:

```justfile
# Common development tasks
dev:
    bun run dev

build:
    npm run build

# Generic AI agent integration (replace 'ai-agent' with your specific agent command)
ask question:
    ai-agent "{{question}}"

clean:
    rm -rf node_modules dist
```

### Project-Specific Commands

Include project-specific justfiles alongside global ones:

```justfile
# Project-specific build commands
test:
    bun run test

deploy env="production":
    bun run build
    npm run deploy:{{env}}
```

## Why Developers Choose Just

- **Faster than make**: No parsing overhead, executes commands directly
- **Better error messages**: Clear, helpful error reporting
- **No tabs required**: Unlike make, just uses standard spacing
- **IDE friendly**: Works well with modern development tools
- **AI agent compatible**: Perfect for Claude and other CLI agents

## Integration with AI Agents

Just works particularly well with AI coding agents like OpenCode:

```justfile
# Quick AI assistance
fix file:
    opencode "Fix the issues in {{file}}"

review:
    opencode "Review the current codebase and suggest improvements"

optimize:
    opencode "Optimize the performance of this application"
```

## Resources

- [Official Documentation](https://github.com/casey/just#readme)
- [Installation Guide](https://github.com/casey/just#installation)
- [Examples Repository](https://github.com/casey/just/tree/master/examples)

Just provides the power of make with modern developer experience, making it an
essential tool for terminal-based development workflows.
