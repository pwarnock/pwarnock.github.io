#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current branch and commit hash
// Use GITHUB_REF_NAME if available (GitHub Actions), otherwise git command
const branch =
  process.env.GITHUB_REF_NAME || execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const shortHash = execSync('git rev-parse --short HEAD').toString().trim();

// Get package version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageVersion = packageJson.version;

// Create data file for Hugo
const dataDir = path.join(__dirname, '..', 'data');
const versionFile = path.join(dataDir, 'version.toml');

// Check if version.toml already exists and has correct version
let existingVersion = null;
if (fs.existsSync(versionFile)) {
  try {
    const versionContent = fs.readFileSync(versionFile, 'utf8');
    const versionMatch = versionContent.match(/^current\s*=\s*"([^"]+)"/);
    if (versionMatch) {
      existingVersion = versionMatch[1];
    }
  } catch (err) {
    console.log('⚠️ Could not read existing version.toml:', err.message);
  }
}

// Determine version to use - always use package.json version on main branch for consistency
const version =
  branch === 'main' || branch === 'master' ? packageVersion : `${branch}-${shortHash}`;

// Remove 'v' prefix if present (template adds it)
const cleanVersion = version.startsWith('v') ? version.substring(1) : version;

console.log(`📁 Creating data directory: ${dataDir}`);
console.log(`📄 Writing version file: ${versionFile}`);

try {
  // Ensure data directory exists and is writable
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
    console.log(`✓ Created data directory`);
  } else {
    console.log(`✓ Data directory already exists`);
    // Try to set permissions on existing directory
    try {
      fs.chmodSync(dataDir, 0o755);
      console.log(`✓ Set directory permissions`);
    } catch (permError) {
      console.log(`⚠️ Could not set directory permissions: ${permError.message}`);
    }
  }

  // Write version file
  const versionContent = `current = "${cleanVersion}"\nbranch = "${branch}"\nhash = "${shortHash}"\n`;
  fs.writeFileSync(versionFile, versionContent, 'utf8');
  console.log(`✓ Generated version file: ${cleanVersion} (branch: ${branch})`);

  // Verify file was written correctly
  if (fs.existsSync(versionFile)) {
    const stats = fs.statSync(versionFile);
    console.log(`✓ Version file exists (size: ${stats.size} bytes)`);

    // Verify content
    const writtenContent = fs.readFileSync(versionFile, 'utf8');
    if (writtenContent.includes(cleanVersion)) {
      console.log(`✓ Version file content verified`);
    } else {
      console.log(`❌ Version file content mismatch!`);
      process.exit(1);
    }
  } else {
    console.log(`❌ Version file not created!`);
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Failed to create version file: ${error.message}`);
  process.exit(1);
}
