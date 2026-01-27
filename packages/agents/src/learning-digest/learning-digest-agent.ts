/**
 * Learning Digest Agent
 *
 * Dynamically loads YAML source definitions and generates learning digests
 * by executing commands, parsing outputs, and formatting results.
 *
 * Key Features:
 * - Dynamic source loading from .claude/learning/sources/*.yaml
 * - Extensible: add sources without code changes
 * - Multiple parser types: shell, markdown, json
 * - Customizable formatting per source
 * - Command execution with error handling
 * - Aggregated markdown digest generation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as yaml from 'yaml';

const execAsync = promisify(exec);

/**
 * Parser type for command output
 */
export type ParserType = 'shell' | 'markdown' | 'json';

/**
 * Source definition from YAML
 */
export interface SourceDefinition {
  name: string;
  description: string;
  enabled: boolean;
  command: string;
  parser: {
    type: ParserType;
    fields?: string[]; // For json parser - which fields to extract
    linePattern?: string; // For shell parser - regex to match lines
  };
  format: {
    title: string;
    item: string; // Template string like "- [{field}] format"
    empty: string;
  };
}

/**
 * Parsed item from source execution
 */
export interface ParsedItem {
  [key: string]: string | number | boolean | null;
}

/**
 * Source execution result
 */
export interface SourceResult {
  sourceName: string;
  success: boolean;
  items: ParsedItem[];
  error?: string;
  formatted: string;
}

/**
 * Digest generation options
 */
export interface DigestOptions {
  sourcesDir?: string; // Override default sources directory
  enabledOnly?: boolean; // Only process enabled sources (default: true)
  includeEmpty?: boolean; // Include sections with no items (default: false)
}

/**
 * Digest generation result
 */
export interface DigestResult {
  success: boolean;
  markdown: string;
  sources: SourceResult[];
  generatedAt: Date;
  error?: string;
}

/**
 * Learning Digest Agent
 *
 * Executes dynamically-defined sources and generates formatted learning digests.
 */
export class LearningDigestAgent {
  private sourceDefinitions: SourceDefinition[] = [];
  private initialized: boolean = false;
  private defaultSourcesDir: string;

  constructor(projectRoot?: string) {
    const root = projectRoot || process.cwd();
    this.defaultSourcesDir = path.join(root, '.claude', 'learning', 'sources');
  }

  /**
   * Initialize the agent by loading source definitions
   */
  async initialize(sourcesDir?: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    const dir = sourcesDir || this.defaultSourcesDir;
    this.sourceDefinitions = await this.loadSourceDefinitions(dir);
    this.initialized = true;
  }

  /**
   * Load all YAML source definitions from directory
   */
  private async loadSourceDefinitions(dir: string): Promise<SourceDefinition[]> {
    try {
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      // Read all .yaml files
      const files = await fs.readdir(dir);
      const yamlFiles = files.filter(
        (f) => f.endsWith('.yaml') || f.endsWith('.yml')
      );

      if (yamlFiles.length === 0) {
        console.warn(`No YAML source definitions found in ${dir}`);
        return [];
      }

      // Load and parse each file
      const definitions: SourceDefinition[] = [];
      for (const file of yamlFiles) {
        const filePath = path.join(dir, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const parsed = yaml.parse(content) as SourceDefinition;

          // Validate required fields
          this.validateSourceDefinition(parsed, file);
          definitions.push(parsed);
        } catch (error) {
          console.error(`Failed to load ${file}:`, error);
        }
      }

      return definitions;
    } catch (error) {
      console.error(`Failed to load source definitions from ${dir}:`, error);
      return [];
    }
  }

  /**
   * Validate a source definition has required fields
   */
  private validateSourceDefinition(def: any, filename: string): void {
    const required = ['name', 'description', 'enabled', 'command', 'parser', 'format'];
    const missing = required.filter((field) => !(field in def));

    if (missing.length > 0) {
      throw new Error(
        `Source definition ${filename} missing required fields: ${missing.join(', ')}`
      );
    }

    if (!def.parser.type || !['shell', 'markdown', 'json'].includes(def.parser.type)) {
      throw new Error(
        `Source ${filename} has invalid parser type: ${def.parser.type}`
      );
    }

    const formatRequired = ['title', 'item', 'empty'];
    const formatMissing = formatRequired.filter((field) => !(field in def.format));

    if (formatMissing.length > 0) {
      throw new Error(
        `Source ${filename} format missing required fields: ${formatMissing.join(', ')}`
      );
    }
  }

  /**
   * Generate learning digest from all sources
   */
  async generateDigest(options: DigestOptions = {}): Promise<DigestResult> {
    if (!this.initialized) {
      await this.initialize(options.sourcesDir);
    }

    const enabledOnly = options.enabledOnly !== false; // Default: true
    const includeEmpty = options.includeEmpty === true; // Default: false

    // Filter sources
    const sources = enabledOnly
      ? this.sourceDefinitions.filter((s) => s.enabled)
      : this.sourceDefinitions;

    if (sources.length === 0) {
      return {
        success: false,
        markdown: '',
        sources: [],
        generatedAt: new Date(),
        error: 'No sources available to process',
      };
    }

    // Execute all sources
    const results: SourceResult[] = [];
    for (const source of sources) {
      const result = await this.executeSource(source);
      results.push(result);
    }

    // Generate markdown digest
    const markdown = this.formatDigest(results, includeEmpty);

    return {
      success: true,
      markdown,
      sources: results,
      generatedAt: new Date(),
    };
  }

  /**
   * Execute a single source definition
   */
  private async executeSource(source: SourceDefinition): Promise<SourceResult> {
    try {
      // Execute command
      const { stdout, stderr } = await execAsync(source.command, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      if (stderr) {
        console.warn(`Warning from ${source.name}:`, stderr);
      }

      // Parse output
      const items = await this.parseOutput(stdout, source.parser);

      // Format result
      const formatted = this.formatSource(source, items);

      return {
        sourceName: source.name,
        success: true,
        items,
        formatted,
      };
    } catch (error) {
      return {
        sourceName: source.name,
        success: false,
        items: [],
        error: error instanceof Error ? error.message : String(error),
        formatted: `## ${source.format.title}\n\n${source.format.empty}\n\n_Error: ${
          error instanceof Error ? error.message : String(error)
        }_\n`,
      };
    }
  }

  /**
   * Parse command output based on parser type
   */
  private async parseOutput(
    output: string,
    parser: SourceDefinition['parser']
  ): Promise<ParsedItem[]> {
    switch (parser.type) {
      case 'shell':
        return this.parseShellOutput(output, parser.linePattern);
      case 'markdown':
        return this.parseMarkdownOutput(output);
      case 'json':
        return this.parseJsonOutput(output, parser.fields);
      default:
        throw new Error(`Unknown parser type: ${parser.type}`);
    }
  }

  /**
   * Parse shell command output (line-based)
   */
  private parseShellOutput(
    output: string,
    linePattern?: string
  ): ParsedItem[] {
    const lines = output.split('\n').filter((line) => line.trim());

    if (linePattern) {
      const regex = new RegExp(linePattern);
      return lines
        .filter((line) => regex.test(line))
        .map((line) => ({ line }));
    }

    return lines.map((line) => ({ line }));
  }

  /**
   * Parse markdown output (preserve structure)
   */
  private parseMarkdownOutput(output: string): ParsedItem[] {
    // Return as single item with full content
    return [{ content: output.trim() }];
  }

  /**
   * Parse JSON output
   */
  private parseJsonOutput(
    output: string,
    fields?: string[]
  ): ParsedItem[] {
    try {
      const parsed = JSON.parse(output);

      // If array, return items
      if (Array.isArray(parsed)) {
        if (fields && fields.length > 0) {
          return parsed.map((item) => {
            const filtered: ParsedItem = {};
            for (const field of fields) {
              if (field in item) {
                filtered[field] = item[field];
              }
            }
            return filtered;
          });
        }
        return parsed;
      }

      // If object, wrap in array
      if (fields && fields.length > 0) {
        const filtered: ParsedItem = {};
        for (const field of fields) {
          if (field in parsed) {
            filtered[field] = parsed[field];
          }
        }
        return [filtered];
      }

      return [parsed];
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }

  /**
   * Format a single source result
   */
  private formatSource(
    source: SourceDefinition,
    items: ParsedItem[]
  ): string {
    const parts: string[] = [];
    parts.push(`## ${source.format.title}\n`);

    if (items.length === 0) {
      parts.push(`${source.format.empty}\n`);
    } else {
      // Special handling for markdown parser (already formatted)
      if (source.parser.type === 'markdown' && items[0]?.content) {
        parts.push(String(items[0].content));
        parts.push('\n');
      } else {
        // Format each item using template
        for (const item of items) {
          const formatted = this.formatItem(source.format.item, item);
          parts.push(formatted);
          parts.push('\n');
        }
      }
    }

    return parts.join('');
  }

  /**
   * Format a single item using template string
   * Template: "- [{field}] format" → "- [value] format"
   */
  private formatItem(template: string, item: ParsedItem): string {
    let result = template;

    // Replace {field} placeholders with item values
    const placeholderRegex = /\{(\w+)\}/g;
    result = result.replace(placeholderRegex, (match, fieldName) => {
      if (fieldName in item) {
        return String(item[fieldName]);
      }
      return match; // Keep placeholder if field not found
    });

    return result;
  }

  /**
   * Format complete digest from all source results
   */
  private formatDigest(results: SourceResult[], includeEmpty: boolean): string {
    const parts: string[] = [];
    parts.push('# Learning Digest\n');
    parts.push(`_Generated: ${new Date().toISOString()}_\n\n`);

    for (const result of results) {
      // Skip empty results if not including empty
      if (!includeEmpty && result.items.length === 0 && result.success) {
        continue;
      }

      parts.push(result.formatted);
      parts.push('\n');
    }

    return parts.join('');
  }

  /**
   * Get loaded source definitions (for inspection)
   */
  getSourceDefinitions(): SourceDefinition[] {
    return [...this.sourceDefinitions];
  }

  /**
   * Reload source definitions from disk
   */
  async reload(sourcesDir?: string): Promise<void> {
    this.initialized = false;
    await this.initialize(sourcesDir);
  }
}
