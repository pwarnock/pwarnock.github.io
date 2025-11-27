#!/usr/bin/env node

/**
 * Hugo Configuration Validator
 * Detects common TOML syntax errors and configuration issues
 * Provides fast feedback for config debugging
 */

const fs = require('fs');
const path = require('path');

class HugoConfigValidator {
  constructor(configPath = 'hugo.toml') {
    this.configPath = configPath;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate Hugo configuration file
   */
  validate() {
    console.log(`🔍 Validating Hugo configuration: ${this.configPath}`);

    if (!fs.existsSync(this.configPath)) {
      this.errors.push(`Configuration file not found: ${this.configPath}`);
      return this.report();
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      const lines = content.split('\n');

      this.validateStructure(lines);
      this.validateDuplicateSections(lines);
      this.validateNesting(lines);
      this.validateRequiredKeys(lines);
    } catch (error) {
      this.errors.push(`Failed to read config: ${error.message}`);
    }

    return this.report();
  }

  /**
   * Validate overall structure
   */
  validateStructure(lines) {
    const hasParams = lines.some(line => line.trim().startsWith('[params]'));
    const hasAuthor = lines.some(line => line.trim().startsWith('[author]'));

    if (!hasParams) {
      this.errors.push('Missing [params] section');
    }

    // Check for multiple [params] sections
    const paramsSections = lines.filter(line => line.trim().startsWith('[params]')).length;
    if (paramsSections > 1) {
      this.errors.push(`Multiple [params] sections found (${paramsSections}). Only one allowed.`);
    }
  }

  /**
   * Validate duplicate sections and keys
   */
  validateDuplicateSections(lines) {
    const sections = {};
    const sectionKeys = {};

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const sectionName = trimmed.slice(1, -1);

        if (sections[sectionName]) {
          this.errors.push(
            `Duplicate section [${sectionName}] at line ${index + 1} (previous at line ${sections[sectionName]})`
          );
        } else {
          sections[sectionName] = index + 1;
        }

        if (sectionKeys[sectionName]) {
          this.errors.push(`Duplicate key in section [${sectionName}] at line ${index + 1}`);
        }
      }
    });
  }

  /**
   * Validate nesting structure
   */
  validateNesting(lines) {
    let inParamsSection = false;
    let paramsDepth = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('[params]')) {
        inParamsSection = true;
        paramsDepth = 1;
      } else if (trimmed.startsWith('[')) {
        if (inParamsSection) {
          paramsDepth++;
          if (paramsDepth > 2) {
            this.warnings.push(
              `Deep nesting in [params] at line ${index + 1} (depth: ${paramsDepth})`
            );
          }
        }
      } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        paramsDepth = Math.max(0, paramsDepth - 1);
      }
    });
  }

  /**
   * Validate required keys for newsletter/social
   */
  validateRequiredKeys(lines) {
    const content = lines.join('\n');

    const requiredKeys = [
      'params.newsletter.title',
      'params.newsletter.action',
      'params.social.github',
      'params.social.linkedin',
      'params.social.twitter',
    ];

    requiredKeys.forEach(key => {
      if (!content.includes(key)) {
        this.warnings.push(`Missing recommended key: ${key}`);
      }
    });
  }

  /**
   * Generate validation report
   */
  report() {
    console.log('\n📊 HUGO CONFIGURATION VALIDATION REPORT');
    console.log('='.repeat(50));

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ Configuration is valid!');
    }

    console.log('\n' + '='.repeat(50));

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}

// CLI interface
function main() {
  const configPath = process.argv[2] || 'hugo.toml';
  const validator = new HugoConfigValidator(configPath);
  const result = validator.validate();

  process.exit(result.valid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = HugoConfigValidator;
