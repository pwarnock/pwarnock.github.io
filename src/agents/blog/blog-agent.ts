/**
 * Blog Post Agent
 *
 * Generates conversational blog content with personal tone.
 * Optimizes for SEO/AEO discoverability and learns user's voice
 * through feedback and style documentation.
 *
 * Key Features:
 * - Conversational, personal blog content generation
 * - SEO/AEO optimization for discoverability
 * - Voice learning from style documentation
 * - Support for 4 blog content types: original, curated, embed, project
 * - Review session workflow for interactive feedback
 * - Never auto-publishes - explicit approval required
 */

import type {
  BlogFrontmatter,
  BlogContentType,
  ContentBundle,
  ImagePromptRequest,
} from '../types/index.js';
import { VoiceLearningSystem } from '../core/voice-learning.js';
import { HugoIntegration } from '../core/hugo-integration.js';
import { ImagePromptGenerator } from '../core/image-prompt-generator.js';
import { ReviewWorkflow } from '../core/review-workflow.js';
import { getAgentConfig } from '../config/agent-config.js';

/**
 * Blog post generation request
 */
export interface BlogPostRequest {
  title: string;
  contentType: BlogContentType;
  summary: string;
  date?: Date;
  draft?: boolean;
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  attribution?: string;
  sourceUrl?: string;
  contentIdea?: string;
  keyPoints?: string[];
}

/**
 * Blog post generation result
 */
export interface BlogPostResult {
  success: boolean;
  bundle?: ContentBundle;
  bundlePath?: string;
  error?: string;
}

/**
 * Content generation options for different blog types
 */
interface BlogContentOptions {
  contentType: BlogContentType;
  title: string;
  summary: string;
  keyPoints: string[];
  tone: string;
  vocabulary: string[];
  dos: string[];
  donts: string[];
}

/**
 * Blog Agent
 *
 * Generates blog post content bundles with proper frontmatter,
 * conversational content in user's voice, and image prompts.
 * Manages review sessions for interactive feedback and approval.
 */
export class BlogAgent {
  private voiceLearning: VoiceLearningSystem;
  private hugoIntegration: HugoIntegration;
  private imageGenerator: ImagePromptGenerator;
  private reviewWorkflow: ReviewWorkflow;
  private agentConfig: ReturnType<typeof getAgentConfig>;
  private initialized: boolean = false;

  constructor() {
    this.voiceLearning = new VoiceLearningSystem();
    this.hugoIntegration = new HugoIntegration();
    this.imageGenerator = new ImagePromptGenerator();
    this.reviewWorkflow = new ReviewWorkflow();
    this.agentConfig = getAgentConfig('blog');
  }

  /**
   * Initialize the blog agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.reviewWorkflow.initialize();
    this.initialized = true;
  }

  /**
   * Generate a blog post content bundle
   *
   * Process:
   * 1. Load style guidelines for blog content type
   * 2. Generate conversational content in user's voice
   * 3. Create Hugo content bundle with proper frontmatter
   * 4. Generate image prompts for featured images
   * 5. Create review session for feedback
   *
   * @param request - Blog post generation request
   * @returns Blog post generation result
   */
  async generateBlogPost(request: BlogPostRequest): Promise<BlogPostResult> {
    await this.ensureInitialized();

    try {
      // Validate required fields
      if (!request.title || request.title.trim() === '') {
        return {
          success: false,
          error: 'Title is required',
        };
      }

      if (!request.summary || request.summary.trim() === '') {
        return {
          success: false,
          error: 'Summary is required',
        };
      }

      if (!request.contentType) {
        return {
          success: false,
          error: 'Content type is required (original, curated, embed, or project)',
        };
      }

      // Get style guidelines for blog content
      const styleGuidelines = await this.voiceLearning.getStyleSuggestions('blog');

      // Generate blog content based on type
      const blogContent = this.generateBlogContent({
        contentType: request.contentType,
        title: request.title,
        summary: request.summary,
        keyPoints: request.keyPoints || [],
        tone: styleGuidelines.tone,
        vocabulary: styleGuidelines.vocabulary,
        dos: styleGuidelines.dos,
        donts: styleGuidelines.donts,
      });

      // Create Hugo content bundle
      const hugoResult = await this.hugoIntegration.generateContentBundle({
        type: 'blog',
        title: request.title,
        date: request.date || new Date(),
        draft: request.draft !== false, // Default to true
        frontmatter: {
          summary: request.summary,
          content_type: request.contentType,
          tags: request.tags || [],
          categories: request.categories || [],
          featured_image: request.featuredImage,
          attribution: request.attribution,
          source_url: request.sourceUrl,
        },
        content: blogContent,
      });

      // Generate image prompts
      const imagePromptRequest: ImagePromptRequest = {
        contentType: 'blog',
        contentTitle: request.title,
        contentSummary: request.summary,
        tone: styleGuidelines.tone,
      };

      const imagePrompts = await this.imageGenerator.generatePrompts(imagePromptRequest);

      // Create content bundle
      const bundle: ContentBundle = {
        type: 'blog',
        frontmatter: hugoResult.frontmatter,
        content: hugoResult.content,
        imagePrompts: imagePrompts.prompts,
        validationStatus: 'pending',
        reviewStatus: 'draft',
        createdAt: new Date(),
        sessions: [],
      };

      // Create review session
      const sessionResult = await this.reviewWorkflow.createSession(bundle);

      if (!sessionResult.success) {
        return {
          success: false,
          error: 'Failed to create review session: ' + (sessionResult.error || 'Unknown error'),
        };
      }

      return {
        success: true,
        bundle,
        bundlePath: hugoResult.path,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate blog post: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Generate blog content based on content type
   */
  private generateBlogContent(options: BlogContentOptions): string {
    const { contentType, title, summary, keyPoints, tone, vocabulary, dos, donts } = options;

    // Generate content based on blog type
    switch (contentType) {
      case 'original':
        return this.generateOriginalContent(title, summary, keyPoints, tone, vocabulary);
      case 'curated':
        return this.generateCuratedContent(title, summary, keyPoints, tone, vocabulary);
      case 'embed':
        return this.generateEmbedContent(title, summary, keyPoints, tone, vocabulary);
      case 'project':
        return this.generateProjectContent(title, summary, keyPoints, tone, vocabulary);
      default:
        return this.generateOriginalContent(title, summary, keyPoints, tone, vocabulary);
    }
  }

  /**
   * Generate original blog content
   */
  private generateOriginalContent(
    title: string,
    summary: string,
    keyPoints: string[],
    tone: string,
    vocabulary: string[]
  ): string {
    const sections: string[] = [];

    // Introduction (title comes from frontmatter, no H1 in content)
    sections.push(`## Introduction\n`);
    sections.push(`${summary}\n`);

    // Key content
    if (keyPoints.length > 0) {
      sections.push(`## Key Points\n`);
      keyPoints.forEach(point => {
        sections.push(`- ${point}\n`);
      });
      sections.push('');
    }

    // Personal perspective
    sections.push(`## My Take\n`);
    sections.push(`From my perspective, this topic matters because...\n`);

    // Conclusion
    sections.push(`## Conclusion\n`);
    sections.push(`What stands out to me is...\n`);

    return sections.join('\n');
  }

  /**
   * Generate curated blog content
   */
  private generateCuratedContent(
    title: string,
    summary: string,
    keyPoints: string[],
    tone: string,
    vocabulary: string[]
  ): string {
    const sections: string[] = [];

    sections.push(`## Overview\n`);
    sections.push(`${summary}\n`);

    if (keyPoints.length > 0) {
      sections.push(`## Highlights\n`);
      keyPoints.forEach((point, index) => {
        sections.push(`${index + 1}. ${point}\n`);
      });
      sections.push('');
    }

    sections.push(`## Why It Matters\n`);
    sections.push(`I found this interesting because...\n`);

    sections.push(`## Further Reading\n`);
    sections.push(`- [Additional resource 1](#)\n`);
    sections.push(`- [Additional resource 2](#)\n`);

    return sections.join('\n');
  }

  /**
   * Generate embed blog content
   */
  private generateEmbedContent(
    title: string,
    summary: string,
    keyPoints: string[],
    tone: string,
    vocabulary: string[]
  ): string {
    const sections: string[] = [];

    sections.push(`## About This ${keyPoints[0] || 'Content'}\n`);
    sections.push(`${summary}\n`);

    sections.push(`## Embedded Content\n`);
    sections.push(`<!-- Embed code or reference -->\n`);

    sections.push(`## Thoughts\n`);
    sections.push(`What I find interesting about this...\n`);

    return sections.join('\n');
  }

  /**
   * Generate project-based blog content
   */
  private generateProjectContent(
    title: string,
    summary: string,
    keyPoints: string[],
    tone: string,
    vocabulary: string[]
  ): string {
    const sections: string[] = [];

    sections.push(`## Project Overview\n`);
    sections.push(`${summary}\n`);

    sections.push(`## How It Works\n`);
    sections.push(`The approach I took...\n`);

    sections.push(`## Key Learnings\n`);
    if (keyPoints.length > 0) {
      keyPoints.forEach(point => {
        sections.push(`- ${point}\n`);
      });
    }
    sections.push('');

    sections.push(`## What I'd Do Differently\n`);
    sections.push(`Looking back, I would...\n`);

    return sections.join('\n');
  }

  /**
   * Record user feedback for voice learning
   *
   * Extracts style patterns from user feedback and updates
   * style documentation for future content generation.
   *
   * @param feedback - User feedback text
   * @param context - 'positive' for good examples, 'negative' for corrections
   * @returns Pattern extraction result
   */
  async recordFeedback(
    feedback: string,
    context: 'positive' | 'negative'
  ): Promise<{
    success: boolean;
    summary: string;
    patternsExtracted: {
      vocabulary: number;
      sentencePatterns: number;
      dos: number;
      donts: number;
      corrections: number;
    };
  }> {
    return this.voiceLearning.extractPatternsFromFeedback('blog', feedback, context);
  }

  /**
   * Get style guidelines for blog content
   */
  async getStyleGuidelines(): Promise<{
    tone: string;
    vocabulary: string[];
    dos: string[];
    donts: string[];
  }> {
    return this.voiceLearning.getStyleSuggestions('blog');
  }

  /**
   * Add vocabulary to style documentation
   */
  async addVocabulary(word: string): Promise<void> {
    return this.voiceLearning.addVocabulary('blog', word);
  }

  /**
   * Get learning progress
   */
  async getLearningProgress(): Promise<{
    vocabularyCount: number;
    patternCount: number;
    doCount: number;
    dontCount: number;
    goodExampleCount: number;
    badExampleCount: number;
    lastUpdated: Date | null;
  }> {
    return this.voiceLearning.getLearningProgress('blog');
  }

  /**
   * Get review workflow engine
   */
  getReviewWorkflow(): ReviewWorkflow {
    return this.reviewWorkflow;
  }

  /**
   * Get agent configuration
   */
  getConfig(): ReturnType<typeof getAgentConfig> {
    return this.agentConfig;
  }

  /**
   * Ensure the agent is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Validate blog post against validation script
   */
  async validateBlogPost(bundlePath: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return this.hugoIntegration.validateContentBundle(bundlePath, 'blog');
  }

  /**
   * Generate blog post from template
   *
   * Creates a blog post from a predefined template with
   * user-provided values for key fields.
   */
  async generateFromTemplate(template: {
    contentType: BlogContentType;
    title: string;
    summary: string;
    keyPoints?: string[];
    tags?: string[];
    categories?: string[];
  }): Promise<BlogPostResult> {
    return this.generateBlogPost({
      contentType: template.contentType,
      title: template.title,
      summary: template.summary,
      keyPoints: template.keyPoints,
      tags: template.tags,
      categories: template.categories,
      date: new Date(),
      draft: true,
    });
  }

  /**
   * Get supported content types
   */
  getSupportedContentTypes(): BlogContentType[] {
    return ['original', 'curated', 'embed', 'project'];
  }

  /**
   * Get content type description
   */
  getContentTypeDescription(contentType: BlogContentType): string {
    const descriptions: Record<BlogContentType, string> = {
      original: 'Original thoughts and analysis written by me',
      curated: 'Curated collection of resources and insights from others',
      embed: 'Embedded content from external sources with my commentary',
      project: 'Project-based posts sharing work and learnings',
    };

    return descriptions[contentType];
  }
}
