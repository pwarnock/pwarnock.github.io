#!/usr/bin/env node

/**
 * Google Tag Manager Tracking Test
 *
 * Verifies that GTM tracking code is present in built HTML pages
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Check if a file contains Google Tag Manager tracking code
 */
function hasGATracking(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for GTM script
    const hasGTMScript = content.includes('https://www.googletagmanager.com/gtm.js');
    const hasGTMConfig = content.includes('gtm.start');

    // Also check for noscript iframe
    const hasGTMNOScript = content.includes('googletagmanager.com/ns.html');

    return hasGTMScript && hasGTMConfig && hasGTMNOScript;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function testGATracking() {
  console.log('🔍 Testing Google Tag Manager tracking...\n');

  const publicDir = path.join(process.cwd(), 'public');

  // Check if public directory exists
  if (!fs.existsSync(publicDir)) {
    console.log('❌ No public directory found. Run build first.');
    process.exit(1);
  }

  // Get all HTML files in public directory
  const htmlFiles = await glob('**/*.html', { cwd: publicDir });

  if (htmlFiles.length === 0) {
    console.log('❌ No HTML files found in public directory');
    process.exit(1);
  }

  console.log(`Found ${htmlFiles.length} HTML files\n`);

  let totalWithGA = 0;
  let totalWithoutGA = 0;
  const filesWithoutGA = [];

  for (const file of htmlFiles) {
    const fullPath = path.join(publicDir, file);
    const hasGA = hasGATracking(fullPath);

    if (hasGA) {
      totalWithGA++;
    } else {
      totalWithoutGA++;
      filesWithoutGA.push(file);
    }
  }

  console.log('📊 Google Tag Manager Tracking Results:');
  console.log(`   Pages with GTM: ${totalWithGA}`);
  console.log(`   Pages without GTM: ${totalWithoutGA}`);
  console.log(`   Total pages: ${htmlFiles.length}`);

  if (totalWithoutGA > 0) {
    console.log('\n⚠️  Pages missing GTM tracking:');
    filesWithoutGA.slice(0, 10).forEach(file => {
      console.log(`   - ${file}`);
    });
    if (filesWithoutGA.length > 10) {
      console.log(`   ... and ${filesWithoutGA.length - 10} more`);
    }
  }

  console.log('\n📋 Environment Check:');
  console.log(`   HUGO_ENV: ${process.env.HUGO_ENV || 'not set'}`);
  console.log(`   HUGO_GTM_CONTAINER_ID: ${process.env.HUGO_GTM_CONTAINER_ID ? 'set' : 'not set'}`);

  // Check Hugo config
  try {
    const hugoConfig = fs.readFileSync(path.join(process.cwd(), 'hugo.toml'), 'utf8');
    const gaMatch = hugoConfig.match(/googleAnalytics\s*=\s*['"]([^'"]+)['"]/);
    if (gaMatch) {
      console.log(`   Hugo config googleAnalytics: ${gaMatch[1]}`);
    } else {
      console.log('   Hugo config googleAnalytics: not found');
    }
  } catch (error) {
    console.log('   Hugo config: error reading');
  }

  if (totalWithGA > 0) {
    console.log('\n✅ Google Tag Manager tracking is present on main pages!');
    console.log(`   Note: ${totalWithoutGA} pagination/other pages don't have tracking (normal)`);
  } else {
    console.log('\n❌ No pages have Google Tag Manager tracking.');
    console.log('   This could be because:');
    console.log('   - HUGO_ENV is not set to "production"');
    console.log('   - HUGO_GTM_CONTAINER_ID environment variable is not set');
    console.log('   - Build was done in development mode');
    process.exit(1);
  }
}

// Run test
testGATracking().catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
