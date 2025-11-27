---
title: 'Bat - Cat with Wings'
date: 2025-11-26T12:00:00Z
draft: false
description:
  'Bat is a modern cat replacement that provides syntax highlighting, line
  numbers, and enhanced formatting for text files.'
summary:
  'A cat command replacement with syntax highlighting and great formatting,
  perfect for viewing source code and Markdown files.'
tags: ['CLI', 'Terminal', 'Productivity', 'File Viewing']
external_url: 'https://github.com/sharkdp/bat'
github_url: 'https://github.com/sharkdp/bat'
---

## Overview

Bat is a modern replacement for the classic `cat` command that adds essential
features developers need: syntax highlighting, line numbers, and intelligent
formatting. It's like `cat` but with wings.

## Key Features

- **Syntax Highlighting**: Supports hundreds of languages and file types
- **Line Numbers**: Optional line numbering for code reference
- **File Integration**: Automatically handles git diff output and file changes
- **Paging Support**: Integrates with less for large files
- **Theme Support**: Customizable color schemes and themes
- **File Type Detection**: Automatic language detection based on file extension

## Common Use Cases

### Quick Code Viewing

```bash
# View source code with syntax highlighting
bat app.js

# View with line numbers
bat -n style.css

# View multiple files
bat *.md
```

### Enhanced File Inspection

```bash
# Show file headers and metadata
bat --header config.json

# View git diff output
bat --diff

# Show non-printable characters
bat --show-all binary.dat
```

### Development Workflow Integration

```bash
# View log files with syntax highlighting
bat -l log application.log

# View configuration files
bat ~/.config/nvim/init.vim

# Quick API documentation viewing
bat --language=python api.py
```

## Why Developers Choose Bat

- **Better readability**: Syntax highlighting makes code instantly
  understandable
- **Fast performance**: Written in Rust, handles large files efficiently
- **Git integration**: Shows git status and changes in context
- **IDE-like experience**: Brings familiar code viewing to terminal
- **Minimal learning curve**: Drop-in replacement for cat with added benefits

## Advanced Features

### Custom Themes

```bash
# List available themes
bat --list-themes

# Use specific theme
bat --theme=GitHub script.js

# Create custom theme
bat --print-theme=Monokai Extended > my-theme.tmTheme
```

### Output Control

```bash
# Output without decorations (for scripting)
bat --plain data.json

# Force specific language
bat --language=python script

# Show file information
bat --stat --line-range 50:100 large_file.go
```

## Integration with Other Tools

Bat works seamlessly with other terminal tools:

```bash
# Pipe output to bat
ps aux | bat -l ps

# Use with find
find . -name "*.py" -exec bat {} +

# Combine with grep
grep -r "function" src/ | bat -l log
```

## Resources

- [Official Documentation](https://github.com/sharkdp/bat#bat--cat-with-wings)
- [Installation Guide](https://github.com/sharkdp/bat#installation)
- [Theme Gallery](https://github.com/sharkdp/bat#themes)
- [Language Support](https://github.com/sharkdp/bat#syntax-highlighting)

Bat transforms the simple act of viewing files into a rich, informative
experience that makes terminal development more productive and enjoyable.
