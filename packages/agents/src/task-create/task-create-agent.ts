/**
 * Task Create Agent
 *
 * Parses natural language input and creates Beads issues with intelligent
 * type detection, priority inference, and automatic tag extraction.
 *
 * Key Features:
 * - Natural language parsing for issue creation
 * - Type detection (fix → bug, add/implement → feature)
 * - Priority inference (urgent → P0, high → P1, default → P2)
 * - Automatic tag extraction from text
 * - Integration with beads CLI via exec
 * - Structured result pattern following agent conventions
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Task create request
 */
export interface TaskCreateRequest {
  text: string;
  autoCategorize?: boolean;
}

/**
 * Task create result
 */
export interface TaskCreateResult {
  success: boolean;
  issueId?: string;
  parsedType?: string;
  parsedPriority?: number;
  parsedTags?: string[];
  error?: string;
  command?: string;
}

/**
 * Parsed task metadata
 */
interface ParsedTaskMetadata {
  type: string;
  priority: number;
  tags: string[];
  title: string;
}

/**
 * Task Create Agent
 *
 * Intelligent natural language parser for creating Beads issues.
 * Analyzes text to extract type, priority, tags, and title, then
 * executes `bd create` with appropriate parameters.
 */
export class TaskCreateAgent {
  private initialized: boolean = false;

  /**
   * Known type patterns for classification
   */
  private readonly typePatterns = {
    bug: [
      /\b(fix|bug|error|issue|broken|crash|fail(ing|ure)?)\b/i,
      /\b(doesn't work|not working|won't)\b/i,
    ],
    feature: [
      /\b(add|implement|create|build|develop|new feature)\b/i,
      /\b(should|need to|want to)\b/i,
    ],
    docs: [
      /\b(document|documentation|readme|guide|tutorial)\b/i,
      /\b(write|update) docs?\b/i,
    ],
    test: [
      /\b(test|testing|coverage|spec|unit test)\b/i,
    ],
    refactor: [
      /\b(refactor|cleanup|clean up|improve|optimize)\b/i,
      /\b(technical debt|tech debt)\b/i,
    ],
    chore: [
      /\b(chore|maintenance|update dependencies|upgrade)\b/i,
    ],
  };

  /**
   * Priority patterns for inference
   */
  private readonly priorityPatterns = {
    0: [/\b(urgent|critical|asap|immediately|emergency|blocker|blocking)\b/i],
    1: [/\b(high priority|important|soon|quickly)\b/i],
    2: [/\b(medium|normal|regular|eventually)\b/i],
    3: [/\b(low priority|nice to have|sometime|later)\b/i],
  };

  /**
   * Common tags to extract
   */
  private readonly commonTags = [
    'learning',
    'refactor',
    'docs',
    'test',
    'performance',
    'security',
    'ui',
    'ux',
    'api',
    'database',
    'frontend',
    'backend',
    'devops',
    'ci',
    'cd',
    'infrastructure',
    'monitoring',
    'logging',
    'authentication',
    'authorization',
    'accessibility',
    'i18n',
    'l10n',
  ];

  constructor() {}

  /**
   * Initialize the task create agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Verify beads CLI is available
    try {
      await execAsync('which bd');
      this.initialized = true;
    } catch (error) {
      throw new Error('beads CLI (bd) not found in PATH. Please install beads first.');
    }
  }

  /**
   * Create a task from natural language text
   *
   * Process:
   * 1. Parse text to extract type, priority, tags, and title
   * 2. Build `bd create` command with parsed parameters
   * 3. Execute command and capture issue ID
   * 4. Return structured result
   *
   * @param request - Task creation request
   * @returns Task creation result
   */
  async createTask(request: TaskCreateRequest): Promise<TaskCreateResult> {
    await this.ensureInitialized();

    try {
      // Validate input
      if (!request.text || request.text.trim() === '') {
        return {
          success: false,
          error: 'Task text is required',
        };
      }

      // Parse text to extract metadata
      const metadata = this.parseText(request.text, request.autoCategorize !== false);

      // Build bd create command
      const command = this.buildCreateCommand(metadata);

      // Execute command
      const { stdout, stderr } = await execAsync(command);

      // Extract issue ID from output
      // Expected format: "Created issue: ISSUE-123" or similar
      const issueId = this.extractIssueId(stdout);

      if (!issueId) {
        return {
          success: false,
          error: `Failed to extract issue ID from output: ${stdout}`,
          command,
        };
      }

      return {
        success: true,
        issueId,
        parsedType: metadata.type,
        parsedPriority: metadata.priority,
        parsedTags: metadata.tags,
        command,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Parse natural language text to extract task metadata
   */
  private parseText(text: string, autoCategorize: boolean): ParsedTaskMetadata {
    const type = autoCategorize ? this.detectType(text) : 'feature';
    const priority = this.detectPriority(text);
    const tags = autoCategorize ? this.extractTags(text) : [];
    const title = this.cleanTitle(text);

    return {
      type,
      priority,
      tags,
      title,
    };
  }

  /**
   * Detect issue type from text patterns
   */
  private detectType(text: string): string {
    // Check each type pattern
    for (const [type, patterns] of Object.entries(this.typePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return type;
        }
      }
    }

    // Default to feature
    return 'feature';
  }

  /**
   * Detect priority from text patterns
   */
  private detectPriority(text: string): number {
    // Check priority patterns in order (0 to 3)
    for (const [priority, patterns] of Object.entries(this.priorityPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return Number(priority);
        }
      }
    }

    // Default to medium priority (P2)
    return 2;
  }

  /**
   * Extract tags from text
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();

    // Check for common tags
    for (const tag of this.commonTags) {
      const tagPattern = new RegExp(`\\b${tag}\\b`, 'i');
      if (tagPattern.test(lowerText)) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Clean title text by removing priority/type indicators
   */
  private cleanTitle(text: string): string {
    let title = text.trim();

    // Remove priority indicators
    title = title.replace(/\b(urgent|critical|asap|high priority|low priority|medium)\b:?\s*/gi, '');

    // Remove common prefixes
    title = title.replace(/^(fix|bug|feature|add|implement|create|build|develop):\s*/i, '');

    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return title;
  }

  /**
   * Build bd create command from parsed metadata
   */
  private buildCreateCommand(metadata: ParsedTaskMetadata): string {
    const parts = ['bd', 'create'];

    // Add type
    parts.push('--type', this.escapeShellArg(metadata.type));

    // Add priority
    parts.push('--priority', String(metadata.priority));

    // Add title
    parts.push('--title', this.escapeShellArg(metadata.title));

    // Add tags if any
    if (metadata.tags.length > 0) {
      for (const tag of metadata.tags) {
        parts.push('--label', this.escapeShellArg(tag));
      }
    }

    return parts.join(' ');
  }

  /**
   * Escape shell argument for safe command execution
   */
  private escapeShellArg(arg: string): string {
    // Use single quotes and escape any single quotes in the string
    return `'${arg.replace(/'/g, "'\\''")}'`;
  }

  /**
   * Extract issue ID from bd create output
   */
  private extractIssueId(output: string): string | null {
    // Try different output patterns
    const patterns = [
      /Created issue:\s*(\S+)/i,
      /Issue created:\s*(\S+)/i,
      /New issue:\s*(\S+)/i,
      /issue\s+(\S+-\d+)/i,
      /(\S+-\d+)\s+created/i,
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Get supported issue types
   */
  getSupportedTypes(): string[] {
    return Object.keys(this.typePatterns);
  }

  /**
   * Get type patterns for debugging/introspection
   */
  getTypePatterns(): Record<string, RegExp[]> {
    return this.typePatterns;
  }

  /**
   * Get priority patterns for debugging/introspection
   */
  getPriorityPatterns(): Record<number, RegExp[]> {
    return this.priorityPatterns;
  }

  /**
   * Get common tags list
   */
  getCommonTags(): string[] {
    return this.commonTags;
  }

  /**
   * Ensure agent is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
