#!/usr/bin/env bun

/**
 * Bundle Analysis Script
 * Analyzes CSS and JS bundle sizes for performance monitoring
 */

import { readFileSync, statSync } from 'fs';

const PERF_CONFIG = './data/performance.toml';

// Read performance configuration
function readPerfConfig() {
  try {
    const content = readFileSync(PERF_CONFIG, 'utf8');
    // Simple TOML parsing for our specific needs
    const lines = content.split('\n');
    const config = {};

    let currentSection = '';
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1);
        config[currentSection] = {};
      } else if (line.includes('=') && currentSection) {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key.includes('max_') && value.includes('_size_kb')) {
          config[currentSection][key] = parseInt(value);
        }
      }
    });

    return config;
  } catch (error) {
    console.warn('Could not read performance config:', error.message);
    return {};
  }
}

// Analyze CSS bundle
function analyzeCSS() {
  const cssPath = 'public/css/main.css';

  try {
    const stats = statSync(cssPath);
    const sizeKB = Math.round(stats.size / 1024);

    console.log(`📊 CSS Bundle Analysis:`);
    console.log(`   Size: ${sizeKB} KB`);
    console.log(`   Path: ${cssPath}`);

    // Check against performance limits
    const config = readPerfConfig();
    if (
      config.bundle_analysis?.max_css_size_kb &&
      sizeKB > config.bundle_analysis.max_css_size_kb
    ) {
      console.log(
        `⚠️  WARNING: CSS bundle exceeds ${config.bundle_analysis.max_css_size_kb}KB limit`
      );
      console.log(`   Recommendation: Implement CSS code splitting`);
    } else {
      console.log(`✅ CSS bundle size within acceptable limits`);
    }

    return { sizeKB, path: cssPath };
  } catch (error) {
    console.error(`❌ Could not analyze CSS bundle: ${error.message}`);
    return null;
  }
}

// Analyze JS bundles
function analyzeJS() {
  const jsPaths = ['public/js/main.js', 'public/js/bundle.js'];

  console.log(`📊 JavaScript Bundle Analysis:`);

  jsPaths.forEach(path => {
    try {
      const stats = statSync(path);
      const sizeKB = Math.round(stats.size / 1024);

      console.log(`   ${path}: ${sizeKB} KB`);

      const config = readPerfConfig();
      if (
        config.bundle_analysis?.max_js_size_kb &&
        sizeKB > config.bundle_analysis.max_js_size_kb
      ) {
        console.log(
          `⚠️  WARNING: JS bundle exceeds ${config.bundle_analysis.max_js_size_kb}KB limit`
        );
      }
    } catch (error) {
      // File doesn't exist, which is expected for some paths
    }
  });
}

// Main analysis
function main() {
  console.log(`🔍 Bundle Analysis Report`);
  console.log(`========================`);

  const cssAnalysis = analyzeCSS();
  analyzeJS();

  console.log(`\n📈 Recommendations:`);

  if (cssAnalysis) {
    if (cssAnalysis.sizeKB > 100) {
      console.log(`   • Consider CSS code splitting for faster initial render`);
    }
    if (cssAnalysis.sizeKB > 150) {
      console.log(`   • Implement critical CSS extraction`);
    }
  }

  console.log(`   • Monitor bundle sizes in CI/CD pipeline`);
  console.log(`   • Use lazy loading for non-critical CSS`);
  console.log(`   • Implement tree shaking for unused CSS`);
}

// Run analysis
main();
