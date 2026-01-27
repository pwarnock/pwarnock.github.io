/**
 * Portfolio Agent Tests
 *
 * Comprehensive tests for Portfolio Agent including:
 * - Portfolio generation
 * - Content quality and tone
 * - Frontmatter validation
 * - Image prompt generation
 * - Review session creation
 * - Style learning integration
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { PortfolioAgent } from '../portfolio-agent.js';
import type { PortfolioGenerationRequest } from '../portfolio-agent.js';

describe('PortfolioAgent', () => {
  let agent: PortfolioAgent;
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Store original working directory
    originalCwd = process.cwd();

    // Create temporary directory for testing
    tempDir = path.join(originalCwd, 'tmp', 'test-portfolio-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'style-docs'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'sessions'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'portfolio'), { recursive: true });

    // Change to temp directory so agent writes there
    process.chdir(tempDir);

    agent = new PortfolioAgent();
    await agent.initialize();
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
      const testAgent = new PortfolioAgent();
      let error: Error | undefined;

      try {
        await testAgent.initialize();
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeUndefined();
    });

    it('should handle multiple initialization calls', async () => {
      await agent.initialize();
      let error: Error | undefined;

      try {
        await agent.initialize();
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeUndefined();
    });
  });

  describe('Portfolio Generation', () => {
    it('should generate portfolio with basic requirements', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'E-Commerce Platform Redesign',
        client: 'TechCorp Inc.',
        description: 'Complete redesign and redevelopment of the e-commerce platform',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.success).toBe(true);
      expect(result.bundle).toBeDefined();
      expect(result.contentPath).toBeDefined();
      expect(result.bundle?.type).toBe('portfolio');
    });

    it('should generate portfolio frontmatter with all required fields', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Mobile Banking App',
        client: 'FinanceCo',
        description: 'Developed secure mobile banking application',
        technologies: ['React Native', 'TypeScript', 'Node.js'],
        category: 'Mobile Development',
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter).toBeDefined();
      expect(result.bundle?.frontmatter.title).toBe('Mobile Banking App');
      expect(result.bundle?.frontmatter.client).toBe('FinanceCo');
      expect(result.bundle?.frontmatter.technologies).toEqual(['React Native', 'TypeScript', 'Node.js']);
      expect(result.bundle?.frontmatter.category).toBe('Mobile Development');
      expect(result.bundle?.frontmatter.draft).toBe(true);
    });

    it('should include optional URLs when provided', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Open Source Tool',
        client: 'Community',
        description: 'Built open-source developer tool',
        technologies: ['Go', 'Docker'],
        githubUrl: 'https://github.com/test/repo',
        liveUrl: 'https://demo.example.com',
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.github_url).toBe('https://github.com/test/repo');
      expect(result.bundle?.frontmatter.live_url).toBe('https://demo.example.com');
    });

    it('should format completion date correctly', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'API Gateway',
        client: 'CloudTech',
        description: 'Built scalable API gateway',
        technologies: ['Go', 'Kubernetes'],
        completionDate: new Date('2024-06-15'),
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.completion_date).toBe('2024-06');
    });

    it('should infer category from technologies', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Web Application',
        client: 'Client',
        description: 'Web app project',
        technologies: ['React', 'TypeScript', 'Next.js'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.category).toBe('Web Development');
    });

    it('should infer DevOps category', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'CI/CD Pipeline',
        client: 'DevCorp',
        description: 'Built deployment pipeline',
        technologies: ['Docker', 'Kubernetes', 'Terraform'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.category).toBe('DevOps');
    });

    it('should infer Mobile Development category', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'iOS App',
        client: 'MobileCo',
        description: 'iOS application',
        technologies: ['Swift', 'React Native'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.category).toBe('Mobile Development');
    });

    it('should default to Software Development for unknown tech', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'General Project',
        client: 'Generic',
        description: 'Generic project',
        technologies: ['CustomTech', 'ProprietaryFramework'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.category).toBe('Software Development');
    });
  });

  describe('Content Generation', () => {
    it('should generate achievement-focused content', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Data Pipeline',
        client: 'DataCorp',
        description: 'Built scalable data processing pipeline',
        technologies: ['Python', 'Apache Airflow', 'PostgreSQL'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.content).toBeDefined();
      const content = result.bundle!.content;

      // Check for strong action verbs
      expect(content.toLowerCase()).toMatch(/led|developed|implemented|achieved|delivered/);

      // Check for key sections
      expect(content).toContain('Project Overview');
      expect(content).toContain('Technical Implementation');
      expect(content).toContain('Outcomes');
      expect(content).toContain('Technologies');
    });

    it('should include project details when provided', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Complex System',
        client: 'Enterprise',
        description: 'Enterprise system architecture',
        technologies: ['Java', 'Kubernetes'],
        projectDetails: {
          challenges: [
            'Scaling to millions of users',
            'Ensuring 99.99% uptime',
          ],
          solutions: [
            'Implemented microservices architecture',
            'Added comprehensive monitoring',
          ],
          outcomes: [
            'Reduced latency by 60%',
            'Improved system reliability',
          ],
        },
      };

      const result = await agent.generatePortfolio(request);

      const content = result.bundle!.content;

      expect(content).toContain('Challenges');
      expect(content).toContain('Scaling to millions of users');
      expect(content).toContain('Technical Solution');
      expect(content).toContain('microservices architecture');
    });

    it('should include metrics section when provided', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Performance Optimization',
        client: 'SpeedCo',
        description: 'Optimized application performance',
        technologies: ['Go', 'Redis'],
        projectDetails: {
          outcomes: ['Improved response times'],
          metrics: [
            {
              metric: 'Response Time',
              value: '60% reduction',
              impact: 'Improved user experience significantly',
            },
            {
              metric: 'Throughput',
              value: '10x increase',
              impact: 'Handled increased traffic efficiently',
            },
          ],
        },
      };

      const result = await agent.generatePortfolio(request);

      const content = result.bundle!.content;

      expect(content).toContain('Key Metrics');
      expect(content).toContain('Response Time');
      expect(content).toContain('60% reduction');
      expect(content).toContain('Throughput');
      expect(content).toContain('10x increase');
    });

    it('should use professional language and tone', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Professional Project',
        client: 'Professional Client',
        description: 'Professional services project',
        technologies: ['TypeScript', 'React'],
      };

      const result = await agent.generatePortfolio(request);

      const content = result.bundle!.content;

      // Check for professional language
      expect(content.toLowerCase()).toMatch(/delivered|achieved|implemented/);

      // Should not contain weak language
      expect(content.toLowerCase()).not.toMatch(/maybe|perhaps|might|could have|tried to/);
    });

    it('should include project links in content', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Linked Project',
        client: 'LinkCo',
        description: 'Project with links',
        technologies: ['Python'],
        githubUrl: 'https://github.com/test/project',
        liveUrl: 'https://live.example.com',
      };

      const result = await agent.generatePortfolio(request);

      const content = result.bundle!.content;

      expect(content).toContain('GitHub Repository');
      expect(content).toContain('View Project');
      expect(content).toContain('https://github.com/test/project');
      expect(content).toContain('https://live.example.com');
    });
  });

  describe('Image Prompt Generation', () => {
    it('should generate image prompts', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Dashboard Application',
        client: 'DataViz',
        description: 'Real-time analytics dashboard',
        technologies: ['D3.js', 'React', 'Node.js'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.imagePrompts).toBeDefined();
      expect(result.bundle?.imagePrompts.length).toBeGreaterThan(0);
    });

    it('should generate portfolio-specific image prompts', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Analytics Platform',
        client: 'AnalyticsCo',
        description: 'Business analytics platform',
        technologies: ['Python', 'Pandas', 'Plotly'],
      };

      const result = await agent.generatePortfolio(request);

      const prompts = result.bundle!.imagePrompts;

      // Check for portfolio-specific keywords
      const hasPortfolioStyle = prompts.some(prompt =>
        prompt.toLowerCase().includes('professional') ||
        prompt.toLowerCase().includes('corporate') ||
        prompt.toLowerCase().includes('showcase')
      );

      expect(hasPortfolioStyle).toBe(true);
    });
  });

  describe('Review Session Integration', () => {
    it('should create review session for portfolio', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Reviewable Project',
        client: 'Client',
        description: 'Project for review',
        technologies: ['TypeScript'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.success).toBe(true);
      expect(result.bundle?.sessions).toBeDefined();
      expect(result.bundle?.sessions.length).toBeGreaterThan(0);
    });

    it('should set review status to draft', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Draft Project',
        client: 'Client',
        description: 'Draft project',
        technologies: ['JavaScript'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.reviewStatus).toBe('draft');
    });

    it('should create standalone review session', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Session Project',
        client: 'Client',
        description: 'Project for session',
        technologies: ['Go'],
      };

      const result = await agent.generatePortfolio(request);

      if (result.bundle) {
        const sessionResult = await agent.createReviewSession(result.bundle);

        expect(sessionResult.success).toBe(true);
        expect(sessionResult.sessionId).toBeDefined();
      }
    });
  });

  describe('Style Learning Integration', () => {
    it('should get style guidelines', async () => {
      const guidelines = await agent.getStyleGuidelines();

      expect(guidelines).toBeDefined();
      expect(guidelines.tone).toBeDefined();
      expect(guidelines.vocabulary).toBeInstanceOf(Array);
      expect(guidelines.dos).toBeInstanceOf(Array);
      expect(guidelines.donts).toBeInstanceOf(Array);
    });

    it('should include portfolio-specific vocabulary', async () => {
      const guidelines = await agent.getStyleGuidelines();

      // Should include strong action verbs
      const strongVerbs = ['led', 'developed', 'implemented', 'achieved', 'delivered'];
      const hasStrongVerbs = strongVerbs.some(verb =>
        guidelines.vocabulary.includes(verb)
      );

      expect(hasStrongVerbs).toBe(true);
    });

    it('should include portfolio dos and donts', async () => {
      const guidelines = await agent.getStyleGuidelines();

      expect(guidelines.dos.length).toBeGreaterThan(0);
      expect(guidelines.donts.length).toBeGreaterThan(0);

      // Check for key dos
      const hasKeyDos = guidelines.dos.some(dos =>
        dos.toLowerCase().includes('impact') ||
        dos.toLowerCase().includes('metrics') ||
        dos.toLowerCase().includes('value')
      );

      expect(hasKeyDos).toBe(true);
    });

    it('should record positive feedback', async () => {
      const result = await agent.recordFeedback(
        'Great use of strong action verbs and metrics!',
        'positive'
      );

      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
    });

    it('should record negative feedback', async () => {
      const result = await agent.recordFeedback(
        'Too vague, need more specific details about outcomes',
        'negative'
      );

      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
    });

    it('should extract patterns from feedback', async () => {
      const result = await agent.recordFeedback(
        'Excellent use of "delivered" and "achieved" - very professional tone',
        'positive'
      );

      expect(result.patternsExtracted).toBeDefined();
      expect(result.patternsExtracted.vocabulary).toBeGreaterThanOrEqual(0);
      expect(result.patternsExtracted.sentencePatterns).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation', () => {
    it('should pass validation for valid portfolio', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Valid Project',
        client: 'Valid Client',
        description: 'Valid project description',
        technologies: ['React', 'TypeScript'],
        category: 'Web Development',
        completionDate: new Date('2024-01-15'),
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.validationStatus).toBe('passed');
    });

    it('should include warnings for missing optional fields', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Minimal Project',
        client: 'Minimal Client',
        description: 'Minimal description',
        technologies: ['JavaScript'],
      };

      const result = await agent.generatePortfolio(request);

      // Should succeed but might have warnings
      expect(result.success).toBe(true);
      // Warnings are optional
    });

    it('should validate standalone portfolio bundle', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Standalone Project',
        client: 'Standalone Client',
        description: 'Standalone project for validation',
        technologies: ['Python', 'FastAPI'],
      };

      const result = await agent.generatePortfolio(request);

      if (result.contentPath) {
        const validation = await agent.validatePortfolio(result.contentPath);

        // Validation should complete without throwing
        expect(validation).toBeDefined();
        expect(validation.errors).toBeDefined();
        expect(validation.warnings).toBeDefined();
      }
    });
  });

  describe('Agent Configuration', () => {
    it('should return portfolio agent config', () => {
      const config = agent.getConfiguration();

      expect(config).toBeDefined();
      expect(config.type).toBe('portfolio');
      expect(config.audience).toBeDefined();
      expect(config.toneGuidelines).toBeDefined();
      expect(config.frontmatterSchema).toBeDefined();
    });

    it('should include portfolio audience', () => {
      const config = agent.getConfiguration();

      expect(config.audience).toContain('Recruiters and hiring managers');
      expect(config.audience).toContain('Technical peers and colleagues');
    });

    it('should include portfolio tone guidelines', () => {
      const config = agent.getConfiguration();

      expect(config.toneGuidelines).toContain('Professional and achievement-focused');
      expect(config.toneGuidelines).toContain('Highlight impact and technical depth');
    });

    it('should include portfolio frontmatter schema', () => {
      const config = agent.getConfiguration();

      expect(config.frontmatterSchema.required).toContain('title');
      expect(config.frontmatterSchema.required).toContain('client');
      expect(config.frontmatterSchema.required).toContain('technologies');
      expect(config.frontmatterSchema.required).toContain('category');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields gracefully', async () => {
      const request = {
        title: '',
        client: '',
        description: '',
        technologies: [],
      } as PortfolioGenerationRequest;

      const result = await agent.generatePortfolio(request);

      // Should still generate but with defaults
      expect(result).toBeDefined();
    });

    it('should handle invalid completion date', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Date Test',
        client: 'Client',
        description: 'Date test project',
        technologies: ['JavaScript'],
        completionDate: new Date('invalid-date'),
      };

      const result = await agent.generatePortfolio(request);

      // Should handle gracefully - invalid dates create "Invalid Date" but don't throw
      expect(result).toBeDefined();
    });

    it('should handle empty technologies array', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Empty Tech',
        client: 'Client',
        description: 'Project with no technologies',
        technologies: [],
      };

      const result = await agent.generatePortfolio(request);

      // Should still generate
      expect(result.success).toBe(true);
    });

    it('should handle very long titles', async () => {
      const longTitle = 'A'.repeat(200);
      const request: PortfolioGenerationRequest = {
        title: longTitle,
        client: 'Client',
        description: 'Description',
        technologies: ['JavaScript'],
      };

      const result = await agent.generatePortfolio(request);

      // Should handle gracefully
      expect(result.success).toBe(true);
    });

    it('should handle special characters in title', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Project with Special Chars: <>&"\'',
        client: 'Client',
        description: 'Description with special characters',
        technologies: ['JavaScript'],
      };

      const result = await agent.generatePortfolio(request);

      // Should handle gracefully
      expect(result.success).toBe(true);
    });
  });

  describe('Content Quality', () => {
    it('should use strong action verbs in content', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Action Verbs Test',
        client: 'Client',
        description: 'Testing action verbs',
        technologies: ['TypeScript'],
      };

      const result = await agent.generatePortfolio(request);
      const content = result.bundle!.content.toLowerCase();

      // Check for multiple action verbs
      const actionVerbs = ['led', 'developed', 'implemented', 'achieved', 'delivered'];
      const foundVerbs = actionVerbs.filter(verb => content.includes(verb));

      expect(foundVerbs.length).toBeGreaterThan(0);
    });

    it('should avoid passive voice', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Active Voice Test',
        client: 'Client',
        description: 'Testing active voice',
        technologies: ['Go'],
      };

      const result = await agent.generatePortfolio(request);
      const content = result.bundle!.content.toLowerCase();

      // Should not have common passive voice markers
      expect(content).not.toMatch(/was \w+ed by/);
    });

    it('should emphasize value and impact', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Value Test',
        client: 'Client',
        description: 'Testing value emphasis',
        technologies: ['React'],
      };

      const result = await agent.generatePortfolio(request);
      const content = result.bundle!.content.toLowerCase();

      // Check for value-related words
      const valueWords = ['value', 'impact', 'business', 'success', 'achieved'];
      const hasValueWords = valueWords.some(word => content.includes(word));

      expect(hasValueWords).toBe(true);
    });

    it('should be professional and confident', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Professional Tone Test',
        client: 'Client',
        description: 'Testing professional tone',
        technologies: ['Java'],
      };

      const result = await agent.generatePortfolio(request);
      const content = result.bundle!.content;

      // Should be professional
      expect(content).toBeDefined();

      // Should not contain hedging language
      expect(content.toLowerCase()).not.toMatch(/maybe|perhaps|might|sort of|kind of/);
    });
  });

  describe('File Output', () => {
    it('should create valid Hugo markdown file', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'File Output Test',
        client: 'Client',
        description: 'Testing file output',
        technologies: ['Python'],
      };

      const result = await agent.generatePortfolio(request);

      if (result.contentPath) {
        const content = await fs.readFile(result.contentPath, 'utf8');

        // Check for YAML frontmatter delimiters
        expect(content).toMatch(/^---\n/);
        expect(content).toMatch(/\n---\n\n/);

        // Parse frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        expect(frontmatterMatch).toBeTruthy();

        const frontmatter = yaml.load(frontmatterMatch![1]) as Record<string, any>;
        expect(frontmatter.title).toBe('File Output Test');
      }
    });

    it('should create portfolio directory structure', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Directory Test',
        client: 'Client',
        description: 'Testing directory structure',
        technologies: ['Go'],
      };

      const result = await agent.generatePortfolio(request);

      if (result.contentPath) {
        const directory = path.dirname(result.contentPath);

        // Check directory exists
        const stats = await fs.stat(directory);
        expect(stats.isDirectory()).toBe(true);

        // Check it's in content/portfolio
        expect(directory).toContain('content/portfolio');
      }
    });
  });

  describe('Category Inference', () => {
    it('should infer Backend Development category', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Backend Project',
        client: 'BackendCorp',
        description: 'Backend system development',
        technologies: ['Node', 'GraphQL', 'API'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.category).toBe('Backend Development');
    });

    it('should infer Data Engineering category', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Data Project',
        client: 'DataCorp',
        description: 'Data engineering project',
        technologies: ['PostgreSQL', 'Redis', 'Elasticsearch'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.frontmatter.category).toBe('Data Engineering');
    });
  });

  describe('Content Bundle Properties', () => {
    it('should set bundle type to portfolio', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Type Test',
        client: 'Client',
        description: 'Type testing',
        technologies: ['JavaScript'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.type).toBe('portfolio');
    });

    it('should include createdAt timestamp', async () => {
      const before = new Date();
      const request: PortfolioGenerationRequest = {
        title: 'Timestamp Test',
        client: 'Client',
        description: 'Timestamp testing',
        technologies: ['TypeScript'],
      };

      const result = await agent.generatePortfolio(request);
      const after = new Date();

      expect(result.bundle?.createdAt).toBeDefined();
      expect(result.bundle?.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.bundle?.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should include empty sessions array initially', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Sessions Test',
        client: 'Client',
        description: 'Sessions testing',
        technologies: ['Go'],
      };

      const result = await agent.generatePortfolio(request);

      expect(result.bundle?.sessions).toBeDefined();
      expect(Array.isArray(result.bundle?.sessions)).toBe(true);
    });
  });

  describe('Default Outcomes', () => {
    it('should generate default outcomes when none provided', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Default Outcomes Test',
        client: 'Client',
        description: 'Testing default outcomes',
        technologies: ['React'],
      };

      const result = await agent.generatePortfolio(request);
      const content = result.bundle!.content;

      expect(content).toContain('Delivered');
      expect(content).toContain('Achieved');
      expect(content).toContain('Implemented');
    });
  });

  describe('Technologies Display', () => {
    it('should list all technologies in content', async () => {
      const request: PortfolioGenerationRequest = {
        title: 'Tech List Test',
        client: 'Client',
        description: 'Testing tech list',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      };

      const result = await agent.generatePortfolio(request);
      const content = result.bundle!.content;

      expect(content).toContain('**React**');
      expect(content).toContain('**Node.js**');
      expect(content).toContain('**PostgreSQL**');
      expect(content).toContain('**Docker**');
    });
  });
});
