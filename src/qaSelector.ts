/**
 * QA Mode Selector (pure logic)
 *
 * Determines which QA mode to run based on changed files and path rules.
 * Does not execute any commands; only returns a decision.
 */

import { minimatch } from 'minimatch';
import { pathRules, defaultMode, fallbackOnErrorMode } from './qaConfig';

export type ModeId = 'content_fast_path' | 'full';

export interface SelectionResult {
  selectedMode: ModeId;
  reason: string;
  details: {
    matchedAllowed: string[];
    matchedNonContent: string[];
    matchedA11yCriticalData: string[];
    qaPolicyVersion: string;
    a11yPolicyVersion: string;
  };
}

/**
 * Main selector function
 */
export function selectMode({
  changedFiles,
  qaPolicyVersion,
  a11yPolicyVersion,
}: {
  changedFiles: string[];
  qaPolicyVersion: string;
  a11yPolicyVersion: string;
}): SelectionResult {
  // Defensive: if no changed files, default to full (or decide to exit clean)
  if (changedFiles.length === 0) {
    return {
      selectedMode: defaultMode,
      reason: 'No changed files detected; defaulting to full for safety.',
      details: {
        matchedAllowed: [],
        matchedNonContent: [],
        matchedA11yCriticalData: [],
        qaPolicyVersion,
        a11yPolicyVersion,
      },
    };
  }

  const matchedAllowed: string[] = [];
  const matchedNonContent: string[] = [];
  const matchedA11yCriticalData: string[] = [];

  for (const file of changedFiles) {
    // A11y-critical data patterns take precedence (check FIRST)
    if (matchesAny(file, pathRules.a11yCriticalDataPatterns)) {
      matchedA11yCriticalData.push(file);
      continue;
    }

    // Non-content patterns force full (check SECOND)
    if (matchesAny(file, pathRules.nonContentPatterns)) {
      matchedNonContent.push(file);
      continue;
    }

    // Content-eligible patterns (check THIRD)
    if (matchesAny(file, pathRules.allowedContentPatterns)) {
      matchedAllowed.push(file);
      continue;
    }

    // Unknown patterns: treat as non-content for safety (LAST)
    matchedNonContent.push(file);
  }

  // Decision logic
  let selectedMode: ModeId;
  let reason: string;

  if (matchedA11yCriticalData.length > 0) {
    selectedMode = 'full';
    reason = `A11y-critical data changed (${matchedA11yCriticalData.length} file(s)).`;
  } else if (matchedNonContent.length > 0) {
    selectedMode = 'full';
    reason = `Non-content or unknown paths changed (${matchedNonContent.length} file(s)).`;
  } else if (matchedAllowed.length === changedFiles.length) {
    selectedMode = 'content_fast_path';
    reason = `All changes are content-eligible (${matchedAllowed.length} file(s)).`;
  } else {
    selectedMode = fallbackOnErrorMode;
    reason = 'Unclassified changes detected; defaulting to full for safety.';
  }

  return {
    selectedMode,
    reason,
    details: {
      matchedAllowed,
      matchedNonContent,
      matchedA11yCriticalData,
      qaPolicyVersion,
      a11yPolicyVersion,
    },
  };
}

/**
 * Helper: check if a file matches any pattern in a list
 */
function matchesAny(file: string, patterns: readonly string[]): boolean {
  return patterns.some(pattern => minimatch(file, pattern));
}
