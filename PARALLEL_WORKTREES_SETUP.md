# 🚀 Parallel Worktrees Development & Testing Setup

## ✅ What's Working Now

### Development Servers

- **opencode-dev**: Running on http://localhost:1314 ✅
- **letta-dev**: Available to start on port 1315
- **letta-dev-2**: Available to start on port 1316

### Scripts Created

- `scripts/worktree-simple.sh` - Simple Hugo server management
- `scripts/worktree-dev.sh` - PM2-based server management (fixed)
- `scripts/worktree-tests.sh` - Parallel testing framework

## 🛠️ Quick Start Commands

### Start Development Servers

```bash
# Start opencode-dev (already running on 1314)
bun run dev:worktree-simple start opencode-dev 1313

# Start letta-dev on port 1315
bun run dev:worktree-simple start letta-dev 1315

# Start letta-dev-2 on port 1316
bun run dev:worktree-simple start letta-dev-2 1316

# Check status
bun run dev:worktree-simple status
```

### Run Tests in Parallel

```bash
# Run tests for specific worktree
bun run test:worktree test opencode-dev e2e
bun run test:worktree test letta-dev unit

# Run tests for all worktrees
bun run test:worktree test-all e2e
bun run test:worktree test-all unit

# Check test status
bun run test:worktree status
```

## 🌐 Access URLs

### Development Previews

- http://localhost:1313 (opencode-dev)
- http://localhost:1314 (opencode-dev - currently active)
- http://localhost:1315 (letta-dev)
- http://localhost:1316 (letta-dev-2)

### Test Reports

- http://localhost:4002 (opencode-dev reports)
- http://localhost:4012 (letta-dev reports)
- http://localhost:4022 (letta-dev-2 reports)

## 📊 Current Status

### Running Servers

- ✅ **opencode-dev**: http://localhost:1314 (Hugo server)
- ⏸️ **letta-dev**: Not started
- ⏸️ **letta-dev-2**: Not started

### Available Worktrees

- opencode-dev
- letta-dev
- letta-dev-2

## 🔄 Common Workflows

### Start Full Development Environment

```bash
# Start all worktrees in background
bun run dev:worktree-simple start opencode-dev 1313 &
bun run dev:worktree-simple start letta-dev 1315 &
bun run dev:worktree-simple start letta-dev-2 1316 &

# Check status
bun run dev:worktree-simple status
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
bun run dev:worktree-simple stop-all

# Clean all test artifacts
bun run test:worktree clean
```

## 🎯 Key Benefits

### ✅ Isolated Environments

- Each worktree runs on separate port
- No cross-contamination between projects
- Independent test artifacts and reports

### ✅ Parallel Development

- Work on multiple features simultaneously
- Test changes without stopping other work
- Compare different approaches side-by-side

### ✅ Easy Management

- Simple commands for start/stop/status
- Automatic port allocation
- Process management with PIDs

### ✅ Testing Integration

- Run tests for specific worktrees
- Parallel test execution
- Isolated test results per worktree

## 🔧 Advanced Usage

### Custom Port Allocation

```bash
# Use custom ports
bun run dev:worktree-simple start opencode-dev 9000
bun run dev:worktree-simple start letta-dev 9001
```

### Background Processes

```bash
# Start servers in background
bun run dev:worktree-simple start opencode-dev 1313 &

# View logs
tail -f .worktrees/opencode-dev/.hugo-dev.log
```

### Process Management

```bash
# Check running processes
ps aux | grep hugo

# Kill specific process
kill <PID>

# Stop specific worktree
bun run dev:worktree-simple stop opencode-dev
```

## 📝 Notes

### Simple Script vs PM2 Script

- **Simple script**: Direct Hugo process management, lightweight
- **PM2 script**: Advanced process management with restarts, monitoring

### Port Conflicts

- Scripts check for port conflicts
- Automatic PID file management
- Clean shutdown on port conflicts

### Test Isolation

- Each worktree has isolated test artifacts
- Separate report servers on different ports
- No cross-test contamination

## 🎉 Ready to Use

Your parallel worktrees development environment is now set up and working! You
can:

1. **Start multiple development servers** on different ports
2. **Run tests in parallel** across worktrees
3. **Switch between worktrees** without stopping others
4. **Compare changes** side-by-side in different browsers

The system is designed for true parallel development with isolated environments
for each worktree.
