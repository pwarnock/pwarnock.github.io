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
  projectRoot: string;
}

const DEFAULT_BASE_DIR = '.agents';

let currentConfig: AgentPathsConfig | null = null;

/**
 * Get the current paths configuration
 */
export function getAgentPaths(projectRoot: string = process.cwd()): AgentPathsConfig {
  if (currentConfig && currentConfig.projectRoot === projectRoot) {
    return currentConfig;
  }

  const baseDir = process.env.AGENT_DATA_DIR || DEFAULT_BASE_DIR;

  return {
    baseDir,
    projectRoot,
    styleDocsDir: path.join(projectRoot, baseDir, 'style-docs'),
    sessionsDir: path.join(projectRoot, baseDir, 'sessions'),
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
  };

  return currentConfig;
}

/**
 * Reset to default configuration
 */
export function resetAgentPaths(): void {
  currentConfig = null;
}
