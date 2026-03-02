/**
 * Skill Integration Tests
 *
 * Tests the skill → agent → Hugo integration → validation pipeline.
 * These tests exercise the full content generation path that skills invoke,
 * verifying frontmatter validity, content structure, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { BlogAgent } from '../blog/blog-agent.js';
import type { BlogPostRequest } from '../blog/blog-agent.js';
import { PortfolioAgent } from '../portfolio/portfolio-agent.js';
import type { PortfolioGenerationRequest } from '../portfolio/portfolio-agent.js';
import { TechRadarAgent } from '../tech-radar/tech-radar-agent.js';
import type { TechRadarOptions } from '../tech-radar/tech-radar-agent.js';
import { getAgentConfig } from '../config/agent-config.js';
import { resetAgentPaths } from '../config/index.js';

/**
 * Parse frontmatter from generated markdown content
 */
function parseFrontmatter(content: string): Record<string, any> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  try {
    return yaml.load(match[1]) as Record<string, any>;
  } catch {
    return null;
  }
}

describe('Skill Integration: Content Generation E2E', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    resetAgentPaths();
    originalCwd = process.cwd();
    tempDir = path.join(originalCwd, 'tmp', 'test-skill-integration-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'style-docs'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'sessions'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'blog', 'posts'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'portfolio'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'tools'), { recursive: true });
    process.chdir(tempDir);
  });

  afterEach(async () => {
    resetAgentPaths();
    process.chdir(originalCwd);
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Blog Post Generation', () => {
    it('should generate a blog post with valid Hugo frontmatter', async () => {
      const agent = new BlogAgent();
      await agent.initialize();

      const request: BlogPostRequest = {
        title: 'Integration Test Blog Post',
        contentType: 'original',
        summary: 'Testing the blog agent generates valid Hugo content bundles with proper frontmatter structure and SEO fields',
        keyPoints: ['testing', 'validation', 'automation'],
      };

      const result = await agent.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.bundlePath).toBeTruthy();
      expect(result.bundle).toBeDefined();
      expect(result.bundle!.frontmatter.title).toBe('Integration Test Blog Post');
      expect(result.bundle!.frontmatter.draft).toBe(true);
      expect(result.bundle!.content).toBeTruthy();
      expect(result.bundle!.content.length).toBeGreaterThan(50);
    });

    it('should create blog post file on disk as Hugo page bundle', async () => {
      const agent = new BlogAgent();
      await agent.initialize();

      const request: BlogPostRequest = {
        title: 'Disk Write Test',
        contentType: 'original',
        summary: 'Testing that the blog agent writes content to disk in the correct Hugo page bundle format',
      };

      const result = await agent.generateBlogPost(request);
      expect(result.success).toBe(true);
      expect(result.bundlePath).toBeTruthy();

      const fileExists = await fs.access(result.bundlePath!).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(result.bundlePath!, 'utf8');
      const fm = parseFrontmatter(content);
      expect(fm).not.toBeNull();
      expect(fm!.title).toBe('Disk Write Test');
      expect(fm!.draft).toBe(true);
    });
  });

  describe('Portfolio Generation', () => {
    it('should generate a portfolio entry with all required fields', async () => {
      const agent = new PortfolioAgent();
      await agent.initialize();

      const request: PortfolioGenerationRequest = {
        title: 'Integration Test Project',
        client: 'Test Client Corp',
        description: 'Full-stack application for automated testing infrastructure',
        technologies: ['TypeScript', 'Bun', 'Vitest'],
        completionDate: new Date('2026-03-01'),
        category: 'CLI Tool',
      };

      const result = await agent.generatePortfolio(request);

      expect(result.success).toBe(true);
      expect(result.contentPath).toBeTruthy();
      expect(result.bundle).toBeDefined();
      expect(result.bundle!.frontmatter.title).toBe('Integration Test Project');
      expect(result.bundle!.frontmatter.client).toBe('Test Client Corp');
      expect(result.bundle!.frontmatter.draft).toBe(true);
      expect(result.bundle!.content).toBeTruthy();
    });

    it('should write portfolio as Hugo page bundle with index.md', async () => {
      const agent = new PortfolioAgent();
      await agent.initialize();

      const request: PortfolioGenerationRequest = {
        title: 'Bundle Test',
        client: 'Test Client',
        description: 'Testing Hugo page bundle creation',
        technologies: ['Bun'],
        completionDate: new Date('2026-03-01'),
        category: 'Web App',
      };

      const result = await agent.generatePortfolio(request);
      expect(result.success).toBe(true);
      expect(result.contentPath).toBeTruthy();
      expect(result.contentPath).toMatch(/index\.md$/);

      const content = await fs.readFile(result.contentPath!, 'utf8');
      const fm = parseFrontmatter(content);
      expect(fm).not.toBeNull();
      expect(fm!.category).toBe('Web App');
      expect(fm!.completion_date).toBe('2026-03');
    });
  });

  describe('Tech Radar Generation', () => {
    it('should generate radar entry with valid quadrant and ring', async () => {
      const agent = new TechRadarAgent();

      const options: TechRadarOptions = {
        title: 'Integration Test Framework',
        description: 'Testing the tech radar generation pipeline',
        quadrant: 'tools',
        ring: 'assess',
        tags: ['testing', 'integration'],
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.title).toBe('Integration Test Framework');
      expect(result.frontmatter.quadrant).toBe('tools');
      expect(result.frontmatter.ring).toBe('assess');
      expect(result.frontmatter.draft).toBe(true);
      expect(result.frontmatter.tags).toContain('testing');
      expect(result.content).toBeTruthy();
    });

    it('should generate ring-appropriate content for each ring', async () => {
      const agent = new TechRadarAgent();
      const rings = ['adopt', 'trial', 'assess', 'hold'] as const;

      for (const ring of rings) {
        const result = await agent.generateTechRadar({
          title: `${ring}-ring-test`,
          description: `Testing ${ring} ring generation`,
          quadrant: 'tools',
          ring,
        });

        expect(result.frontmatter.ring).toBe(ring);
        expect(result.content.length).toBeGreaterThan(50);
      }
    });
  });
});

describe('Skill Integration: Argument Validation', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    resetAgentPaths();
    originalCwd = process.cwd();
    tempDir = path.join(originalCwd, 'tmp', 'test-skill-validation-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'style-docs'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'sessions'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'blog', 'posts'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'portfolio'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'tools'), { recursive: true });
    process.chdir(tempDir);
  });

  afterEach(async () => {
    resetAgentPaths();
    process.chdir(originalCwd);
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should handle missing blog title gracefully', async () => {
    const agent = new BlogAgent();
    await agent.initialize();

    const request: BlogPostRequest = {
      title: '',
      contentType: 'original',
      summary: 'A post without a title',
    };

    // Should still generate but with empty/default title handling
    await expect(agent.generateBlogPost(request)).resolves.toBeDefined();
  });

  it('should handle missing portfolio technologies gracefully', async () => {
    const agent = new PortfolioAgent();
    await agent.initialize();

    const request: PortfolioGenerationRequest = {
      title: 'No Tech Project',
      client: 'Test',
      description: 'Testing empty technologies',
      technologies: [],
      completionDate: '2026-03',
      category: 'Web App',
    };

    await expect(agent.generatePortfolio(request)).resolves.toBeDefined();
  });
});

describe('Skill Integration: Agent Config', () => {
  it('should have validation scripts for all content types', () => {
    const blogConfig = getAgentConfig('blog');
    const portfolioConfig = getAgentConfig('portfolio');
    const radarConfig = getAgentConfig('tech-radar');

    expect(blogConfig.validationScripts.length).toBeGreaterThan(0);
    expect(portfolioConfig.validationScripts.length).toBeGreaterThan(0);
    expect(radarConfig.validationScripts.length).toBeGreaterThan(0);
  });

  it('should have tech radar validation script configured', () => {
    const radarConfig = getAgentConfig('tech-radar');
    expect(radarConfig.validationScripts).toContain('scripts/validate-tech-radar.js');
  });

  it('should have correct output directories', () => {
    expect(getAgentConfig('blog').outputDirectory).toBe('content/blog/posts');
    expect(getAgentConfig('portfolio').outputDirectory).toBe('content/portfolio');
    expect(getAgentConfig('tech-radar').outputDirectory).toBe('content/tools');
  });

  it('should throw for unknown agent type', () => {
    expect(() => getAgentConfig('unknown')).toThrow('Unknown agent type');
  });
});
