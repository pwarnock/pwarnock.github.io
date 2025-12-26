# Product Requirements Document (PRD)

This document formalizes the idea and defines the what and the why of the
product the USER is building.

## Section Explanations

| Section          | Overview                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Summary          | Sets the high-level context for the product.                                                    |
| Goals            | Articulates the product's purpose — core to the "why".                                          |
| Target Users     | Clarifies the audience, essential for shaping features and priorities.                          |
| Key Features     | Describes what needs to be built to meet the goals — part of the "what".                        |
| Success Criteria | Defines what outcomes validate the goals.                                                       |
| Out of Scope     | Prevents scope creep and sets boundaries.                                                       |
| User Stories     | High-level stories keep focus on user needs (why) and guide what to build.                      |
| Assumptions      | Makes the context and unknowns explicit — essential for product clarity.                        |
| Dependencies     | Identifies blockers and critical integrations — valuable for planning dependencies and realism. |

## Summary

A multi-agent content creation system integrated into the Hugo workflow that acts as a collaborative web producer, learning the user's voice through interaction to generate authentic, properly structured content bundles with frontmatter, image prompts, and interactive review workflows for blog posts, portfolio projects, and tech radar entries.

## Goals

- Eliminate writer's block and reduce context switching in content creation
- Ensure all content requirements (frontmatter, structure, assets) are met automatically
- Generate authentic content that captures the user's unique voice and distinguishes between content types
- Provide interactive review workflow with inline feedback and automated validation
- Create consistent, concise, SEO/AEO-friendly output without "AI slop"
- Integrate seamlessly with existing Hugo workflow and validation guardrails

## Target Users

**Primary User**: Peter Warnock (site owner)
- Creates blog posts sharing personal thoughts and technical insights
- Maintains portfolio showcasing experience for recruiters and peers
- Publishes tech radar assessments with opinionated technology analysis
- Experiences context switching between writing, formatting, and asset creation

**Future Users**: Open source community and other agents (v2+)

## Key Features

### Core Agent Capabilities
- **Interactive Content Generation**: Conversational interface where user provides URLs, notes, and context; agent asks clarifying questions like a web producer
- **Voice Learning & Documentation**: Agent learns user's voice through interaction, documents and refines style guide over time without requiring example content
- **Hugo Content Bundle Generation**: Creates properly structured content bundles with valid frontmatter for each content type
- **Image Prompt Generation**: Generates detailed image prompts for every post (A2A image generation in future versions)
- **Content-Type Differentiation**: Maintains distinct voice and approach for each content type based on audience

### Content Type Agents

**Blog Post Agent**
- Audience: General readership
- Tone: Personal, conversational, sharing thoughts and insights
- Output: Blog post content bundle with frontmatter (title, date, draft, tags, description)
- Special features: SEO/AEO optimization for discoverability

**Portfolio Project Agent**
- Audience: Recruiters, hiring managers, technical peers
- Tone: Professional, achievement-focused, showcase-oriented
- Output: Portfolio content bundle with project metadata, images, links
- Special features: Highlights impact and technical depth

**Tech Radar Agent (4 sub-types)**
- Audience: Senior technical decision-makers, contract evaluators, peers, product roles
- Tone: Opinionated but broad, balanced perspective
- Output: Tech radar entries with radar metadata structure
- Special features: ThoughtWorks BYOR-compatible structure

### Review & Validation
- **Interactive Review Workflow**: Inline comments/suggestions, section-level iteration
- **Automated Validation Checks**: Frontmatter validation, asset requirements, structure compliance
- **Sign-off Required**: No blind publishing; user must approve before final output
- **Concise Output**: Agent avoids overachieving; focuses on essential content
- **Quality Guardrails**: Stays within existing validation scripts and Hugo conventions

### Technical Integration
- **Implementation Options**: Claude Code skill/agent or CLI tool (no web interface)
- **Output Format**: Hugo content bundles ready for `content/` directory
- **Validation Compliance**: Integrates with existing scripts (validate-blog-post.sh, validate-portfolio-frontmatter.js)
- **File Naming**: Follows established conventions

## Success Criteria

- **Authenticity**: Content doesn't feel like "AI slop" - analysis can distinguish content types and voice is sufficiently unique from top results
- **Usability**: User actually uses the system regularly (reduces context switching pain point)
- **Quality**: Generated content passes all existing validation scripts without modification
- **Voice Capture**: Agent maintains consistent, authentic voice across multiple sessions and content types
- **Efficiency**: Time from initial idea to ready-for-review content is significantly reduced
- **Assets**: Every generated post includes appropriate image prompts
- **Documentation**: Agent creates and maintains style documentation through interactions

## Out of Scope

- Web interface or UI (v1 focuses on skill/agent or CLI)
- Actual image generation (v1 generates prompts only; A2A in future versions)
- Automatic publishing to production (always requires user sign-off)
- Multi-user support (v1 is single-user; open source in future)
- Content type discovery beyond the three specified (blog, portfolio, tech radar)
- Voice learning from example content (learns through interaction only)
- Side-by-side comparison review workflow
- Natural language processing of existing content to extract voice patterns

## User Stories

- As a content creator, I want to provide raw notes and URLs to an agent that expands them into a first draft in my voice, so I can overcome writer's block
- As a content creator, I want the agent to ask me clarifying questions interactively, like working with a web producer, so the final content captures my intent
- As a content creator, I want different tones for different content types (personal blog vs professional portfolio vs opinionated tech radar), so each audience receives appropriately tailored content
- As a content creator, I want automated frontmatter validation and asset generation, so I don't have to context-switch between writing and technical requirements
- As a content creator, I want to review and approve content through inline comments before finalizing, so I maintain quality control and avoid publishing low-quality content
- As a content creator, I want the agent to learn my voice through our interactions over time, so the content becomes increasingly authentic and requires less editing
- As a content creator, I want image prompts generated automatically for each post, so I don't have to switch to a separate image generation workflow

## Assumptions

- User's existing validation scripts (validate-blog-post.sh, validate-portfolio-frontmatter.js) provide adequate guardrails
- Hugo content bundle structure is sufficient for all three content types
- User can provide enough context in initial prompts for agent to generate reasonable first drafts
- Voice can be learned through interaction without requiring example content analysis
- Claude Code skills/agents or CLI tools provide adequate interface for v1
- Existing image generation workflows can accept text prompts from agent
- Tech radar backlog exists and can be processed in batch
- Content type audiences can be distinguished through tone and structure alone
- Concise output is preferred over comprehensive/lengthy content
- SEO/AEO optimization can be automated without manual keyword research

## Dependencies

- **Hugo Static Site Generator**: Content bundle structure and frontmatter requirements
- **Existing Validation Scripts**: `scripts/validate-blog-post.sh`, `scripts/validate-portfolio-frontmatter.js`
- **Content Structure**: Current `content/blog/`, `content/portfolio/`, `content/tools/` organization
- **Tech Radar Metadata**: Radar metadata structure for ThoughtWorks BYOR compatibility
- **Image Generation Tools**: External image generation (currently web UI; future A2A integration)
- **Claude Code or CLI Environment**: Agent deployment interface
- **Style Documentation System**: Location and format for storing learned voice/style patterns
- **Frontmatter Templates**: Existing frontmatter schemas for each content type
- **File Naming Conventions**: Existing Hugo content organization patterns
