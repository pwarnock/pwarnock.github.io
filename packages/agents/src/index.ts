/**
 * @pwarnock/agents
 *
 * Content generation agents for blog posts, portfolio entries, and tech radar items.
 */

export { BlogAgent } from './blog/blog-agent.js';
export type { BlogPostRequest, BlogPostResult } from './blog/blog-agent.js';

export { PortfolioAgent } from './portfolio/portfolio-agent.js';
export type { PortfolioGenerationRequest, PortfolioGenerationResult } from './portfolio/portfolio-agent.js';

export { TechRadarAgent } from './tech-radar/tech-radar-agent.js';
export type { TechRadarOptions, TechRadarResult } from './tech-radar/tech-radar-agent.js';

export { TodayAgent } from './today/today-agent.js';
export type { DigestResult, TodayResult, BeadsIssue, GroupedIssues } from './today/today-agent.js';

export { TaskCreateAgent } from './task-create/task-create-agent.js';
export type { TaskCreateRequest, TaskCreateResult } from './task-create/task-create-agent.js';

export { LearningDigestAgent } from './learning-digest/learning-digest-agent.js';
export type {
  SourceDefinition,
  ParsedItem,
  SourceResult,
  DigestOptions,
  DigestResult as LearningDigestResult,
  ParserType
} from './learning-digest/learning-digest-agent.js';

export { VoiceLearningSystem } from './core/voice-learning.js';
export { HugoIntegration } from './core/hugo-integration.js';
export { ImagePromptGenerator } from './core/image-prompt-generator.js';
export { ReviewWorkflow } from './core/review-workflow.js';
export { Validator } from './utils/validation.js';

export * from './types/index.js';
