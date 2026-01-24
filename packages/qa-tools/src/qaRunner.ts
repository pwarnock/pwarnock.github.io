/**
 * QA Execution Engine
 *
 * Executes steps for a given mode, with clear logging and exit codes.
 * Does not decide which mode to run; that is the selector's job.
 */

import { spawn } from 'child_process';
import { modes } from './qaConfig';
import { ModeId } from './qaSelector';

export interface RunOptions {
  modeId: ModeId;
  dryRun?: boolean; // if true, only print what would run
}

/**
 * Run the specified mode
 */
export async function runMode({ modeId, dryRun = false }: RunOptions): Promise<void> {
  const mode = modes[modeId];
  if (!mode) {
    console.error(`❌ Unknown mode: ${modeId}`);
    process.exit(1);
  }

  // Header
  console.log(`🔧 QA Mode: ${mode.name} (${mode.id})`);
  console.log(`📝 Description: ${mode.description}`);
  console.log('');

  // Step plan
  console.log('📋 Steps to run:');
  mode.steps.forEach((step, idx) => {
    const critical = step.critical ? ' (critical)' : '';
    console.log(`  ${idx + 1}) ${step.id}${critical} -> ${step.command}`);
  });
  console.log('');

  if (dryRun) {
    console.log('🔍 Dry run: no commands executed.');
    return;
  }

  // Execute steps sequentially
  for (const step of mode.steps) {
    console.log(
      `▶️  Starting step [${mode.steps.indexOf(step) + 1}/${mode.steps.length}]: ${step.id} — ${step.description}`
    );
    try {
      await runCommand(step.command);
      console.log(`✅ Step ${step.id} succeeded.`);
    } catch (err) {
      console.error(`❌ Step ${step.id} failed.`);
      if (step.critical) {
        console.error(`🛑 Critical step failed; aborting QA pipeline.`);
        process.exit(1);
      } else {
        console.warn(`⚠️  Non-critical step failed; continuing.`);
      }
    }
  }

  console.log(`🎉 All steps succeeded for mode ${mode.id}.`);
}

/**
 * Helper: run a shell command and reject on non-zero exit
 */
function runCommand(command: string): Promise<void> {
  const [cmd, ...args] = command.split(' ');
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    child.on('error', err => {
      reject(err);
    });
  });
}
