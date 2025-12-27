# Tech Radar Agent Guide

The Tech Radar Agent creates opinionated but balanced technology assessments following the BYOR (Build Your Own Radar) structure.

## Required Fields

| Field | Options |
|-------|---------|
| `title` | Technology name (e.g., "Bun", "htmx") |
| `description` | Brief description (1-2 sentences) |
| `quadrant` | techniques, tools, platforms, languages-and-frameworks |
| `ring` | adopt, trial, assess, hold |

## Ring Definitions

| Ring | Meaning | Action | Content Tone |
|------|---------|--------|--------------|
| **adopt** | Production-ready, proven | Use for new projects | Confident, encouraging |
| **trial** | Promising, worth piloting | Evaluate for specific use cases | Cautiously optimistic |
| **assess** | Emerging, worth watching | Research and experiment | Exploratory, measured |
| **hold** | Avoid or migrate from | Plan migration, no new adoption | Direct but fair |

## Quadrant Examples

| Quadrant | Examples |
|----------|----------|
| techniques | TDD, pair programming, GitOps, IaC |
| tools | Bun, Vite, Webpack, CI/CD platforms |
| platforms | AWS, Kubernetes, serverless, edge |
| languages-and-frameworks | Rust, TypeScript, React, Next.js |

## CLI Usage

### Basic Generation
```bash
bun run agent:radar \
  --title "Bun" \
  --description "Fast JavaScript runtime and package manager" \
  --quadrant tools \
  --ring trial
```

### With Tags
```bash
bun run agent:radar \
  --title "htmx" \
  --description "Lightweight library for AJAX and WebSockets in HTML" \
  --quadrant languages-and-frameworks \
  --ring assess \
  --tags "javascript,html,hypermedia"
```

## Content Structure by Ring

### ADOPT
- Implementation best practices
- Production deployment guidance
- Long-term maintenance considerations
- Team training resources

### TRIAL
- When and where to pilot
- Success criteria for evaluation
- Comparison with alternatives
- Risk mitigation strategies

### ASSESS
- Key questions before adoption
- Evaluation criteria
- Community health indicators
- Research guidance

### HOLD
- Reasons for hold recommendation
- Migration path to alternatives
- Risk assessment
- Recommended replacements

## Writing Guidelines

### Do
- Provide technical depth and context
- Consider practical adoption implications
- Assess maturity and ecosystem support
- Use evidence from real-world usage

### Don't
- Be purely opinionated without evidence
- Use hype-driven language
- Ignore potential drawbacks
- Make absolute statements

### Vocabulary
- adopt, trial, assess, hold
- maturity, ecosystem, production-ready
- trade-offs, considerations, implications
- community, governance, viability

## Output Structure

```yaml
---
title: "Technology Name"
date: 2024-12-26
draft: true
description: "Brief description"
quadrant: "tools"
ring: "trial"
tags: ["tag1", "tag2"]
---
```

```markdown
## Overview
Ring-specific context...

## Key Features
- Feature 1
- Feature 2

## Strengths
- Strength 1

## Weaknesses
- Weakness 1

## Use Cases
- Use case 1

## [Ring] Recommendation
Ring-specific guidance...

## Ecosystem Assessment
Community and tooling analysis...

## Conclusion
**Maturity:** Level
**Future Outlook:** Prediction
```

## Validation

The agent validates:
- Required frontmatter fields present
- Quadrant is valid value
- Ring is valid value
- Content has required sections

## Troubleshooting

### Invalid quadrant
Use one of: techniques, tools, platforms, languages-and-frameworks

### Invalid ring
Use one of: adopt, trial, assess, hold

### Missing sections
Ensure content includes Overview, Strengths/Weaknesses, and Recommendation sections.
