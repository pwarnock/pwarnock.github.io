/**
 * Portfolio Agent
 *
 * Generates professional, achievement-focused portfolio content that showcases
 * impact and technical depth. Uses strong action verbs and quantifiable metrics
 * to demonstrate value delivered to clients.
 *
 * Key Features:
 * - Achievement-focused content generation
 * - Strong action verbs (led, developed, implemented, achieved, delivered)
 * - Metrics and quantifiable results
 * - Professional, confident tone
 * - Integration with VoiceLearningSystem for style
 * - Integration with HugoIntegration for content bundles
 * - Integration with ImagePromptGenerator for image prompts
 * - Review session support (never auto-publishes)
 */

import type {
  ContentBundle,
  PortfolioFrontmatter,
  ValidationResult,
} from '../types/index.js';
import { VoiceLearningSystem } from '../core/voice-learning.js';
import { HugoIntegration } from '../core/hugo-integration.js';
import { ImagePromptGenerator } from '../core/image-prompt-generator.js';
import { ReviewWorkflow } from '../core/review-workflow.js';
import { portfolioAgentConfig } from '../config/agent-config.js';

/**
 * Portfolio generation request
 */
export interface PortfolioGenerationRequest {
  title: string;
  client: string;
  description: string;
  technologies: string[];
  completionDate?: Date;
  category?: string;
  githubUrl?: string;
  liveUrl?: string;
  projectDetails?: {
    challenges?: string[];
    solutions?: string[];
    outcomes?: string[];
    metrics?: Array<{
      metric: string;
      value: string;
      impact: string;
    }>;
  };
}

/**
 * Portfolio generation result
 */
export interface PortfolioGenerationResult {
  success: boolean;
  bundle?: ContentBundle;
  contentPath?: string;
  error?: string;
  warnings?: string[];
}

/**
 * Review session result
 */
export interface ReviewSessionResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

/**
 * Portfolio Agent
 *
 * Generates professional portfolio content with achievement-focused messaging,
 * strong action verbs, and quantifiable results.
 */
export class PortfolioAgent {
  private voiceLearning: VoiceLearningSystem;
  private hugoIntegration: HugoIntegration;
  private imagePromptGenerator: ImagePromptGenerator;
  private reviewWorkflow: ReviewWorkflow;
  private initialized: boolean = false;

  constructor() {
    this.voiceLearning = new VoiceLearningSystem();
    this.hugoIntegration = new HugoIntegration();
    this.imagePromptGenerator = new ImagePromptGenerator();
    this.reviewWorkflow = new ReviewWorkflow();
  }

  /**
   * Initialize the portfolio agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.reviewWorkflow.initialize();
      this.initialized = true;
    } catch (error) {
      // If initialization fails (e.g., .cody directory doesn't exist), log but continue
      // The agent can still function without review workflow
      console.warn(`Review workflow initialization failed, continuing without it: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.initialized = true;
    }
  }

  /**
   * Generate portfolio content bundle
   *
   * Creates a complete portfolio project with:
   * - Proper frontmatter with all required fields
   * - Achievement-focused content
   * - Image prompts for visuals
   * - Review session for feedback
   *
   * @param request - Portfolio generation request
   * @returns Generation result with content bundle
   */
  async generatePortfolio(request: PortfolioGenerationRequest): Promise<PortfolioGenerationResult> {
    await this.ensureInitialized();

    try {
      // Get style guidelines from VoiceLearningSystem
      const styleGuidelines = await this.voiceLearning.getStyleSuggestions('portfolio');

      // Generate content using style guidelines
      const content = this.generatePortfolioContent(request, styleGuidelines);

      // Create frontmatter
      const completionDate = request.completionDate || new Date();
      const frontmatter: PortfolioFrontmatter = {
        title: request.title,
        date: new Date().toISOString().split('T')[0],
        draft: true,
        description: request.description,
        client: request.client,
        technologies: request.technologies,
        completion_date: completionDate.toISOString().substring(0, 7), // YYYY-MM
        category: request.category || this.inferCategory(request.technologies),
        ...(request.githubUrl && { github_url: request.githubUrl }),
        ...(request.liveUrl && { live_url: request.liveUrl }),
      };

      // Generate image prompts
      const imagePromptsResponse = await this.imagePromptGenerator.generatePrompts({
        contentType: 'portfolio',
        contentTitle: request.title,
        contentSummary: request.description,
        tone: styleGuidelines.tone,
      });

      // Generate Hugo content bundle
      const hugoResult = await this.hugoIntegration.generateContentBundle({
        type: 'portfolio',
        title: request.title,
        date: new Date(),
        draft: true,
        frontmatter,
        content,
      });

      // Validate content bundle
      const validation = await this.hugoIntegration.validateContentBundle(
        hugoResult.directory,
        'portfolio'
      );

      // Create content bundle
      const bundle: ContentBundle = {
        type: 'portfolio',
        frontmatter,
        content,
        imagePrompts: imagePromptsResponse.prompts,
        validationStatus: validation.valid ? 'passed' : 'failed',
        reviewStatus: 'draft',
        createdAt: new Date(),
        sessions: [],
      };

      // Create review session (never auto-publishes)
      try {
        const sessionResult = await this.reviewWorkflow.createSession(bundle);
        if (!sessionResult.success) {
          console.warn(`Failed to create review session: ${sessionResult.error}`);
          // Continue without review session
        }
      } catch (error) {
        console.warn(`Review workflow not available, continuing without session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue without review session
      }

      return {
        success: true,
        bundle,
        contentPath: hugoResult.path,
        warnings: validation.warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate portfolio content with achievement-focused messaging
   */
  private generatePortfolioContent(
    request: PortfolioGenerationRequest,
    style: { tone: string; dos: string[]; donts: string[]; vocabulary: string[] }
  ): string {
    const { title, projectDetails } = request;

    // Extract action verbs from style vocabulary
    const actionVerbs = style.vocabulary.length > 0
      ? style.vocabulary
      : ['led', 'developed', 'implemented', 'achieved', 'delivered'];

    // Generate sections
    const overview = this.generateOverview(request, actionVerbs);
    const challenges = projectDetails?.challenges
      ? this.generateChallenges(projectDetails.challenges, actionVerbs)
      : '';
    const solutions = projectDetails?.solutions
      ? this.generateSolutions(projectDetails.solutions, actionVerbs)
      : '';
    const outcomes = this.generateOutcomes(request, actionVerbs);
    const technicalDetails = this.generateTechnicalDetails(request);

    // Combine sections
    let content = `# ${title}\n\n`;
    content += `${overview}\n\n`;

    if (challenges) {
      content += `## Challenges\n\n${challenges}\n\n`;
    }

    if (solutions) {
      content += `## Technical Solution\n\n${solutions}\n\n`;
    }

    content += `## Technical Implementation\n\n${technicalDetails}\n\n`;
    content += `## Outcomes\n\n${outcomes}\n\n`;

    content += `## Technologies\n\n`;
    content += request.technologies.map(tech => `- **${tech}**`).join('\n');
    content += '\n';

    return content;
  }

  /**
   * Generate overview section with strong opening
   */
  private generateOverview(request: PortfolioGenerationRequest, actionVerbs: string[]): string {
    const verb = actionVerbs[0] || 'delivered';
    const client = request.client;
    const description = request.description;

    return `**Project Overview**

${verb.charAt(0).toUpperCase() + verb.slice(1)} the development and delivery of ${description} for ${client}. This project demonstrates technical excellence and delivers measurable business value through innovative solutions.`;
  }

  /**
   * Generate challenges section
   */
  private generateChallenges(challenges: string[], actionVerbs: string[]): string {
    return challenges
      .map((challenge, index) => {
        const verb = actionVerbs[index % actionVerbs.length];
        return `- **Challenge ${index + 1}:** ${challenge} - ${verb} comprehensive analysis and strategic planning.`;
      })
      .join('\n');
  }

  /**
   * Generate solutions section
   */
  private generateSolutions(solutions: string[], actionVerbs: string[]): string {
    return solutions
      .map((solution, index) => {
        const verb = actionVerbs[index % actionVerbs.length];
        return `- **Solution ${index + 1}:** ${verb} ${solution}`;
      })
      .join('\n');
  }

  /**
   * Generate outcomes section with metrics
   */
  private generateOutcomes(request: PortfolioGenerationRequest, actionVerbs: string[]): string {
    const { projectDetails } = request;

    if (projectDetails?.outcomes && projectDetails.outcomes.length > 0) {
      let outcomes = projectDetails.outcomes
        .map((outcome, index) => {
          const verb = actionVerbs[index % actionVerbs.length];
          return `- **${verb.charAt(0).toUpperCase() + verb.slice(1)}** ${outcome}`;
        })
        .join('\n');

      // Add metrics if available
      if (projectDetails.metrics && projectDetails.metrics.length > 0) {
        outcomes += '\n\n### Key Metrics\n\n';
        outcomes += projectDetails.metrics
          .map(metric => `- **${metric.metric}:** ${metric.value} - ${metric.impact}`)
          .join('\n');
      }

      return outcomes;
    }

    // Default outcomes
    return `- **Delivered** high-quality solution that exceeded client expectations\n` +
           `- **Achieved** all project milestones on time and within budget\n` +
           `- **Implemented** best practices and industry standards`;
  }

  /**
   * Generate technical details section
   */
  private generateTechnicalDetails(request: PortfolioGenerationRequest): string {
    const technologies = request.technologies;

    let details = 'This project leverages modern technologies and architectural patterns:\n\n';
    details += technologies.map(tech => `- **${tech}**`).join('\n');

    if (request.githubUrl || request.liveUrl) {
      details += '\n\n**Project Links:**\n\n';
      if (request.githubUrl) {
        details += `- **Source Code:** [GitHub Repository](${request.githubUrl})\n`;
      }
      if (request.liveUrl) {
        details += `- **Live Demo:** [View Project](${request.liveUrl})\n`;
      }
    }

    return details;
  }

  /**
   * Infer category from technologies
   */
  private inferCategory(technologies: string[]): string {
    const techLower = technologies.map(t => t.toLowerCase());

    // Web development
    if (techLower.some(t => ['react', 'vue', 'angular', 'next', 'nuxt', 'typescript', 'javascript'].includes(t))) {
      return 'Web Development';
    }

    // Backend
    if (techLower.some(t => ['node', 'python', 'java', 'go', 'rust', 'api', 'graphql'].includes(t))) {
      return 'Backend Development';
    }

    // DevOps
    if (techLower.some(t => ['docker', 'kubernetes', 'aws', 'azure', 'terraform', 'ci/cd'].includes(t))) {
      return 'DevOps';
    }

    // Mobile
    if (techLower.some(t => ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'].includes(t))) {
      return 'Mobile Development';
    }

    // Data
    if (techLower.some(t => ['python', 'sql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'].includes(t))) {
      return 'Data Engineering';
    }

    return 'Software Development';
  }

  /**
   * Create a review session for feedback
   *
   * Allows stakeholders to provide inline comments and feedback
   * before approving for publication.
   *
   * @param bundle - Content bundle to review
   * @returns Review session result
   */
  async createReviewSession(bundle: ContentBundle): Promise<ReviewSessionResult> {
    await this.ensureInitialized();

    try {
      const result = await this.reviewWorkflow.createSession(bundle);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        sessionId: result.sessionId,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create review session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get style guidelines for portfolio content
   *
   * Returns current style guidelines from VoiceLearningSystem,
   * including learned patterns from previous feedback.
   *
   * @returns Style guidelines
   */
  async getStyleGuidelines(): Promise<{
    tone: string;
    vocabulary: string[];
    dos: string[];
    donts: string[];
  }> {
    return this.voiceLearning.getStyleSuggestions('portfolio');
  }

  /**
   * Record feedback for style learning
   *
   * Records user feedback to improve future content generation.
   * Extracts patterns from feedback and updates style documentation.
   *
   * @param feedback - User feedback text
   * @param context - Whether feedback is positive or negative
   * @returns Pattern extraction summary
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
    return this.voiceLearning.extractPatternsFromFeedback('portfolio', feedback, context);
  }

  /**
   * Validate portfolio content bundle
   *
   * Runs validation against portfolio frontmatter schema
   * and checks for common issues.
   *
   * @param bundlePath - Path to content bundle
   * @returns Validation result
   */
  async validatePortfolio(bundlePath: string): Promise<ValidationResult> {
    return this.hugoIntegration.validateContentBundle(bundlePath, 'portfolio');
  }

  /**
   * Get agent configuration
   *
   * Returns the portfolio agent configuration including
   * audience, tone guidelines, and frontmatter schema.
   *
   * @returns Agent configuration
   */
  getConfiguration(): typeof portfolioAgentConfig {
    return portfolioAgentConfig;
  }

  /**
   * Ensure agent is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
