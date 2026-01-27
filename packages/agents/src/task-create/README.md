# Task Create Agent

Intelligent natural language parser for creating Beads issues with automatic type detection, priority inference, and tag extraction.

## Features

- **Type Detection**: Automatically detects issue type from natural language patterns
  - `fix`, `bug`, `error` → type: `bug`
  - `add`, `implement`, `create` → type: `feature`
  - `document`, `readme`, `guide` → type: `docs`
  - `test`, `coverage`, `spec` → type: `test`
  - `refactor`, `cleanup`, `optimize` → type: `refactor`
  - `chore`, `maintenance`, `update` → type: `chore`

- **Priority Inference**: Automatically infers priority from urgency keywords
  - `urgent`, `critical`, `asap` → priority: 0 (P0)
  - `high priority`, `important`, `soon` → priority: 1 (P1)
  - `medium`, `normal` → priority: 2 (P2, default)
  - `low priority`, `nice to have` → priority: 3 (P3)

- **Tag Extraction**: Automatically extracts relevant tags from text
  - Common tags: `learning`, `refactor`, `docs`, `test`, `performance`, `security`, `ui`, `ux`, `api`, `database`, `frontend`, `backend`, `devops`, `ci`, `cd`, etc.

- **Title Cleaning**: Removes priority/type indicators and formats title
  - `urgent: fix authentication bug` → `Fix authentication bug`
  - `add: user dashboard feature` → `User dashboard feature`

## Usage

```typescript
import { TaskCreateAgent } from '@pwarnock/agents';

const agent = new TaskCreateAgent();
await agent.initialize();

// Create a bug with high priority
const result = await agent.createTask({
  text: 'urgent: fix authentication error in login',
  autoCategorize: true, // Enable auto-categorization (default)
});

if (result.success) {
  console.log(`Created issue: ${result.issueId}`);
  console.log(`Type: ${result.parsedType}`);
  console.log(`Priority: ${result.parsedPriority}`);
  console.log(`Tags: ${result.parsedTags?.join(', ')}`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

## Examples

### Bug with Urgent Priority
```typescript
await agent.createTask({
  text: 'urgent: fix broken authentication on login page',
});
// → Type: bug, Priority: 0, Tags: [authentication]
```

### Feature with Normal Priority
```typescript
await agent.createTask({
  text: 'add user dashboard with analytics',
});
// → Type: feature, Priority: 2, Tags: [ui]
```

### Documentation Task
```typescript
await agent.createTask({
  text: 'update API documentation for new endpoints',
});
// → Type: docs, Priority: 2, Tags: [docs, api]
```

### Refactoring with Low Priority
```typescript
await agent.createTask({
  text: 'low priority: refactor database queries for performance',
});
// → Type: refactor, Priority: 3, Tags: [refactor, database, performance]
```

### Test Coverage
```typescript
await agent.createTask({
  text: 'add unit tests for authentication module',
});
// → Type: test, Priority: 2, Tags: [test, authentication]
```

## API Reference

### `TaskCreateAgent`

#### Methods

##### `initialize(): Promise<void>`
Initializes the agent and verifies beads CLI is available.

##### `createTask(request: TaskCreateRequest): Promise<TaskCreateResult>`
Creates a Beads issue from natural language text.

**Parameters:**
- `request.text` (string, required): Natural language description of the task
- `request.autoCategorize` (boolean, optional): Enable automatic type/tag detection (default: true)

**Returns:**
- `success` (boolean): Whether task creation succeeded
- `issueId` (string, optional): Created issue ID (e.g., "ISSUE-123")
- `parsedType` (string, optional): Detected issue type
- `parsedPriority` (number, optional): Detected priority (0-3)
- `parsedTags` (string[], optional): Extracted tags
- `error` (string, optional): Error message if failed
- `command` (string, optional): Executed bd command for debugging

##### `getSupportedTypes(): string[]`
Returns list of supported issue types.

##### `getCommonTags(): string[]`
Returns list of common tags that can be auto-extracted.

## Integration with Beads

The agent executes `bd create` commands with the following structure:

```bash
bd create --type <type> --priority <priority> --title '<title>' --label <tag1> --label <tag2> ...
```

### Example Commands

```bash
# From: "urgent: fix authentication error"
bd create --type 'bug' --priority 0 --title 'Fix authentication error' --label 'authentication'

# From: "add user dashboard with analytics"
bd create --type 'feature' --priority 2 --title 'Add user dashboard with analytics' --label 'ui'

# From: "refactor database queries for performance"
bd create --type 'refactor' --priority 2 --title 'Refactor database queries for performance' --label 'refactor' --label 'database' --label 'performance'
```

## Testing

Run tests with Jest:

```bash
npm test task-create-agent.test.ts
```

## Requirements

- Node.js 18+
- Beads CLI (`bd`) installed and available in PATH
- Git repository with beads initialized

## Architecture

The agent follows the standard agent pattern used in `@pwarnock/agents`:

1. **Class-based design** with `initialize()` and primary action method
2. **Structured interfaces** for request/result types
3. **Error handling** with success/error result pattern
4. **Integration** with external CLI tools (beads)
5. **Pattern matching** for intelligent text parsing

## Future Enhancements

- [ ] Support for assignee detection from text (e.g., "@username")
- [ ] Support for milestone/epic detection
- [ ] Support for dependency detection (e.g., "blocked by ISSUE-123")
- [ ] Machine learning for improved type/priority detection
- [ ] Support for custom type/priority patterns via configuration
- [ ] Integration with voice learning system for personalized parsing
