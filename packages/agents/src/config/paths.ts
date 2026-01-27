/**
 * Agent Paths Configuration
 *
 * Configurable paths for agent storage using .agents/ directory.
 */

import path from 'path';

export interface AgentPathsConfig {
  baseDir: string;
  styleDocsDir: string;
  sessionsDir: string;
  draftsDir: string;
  projectRoot: string;
}

const DEFAULT_BASE_DIR = '.agents';

let currentConfig: AgentPathsConfig | null = null;

/**
 * Get the current paths configuration
 *
 * If configureAgentPaths() has been called, returns that configuration.
 * Otherwise, computes paths based on the given projectRoot (defaults to cwd).
 */
export function getAgentPaths(projectRoot?: string): AgentPathsConfig {
  // If explicitly configured, always return the configured paths
  if (currentConfig) {
    return currentConfig;
  }

  // Otherwise compute from projectRoot (or cwd)
  const root = projectRoot || process.cwd();
  const baseDir = process.env.AGENT_DATA_DIR || DEFAULT_BASE_DIR;

  return {
    baseDir,
    projectRoot: root,
    styleDocsDir: path.join(root, baseDir, 'style-docs'),
    sessionsDir: path.join(root, baseDir, 'sessions'),
    draftsDir: path.join(root, baseDir, 'drafts'),
  };
}

/**
 * Configure custom paths
 */
export function configureAgentPaths(
  options: Partial<AgentPathsConfig> & { projectRoot?: string }
): AgentPathsConfig {
  const projectRoot = options.projectRoot || process.cwd();
  const baseDir = options.baseDir || DEFAULT_BASE_DIR;

  currentConfig = {
    baseDir,
    projectRoot,
    styleDocsDir: options.styleDocsDir || path.join(projectRoot, baseDir, 'style-docs'),
    sessionsDir: options.sessionsDir || path.join(projectRoot, baseDir, 'sessions'),
    draftsDir: options.draftsDir || path.join(projectRoot, baseDir, 'drafts'),
  };

  return currentConfig;
}

/**
 * Reset to default configuration
 */
export function resetAgentPaths(): void {
  currentConfig = null;
}
