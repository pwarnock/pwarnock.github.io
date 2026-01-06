---
title: 'tmux'
summary: 'Terminal multiplexer for managing multiple terminal sessions within a single window.'
date: 2026-01-05T17:00:00Z
draft: false
tags: ['Terminal', 'Productivity', 'Developer Tools']
author: 'Peter Warnock'
---

tmux is a terminal multiplexer that allows you to create, access, and control multiple terminal sessions from a single window. It's essential for managing complex development workflows with persistent sessions.

## What It Does

tmux enables:

- **Multiple Sessions**: Run separate terminal sessions that persist
- **Window Management**: Split windows into panes
- **Session Persistence**: Sessions survive disconnections (SSH, terminal close)
- **Background Work**: Run long-running processes that outlive your terminal
- **Session Sharing**: Attach to the same session from different terminals

## Key Concepts

### Sessions

A tmux session is a independent collection of terminal windows.

```bash
# Create new session
tmux new -s mysession

# Detach (leave running in background)
Ctrl-b d

# List sessions
tmux ls

# Attach to session
tmux attach -t mysession

# Kill session
tmux kill-session -t mysession
```

### Windows

Each session can contain multiple windows (like browser tabs).

```bash
# Create new window
Ctrl-b c

# Switch to next window
Ctrl-b n

# Switch to previous window
Ctrl-b p

# List windows
Ctrl-b w

# Rename current window
Ctrl-b ,

# Kill window
Ctrl-b &
```

### Panes

Split windows into rectangular panes.

```bash
# Split horizontally (top-bottom)
Ctrl-b "

# Split vertically (left-right)
Ctrl-b %

# Navigate between panes
Ctrl-b arrow-key

# Resize pane
Ctrl-b :resize-pane -D 5   # Down 5 lines

# Toggle pane zoom
Ctrl-b z

# Kill pane
Ctrl-b x
```

## My Setup

I use tmux as part of the Gastown multi-agent workspace, running multiple specialized sessions:

- **Mayor Session**: AI coordinator with full town context
- **Polecat Sessions**: Worker agents for task execution
- **Witness Session**: Monitors worker health and lifecycle

This setup allows running 10-20 concurrent agents while maintaining visibility into all activities.

### Custom Configuration (~/.tmux.conf)

```bash
# Enable mouse support
set -g mouse on

# Set scrollback history
set -g history-limit 10000

# Use vim keybindings in copy mode
setw -g mode-keys vi

# Faster command sequence
set -s escape-time 0

# Start window numbering at 1
set -g base-index 1

# Pane numbering
set -g pane-base-index 1
```

## Essential Keybindings

| Keybinding | Action |
|------------|--------|
| `Ctrl-b d` | Detach from session |
| `Ctrl-b c` | Create new window |
| `Ctrl-b n/p` | Next/previous window |
| `Ctrl-b w` | List windows |
| `Ctrl-b %` | Split vertically |
| `Ctrl-b "` | Split horizontally |
| `Ctrl-b arrow` | Navigate panes |
| `Ctrl-b z` | Toggle pane zoom |
| `Ctrl-b [` | Enter copy mode |
| `Ctrl-b ]` | Paste from buffer |
| `Ctrl-b &` | Kill window |
| `Ctrl-b ?` | Show all keybindings |

## Copy Mode (vim-style)

```bash
# Enter copy mode
Ctrl-b [

# Navigate (vim keys)
h j k l    # Left, down, up, right
gg         # Go to top
G          # Go to bottom

# Select text
v          # Start selection
V          # Select line

# Copy selection
y          # Yank (copy)

# Exit copy mode
q          # or Esc
```

## Installation

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# RHEL/Fedora
sudo dnf install tmux
```

## Related Tools

- **Gastown**: Uses tmux for multi-agent session management
- **tmuxinator**: Manage complex tmux configurations as YAML files
- **tpm**: Plugin manager for tmux

## Resources

- [tmux GitHub](https://github.com/tmux/tmux)
- [tmux cheatsheet](https://tmuxcheatsheet.com/)

---

_Tags: Terminal, Productivity, Developer Tools_
