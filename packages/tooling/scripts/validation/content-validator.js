#!/usr/bin/env node

/**
 * Content Validation Engine
 * Validates Hugo content against content type configuration rules
 * Uses data/content-types.yaml for dynamic validation rules
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export default class ContentValidator {
  constructor() {
    this.contentTypes = null;
    this.validationRules = null;
    this.errors = [];
    this.warnings = [];
    this.loadConfiguration();
  }

  /**
   * Load content type configuration from YAML file
   */
  loadConfiguration() {
    try {
      const configPath = path.join(process.cwd(), 'data', 'content-types.yaml');
      const configFile = fs.readFileSync(configPath, 'utf8');

      // Use js-yaml library for proper YAML parsing
      this.contentTypes = yaml.load(configFile);
      this.validationRules = this.contentTypes.validation || {};
      console.log('✅ Content type configuration loaded');
    } catch (error) {
      console.error('❌ Failed to load content type configuration:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate a single content file
   */
  validateContentFile(filePath) {
    const errors = [];
    const warnings = [];

    try {
      // Read frontmatter and content
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        errors.push('No frontmatter found');
        return { valid: false, errors, warnings };
      }

      const frontmatter = yaml.load(frontmatterMatch[1]);
      const contentType = frontmatter.content_type || 'original';

      // Get validation rules for this content type
      const typeRules = this.contentTypes.content_types[contentType];
      if (!typeRules) {
        errors.push(`Unknown content type: ${contentType}`);
        return { valid: false, errors, warnings };
      }

      // Validate required fields
      const requiredFields = typeRules.fields.required || [];
      for (const field of requiredFields) {
        if (!frontmatter[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Validate conditional requirements
      if (this.validationRules.attribution_required_for?.includes(contentType)) {
        if (!frontmatter.attribution) {
          errors.push('attribution field is required for this content type');
        }
      }

      if (this.validationRules.source_url_required_for?.includes(contentType)) {
        if (!frontmatter.source_url) {
          errors.push('source_url field is required for this content type');
        } else if (!this.isValidURL(frontmatter.source_url)) {
          errors.push('source_url must be a valid URL');
        }
      }

      // Validate summary length for content types that need it
      if (this.validationRules.summary_required_for?.includes(contentType)) {
        if (!frontmatter.summary) {
          errors.push('summary field is required for this content type');
        } else if (frontmatter.summary.length < 50) {
          warnings.push('Summary is too short (recommend 150-200 characters)');
        } else if (frontmatter.summary.length > 300) {
          warnings.push('Summary is too long (recommend 150-200 characters)');
        }
      }

      // Validate date format
      if (frontmatter.date) {
        if (!this.isValidDate(frontmatter.date)) {
          errors.push('Invalid date format');
        }
      }

      // Validate tags format
      if (frontmatter.tags) {
        if (!Array.isArray(frontmatter.tags)) {
          errors.push('Tags must be an array');
        } else {
          for (const tag of frontmatter.tags) {
            if (typeof tag !== 'string') {
              errors.push(`Invalid tag format: ${tag}`);
            }
          }
        }
      }

      // Content-specific validations
      if (contentType === 'embed') {
        if (!frontmatter.content || frontmatter.content.trim().length === 0) {
          warnings.push('Embed content should have some descriptive text');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        contentType,
        frontmatter,
      };
    } catch (error) {
      errors.push(`Failed to parse content: ${error.message}`);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Validate URL format
   */
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate date format
   */
  isValidDate(date) {
    return !isNaN(Date.parse(date));
  }

  /**
   * Validate all content files in a directory
   */
  validateContentDirectory(directory) {
    const results = [];

    if (!fs.existsSync(directory)) {
      console.error(`❌ Directory not found: ${directory}`);
      return results;
    }

    const files = this.getContentFiles(directory);
    console.log(`🔍 Validating ${files.length} content files in ${directory}`);

    for (const file of files) {
      const result = this.validateContentFile(file);
      result.filePath = file;
      results.push(result);
    }

    return results;
  }

  /**
   * Get all content files recursively
   */
  getContentFiles(directory) {
    const files = [];

    const scan = dir => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (this.isContentFile(fullPath)) {
          files.push(fullPath);
        }
      }
    };

    scan(directory);
    return files;
  }

  /**
   * Check if file is a content file
   */
  isContentFile(filePath) {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);

    // Skip index files in directories (Hugo convention)
    if (basename === 'index.md' || basename === 'index.html') {
      return false;
    }

    return ext === '.md' || ext === '.html';
  }

  /**
   * Generate validation report
   */
  generateReport(results) {
    const totalFiles = results.length;
    const validFiles = results.filter(r => r.valid).length;
    const invalidFiles = totalFiles - validFiles;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

    console.log('\n📊 VALIDATION REPORT');
    console.log('='.repeat(50));
    console.log(`Total files: ${totalFiles}`);
    console.log(`Valid files: ${validFiles}`);
    console.log(`Invalid files: ${invalidFiles}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Total warnings: ${totalWarnings}`);

    if (invalidFiles > 0) {
      console.log('\n❌ INVALID FILES:');
      for (const result of results.filter(r => !r.valid)) {
        console.log(`\n📄 ${result.filePath}`);
        for (const error of result.errors) {
          console.log(`  ❌ ${error}`);
        }
        for (const warning of result.warnings) {
          console.log(`  ⚠️  ${warning}`);
        }
      }
    }

    if (totalWarnings > 0) {
      console.log('\n⚠️  FILES WITH WARNINGS:');
      for (const result of results.filter(r => r.warnings.length > 0)) {
        console.log(`\n📄 ${result.filePath}`);
        for (const warning of result.warnings) {
          console.log(`  ⚠️  ${warning}`);
        }
      }
    }

    console.log('\n' + '='.repeat(50));

    const successRate = ((validFiles / totalFiles) * 100).toFixed(1);
    if (successRate >= 90) {
      console.log(`🎉 VALIDATION SUCCESS: ${successRate}% pass rate`);
    } else if (successRate >= 70) {
      console.log(`⚠️  VALIDATION WARNING: ${successRate}% pass rate`);
    } else {
      console.log(`❌ VALIDATION FAILED: ${successRate}% pass rate`);
    }

    return {
      totalFiles,
      validFiles,
      invalidFiles,
      totalErrors,
      totalWarnings,
      successRate: parseFloat(successRate),
    };
  }

  /**
   * Export validation results to JSON
   */
  exportResults(results, outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateReport(results),
      details: results,
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report exported to: ${outputPath}`);
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  let directory = 'content';
  let outputPath = null;
  let exportReport = false;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--directory':
      case '-d':
        directory = args[++i];
        break;
      case '--output':
      case '-o':
        outputPath = args[++i];
        exportReport = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Content Validation Engine

Usage: node content-validator.js [options]

Options:
  -d, --directory <path>   Content directory to validate (default: content)
  -o, --output <path>     Export detailed report to JSON file
  -h, --help              Show this help message

Examples:
  node content-validator.js
  node content-validator.js --directory content/blog
  node content-validator.js --directory content/blog --output validation-report.json
        `);
        process.exit(0);
    }
  }

  console.log('🔍 Content Validation Engine');
  console.log('Validating content files against content type rules...\n');

  const validator = new ContentValidator();
  const results = validator.validateContentDirectory(directory);

  const report = validator.generateReport(results);

  if (exportReport && outputPath) {
    validator.exportResults(results, outputPath);
  }

  // Exit with appropriate code
  process.exit(report.successRate >= 90 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
