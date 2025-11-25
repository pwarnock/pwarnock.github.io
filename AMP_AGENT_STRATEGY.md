# Amp Agent Strategy: Implementation Ready

**Status**: Ready for Testing | **Date**: 2025-11-25

## Quick Summary

You had context bloat (freezing). Solution: Use **four context engineering strategies** + **Claude's native subagents**.

### Four Strategies
1. **Isolate Context** - Each agent separate thread
2. **Compress Context** - Summarize at handoffs (5000 → 500 tokens)
3. **Cache Context** - Reuse system prompts (90% savings)
4. **Select Context** - Only pass needed info

## Files Created

✅ **Documentation**
- This file: AMP_AGENT_STRATEGY.md
- SUBAGENT_QUICK_START.md - Quick patterns
- AMP_COMMANDS_REFERENCE.md - Command guide
- AGENTS.md - Updated with subagent section

✅ **Agent Definitions** (in `.claude/agents/`)
- cody-executor.md - Cody PBT executor
- beads-manager.md - Issue tracking
- context-librarian.md - Compression & state

✅ **Custom Commands** (in `.agents/commands/`)
- cody-build.md - Create versions
- ready-work.md - Show unblocked work
- cody-help.md - Cody commands
- claim-issue.md - Start work
- close-issue.md - Complete work

✅ **Session State**
- .claude/session-state.json - Track checkpoint

## How It Works

**User asks Amp**: "Build v1.3.0-feature"

**Amp delegates**:
1. cody-executor → run `:cody version build`
2. context-librarian → compress output
3. beads-manager → create issues
4. Session state → save checkpoint

**Result**: 5-10s, small context, no freezing

## Next: Test It

Try:
- `/ready-work` - Check unblocked issues
- `/cody-help` - Show Cody commands
- Ask: "Build v1.3.0-test version"

See full docs in AMP_AGENT_STRATEGY.md, SUBAGENT_QUICK_START.md, AMP_COMMANDS_REFERENCE.md

