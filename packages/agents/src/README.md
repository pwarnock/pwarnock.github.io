# Content Agents

Multi-agent content creation system for Peter Warnock's Hugo website.

## Architecture

```
src/agents/
├── core/              # Core foundation components
│   ├── voice-learning.ts
│   ├── hugo-integration.ts
│   ├── review-workflow.ts
│   └── image-prompt-generator.ts
├── blog/              # Blog post agent
├── portfolio/         # Portfolio project agent
├── tech-radar/        # Tech radar agent
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── config/            # Agent configurations
```

## Core Components

### Voice Learning System
- Captures user feedback during review sessions
- Maintains content-type-specific style patterns
- Persists style guide to `.agents/style-docs/`

### Hugo Integration Module
- Generates content bundles with proper frontmatter
- Follows existing content structure
- Integrates with validation scripts

### Review Workflow Engine
- Manages draft creation and iteration cycles
- Tracks inline comments and approvals
- Requires sign-off before finalizing

### Image Prompt Generator
- Creates context-aware prompts for each content type
- Tailors prompts to match content tone

## Content Type Agents

### Blog Post Agent
- Conversational tone
- SEO/AEO optimization
- Content types: original, curated, embed, project

### Portfolio Agent
- Professional, achievement-focused
- Impact metrics
- Showcase-oriented

### Tech Radar Agent
- Opinionated but balanced
- 4 radar sub-types: adopt, trial, assess, hold
- BYOR-compatible structure

## Usage

Agents will be accessible via:
- Claude Code Skills (primary interface)
- CLI tool (optional fallback)

## Development

```bash
# Compile TypeScript
bun run build:agents

# Run tests
bun run test:agents
```

## Storage

- Style documentation: `.agents/style-docs/`
- Session history: `.agents/sessions/`
