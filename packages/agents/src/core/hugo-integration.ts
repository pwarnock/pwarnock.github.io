/**
 * Hugo Integration Module
 *
 * Generates Hugo content bundles with proper frontmatter and structure.
 * Supports blog posts, portfolio projects, and tech radar tools.
 *
 * Content Structure:
 * - Blog: content/blog/posts/YYYY-MM-DD-slug/index.md
 * - Portfolio: content/portfolio/project-name/index.md
 * - Tech Radar: content/tools/tool-name/index.md
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type {
  ContentType,
  BlogFrontmatter,
  PortfolioFrontmatter,
  TechRadarFrontmatter,
  BlogContentType,
} from '../types/index.js';

/**
 * Content generation options
 */
export interface ContentGenerationOptions {
  type: ContentType;
  subtype?: 'adopt' | 'trial' | 'assess' | 'hold';
  title: string;
  slug?: string;
  date: Date;
  draft?: boolean;
  frontmatter: Record<string, any>;
  content?: string;
}

/**
 * Generated content bundle result
 */
export interface ContentBundleResult {
  path: string;
  directory: string;
  file: string;
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Hugo Integration Class
 *
 * Handles generation of Hugo content bundles with proper frontmatter,
 * file naming conventions, and directory structure.
 */
export class HugoIntegration {
  private projectRoot: string;
  private contentDir: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.contentDir = path.join(projectRoot, 'content');
  }

  /**
   * Generate a content bundle
   */
  async generateContentBundle(
    options: ContentGenerationOptions
  ): Promise<ContentBundleResult> {
    const bundlePath = this.getBundlePath(options);
    const indexFile = path.join(bundlePath, 'index.md');

    // Generate frontmatter based on content type
    const frontmatter = this.generateFrontmatter(options);

    // Generate content (placeholder for now - enhanced in T10-T14)
    const content = options.content || this.generatePlaceholderContent(options);

    // Combine frontmatter and content
    const fullContent = this.formatMarkdownFile(frontmatter, content);

    // Ensure directory exists
    await fs.promises.mkdir(bundlePath, { recursive: true });

    // Write content
    await fs.promises.writeFile(indexFile, fullContent, 'utf8');

    return {
      path: indexFile,
      directory: bundlePath,
      file: indexFile,
      frontmatter,
      content,
    };
  }

  /**
   * Get the bundle path for a content type
   */
  private getBundlePath(options: ContentGenerationOptions): string {
    const { type, title, date, slug } = options;

    switch (type) {
      case 'blog':
        // Blog posts: content/blog/posts/YYYY-MM-DD-slug/
        const blogSlug = slug || this.generateSlug(title, date);
        return path.join(this.contentDir, 'blog', 'posts', blogSlug);

      case 'portfolio':
        // Portfolio: content/portfolio/project-name/
        const portfolioSlug = slug || this.generateSlug(title);
        return path.join(this.contentDir, 'portfolio', portfolioSlug);

      case 'tech-radar':
        // Tech Radar: content/tools/tool-name/
        const toolSlug = slug || this.generateSlug(title);
        return path.join(this.contentDir, 'tools', toolSlug);

      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  /**
   * Generate frontmatter based on content type
   */
  private generateFrontmatter(options: ContentGenerationOptions): Record<string, any> {
    const { type, frontmatter, title, date, draft = true } = options;

    const baseFrontmatter = {
      title,
      date: this.formatDate(date),
      draft,
      ...frontmatter,
    };

    switch (type) {
      case 'blog':
        return this.generateBlogFrontmatter(baseFrontmatter);

      case 'portfolio':
        return this.generatePortfolioFrontmatter(baseFrontmatter);

      case 'tech-radar':
        return this.generateTechRadarFrontmatter(baseFrontmatter);

      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  /**
   * Generate blog post frontmatter
   */
  private generateBlogFrontmatter(
    base: Record<string, any>
  ): BlogFrontmatter {
    const frontmatter: BlogFrontmatter = {
      title: base.title,
      date: base.date,
      summary: base.summary || '',
      draft: base.draft ?? true,
    };

    // Optional fields
    if (base.content_type) {
      frontmatter.content_type = base.content_type as BlogContentType;
    }
    if (base.tags) {
      frontmatter.tags = Array.isArray(base.tags) ? base.tags : [base.tags];
    }
    if (base.categories) {
      frontmatter.categories = Array.isArray(base.categories)
        ? base.categories
        : [base.categories];
    }
    if (base.featured_image) {
      frontmatter.featured_image = base.featured_image;
    }
    if (base.attribution) {
      frontmatter.attribution = base.attribution;
    }
    if (base.source_url) {
      frontmatter.source_url = base.source_url;
    }

    return frontmatter;
  }

  /**
   * Generate portfolio frontmatter
   */
  private generatePortfolioFrontmatter(
    base: Record<string, any>
  ): PortfolioFrontmatter {
    const frontmatter: PortfolioFrontmatter = {
      title: base.title,
      date: base.date,
      draft: base.draft ?? true,
      description: base.description || '',
      client: base.client || '',
      technologies: Array.isArray(base.technologies)
        ? base.technologies
        : [base.technologies],
      completion_date: base.completion_date || this.formatCompletionDate(base.date),
      category: base.category || '',
    };

    // Optional fields
    if (base.github_url) {
      frontmatter.github_url = base.github_url;
    }
    if (base.live_url) {
      frontmatter.live_url = base.live_url;
    }

    return frontmatter;
  }

  /**
   * Generate tech radar frontmatter
   */
  private generateTechRadarFrontmatter(
    base: Record<string, any>
  ): TechRadarFrontmatter {
    const frontmatter: TechRadarFrontmatter = {
      title: base.title,
      date: base.date,
      draft: base.draft ?? true,
      description: base.description || '',
      quadrant: base.quadrant || '',
      ring: base.ring || '',
    };

    // Optional fields
    if (base.tags) {
      frontmatter.tags = Array.isArray(base.tags) ? base.tags : [base.tags];
    }

    return frontmatter;
  }

  /**
   * Format markdown file with frontmatter and content
   */
  private formatMarkdownFile(
    frontmatter: Record<string, any>,
    content: string
  ): string {
    const yamlFrontmatter = yaml.dump(frontmatter, {
      lineWidth: -1, // Don't line wrap
      quotingType: '"',
      forceQuotes: false,
    });

    return `---\n${yamlFrontmatter}---\n\n${content}`;
  }

  /**
   * Generate placeholder content
   * TODO: Enhance in T10-T14 with actual content generation
   */
  private generatePlaceholderContent(options: ContentGenerationOptions): string {
    const { type, title } = options;

    switch (type) {
      case 'blog':
        return `# ${title}

<!-- Content will be generated in T10-T14 -->

## Overview

This is a placeholder for the blog post content.

## Key Points

- Point 1
- Point 2
- Point 3

## Conclusion

Summary and next steps.
`;

      case 'portfolio':
        return `# ${title}

<!-- Content will be generated in T10-T14 -->

## Project Overview

Brief description of the project.

## Technical Implementation

Details about the technology stack and implementation.

## Outcomes

Results and achievements.
`;

      case 'tech-radar':
        return `# ${title}

<!-- Content will be generated in T10-T14 -->

## Overview

Brief description of the tool or technology.

## Key Features

Main features and capabilities.

## Use Cases

When and how to use this tool.
`;

      default:
        return `# ${title}\n\nContent placeholder.`;
    }
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string, date?: Date): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes
      .trim();

    // For blog posts, prefix with date
    if (date) {
      const datePrefix = this.formatDate(date);
      return `${datePrefix}-${baseSlug}`;
    }

    return baseSlug;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format completion date to YYYY-MM
   */
  private formatCompletionDate(dateStr: string): string {
    return dateStr.substring(0, 7); // YYYY-MM
  }

  /**
   * Validate content bundle against existing validation scripts
   */
  async validateContentBundle(
    bundlePath: string,
    type: ContentType
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const indexFile = path.join(bundlePath, 'index.md');

    // Check if index.md exists
    if (!fs.existsSync(indexFile)) {
      errors.push('index.md not found in bundle');
      return { valid: false, errors, warnings };
    }

    // Read and parse frontmatter
    const content = await fs.promises.readFile(indexFile, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      errors.push('Invalid or missing frontmatter');
      return { valid: false, errors, warnings };
    }

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
    } catch (error) {
      errors.push(`Failed to parse frontmatter: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate blog frontmatter
   */
  private validateBlogFrontmatter(
    frontmatter: Record<string, any>,
    errors: string[],
    warnings: string[]
  ): void {
    // Required fields
    const requiredFields = ['title', 'date', 'summary'];
    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Date format
    if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}/.test(frontmatter.date)) {
      errors.push('Invalid date format (should be YYYY-MM-DD)');
    }

    // Summary length
    if (frontmatter.summary) {
      const summaryLength = frontmatter.summary.length;
      if (summaryLength < 100) {
        warnings.push('Summary too short (recommend 150-200 characters)');
      } else if (summaryLength > 250) {
        warnings.push('Summary too long (recommend 150-200 characters)');
      }
    }

    // Tags format
    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      errors.push('Tags must be an array');
    }

    // Categories format
    if (frontmatter.categories && !Array.isArray(frontmatter.categories)) {
      errors.push('Categories must be an array');
    }
  }

  /**
   * Validate portfolio frontmatter
   */
  private validatePortfolioFrontmatter(
    frontmatter: Record<string, any>,
    errors: string[],
    warnings: string[]
  ): void {
    // Required fields
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
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Date format
    if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)) {
      errors.push('Invalid date format (should be YYYY-MM-DD)');
    }

    // Completion date format
    if (frontmatter.completion_date && !/^\d{4}-\d{2}$/.test(frontmatter.completion_date)) {
      errors.push('Invalid completion_date format (should be YYYY-MM)');
    }

    // Technologies array
    if (frontmatter.technologies && !Array.isArray(frontmatter.technologies)) {
      errors.push('Technologies must be an array');
    }

    // Optional URLs
    if (frontmatter.github_url && !/^https?:\/\/github\.com\//.test(frontmatter.github_url)) {
      warnings.push('github_url should be a valid GitHub URL');
    }

    if (frontmatter.live_url && !/^https?:\/\/.+/.test(frontmatter.live_url)) {
      warnings.push('live_url should be a valid HTTP/HTTPS URL');
    }
  }

  /**
   * Validate tech radar frontmatter
   */
  private validateTechRadarFrontmatter(
    frontmatter: Record<string, any>,
    errors: string[],
    warnings: string[]
  ): void {
    // Required fields
    const requiredFields = ['title', 'date', 'draft', 'description', 'quadrant', 'ring'];
    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Date format
    if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}/.test(frontmatter.date)) {
      errors.push('Invalid date format (should be YYYY-MM-DD)');
    }

    // Quadrant and ring should be strings
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
  }
}
