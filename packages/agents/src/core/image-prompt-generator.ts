/**
 * Image Prompt Generator
 *
 * Generates context-aware image prompts for different content types
 * based on style guidelines, tone, and content metadata.
 */

import type {
  ContentType,
  RadarSubtype,
  ImagePromptRequest,
  ImagePromptResponse
} from '../types/index.js';
import { getAgentConfig } from '../config/agent-config.js';

/**
 * Style hints for different content types
 */
interface StyleHints {
  blog: string[];
  portfolio: string[];
  'tech-radar': string[];
}

/**
 * Image generation specifications
 */
interface ImageSpecs {
  aspectRatio: string;
  style: string;
  mood: string;
  composition: string;
}

export class ImagePromptGenerator {
  private readonly styleHints: StyleHints = {
    blog: [
      'minimal',
      'personal',
      'authentic',
      'clean',
      'modern',
      'warm',
      'inviting'
    ],
    portfolio: [
      'professional',
      'sleek',
      'achievement-focused',
      'corporate',
      'polished',
      'high-quality',
      'showcase'
    ],
    'tech-radar': [
      'visual',
      'clear',
      'technology-focused',
      'modern',
      'schematic',
      'informative',
      'structured'
    ]
  };

  /**
   * Generate image prompts for a content item
   */
  async generatePrompts(request: ImagePromptRequest): Promise<ImagePromptResponse> {
    const { contentType, subtype, contentTitle, contentSummary, tone } = request;

    // Get agent configuration for additional context
    const agentConfig = getAgentConfig(contentType as 'blog' | 'portfolio' | 'tech-radar');

    // Generate prompts based on content type
    const prompts = this.generateTypeSpecificPrompts(
      contentType,
      subtype,
      contentTitle,
      contentSummary,
      tone,
      agentConfig.toneGuidelines
    );

    // Select appropriate style hints
    const styleHints = this.selectStyleHints(contentType);

    return {
      prompts,
      metadata: {
        contentType,
        generatedAt: new Date(),
        styleHints
      }
    };
  }

  /**
   * Generate type-specific prompts
   */
  private generateTypeSpecificPrompts(
    contentType: ContentType,
    subtype: RadarSubtype | undefined,
    title: string,
    summary: string,
    tone: string,
    toneGuidelines: string[]
  ): string[] {
    switch (contentType) {
      case 'blog':
        return this.generateBlogPrompts(title, summary, tone);
      case 'portfolio':
        return this.generatePortfolioPrompts(title, summary, tone);
      case 'tech-radar':
        return this.generateTechRadarPrompts(title, summary, tone, subtype);
      default:
        return this.generateGenericPrompts(title, summary, tone);
    }
  }

  /**
   * Generate blog post image prompts
   */
  private generateBlogPrompts(
    title: string,
    summary: string,
    tone: string
  ): string[] {
    const specs = this.getImageSpecs('blog');
    const keywords = this.extractKeywords(title + ' ' + summary);

    const prompts = [
      // Prompt 1: Hero/featured image
      `A ${specs.mood} ${specs.style} illustration representing ${keywords.join(', ')}, ` +
      `with a ${specs.composition} layout. Clean white background with subtle accent colors. ` +
      `Modern minimal aesthetic, warm lighting, professional photography style. ` +
      `${specs.aspectRatio} aspect ratio. High resolution, sharp focus.`,

      // Prompt 2: Alternative/conceptual image
      `An abstract ${specs.style} visual concept about ${keywords[0]}, ` +
      `using geometric shapes and soft gradients. ${specs.mood} atmosphere, ` +
      `clean lines, balanced composition. Minimalist design with plenty of negative space. ` +
      `Soft natural lighting, contemporary art style suitable for blog header. ` +
      `${specs.aspectRatio} aspect ratio.`
    ];

    return prompts;
  }

  /**
   * Generate portfolio project image prompts
   */
  private generatePortfolioPrompts(
    title: string,
    summary: string,
    tone: string
  ): string[] {
    const specs = this.getImageSpecs('portfolio');
    const keywords = this.extractKeywords(title + ' ' + summary);

    const prompts = [
      // Prompt 1: Professional showcase image
      `A ${specs.style} ${specs.mood} showcase of ${keywords.join(' and ')}, ` +
      `professional product photography style. ${specs.composition} framing, ` +
      `clean studio lighting, white or light gray background. ` +
      `High-end corporate aesthetic, sharp details, premium quality finish. ` +
      `${specs.aspectRatio} aspect ratio. 4K resolution, commercial photography.`,

      // Prompt 2: Achievement/success oriented image
      `A ${specs.style} visual representation of success and achievement in ${keywords[0]}, ` +
      `modern corporate design. Sleek interface or dashboard mockup showing results, ` +
      `clean minimal UI, professional blue and white color scheme. ` +
      `${specs.mood} business atmosphere, confident and polished look. ` +
      `${specs.aspectRatio} aspect ratio. High-quality digital art style.`
    ];

    return prompts;
  }

  /**
   * Generate tech radar image prompts
   */
  private generateTechRadarPrompts(
    title: string,
    summary: string,
    tone: string,
    subtype?: RadarSubtype
  ): string[] {
    const specs = this.getImageSpecs('tech-radar');
    const keywords = this.extractKeywords(title + ' ' + summary);

    // Add ring-specific context
    const ringContext = subtype ? ` in the ${subtype} ring` : '';
    const colorScheme = this.getRadarColorScheme(subtype);

    const prompts = [
      // Prompt 1: Technology visualization
      `A ${specs.style} ${specs.mood} diagram showing ${keywords[0]}${ringContext}, ` +
      `clean technical illustration style. ${specs.composition} layout with clear hierarchy, ` +
      `${colorScheme} color palette. Modern tech company aesthetic, schematic design. ` +
      `Simple geometric shapes, clean lines, professional technical drawing. ` +
      `${specs.aspectRatio} aspect ratio. Vector art style.`,

      // Prompt 2: Icon/symbol representation
      `A modern ${specs.style} icon or symbol representing ${keywords[0]}, ` +
      `flat design style. ${colorScheme} colors, clean minimalist aesthetic. ` +
      `Simple geometric shapes, ${specs.mood} tech-focused design. ` +
      `Suitable for technology radar visualization, scalable vector graphics style. ` +
      `Centered composition, plenty of surrounding space. ${specs.aspectRatio} aspect ratio.`
    ];

    return prompts;
  }

  /**
   * Generate generic fallback prompts
   */
  private generateGenericPrompts(
    title: string,
    summary: string,
    tone: string
  ): string[] {
    const keywords = this.extractKeywords(title + ' ' + summary);

    const prompts = [
      `A professional modern illustration representing ${keywords.join(', ')}, ` +
      `clean minimal design, white background. Contemporary style, balanced composition.`,

      `An abstract visual concept about ${keywords[0]}, ` +
      `modern aesthetic, simple geometric shapes, clean lines. Minimalist design.`
    ];

    return prompts;
  }

  /**
   * Get image specifications for content type
   */
  private getImageSpecs(contentType: ContentType): ImageSpecs {
    const specs: Record<ContentType, ImageSpecs> = {
      blog: {
        aspectRatio: '16:9',
        style: 'editorial',
        mood: 'warm and inviting',
        composition: 'centered with rule of thirds'
      },
      portfolio: {
        aspectRatio: '16:9',
        style: 'corporate professional',
        mood: 'confident and polished',
        composition: 'balanced with strong focal point'
      },
      'tech-radar': {
        aspectRatio: '1:1',
        style: 'technical illustration',
        mood: 'clear and informative',
        composition: 'centered symmetrical'
      }
    };

    return specs[contentType];
  }

  /**
   * Get color scheme based on radar ring
   */
  private getRadarColorScheme(subtype?: RadarSubtype): string {
    const schemes: Record<RadarSubtype, string> = {
      adopt: 'green and white',
      trial: 'blue and white',
      assess: 'yellow and white',
      hold: 'red and white'
    };

    return subtype ? schemes[subtype] : 'blue and white';
  }

  /**
   * Extract relevant keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove common words and extract key terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'about', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    // Return unique keywords, max 5
    return Array.from(new Set(words)).slice(0, 5);
  }

  /**
   * Select appropriate style hints for content type
   */
  private selectStyleHints(contentType: ContentType): string[] {
    return this.styleHints[contentType];
  }

  /**
   * Generate prompts for multiple content items
   */
  async generateBatchPrompts(
    requests: ImagePromptRequest[]
  ): Promise<ImagePromptResponse[]> {
    const responses: ImagePromptResponse[] = [];

    for (const request of requests) {
      const response = await this.generatePrompts(request);
      responses.push(response);
    }

    return responses;
  }

  /**
   * Get image specifications for content type (public method)
   */
  public getSpecifications(contentType: ContentType): ImageSpecs {
    return this.getImageSpecs(contentType);
  }

  /**
   * Get available style hints for content type
   */
  public getStyleHints(contentType: ContentType): string[] {
    return this.selectStyleHints(contentType);
  }
}
