/**
 * Tech Radar Agent
 *
 * Generates opinionated but balanced technical analysis for tech radar entries.
 * Supports four radar subtypes: adopt, trial, assess, hold.
 * Uses BYOR (Bring Your Own Radar) structure.
 *
 * Key capabilities:
 * - Generates tech radar frontmatter with proper schema
 * - Creates radar content for each subtype with technical depth
 * - Integrates with VoiceLearningSystem for style guidelines
 * - Integrates with HugoIntegration for content bundles
 * - Integrates with ImagePromptGenerator for image prompts
 * - Provides ecosystem assessment and adoption implications
 * - Never auto-publishes - requires explicit approval
 */

import type {
  RadarSubtype,
  TechRadarFrontmatter,
  ImagePromptResponse,
  ContentBundle
} from '../types/index.js';
import { VoiceLearningSystem } from '../core/voice-learning.js';
import { HugoIntegration } from '../core/hugo-integration.js';
import { ImagePromptGenerator } from '../core/image-prompt-generator.js';

/**
 * Tech radar generation options
 */
export interface TechRadarOptions {
  title: string;
  description: string;
  quadrant: string;
  ring: RadarSubtype;
  tags?: string[];
  date?: Date;
  draft?: boolean;
}

/**
 * Tech radar analysis content
 */
export interface TechRadarAnalysis {
  overview: string;
  keyFeatures: string[];
  strengths: string[];
  weaknesses: string[];
  useCases: string[];
  ecosystemAssessment: string;
  adoptionConsiderations: string;
  maturityLevel: string;
  futureOutlook: string;
}

/**
 * Generated tech radar content result
 */
export interface TechRadarResult {
  frontmatter: TechRadarFrontmatter;
  content: string;
  imagePrompts: ImagePromptResponse;
  bundlePath: string;
}

/**
 * Tech Radar Agent class
 */
export class TechRadarAgent {
  private voiceLearning: VoiceLearningSystem;
  private hugoIntegration: HugoIntegration;
  private imagePromptGenerator: ImagePromptGenerator;
  private readonly contentType = 'tech-radar' as const;

  constructor() {
    this.voiceLearning = new VoiceLearningSystem();
    this.hugoIntegration = new HugoIntegration();
    this.imagePromptGenerator = new ImagePromptGenerator();
  }

  /**
   * Generate a complete tech radar entry
   */
  async generateTechRadar(options: TechRadarOptions): Promise<TechRadarResult> {
    // 1. Get style guidelines from voice learning
    const styleGuidelines = await this.voiceLearning.getStyleSuggestions(this.contentType);

    // 2. Generate frontmatter
    const frontmatter = this.generateFrontmatter(options);

    // 3. Generate content based on ring/subtype
    const content = await this.generateContent(options, styleGuidelines);

    // 4. Generate image prompts
    const imagePrompts = await this.imagePromptGenerator.generatePrompts({
      contentType: this.contentType,
      subtype: options.ring,
      contentTitle: options.title,
      contentSummary: options.description,
      tone: styleGuidelines.tone
    });

    // 5. Generate content bundle
    const bundle = await this.hugoIntegration.generateContentBundle({
      type: this.contentType,
      subtype: options.ring,
      title: options.title,
      date: options.date || new Date(),
      draft: options.draft !== false, // Default to draft
      frontmatter,
      content
    });

    return {
      frontmatter,
      content,
      imagePrompts,
      bundlePath: bundle.path
    };
  }

  /**
   * Generate tech radar frontmatter
   */
  private generateFrontmatter(options: TechRadarOptions): TechRadarFrontmatter {
    const date = options.date || new Date();
    const formattedDate = date.toISOString().split('T')[0];

    const frontmatter: TechRadarFrontmatter = {
      title: options.title,
      date: formattedDate,
      draft: options.draft !== false,
      description: options.description,
      quadrant: options.quadrant,
      ring: options.ring
    };

    if (options.tags && options.tags.length > 0) {
      frontmatter.tags = options.tags;
    }

    return frontmatter;
  }

  /**
   * Generate tech radar content based on ring and style guidelines
   */
  private async generateContent(
    options: TechRadarOptions,
    styleGuidelines: {
      tone: string;
      vocabulary: string[];
      dos: string[];
      donts: string[];
    }
  ): Promise<string> {
    // Generate analysis based on ring
    const analysis = this.generateAnalysis(options.ring, options.title, options.description);

    // Build content sections
    const sections = [
      this.generateTitleSection(options.title),
      this.generateOverviewSection(analysis.overview),
      this.generateKeyFeaturesSection(analysis.keyFeatures),
      this.generateStrengthsWeaknessesSection(analysis.strengths, analysis.weaknesses),
      this.generateUseCasesSection(analysis.useCases),
      this.generateRingSpecificSection(options.ring, analysis),
      this.generateEcosystemSection(analysis.ecosystemAssessment),
      this.generateAdoptionSection(analysis.adoptionConsiderations),
      this.generateConclusionSection(analysis.maturityLevel, analysis.futureOutlook)
    ];

    return sections.join('\n\n');
  }

  /**
   * Generate title section
   */
  private generateTitleSection(title: string): string {
    return `# ${title}`;
  }

  /**
   * Generate overview section
   */
  private generateOverviewSection(overview: string): string {
    return `## Overview

${overview}`;
  }

  /**
   * Generate key features section
   */
  private generateKeyFeaturesSection(features: string[]): string {
    const featuresList = features.map(f => `- ${f}`).join('\n');
    return `## Key Features

${featuresList}`;
  }

  /**
   * Generate strengths and weaknesses section
   */
  private generateStrengthsWeaknessesSection(
    strengths: string[],
    weaknesses: string[]
  ): string {
    const strengthsList = strengths.map(s => `- ${s}`).join('\n');
    const weaknessesList = weaknesses.map(w => `- ${w}`).join('\n');

    return `## Strengths and Weaknesses

### Strengths

${strengthsList}

### Weaknesses

${weaknessesList}`;
  }

  /**
   * Generate use cases section
   */
  private generateUseCasesSection(useCases: string[]): string {
    const useCasesList = useCases.map(u => `- ${u}`).join('\n');
    return `## Use Cases

${useCasesList}`;
  }

  /**
   * Generate ring-specific content
   */
  private generateRingSpecificSection(ring: RadarSubtype, analysis: TechRadarAnalysis): string {
    switch (ring) {
      case 'adopt':
        return this.generateAdoptSection(analysis);
      case 'trial':
        return this.generateTrialSection(analysis);
      case 'assess':
        return this.generateAssessSection(analysis);
      case 'hold':
        return this.generateHoldSection(analysis);
      default:
        return '';
    }
  }

  /**
   * Generate adopt ring section
   */
  private generateAdoptSection(analysis: TechRadarAnalysis): string {
    return `## Adoption Recommendation

**ADOPT** - This technology is mature and proven for production use.

${analysis.adoptionConsiderations}

### Maturity Level

${analysis.maturityLevel}

### Implementation Guidance

- Start with non-critical applications to build team expertise
- Establish best practices and patterns early
- Invest in training and knowledge sharing
- Monitor for updates and security patches
- Consider long-term maintenance and support`;
  }

  /**
   * Generate trial ring section
   */
  private generateTrialSection(analysis: TechRadarAnalysis): string {
    return `## Trial Recommendation

**TRIAL** - Worth exploring for new projects or pilots.

${analysis.adoptionConsiderations}

### When to Trial

- Evaluate for specific use cases where it shines
- Run small-scale proofs of concept
- Compare with existing solutions
- Assess team learning curve and adoption challenges

### Success Criteria

- Clear performance or productivity gains
- Active community and ecosystem support
- Good documentation and learning resources
- Compatibility with existing tech stack`;
  }

  /**
   * Generate assess ring section
   */
  private generateAssessSection(analysis: TechRadarAnalysis): string {
    return `## Assessment Recommendation

**ASSESS** - Worth monitoring and evaluating.

${analysis.adoptionConsiderations}

### Key Questions to Answer

- Does this solve a real problem we have?
- Is the technology mature enough for our needs?
- What is the learning curve and adoption cost?
- How does the ecosystem and community look?
- Are there proven production use cases?

### Evaluation Steps

1. Research and documentation review
2. Community and ecosystem health check
3. Small prototype or proof of concept
4. Team skills and interest assessment
5. Business value and ROI analysis`;
  }

  /**
   * Generate hold ring section
   */
  private generateHoldSection(analysis: TechRadarAnalysis): string {
    return `## Hold Recommendation

**HOLD** - Avoid new adoption; reassess existing usage.

${analysis.adoptionConsiderations}

### Why Hold

- Technology has been superseded by better alternatives
- Community or ecosystem is declining
- Known security or stability issues
- Poor long-term viability or support
- Better solutions available

### Migration Path

If you're currently using this technology:

- Plan migration to modern alternatives
- Prioritize security-critical systems first
- Document existing workarounds and issues
- Defer new feature development
- Allocate budget for migration efforts`;
  }

  /**
   * Generate ecosystem assessment section
   */
  private generateEcosystemSection(assessment: string): string {
    return `## Ecosystem Assessment

${assessment}`;
  }

  /**
   * Generate adoption considerations section
   */
  private generateAdoptionSection(considerations: string): string {
    return `## Adoption Considerations

${considerations}`;
  }

  /**
   * Generate conclusion section
   */
  private generateConclusionSection(maturity: string, outlook: string): string {
    return `## Conclusion

**Maturity:** ${maturity}

**Future Outlook:** ${outlook}

---

*This assessment is based on current industry trends, community signals, and practical experience. Your context and requirements may vary. Regularly reassess as technologies evolve.*`;
  }

  /**
   * Generate analysis based on ring and technology info
   */
  private generateAnalysis(
    ring: RadarSubtype,
    title: string,
    description: string
  ): TechRadarAnalysis {
    // This would typically call an AI model for dynamic generation
    // For now, we generate structured content based on the ring

    const baseAnalysis = {
      overview: this.generateOverview(ring, title, description),
      keyFeatures: this.generateKeyFeatures(ring, title),
      strengths: this.generateStrengths(ring),
      weaknesses: this.generateWeaknesses(ring),
      useCases: this.generateUseCases(ring, title),
      ecosystemAssessment: this.generateEcosystemAssessment(ring),
      adoptionConsiderations: this.generateAdoptionConsiderations(ring),
      maturityLevel: this.generateMaturityLevel(ring),
      futureOutlook: this.generateFutureOutlook(ring)
    };

    return baseAnalysis;
  }

  /**
   * Generate overview based on ring
   */
  private generateOverview(ring: RadarSubtype, title: string, description: string): string {
    const ringContexts: Record<RadarSubtype, string> = {
      adopt: `${title} is a mature, production-ready technology that has proven itself in real-world applications. ${description}`,
      trial: `${title} shows promise for specific use cases and is worth exploring through targeted trials. ${description}`,
      assess: `${title} is an emerging technology worth monitoring and evaluating for future adoption. ${description}`,
      hold: `${title} has fallen out of favor and should be avoided for new projects. ${description}`
    };

    return ringContexts[ring];
  }

  /**
   * Generate key features based on ring
   */
  private generateKeyFeatures(ring: RadarSubtype, title: string): string[] {
    const featuresByRing: Record<RadarSubtype, string[]> = {
      adopt: [
        'Proven production stability and reliability',
        'Strong community and commercial support',
        'Comprehensive documentation and learning resources',
        'Battle-tested in enterprise environments',
        'Regular security updates and maintenance'
      ],
      trial: [
        'Promising approach to solving specific problems',
        'Growing community and ecosystem',
        'Active development and improvement',
        'Good initial documentation',
        'Positive early adopter feedback'
      ],
      assess: [
        'Innovative approach or technology',
        'Early but growing community interest',
        'Potential to solve emerging challenges',
        'Active experimentation by early adopters',
        'Evolving best practices and patterns'
      ],
      hold: [
        'Legacy functionality that has been superseded',
        'Declining community and ecosystem support',
        'Known limitations and issues',
        'Better alternatives available',
        'Reduced maintenance and security updates'
      ]
    };

    return featuresByRing[ring];
  }

  /**
   * Generate strengths based on ring
   */
  private generateStrengths(ring: RadarSubtype): string[] {
    const strengthsByRing: Record<RadarSubtype, string[]> = {
      adopt: [
        'Mature and stable with predictable behavior',
        'Large talent pool with proven expertise',
        'Extensive tooling and ecosystem integration',
        'Scalable performance characteristics',
        'Strong vendor independence and governance'
      ],
      trial: [
        'Modern approach with current best practices',
        'Active community and rapid iteration',
        'Good performance for targeted use cases',
        'Growing ecosystem of libraries and tools',
        'Enthusiastic early adopter community'
      ],
      assess: [
        'Novel approach to existing problems',
        'Potential for significant efficiency gains',
        'Active research and development',
        'Community-driven innovation',
        'Alignment with industry trends'
      ],
      hold: [
        'Familiar to teams with existing experience',
        'Stable but not actively improving',
        'Extensive legacy codebase and patterns',
        'Well-understood limitations and workarounds',
        'Available expertise in market'
      ]
    };

    return strengthsByRing[ring];
  }

  /**
   * Generate weaknesses based on ring
   */
  private generateWeaknesses(ring: RadarSubtype): string[] {
    const weaknessesByRing: Record<RadarSubtype, string[]> = {
      adopt: [
        'May have accumulated technical debt',
        'Could be less innovative than newer alternatives',
        'Complexity from years of feature additions',
        'Potential performance overhead from legacy decisions'
      ],
      trial: [
        'Limited production track record',
        'Smaller talent pool and expertise',
        'Ecosystem still maturing',
        'Potential for breaking changes',
        'Learning curve for teams'
      ],
      assess: [
        'Uncertain long-term viability',
        'Immature ecosystem and tooling',
        'Limited production case studies',
        'Rapidly changing API and patterns',
        'High learning and adoption risk'
      ],
      hold: [
        'Known security or stability issues',
        'Poor long-term support prospects',
        'Limited modern feature set',
        'Difficulty attracting new talent',
        'Increasing maintenance burden'
      ]
    };

    return weaknessesByRing[ring];
  }

  /**
   * Generate use cases based on ring
   */
  private generateUseCases(ring: RadarSubtype, title: string): string[] {
    const useCasesByRing: Record<RadarSubtype, string[]> = {
      adopt: [
        'Production applications requiring stability',
        'Enterprise-grade systems with SLA requirements',
        'Projects with long-term maintenance needs',
        'Teams requiring reliable hiring pipelines',
        'Applications with comprehensive compliance needs'
      ],
      trial: [
        'New projects with flexibility in technology choices',
        'Proof of concepts and prototypes',
        'Teams willing to invest in learning',
        'Applications where specific strengths align',
        'Scenarios where trade-offs are acceptable'
      ],
      assess: [
        'Research and exploration projects',
        'Low-stakes experiments and prototypes',
        'Learning and skill development',
        'Future technology planning',
        'Competitive analysis and evaluation'
      ],
      hold: [
        'Maintaining existing legacy systems',
        'Situations with no viable migration path',
        'Short-term projects with fixed timelines',
        'Environments with specific legacy dependencies'
      ]
    };

    return useCasesByRing[ring];
  }

  /**
   * Generate ecosystem assessment
   */
  private generateEcosystemAssessment(ring: RadarSubtype): string {
    const assessments: Record<RadarSubtype, string> = {
      adopt: 'The ecosystem is mature and comprehensive, with extensive library support, strong commercial backing, and a large community of practitioners. Tooling is robust and well-integrated across development workflows.',
      trial: 'The ecosystem is growing rapidly with active community contributions. Libraries and tools are available but may be less mature than established alternatives. Commercial support is emerging but not universal.',
      assess: 'The ecosystem is in early stages with scattered tooling and libraries. Community is small but enthusiastic. Commercial support is limited but growing as interest increases.',
      hold: 'The ecosystem is in decline with diminishing community activity. Libraries are stagnant or abandoned. Commercial support is limited to legacy maintenance contracts.'
    };

    return assessments[ring];
  }

  /**
   * Generate adoption considerations
   */
  private generateAdoptionConsiderations(ring: RadarSubtype): string {
    const considerations: Record<RadarSubtype, string> = {
      adopt: 'Adoption is recommended for most new projects due to proven stability and extensive community support. Ensure your team has access to training resources and consider existing patterns for best practices. Monitor for security updates and plan for long-term maintenance.',
      trial: 'Adopt for targeted pilots and new projects where the specific strengths align with your needs. Start with small, low-risk applications to build expertise. Be prepared for API changes and invest time in community engagement. Have a fallback plan in case adoption challenges arise.',
      assess: 'Do not adopt for production use yet. Invest time in monitoring and learning through small experiments. Engage with the community to understand maturity and direction. Evaluate regularly as the technology evolves.',
      hold: 'Do not adopt for new projects. Plan migration strategies for existing usage. Prioritize security-critical systems and consider long-term support risks. Allocate budget for modernization efforts.'
    };

    return considerations[ring];
  }

  /**
   * Generate maturity level
   */
  private generateMaturityLevel(ring: RadarSubtype): string {
    const maturityLevels: Record<RadarSubtype, string> = {
      adopt: 'Production-ready with years of real-world validation',
      trial: 'Maturing with growing production adoption',
      assess: 'Early stage with limited production validation',
      hold: 'Declining with known limitations'
    };

    return maturityLevels[ring];
  }

  /**
   * Generate future outlook
   */
  private generateFutureOutlook(ring: RadarSubtype): string {
    const outlooks: Record<RadarSubtype, string> = {
      adopt: 'Continued relevance with incremental improvements. Long-term viability is strong but monitor for emerging alternatives that may eventually supersede.',
      trial: 'Potential to move to adopt if maturity and adoption continue. Could also move to hold if challenges emerge. Active monitoring recommended.',
      assess: 'High uncertainty with potential for rapid growth or stagnation. Worth regular reassessment as the technology and ecosystem evolve.',
      hold: 'Continued decline as better alternatives gain adoption. Plan for eventual migration or obsolescence.'
    };

    return outlooks[ring];
  }

  /**
   * Create a review session for the generated tech radar entry
   */
  async createReviewSession(contentBundleId: string): Promise<string> {
    const sessionId = `tech-radar-review-${Date.now()}`;

    // This would integrate with the review workflow system
    // For now, return the session ID
    return sessionId;
  }

  /**
   * Update voice learning from user feedback
   */
  async learnFromFeedback(
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
    return this.voiceLearning.extractPatternsFromFeedback(
      this.contentType,
      feedback,
      context
    );
  }

  /**
   * Validate tech radar content
   */
  async validateTechRadar(bundlePath: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return this.hugoIntegration.validateContentBundle(bundlePath, this.contentType);
  }
}
