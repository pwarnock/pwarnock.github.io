---
title: 'Yazi - Terminal File Manager'
date: 2025-11-26T12:00:00Z
draft: false
description:
  'Yazi is a blazing-fast terminal file manager written in Rust, with built-in
  viewers for different file types and intuitive navigation.'
summary:
  'A fully-featured terminal file manager with viewers for different file types,
  easy navigation, and multi-column view.'
tags: ['CLI', 'Terminal', 'File Manager', 'Productivity']
external_url: 'https://github.com/sxyazi/yazi'
github_url: 'https://github.com/sxyazi/yazi'
---

## Overview

Yazi is a modern terminal file manager that provides a visual, intuitive way to
navigate and manage files directly from the terminal. It features built-in
viewers for different file types, including images on compatible terminals, and
offers a split-screen experience perfect for development workflows.

## Key Features

- **Blazing Fast**: Written in Rust for optimal performance
- **Built-in Viewers**: Native viewers for images, videos, PDFs, and archives
- **Multi-Column Layout**: Efficient use of terminal space
- **Split Screen**: Perfect for side-by-side file management
- **Vim-like Navigation**: Familiar keybindings for power users
- **Plugin System**: Extensible architecture for custom functionality
- **Image Preview**: Image display in compatible terminals

## Common Use Cases

### Basic File Navigation

```bash
# Launch yazi in current directory
yazi

# Launch in specific directory
yazi ~/projects

# Open with specific layout
yazi --cwd-file /tmp/last_dir
```

### Split Screen Development Workflow

The killer feature for developers working with AI agents:

```bash
# Terminal 1: AI agent
    opencode "Help me refactor this component"

# Terminal 2: File manager
yazi  # See files change in real-time
```

### File Operations

```bash
# Navigation (vim-like)
h/j/k/l - left/down/up/right
gg/G     - top/bottom
Ctrl-u/d - page up/down

# File operations
o/Enter - open file
y        - yank/copy
x        - cut/delete
p        - paste
```

## Why Developers Choose Yazi

- **Real-time visibility**: See files change as AI agents modify them
- **Visual feedback**: Much clearer than running `ls` repeatedly
- **Efficient workflow**: No context switching between terminal and file manager
- **Image preview**: Quick visual confirmation without leaving terminal
- **Performance**: Handles large directories without lag
- **Customizable**: Extensive configuration options

## Advanced Features

### Image and Media Preview

```bash
# Enable image preview (requires supported terminal)
yazi --image-preview on

# Supported image formats
# PNG, JPG, GIF, SVG, WebP, and more

# Video thumbnail generation
# Automatic thumbnails for video files
```

### File Type Handling

```bash
# Built-in viewers for:
- Images: PNG, JPG, GIF, SVG, WebP
- Documents: PDF, EPUB
- Archives: ZIP, TAR, RAR
- Code: Syntax highlighting for source files
- Videos: Thumbnail generation
```

### Plugin System

```bash
# Plugin configuration
~/.config/yazi/plugins.toml

# Popular plugins:
- Image preview enhancements
- Archive extraction
- Git integration
- File search utilities
```

## Configuration

### Basic Setup

```toml
# ~/.config/yazi/yazi.toml
[manager]
ratio          = [1, 4, 3]
sort_by         = "modified"
sort_sensitive  = false
sort_reverse    = true

[preview]
max_width       = 600
max_height      = 900
cache_dir       = "~/.cache/yazi"
```

### Keybindings Customization

```toml
# ~/.config/yazi/keymap.toml
[manager]
append_file     = "A"
create_dir      = "M"
create_file     = "a"
rename          = "c"
delete          = "d"
```

## Integration with Development Tools

### AI Agent Workflow

```bash
# Perfect setup for AI coding:
# Terminal 1: AI agent
    opencode "Implement the user authentication feature"

# Terminal 2: Yazi
yazi  # Watch files appear and change in real-time
```

### Git Integration

```bash
# See git status in file manager
yazi --git-status

# Common git workflows visible:
# ✓ = clean files
# ? = untracked files
# + = staged files
# ! = modified files
```

### Quick Actions

```bash
# Open file in specific editor
yazi --chooser "nvim %s"

# Custom commands
yazi --exec "git add %s"
```

## Performance Features

### Large Directory Handling

- **Lazy loading**: Only loads visible files
- **Virtual scrolling**: Efficient handling of thousands of files
- **Background caching**: Previews cached for quick access
- **Memory efficient**: Minimal memory footprint

### Search and Filter

```bash
# Fuzzy search
/ (search mode)

# Filter by file type
*.py (show only Python files)

# Regular expressions
^test_.*\.js$ (test files)
```

## Resources

- [Official Documentation](https://github.com/sxyazi/yazi#yazi)
- [Installation Guide](https://github.com/sxyazi/yazi#installation)
- [Configuration Guide](https://github.com/sxyazi/yazi#configuration)
- [Plugin Repository](https://github.com/sxyazi/yazi-plugins)

Yazi transforms terminal file management from a series of commands into an
intuitive, visual experience that's particularly valuable when working with AI
coding agents or managing complex project structures.
