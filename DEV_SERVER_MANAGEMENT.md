# Development Server Management

This document outlines the PM2-based development server management system
implemented for robust development workflow.

## Overview

The project uses PM2 (Process Manager 2) to manage the Hugo development server,
providing:

- Automatic restarts on crashes
- Log management and rotation
- Agent-aware process signaling
- Consistent development environment

## Components

### 1. PM2 Configuration (`ecosystem.config.js`)

Defines the Hugo development server process with:

- Process name: `hugo-dev`
- Hugo server arguments for development
- Log file locations
- Memory limits and restart policies

### 2. Management Script (`scripts/pm2-agent-integration.sh`)

Bash script providing:

- Start/stop/restart commands
- Status monitoring
- Log viewing
- Agent activity signaling

### 3. Process Directory (`.pids/`)

Stores:

- Process ID files
- Application logs
- Error logs
- Agent activity tracking

## Usage

### Starting the Development Server

```bash
# Using the management script
./scripts/pm2-agent-integration.sh start

# Or directly with PM2
pm2 start ecosystem.config.js
```

### Stopping the Development Server

```bash
./scripts/pm2-agent-integration.sh stop
```

### Restarting

```bash
./scripts/pm2-agent-integration.sh restart
```

### Checking Status

```bash
./scripts/pm2-agent-integration.sh status
```

### Viewing Logs

```bash
# Real-time log viewing
./scripts/pm2-agent-integration.sh logs

# Or directly with PM2
pm2 logs hugo-dev
```

### Agent Signaling

```bash
# Signal agent activity (for monitoring/automation)
./scripts/pm2-agent-integration.sh agent-signal "Working on feature X"
```

## Configuration Details

### Hugo Server Arguments

- `--buildDrafts`: Include draft content in development
- `--buildFuture`: Include future-dated content
- `--disableFastRender`: Disable fast rendering for accurate development
- Custom bind URL and port configuration

### Log Management

- **Standard output**: `.pids/hugo-dev-out-0.log`
- **Error output**: `.pids/hugo-dev-error-0.log`
- **Combined logs**: `.pids/hugo-dev.log`
- **Agent activity**: `.pids/agent-aware.log`

### Memory Management

- Process restarts at 1GB memory usage
- Automatic restart on crashes
- PM2 handles process lifecycle

## Integration with Development Workflow

### Package.json Scripts

The existing `npm run dev` command can be updated to use PM2:

```json
{
  "scripts": {
    "dev": "./scripts/pm2-agent-integration.sh start",
    "dev:stop": "./scripts/pm2-agent-integration.sh stop",
    "dev:restart": "./scripts/pm2-agent-integration.sh restart"
  }
}
```

### Git Integration

- `.pids/` directory is tracked in git
- Log files are excluded via .gitignore patterns
- PM2 configuration is version controlled

### Agent Awareness

The system provides hooks for AI agents to signal activity:

- Track when agents are working on the project
- Monitor agent productivity
- Coordinate between multiple agents

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   ./scripts/pm2-agent-integration.sh restart
   ```

2. **PM2 not found**

   ```bash
   npm install -g pm2
   ```

3. **Logs not rotating**
   - PM2 handles log rotation automatically
   - Check disk space if logs grow too large

### Manual PM2 Commands

```bash
# List all processes
pm2 list

# Monitor specific process
pm2 monit

# Reload without downtime
pm2 reload hugo-dev

# Reset metrics
pm2 reset hugo-dev
```

## Best Practices

1. **Always use the management script** rather than direct PM2 commands
2. **Check logs** when troubleshooting issues
3. **Use agent signaling** when automating development tasks
4. **Monitor memory usage** for long-running development sessions
5. **Commit PM2 configuration** changes to version control

## Migration from Direct Hugo Server

Previous workflow:

```bash
hugo server -D --bind 0.0.0.0 --baseURL http://192.168.86.25:1313
```

New workflow:

```bash
./scripts/pm2-agent-integration.sh start
```

Benefits:

- Automatic restart on crashes
- Better log management
- Agent integration capabilities
- Consistent development environment
