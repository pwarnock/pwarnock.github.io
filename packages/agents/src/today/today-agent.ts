/**
 * Today Agent
 *
 * Generates a daily task digest by integrating with Beads issue tracker.
 * Parses .beads/issues.jsonl and creates organized sections by priority,
 * status, and dependencies.
 *
 * Key Features:
 * - Direct JSONL parsing from .beads/issues.jsonl
 * - Priority-based grouping (Critical, In Progress, Ready, Blocked)
 * - Learning opportunities identification
 * - Dependency tracking and visualization
 * - Graceful error handling for malformed data
 */

import fs from 'fs';
import path from 'path';

/**
 * Beads issue structure (matches .beads/issues.jsonl format)
 */
export interface BeadsIssue {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: number;
  issue_type: string;
  owner?: string;
  assignee?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  closed_at?: string;
  close_reason?: string;
  description?: string;
  tags?: string[];
  dependencies?: Array<{
    issue_id: string;
    depends_on_id: string;
    type: string;
    created_at: string;
    created_by?: string;
    metadata?: string;
  }>;
  blockedBy?: string[];
}

/**
 * Grouped issues for digest generation
 */
export interface GroupedIssues {
  critical: BeadsIssue[];
  inProgress: BeadsIssue[];
  ready: BeadsIssue[];
  blocked: BeadsIssue[];
  learning: BeadsIssue[];
}

/**
 * Digest generation options
 */
export interface DigestOptions {
  beadsPath?: string;
  includeDescriptions?: boolean;
  maxDescriptionLength?: number;
}

/**
 * Digest generation result
 */
export interface DigestResult {
  success: boolean;
  markdown?: string;
  error?: string;
  stats?: {
    total: number;
    critical: number;
    inProgress: number;
    ready: number;
    blocked: number;
    learning: number;
  };
}

/**
 * Today generation result (compatible with CLI)
 */
export interface TodayResult {
  success: boolean;
  bundle?: {
    type: 'today';
    frontmatter: Record<string, any>;
    content: string;
  };
  bundlePath?: string;
  error?: string;
}

/**
 * Today Agent
 *
 * Reads from .beads/issues.jsonl and generates a daily task digest
 * with sections organized by priority and status.
 */
export class TodayAgent {
  private beadsPath: string;
  private initialized: boolean = false;

  constructor(beadsPath?: string) {
    // Default to .beads/issues.jsonl in project root
    this.beadsPath = beadsPath || path.join(process.cwd(), '.beads', 'issues.jsonl');
  }

  /**
   * Initialize the today agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Check if beads database exists
    if (!fs.existsSync(this.beadsPath)) {
      console.warn(`Warning: Beads database not found at ${this.beadsPath}`);
    }

    this.initialized = true;
  }

  /**
   * Generate daily task digest
   *
   * Reads all issues from .beads/issues.jsonl, groups them by priority
   * and status, and generates a formatted markdown digest.
   *
   * @param options - Digest generation options
   * @returns Digest result with markdown content
   */
  async generateDigest(options: DigestOptions = {}): Promise<DigestResult> {
    try {
      // Read and parse issues
      const issues = await this.readIssues();

      // Group issues by category
      const grouped = this.groupIssues(issues);

      // Calculate statistics
      const stats = {
        total: issues.length,
        critical: grouped.critical.length,
        inProgress: grouped.inProgress.length,
        ready: grouped.ready.length,
        blocked: grouped.blocked.length,
        learning: grouped.learning.length,
      };

      // Generate markdown
      const markdown = this.formatDigest(grouped, options);

      return {
        success: true,
        markdown,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating digest',
      };
    }
  }

  /**
   * Read and parse issues from .beads/issues.jsonl
   *
   * Each line is a separate JSON object representing one issue.
   * Handles malformed lines gracefully by skipping them with warnings.
   *
   * @returns Array of parsed issues
   */
  private async readIssues(): Promise<BeadsIssue[]> {
    try {
      // Check if file exists
      if (!fs.existsSync(this.beadsPath)) {
        throw new Error(`Beads database not found at ${this.beadsPath}`);
      }

      // Read file content
      const content = fs.readFileSync(this.beadsPath, 'utf-8');

      // Parse JSONL (one JSON object per line)
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const issues: BeadsIssue[] = [];

      for (let i = 0; i < lines.length; i++) {
        try {
          const issue = JSON.parse(lines[i]) as BeadsIssue;

          // Only include non-closed issues
          if (issue.status !== 'closed') {
            issues.push(issue);
          }
        } catch (error) {
          console.warn(`Warning: Skipping malformed issue on line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
          continue;
        }
      }

      return issues;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to read issues from beads database');
    }
  }

  /**
   * Group issues by category for digest
   *
   * Categories:
   * - Critical: Priority 0-1
   * - In Progress: status=in_progress
   * - Ready: status=open, no blockers
   * - Blocked: has dependencies in blockedBy field
   * - Learning: tags include "learning"
   *
   * @param issues - All issues to group
   * @returns Grouped issues
   */
  private groupIssues(issues: BeadsIssue[]): GroupedIssues {
    const grouped: GroupedIssues = {
      critical: [],
      inProgress: [],
      ready: [],
      blocked: [],
      learning: [],
    };

    for (const issue of issues) {
      // Critical (Priority 0-1)
      if (issue.priority <= 1) {
        grouped.critical.push(issue);
      }

      // In Progress
      if (issue.status === 'in_progress') {
        grouped.inProgress.push(issue);
      }

      // Blocked (has dependencies that block this issue)
      // Check if this issue depends on other issues (blocked by them)
      const isBlocked = issue.dependencies?.some(dep =>
        dep.issue_id === issue.id && dep.type !== 'parent-child'
      ) || false;

      if (isBlocked || (issue.blockedBy && issue.blockedBy.length > 0)) {
        grouped.blocked.push(issue);
      }

      // Ready (open, not blocked, not critical, not in progress)
      if (
        issue.status === 'open' &&
        !isBlocked &&
        !(issue.blockedBy && issue.blockedBy.length > 0) &&
        issue.priority > 1
      ) {
        grouped.ready.push(issue);
      }

      // Learning opportunities
      if (issue.tags?.includes('learning')) {
        grouped.learning.push(issue);
      }
    }

    return grouped;
  }

  /**
   * Format grouped issues into markdown digest
   *
   * Generates a formatted markdown document with sections for each
   * issue category, including issue IDs, titles, and dependency info.
   *
   * @param grouped - Grouped issues
   * @param options - Formatting options
   * @returns Formatted markdown string
   */
  private formatDigest(grouped: GroupedIssues, options: DigestOptions): string {
    const sections: string[] = [];

    // Header
    sections.push('# Today\'s Tasks\n');
    sections.push(`Generated: ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}\n`);

    // Critical section
    if (grouped.critical.length > 0) {
      sections.push('## 🔥 Critical\n');
      sections.push(`High priority items (${grouped.critical.length})\n`);
      for (const issue of grouped.critical) {
        sections.push(this.formatIssue(issue, options));
      }
      sections.push('');
    }

    // In Progress section
    if (grouped.inProgress.length > 0) {
      sections.push('## 🏃 In Progress\n');
      sections.push(`Currently active work (${grouped.inProgress.length})\n`);
      for (const issue of grouped.inProgress) {
        sections.push(this.formatIssue(issue, options));
      }
      sections.push('');
    }

    // Ready section
    if (grouped.ready.length > 0) {
      sections.push('## ✅ Ready to Start\n');
      sections.push(`Available work with no blockers (${grouped.ready.length})\n`);
      for (const issue of grouped.ready) {
        sections.push(this.formatIssue(issue, options));
      }
      sections.push('');
    }

    // Blocked section
    if (grouped.blocked.length > 0) {
      sections.push('## 🚫 Blocked\n');
      sections.push(`Issues waiting on dependencies (${grouped.blocked.length})\n`);
      for (const issue of grouped.blocked) {
        sections.push(this.formatIssue(issue, options, true)); // Show dependencies
      }
      sections.push('');
    }

    // Learning opportunities section
    if (grouped.learning.length > 0) {
      sections.push('## 📚 Learning Opportunities\n');
      sections.push(`Items tagged for learning (${grouped.learning.length})\n`);
      for (const issue of grouped.learning) {
        sections.push(this.formatIssue(issue, options));
      }
      sections.push('');
    }

    // Summary
    const total = grouped.critical.length + grouped.inProgress.length +
                  grouped.ready.length + grouped.blocked.length;
    sections.push('---\n');
    sections.push(`**Total Open Issues:** ${total}\n`);

    return sections.join('\n');
  }

  /**
   * Format a single issue for display
   *
   * @param issue - Issue to format
   * @param options - Formatting options
   * @param showDependencies - Whether to show dependency information
   * @returns Formatted markdown string
   */
  private formatIssue(
    issue: BeadsIssue,
    options: DigestOptions,
    showDependencies: boolean = false
  ): string {
    const parts: string[] = [];

    // Issue ID and title
    parts.push(`- **[${issue.id}]** ${issue.title}`);

    // Priority and type
    parts.push(`  - Priority: ${issue.priority} | Type: ${issue.issue_type}`);

    // Owner/assignee
    if (issue.owner || issue.assignee) {
      parts.push(`  - Assigned: ${issue.owner || issue.assignee}`);
    }

    // Dependencies (if showing)
    if (showDependencies && issue.dependencies && issue.dependencies.length > 0) {
      const blockers = issue.dependencies
        .filter(dep => dep.issue_id === issue.id)
        .map(dep => dep.depends_on_id);

      if (blockers.length > 0) {
        parts.push(`  - Blocked by: ${blockers.join(', ')}`);
      }
    }

    // Description (if requested and available)
    if (options.includeDescriptions && issue.description) {
      const maxLength = options.maxDescriptionLength || 150;
      const description = issue.description.length > maxLength
        ? issue.description.substring(0, maxLength) + '...'
        : issue.description;

      // Clean description (remove markdown headers, multiple newlines)
      const cleanDesc = description
        .replace(/^##?\s+/gm, '')
        .replace(/\n\n+/g, ' ')
        .trim();

      parts.push(`  - ${cleanDesc}`);
    }

    // Tags
    if (issue.tags && issue.tags.length > 0) {
      parts.push(`  - Tags: ${issue.tags.join(', ')}`);
    }

    return parts.join('\n') + '\n';
  }

  /**
   * Get issue statistics without generating full digest
   *
   * @returns Issue statistics
   */
  async getStats(): Promise<{
    success: boolean;
    stats?: DigestResult['stats'];
    error?: string;
  }> {
    try {
      const issues = await this.readIssues();
      const grouped = this.groupIssues(issues);

      return {
        success: true,
        stats: {
          total: issues.length,
          critical: grouped.critical.length,
          inProgress: grouped.inProgress.length,
          ready: grouped.ready.length,
          blocked: grouped.blocked.length,
          learning: grouped.learning.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting stats',
      };
    }
  }

  /**
   * Generate today digest (CLI-compatible interface)
   *
   * Generates a daily task digest and returns it in a format
   * compatible with the CLI expectations.
   *
   * @param options - Generation options
   * @returns Today generation result
   */
  async generateToday(options: Record<string, string> = {}): Promise<TodayResult> {
    await this.ensureInitialized();

    try {
      // Parse options
      const digestOptions: DigestOptions = {
        includeDescriptions: options.descriptions === 'true',
        maxDescriptionLength: options.maxLength ? parseInt(options.maxLength) : 150,
      };

      // Generate digest
      const result = await this.generateDigest(digestOptions);

      if (!result.success || !result.markdown) {
        return {
          success: false,
          error: result.error || 'Failed to generate digest',
        };
      }

      // Create bundle
      const bundle = {
        type: 'today' as const,
        frontmatter: {
          title: 'Today\'s Tasks',
          date: new Date().toISOString().split('T')[0],
          generated_at: new Date().toISOString(),
          stats: result.stats,
        },
        content: result.markdown,
      };

      return {
        success: true,
        bundle,
        bundlePath: this.beadsPath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get beads database path
   *
   * @returns Path to .beads/issues.jsonl
   */
  getBeadsPath(): string {
    return this.beadsPath;
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
