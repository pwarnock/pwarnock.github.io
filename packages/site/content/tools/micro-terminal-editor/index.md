---
title: 'Micro - Modern Terminal Editor'
date: 2025-11-26T12:00:00Z
draft: false
description:
  'Micro is a modern terminal-based text editor written in Go, with standard
  keyboard shortcuts and a clean interface.'
summary:
  'A modern terminal-based editor written in Go, configurable with themes and
  standard keyboard shortcuts.'
tags: ['CLI', 'Terminal', 'Editor', 'Productivity']
external_url: 'https://github.com/zyedidia/micro'
github_url: 'https://github.com/zyedidia/micro'
---

## Overview

Micro is a modern terminal-based text editor that provides the familiarity of
traditional editors with the performance and features developers expect today.
Written in Go, it offers instant startup, syntax highlighting, and a clean,
intuitive interface perfect for quick edits and AI agent workflows.

## Key Features

- **Instant Startup**: No loading delays, ready immediately
- **Standard Shortcuts**: Uses familiar keyboard shortcuts (Ctrl+S, Ctrl+C,
  etc.)
- **Syntax Highlighting**: Support for 100+ languages and file types
- **Mouse Support**: Click to position cursor, select text with mouse
- **Plugin System**: Extensible with community plugins
- **Multiple Buffers**: Work with multiple files simultaneously
- **Search and Replace**: Powerful text search with regex support
- **Configuration**: Extensive customization options

## Common Use Cases

### Quick File Editing

```bash
# Edit a file
micro config.json

# Open multiple files
micro app.js style.css index.html

# Open at specific line
micro +10 app.js  # Start at line 10
```

### AI Agent Integration

Perfect for quick edits when working with AI coding agents:

```bash
# AI agent suggests changes, you quickly apply them
opencode "fix the bug in authentication.js"

# Rapid iteration with AI assistance
opencode api.py  # Make changes, save, AI reviews
```

### Configuration Editing

```bash
# Edit configuration files
micro ~/.config/nvim/init.vim
micro ~/.bashrc
micro ~/.gitconfig
```

## Why Developers Choose Micro

- **No learning curve**: Uses standard keyboard shortcuts everyone knows
- **Fast performance**: Instant startup, even with large files
- **Modern features**: Split panes, multiple cursors, macros
- **Cross-platform**: Consistent behavior across all systems
- **Lightweight**: Minimal resource usage
- **AI-friendly**: Perfect for quick edits during AI-assisted coding

## Essential Keyboard Shortcuts

### File Operations

```
Ctrl+S    - Save file
Ctrl+Q    - Quit
Ctrl+O    - Open file
Ctrl+N    - New file
Ctrl+W    - Close file
```

### Editing

```
Ctrl+C    - Copy
Ctrl+X    - Cut
Ctrl+V    - Paste
Ctrl+Z    - Undo
Ctrl+Y    - Redo
Ctrl+F    - Find
Ctrl+H    - Replace
```

### Navigation

```
Ctrl+G    - Go to line
Home       - Start of line
End        - End of line
Ctrl+Home  - Start of file
Ctrl+End   - End of file
```

## Advanced Features

### Multiple Buffers

```bash
# Buffer management
Ctrl+Tab     - Next buffer
Ctrl+Shift+Tab - Previous buffer
Ctrl+B       - Buffer list
```

### Split Screen

```bash
# Split panes
Ctrl+E       - Toggle split
Ctrl+Up/Down - Navigate between panes
```

### Search and Replace

```bash
# Advanced search
Ctrl+F       - Open search
Enter        - Find next
Shift+Enter  - Find previous
Ctrl+R       - Replace mode
```

## Configuration

### Basic Setup

```bash
# Configuration file location
~/.config/micro/settings.json

# Common settings
{
    "tabsize": 4,
    "tabstospaces": true,
    "wordwrap": true,
    "syntax": true,
    "colortheme": "default"
}
```

### Theme Customization

```bash
# Available themes
micro -colors

# Set theme
micro -colors "solarized"

# Custom theme location
~/.config/micro/colors/
```

### Plugin Management

```bash
# Install plugins
micro -plugin install autocomplete

# List installed plugins
micro -plugin list

# Update plugins
micro -plugin update
```

## Integration with Development Workflows

### Git Integration

```bash
# Git commit workflow
micro COMMIT_EDITMSG  # Edit commit message
git commit -F COMMIT_EDITMSG

# Merge conflict resolution
git mergetool  # Opens micro for conflict resolution
```

### Configuration Management

```bash
# Quick config edits
alias edit-bash='micro ~/.bashrc'
alias edit-vim='micro ~/.vimrc'
alias edit-git='micro ~/.gitconfig'
```

### AI Agent Workflow

```bash
# Perfect for AI-assisted development:
# 1. AI agent suggests changes
# 2. Quick edit with micro
# 3. Save and continue with AI

opencode component.js  # Make AI-suggested changes
:wq                   # Save and continue
```

## Performance Features

### Large File Handling

- **Efficient memory usage**: Handles large files without slowdown
- **Syntax highlighting**: Fast highlighting even for large codebases
- **Smooth scrolling**: No lag when navigating large files

### Startup Performance

- **Instant launch**: Ready in milliseconds, not seconds
- **Minimal dependencies**: Single binary, no external requirements
- **Fast file loading**: Optimized file reading and parsing

## Resources

- [Official Documentation](https://github.com/zyedidia/micro#readme)
- [Installation Guide](https://github.com/zyedidia/micro#installation)
- [Plugin Repository](https://github.com/micro-editor/plugin-channel)
- [Theme Gallery](https://github.com/micro-editor/plugin-channel#themes)
- [Keyboard Shortcuts](https://github.com/zyedidia/micro#keyboard-shortcuts)

Micro provides the perfect balance between traditional terminal editors and
modern development needs, making it an essential tool for quick edits and
AI-assisted coding workflows.
