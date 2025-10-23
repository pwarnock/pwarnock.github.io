# AGENTS.md - Cody Framework Development Guide

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
- Use semantic versioning: v[major.minor.patch]-[name] (max 30 chars, lowercase, dashes only)
- Always commit to git after completing each phase
- Test changes before moving to next phase
- Update feature backlog status after version completion
- Create retrospective and release notes for each version
- Use template placeholders {{cfRoot}}, {{cfConfig}}, etc. correctly
- Follow document templates in .cody/config/templates/
- Maintain living documents (feature-backlog.md, release-notes.md)

## Testing
- Test after each coding phase before git commit
- USER must approve work before proceeding to next phase
- No automated test framework detected - manual testing required