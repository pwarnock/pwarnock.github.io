# Product Implementation Plan

This document defines how the product will be built and when.

## Section Explanations

| Section               | Overview                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Overview              | A brief recap of what we're building and the current state of the PRD.                            |
| Architecture          | High-level technical decisions and structure (e.g., frontend/backend split, frameworks, storage). |
| Components            | Major parts of the system and their roles. Think modular: what pieces are needed to make it work. |
| Data Model            | What data structures or models are needed. Keep it conceptual unless structure is critical.       |
| Major Technical Steps | High-level implementation tasks that guide development. Not detailed coding steps.                |
| Tools & Services      | External tools, APIs, libraries, or platforms this app will depend on.                            |
| Risks & Unknowns      | Technical or project-related risks, open questions, or blockers that need attention.              |
| Milestones            | Key implementation checkpoints or phases to show progress.                                        |
| Environment Setup     | Prerequisites or steps to get the app running in a local/dev environment.                         |

## Overview

This plan outlines the implementation of a multi-agent content creation system for Peter Warnock's Hugo website. The system consists of three specialized content agents (Blog, Portfolio, Tech Radar) that learn the user's voice through interactive conversation, generate Hugo content bundles with proper frontmatter, create image prompts, and provide an iterative review workflow. The agents will be implemented as either Claude Code skills or CLI tools, integrating with existing validation scripts and Hugo content structure while maintaining quality guardrails and requiring user sign-off before finalizing content.

## Architecture

The system uses an **agent-based architecture** with three specialized content agents sharing a common foundation:

**Foundation Layer:**
- **Voice Learning System**: Stores and refines style patterns across sessions
- **Hugo Integration Module**: Handles content bundle creation and validation
- **Review Workflow Engine**: Manages inline comments, iteration, and sign-off
- **Image Prompt Generator**: Creates detailed prompts for each content type

**Agent Layer:**
- **Blog Post Agent**: Conversational tone, SEO/AEO optimization
- **Portfolio Agent**: Professional showcase, achievement-focused
- **Tech Radar Agent**: Opinionated analysis, BYOR-compatible structure

**Interface Layer:**
- **Option A**: Claude Code skill with conversational interface
- **Option B**: CLI tool with interactive prompts (fallback)

**Integration Layer:**
- Existing Hugo validation scripts (`scripts/validate-*.sh`)
- Content structure (`content/blog/`, `content/portfolio/`, `content/tools/`)
- Frontmatter schemas and templates

**Tech Stack:**
- **Language**: TypeScript for shared utilities and type safety
- **Framework**: Claude Code Skills API or CLI framework (Commander.js or similar)
- **Storage**: JSON-based style documentation and session history
- **Validation**: Existing Hugo validation scripts
- **Testing**: Vitest for unit tests, integration tests with Hugo

## Components

### Core Foundation Components

**Voice Learning System**
- Captures user feedback and corrections during review sessions
- Maintains content-type-specific style patterns (blog vs portfolio vs radar)
- Documents tone, vocabulary preferences, sentence structure patterns
- Persists style guide to JSON file for cross-session learning
- Provides style suggestions back to agents during content generation

**Hugo Integration Module**
- Generates properly structured Hugo content bundles
- Creates valid frontmatter matching each content type schema
- Follows file naming conventions for blog posts, portfolio, tools
- Integrates with existing validation scripts (validate-blog-post.sh, etc.)
- Places content in correct directory structure

**Review Workflow Engine**
- Manages draft creation and iteration cycles
- Provides inline comment/suggestion system
- Tracks user approvals and required changes
- Validates content before sign-off (frontmatter, assets, structure)
- Prevents blind publishing - requires explicit approval

**Image Prompt Generator**
- Generates detailed, context-aware image prompts for each content type
- Tailors prompts to match content tone and audience
- Creates prompt metadata for future A2A image generation
- Stores prompts alongside content in bundle

### Content-Type Agents

**Blog Post Agent**
- Interactive conversational interface for gathering context
- Expands user notes and URLs into personal, conversational content
- Optimizes for SEO/AEO discoverability
- Generates blog-appropriate frontmatter (title, date, draft, tags, description)
- Creates image prompts matching blog post themes

**Portfolio Project Agent**
- Professional, achievement-focused tone
- Structures content to highlight impact and technical depth
- Generates portfolio frontmatter with project metadata
- Creates image prompts for project showcases
- Formats for recruiter and peer review audience

**Tech Radar Agent**
- Opinionated but balanced perspective for 4 radar sub-types
- Generates ThoughtWorks BYOR-compatible radar metadata
- Creates content for senior technical decision-makers
- Generates radar-appropriate image prompts
- Handles tech radar backlog batch processing

### Interface Components

**Claude Code Skill Interface (Primary)**
- Conversational interface within Claude Code environment
- Access to project context and file system
- Integration with existing Claude Code workflows

**CLI Tool Interface (Secondary)**
- Interactive command-line prompts
- Independent of Claude Code environment
- Scriptable for batch processing

## Data Model

### Style Documentation
```typescript
interface StyleDocumentation {
  contentType: 'blog' | 'portfolio' | 'tech-radar';
  tone: string;
  vocabulary: string[];
  sentencePatterns: string[];
  dos: string[];
  donts: string[];
  examples: {
    good: string[];
    bad: string[];
  };
  lastUpdated: Date;
}
```

### Content Bundle Metadata
```typescript
interface ContentBundle {
  type: 'blog' | 'portfolio' | 'tech-radar';
  subtype?: string; // For tech-radar: 'adopt', 'trial', 'assess', 'hold'
  frontmatter: Record<string, any>;
  content: string;
  imagePrompts: string[];
  validationStatus: 'pending' | 'passed' | 'failed';
  reviewStatus: 'draft' | 'in-review' | 'approved';
  createdAt: Date;
  sessions: ReviewSession[];
}
```

### Review Session
```typescript
interface ReviewSession {
  id: string;
  contentBundleId: string;
  comments: Comment[];
  status: 'active' | 'approved' | 'rejected';
  createdAt: Date;
}

interface Comment {
  section: string;
  text: string;
  resolution: 'pending' | 'accepted' | 'rejected';
}
```

### Agent Configuration
```typescript
interface AgentConfig {
  type: 'blog' | 'portfolio' | 'tech-radar';
  audience: string[];
  toneGuidelines: string[];
  frontmatterSchema: Record<string, any>;
  outputDirectory: string;
  validationScripts: string[];
}
```

## Major Technical Steps

### Phase 1: Foundation & Infrastructure
1. **Set up project structure**
   - Create agent directory structure (e.g., `src/agents/`)
   - Initialize TypeScript project with proper configuration
   - Set up testing framework (Vitest)

2. **Implement Voice Learning System**
   - Design style documentation data structure
   - Create storage mechanism (JSON files in `.cody/project/library/`)
   - Build pattern extraction from user feedback
   - Implement style persistence and retrieval

3. **Build Hugo Integration Module**
   - Study existing content bundles and frontmatter schemas
   - Create content bundle generator with proper structure
   - Integrate with existing validation scripts
   - Test against Hugo build process

4. **Implement Review Workflow Engine**
   - Design draft and session management system
   - Build inline comment/suggestion tracking
   - Create sign-off and approval workflow
   - Add validation checkpoints

### Phase 2: Agent Implementation

5. **Build Blog Post Agent**
   - Implement conversational context gathering
   - Create content generation with blog-specific tone
   - Add SEO/AEO optimization logic
   - Integrate with foundation systems
   - Test with sample blog posts

6. **Build Portfolio Project Agent**
   - Implement professional, achievement-focused tone
   - Create portfolio-specific content structure
   - Add project metadata generation
   - Integrate with foundation systems
   - Test with sample portfolio entries

7. **Build Tech Radar Agent**
   - Implement opinionated but balanced analysis generation
   - Create BYOR-compatible radar metadata structure
   - Handle 4 radar sub-types with appropriate distinctions
   - Add batch processing capability for backlog
   - Test with tech radar content

### Phase 3: Interface & Integration

8. **Implement Claude Code Skill Interface**
   - Create skill definition and configuration
   - Build conversational agent interface
   - Integrate with file system and project context
   - Test interactive workflow end-to-end

9. **Build CLI Tool (Optional)**
   - Set up CLI framework (Commander.js or similar)
   - Create interactive prompts (Inquirer.js or similar)
   - Port agent logic to CLI context
   - Test as standalone tool

10. **Implement Image Prompt Generation**
    - Create prompt templates for each content type
    - Build context-aware prompt generator
    - Integrate with content bundle creation
    - Store prompts in bundle metadata

### Phase 4: Testing & Refinement

11. **Comprehensive Testing**
    - Unit tests for each component
    - Integration tests with Hugo build process
    - End-to-end tests for each agent type
    - Voice learning validation tests
    - Review workflow tests

12. **User Acceptance Testing**
    - Test with real content creation scenarios
    - Validate voice learning over multiple sessions
    - Verify integration with existing workflow
    - Test edge cases and error handling

13. **Documentation**
    - Create user guide for each agent
    - Document style guide format and location
    - Write troubleshooting guide
    - Add examples of successful agent interactions

## Tools & Services

### Development Tools
- **TypeScript**: Type-safe development for shared utilities
- **Node.js/Bun**: Runtime environment
- **Vitest**: Testing framework with TypeScript support
- **ESLint/Prettier**: Code quality and formatting
- **ts-node**: TypeScript execution for development

### Claude Code Skill (Option A)
- **Claude Code Skills API**: Agent interface definition
- **Claude Code Context**: File system access and project awareness
- **Claude Code Session**: Multi-turn conversation management

### CLI Framework (Option B)
- **Commander.js**: CLI framework for command structure
- **Inquirer.js**: Interactive prompt system
- **Chalk**: Terminal formatting for better UX
- **ora**: Loading spinners for long operations

### Hugo Integration
- **Hugo CLI**: Content bundle validation
- **Existing validation scripts**: `scripts/validate-blog-post.sh`, `scripts/validate-portfolio-frontmatter.js`
- **Hugo templates**: Reference for content structure

### Storage & Persistence
- **JSON files**: Style documentation, session history
- **File system**: Content bundle output to `content/` directories
- **Git**: Version control for style documentation evolution

### Future Integration
- **Image generation API**: A2A integration for v2
- **Potential NLP libraries**: Style analysis and enhancement (optional)

## Risks & Unknowns

### Technical Risks
- **Voice capture quality**: Learning voice through interaction may not produce authentic results initially; requires iterative refinement and user feedback
- **Content type differentiation**: Ensuring distinct tones for blog/portfolio/radar may be challenging without explicit examples
- **Hugo integration complexity**: Existing validation scripts may have assumptions that conflict with agent-generated content
- **Claude Code Skills API maturity**: The skills platform may have limitations or changes affecting implementation
- **CLI fallback complexity**: Building robust CLI interface adds development overhead

### Project Risks
- **User adoption**: System may not reduce context switching enough to be regularly used
- **Quality control**: Risk of generating "AI slop" despite quality guardrails
- **Overachieving behavior**: Agent may generate too much content despite concise requirement
- **Tech radar backlog**: Processing backlog may reveal edge cases not anticipated in design
- **Time investment**: Implementation effort may exceed value gained, especially for v1

### Unknowns
- **Style documentation format**: Optimal structure for storing and retrieving voice patterns is unclear
- **Session management**: How many review iterations are typical before approval
- **Image prompt quality**: Whether generated prompts will be useful for actual image generation
- **A2A integration**: Future agent-to-agent image generation requirements unclear
- **Open source considerations**: If open-sourced, what personalization data needs to be removed

### Mitigation Strategies
- Start with MVP focusing on one agent type (likely blog) before expanding to all three
- Implement manual review and style guide updates initially before automating
- Create extensive test suite with real content examples
- Build in easy rollback mechanisms if agent output damages content quality
- Plan regular retrospective cycles to refine approach based on actual usage

## Milestones

### Milestone 1: Foundation Complete (Week 1-2)
- Project structure and TypeScript configuration set up
- Voice Learning System data model designed and implemented
- Hugo Integration Module creates valid content bundles
- Review Workflow Engine manages draft/approval cycle
- All tests passing for foundation components

### Milestone 2: Blog Agent Working (Week 3-4)
- Blog Post Agent generates first drafts from user input
- Content passes validation scripts
- Image prompts generated and stored
- Interactive review workflow functional
- Voice learning captures first patterns
- Real blog post created end-to-end

### Milestone 3: Portfolio Agent Complete (Week 5-6)
- Portfolio Agent generates professional content
- Portfolio-specific frontmatter validated
- Achievement-focused tone working
- Image prompts tailored for projects
- Real portfolio entry created end-to-end

### Milestone 4: Tech Radar Agent Complete (Week 7-8)
- Tech Radar Agent handles 4 sub-types correctly
- BYOR-compatible radar metadata generated
- Opinionated but balanced tone achieved
- Batch processing of backlog functional
- Multiple radar entries created successfully

### Milestone 5: Interface Integration (Week 9-10)
- Claude Code Skill interface fully functional
- Conversational workflow smooth and intuitive
- All agents accessible through skill
- CLI tool built and tested (optional)
- Documentation complete

### Milestone 6: Testing & Launch (Week 11-12)
- Comprehensive test suite passing
- User acceptance testing with real content
- Voice learning validated over multiple sessions
- Bug fixes and refinement
- Official v1.0 release

## Environment Setup

### Prerequisites
1. **Node.js/Bun installed**: Verify with `node --version` or `bun --version`
2. **Hugo installed**: Verify with `hugo version`
3. **TypeScript knowledge**: Familiarity with TypeScript syntax and patterns
4. **Claude Code access**: For skill development and testing
5. **Git repository**: Current project with existing Hugo setup

### Development Setup

1. **Clone and navigate to project**
   ```bash
   cd /Users/peter/github/pwarnock.github.io
   ```

2. **Create agent project structure**
   ```bash
   mkdir -p src/agents/{blog,portfolio,tech-radar}
   mkdir -p src/agents/{core,utils,types}
   mkdir -p .cody/project/library/{style-docs,sessions}
   ```

3. **Initialize TypeScript project**
   ```bash
   bun init -y
   bun add -D typescript @types/node vitest
   bun add ts-node
   ```

4. **Configure TypeScript**
   - Create `tsconfig.json` with appropriate settings
   - Enable strict mode for type safety
   - Configure path aliases for clean imports

5. **Set up testing framework**
   ```bash
   bun add -D vitest @vitest/ui
   ```
   - Configure vitest.config.ts
   - Set up test scripts in package.json

6. **Install Claude Code Skills dependencies** (if using skill approach)
   - Review Claude Code Skills documentation
   - Install required SDK packages
   - Configure skill definition files

7. **Install CLI dependencies** (if building CLI fallback)
   ```bash
   bun add commander inquirer chalk ora
   ```

8. **Create initial configuration files**
   - `src/agents/config/agent-config.ts`: Agent configurations
   - `src/agents/types/`: TypeScript interfaces
   - `.cody/project/library/style-docs/style-guide.json`: Initial empty style guide

9. **Set up development scripts**
   - Add dev script to package.json
   - Add test script with coverage
   - Add build script for compilation

10. **Verify environment**
    - Run `bun run test` to ensure testing works
    - Run `bun run build` to verify TypeScript compilation
    - Test Hugo integration with existing validation scripts

### Validation Checklist
- [ ] TypeScript compiles without errors
- [ ] Test suite runs successfully
- [ ] Hugo validation scripts accessible
- [ ] Can read/write to `.cody/project/library/` directories
- [ ] Can create test content bundle in `content/` directory
- [ ] Claude Code skill loads without errors (if applicable)
- [ ] CLI tool runs help command (if applicable)
