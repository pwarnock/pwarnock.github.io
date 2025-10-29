# Letta Settings Setup

This directory contains templates for `.letta/` configuration.

## Why .letta is not committed

The `.letta/settings.json` contains absolute paths specific to each developer's machine, so it's excluded from git via `.gitignore`.

## Setup

1. **Copy template**:
   ```bash
   mkdir -p .letta
   cp .letta.example/settings.json .letta/settings.json
   ```

2. **Update paths** in `.letta/settings.json` to match your system:
   - Replace `/path/to/your/repo` with actual paths
   - Update the `project` block ID from your Letta instance

3. **Find your Block ID**:
   ```bash
   letta code  # Start Letta Code in your project
   # Block ID appears in logs or: cat ~/.letta/settings.json
   ```

## Syncing with External Storage

For automated sync with 1Password, Vaults, or other secret stores:

- Create `.letta-sync.sh` (git-ignored) with your sync commands
- Run before starting Letta:
  ```bash
  ./.letta-sync.sh  # custom sync script
  ```

Example using `op` (1Password CLI):
```bash
#!/bin/bash
op read "op://vault/item-name/field" | base64 -d > .letta/settings.json
```

## References

- [Letta Code Documentation](https://docs.letta.com/letta-code)
- [1Password CLI](https://developer.1password.com/docs/cli/)
- [Environment-based config](https://docs.letta.com/letta-code#configuration)
