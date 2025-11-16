# PM2 Development Server Management

## Why We Use PM2

The Hugo development server can get stuck when checking logs or status while
running. PM2 provides process management that prevents this issue.

## Important Workflow Rules

### ❌ DON'T DO THESE WHILE SERVER IS RUNNING

```bash
# These commands will hang/stuck:
pm2 logs hugo-dev          # Gets stuck reading live logs
pm2 monit                   # Gets stuck in monitoring interface
curl with long output         # Can hang on large responses
tail -f on log files        # Gets stuck following logs
```

### ✅ DO THESE INSTEAD

```bash
# For server status:
pm2 status                   # Quick status check
pm2 list                     # Alternative status check

# For logs:
pm2 logs hugo-dev --lines 50 --nostream  # View recent logs without streaming
pm2 flush hugo-dev          # Clear logs if needed

# For server management:
pm2 restart hugo-dev         # Restart server
pm2 stop hugo-dev           # Stop server
pm2 start hugo-dev          # Start server

# For testing:
curl -s http://localhost:1313 | head -20  # Use -s for silent, limit output
curl -I http://localhost:1313  # Just headers
```

## Safe Development Workflow

### Starting Development

```bash
# Always use PM2 to start
bun run dev  # or: HUGO_ENV=development bun x pm2 start ecosystem.config.cjs
```

### Making Changes

1. Edit files
2. PM2 auto-restarts Hugo (watch mode disabled, but restart on changes)
3. Test with `curl -s` for quick checks
4. Use browser for full testing

### Checking Issues

```bash
# Quick status check (won't hang)
pm2 status

# If issues, restart (fast)
pm2 restart hugo-dev

# If still issues, stop and check logs
pm2 stop hugo-dev
pm2 logs hugo-dev --lines 20 --nostream  # Safe log viewing
pm2 start hugo-dev
```

### Debugging Process

1. **Stop server first**: `pm2 stop hugo-dev`
2. **Check logs**: `pm2 logs hugo-dev --lines 50 --nostream`
3. **Fix issues**: Edit configuration/files
4. **Start server**: `pm2 start hugo-dev`

## Why This Happens

- Hugo's live reload and log streaming creates blocking I/O
- PM2's process management interferes with Hugo's internal streams
- Long-running curl commands can timeout on large HTML output
- Log streaming creates circular dependencies in process management

## Emergency Recovery

If completely stuck:

```bash
# Kill all processes
pkill -f hugo
pkill -f pm2

# Clean start
pm2 start ecosystem.config.cjs
```

## Best Practices

1. **Always use PM2** for starting/stopping
2. **Never stream logs** while server runs
3. **Use `-s` flag** for curl to prevent hanging
4. **Limit output** when testing endpoints
5. **Stop first, debug later** approach for issues
