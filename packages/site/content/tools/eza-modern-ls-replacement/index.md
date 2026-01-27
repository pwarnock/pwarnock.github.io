---
title: 'Eza - Modern LS Replacement'
date: 2025-11-26T12:00:00Z
draft: false
description:
  'Eza is a modern replacement for ls that provides enhanced file listing with
  colors, icons, and multiple view formats.'
summary:
  'Eza is a feature-rich `ls` replacement, offering vibrant color highlighting,
  file type icons, and flexible tree and table views for enhanced terminal
  navigation.'
tags: ['CLI', 'Terminal', 'Productivity', 'File Management']
external_url: 'https://github.com/eza-community/eza'
github_url: 'https://github.com/eza-community/eza'
---

## Overview

Eza is a modern, maintained replacement for the classic `ls` command that brings
essential features developers need: color highlighting, file type icons, git
integration, and flexible viewing formats. It makes directory navigation more
informative and visually appealing.

## Key Features

- **Color Highlighting**: Intelligent color coding for different file types and
  permissions
- **File Type Icons**: Visual icons for different file types and directories
- **Git Integration**: Shows git status indicators for tracked files
- **Multiple Views**: Tree view, detailed view, and grid layouts
- **Performance**: Fast execution even with large directories
- **Cross-Platform**: Consistent behavior across Linux, macOS, and Windows

## Common Use Cases

### Enhanced Directory Listing

```bash
# Basic enhanced listing
eza

# Detailed view with permissions
eza -l

# Show hidden files
eza -la

# Tree view
eza --tree
```

### Common Alias Patterns

```bash
# Alias for detailed, human-readable listing with Git info and icons
alias ls='eza -lah --git --icons'

# Alias for tree view with limited depth
alias tree='eza -l --tree --level=2 --git --icons'

# Alias for showing all files including hidden ones
alias la='eza -la --git --icons'
```

### Advanced Viewing Options

```bash
# Show only directories
eza -D

# Group by file type
eza --group-directories-first

# Show file sizes in human readable format
eza -lh

# Show extended attributes
eza -l --extended
```

## Why Developers Choose Eza

- **Visual clarity**: Icons and colors make file types instantly recognizable
- **Git awareness**: See modified, staged, and untracked files at a glance
- **Flexible output**: Multiple viewing modes for different needs
- **Performance optimized**: Handles large directories without slowdown
- **Modern defaults**: Sensible defaults that work out of the box

## Git Integration

Eza provides rich git status information:

```bash
# Shows git status indicators
eza --git

# Common indicators:
# ✓ = clean file
# ? = untracked file
# + = staged file
# ! = modified file
# » = renamed file
```

## Advanced Features

### Tree View Navigation

```bash
# Show directory tree
eza --tree

# Limit tree depth
eza --tree --level=3

# Show tree with git info
eza --tree --git
```

### File Filtering and Sorting

```bash
# Sort by modification time
eza --sort=modified

# Show only specific file types
eza --only-dirs
eza --only-files

# Reverse sort order
eza --reverse --sort=size
```

### Grid and Table Views

```bash
# Grid layout for visual browsing
eza --grid

# Table view with detailed info
eza --table

# Long format with specific columns
eza --long --header --binary
```

## Integration with Terminal Setup

Eza works great with other terminal tools:

```bash
# Combine with bat for file viewing
eza | grep "\.py$" | xargs bat

# Use with find for targeted searches
find . -name "*.js" | eza --stdin

# Pipe to other commands
eza --tree | head -20
```

## Customization

### Color Schemes

```bash
# Available color schemes
eza --color-scheme

# Use specific color scheme
eza --color-scheme=dark

# Custom color configuration
export LS_COLORS="di=1;34:ln=1;36:ex=1;32"
eza --color=always
```

## Resources

- [Official Documentation](https://github.com/eza-community/eza#eza)
- [Installation Guide](https://github.com/eza-community/eza#installation)
- [Configuration Options](https://github.com/eza-community/eza#manual)
- [Color Schemes](https://github.com/eza-community/eza#color-schemes)

Eza transforms the mundane act of listing files into an informative, visually
pleasing experience that enhances terminal productivity.
