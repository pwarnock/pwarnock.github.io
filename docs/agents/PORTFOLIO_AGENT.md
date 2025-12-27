# Portfolio Agent Guide

The Portfolio Agent creates professional, achievement-focused project entries.

## Required Fields

| Field | Format | Example |
|-------|--------|---------|
| `title` | String | "E-commerce Platform Redesign" |
| `client` | String | "Acme Corporation" |
| `description` | String | "Full-stack redesign increasing conversions 40%" |
| `technologies` | Array | ["React", "TypeScript", "Node.js"] |
| `completion_date` | YYYY-MM | "2024-11" |
| `category` | String | "Web Development" |

## Optional Fields

| Field | Format | Notes |
|-------|--------|-------|
| `github_url` | URL | Must be valid GitHub URL |
| `live_url` | URL | Must be valid HTTP/HTTPS URL |

## Categories

- Web Development
- Mobile Development
- Backend Development
- DevOps
- Data Engineering
- Software Development

## CLI Usage

### Basic Generation
```bash
bun run agent:portfolio \
  --title "Analytics Dashboard" \
  --client "DataTech Solutions" \
  --description "Real-time analytics platform" \
  --technologies "React,TypeScript,PostgreSQL" \
  --completion-date "2024-11" \
  --category "Web Development"
```

### With URLs
```bash
bun run agent:portfolio \
  --title "Open Source CLI" \
  --client "Personal Project" \
  --description "Developer productivity tool" \
  --technologies "Go,Cobra" \
  --completion-date "2024-10" \
  --category "Software Development" \
  --github-url "https://github.com/user/repo"
```

## Writing Style

### Action Verbs (Required)
Start achievement statements with strong verbs:

| Primary | Secondary |
|---------|-----------|
| Led | Architected |
| Developed | Designed |
| Implemented | Built |
| Achieved | Optimized |
| Delivered | Scaled |

### Quantify Impact

| Avoid | Use Instead |
|-------|-------------|
| "Improved performance" | "Reduced load time by 40%" |
| "Many users" | "Served 10,000+ users" |
| "High volume" | "Processed 1M+ transactions daily" |

### Tone
- Professional and confident
- Achievement-focused
- Highlight delivered value
- Use metrics when available

## Output Structure

```markdown
**Led** the development of [project] for [client], achieving [key result].

## Project Overview
Context and scope...

## Challenges
- **Challenge 1:** Problem description
- **Challenge 2:** Problem description

## Technical Solution
- **Implemented** solution 1
- **Architected** solution 2

## Outcomes
- **Achieved** outcome 1
- **Delivered** outcome 2

## Technologies
- **React**
- **TypeScript**
```

## Validation

The agent validates against `scripts/validate-portfolio-frontmatter.js`:

- All required fields present
- Date format: YYYY-MM-DD
- Completion date format: YYYY-MM
- Technologies is an array
- URLs are valid format
- No deprecated fields (demo_url → live_url)

## Troubleshooting

### Invalid date format
Use `YYYY-MM` for completion_date, `YYYY-MM-DD` for date.

### Technologies not array
Pass as comma-separated: `--technologies "React,Node,TypeScript"`

### demo_url deprecated
Use `live_url` instead of `demo_url`.
