#!/usr/bin/env -S bun
/**
 * QA CLI entrypoint
 *
 * Usage:
 *   bun run qa:auto
 *   bun run qa:content
 *   bun run qa:full
 *
 * Environment:
 *   QA_BASE_REF (default: origin/main)
 *   QA_CHANGED_FILES (optional; newline-separated)
 *   QA_FORCE_MODE (optional: full)
 */

import { execSync } from 'child_process';
import { selectMode } from './qaSelector';
import { runMode } from './qaRunner';
import { qaPolicyVersion, a11yPolicyVersion } from './qaConfig';

function getChangedFiles(): string[] {
  // Allow override for testing or custom workflows
  if (process.env.QA_CHANGED_FILES) {
    return process.env.QA_CHANGED_FILES.trim().split('\n').filter(Boolean);
  }
  const baseRef = process.env.QA_BASE_REF ?? 'origin/main';
  try {
    const out = execSync(`git diff --name-only ${baseRef}...HEAD`, { encoding: 'utf-8' });
    return out.trim().split('\n').filter(Boolean);
  } catch (err) {
    console.error('❌ Failed to compute changed files via git.');
    console.error(err);
    process.exit(1);
  }
}

function main() {
  const command = process.argv[2];
  if (!command || !['auto', 'content', 'full'].includes(command)) {
    console.error('Usage: bun run qa:{auto|content|full}');
    process.exit(1);
  }

  // Header
  console.log(`🔧 QA Policy Version: ${qaPolicyVersion}`);
  console.log(`♿ A11y Policy Version: ${a11yPolicyVersion}`);
  console.log('');

  // Mode selection
  let modeId: 'content_fast_path' | 'full' = 'full'; // default to full
  let reason: string | undefined;

  if (command === 'auto') {
    const changedFiles = getChangedFiles();
    const selection = selectMode({
      changedFiles,
      qaPolicyVersion,
      a11yPolicyVersion,
    });
    modeId = selection.selectedMode;
    reason = selection.reason;
    // Log decision
    console.log(`📂 Base ref: ${process.env.QA_BASE_REF ?? 'origin/main'}`);
    console.log(`📄 Changed files: ${changedFiles.length}`);
    console.log(`🎯 Mode selected: ${selection.selectedMode}`);
    console.log(`📝 Reason: ${selection.reason}`);
    console.log('');
  } else if (command === 'content') {
    modeId = 'content_fast_path';
    reason = undefined;
    console.log('🎯 Mode forced: Content Fast-Path QA');
    console.log('');
  } else if (command === 'full') {
    modeId = 'full';
    reason = undefined;
    console.log('🎯 Mode forced: Full QA');
    console.log('');
  }

  // Global override
  if (process.env.QA_FORCE_MODE === 'full') {
    console.log('⚠️  QA_FORCE_MODE=full detected: forcing Full QA.');
    modeId = 'full';
    reason = 'Forced by QA_FORCE_MODE=full.';
    console.log('');
  }

  // Run
  runMode({ modeId });
}

main();
