# Parallel Worktrees Development Guide

This guide shows how to use parallel worktrees for previewing and testing on
different ports.

## 🚀 Quick Start

### Start Development Servers

```bash
# Start specific worktree on default port
bun run dev:worktree start opencode-dev

# Start on custom port
bun run dev:worktree start letta-dev 1315

# Start multiple worktrees
bun run dev:worktree start opencode-dev 1313 &
bun run dev:worktree start letta-dev 1314 &
bun run dev:worktree start letta-dev-2 1315 &
```

### Run Tests in Parallel

```bash
# Run tests for specific worktree
bun run test:worktree test opencode-dev e2e

# Run tests for all worktrees
bun run test:worktree test-all e2e

# Run all test types for all worktrees
bun run test:worktree test-all all
```

## 📋 Available Commands

### Development Server Commands

```bash
bun run dev:worktree start [worktree] [port]    # Start development server
bun run dev:worktree stop [worktree]             # Stop development server
bun run dev:worktree status                       # Show all server status
bun run dev:worktree stop-all                     # Stop all servers
bun run dev:worktree list                         # List available worktrees
bun run dev:worktree help                         # Show help
```

### Testing Commands

```bash
bun run test:worktree test [worktree] [type]     # Run tests for worktree
bun run test:worktree test-all [type]             # Run tests for all worktrees
bun run test:worktree status                       # Show test status
bun run test:worktree clean                        # Clean test artifacts
bun run test:worktree help                         # Show help
```

## 🔌 Port Allocation

### Development Servers

- **opencode-dev**: 1313 (default)
- **letta-dev**: 1314
- **letta-dev-2**: 1315
- **main**: 1316
- **staging**: 1317
- **production**: 1318

### Testing Services

- **opencode-dev**: 4001 (E2E), 4002 (Unit), 4003 (Reports)
- **letta-dev**: 4011 (E2E), 4012 (Unit), 4013 (Reports)
- **letta-dev-2**: 4021 (E2E), 4022 (Unit), 4023 (Reports)
- **main**: 4031 (E2E), 4032 (Unit), 4033 (Reports)

## 🌐 URLs and Access

### Development Previews

Once started, access your worktrees at:

- http://localhost:1313 (opencode-dev)
- http://localhost:1314 (letta-dev)
- http://localhost:1315 (letta-dev-2)
- http://localhost:1316 (main)

### Test Reports

Test reports are served on the unit port for each worktree:

- http://localhost:4002 (opencode-dev reports)
- http://localhost:4012 (letta-dev reports)
- http://localhost:4022 (letta-dev-2 reports)

## 📊 Status Monitoring

### Check Development Server Status

```bash
bun run dev:worktree status
```

Output shows:

- 🟢 Running servers with URLs
- 🟡 Stopped servers with potential ports
- 🔴 Error states if any

### Check Test Status

```bash
bun run test:worktree status
```

Output shows:

- Last test run times
- Available test reports
- Coverage percentages
- Test artifact locations

## 🔄 Common Workflows

### Start Full Development Environment

```bash
# Start all development servers
bun run dev:worktree start opencode-dev 1313 &
bun run dev:worktree start letta-dev 1314 &
bun run dev:worktree start letta-dev-2 1315 &

# Check status
bun run dev:worktree status
```

### Run Parallel Testing

```bash
# Run E2E tests for all worktrees
bun run test:worktree test-all e2e

# Run different test types in parallel
bun run test:worktree test opencode-dev unit &
bun run test:worktree test letta-dev e2e &
bun run test:worktree test letta-dev-2 visual &
```

### Clean Environment

```bash
# Stop all development servers
bun run dev:worktree stop-all

# Clean all test artifacts
bun run test:worktree clean
```

## 🛠️ Advanced Usage

### Custom Port Allocation

You can specify custom ports when starting servers:

```bash
bun run dev:worktree start opencode-dev 9000
bun run dev:worktree start letta-dev 9001
```

### Isolated Test Environments

Each worktree runs tests in isolation:

- Separate PM2 processes
- Isolated test artifacts
- Independent report servers
- No cross-contamination between worktrees

### PM2 Integration

The scripts use PM2 for process management:

- Automatic restart on file changes
- Memory monitoring and limits
- Log management per worktree
- Graceful shutdown handling

## 🔧 Troubleshooting

### Port Conflicts

If you get port conflicts:

1. Check current status: `bun run dev:worktree status`
2. Stop conflicting server: `bun run dev:worktree stop [worktree]`
3. Start with different port: `bun run dev:worktree start [worktree] [port]`

### Test Failures

If tests fail:

1. Check test status: `bun run test:worktree status`
2. Clean artifacts: `bun run test:worktree clean`
3. Run tests individually: `bun run test:worktree test [worktree] [type]`

### PM2 Issues

If PM2 has issues:

1. Check PM2 status: `pm2 list`
2. View logs: `pm2 logs [app-name]`
3. Restart: `pm2 restart [app-name]`
4. Stop all: `pm2 delete all`

## 📝 Notes

- Each worktree gets its own PM2 ecosystem config
- Temporary configs are created and cleaned up automatically
- Logs are stored in each worktree's `.pids/` directory
- Test artifacts are isolated per worktree
- Scripts handle cleanup on shutdown

This setup enables true parallel development with isolated environments for each
worktree.
