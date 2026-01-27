# Project Coding Conventions

Professional standards for code quality, documentation, and collaboration across the peterwarnock.github.io project.

## TypeScript Conventions

### Zero Warnings Requirement

All TypeScript code must compile without errors or warnings:

```bash
# Must pass cleanly with no warnings
bun tsc --noEmit
```

**Non-negotiable standards:**
- All type declarations must be complete (no implicit `any`)
- Module imports must resolve correctly
- `@types/node` installed for Node.js APIs
- Standard globals (`process`, `console`) properly typed
- No unused variables or parameters

**Why:** Warnings indicate type safety gaps that hide runtime errors. Clean compilation ensures predictable behavior and professional quality.

### Module Organization

```typescript
// 1. Imports (grouped and sorted)
import type { MyType } from './types.js';
import { MyClass } from './module.js';

// 2. Re-exports (if applicable)
export type { MyType };
export { MyClass };

// 3. Type definitions and interfaces (at top of file)
interface MyOptions {
  /** JSDoc for all properties */
  required: string;
  optional?: number;
}

// 4. Class definitions
export class MyClass { }

// 5. Function exports
export function myFunction() { }
```

**File naming:** kebab-case (e.g., `voice-learning.ts`, `hugo-integration.ts`)

### Type Annotations

```typescript
// Always annotate function signatures
function processContent(
  title: string,
  tags: string[],
  options?: Record<string, unknown>
): Promise<ContentBundle> {
  // ...
}

// Always annotate class properties
class BlogAgent {
  private voiceLearning: VoiceLearningSystem;
  private initialized: boolean = false;

  constructor() {
    // ...
  }
}

// Use explicit return types
async function loadStyleDoc(contentType: ContentType): Promise<StyleDocumentation | null> {
  // ...
}
```

**Avoid:**
- `any` types (use `unknown` or specific types)
- Implicit return types in functions
- Untyped function parameters

## Code Organization Patterns

### Project Structure

```
packages/agents/
├── src/
│   ├── __tests__/              # Shared test setup
│   ├── types/                  # TypeScript type definitions
│   ├── config/                 # Configuration and paths
│   ├── core/                   # Shared functionality
│   │   ├── voice-learning.ts   # Style learning system
│   │   ├── hugo-integration.ts # Content bundle generation
│   │   ├── review-workflow.ts  # Draft management
│   │   └── image-prompt-generator.ts
│   ├── [agent-name]/           # Agent-specific code (blog, portfolio, tech-radar)
│   │   ├── [agent]-agent.ts
│   │   └── __tests__/
│   ├── utils/                  # Utilities (storage, validation, patterns)
│   └── cli/                    # CLI interface
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

### Agent Architecture Pattern

Each agent follows this structure:

```typescript
// 1. Interface definitions (requests, responses, options)
export interface AgentRequest { }
export interface AgentResult { }

// 2. Agent class
export class MyAgent {
  private dependency1: CoreModule;
  private dependency2: CoreModule;
  private initialized: boolean = false;

  constructor() {
    this.dependency1 = new CoreModule();
    this.dependency2 = new CoreModule();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    // initialization logic
    this.initialized = true;
  }

  async generate(request: AgentRequest): Promise<AgentResult> {
    await this.initialize();
    // generation logic
  }
}
```

**Key patterns:**
- Dependency injection via constructor
- Lazy initialization with guard
- Async/await for I/O operations
- Clear separation of concerns

## Naming Conventions

### Functions and Variables

- **Functions:** camelCase, descriptive (e.g., `extractPatternsFromFeedback`)
- **Variables:** camelCase (e.g., `voiceLearning`, `styleDocDir`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_OUTPUT_DIR`)
- **Private members:** Leading underscore optional, but consistent (e.g., `_initialized` or `initialized`)

### Files and Directories

- **Files:** kebab-case (e.g., `voice-learning.ts`, `blog-agent.ts`)
- **Directories:** kebab-case (e.g., `style-docs/`, `script-validation/`)
- **Test files:** suffix with `.test.ts` (e.g., `blog-agent.test.ts`)

### Interfaces and Types

```typescript
// Interfaces (capitalized, no I prefix)
interface StyleDocumentation { }
interface ContentBundle { }
interface ValidationResult { }

// Type aliases
type ContentType = 'blog' | 'portfolio' | 'tech-radar';
type BlogContentType = 'original' | 'curated' | 'embed' | 'project';

// Request/Response types
interface BlogPostRequest { }
interface BlogPostResult { }
```

## Testing Conventions

### Test Structure

```typescript
import { describe, it, beforeEach, afterEach, expect } from 'bun:test';
import { BlogAgent } from './blog-agent.js';

describe('BlogAgent', () => {
  let agent: BlogAgent;

  beforeEach(() => {
    agent = new BlogAgent();
  });

  afterEach(() => {
    // Cleanup to prevent test pollution
  });

  it('should initialize successfully', async () => {
    await agent.initialize();
    expect(agent.initialized).toBe(true);
  });

  it('should generate blog post with proper structure', async () => {
    const result = await agent.generate(mockRequest);
    expect(result.success).toBe(true);
    expect(result.bundle).toBeDefined();
  });
});
```

**Key practices:**
- Use `describe()` for test grouping
- Clear test names starting with "should"
- Setup/teardown with `beforeEach` / `afterEach`
- Prevent test pollution (clean up state)
- Mock external dependencies

### Validation Integration

Tests must validate content bundles:

```typescript
// Validate blog content
const { success, errors, warnings } = await validator.validateBlog(bundlePath);

// Validate portfolio content
const { success, errors, warnings } = await validator.validatePortfolio(bundlePath);

// Assert validation passes
expect(success).toBe(true);
expect(errors).toHaveLength(0);
```

## Documentation Standards

### JSDoc Comments

All public functions and classes require JSDoc:

```typescript
/**
 * Voice Learning System
 *
 * Captures user feedback and corrections during review sessions,
 * maintains content-type-specific style patterns, and persists
 * style guide to JSON file for cross-session learning.
 */
export class VoiceLearningSystem { }

/**
 * Load style documentation for a content type
 *
 * @param contentType - Type of content (blog, portfolio, tech-radar)
 * @returns Style documentation or null if not found
 */
async loadStyleDoc(contentType: ContentType): Promise<StyleDocumentation | null> {
  // ...
}
```

**Required for:**
- All public classes and interfaces
- All public functions
- Complex logic requiring explanation
- Parameters with non-obvious meaning

### Inline Comments

```typescript
// Use single comments for brief explanations
const styleDocsDir = paths.styleDocsDir;

// Use block comments for complex sections
/*
 * Convert date string back to Date object because
 * JSON serialization loses type information
 */
return {
  ...data,
  lastUpdated: new Date(data.lastUpdated)
};
```

## Git Commit Standards

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring without feature change
- `docs:` Documentation updates
- `test:` Test additions or modifications
- `chore:` Build, dependencies, tooling
- `perf:` Performance improvements
- `style:` Code formatting (no logic change)

**Examples:**

```
feat(agents): add voice learning system for blog agent

Implements feedback capture during review sessions with
persistent style documentation for cross-session learning.

Closes #123

---

fix(agents): prevent test pollution from shared singleton state

Add proper cleanup in afterEach hooks to prevent test
interference from global singleton instances.

---

docs(agents): strengthen --no-verify protocol

Update CLAUDE.md to emphasize pre-commit hook importance
and clarify when hook bypassing is acceptable.
```

**Scope:** Package or module affected (e.g., `agents`, `ci`, `blog-agent`)

### Commit Best Practices

- **Never skip hooks** (`--no-verify`) unless explicitly requested
- Pre-commit hooks prevent bad code from entering history
- Fixing lint/test failures is required, not optional
- Create atomic commits with single logical purpose
- Keep message under 100 characters (subject line)

See [Style Guide: Development Workflow](../../docs/development/STYLE_GUIDE.md#development-workflow) for detailed standards.

## Content Bundle Standards

### Frontmatter Validation

All content bundles require validated frontmatter matching content type:

```typescript
// Blog frontmatter
interface BlogFrontmatter {
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  content_type?: BlogContentType;
  tags?: string[];
  draft?: boolean;
  attribution?: string;
  source_url?: string;
}

// Portfolio frontmatter
interface PortfolioFrontmatter {
  title: string;
  date: string; // YYYY-MM-DD
  draft: boolean;
  description: string;
  client: string;
  technologies: string[];
  completion_date: string; // YYYY-MM
  category: string;
  github_url?: string;
  live_url?: string;
}
```

**Always validate before marking content ready for review.**

### Review Workflow

Content starts as draft and requires explicit approval:

1. **Generate** → Bundle created with `draft: true`
2. **Review** → User reviews and provides feedback
3. **Revise** → Agent incorporates feedback
4. **Approve** → User explicitly approves
5. **Publish** → `draft: false` set manually

**Agents never auto-publish.**

## Voice and Writing Standards

### Personal First-Person Voice

All content must use first-person perspective:

**Correct:**
- "I developed this application to solve..."
- "My approach to this problem was..."
- "I learned that..."

**Incorrect:**
- "We developed this application..."
- "The team's approach was..."
- "Our experience shows..."

See [Style Guide: Content Guidelines](../../docs/development/STYLE_GUIDE.md#voice-and-tone) for detailed standards.

## Configuration and Paths

### Path Resolution

```typescript
import { getAgentPaths, getAgentConfig } from '../config/index.js';

// Get project paths
const paths = getAgentPaths();
console.log(paths.projectRoot);      // Project root directory
console.log(paths.styleDocsDir);     // Style documentation directory
console.log(paths.contentBundlesDir); // Generated bundle directory

// Get agent configuration
const config = getAgentConfig('blog');
console.log(config.audience);         // Target audience
console.log(config.outputDirectory);  // Content output path
```

**Never hardcode paths.** Use configuration system for project portability.

## Performance Considerations

- Lazy initialization for expensive resources
- Async/await for I/O operations
- Caching style documentation between calls
- Efficient pattern extraction and matching
- Minimize file system operations in loops

## Error Handling

```typescript
// Always provide context in error messages
catch (error) {
  console.error(`Error saving style doc for ${contentType}:`, error);
  throw error; // Re-throw for caller to handle
}

// Use specific error types when possible
if (!fs.existsSync(scriptPath)) {
  return {
    success: false,
    errors: ['Blog validation script not found'],
    warnings: [],
    exitCode: -1,
  };
}
```

## Resources

- **Style Guide:** [docs/development/STYLE_GUIDE.md](../../docs/development/STYLE_GUIDE.md)
- **Agent Documentation:** [docs/agents/README.md](../../docs/agents/README.md)
- **TypeScript Standards:** [.claude/context/project/references.md](./references.md)
- **Git Workflow:** [CLAUDE.md](../../CLAUDE.md)
