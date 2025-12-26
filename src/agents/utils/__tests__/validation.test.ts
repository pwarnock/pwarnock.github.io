/**
 * Tests for ValidationResult class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ValidationResult } from '../validation.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('ValidationResult', () => {
  let validator: ValidationResult;
  const tempDir = '/tmp/test-validation';

  beforeEach(() => {
    validator = new ValidationResult(process.cwd(), { verbose: false });

    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('parseValidationOutput', () => {
    it('should parse errors from blog validation script', () => {
      const output = `❌ Missing required fields: title, date
⚠️  Summary too short (120 chars, recommend 150-200)
✅ Validation complete`;

      const result = validator.parseValidationOutput(output);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Missing required fields');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Summary too short');
      expect(result.info).toHaveLength(1);
    });

    it('should parse warnings from validation script', () => {
      const output = `⚠️  Unknown technologies: Haskell, Erlang
⚠️  Consider adding github_url
✅ All fields present`;

      const result = validator.parseValidationOutput(output);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]).toContain('Unknown technologies');
      expect(result.warnings[1]).toContain('github_url');
    });

    it('should parse successful validation', () => {
      const output = `✅ blog-post: Valid
✅ All blog posts validated successfully!`;

      const result = validator.parseValidationOutput(output);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.info).toHaveLength(2);
    });

    it('should handle empty output', () => {
      const output = '';
      const result = validator.parseValidationOutput(output);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.info).toHaveLength(0);
    });

    it('should handle multiline error messages', () => {
      const output = `❌ Missing required field: description
💡 Content type 'tutorial' requires: title, date, summary, description
⚠️  Consider adding featured_image`;

      const result = validator.parseValidationOutput(output);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Missing required field');
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('validateBlog', () => {
    it('should return error when script does not exist', async () => {
      const badValidator = new ValidationResult('/nonexistent/path');
      const result = await badValidator.validateBlog(tempDir);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Blog validation script not found');
      expect(result.exitCode).toBe(-1);
    });

    it('should return error when content path does not exist', async () => {
      const result = await validator.validateBlog('/nonexistent/content');

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Content path not found:');
      expect(result.exitCode).toBe(-1);
    });

    it('should validate existing blog post', async () => {
      // Skip this test if no real blog posts exist
      const blogDir = path.join(process.cwd(), 'content/blog/posts');
      if (!fs.existsSync(blogDir)) {
        return;
      }

      const posts = fs.readdirSync(blogDir).filter(f =>
        fs.statSync(path.join(blogDir, f)).isDirectory()
      );

      if (posts.length === 0) {
        return;
      }

      // Test with the first blog post
      const postPath = path.join(blogDir, posts[0]);
      const result = await validator.validateBlog(postPath);

      // Result should be structured
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('exitCode');
    });
  });

  describe('validatePortfolio', () => {
    it('should return error when script does not exist', async () => {
      const badValidator = new ValidationResult('/nonexistent/path');
      const result = await badValidator.validatePortfolio(tempDir);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Portfolio validation script not found');
      expect(result.exitCode).toBe(-1);
    });

    it('should return error when content path does not exist', async () => {
      const result = await validator.validatePortfolio('/nonexistent/content');

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Content path not found:');
      expect(result.exitCode).toBe(-1);
    });

    it('should validate existing portfolio item', async () => {
      // Skip this test if no portfolio items exist
      const portfolioDir = path.join(process.cwd(), 'content/portfolio');
      if (!fs.existsSync(portfolioDir)) {
        return;
      }

      const items = fs.readdirSync(portfolioDir).filter(f =>
        fs.statSync(path.join(portfolioDir, f)).isDirectory()
      );

      if (items.length === 0) {
        return;
      }

      // Test with the first portfolio item
      const itemPath = path.join(portfolioDir, items[0]);
      const result = await validator.validatePortfolio(itemPath);

      // Result should be structured
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('exitCode');
    });
  });

  describe('validateTechRadar', () => {
    it('should validate tech radar content', async () => {
      const toolDir = path.join(tempDir, 'test-tool');
      fs.mkdirSync(toolDir, { recursive: true });

      const indexFile = path.join(toolDir, 'index.md');
      const content = `---
title: "Test Tool"
date: "2025-01-15"
draft: false
description: "A test tool"
quadrant: "tools"
ring: "adopt"
tags: ["testing"]
---

# Test Tool

This is a test tech radar entry.
`;
      fs.writeFileSync(indexFile, content);

      const result = await validator.validateTechRadar(toolDir);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.exitCode).toBe(0);
    });

    it('should detect missing index.md', async () => {
      const emptyDir = path.join(tempDir, 'empty-tool');
      fs.mkdirSync(emptyDir, { recursive: true });

      const result = await validator.validateTechRadar(emptyDir);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('index.md not found in bundle');
    });

    it('should detect missing frontmatter', async () => {
      const toolDir = path.join(tempDir, 'no-fm-tool');
      fs.mkdirSync(toolDir, { recursive: true });

      const indexFile = path.join(toolDir, 'index.md');
      fs.writeFileSync(indexFile, '# No frontmatter\n');

      const result = await validator.validateTechRadar(toolDir);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid or missing frontmatter');
    });

    it('should detect missing required fields', async () => {
      const toolDir = path.join(tempDir, 'incomplete-tool');
      fs.mkdirSync(toolDir, { recursive: true });

      const indexFile = path.join(toolDir, 'index.md');
      const content = `---
title: "Incomplete Tool"
date: "2025-01-15"
---

# Incomplete Tool
`;
      fs.writeFileSync(indexFile, content);

      const result = await validator.validateTechRadar(toolDir);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Missing required field: draft');
    });

    it('should warn about invalid ring value', async () => {
      const toolDir = path.join(tempDir, 'bad-ring-tool');
      fs.mkdirSync(toolDir, { recursive: true });

      const indexFile = path.join(toolDir, 'index.md');
      const content = `---
title: "Bad Ring Tool"
date: "2025-01-15"
draft: false
description: "A tool with bad ring"
quadrant: "tools"
ring: "invalid"
---

# Bad Ring Tool
`;
      fs.writeFileSync(indexFile, content);

      const result = await validator.validateTechRadar(toolDir);

      expect(result.success).toBe(true); // Warnings don't fail validation
      expect(result.warnings).toContain('Ring should be one of: adopt, trial, assess, hold');
    });
  });

  describe('validateContent', () => {
    it('should route blog validation correctly', async () => {
      // Mock validateBlog to verify routing
      const validateBlogSpy = vi.spyOn(validator, 'validateBlog');

      const result = await validator.validateContent('blog', '/nonexistent/blog');

      expect(validateBlogSpy).toHaveBeenCalledWith('/nonexistent/blog');
      expect(result.success).toBe(false);
    });

    it('should route portfolio validation correctly', async () => {
      const validatePortfolioSpy = vi.spyOn(validator, 'validatePortfolio');

      const result = await validator.validateContent('portfolio', '/nonexistent/portfolio');

      expect(validatePortfolioSpy).toHaveBeenCalledWith('/nonexistent/portfolio');
      expect(result.success).toBe(false);
    });

    it('should route tech-radar validation correctly', async () => {
      const validateTechRadarSpy = vi.spyOn(validator, 'validateTechRadar');

      const result = await validator.validateContent('tech-radar', '/nonexistent/tool');

      expect(validateTechRadarSpy).toHaveBeenCalledWith('/nonexistent/tool');
      expect(result.success).toBe(false);
    });

    it('should handle unknown content type', async () => {
      // @ts-ignore - testing invalid type
      const result = await validator.validateContent('unknown', '/some/path');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unknown content type: unknown');
    });
  });

  describe('validateDryRun', () => {
    it('should validate blog frontmatter in dry-run mode', async () => {
      const content = `---
title: "Test Blog Post"
date: "2025-01-15"
summary: "This is a test blog post with enough content to pass the length validation requirements"
tags: ["test", "blog"]
categories: ["testing"]
---

# Test Blog Post

This is test content.
`;

      const result = await validator.validateDryRun('blog', content);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing blog fields in dry-run mode', async () => {
      const content = `---
title: "Incomplete Blog"
---

# Incomplete Blog
`;

      const result = await validator.validateDryRun('blog', content);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing required field: date');
      expect(result.errors).toContain('Missing required field: summary');
    });

    it('should validate portfolio frontmatter in dry-run mode', async () => {
      const content = `---
title: "Test Project"
date: "2025-01-15"
draft: false
description: "A test project description"
client: "Test Client"
technologies: ["React", "Node.js"]
completion_date: "2025-01"
category: "Web App"
github_url: "https://github.com/test/project"
live_url: "https://test-project.com"
---

# Test Project
`;

      const result = await validator.validateDryRun('portfolio', content);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing portfolio fields in dry-run mode', async () => {
      const content = `---
title: "Incomplete Project"
date: "2025-01-15"
---

# Incomplete Project
`;

      const result = await validator.validateDryRun('portfolio', content);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Missing required field: draft');
      expect(result.errors).toContain('Missing required field: description');
    });

    it('should validate tech-radar frontmatter in dry-run mode', async () => {
      const content = `---
title: "Test Tool"
date: "2025-01-15"
draft: false
description: "A test tool for tech radar"
quadrant: "tools"
ring: "adopt"
tags: ["testing"]
---

# Test Tool
`;

      const result = await validator.validateDryRun('tech-radar', content);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid frontmatter in dry-run mode', async () => {
      const content = `No frontmatter here
Just content
`;

      const result = await validator.validateDryRun('blog', content);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid or missing frontmatter');
    });

    it('should warn about short summary in dry-run mode', async () => {
      const content = `---
title: "Short Summary Blog"
date: "2025-01-15"
summary: "Too short"
---

# Short Summary Blog
`;

      const result = await validator.validateDryRun('blog', content);

      expect(result.success).toBe(true); // Warnings don't fail
      expect(result.warnings).toContain('Summary too short (recommend 150-200 characters)');
    });

    it('should warn about invalid URL format in dry-run mode', async () => {
      const content = `---
title: "Bad URL Project"
date: "2025-01-15"
draft: false
description: "A project with bad URL"
client: "Test Client"
technologies: ["React"]
completion_date: "2025-01"
category: "Web App"
github_url: "not-a-github-url"
---

# Bad URL Project
`;

      const result = await validator.validateDryRun('portfolio', content);

      expect(result.success).toBe(true); // Warnings don't fail
      expect(result.warnings).toContain('github_url should be a valid GitHub URL');
    });
  });

  describe('formatResult', () => {
    it('should format successful validation result', () => {
      const result = {
        success: true,
        errors: [],
        warnings: [],
        exitCode: 0,
      };

      const formatted = validator.formatResult(result);

      expect(formatted).toContain('✅ Validation passed');
      expect(formatted).not.toContain('❌');
    });

    it('should format failed validation result with errors', () => {
      const result = {
        success: false,
        errors: ['Error 1', 'Error 2'],
        warnings: [],
        exitCode: 1,
      };

      const formatted = validator.formatResult(result);

      expect(formatted).toContain('❌ Validation failed');
      expect(formatted).toContain('❌ Error 1');
      expect(formatted).toContain('❌ Error 2');
    });

    it('should format validation result with warnings', () => {
      const result = {
        success: true,
        errors: [],
        warnings: ['Warning 1', 'Warning 2'],
        exitCode: 0,
      };

      const formatted = validator.formatResult(result);

      expect(formatted).toContain('✅ Validation passed');
      expect(formatted).toContain('⚠️  Warning 1');
      expect(formatted).toContain('⚠️  Warning 2');
    });

    it('should format validation result with both errors and warnings', () => {
      const result = {
        success: false,
        errors: ['Error 1'],
        warnings: ['Warning 1'],
        exitCode: 1,
      };

      const formatted = validator.formatResult(result);

      expect(formatted).toContain('❌ Validation failed');
      expect(formatted).toContain('Errors:');
      expect(formatted).toContain('Warnings:');
      expect(formatted).toContain('❌ Error 1');
      expect(formatted).toContain('⚠️  Warning 1');
    });
  });
});
