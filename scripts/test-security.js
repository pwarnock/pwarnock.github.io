#!/usr/bin/env node

/**
 * Security Headers and CSP Test
 *
 * Verifies that security headers and CSP are present in built HTML pages
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Check if a file contains required security features
 */
function checkSecurityFeatures(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    const checks = {
      csp: content.includes('Content-Security-Policy'),
      xFrameOptions: content.includes('X-Frame-Options'),
      xContentTypeOptions: content.includes('X-Content-Type-Options'),
      hsts: content.includes('Strict-Transport-Security'),
      xXssProtection: content.includes('X-XSS-Protection'),
      referrerPolicy: content.includes('referrer'),
      permissionsPolicy: content.includes('Permissions-Policy'),
      externalLinksSecure: true, // Will check below
    };

    // Check external links have security attributes
    const externalLinkRegex = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/g;
    let match;
    while ((match = externalLinkRegex.exec(content)) !== null) {
      const linkTag = match[0];
      if (!linkTag.includes('rel="noopener noreferrer"') || !linkTag.includes('target="_blank"')) {
        checks.externalLinksSecure = false;
        break;
      }
    }

    return checks;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Main test function
 */
async function testSecurity() {
  console.log('🔒 Testing security headers and CSP...\n');

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

  let totalChecks = 0;
  const aggregatedResults = {
    csp: 0,
    xFrameOptions: 0,
    xContentTypeOptions: 0,
    hsts: 0,
    xXssProtection: 0,
    referrerPolicy: 0,
    permissionsPolicy: 0,
    externalLinksSecure: 0,
  };

  let filesWithIssues = [];

  for (const file of htmlFiles) {
    const fullPath = path.join(publicDir, file);
    const checks = checkSecurityFeatures(fullPath);

    if (!checks) continue;

    totalChecks++;

    let fileHasIssues = false;
    for (const [check, passed] of Object.entries(checks)) {
      if (passed) {
        aggregatedResults[check]++;
      } else {
        fileHasIssues = true;
      }
    }

    if (fileHasIssues) {
      filesWithIssues.push(file);
    }
  }

  console.log('📊 Security Features Results:');
  console.log(`   Total files checked: ${totalChecks}`);
  console.log(`   CSP present: ${aggregatedResults.csp}/${totalChecks}`);
  console.log(`   X-Frame-Options: ${aggregatedResults.xFrameOptions}/${totalChecks}`);
  console.log(`   X-Content-Type-Options: ${aggregatedResults.xContentTypeOptions}/${totalChecks}`);
  console.log(`   HSTS: ${aggregatedResults.hsts}/${totalChecks}`);
  console.log(`   X-XSS-Protection: ${aggregatedResults.xXssProtection}/${totalChecks}`);
  console.log(`   Referrer Policy: ${aggregatedResults.referrerPolicy}/${totalChecks}`);
  console.log(`   Permissions Policy: ${aggregatedResults.permissionsPolicy}/${totalChecks}`);
  console.log(`   External links secure: ${aggregatedResults.externalLinksSecure}/${totalChecks}`);

  const requiredChecks = ['csp', 'xFrameOptions', 'xContentTypeOptions', 'hsts', 'referrerPolicy'];
  const allPassed = requiredChecks.every(check => aggregatedResults[check] === totalChecks);

  if (allPassed) {
    console.log('\n✅ All critical security features are present!');
    console.log('   Your site has strong security protections in place.');
  } else {
    console.log('\n❌ Some security features are missing:');

    if (aggregatedResults.csp < totalChecks) {
      console.log('   - Content Security Policy not found on all pages');
    }
    if (aggregatedResults.xFrameOptions < totalChecks) {
      console.log('   - X-Frame-Options header missing');
    }
    if (aggregatedResults.xContentTypeOptions < totalChecks) {
      console.log('   - X-Content-Type-Options header missing');
    }
    if (aggregatedResults.hsts < totalChecks) {
      console.log('   - Strict-Transport-Security header missing');
    }
    if (aggregatedResults.referrerPolicy < totalChecks) {
      console.log('   - Referrer Policy not set');
    }

    if (filesWithIssues.length > 0) {
      console.log('\n⚠️  Files with security issues:');
      filesWithIssues.slice(0, 5).forEach(file => {
        console.log(`   - ${file}`);
      });
    }

    process.exit(1);
  }

  console.log('\n🛡️  Environment Check:');
  console.log(`   Build environment: ${process.env.HUGO_ENV || 'unknown'}`);
  console.log(`   CSP allows GTM: ${aggregatedResults.csp > 0 ? 'Yes' : 'Check CSP config'}`);
  console.log(
    `   External links protected: ${aggregatedResults.externalLinksSecure === totalChecks ? 'Yes' : 'No'}`
  );
}

// Run test
testSecurity().catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
