/**
 * Agent Configuration
 *
 * Configuration for each content agent type
 */

import type { AgentConfig } from '../types/index.js';

/**
 * Blog post agent configuration
 */
export const blogAgentConfig: AgentConfig = {
  type: 'blog',
  audience: [
    'General readership',
    'Technical professionals',
    'People interested in personal thoughts and insights'
  ],
  toneGuidelines: [
    'Personal and conversational',
    'Use "I" statements for personal perspective',
    'Share authentic thoughts and experiences',
    'Be concise but thorough',
    'Optimize for SEO/AEO discoverability'
  ],
  frontmatterSchema: {
    required: ['title', 'date', 'summary'],
    optional: ['tags', 'categories', 'featured_image', 'draft', 'content_type', 'attribution', 'source_url']
  },
  outputDirectory: 'content/blog/posts',
  validationScripts: ['scripts/validate-blog-post.sh']
};

/**
 * Portfolio agent configuration
 */
export const portfolioAgentConfig: AgentConfig = {
  type: 'portfolio',
  audience: [
    'Recruiters and hiring managers',
    'Technical peers and colleagues',
    'Decision makers for contract opportunities'
  ],
  toneGuidelines: [
    'Professional and achievement-focused',
    'Highlight impact and technical depth',
    'Use metrics and quantifiable results',
    'Showcase problem-solving skills',
    'Demonstrate value delivered'
  ],
  frontmatterSchema: {
    required: ['title', 'date', 'draft', 'description', 'client', 'technologies', 'completion_date', 'category'],
    optional: ['github_url', 'live_url']
  },
  outputDirectory: 'content/portfolio',
  validationScripts: ['scripts/validate-portfolio-frontmatter.js']
};

/**
 * Tech radar agent configuration
 */
export const techRadarAgentConfig: AgentConfig = {
  type: 'tech-radar',
  audience: [
    'Senior technical decision-makers',
    'Contract evaluators',
    'Technical peers',
    'Product managers and adjacent roles'
  ],
  toneGuidelines: [
    'Opinionated but balanced',
    'Provide technical depth and context',
    'Consider practical adoption implications',
    'Assess maturity and ecosystem support',
    'Be forward-looking but realistic'
  ],
  frontmatterSchema: {
    required: ['title', 'date', 'draft', 'description', 'quadrant', 'ring'],
    optional: ['tags']
  },
  outputDirectory: 'content/tools',
  validationScripts: [] // TODO: Add tech radar validation when available
};

/**
 * Get agent configuration by type
 */
export function getAgentConfig(type: 'blog'): typeof blogAgentConfig;
export function getAgentConfig(type: 'portfolio'): typeof portfolioAgentConfig;
export function getAgentConfig(type: 'tech-radar'): typeof techRadarAgentConfig;
export function getAgentConfig(type: string): AgentConfig {
  switch (type) {
    case 'blog':
      return blogAgentConfig;
    case 'portfolio':
      return portfolioAgentConfig;
    case 'tech-radar':
      return techRadarAgentConfig;
    default:
      throw new Error(`Unknown agent type: ${type}`);
  }
}
