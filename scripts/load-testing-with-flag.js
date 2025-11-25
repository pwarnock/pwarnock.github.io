#!/usr/bin/env bun

/**
 * Load Testing with Feature Flag Check
 *
 * Only runs k6 load tests if flags.load_testing.enabled = true
 * Usage: bun run scripts/load-testing-with-flag.js
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const FEATURE_FLAGS_FILE = 'data/feature-flags.toml';

function readFeatureFlags() {
  try {
    if (!existsSync(FEATURE_FLAGS_FILE)) {
      console.log('❌ Feature flags file not found');
      return null;
    }

    const content = readFileSync(FEATURE_FLAGS_FILE, 'utf8');
    const flags = {};

    let currentSection = '';
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1);
        if (currentSection.startsWith('flags.')) {
          const flagName = currentSection.replace('flags.', '');
          flags[flagName] = { enabled: false };
        }
      } else if (trimmed.includes('=') && currentSection.startsWith('flags.')) {
        const [key, value] = trimmed.split('=').map(s => s.trim());
        const flagName = currentSection.replace('flags.', '');

        if (key === 'enabled') {
          flags[flagName].enabled = value === 'true';
        }
      }
    }

    return flags;
  } catch (error) {
    console.error('❌ Error reading feature flags:', error.message);
    return null;
  }
}

function runK6Tests(scenarios = []) {
  console.log('🚀 Running k6 load tests...');
  console.log(`📊 Scenarios: ${scenarios.join(', ') || 'all'}`);

  return new Promise((resolve, reject) => {
    const k6Process = spawn('k6', ['run', 'scripts/load-testing.js'], {
      stdio: 'inherit',
      shell: true,
    });

    k6Process.on('close', code => {
      if (code === 0) {
        console.log('✅ Load tests completed successfully');
        resolve(code);
      } else {
        console.log(`❌ Load tests failed with exit code ${code}`);
        reject(new Error(`k6 exited with code ${code}`));
      }
    });

    k6Process.on('error', error => {
      console.error('❌ Failed to start k6:', error.message);
      reject(error);
    });
  });
}

function generateMockReport() {
  const mockReport = {
    timestamp: new Date().toISOString(),
    feature_flag_enabled: false,
    status: 'skipped',
    message: 'Load testing disabled by feature flag',
    mock_data: {
      scenarios: ['low_load', 'medium_load', 'high_load'],
      pages_tested: ['Homepage', 'Portfolio', 'Tools', 'Blog', 'About'],
      thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.1'],
      },
    },
  };

  console.log('📋 MOCK LOAD TESTING REPORT:');
  console.log(JSON.stringify(mockReport, null, 2));

  return mockReport;
}

async function main() {
  console.log('🔍 Load Testing with Feature Flag Check');
  console.log('=====================================');

  const flags = readFeatureFlags();

  if (!flags) {
    console.log('❌ Could not read feature flags');
    process.exit(1);
  }

  const loadTestingFlag = flags.load_testing;

  if (!loadTestingFlag) {
    console.log('⚠️  Load testing feature flag not found');
    process.exit(1);
  }

  console.log(`🏳️  Load Testing Flag: ${loadTestingFlag.enabled ? 'ENABLED' : 'DISABLED'}`);

  if (!loadTestingFlag.enabled) {
    console.log('⏭️  Skipping load tests (feature flag disabled)');
    console.log('');
    console.log('To enable load testing:');
    console.log('1. Edit data/feature-flags.toml');
    console.log('2. Set flags.load_testing.enabled = true');
    console.log('3. Install k6: brew install k6');
    console.log('4. Run: bun run scripts/load-testing-with-flag.js');
    console.log('');

    // Generate mock report for CI consistency
    generateMockReport();
    process.exit(0);
  }

  // Check if k6 is available
  try {
    spawn('k6', ['version'], { stdio: 'pipe' });
    console.log('✅ k6 found');
  } catch (error) {
    console.log('❌ k6 not found. Install with: brew install k6');
    console.log('📖 Documentation: https://k6.io/docs/');
    process.exit(1);
  }

  // Check if Hugo is running (required for load testing)
  try {
    const response = await fetch('http://localhost:1313/');
    if (!response.ok) {
      console.log('❌ Hugo development server not running on http://localhost:1313');
      console.log('Start with: bun run dev');
      process.exit(1);
    }
    console.log('✅ Hugo development server detected');
  } catch (error) {
    console.log('❌ Hugo development server not running on http://localhost:1313');
    console.log('Start with: bun run dev');
    process.exit(1);
  }

  try {
    // Run actual load tests
    await runK6Tests();
    console.log('🎉 Load testing completed successfully');
  } catch (error) {
    console.error('❌ Load testing failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}
