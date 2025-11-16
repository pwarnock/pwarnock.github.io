# Development Server Management

## PM2 Workflow Guide

### Why PM2 is Essential

The Hugo development server can cause commands to hang when running, especially:

- `pm2 logs` - Gets stuck reading live logs
- `pm2 monit` - Gets stuck in monitoring interface
- Long `curl` commands - Can timeout on large output
- `tail -f` - Gets stuck following logs

### Safe Development Commands

#### ✅ ALWAYS SAFE

```bash
# Server management
pm2 start hugo-dev
pm2 stop hugo-dev
pm2 restart hugo-dev
pm2 status hugo-dev
pm2 list

# Safe testing
curl -s http://localhost:1313 | head -20
curl -I http://localhost:1313
curl -s http://localhost:1313 | grep "specific-pattern"

# Safe log viewing
pm2 logs hugo-dev --lines 50 --nostream
pm2 flush hugo-dev
```

#### ❌ NEVER USE WHILE SERVER RUNNING

```bash
# These will hang/stuck:
pm2 logs hugo-dev          # Gets stuck streaming
pm2 monit                   # Gets stuck in interface
curl -s http://localhost:1313  # Large output hangs
tail -f any/log/file        # Gets stuck following
```

### Development Workflow

#### Starting Development

```bash
# Always use PM2
bun run dev
# or: HUGO_ENV=development bun x pm2 start ecosystem.config.cjs
```

#### Making Changes

1. Edit files
2. PM2 auto-restarts on changes (if watch enabled)
3. Test with safe curl commands
4. Use browser for full testing

#### Checking Issues

```bash
# Quick status (always safe)
pm2 status

# If issues, restart (fast)
pm2 restart hugo-dev

# If still issues, stop then debug
pm2 stop hugo-dev
pm2 logs hugo-dev --lines 20 --nostream  # Safe log viewing
pm2 start hugo-dev
```

#### Emergency Recovery

```bash
# If completely stuck
pkill -f hugo
pkill -f pm2
pm2 start ecosystem.config.cjs
```

## PM2 Configuration

### ecosystem.config.cjs

```javascript
module.exports = {
  apps: [
    {
      name: 'hugo-dev',
      script: 'hugo',
      args: 'server --buildDrafts --buildFuture --disableFastRender --port 1313 --config config/development/hugo.toml,hugo.toml',
      env: {
        HUGO_ENV: 'development',
      },
      watch: false, // Disabled to prevent hanging
      ignore_watch: ['node_modules', '.git'],
      max_memory_restart: '1G',
      restart_delay: 4000,
      autorestart: true,
    },
  ],
};
```

### Key Settings Explained

- **watch: false** - Prevents file watching conflicts with Hugo
- **restart_delay: 4000** - Gives Hugo time to shut down cleanly
- **max_memory_restart** - Prevents memory leaks
- **autorestart: true** - Auto-recovery from crashes

## Hugo Server Issues

### Common Problems

#### Server Hanging on Start

- **Cause**: Port conflicts, file locks, corrupted cache
- **Fix**: `pkill -f hugo` then restart

#### CSS Not Updating

- **Cause**: Hugo cache, browser cache
- **Fix**: Clear browser cache, restart PM2

#### DaisyUI Components Not Working

- **Cause**: Missing DaisyUI classes, wrong theme variables
- **Fix**: Check DaisyUI component classes, verify theme variables

#### Alpine.js Not Loading

- **Cause**: Missing file, wrong path, CDN issues
- **Fix**: Check `assets/js/alpinejs.min.js` exists

#### Live Reload Not Working

- **Cause**: `--disableFastRender` flag, WebSocket issues
- **Fix**: This is expected behavior with current config

### Debugging Process

#### Step 1: Quick Check

```bash
pm2 status  # Always safe
```

#### Step 2: If Issues, Stop

```bash
pm2 stop hugo-dev
```

#### Step 3: Safe Investigation

```bash
pm2 logs hugo-dev --lines 50 --nostream
curl -I http://localhost:1313
```

#### Step 4: Fix and Restart

```bash
# Make fixes
pm2 start hugo-dev
```

## Browser Testing

### Safe Testing Methods

```bash
# Quick connectivity test
curl -I http://localhost:1313

# Check specific elements
curl -s http://localhost:1313 | grep -o 'alpinejs[^"]*'

# Limited output to prevent hanging
curl -s http://localhost:1313 | head -50
```

### What to Test

1. **Navigation**: Mobile menu, desktop links
2. **Theme Switcher**: Dropdown functionality, theme persistence
3. **Social Links**: All social media links work
4. **Responsiveness**: Mobile vs desktop layouts
5. **Alpine.js**: All interactive elements working

## Performance Monitoring

### PM2 Metrics

```bash
pm2 status  # Shows CPU, memory, restarts
pm2 show hugo-dev  # Detailed process info
```

### Key Metrics to Watch

- **CPU Usage**: Should be < 10% normally
- **Memory Usage**: Should be stable, not growing
- **Restarts**: Should be 0 after initial start
- **Uptime**: Should be continuous during development

## Best Practices

### Development Habits

1. **Always use PM2** for server management
2. **Never stream logs** while server runs
3. **Use `-s flag** for curl to prevent hanging
4. **Limit output** when testing endpoints
5. **Stop first, debug later** approach

### File Management

1. **Save frequently** - PM2 will restart Hugo
2. **Check CSS variables** when styling issues occur
3. **Verify Alpine.js** when interactions fail
4. **Test responsive** after layout changes

### Troubleshooting Mindset

1. **Isolate the issue** - Check one thing at a time
2. **Use safe commands** - Don't use hanging commands
3. **Document solutions** - Update docs when fixing issues
4. **Ask for help** - Use logs and status for debugging

## Integration with Other Tools

### Git Integration

```bash
# Safe workflow
git add .
git commit -m "message"
pm2 restart hugo-dev  # If needed
```

### Testing Integration

```bash
# Before running tests
pm2 stop hugo-dev
# Run tests
pm2 start hugo-dev
```

### Build Integration

```bash
# For production builds
pm2 stop hugo-dev
bun run build:production
pm2 start hugo-dev  # Back to development
```

This workflow ensures reliable development without hanging commands or server
conflicts.
