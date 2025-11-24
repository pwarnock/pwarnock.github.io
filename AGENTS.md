# Development & Agent Workflow Guide

This is the **single source of truth** for AI agent and developer workflow on this project.

## 🚀 Quick Navigation

**First Time Setup?** → [docs/tutorials/GETTING_STARTED.md](/docs/tutorials/GETTING_STARTED.md)  
**Adding Content?** → [docs/tutorials/ADDING_BLOG_POST.md](/docs/tutorials/ADDING_BLOG_POST.md)  
**Full Documentation** → [docs/README.md](/docs/README.md) (Master index)

---

## Agent Initialization

**Before starting work, run the agent initialization script:**

```bash
./scripts/agent-init.sh
```

This script will:

- ✅ Check for Cody Framework updates
- ✅ Verify `.cody` directory health
- ✅ Display key guidelines and commands
- ✅ Show available tasks

**Update Check**: The script automatically checks for Cody Framework updates on
initialization. If updates are available, you'll be notified to run
`:cody upgrade`.

**Manual Update Check**: Run `./.cody/config/scripts/upgrade-check.sh` to check
for updates at any time.

## Documentation Rules

**IMPORTANT**: Read `/docs/README.md` before creating or modifying
documentation.

### Before Creating a New Doc

1. **Check the index** in `/docs/README.md` - does this topic already exist?
2. **Search `/docs`** - use grep to look for related content:
   ```bash
   grep -r "your topic" docs/
   ```
3. **If it exists**: add to the existing doc with a date stamp
4. **If truly new**: create it in `.tmp/` first and link to a parent issue
5. **Never duplicate** solutions across multiple docs

### Documentation Governance

- **Master index**: `/docs/README.md` - search this first
- **Canonical sources**: Each topic has ONE authoritative doc
- **Updates go to canonical source**, not new files
- **Old docs marked**: Archived, consolidated, or WIP status
- **Agents follow rules**: Check index before proposing new docs

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT
use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" -t bug|feature|task -p 0-4 --json
bd create "Issue title" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Phase 1: Linking to Cody Features (Manual)

When working on a Cody feature:

1. **Find feature in backlog**: `.cody/project/build/feature-backlog.md`
2. **Create Beads issue** for each task:
   ```bash
   bd create "Implementation task (vX.Y.Z)" -t task -p 2 --json
   ```
3. **Update backlog** with issue reference:
   ```markdown
   ## Feature: Name
   - Implementation: See bd-NNN for details
   ```
4. **Link dependent issues**:
   ```bash
   bd create "Subtask" -t task --deps blocks:bd-NNN --json
   ```

See [docs/integration/CODY_BEADS_WORKFLOW.md](/docs/integration/CODY_BEADS_WORKFLOW.md) for complete workflow.

### Auto-Sync

bd automatically syncs with git:

- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### MCP Server (Recommended)

If using Claude or MCP-compatible clients, install the beads MCP server:

```bash
pip install beads-mcp
```

Add to MCP config (e.g., `~/.config/claude/config.json`):

```json
{
  "beads": {
    "command": "beads-mcp",
    "args": []
  }
}
```

Then use `mcp__beads__*` functions instead of CLI commands.

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and QUICKSTART.md.

## Documentation for Agents

When working on this project:

1. **Check `/docs/` namespace first** - For all operational and workflow
   documentation
2. **Reference development guides** - docs/development/STYLE_GUIDE.md,
   docs/development/ACCESSIBILITY.md for architecture
3. **Consult `.cody/` for version tracking** - Feature backlog, retrospectives,
   version status
4. **Never create TodoWrite lists** - Use `bd` for all work tracking

Key docs to bookmark:

- `docs/operations/RELEASE_WORKFLOW.md` - How to run the professional release workflow
- `docs/operations/DEPLOYMENT.md` - Detailed deployment steps, version management,
  and post-release checklist
- `docs/operations/ROLLBACK_PROCEDURES.md` - Emergency incident response and rollback
  recovery
- `docs/development/STYLE_GUIDE.md` - CSS, template, and architecture
  conventions
- `docs/integration/CODY_BEADS_WORKFLOW.md` - Feature planning → Beads issues → releases
  (Phase 1 manual linking implementation)

## Project Documentation

### Documentation Namespace

**All project operational documentation lives in `/docs/`** - this is the
authoritative source for all developers.

**Separation of concerns:**

- **`/docs/`** - Operational guides (development workflow, deployment, release
  process)
- **`/.cody/`** - Cody Framework internals (version tracking, feature backlog,
  retrospectives)
- **Root level files** - Quick reference (AGENTS.md, README.md)

### Operational Guides in `/docs/`

- **docs/operations/RELEASE_MANAGEMENT.md** - Detailed release procedures and
  post-release validation
- **docs/operations/DEPLOYMENT_NOTES.md** - Deployment configuration,
  troubleshooting, and recovery steps
- **docs/operations/ENVIRONMENT_CONFIG.md** - Environment setup and
  configuration

### Quick Reference (Root Level)

- **docs/development/STYLE_GUIDE.md** - Hugo site architecture, design system,
  template conventions, and development workflow
- **docs/development/ACCESSIBILITY.md** - Accessibility standards and WCAG
  compliance requirements
- **docs/development/VERSIONING_GUIDELINES.md** - Semantic versioning principles
- **AGENTS.md** - Agent workflow and development process (this file)

### Content Structure

- All content follows the structure defined in docs/development/STYLE_GUIDE.md
- Use `/content/` for site content, `/layouts/` for templates
- Section pages use `_default/list.html`, single pages use
  `_default/single.html`

### Template System

- Base template: `layouts/_default/baseof.html`
- Reusable components: `layouts/partials/components/`
- Page sections: `layouts/partials/sections/`
- Follow naming conventions: kebab-case for files, BEM for CSS classes

Refer to docs/development/STYLE_GUIDE.md for the complete architecture and
workflow guidelines.

## Build Commands

- `:cody help` - Show all available commands
- `:cody plan` - Start planning phase (discovery, PRD, plan documents)
- `:cody build` - Start build phase and create feature backlog
- `:cody version build` - Create and work on a specific version
- `:cody version add` - Add new version to backlog
- `:cody refresh update` - Update project documents after changes
- `:cody refresh` - Refresh AI agent memory
- `:cody relearn` - Relearn project context
- `:cody upgrade` - Upgrade Cody Framework

## Code Style Guidelines

- Follow Cody Framework document structure strictly
- Use semantic versioning: v[major.minor.patch]-[name] (max 30 chars, lowercase,
  dashes only)
- Always commit to git after completing each phase
- Test changes before moving to next phase
- Update feature backlog status after version completion
- Create retrospective and release notes for each version
- Use template placeholders {{cfRoot}}, {{cfConfig}}, etc. correctly
- Follow document templates in .cody/config/templates/
- Maintain living documents (feature-backlog.md, release-notes.md)

## Testing Infrastructure

This project features a comprehensive, enterprise-grade testing infrastructure:

### Multi-Layer Testing Strategy

#### Unit Tests (Go)

- **Framework**: Go testing with structured logging
- **Coverage**: 4.5% baseline with automated reporting
- **Location**: `test/support/` directory
- **Command**: `go test -v -race ./support/...`

#### Behavior-Driven Development (BDD)

- **Framework**: Godog (Cucumber for Go)
- **Coverage**: 9/9 scenarios passing
- **Location**: `test/features/` and `test/step_definitions/`
- **Command**: `cd test && go test -v ./...`

#### End-to-End Testing (TypeScript)

- **Framework**: Playwright with TypeScript
- **Coverage**: Visual regression, performance, user journeys
- **Location**: `tests/` directory
- **Command**: `bunx playwright test`

### Development Workflow

#### Path-Based Build Control

Automatically detects change types and applies optimal build strategies:

- **Content Changes**: Fast build (~30s) with validation
- **Infrastructure Changes**: Comprehensive testing (~5min)
- **Documentation Changes**: Validation only (~1min)

```bash
# Automatic detection
bun run build:path

# Force specific builds
bun run build:infra    # Comprehensive testing
bun run build:content  # Fast content build
```

#### Watch Mode Development

```bash
# Watch all tests
bun run test:watch

# Watch specific test types
bun run test:e2e:watch      # End-to-end tests
bun run test:visual:watch   # Visual regression
bun run test:perf:watch     # Performance benchmarks
```

### Environment Management

#### Pseudo Upstream Remotes

Logical environment separation using same physical repository:

```bash
# Environment branches
git checkout staging     # Pre-production testing
git checkout production  # Live deployment

# Deployment commands
bun run deploy:staging
bun run deploy:production
bun run sync:env
```

#### CI/CD Pipeline

- **Multi-environment matrix**: Ubuntu, Windows, macOS
- **Cross-browser testing**: Chromium, Firefox, Safari
- **Coverage gates**: Automated quality assurance
- **Security scanning**: Dependency vulnerability checks

## Documentation & Best Practices

- Always check Context7 for up-to-date library documentation and best practices
- Use `context7_resolve_library_id` followed by `context7_get_library_docs` for
  current API references
- Verify library versions and compatibility before implementation
- Keep documentation references current with project dependencies
- Use Bun for package management and scripts (see
  `docs/development/BUN_MIGRATION_GUIDE.md`)

## Context7 MCP Server Setup

**IMPORTANT**: Ensure Context7 MCP server is available for library documentation
access.

### Installation

```bash
# Install Context7 MCP server
npm install -g @context7/mcp-server
# or
pip install context7-mcp
```

### Configuration

Add to your MCP client configuration (e.g., Claude Desktop
`claude_desktop_config.json`):

> **⚠️ Security Note**: The following examples use placeholder values. Replace
> with your actual configuration when implementing.

```json
{
  "mcpServers": {
    "context7": {
      "command": "context7-mcp",
      "args": [],
      "env": {
        "API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Verification

Test Context7 MCP availability:

````bash
# Check if MCP server responds
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "context7/resolve", "params": {"libraryName": "example-library"}}'
````

### Troubleshooting

- **Server not responding**: Restart MCP client and check logs
- **Library not found**: Verify library name spelling and availability
- **Connection issues**: Check firewall and network settings
- **Version conflicts**: Update to latest Context7 MCP server version

**Without Context7 MCP, agents cannot access current library documentation and
may provide outdated information.**

## .cody Directory Access Rules

**STRICT RULE: Never manually edit .cody files**

- `.cody` is framework-managed territory controlled by Cody Framework
- Only `:cody` commands should modify contents
- Manual edits risk breaking framework functionality and version management

### Legitimate Access Reasons (Read-Only Only)

**1. Framework Documentation Reference**

- Reading `config/commands/` for available `:cody` commands
- Consulting `templates/` to understand framework structure
- Reviewing framework settings in `config/settings.json`

**2. Emergency Debugging**

- When `:cody` commands fail unexpectedly
- Investigating framework state for troubleshooting
- Checking version-specific logs in `project/versions/`

**3. Framework Understanding & Customization**

- Studying framework templates for customization needs
- Understanding project history in `project/build/`
- Learning from retrospectives in version folders

**4. Maintenance & Cleanup**

- Manual cleanup when framework leaves orphaned files
- Backup before framework upgrades
- Verification after framework updates

**5. Audit & Compliance**

- Reviewing change history in version folders
- Verifying framework-generated documentation
- Compliance checks on project planning docs

### Access Request Process

1. **Document the reason** in issue tracker
   (`bd create "Need .cody access for [reason]"`)
2. **Attempt framework solution first** (`:cody refresh`, `:cody relearn`)
3. **Read-only access only** - never modify files
4. **Log what was accessed** for audit trail
5. **Report findings** to improve framework

### Emergency Access Protocol

- Only when `:cody` commands are completely non-functional
- First run health check: `./scripts/check-cody-health.sh`
- Create backup: `./scripts/backup-cody.sh`
- Document all access and findings in bd issue
- Consider framework reinstall if corruption suspected

### Files That Should Never Be Touched

**Framework Core:**

- `config/settings.json` - Framework configuration
- `config/commands/*.md` - Command definitions
- `config/scripts/*.sh` - Framework scripts
- `templates/**/*.md` - Framework templates

**Generated Content:**

- `project/build/feature-backlog.md` - Managed by `:cody build`
- `project/versions/**` - Managed by `:cody version` commands
- `project/work/**` - Active work managed by framework

### Exceptions Requiring Framework Team Approval

- Framework upgrades or patches
- Migration between framework versions
- Recovery from framework corruption
- Custom framework extensions

### .cody Utility Scripts

**Agent Initialization** (`./scripts/agent-init.sh`):

- Checks for Cody Framework updates on startup
- Verifies `.cody` directory health
- Displays key guidelines and available tasks
- Run at the start of each work session

**Health Check** (`./scripts/check-cody-health.sh`):

- Verifies `.cody` directory integrity
- Checks for missing critical files
- Run before considering emergency access

**Backup** (`./scripts/backup-cody.sh`):

- Creates timestamped backup of `.cody` directory
- Essential before any emergency investigation
- Includes verification of backup integrity

## Git & Deployment Workflow

### Commit & Version Management

1. **Manual Version Bumping**
   - Version must be manually updated in `package.json` before release (SemVer)
   - Build process automatically syncs version to `data/version.toml` for the
     footer
   - Use `bun pm version patch/minor` to update

2. **Three-Stage Release Process**

   ```bash
   # Stage 1: Pre-Release (RC for testing)
   ./scripts/release.sh pre    # Creates v0.17.1-rc.1
   FORCE_PUSH=yes git push upstream v0.17.1-rc.1
   bun run deploy:staging && bun run test:e2e

   # Stage 2: Production Release (after RC passes)
   ./scripts/release.sh post   # Creates v0.17.1
   FORCE_PUSH=yes git push upstream main v0.17.1
   bun run deploy:production
   ```

3. **Push Confirmation**
   - Show commit summary and file diffs
   - Wait for explicit "yes" confirmation
   - Pre-push hook tests build and shows what deploys
   - Use `FORCE_PUSH=yes` only for release pushes (guarded by confirmation)

**Why**: Pre-commit hook ensures code quality, manual versioning ensures
control, three-stage releases catch issues before production.

See `/docs/operations/RELEASE_WORKFLOW.md` for detailed procedures.

## Testing

- Test after each coding phase before git commit
- USER must approve work before proceeding to next phase
- No automated test framework detected - manual testing required
