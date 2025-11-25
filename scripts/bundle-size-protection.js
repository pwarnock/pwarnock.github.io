#!/usr/bin/env bun

/**
 * Bundle Size Protection Script
 *
 * Fails CI if bundle sizes grow >5% compared to baseline
 * Usage: bun run scripts/bundle-size-protection.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

const BASELINE_FILE = '.bundle-baseline.json';
const THRESHOLD_PERCENT = 5; // Fail if >5% growth

function getBundleSize(path) {
  try {
    const { statSync } = require('fs');
    const stats = statSync(path);
    return Math.round(stats.size / 1024);
  } catch (error) {
    console.warn(`⚠️  Could not read ${path}: ${error.message}`);
    return null;
  }
}

function getCurrentBundles() {
  const bundles = [];

  // CSS bundle
  const cssSize = getBundleSize('public/css/main.css');
  if (cssSize !== null) {
    bundles.push({ path: 'public/css/main.css', sizeKB: cssSize });
  }

  // JS bundles
  const jsFiles = [
    'public/js/remote-component.js',
    'public/js/analytics.js',
    'public/js/lit-3d-piano.js',
    'public/js/alpinejs.min.358d9afbb1ab5befa2f48061a30776e5bcd7707f410a606ba985f98bc3b1c034.js',
    'public/js/smart-iframe.js',
    'public/js/simple-greeting.js',
  ];

  jsFiles.forEach(file => {
    const size = getBundleSize(file);
    if (size !== null) {
      bundles.push({ path: file, sizeKB: size });
    }
  });

  return bundles;
}

function loadBaseline() {
  try {
    if (!existsSync(BASELINE_FILE)) {
      console.log(`📝 No baseline found at ${BASELINE_FILE}, creating new baseline`);
      return null;
    }
    const content = readFileSync(BASELINE_FILE, 'utf8');
    const baseline = JSON.parse(content);
    return baseline;
  } catch (error) {
    console.warn(`⚠️  Could not load baseline: ${error.message}`);
    return null;
  }
}

function saveBaseline(bundles) {
  const baseline = {
    timestamp: new Date().toISOString(),
    bundles,
  };
  writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
  console.log(`💾 Saved baseline with ${bundles.length} bundles`);
}

function compareBundles(current, baselineData) {
  let passed = true;

  console.log(`📊 Bundle Size Comparison:`);
  console.log(`========================`);

  // Create lookup for baseline sizes
  const baselineMap = new Map(baselineData.bundles.map(b => [b.path, b.sizeKB]));

  current.forEach(bundle => {
    const baselineSize = baselineMap.get(bundle.path);

    if (baselineSize === undefined) {
      console.log(`🆕 ${bundle.path}: ${bundle.sizeKB} KB (new bundle)`);
      return;
    }

    const growth = bundle.sizeKB - baselineSize;
    const growthPercent = baselineSize > 0 ? (growth / baselineSize) * 100 : 0;

    if (growthPercent > THRESHOLD_PERCENT) {
      console.log(
        `❌ ${bundle.path}: ${bundle.sizeKB} KB (+${growthPercent.toFixed(1)}% vs ${baselineSize} KB) - EXCEEDS ${THRESHOLD_PERCENT}% THRESHOLD`
      );
      passed = false;
    } else if (growthPercent > 0) {
      console.log(
        `⚠️  ${bundle.path}: ${bundle.sizeKB} KB (+${growthPercent.toFixed(1)}% vs ${baselineSize} KB) - within threshold`
      );
    } else if (growthPercent < 0) {
      console.log(
        `✅ ${bundle.path}: ${bundle.sizeKB} KB (${growthPercent.toFixed(1)}% vs ${baselineSize} KB) - improved`
      );
    } else {
      console.log(`✅ ${bundle.path}: ${bundle.sizeKB} KB (no change vs ${baselineSize} KB)`);
    }
  });

  // Check for missing bundles
  const currentMap = new Map(current.map(b => [b.path, b.sizeKB]));
  baselineData.bundles.forEach(bundle => {
    if (!currentMap.has(bundle.path)) {
      console.log(`➖ ${bundle.path}: REMOVED (was ${bundle.sizeKB} KB)`);
    }
  });

  return passed;
}

function main() {
  console.log(`🔍 Bundle Size Protection Check`);
  console.log(`=============================`);
  console.log(`Threshold: ${THRESHOLD_PERCENT}% max growth`);
  console.log(``);

  const currentBundles = getCurrentBundles();
  const baseline = loadBaseline();

  if (!baseline) {
    console.log(`📝 Creating initial baseline...`);
    saveBaseline(currentBundles);
    console.log(`✅ Baseline created. Future runs will compare against this baseline.`);
    process.exit(0);
  }

  console.log(`📈 Current vs Baseline:`);
  console.log(`Baseline: ${new Date(baseline.timestamp).toLocaleString()}`);
  console.log(``);

  const passed = compareBundles(currentBundles, baseline);

  console.log(``);
  if (passed) {
    console.log(`✅ All bundle sizes within ${THRESHOLD_PERCENT}% threshold`);
    process.exit(0);
  } else {
    console.log(
      `❌ Bundle size protection failed - some bundles exceeded ${THRESHOLD_PERCENT}% growth`
    );
    console.log(``);
    console.log(`To update baseline (if intentional):`);
    console.log(`  rm ${BASELINE_FILE} && bun run scripts/bundle-size-protection.js`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
