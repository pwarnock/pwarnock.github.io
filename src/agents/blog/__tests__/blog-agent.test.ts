/**
 * Blog Agent Tests
 *
 * Comprehensive test suite for the Blog Post Agent
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { BlogAgent } from '../blog-agent.js';
import type { BlogPostRequest } from '../blog-agent.js';

describe('BlogAgent', () => {
  let blogAgent: BlogAgent;
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Store original working directory
    originalCwd = process.cwd();

    // Create temporary directory for testing
    tempDir = path.join(process.cwd(), 'tmp', 'test-blog-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, '.cody', 'project', 'library', 'style-docs'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.cody', 'project', 'library', 'sessions'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content'), { recursive: true });

    // Change to temp directory
    process.chdir(tempDir);

    blogAgent = new BlogAgent();
    await blogAgent.initialize();
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const agent = new BlogAgent();
      await agent.initialize();
      expect(agent).toBeDefined();
    });

    it('should not initialize twice', async () => {
      const agent = new BlogAgent();
      await agent.initialize();
      await agent.initialize(); // Should not throw
      expect(agent).toBeDefined();
    });

    it('should get agent configuration', () => {
      const config = blogAgent.getConfig();

      expect(config.type).toBe('blog');
      expect(config.audience).toBeInstanceOf(Array);
      expect(config.toneGuidelines).toBeInstanceOf(Array);
      expect(config.frontmatterSchema).toBeDefined();
      expect(config.outputDirectory).toBe('content/blog/posts');
    });
  });

  describe('Blog Post Generation - Original Content', () => {
    it('should generate original blog post with required fields', async () => {
      const request: BlogPostRequest = {
        title: 'My Original Thoughts on Testing',
        contentType: 'original',
        summary: 'A deep dive into testing strategies and best practices.',
        keyPoints: [
          'Unit tests catch bugs early',
          'Integration tests verify components work together',
          'E2E tests validate user workflows'
        ],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle).toBeDefined();
      expect(result.bundlePath).toBeDefined();
      expect(result.bundle?.type).toBe('blog');
      expect(result.bundle?.frontmatter.title).toBe('My Original Thoughts on Testing');
      expect(result.bundle?.frontmatter.content_type).toBe('original');
      expect(result.bundle?.frontmatter.summary).toBe('A deep dive into testing strategies and best practices.');
      expect(result.bundle?.content).toContain('My Original Thoughts on Testing');
      expect(result.bundle?.content).toContain('## Introduction');
      expect(result.bundle?.content).toContain('## My Take');
      expect(result.bundle?.content).toContain('## Conclusion');
    });

    it('should generate original blog post with tags and categories', async () => {
      const request: BlogPostRequest = {
        title: 'Testing Strategies',
        contentType: 'original',
        summary: 'Best practices for testing',
        tags: ['testing', 'quality'],
        categories: ['Engineering'],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.tags).toEqual(['testing', 'quality']);
      expect(result.bundle?.frontmatter.categories).toEqual(['Engineering']);
    });

    it('should create review session for original blog post', async () => {
      const request: BlogPostRequest = {
        title: 'Review Session Test',
        contentType: 'original',
        summary: 'Testing review session creation',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.sessions).toBeDefined();
      expect(result.bundle?.sessions.length).toBeGreaterThan(0);
      expect(result.bundle?.sessions[0].status).toBe('active');
    });
  });

  describe('Blog Post Generation - Curated Content', () => {
    it('should generate curated blog post', async () => {
      const request: BlogPostRequest = {
        title: 'Weekly Tech Roundup',
        contentType: 'curated',
        summary: 'This week\'s most interesting tech news and articles.',
        keyPoints: [
          'New framework release',
          'Security vulnerability discovered',
          'Upcoming conference announcements'
        ],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.content_type).toBe('curated');
      expect(result.bundle?.content).toContain('## Overview');
      expect(result.bundle?.content).toContain('## Highlights');
      expect(result.bundle?.content).toContain('## Why It Matters');
      expect(result.bundle?.content).toContain('## Further Reading');
    });

    it('should include numbered highlights in curated content', async () => {
      const request: BlogPostRequest = {
        title: 'Curated Collection',
        contentType: 'curated',
        summary: 'Interesting finds',
        keyPoints: ['Item one', 'Item two', 'Item three'],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.content).toContain('1. Item one');
      expect(result.bundle?.content).toContain('2. Item two');
      expect(result.bundle?.content).toContain('3. Item three');
    });
  });

  describe('Blog Post Generation - Embed Content', () => {
    it('should generate embed blog post', async () => {
      const request: BlogPostRequest = {
        title: 'Favorite TED Talk',
        contentType: 'embed',
        summary: 'A thought-provoking talk on creativity.',
        keyPoints: ['TED Talk'],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.content_type).toBe('embed');
      expect(result.bundle?.content).toContain('## About This TED Talk');
      expect(result.bundle?.content).toContain('## Embedded Content');
      expect(result.bundle?.content).toContain('<!-- Embed code or reference -->');
      expect(result.bundle?.content).toContain('## Thoughts');
    });
  });

  describe('Blog Post Generation - Project Content', () => {
    it('should generate project blog post', async () => {
      const request: BlogPostRequest = {
        title: 'Building a Static Site Generator',
        contentType: 'project',
        summary: 'Lessons learned from building my own Hugo.',
        keyPoints: [
          'Markdown processing is tricky',
          'Template engines are powerful',
          'Performance optimization matters'
        ],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.content_type).toBe('project');
      expect(result.bundle?.content).toContain('## Project Overview');
      expect(result.bundle?.content).toContain('## How It Works');
      expect(result.bundle?.content).toContain('## Key Learnings');
      expect(result.bundle?.content).toContain('## What I\'d Do Differently');
    });

    it('should include key learnings as bullet points', async () => {
      const request: BlogPostRequest = {
        title: 'Project Post',
        contentType: 'project',
        summary: 'Project summary',
        keyPoints: ['Learning 1', 'Learning 2'],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.content).toContain('- Learning 1');
      expect(result.bundle?.content).toContain('- Learning 2');
    });
  });

  describe('Blog Post Generation - Validation', () => {
    it('should reject blog post without title', async () => {
      const request: BlogPostRequest = {
        title: '',
        contentType: 'original',
        summary: 'Summary',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    it('should reject blog post without summary', async () => {
      const request: BlogPostRequest = {
        title: 'Test Title',
        contentType: 'original',
        summary: '',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Summary is required');
    });

    it('should reject blog post without content type', async () => {
      const request: BlogPostRequest = {
        title: 'Test Title',
        contentType: undefined as any,
        summary: 'Summary',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Content type is required');
    });

    it('should generate valid frontmatter structure', async () => {
      const request: BlogPostRequest = {
        title: 'Frontmatter Test',
        contentType: 'original',
        summary: 'Testing frontmatter structure',
        date: new Date('2025-01-15'),
        draft: false,
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.title).toBe('Frontmatter Test');
      expect(result.bundle?.frontmatter.date).toBe('2025-01-15');
      expect(result.bundle?.frontmatter.draft).toBe(false);
      expect(result.bundle?.frontmatter.summary).toBeDefined();
    });
  });

  describe('Image Prompt Generation', () => {
    it('should generate image prompts for blog post', async () => {
      const request: BlogPostRequest = {
        title: 'AI in Software Development',
        contentType: 'original',
        summary: 'How AI is changing the way we write code.',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.imagePrompts).toBeDefined();
      expect(result.bundle?.imagePrompts.length).toBeGreaterThan(0);
      expect(result.bundle?.imagePrompts[0]).toContain('illustration');
    });

    it('should include metadata in image prompts', async () => {
      const request: BlogPostRequest = {
        title: 'Test Post',
        contentType: 'original',
        summary: 'Test summary',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.imagePrompts.length).toBeGreaterThan(0);
      // Image prompts should be relevant to the content
      expect(result.bundle?.imagePrompts[0]).toBeTruthy();
    });
  });

  describe('Voice Learning', () => {
    it('should get default style guidelines', async () => {
      const guidelines = await blogAgent.getStyleGuidelines();

      expect(guidelines.tone).toBeDefined();
      expect(guidelines.vocabulary).toBeInstanceOf(Array);
      expect(guidelines.dos).toBeInstanceOf(Array);
      expect(guidelines.donts).toBeInstanceOf(Array);
      expect(guidelines.tone).toContain('Conversational');
    });

    it('should record positive feedback', async () => {
      // First add vocabulary to ensure style doc exists
      await blogAgent.addVocabulary('test-word');

      const result = await blogAgent.recordFeedback(
        'I like how you use "I" statements and keep it personal',
        'positive'
      );

      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.patternsExtracted).toBeDefined();
    });

    it('should record negative feedback', async () => {
      // First add vocabulary to ensure style doc exists
      await blogAgent.addVocabulary('test-word-2');

      const result = await blogAgent.recordFeedback(
        'Don\'t use "delve into" - it sounds too AI-written',
        'negative'
      );

      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
    });

    it('should add vocabulary to style documentation', async () => {
      await blogAgent.addVocabulary('foobar');
      const progress = await blogAgent.getLearningProgress();

      expect(progress.vocabularyCount).toBeGreaterThan(0);
    });

    it('should get learning progress', async () => {
      const progress = await blogAgent.getLearningProgress();

      expect(progress.vocabularyCount).toBeGreaterThanOrEqual(0);
      expect(progress.patternCount).toBeGreaterThanOrEqual(0);
      expect(progress.doCount).toBeGreaterThanOrEqual(0);
      expect(progress.dontCount).toBeGreaterThanOrEqual(0);
      expect(progress.lastUpdated).toBeDefined();
    });
  });

  describe('Review Workflow Integration', () => {
    it('should provide access to review workflow', () => {
      const workflow = blogAgent.getReviewWorkflow();

      expect(workflow).toBeDefined();
    });

    it('should create review session with bundle', async () => {
      const request: BlogPostRequest = {
        title: 'Review Test',
        contentType: 'original',
        summary: 'Testing review workflow',
      };

      const result = await blogAgent.generateBlogPost(request);
      const workflow = blogAgent.getReviewWorkflow();

      expect(result.success).toBe(true);
      expect(result.bundle?.sessions.length).toBeGreaterThan(0);

      // Check session exists in workflow
      const sessionId = result.bundle?.sessions[0].id;
      expect(sessionId).toBeDefined();
    });
  });

  describe('Content Type Helpers', () => {
    it('should return all supported content types', () => {
      const types = blogAgent.getSupportedContentTypes();

      expect(types).toEqual(['original', 'curated', 'embed', 'project']);
    });

    it('should return description for original content type', () => {
      const description = blogAgent.getContentTypeDescription('original');

      expect(description).toContain('Original thoughts');
    });

    it('should return description for curated content type', () => {
      const description = blogAgent.getContentTypeDescription('curated');

      expect(description).toContain('Curated collection');
    });

    it('should return description for embed content type', () => {
      const description = blogAgent.getContentTypeDescription('embed');

      expect(description).toContain('Embedded content');
    });

    it('should return description for project content type', () => {
      const description = blogAgent.getContentTypeDescription('project');

      expect(description).toContain('Project-based');
    });
  });

  describe('Template Generation', () => {
    it('should generate blog post from template', async () => {
      const result = await blogAgent.generateFromTemplate({
        contentType: 'original',
        title: 'Template Test',
        summary: 'Generated from template',
        keyPoints: ['Point 1', 'Point 2'],
        tags: ['test'],
        categories: ['Testing'],
      });

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.title).toBe('Template Test');
      expect(result.bundle?.frontmatter.tags).toEqual(['test']);
      expect(result.bundle?.frontmatter.categories).toEqual(['Testing']);
    });
  });

  describe('Hugo Integration', () => {
    it('should write blog post to correct directory', async () => {
      const request: BlogPostRequest = {
        title: 'Directory Test',
        contentType: 'original',
        summary: 'Testing directory structure',
        date: new Date('2025-01-15'),
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundlePath).toBeDefined();
      expect(result.bundlePath).toContain('content/blog/posts/2025-01-15-');
      expect(result.bundlePath).toContain('index.md');
    });

    it('should validate blog post', async () => {
      const request: BlogPostRequest = {
        title: 'Validation Test',
        contentType: 'original',
        summary: 'A valid blog post for validation testing.',
        date: new Date('2025-01-15'),
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);

      if (result.bundlePath) {
        const validation = await blogAgent.validateBlogPost(result.bundlePath);

        expect(validation).toBeDefined();
        expect(validation.errors).toBeInstanceOf(Array);
        expect(validation.warnings).toBeInstanceOf(Array);
      }
    });

    it('should create valid markdown file', async () => {
      const request: BlogPostRequest = {
        title: 'Markdown Test',
        contentType: 'original',
        summary: 'Testing markdown format',
        date: new Date('2025-01-15'),
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);

      if (result.bundlePath) {
        const content = await fs.readFile(result.bundlePath, 'utf-8');

        // Check for frontmatter delimiters
        expect(content).toContain('---');

        // Check frontmatter can be parsed
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        expect(frontmatterMatch).toBeTruthy();

        if (frontmatterMatch) {
          const frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, any>;
          expect(frontmatter.title).toBe('Markdown Test');
          expect(frontmatter.summary).toBe('Testing markdown format');
        }
      }
    });
  });

  describe('Content Structure', () => {
    it('should generate content with proper headings', async () => {
      const request: BlogPostRequest = {
        title: 'Structure Test',
        contentType: 'original',
        summary: 'Testing content structure',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.content).toContain('# Structure Test');
      expect(result.bundle?.content).toContain('##');
    });

    it('should include key points in generated content', async () => {
      const request: BlogPostRequest = {
        title: 'Key Points Test',
        contentType: 'original',
        summary: 'Testing key points',
        keyPoints: ['First point', 'Second point', 'Third point'],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.content).toContain('First point');
      expect(result.bundle?.content).toContain('Second point');
      expect(result.bundle?.content).toContain('Third point');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty key points array', async () => {
      const request: BlogPostRequest = {
        title: 'Empty Points Test',
        contentType: 'original',
        summary: 'Testing with empty key points',
        keyPoints: [],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle).toBeDefined();
    });

    it('should handle missing optional fields', async () => {
      const request: BlogPostRequest = {
        title: 'Minimal Post',
        contentType: 'original',
        summary: 'Testing minimal request',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.tags).toEqual([]);
      expect(result.bundle?.frontmatter.categories).toEqual([]);
    });

    it('should handle special characters in title', async () => {
      const request: BlogPostRequest = {
        title: 'Test with "Quotes" & \'Apostrophes\'',
        contentType: 'original',
        summary: 'Testing special characters',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.title).toContain('Quotes');
    });

    it('should default to draft mode', async () => {
      const request: BlogPostRequest = {
        title: 'Draft Test',
        contentType: 'original',
        summary: 'Testing draft default',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.draft).toBe(true);
    });

    it('should allow explicit draft false', async () => {
      const request: BlogPostRequest = {
        title: 'Published Test',
        contentType: 'original',
        summary: 'Testing published mode',
        draft: false,
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.draft).toBe(false);
    });
  });

  describe('Image Prompt Content', () => {
    it('should generate relevant image prompts based on content', async () => {
      const request: BlogPostRequest = {
        title: 'Machine Learning Basics',
        contentType: 'original',
        summary: 'An introduction to machine learning concepts.',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.imagePrompts.length).toBeGreaterThan(0);

      // Check that prompts are strings
      result.bundle?.imagePrompts.forEach(prompt => {
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
      });
    });

    it('should generate multiple prompt variations', async () => {
      const request: BlogPostRequest = {
        title: 'Multiple Prompts Test',
        contentType: 'original',
        summary: 'Testing multiple prompt generation',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.imagePrompts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Session Management', () => {
    it('should initialize review workflow on agent init', async () => {
      const agent = new BlogAgent();
      await agent.initialize();

      const workflow = agent.getReviewWorkflow();
      expect(workflow).toBeDefined();
    });

    it('should link session to bundle', async () => {
      const request: BlogPostRequest = {
        title: 'Session Link Test',
        contentType: 'original',
        summary: 'Testing session linkage',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.sessions.length).toBe(1);

      const session = result.bundle?.sessions[0];
      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeDefined();
      expect(session.status).toBe('active');
    });
  });

  describe('Date Handling', () => {
    it('should use provided date', async () => {
      const specificDate = new Date('2025-03-20');
      const request: BlogPostRequest = {
        title: 'Date Test',
        contentType: 'original',
        summary: 'Testing date handling',
        date: specificDate,
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.date).toBe('2025-03-20');
    });

    it('should default to today when no date provided', async () => {
      const today = new Date().toISOString().split('T')[0];
      const request: BlogPostRequest = {
        title: 'Today Test',
        contentType: 'original',
        summary: 'Testing default date',
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.date).toBe(today);
    });
  });

  describe('Content Optimization', () => {
    it('should include SEO-friendly structure', async () => {
      const request: BlogPostRequest = {
        title: 'SEO Test Post',
        contentType: 'original',
        summary: 'Testing SEO optimization in blog structure',
        keyPoints: ['Key insight 1', 'Key insight 2'],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.content).toContain('# SEO Test Post');
      expect(result.bundle?.frontmatter.summary).toBeDefined();
    });
  });

  describe('All Content Types Coverage', () => {
    const contentTypes: Array<'original' | 'curated' | 'embed' | 'project'> = ['original', 'curated', 'embed', 'project'];

    it.each(contentTypes)('should generate %s content type', async (contentType) => {
      const request: BlogPostRequest = {
        title: `Test ${contentType} Post`,
        contentType,
        summary: `Testing ${contentType} content generation`,
        keyPoints: [`Point for ${contentType}`],
      };

      const result = await blogAgent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.frontmatter.content_type).toBe(contentType);
      expect(result.bundle?.content).toBeTruthy();
      expect(result.bundle?.content.length).toBeGreaterThan(0);
    });
  });
});
