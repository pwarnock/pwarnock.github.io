/**
 * Tech Radar Agent Tests
 *
 * Comprehensive test suite for Tech Radar Agent functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { TechRadarAgent } from '../tech-radar-agent.js';
import type { TechRadarOptions } from '../tech-radar-agent.js';

describe('TechRadarAgent', () => {
  let agent: TechRadarAgent;
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Store original working directory
    originalCwd = process.cwd();

    // Create temporary directory for testing
    tempDir = path.join(originalCwd, 'tmp', 'test-tech-radar-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, '.cody', 'project', 'library', 'style-docs'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'content', 'tools'), { recursive: true });

    // Change to temp directory so agent writes there
    process.chdir(tempDir);

    agent = new TechRadarAgent();
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

  describe('Adopt Ring Generation', () => {
    it('should generate adopt ring content with production-ready focus', async () => {
      const options: TechRadarOptions = {
        title: 'TypeScript',
        description: 'Typed superset of JavaScript that compiles to plain JavaScript',
        quadrant: 'languages',
        ring: 'adopt',
        tags: ['javascript', 'types', 'compiler']
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.ring).toBe('adopt');
      expect(result.frontmatter.quadrant).toBe('languages');
      expect(result.frontmatter.title).toBe('TypeScript');
      expect(result.frontmatter.draft).toBe(true);
      expect(result.content).toContain('# TypeScript');
      expect(result.content).toContain('ADOPT');
      expect(result.content).toContain('production-ready');
    });

    it('should include adoption guidance for adopt ring', async () => {
      const options: TechRadarOptions = {
        title: 'React',
        description: 'JavaScript library for building user interfaces',
        quadrant: 'frameworks',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Implementation Guidance');
      expect(result.content).toContain('Start with non-critical applications');
      expect(result.content).toContain('Establish best practices');
    });

    it('should emphasize maturity for adopt ring', async () => {
      const options: TechRadarOptions = {
        title: 'PostgreSQL',
        description: 'Powerful, open source object-relational database system',
        quadrant: 'databases',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Production-ready');
      expect(result.content).toContain('years of real-world validation');
      expect(result.content).toContain('proven stability');
    });

    it('should generate strengths for adopt ring technologies', async () => {
      const options: TechRadarOptions = {
        title: 'Docker',
        description: 'Platform for developing, shipping, and running applications',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('### Strengths');
      expect(result.content).toContain('Mature and stable');
      expect(result.content).toContain('Large talent pool');
      expect(result.content).toContain('Extensive tooling');
    });
  });

  describe('Trial Ring Generation', () => {
    it('should generate trial ring content with exploratory focus', async () => {
      const options: TechRadarOptions = {
        title: 'Bun',
        description: 'Fast JavaScript runtime, bundler, test runner, and package manager',
        quadrant: 'tools',
        ring: 'trial',
        tags: ['runtime', 'javascript', 'tooling']
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.ring).toBe('trial');
      expect(result.content).toContain('# Bun');
      expect(result.content).toContain('TRIAL');
      expect(result.content).toContain('Worth exploring');
    });

    it('should include when to trial guidance', async () => {
      const options: TechRadarOptions = {
        title: 'Astro',
        description: 'Modern web framework for building fast, content-focused websites',
        quadrant: 'frameworks',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('### When to Trial');
      expect(result.content).toContain('Evaluate for specific use cases');
      expect(result.content).toContain('Run small-scale proofs of concept');
    });

    it('should include success criteria for trial', async () => {
      const options: TechRadarOptions = {
        title: 'Turbo',
        description: 'High-performance build system for React applications',
        quadrant: 'tools',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('### Success Criteria');
      expect(result.content).toContain('Clear performance or productivity gains');
      expect(result.content).toContain('Active community');
    });

    it('should highlight potential for trial ring', async () => {
      const options: TechRadarOptions = {
        title: 'HTMX',
        description: 'High power tools for HTML',
        quadrant: 'libraries',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Promising approach');
      expect(result.content).toContain('Growing community');
      expect(result.content).toContain('Active development');
    });
  });

  describe('Assess Ring Generation', () => {
    it('should generate assess ring content with evaluation focus', async () => {
      const options: TechRadarOptions = {
        title: 'WebAssembly',
        description: 'Binary instruction format for a stack-based virtual machine',
        quadrant: 'languages',
        ring: 'assess',
        tags: ['wasm', 'binary', 'performance']
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.ring).toBe('assess');
      expect(result.content).toContain('# WebAssembly');
      expect(result.content).toContain('ASSESS');
      expect(result.content).toContain('Worth monitoring');
    });

    it('should include key questions to answer', async () => {
      const options: TechRadarOptions = {
        title: 'Edge Computing',
        description: 'Distributed computing paradigm bringing computation closer to data source',
        quadrant: 'infrastructure',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('### Key Questions to Answer');
      expect(result.content).toContain('Does this solve a real problem');
      expect(result.content).toContain('Is the technology mature enough');
    });

    it('should include evaluation steps', async () => {
      const options: TechRadarOptions = {
        title: 'AI Code Assistants',
        description: 'AI-powered tools for code generation and assistance',
        quadrant: 'tools',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('### Evaluation Steps');
      expect(result.content).toContain('Research and documentation review');
      expect(result.content).toContain('Community and ecosystem health check');
    });

    it('should emphasize uncertainty for assess ring', async () => {
      const options: TechRadarOptions = {
        title: 'Blockchain for Web',
        description: 'Distributed ledger technology for web applications',
        quadrant: 'infrastructure',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Uncertain long-term viability');
      expect(result.content).toContain('Immature ecosystem');
      expect(result.content).toContain('High learning and adoption risk');
    });
  });

  describe('Hold Ring Generation', () => {
    it('should generate hold ring content with avoidance focus', async () => {
      const options: TechRadarOptions = {
        title: 'Bower',
        description: 'Package manager for the web (deprecated)',
        quadrant: 'tools',
        ring: 'hold',
        tags: ['deprecated', 'package-manager']
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.ring).toBe('hold');
      expect(result.content).toContain('# Bower');
      expect(result.content).toContain('HOLD');
      expect(result.content).toContain('Avoid new adoption');
    });

    it('should include why hold section', async () => {
      const options: TechRadarOptions = {
        title: 'Grunt',
        description: 'JavaScript task runner (largely superseded by newer tools)',
        quadrant: 'tools',
        ring: 'hold'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('### Why Hold');
      expect(result.content).toContain('superseded by better alternatives');
      expect(result.content).toContain('Better solutions available');
    });

    it('should include migration path for hold', async () => {
      const options: TechRadarOptions = {
        title: 'Angular.js',
        description: 'Original Angular framework (replaced by Angular 2+)',
        quadrant: 'frameworks',
        ring: 'hold'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('### Migration Path');
      expect(result.content).toContain('Plan migration to modern alternatives');
      expect(result.content).toContain('Prioritize security-critical systems');
    });

    it('should highlight declining ecosystem for hold', async () => {
      const options: TechRadarOptions = {
        title: 'CoffeeScript',
        description: 'Language that compiles to JavaScript (largely replaced by ES6+)',
        quadrant: 'languages',
        ring: 'hold'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Declining community');
      expect(result.content).toContain('diminishing community activity');
      expect(result.content).toContain('Known security or stability issues');
    });
  });

  describe('Content Structure', () => {
    it('should generate all required sections', async () => {
      const options: TechRadarOptions = {
        title: 'Vue.js',
        description: 'Progressive JavaScript framework',
        quadrant: 'frameworks',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('## Overview');
      expect(result.content).toContain('## Key Features');
      expect(result.content).toContain('## Strengths and Weaknesses');
      expect(result.content).toContain('### Strengths');
      expect(result.content).toContain('### Weaknesses');
      expect(result.content).toContain('## Use Cases');
      expect(result.content).toContain('## Ecosystem Assessment');
      expect(result.content).toContain('## Adoption Considerations');
      expect(result.content).toContain('## Conclusion');
    });

    it('should include technical depth in content', async () => {
      const options: TechRadarOptions = {
        title: 'Kubernetes',
        description: 'Container orchestration platform',
        quadrant: 'infrastructure',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      // Should include technical concepts
      expect(result.content).toBeTruthy();
      expect(result.content.length).toBeGreaterThan(500);
    });

    it('should provide practical use cases', async () => {
      const options: TechRadarOptions = {
        title: 'Redis',
        description: 'In-memory data structure store',
        quadrant: 'databases',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('## Use Cases');
      // Use cases should be listed
      expect(result.content).toMatch(/- .+/); // List items present
    });

    it('should include balanced strengths and weaknesses', async () => {
      const options: TechRadarOptions = {
        title: 'MongoDB',
        description: 'Document-oriented database',
        quadrant: 'databases',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      const strengthsSection = result.content.match(/### Strengths\n([\s\S]*?)### Weaknesses/);
      const weaknessesSection = result.content.match(/### Weaknesses\n([\s\S]*?)##/);

      expect(strengthsSection).toBeTruthy();
      expect(weaknessesSection).toBeTruthy();

      // Should have list items in both sections
      expect(strengthsSection![1]).toContain('- ');
      expect(weaknessesSection![1]).toContain('- ');
    });
  });

  describe('Frontmatter Generation', () => {
    it('should generate valid tech radar frontmatter', async () => {
      const options: TechRadarOptions = {
        title: 'Next.js',
        description: 'React framework for production',
        quadrant: 'frameworks',
        ring: 'adopt',
        tags: ['react', 'ssr', 'framework']
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.title).toBe('Next.js');
      expect(result.frontmatter.description).toBe('React framework for production');
      expect(result.frontmatter.quadrant).toBe('frameworks');
      expect(result.frontmatter.ring).toBe('adopt');
      expect(result.frontmatter.tags).toEqual(['react', 'ssr', 'framework']);
      expect(result.frontmatter.draft).toBe(true);
      expect(result.frontmatter.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle optional fields correctly', async () => {
      const options: TechRadarOptions = {
        title: 'Vite',
        description: 'Build tool and dev server',
        quadrant: 'tools',
        ring: 'adopt'
        // No tags
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.title).toBe('Vite');
      expect(result.frontmatter.tags).toBeUndefined();
    });

    it('should use custom date if provided', async () => {
      const customDate = new Date('2025-06-15');
      const options: TechRadarOptions = {
        title: 'Tailwind CSS',
        description: 'Utility-first CSS framework',
        quadrant: 'languages',
        ring: 'adopt',
        date: customDate
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.date).toBe('2025-06-15');
    });

    it('should respect draft setting', async () => {
      const options: TechRadarOptions = {
        title: 'Svelte',
        description: 'Cybernetically enhanced web apps',
        quadrant: 'frameworks',
        ring: 'trial',
        draft: false
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.draft).toBe(false);
    });

    it('should default to draft true', async () => {
      const options: TechRadarOptions = {
        title: 'Solid.js',
        description: 'Reactive JavaScript library',
        quadrant: 'frameworks',
        ring: 'assess'
        // draft not specified
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.draft).toBe(true);
    });
  });

  describe('Image Prompt Generation', () => {
    it('should generate image prompts for tech radar', async () => {
      const options: TechRadarOptions = {
        title: 'GraphQL',
        description: 'Query language for APIs',
        quadrant: 'languages',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.imagePrompts.prompts).toHaveLength(2);
      expect(result.imagePrompts.metadata.contentType).toBe('tech-radar');
      expect(result.imagePrompts.metadata.generatedAt).toBeInstanceOf(Date);
    });

    it('should include tech radar style hints in prompts', async () => {
      const options: TechRadarOptions = {
        title: 'Rust',
        description: 'Systems programming language',
        quadrant: 'languages',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.imagePrompts.metadata.styleHints).toContain('visual');
      expect(result.imagePrompts.metadata.styleHints).toContain('technology-focused');
      expect(result.imagePrompts.metadata.styleHints).toContain('modern');
    });

    it('should generate different prompts for different rings', async () => {
      const rings = ['adopt', 'trial', 'assess', 'hold'] as const;
      const results = [];

      for (const ring of rings) {
        const options: TechRadarOptions = {
          title: 'Test Technology',
          description: 'Test description',
          quadrant: 'tools',
          ring
        };
        const result = await agent.generateTechRadar(options);
        results.push(result);
      }

      // Each should generate prompts
      results.forEach(result => {
        expect(result.imagePrompts.prompts).toHaveLength(2);
      });
    });
  });

  describe('Content Bundle Generation', () => {
    it('should generate content bundle with correct structure', async () => {
      const options: TechRadarOptions = {
        title: 'Webpack',
        description: 'Module bundler for JavaScript',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.bundlePath).toContain('content/tools/');
      expect(result.bundlePath).toContain('index.md');
    });

    it('should include title in slug', async () => {
      const options: TechRadarOptions = {
        title: 'My Amazing Technology',
        description: 'Description',
        quadrant: 'tools',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.bundlePath).toMatch(/my-amazing-technology/i);
    });
  });

  describe('Voice Learning Integration', () => {
    it('should integrate with voice learning system', async () => {
      const options: TechRadarOptions = {
        title: 'Test Tech',
        description: 'Test description',
        quadrant: 'tools',
        ring: 'adopt'
      };

      // This should not throw
      await agent.generateTechRadar(options);
    });

    it('should learn from positive feedback', async () => {
      const feedback = 'Great technical depth and balanced perspective';
      const result = await agent.learnFromFeedback(feedback, 'positive');

      expect(result.success).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.patternsExtracted).toBeDefined();
    });

    it('should learn from negative feedback', async () => {
      const feedback = 'Too opinionated without enough evidence';
      const result = await agent.learnFromFeedback(feedback, 'negative');

      expect(result.success).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.patternsExtracted.donts).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation', () => {
    it('should validate generated tech radar content', async () => {
      const options: TechRadarOptions = {
        title: 'Valid Tech',
        description: 'A valid technology entry',
        quadrant: 'tools',
        ring: 'adopt',
        tags: ['testing']
      };

      const result = await agent.generateTechRadar(options);
      const validation = await agent.validateTechRadar(path.dirname(result.bundlePath));

      expect(validation.valid).toBeDefined();
      expect(validation.errors).toBeDefined();
      expect(validation.warnings).toBeDefined();
    });
  });

  describe('Review Session Creation', () => {
    it('should create review session', async () => {
      const contentBundleId = 'test-bundle-123';
      const sessionId = await agent.createReviewSession(contentBundleId);

      expect(sessionId).toContain('tech-radar-review-');
      expect(sessionId).toBeTruthy();
    });

    it('should generate unique session IDs', async () => {
      const sessionId1 = await agent.createReviewSession('bundle-1');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const sessionId2 = await agent.createReviewSession('bundle-2');

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('Content Quality', () => {
    it('should generate opinionated but balanced content', async () => {
      const options: TechRadarOptions = {
        title: 'Angular',
        description: 'Full-stack framework for web applications',
        quadrant: 'frameworks',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      // Should have both strengths and weaknesses
      expect(result.content).toContain('### Strengths');
      expect(result.content).toContain('### Weaknesses');

      // Should avoid purely positive or negative language
      expect(result.content).not.toMatch(/perfect|flawless|terrible|useless/i);
    });

    it('should provide technical depth and context', async () => {
      const options: TechRadarOptions = {
        title: 'Electron',
        description: 'Framework for building desktop applications',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      // Should mention ecosystem considerations
      expect(result.content).toContain('## Ecosystem Assessment');

      // Should mention adoption considerations
      expect(result.content).toContain('## Adoption Considerations');
    });

    it('should be forward-looking but realistic', async () => {
      const options: TechRadarOptions = {
        title: 'Deno',
        description: 'Secure runtime for JavaScript and TypeScript',
        quadrant: 'tools',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      // Should include future outlook
      expect(result.content).toContain('**Future Outlook:**');

      // Should mention uncertainty appropriately
      expect(result.content).toMatch(/uncertain|monitor|evaluate/i);
    });

    it('should consider practical adoption implications', async () => {
      const options: TechRadarOptions = {
        title: 'NestJS',
        description: 'Framework for building efficient Node.js applications',
        quadrant: 'frameworks',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      // Should discuss practical aspects
      expect(result.content).toMatch(/learning curve|team|expertise|adoption/i);
    });

    it('should assess maturity and support', async () => {
      const options: TechRadarOptions = {
        title: 'Prisma',
        description: 'Next-generation ORM',
        quadrant: 'tools',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      // Should mention maturity
      expect(result.content).toContain('**Maturity:**');

      // Should discuss ecosystem health
      expect(result.content).toMatch(/community|ecosystem|support/i);
    });
  });

  describe('Ring-Specific Content', () => {
    it('should provide adoption guidance for adopt ring', async () => {
      const options: TechRadarOptions = {
        title: 'Git',
        description: 'Distributed version control system',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('## Adoption Recommendation');
      expect(result.content).toContain('**ADOPT**');
      expect(result.content).toContain('mature and proven');
    });

    it('should provide trial guidance for trial ring', async () => {
      const options: TechRadarOptions = {
        title: 'Zod',
        description: 'TypeScript-first schema validation',
        quadrant: 'libraries',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('## Trial Recommendation');
      expect(result.content).toContain('**TRIAL**');
      expect(result.content).toContain('Worth exploring');
    });

    it('should provide assessment guidance for assess ring', async () => {
      const options: TechRadarOptions = {
        title: 'tRPC',
        description: 'End-to-end typesafe APIs',
        quadrant: 'tools',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('## Assessment Recommendation');
      expect(result.content).toContain('**ASSESS**');
      expect(result.content).toContain('Worth monitoring');
    });

    it('should provide hold guidance for hold ring', async () => {
      const options: TechRadarOptions = {
        title: 'jQuery',
        description: 'JavaScript library (largely superseded)',
        quadrant: 'libraries',
        ring: 'hold'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('## Hold Recommendation');
      expect(result.content).toContain('**HOLD**');
      expect(result.content).toContain('Avoid new adoption');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', async () => {
      const longTitle = 'This Is An Extremely Long Technology Name That Contains Many Words';
      const options: TechRadarOptions = {
        title: longTitle,
        description: 'Test',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.title).toBe(longTitle);
      expect(result.content).toContain(`# ${longTitle}`);
    });

    it('should handle special characters in description', async () => {
      const options: TechRadarOptions = {
        title: 'Tech',
        description: 'A tool with special chars: <, >, &, \'quotes\'',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.description).toBeTruthy();
      expect(result.content).toBeTruthy();
    });

    it('should handle empty tags array', async () => {
      const options: TechRadarOptions = {
        title: 'Tech',
        description: 'Test',
        quadrant: 'tools',
        ring: 'adopt',
        tags: []
      };

      const result = await agent.generateTechRadar(options);

      // Empty arrays are not included in frontmatter
      expect(result.frontmatter.tags).toBeUndefined();
    });

    it('should handle all four rings', async () => {
      const rings = ['adopt', 'trial', 'assess', 'hold'] as const;

      for (const ring of rings) {
        const options: TechRadarOptions = {
          title: `Test ${ring}`,
          description: `Testing ${ring} ring`,
          quadrant: 'tools',
          ring
        };

        const result = await agent.generateTechRadar(options);

        expect(result.frontmatter.ring).toBe(ring);
        expect(result.content).toContain(ring.toUpperCase());
        expect(result.imagePrompts.prompts).toHaveLength(2);
      }
    });
  });

  describe('Integration Points', () => {
    it('should integrate with HugoIntegration', async () => {
      const options: TechRadarOptions = {
        title: 'Integration Test',
        description: 'Testing Hugo integration',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.bundlePath).toContain('content/tools/');
      expect(result.bundlePath).toContain('index.md');
    });

    it('should integrate with ImagePromptGenerator', async () => {
      const options: TechRadarOptions = {
        title: 'Image Test',
        description: 'Testing image generation',
        quadrant: 'tools',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.imagePrompts.prompts).toBeDefined();
      expect(result.imagePrompts.metadata).toBeDefined();
    });

    it('should integrate with VoiceLearningSystem', async () => {
      const options: TechRadarOptions = {
        title: 'Voice Test',
        description: 'Testing voice learning',
        quadrant: 'tools',
        ring: 'assess'
      };

      // Should not throw
      await agent.generateTechRadar(options);

      const feedback = 'Test feedback for learning';
      const learnResult = await agent.learnFromFeedback(feedback, 'positive');

      expect(learnResult.success).toBeDefined();
    });
  });

  describe('Never Auto-Publish', () => {
    it('should always default to draft true', async () => {
      const options: TechRadarOptions = {
        title: 'Draft Test',
        description: 'Testing draft default',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.draft).toBe(true);
    });

    it('should require explicit draft false to publish', async () => {
      const options: TechRadarOptions = {
        title: 'Publish Test',
        description: 'Testing explicit publish',
        quadrant: 'tools',
        ring: 'adopt',
        draft: false
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.draft).toBe(false);
    });

    it('should include approval reminder in content', async () => {
      const options: TechRadarOptions = {
        title: 'Approval Test',
        description: 'Testing approval reminder',
        quadrant: 'tools',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      // Content should indicate need for review
      expect(result.content).toBeTruthy();
    });
  });

  describe('Opinionated but Balanced Tone', () => {
    it('should provide clear recommendations', async () => {
      const options: TechRadarOptions = {
        title: 'Express.js',
        description: 'Fast web framework for Node.js',
        quadrant: 'frameworks',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      // Should have clear recommendation
      expect(result.content).toMatch(/ADOPT|TRIAL|ASSESS|HOLD/);
    });

    it('should acknowledge trade-offs', async () => {
      const options: TechRadarOptions = {
        title: 'Fastify',
        description: 'Fast web framework for Node.js',
        quadrant: 'frameworks',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      // Should mention both positives and negatives
      expect(result.content).toContain('### Strengths');
      expect(result.content).toContain('### Weaknesses');
    });

    it('should avoid hype-driven language', async () => {
      const options: TechRadarOptions = {
        title: 'Test Tech',
        description: 'Testing for hype language',
        quadrant: 'tools',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      // Should avoid excessive hype words
      expect(result.content).not.toMatch(/revolutionary|groundbreaking|world-changing|paradigm-shifting/i);
    });

    it('should provide realistic assessment', async () => {
      const options: TechRadarOptions = {
        title: 'Lighthouse',
        description: 'Automated auditing tool for web applications',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      // Should include realistic considerations
      expect(result.content).toMatch(/considerations|limitations|challenges|trade-off/i);
    });
  });

  describe('All Quadrants', () => {
    const quadrants = ['languages', 'frameworks', 'tools', 'infrastructure', 'libraries', 'databases'];

    it.each(quadrants)('should generate content for %s quadrant', async (quadrant) => {
      const options: TechRadarOptions = {
        title: `Test ${quadrant} Tech`,
        description: `Testing ${quadrant} technology`,
        quadrant,
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.frontmatter.quadrant).toBe(quadrant);
      expect(result.content).toBeTruthy();
      expect(result.content.length).toBeGreaterThan(100);
    });
  });

  describe('Conclusion Section', () => {
    it('should include maturity assessment in conclusion', async () => {
      const options: TechRadarOptions = {
        title: 'Conclusion Test',
        description: 'Testing conclusion section',
        quadrant: 'tools',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('**Maturity:**');
    });

    it('should include future outlook in conclusion', async () => {
      const options: TechRadarOptions = {
        title: 'Outlook Test',
        description: 'Testing future outlook',
        quadrant: 'frameworks',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('**Future Outlook:**');
    });

    it('should include reassessment note', async () => {
      const options: TechRadarOptions = {
        title: 'Reassess Test',
        description: 'Testing reassessment note',
        quadrant: 'languages',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Regularly reassess');
    });
  });

  describe('Use Cases by Ring', () => {
    it('should include production-ready use cases for adopt ring', async () => {
      const options: TechRadarOptions = {
        title: 'Use Cases Adopt',
        description: 'Testing adopt use cases',
        quadrant: 'tools',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Production applications');
      expect(result.content).toContain('SLA requirements');
    });

    it('should include pilot use cases for trial ring', async () => {
      const options: TechRadarOptions = {
        title: 'Use Cases Trial',
        description: 'Testing trial use cases',
        quadrant: 'tools',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Proof of concepts');
      expect(result.content).toContain('prototypes');
    });

    it('should include research use cases for assess ring', async () => {
      const options: TechRadarOptions = {
        title: 'Use Cases Assess',
        description: 'Testing assess use cases',
        quadrant: 'tools',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('Research');
      expect(result.content).toContain('exploration');
    });

    it('should include legacy use cases for hold ring', async () => {
      const options: TechRadarOptions = {
        title: 'Use Cases Hold',
        description: 'Testing hold use cases',
        quadrant: 'tools',
        ring: 'hold'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('legacy');
    });
  });

  describe('Ecosystem Assessment Content', () => {
    it('should describe mature ecosystem for adopt ring', async () => {
      const options: TechRadarOptions = {
        title: 'Ecosystem Adopt',
        description: 'Testing ecosystem for adopt',
        quadrant: 'frameworks',
        ring: 'adopt'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('mature');
      expect(result.content).toContain('comprehensive');
    });

    it('should describe growing ecosystem for trial ring', async () => {
      const options: TechRadarOptions = {
        title: 'Ecosystem Trial',
        description: 'Testing ecosystem for trial',
        quadrant: 'frameworks',
        ring: 'trial'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('growing');
    });

    it('should describe early ecosystem for assess ring', async () => {
      const options: TechRadarOptions = {
        title: 'Ecosystem Assess',
        description: 'Testing ecosystem for assess',
        quadrant: 'frameworks',
        ring: 'assess'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('early');
    });

    it('should describe declining ecosystem for hold ring', async () => {
      const options: TechRadarOptions = {
        title: 'Ecosystem Hold',
        description: 'Testing ecosystem for hold',
        quadrant: 'frameworks',
        ring: 'hold'
      };

      const result = await agent.generateTechRadar(options);

      expect(result.content).toContain('decline');
    });
  });
});
