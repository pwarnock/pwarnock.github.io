/**
 * Hugo Integration Tests
 *
 * Tests for Hugo content bundle generation and validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { HugoIntegration } from '../hugo-integration.js';
import type { ContentGenerationOptions } from '../hugo-integration.js';

describe('HugoIntegration', () => {
  let hugo: HugoIntegration;
  let tempDir: string;
  let testProjectRoot: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = path.join(process.cwd(), 'tmp', 'test-hugo-' + Date.now());
    testProjectRoot = path.join(tempDir, 'project');
    await fs.mkdir(testProjectRoot, { recursive: true });
    await fs.mkdir(path.join(testProjectRoot, 'content'), { recursive: true });

    hugo = new HugoIntegration(testProjectRoot);
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Blog Post Generation', () => {
    it('should generate blog post with correct directory structure', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Test Blog Post',
        date: new Date('2025-01-15'),
        draft: true,
        frontmatter: {
          summary: 'This is a test blog post summary.',
          tags: ['test', 'blog'],
          categories: ['Testing'],
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Check path structure
      expect(result.directory).toContain('content/blog/posts/2025-01-15-');
      expect(result.file).toContain('index.md');
    });

    it('should generate blog frontmatter with required fields', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Test Blog Post',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'This is a test blog post summary.',
        },
      };

      const result = await hugo.generateContentBundle(options);

      expect(result.frontmatter.title).toBe('Test Blog Post');
      expect(result.frontmatter.date).toBe('2025-01-15');
      expect(result.frontmatter.summary).toBe('This is a test blog post summary.');
      expect(result.frontmatter.draft).toBe(true);
    });

    it('should handle blog post with all optional fields', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Comprehensive Test Post',
        date: new Date('2025-01-15'),
        draft: false,
        frontmatter: {
          summary: 'A comprehensive test summary.',
          content_type: 'original' as const,
          tags: ['tag1', 'tag2'],
          categories: ['category1'],
          featured_image: 'test-image.png',
          attribution: 'Test Author',
          source_url: 'https://example.com',
        },
      };

      const result = await hugo.generateContentBundle(options);

      expect(result.frontmatter.content_type).toBe('original');
      expect(result.frontmatter.tags).toEqual(['tag1', 'tag2']);
      expect(result.frontmatter.categories).toEqual(['category1']);
      expect(result.frontmatter.featured_image).toBe('test-image.png');
      expect(result.frontmatter.attribution).toBe('Test Author');
      expect(result.frontmatter.source_url).toBe('https://example.com');
    });

    it('should format markdown file with YAML frontmatter', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Markdown Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Testing markdown formatting.',
        },
      };

      const result = await hugo.generateContentBundle(options);
      const content = await fs.readFile(result.file, 'utf8');

      // Check YAML delimiters
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/\n---\n\n/);

      // Check frontmatter parsing
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      expect(frontmatterMatch).toBeTruthy();

      const frontmatter = yaml.load(frontmatterMatch![1]) as Record<string, any>;
      expect(frontmatter.title).toBe('Markdown Test');
      expect(frontmatter.summary).toBe('Testing markdown formatting.');
    });

    it('should use custom slug if provided', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Test Post',
        slug: 'custom-slug',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Test summary.',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.directory).toContain('custom-slug');
    });
  });

  describe('Portfolio Generation', () => {
    it('should generate portfolio with correct directory structure', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Test Project',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A test project description.',
          client: 'Test Client',
          technologies: ['React', 'TypeScript'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);

      expect(result.directory).toContain('content/portfolio/');
      expect(result.file).toContain('index.md');
    });

    it('should generate portfolio frontmatter with required fields', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Test Project',
        date: new Date('2025-01-15'),
        draft: false,
        frontmatter: {
          description: 'A test project.',
          client: 'Test Client',
          technologies: ['React'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);

      expect(result.frontmatter.title).toBe('Test Project');
      expect(result.frontmatter.date).toBe('2025-01-15');
      expect(result.frontmatter.draft).toBe(false);
      expect(result.frontmatter.description).toBe('A test project.');
      expect(result.frontmatter.client).toBe('Test Client');
      expect(result.frontmatter.technologies).toEqual(['React']);
      expect(result.frontmatter.completion_date).toBe('2025-01');
      expect(result.frontmatter.category).toBe('Web App');
    });

    it('should handle portfolio with optional URLs', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Open Source Project',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'An open source project.',
          client: 'Community',
          technologies: ['Node.js'],
          completion_date: '2025-01',
          category: 'Open Source',
          github_url: 'https://github.com/test/project',
          live_url: 'https://project-demo.com',
        },
      };

      const result = await hugo.generateContentBundle(options);

      expect(result.frontmatter.github_url).toBe('https://github.com/test/project');
      expect(result.frontmatter.live_url).toBe('https://project-demo.com');
    });

    it('should handle technologies as array or single value', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Tech Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test',
          technologies: 'SingleTech',
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.frontmatter.technologies).toEqual(['SingleTech']);
    });
  });

  describe('Tech Radar Generation', () => {
    it('should generate tech radar with correct directory structure', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Test Tool',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A test tool description.',
          quadrant: 'tools',
          ring: 'adopt',
        },
      };

      const result = await hugo.generateContentBundle(options);

      expect(result.directory).toContain('content/tools/');
      expect(result.file).toContain('index.md');
    });

    it('should generate tech radar frontmatter with required fields', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Test Tool',
        date: new Date('2025-01-15'),
        draft: false,
        frontmatter: {
          description: 'A revolutionary tool.',
          quadrant: 'tools',
          ring: 'trial',
        },
      };

      const result = await hugo.generateContentBundle(options);

      expect(result.frontmatter.title).toBe('Test Tool');
      expect(result.frontmatter.date).toBe('2025-01-15');
      expect(result.frontmatter.draft).toBe(false);
      expect(result.frontmatter.description).toBe('A revolutionary tool.');
      expect(result.frontmatter.quadrant).toBe('tools');
      expect(result.frontmatter.ring).toBe('trial');
    });

    it('should handle tech radar with optional tags', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Tagged Tool',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A tool with tags.',
          quadrant: 'languages',
          ring: 'assess',
          tags: ['javascript', 'runtime'],
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.frontmatter.tags).toEqual(['javascript', 'runtime']);
    });
  });

  describe('Slug Generation', () => {
    it('should generate slug from title for portfolio', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Amazing Web Application',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test',
          technologies: ['React'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.directory).toContain('amazing-web-application');
    });

    it('should generate date-prefixed slug for blog posts', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'My Blog Post',
        date: new Date('2025-03-20'),
        frontmatter: {
          summary: 'Test summary.',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.directory).toMatch(/2025-03-20-my-blog-post/);
    });

    it('should handle special characters in titles', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Test Project with Special Chars! @#$%',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test',
          technologies: ['Test'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.directory).toContain('test-project-with-special-chars');
    });
  });

  describe('Content Placeholder Generation', () => {
    it('should generate placeholder content for blog posts', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Placeholder Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Test summary.',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.content).toContain('# Placeholder Test');
      expect(result.content).toContain('<!-- Content will be generated in T10-T14 -->');
    });

    it('should generate placeholder content for portfolio', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Portfolio Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test',
          technologies: ['Test'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.content).toContain('# Portfolio Test');
      expect(result.content).toContain('## Project Overview');
    });

    it('should generate placeholder content for tech radar', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Tool Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          quadrant: 'tools',
          ring: 'adopt',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.content).toContain('# Tool Test');
      expect(result.content).toContain('## Overview');
    });

    it('should use custom content if provided', async () => {
      const customContent = '# Custom Content\n\nThis is custom markdown content.';
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Custom Content Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Test.',
        },
        content: customContent,
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.content).toBe(customContent);
    });
  });

  describe('Validation', () => {
    it('should validate valid blog frontmatter', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Valid Blog Post',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'A valid blog post with proper summary length that meets requirements.',
          tags: ['test'],
        },
      };

      const result = await hugo.generateContentBundle(options);
      const validation = await hugo.validateContentBundle(result.directory, 'blog');

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required blog fields', async () => {
      // Create a bundle with incomplete frontmatter
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Invalid Blog',
        date: new Date('2025-01-15'),
        frontmatter: {
          // Missing summary
          tags: ['test'],
        },
      };

      const result = await hugo.generateContentBundle(options);
      const validation = await hugo.validateContentBundle(result.directory, 'blog');

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Missing required field: summary');
    });

    it('should warn about short blog summaries', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Short Summary',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Too short',
        },
      };

      const result = await hugo.generateContentBundle(options);
      const validation = await hugo.validateContentBundle(result.directory, 'blog');

      expect(validation.warnings.some(w => w.includes('Summary too short'))).toBe(true);
    });

    it('should validate valid portfolio frontmatter', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Valid Portfolio',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A valid portfolio project.',
          client: 'Test Client',
          technologies: ['React', 'TypeScript'],
          completion_date: '2025-01',
          category: 'Web App',
          github_url: 'https://github.com/test/repo',
          live_url: 'https://demo.com',
        },
      };

      const result = await hugo.generateContentBundle(options);
      const validation = await hugo.validateContentBundle(result.directory, 'portfolio');

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required portfolio fields', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Invalid Portfolio',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          // Missing client, technologies, etc.
        },
      };

      const result = await hugo.generateContentBundle(options);
      const validation = await hugo.validateContentBundle(result.directory, 'portfolio');

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate valid tech radar frontmatter', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Valid Tool',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A valid tool.',
          quadrant: 'tools',
          ring: 'adopt',
          tags: ['testing'],
        },
      };

      const result = await hugo.generateContentBundle(options);
      const validation = await hugo.validateContentBundle(result.directory, 'tech-radar');

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unknown content type', async () => {
      const options = {
        type: 'unknown' as any,
        title: 'Test',
        date: new Date('2025-01-15'),
        frontmatter: {},
      };

      await expect(hugo.generateContentBundle(options)).rejects.toThrow();
    });
  });

  describe('File System Integration', () => {
    it('should create directory structure if it does not exist', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Directory Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Test.',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Verify file exists
      const fileExists = await fs
        .access(result.file)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should overwrite existing index.md', async () => {
      const customContent1 = '# Custom Content 1\n\nFirst version content.';
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Overwrite Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'First version.',
        },
        content: customContent1,
      };

      const result1 = await hugo.generateContentBundle(options);
      expect(result1.frontmatter.summary).toBe('First version.');

      // Update options with new content
      const customContent2 = '# Custom Content 2\n\nSecond version content.';
      options.frontmatter.summary = 'Second version.';
      options.content = customContent2;
      const result2 = await hugo.generateContentBundle(options);

      // Should be same file
      expect(result2.file).toBe(result1.file);
      expect(result2.frontmatter.summary).toBe('Second version.');
      expect(result2.content).toContain('Second version content');
    });
  });

  describe('Draft Mode', () => {
    it('should default draft to true for blog posts', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Draft Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Test.',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.frontmatter.draft).toBe(true);
    });

    it('should respect explicit draft settings', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Published Post',
        date: new Date('2025-01-15'),
        draft: false,
        frontmatter: {
          summary: 'Test.',
        },
      };

      const result = await hugo.generateContentBundle(options);
      expect(result.frontmatter.draft).toBe(false);
    });
  });

  describe('Validation Edge Cases', () => {
    it('should detect invalid date format in portfolio', async () => {
      // Create bundle with correct frontmatter first
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Invalid Date Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test Client',
          technologies: ['React'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Manually write an invalid date format to test validation
      const invalidContent = `---
title: Invalid Date Test
date: "01-15-2025"
draft: true
description: "Test."
client: "Test Client"
technologies: ["React"]
completion_date: "2025-01"
category: "Web App"
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'portfolio');
      expect(validation.errors).toContain('Invalid date format (should be YYYY-MM-DD)');
    });

    it('should detect invalid completion_date format', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Invalid Completion Date',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test Client',
          technologies: ['React'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write invalid completion date format
      const invalidContent = `---
title: Invalid Completion Date
date: "2025-01-15"
draft: true
description: "Test."
client: "Test Client"
technologies: ["React"]
completion_date: "January 2025"
category: "Web App"
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'portfolio');
      expect(validation.errors).toContain('Invalid completion_date format (should be YYYY-MM)');
    });

    it('should detect non-array technologies', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'Tech Array Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test Client',
          technologies: ['React'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write technologies as string instead of array
      const invalidContent = `---
title: Tech Array Test
date: "2025-01-15"
draft: true
description: "Test."
client: "Test Client"
technologies: "React"
completion_date: "2025-01"
category: "Web App"
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'portfolio');
      expect(validation.errors).toContain('Technologies must be an array');
    });

    it('should warn about invalid github_url', async () => {
      const options: ContentGenerationOptions = {
        type: 'portfolio',
        title: 'GitHub URL Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'Test.',
          client: 'Test Client',
          technologies: ['React'],
          completion_date: '2025-01',
          category: 'Web App',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write invalid github URL
      const invalidContent = `---
title: GitHub URL Test
date: "2025-01-15"
draft: true
description: "Test."
client: "Test Client"
technologies: ["React"]
completion_date: "2025-01"
category: "Web App"
github_url: "https://gitlab.com/user/repo"
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'portfolio');
      expect(validation.warnings.some(w => w.includes('github_url'))).toBe(true);
    });

    it('should detect invalid date format in tech radar', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Tech Radar Date Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A test tool.',
          quadrant: 'tools',
          ring: 'adopt',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write invalid date format
      const invalidContent = `---
title: Tech Radar Date Test
date: "January 15, 2025"
draft: true
description: "A test tool."
quadrant: "tools"
ring: "adopt"
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'tech-radar');
      expect(validation.errors).toContain('Invalid date format (should be YYYY-MM-DD)');
    });

    it('should detect non-string quadrant in tech radar', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Quadrant Type Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A test tool.',
          quadrant: 'tools',
          ring: 'adopt',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write quadrant as number
      const invalidContent = `---
title: Quadrant Type Test
date: "2025-01-15"
draft: true
description: "A test tool."
quadrant: 123
ring: "adopt"
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'tech-radar');
      expect(validation.errors).toContain('Quadrant must be a string');
    });

    it('should detect non-string ring in tech radar', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Ring Type Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A test tool.',
          quadrant: 'tools',
          ring: 'adopt',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write ring as number
      const invalidContent = `---
title: Ring Type Test
date: "2025-01-15"
draft: true
description: "A test tool."
quadrant: "tools"
ring: 456
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'tech-radar');
      expect(validation.errors).toContain('Ring must be a string');
    });

    it('should detect non-array tags in tech radar', async () => {
      const options: ContentGenerationOptions = {
        type: 'tech-radar',
        title: 'Tags Array Test',
        date: new Date('2025-01-15'),
        frontmatter: {
          description: 'A test tool.',
          quadrant: 'tools',
          ring: 'adopt',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write tags as string
      const invalidContent = `---
title: Tags Array Test
date: "2025-01-15"
draft: true
description: "A test tool."
quadrant: "tools"
ring: "adopt"
tags: "single-tag"
---

# Content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'tech-radar');
      expect(validation.errors).toContain('Tags must be an array');
    });

    it('should detect missing bundle index.md', async () => {
      // Create a directory without index.md
      const emptyDir = path.join(testProjectRoot, 'content', 'test-empty');
      await fs.mkdir(emptyDir, { recursive: true });

      const validation = await hugo.validateContentBundle(emptyDir, 'blog');
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('index.md not found in bundle');
    });

    it('should detect invalid frontmatter format', async () => {
      const options: ContentGenerationOptions = {
        type: 'blog',
        title: 'Invalid Frontmatter',
        date: new Date('2025-01-15'),
        frontmatter: {
          summary: 'Test.',
        },
      };

      const result = await hugo.generateContentBundle(options);

      // Write content without proper frontmatter
      const invalidContent = `This has no frontmatter at all

Just content`;
      await fs.writeFile(result.file, invalidContent, 'utf8');

      const validation = await hugo.validateContentBundle(result.directory, 'blog');
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid or missing frontmatter');
    });
  });
});
