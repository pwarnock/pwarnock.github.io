# Letta Settings Setup

This directory contains templates for `.letta/` configuration.

## Why .letta is not committed

The `.letta/settings.json` contains absolute paths specific to each developer's
machine, so it's excluded from git via `.gitignore`.

The configuration is synced via Letta's memory block system—persisted between
sessions and machines without needing external services.

## Setup

### Initial Setup (New Machine)

```bash
npm run letta:config:init
```

Or manually:

```bash
mkdir -p .letta
cp .letta.example/settings.json .letta/settings.json
```

### Configure

1. **Edit paths** in `.letta/settings.json`:
   - Replace `/path/to/your/repo` with actual paths on your machine
   - Keep permissions as-is or customize for your workflow

2. **Find your Block ID**:

   ```bash
   letta code  # Start Letta Code in this project
   # Block ID will appear in logs
   # Or check: cat ~/.letta/settings.json | grep -i block
   ```

3. **Update block ID** in `.letta/settings.json`:
   ```json
   {
     "localSharedBlockIds": {
       "project": "block-your-uuid-here"
     }
   }
   ```

## Memory Block Sync

Your `.letta/settings.json` is synchronized with Letta's memory block:

- **On commit**: Configuration is accessible to Letta via memory block
- **On pull/clone**: Git hooks restore `.letta/settings.json` from template
- **Across machines**: Same block ID keeps configuration consistent

No external tools needed—syncing happens via git hooks + Letta memory.

## Schema Updates

Configuration schema is defined in `.letta.schema.json`:

- **After pulling**: `post-merge` hook alerts if schema changed
- **Review updates**: Run `npm run letta:config:update`
- **Auto-check**: Script compares current config against schema
- **Accept changes**: Prompts to merge new properties

This ensures you always inherit new Letta features and properties while
maintaining explicit control.

## If Moving to Another Machine

1. Clone the repo
2. Run `npm run letta:config:init`
3. Update local paths in `.letta/settings.json`
4. Letta will use the same memory block ID for context persistence

## References

- [Letta Code Documentation](https://docs.letta.com/letta-code)
- [Letta Memory System](https://docs.letta.com/guides/agents/memory)
