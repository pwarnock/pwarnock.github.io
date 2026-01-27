/**
 * Validation Integration Module
 *
 * Integrates with existing validation scripts to provide structured
 * validation results for content bundles.
 *
 * Supported validators:
 * - Blog: scripts/validate-blog-post.sh
 * - Portfolio: scripts/validate-portfolio-frontmatter.js
 * - Tech Radar: (basic validation, no dedicated script yet)
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { ContentType } from '../types/index.js';

/**
 * Validation result structure
 */
export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  exitCode: number;
  rawOutput?: string;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Parsed output from validation scripts
 */
interface ParsedOutput {
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * ValidationResult Class
 *
 * Wraps existing validation scripts and provides structured results.
 * Runs shell scripts using child_process and parses their output.
 */
export class ValidationResult {
  private projectRoot: string;
  private verbose: boolean;

  constructor(projectRoot: string = process.cwd(), options: ValidationOptions = {}) {
    this.projectRoot = projectRoot;
    this.verbose = options.verbose || false;
  }

  /**
   * Validate blog post using validate-blog-post.sh
   */
  async validateBlog(contentPath: string): Promise<ValidationResult> {
    const scriptPath = path.join(this.projectRoot, 'scripts', 'validate-blog-post.sh');

    if (!fs.existsSync(scriptPath)) {
      return {
        success: false,
        errors: ['Blog validation script not found'],
        warnings: [],
        exitCode: -1,
      };
    }

    if (!fs.existsSync(contentPath)) {
      return {
        success: false,
        errors: [`Content path not found: ${contentPath}`],
        warnings: [],
        exitCode: -1,
      };
    }

    try {
      const output = execSync(`bash "${scriptPath}" "${contentPath}"`, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: this.verbose ? 'inherit' : 'pipe',
      });

      const parsed = this.parseValidationOutput(output.toString());

      return {
        success: parsed.errors.length === 0,
        errors: parsed.errors,
        warnings: parsed.warnings,
        exitCode: 0,
        rawOutput: output.toString(),
      };
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const parsed = this.parseValidationOutput(output);

      return {
        success: false,
        errors: parsed.errors.length > 0 ? parsed.errors : [error.message || 'Validation failed'],
        warnings: parsed.warnings,
        exitCode: error.status || 1,
        rawOutput: output,
      };
    }
  }

  /**
   * Validate portfolio using validate-portfolio-frontmatter.js
   */
  async validatePortfolio(contentPath: string): Promise<ValidationResult> {
    const scriptPath = path.join(this.projectRoot, 'scripts', 'validate-portfolio-frontmatter.js');

    if (!fs.existsSync(scriptPath)) {
      return {
        success: false,
        errors: ['Portfolio validation script not found'],
        warnings: [],
        exitCode: -1,
      };
    }

    if (!fs.existsSync(contentPath)) {
      return {
        success: false,
        errors: [`Content path not found: ${contentPath}`],
        warnings: [],
        exitCode: -1,
      };
    }

    try {
      // Run the Node.js script
      const output = execSync(`bun run "${scriptPath}"`, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: this.verbose ? 'inherit' : 'pipe',
      });

      const parsed = this.parseValidationOutput(output.toString());

      return {
        success: parsed.errors.length === 0,
        errors: parsed.errors,
        warnings: parsed.warnings,
        exitCode: 0,
        rawOutput: output.toString(),
      };
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const parsed = this.parseValidationOutput(output);

      return {
        success: false,
        errors: parsed.errors.length > 0 ? parsed.errors : [error.message || 'Validation failed'],
        warnings: parsed.warnings,
        exitCode: error.status || 1,
        rawOutput: output,
      };
    }
  }

  /**
   * Validate tech radar content
   *
   * Note: Tech radar validation uses built-in logic since there's no
   * dedicated validation script yet.
   */
  async validateTechRadar(contentPath: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!fs.existsSync(contentPath)) {
      return {
        success: false,
        errors: [`Content path not found: ${contentPath}`],
        warnings: [],
        exitCode: -1,
      };
    }

    const indexFile = path.join(contentPath, 'index.md');

    if (!fs.existsSync(indexFile)) {
      errors.push('index.md not found in bundle');
      return {
        success: false,
        errors,
        warnings,
        exitCode: 1,
      };
    }

    // Read and validate frontmatter
    const content = fs.readFileSync(indexFile, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      errors.push('Invalid or missing frontmatter');
      return {
        success: false,
        errors,
        warnings,
        exitCode: 1,
      };
    }

    // Parse frontmatter (basic YAML validation)
    const yaml = await import('js-yaml');
    try {
      const frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, any>;

      // Required fields
      const requiredFields = ['title', 'date', 'draft', 'description', 'quadrant', 'ring'];
      for (const field of requiredFields) {
        if (frontmatter[field] === undefined || frontmatter[field] === null) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Date format (handle both string and Date object)
      if (frontmatter.date) {
        const dateStr = frontmatter.date instanceof Date
          ? frontmatter.date.toISOString().split('T')[0]
          : String(frontmatter.date);
        if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
          errors.push('Invalid date format (should be YYYY-MM-DD)');
        }
      }

      // Quadrant and ring validation
      if (frontmatter.quadrant && typeof frontmatter.quadrant !== 'string') {
        errors.push('Quadrant must be a string');
      }

      if (frontmatter.ring && typeof frontmatter.ring !== 'string') {
        errors.push('Ring must be a string');
      }

      // Tags array
      if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
        errors.push('Tags must be an array');
      }

      // Valid rings
      const validRings = ['adopt', 'trial', 'assess', 'hold'];
      if (frontmatter.ring && !validRings.includes(frontmatter.ring)) {
        warnings.push(`Ring should be one of: ${validRings.join(', ')}`);
      }

    } catch (error: any) {
      errors.push(`Failed to parse frontmatter: ${error.message}`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      exitCode: errors.length > 0 ? 1 : 0,
    };
  }

  /**
   * Route validation to correct validator based on content type
   */
  async validateContent(type: ContentType, contentPath: string): Promise<ValidationResult> {
    switch (type) {
      case 'blog':
        return this.validateBlog(contentPath);

      case 'portfolio':
        return this.validatePortfolio(contentPath);

      case 'tech-radar':
        return this.validateTechRadar(contentPath);

      default:
        return {
          success: false,
          errors: [`Unknown content type: ${type}`],
          warnings: [],
          exitCode: -1,
        };
    }
  }

  /**
   * Parse validation output into structured results
   *
   * Handles multiple formats from different scripts:
   * - Blog script: Uses emoji indicators (❌, ⚠️, ✅)
   * - Portfolio script: Uses similar emoji indicators
   */
  parseValidationOutput(output: string): ParsedOutput {
    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    const lines = output.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Error indicators
      if (trimmed.includes('❌') || trimmed.includes('ERROR:') || trimmed.includes('Error:')) {
        // Extract message after indicator
        const match = trimmed.match(/❌\s*(.+)|ERROR:\s*(.+)|Error:\s*(.+)/);
        if (match) {
          const message = match[1] || match[2] || match[3];
          if (message && !errors.includes(message)) {
            errors.push(message);
          }
        }
      }

      // Warning indicators
      if (trimmed.includes('⚠️') || trimmed.includes('WARNING:') || trimmed.includes('Warning:')) {
        const match = trimmed.match(/⚠️\s*(.+)|WARNING:\s*(.+)|Warning:\s*(.+)/);
        if (match) {
          const message = match[1] || match[2] || match[3];
          if (message && !warnings.includes(message)) {
            warnings.push(message);
          }
        }
      }

      // Info indicators (extract file names, paths, etc.)
      if (trimmed.includes('🔍') || trimmed.includes('✅') || trimmed.includes('📄')) {
        info.push(trimmed);
      }
    }

    return { errors, warnings, info };
  }

  /**
   * Validate content in dry-run mode (without writing files)
   *
   * This is useful for validation before content generation.
   * Returns validation results based on the content structure.
   */
  async validateDryRun(
    type: ContentType,
    content: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      return {
        success: false,
        errors: ['Invalid or missing frontmatter'],
        warnings: [],
        exitCode: 1,
      };
    }

    // Import YAML for parsing
    const yaml = await import('js-yaml');

    try {
      const frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, any>;

      // Type-specific validation
      switch (type) {
        case 'blog':
          this.validateBlogFrontmatter(frontmatter, errors, warnings);
          break;
        case 'portfolio':
          this.validatePortfolioFrontmatter(frontmatter, errors, warnings);
          break;
        case 'tech-radar':
          this.validateTechRadarFrontmatter(frontmatter, errors, warnings);
          break;
      }

    } catch (error: any) {
      errors.push(`Failed to parse frontmatter: ${error.message}`);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      exitCode: errors.length > 0 ? 1 : 0,
    };
  }

  /**
   * Validate blog frontmatter (for dry-run mode)
   */
  private validateBlogFrontmatter(
    frontmatter: Record<string, any>,
    errors: string[],
    warnings: string[]
  ): void {
    const requiredFields = ['title', 'date', 'summary'];
    for (const field of requiredFields) {
      if (frontmatter[field] === undefined || frontmatter[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Handle both Date objects and strings
    if (frontmatter.date) {
      const dateStr = frontmatter.date instanceof Date
        ? frontmatter.date.toISOString().split('T')[0]
        : String(frontmatter.date);
      if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        errors.push('Invalid date format (should be YYYY-MM-DD)');
      }
    }

    if (frontmatter.summary) {
      const summaryLength = frontmatter.summary.length;
      if (summaryLength < 100) {
        warnings.push('Summary too short (recommend 150-200 characters)');
      } else if (summaryLength > 250) {
        warnings.push('Summary too long (recommend 150-200 characters)');
      }
    }

    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      errors.push('Tags must be an array');
    }

    if (frontmatter.categories && !Array.isArray(frontmatter.categories)) {
      errors.push('Categories must be an array');
    }
  }

  /**
   * Validate portfolio frontmatter (for dry-run mode)
   */
  private validatePortfolioFrontmatter(
    frontmatter: Record<string, any>,
    errors: string[],
    warnings: string[]
  ): void {
    const requiredFields = [
      'title',
      'date',
      'draft',
      'description',
      'client',
      'technologies',
      'completion_date',
      'category',
    ];
    for (const field of requiredFields) {
      if (frontmatter[field] === undefined || frontmatter[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Handle both Date objects and strings
    if (frontmatter.date) {
      const dateStr = frontmatter.date instanceof Date
        ? frontmatter.date.toISOString().split('T')[0]
        : String(frontmatter.date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        errors.push('Invalid date format (should be YYYY-MM-DD)');
      }
    }

    if (frontmatter.completion_date && !/^\d{4}-\d{2}$/.test(String(frontmatter.completion_date))) {
      errors.push('Invalid completion_date format (should be YYYY-MM)');
    }

    if (frontmatter.technologies && !Array.isArray(frontmatter.technologies)) {
      errors.push('Technologies must be an array');
    }

    if (frontmatter.github_url && !/^https?:\/\/github\.com\//.test(frontmatter.github_url)) {
      warnings.push('github_url should be a valid GitHub URL');
    }

    if (frontmatter.live_url && !/^https?:\/\/.+/.test(frontmatter.live_url)) {
      warnings.push('live_url should be a valid HTTP/HTTPS URL');
    }
  }

  /**
   * Validate tech radar frontmatter (for dry-run mode)
   */
  private validateTechRadarFrontmatter(
    frontmatter: Record<string, any>,
    errors: string[],
    warnings: string[]
  ): void {
    const requiredFields = ['title', 'date', 'draft', 'description', 'quadrant', 'ring'];
    for (const field of requiredFields) {
      if (frontmatter[field] === undefined || frontmatter[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Handle both Date objects and strings
    if (frontmatter.date) {
      const dateStr = frontmatter.date instanceof Date
        ? frontmatter.date.toISOString().split('T')[0]
        : String(frontmatter.date);
      if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        errors.push('Invalid date format (should be YYYY-MM-DD)');
      }
    }

    if (frontmatter.quadrant && typeof frontmatter.quadrant !== 'string') {
      errors.push('Quadrant must be a string');
    }

    if (frontmatter.ring && typeof frontmatter.ring !== 'string') {
      errors.push('Ring must be a string');
    }

    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      errors.push('Tags must be an array');
    }

    const validRings = ['adopt', 'trial', 'assess', 'hold'];
    if (frontmatter.ring && !validRings.includes(frontmatter.ring)) {
      warnings.push(`Ring should be one of: ${validRings.join(', ')}`);
    }
  }

  /**
   * Format validation result for display
   */
  formatResult(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.success) {
      lines.push('✅ Validation passed');
    } else {
      lines.push('❌ Validation failed');
    }

    if (result.errors.length > 0) {
      lines.push('\nErrors:');
      result.errors.forEach(error => lines.push(`  ❌ ${error}`));
    }

    if (result.warnings.length > 0) {
      lines.push('\nWarnings:');
      result.warnings.forEach(warning => lines.push(`  ⚠️  ${warning}`));
    }

    return lines.join('\n');
  }
}
