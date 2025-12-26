/**
 * Type definitions for Content Agent System
 */

// Content types supported by the agent system
export type ContentType = 'blog' | 'portfolio' | 'tech-radar';

// Tech radar subtypes
export type RadarSubtype = 'adopt' | 'trial' | 'assess' | 'hold';

// Content type for blog posts (from data/content_types.yaml)
export type BlogContentType = 'original' | 'curated' | 'embed' | 'project';

// Validation status
export type ValidationStatus = 'pending' | 'passed' | 'failed';

// Review status
export type ReviewStatus = 'draft' | 'in-review' | 'approved';

/**
 * Style documentation for voice learning
 */
export interface StyleDocumentation {
  contentType: ContentType;
  tone: string;
  vocabulary: string[];
  sentencePatterns: string[];
  dos: string[];
  donts: string[];
  examples: {
    good: string[];
    bad: string[];
  };
  lastUpdated: Date;
}

/**
 * Comment in review session
 */
export interface Comment {
  section: string;
  text: string;
  resolution: 'pending' | 'accepted' | 'rejected';
}

/**
 * Review session
 */
export interface ReviewSession {
  id: string;
  contentBundleId: string;
  comments: Comment[];
  status: 'active' | 'approved' | 'rejected';
  createdAt: Date;
}

/**
 * Content bundle metadata
 */
export interface ContentBundle {
  type: ContentType;
  subtype?: RadarSubtype;
  frontmatter: Record<string, any>;
  content: string;
  imagePrompts: string[];
  validationStatus: ValidationStatus;
  reviewStatus: ReviewStatus;
  createdAt: Date;
  sessions: ReviewSession[];
}

/**
 * Blog post frontmatter (from validate-blog-post.sh)
 */
export interface BlogFrontmatter {
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  content_type?: BlogContentType;
  tags?: string[];
  categories?: string[];
  featured_image?: string;
  draft?: boolean;
  attribution?: string;
  source_url?: string;
}

/**
 * Portfolio frontmatter (from validate-portfolio-frontmatter.js)
 */
export interface PortfolioFrontmatter {
  title: string;
  date: string; // YYYY-MM-DD
  draft: boolean;
  description: string;
  client: string;
  technologies: string[];
  completion_date: string; // YYYY-MM
  category: string;
  github_url?: string;
  live_url?: string;
}

/**
 * Tech radar metadata (from radar metadata structure)
 */
export interface TechRadarFrontmatter {
  title: string;
  date: string; // YYYY-MM-DD
  draft: boolean;
  description: string;
  quadrant: string;
  ring: string;
  tags?: string[];
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  type: ContentType;
  audience: string[];
  toneGuidelines: string[];
  frontmatterSchema: Record<string, any>;
  outputDirectory: string;
  validationScripts: string[];
}

/**
 * Image prompt request
 */
export interface ImagePromptRequest {
  contentType: ContentType;
  subtype?: RadarSubtype;
  contentTitle: string;
  contentSummary: string;
  tone: string;
}

/**
 * Image prompt response
 */
export interface ImagePromptResponse {
  prompts: string[];
  metadata: {
    contentType: ContentType;
    generatedAt: Date;
    styleHints: string[];
  };
}
