# Content Agents Documentation

Multi-agent content creation system for generating blog posts, portfolio entries, and tech radar assessments.

## Quick Start

### Using Claude Code Skills (Recommended)

The agents are available as Claude Code skills. Simply ask Claude to:

- "Create a blog post about..." → activates `create-blog` skill
- "Add a project to my portfolio..." → activates `create-portfolio` skill
- "Add X to my tech radar..." → activates `create-tech-radar` skill

### Using CLI Commands

```bash
# Blog posts
bun run agent:blog --title "My Post" --type original --summary "Brief summary"

# Portfolio entries
bun run agent:portfolio --title "Project" --client "Client" --technologies "React,Node"

# Tech radar entries
bun run agent:radar --title "Bun" --quadrant tools --ring trial
```

Use `--interactive` for guided prompts:
```bash
bun run agent:blog --interactive
```

## Agents Overview

| Agent | Purpose | Output Location |
|-------|---------|-----------------|
| Blog Agent | Conversational blog posts with SEO | `content/blog/posts/` |
| Portfolio Agent | Achievement-focused project showcases | `content/portfolio/` |
| Tech Radar Agent | Opinionated technology assessments | `content/tools/` |

## Detailed Guides

- [Blog Agent Guide](./BLOG_AGENT.md)
- [Portfolio Agent Guide](./PORTFOLIO_AGENT.md)
- [Tech Radar Agent Guide](./TECH_RADAR_AGENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

## Architecture

```
src/agents/
├── core/                    # Shared foundation
│   ├── voice-learning.ts    # Style learning system
│   ├── hugo-integration.ts  # Content bundle generation
│   ├── review-workflow.ts   # Draft management
│   └── image-prompt-generator.ts
├── blog/                    # Blog Agent
├── portfolio/               # Portfolio Agent
├── tech-radar/              # Tech Radar Agent
├── cli/                     # CLI interface
└── types/                   # TypeScript definitions
```

## Voice Learning

Agents learn your writing style over time through feedback:

```typescript
// Record positive feedback
await agent.recordFeedback("I love the personal stories", "positive");

// Record negative feedback
await agent.recordFeedback("This is too formal", "negative");
```

Style patterns are stored in `.cody/project/library/style-docs/`.

## Review Workflow

All generated content starts as a draft (`draft: true`). The review workflow:

1. **Generate** → Content created with `draft: true`
2. **Review** → User reviews and provides feedback
3. **Revise** → Agent incorporates feedback
4. **Approve** → User explicitly approves
5. **Publish** → `draft: false` set manually

**Agents never auto-publish.** Explicit approval is always required.

## Validation

Each agent validates content before completion:

| Agent | Validation Script |
|-------|-------------------|
| Blog | `scripts/validate-blog-post.sh` |
| Portfolio | `scripts/validate-portfolio-frontmatter.js` |
| Tech Radar | Schema validation in agent |

## Configuration

Agent configuration in `src/agents/config/agent-config.ts`:

```typescript
{
  type: 'blog',
  audience: ['developers', 'tech enthusiasts'],
  toneGuidelines: ['conversational', 'personal'],
  outputDirectory: 'content/blog/posts',
  validationScripts: ['scripts/validate-blog-post.sh']
}
```
