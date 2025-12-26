/**
 * Image Prompt Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { ImagePromptGenerator } from '../image-prompt-generator.js';

describe('ImagePromptGenerator', () => {
  const generator = new ImagePromptGenerator();

  describe('Blog Post Prompts', () => {
    it('should generate prompts for blog post', async () => {
      const request = {
        contentType: 'blog' as const,
        contentTitle: 'My Journey with TypeScript',
        contentSummary: 'A personal story about learning TypeScript and improving code quality',
        tone: 'conversational'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts).toHaveLength(2);
      expect(response.metadata.contentType).toBe('blog');
      expect(response.metadata.generatedAt).toBeInstanceOf(Date);
      expect(response.metadata.styleHints).toContain('minimal');
      expect(response.metadata.styleHints).toContain('personal');
    });

    it('should include blog-specific style hints', async () => {
      const request = {
        contentType: 'blog' as const,
        contentTitle: 'Understanding Async/Await',
        contentSummary: 'Deep dive into asynchronous JavaScript',
        tone: 'educational'
      };

      const response = await generator.generatePrompts(request);

      expect(response.metadata.styleHints).toEqual(
        expect.arrayContaining(['minimal', 'personal', 'authentic', 'clean'])
      );
    });

    it('should extract relevant keywords from content', async () => {
      const request = {
        contentType: 'blog' as const,
        contentTitle: 'Building Microservices with Node.js',
        contentSummary: 'Practical guide to microservices architecture',
        tone: 'technical'
      };

      const response = await generator.generatePrompts(request);

      // Prompts should contain relevant technical terms
      expect(response.prompts[0]).toMatch(/microservices|node\.js|architecture/i);
      expect(response.prompts[1]).toMatch(/abstract|concept/i);
    });

    it('should include technical specifications in prompts', async () => {
      const request = {
        contentType: 'blog' as const,
        contentTitle: 'Test Post',
        contentSummary: 'Test summary',
        tone: 'neutral'
      };

      const response = await generator.generatePrompts(request);

      // Should include aspect ratio, resolution, style notes
      expect(response.prompts[0]).toMatch(/aspect ratio|resolution|style/i);
      expect(response.prompts[1]).toMatch(/aspect ratio|style/i);
    });
  });

  describe('Portfolio Project Prompts', () => {
    it('should generate prompts for portfolio project', async () => {
      const request = {
        contentType: 'portfolio' as const,
        contentTitle: 'E-commerce Platform Redesign',
        contentSummary: 'Led redesign of major e-commerce platform, increasing conversion by 40%',
        tone: 'professional'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts).toHaveLength(2);
      expect(response.metadata.contentType).toBe('portfolio');
      expect(response.metadata.styleHints).toContain('professional');
      expect(response.metadata.styleHints).toContain('achievement-focused');
    });

    it('should include portfolio-specific style hints', async () => {
      const request = {
        contentType: 'portfolio' as const,
        contentTitle: 'Mobile App Development',
        contentSummary: 'Developed iOS and Android applications',
        tone: 'confident'
      };

      const response = await generator.generatePrompts(request);

      expect(response.metadata.styleHints).toEqual(
        expect.arrayContaining(['professional', 'sleek', 'corporate', 'polished'])
      );
    });

    it('should focus on achievement and success', async () => {
      const request = {
        contentType: 'portfolio' as const,
        contentTitle: 'Cloud Infrastructure Migration',
        contentSummary: 'Successfully migrated infrastructure to AWS, reducing costs by 50%',
        tone: 'professional'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts[0]).toMatch(/showcase|professional|achievement/i);
      expect(response.prompts[1]).toMatch(/success|achievement|results/i);
    });

    it('should include corporate aesthetic elements', async () => {
      const request = {
        contentType: 'portfolio' as const,
        contentTitle: 'Project X',
        contentSummary: 'Description of project',
        tone: 'professional'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts[0]).toMatch(/corporate|professional|high-end|premium/i);
      expect(response.prompts[0]).toMatch(/product photography|studio lighting/i);
    });
  });

  describe('Tech Radar Prompts', () => {
    it('should generate prompts for tech radar entry', async () => {
      const request = {
        contentType: 'tech-radar' as const,
        subtype: 'adopt' as const,
        contentTitle: 'Rust Programming Language',
        contentSummary: 'Systems programming language focused on safety and performance',
        tone: 'opinionated'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts).toHaveLength(2);
      expect(response.metadata.contentType).toBe('tech-radar');
      expect(response.metadata.styleHints).toContain('visual');
      expect(response.metadata.styleHints).toContain('technology-focused');
    });

    it('should include tech radar specific style hints', async () => {
      const request = {
        contentType: 'tech-radar' as const,
        contentTitle: 'Kubernetes',
        contentSummary: 'Container orchestration platform',
        tone: 'technical'
      };

      const response = await generator.generatePrompts(request);

      expect(response.metadata.styleHints).toEqual(
        expect.arrayContaining(['visual', 'clear', 'modern', 'schematic'])
      );
    });

    it('should incorporate ring subtype into prompts', async () => {
      const request = {
        contentType: 'tech-radar' as const,
        subtype: 'trial' as const,
        contentTitle: 'Vue.js Framework',
        contentSummary: 'Progressive JavaScript framework',
        tone: 'balanced'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts[0]).toMatch(/trial ring|ring/i);
      expect(response.prompts[0]).toMatch(/diagram|technical illustration/i);
    });

    it('should use appropriate color scheme for each ring', async () => {
      const rings = ['adopt', 'trial', 'assess', 'hold'] as const;

      for (const ring of rings) {
        const request = {
          contentType: 'tech-radar' as const,
          subtype: ring,
          contentTitle: 'Test Technology',
          contentSummary: 'Test description',
          tone: 'technical'
        };

        const response = await generator.generatePrompts(request);

        // Each ring should have its color mentioned
        expect(response.prompts[0]).toMatch(/color|palette/i);
      }
    });

    it('should generate technical diagram style prompts', async () => {
      const request = {
        contentType: 'tech-radar' as const,
        contentTitle: 'Docker Containers',
        contentSummary: 'Containerization technology',
        tone: 'informative'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts[0]).toMatch(/technical illustration|diagram|schematic/i);
      expect(response.prompts[1]).toMatch(/icon|symbol|flat design/i);
    });
  });

  describe('Batch Prompt Generation', () => {
    it('should generate prompts for multiple items', async () => {
      const requests = [
        {
          contentType: 'blog' as const,
          contentTitle: 'Blog Post 1',
          contentSummary: 'Summary 1',
          tone: 'casual'
        },
        {
          contentType: 'portfolio' as const,
          contentTitle: 'Project 1',
          contentSummary: 'Summary 2',
          tone: 'professional'
        },
        {
          contentType: 'tech-radar' as const,
          contentTitle: 'Technology 1',
          contentSummary: 'Summary 3',
          tone: 'technical'
        }
      ];

      const responses = await generator.generateBatchPrompts(requests);

      expect(responses).toHaveLength(3);
      expect(responses[0].metadata.contentType).toBe('blog');
      expect(responses[1].metadata.contentType).toBe('portfolio');
      expect(responses[2].metadata.contentType).toBe('tech-radar');
    });
  });

  describe('Utility Methods', () => {
    it('should return correct specifications for blog', () => {
      const specs = generator.getSpecifications('blog');

      expect(specs.aspectRatio).toBe('16:9');
      expect(specs.style).toBe('editorial');
      expect(specs.mood).toBe('warm and inviting');
    });

    it('should return correct specifications for portfolio', () => {
      const specs = generator.getSpecifications('portfolio');

      expect(specs.aspectRatio).toBe('16:9');
      expect(specs.style).toBe('corporate professional');
      expect(specs.mood).toBe('confident and polished');
    });

    it('should return correct specifications for tech radar', () => {
      const specs = generator.getSpecifications('tech-radar');

      expect(specs.aspectRatio).toBe('1:1');
      expect(specs.style).toBe('technical illustration');
      expect(specs.mood).toBe('clear and informative');
    });

    it('should return style hints for content type', () => {
      const blogHints = generator.getStyleHints('blog');
      const portfolioHints = generator.getStyleHints('portfolio');
      const radarHints = generator.getStyleHints('tech-radar');

      expect(blogHints).toContain('minimal');
      expect(portfolioHints).toContain('professional');
      expect(radarHints).toContain('visual');
    });
  });

  describe('Prompt Quality', () => {
    it('should generate detailed and descriptive prompts', async () => {
      const request = {
        contentType: 'blog' as const,
        contentTitle: 'Advanced React Patterns',
        contentSummary: 'Exploring advanced component composition techniques',
        tone: 'educational'
      };

      const response = await generator.generatePrompts(request);

      // Prompts should be substantial and detailed
      expect(response.prompts[0].length).toBeGreaterThan(100);
      expect(response.prompts[1].length).toBeGreaterThan(100);
    });

    it('should include composition and style guidance', async () => {
      const request = {
        contentType: 'portfolio' as const,
        contentTitle: 'Data Analytics Dashboard',
        contentSummary: 'Real-time analytics platform',
        tone: 'professional'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts[0]).toMatch(/composition|layout|framing/i);
      expect(response.prompts[0]).toMatch(/style|aesthetic|design/i);
    });

    it('should extract meaningful keywords from content', async () => {
      const request = {
        contentType: 'blog' as const,
        contentTitle: 'Building Microservices Architecture with TypeScript',
        contentSummary: 'A comprehensive guide to implementing scalable systems',
        tone: 'technical'
      };

      const response = await generator.generatePrompts(request);

      // Should extract relevant technical terms
      expect(response.prompts[0]).toMatch(/microservices|architecture|typescript|scalable|systems/i);
    });

    it('should generate unique prompts for each content type', async () => {
      const baseRequest = {
        contentTitle: 'Test Title',
        contentSummary: 'Test Summary',
        tone: 'neutral'
      };

      const blogResponse = await generator.generatePrompts({
        ...baseRequest,
        contentType: 'blog'
      });

      const portfolioResponse = await generator.generatePrompts({
        ...baseRequest,
        contentType: 'portfolio'
      });

      const radarResponse = await generator.generatePrompts({
        ...baseRequest,
        contentType: 'tech-radar'
      });

      // Each content type should have different style words
      expect(blogResponse.prompts[0]).toMatch(/editorial|warm|inviting/i);
      expect(portfolioResponse.prompts[0]).toMatch(/corporate|professional|polished/i);
      expect(radarResponse.prompts[0]).toMatch(/technical|diagram|schematic/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', async () => {
      const request = {
        contentType: 'blog' as const,
        contentTitle: '',
        contentSummary: 'A summary with some content',
        tone: 'neutral'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts).toHaveLength(2);
      expect(response.prompts[0]).toBeTruthy();
      expect(response.prompts[1]).toBeTruthy();
    });

    it('should handle tech radar without subtype', async () => {
      const request = {
        contentType: 'tech-radar' as const,
        contentTitle: 'New Technology',
        contentSummary: 'Description of new technology',
        tone: 'technical'
      };

      const response = await generator.generatePrompts(request);

      expect(response.prompts).toHaveLength(2);
      expect(response.prompts[0]).toMatch(/technical|diagram/i);
    });

    it('should handle very long content', async () => {
      const longText = 'word '.repeat(100);
      const request = {
        contentType: 'blog' as const,
        contentTitle: longText,
        contentSummary: longText,
        tone: 'neutral'
      };

      const response = await generator.generatePrompts(request);

      // Should still generate prompts, just with limited keywords
      expect(response.prompts).toHaveLength(2);
      expect(response.prompts[0]).toBeTruthy();
    });
  });
});
