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

// Determine version to use
const version =
  branch === 'main' || branch === 'master' ? packageVersion : `${branch}-${shortHash}`;

// Remove 'v' prefix if present (template adds it)
const cleanVersion = version.startsWith('v') ? version.substring(1) : version;

// Create data file for Hugo
const dataDir = path.join(__dirname, '..', 'data');
const versionFile = path.join(dataDir, 'version.toml');

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

  const content = `current = "${cleanVersion}"
branch = "${branch}"
hash = "${shortHash}"
`;

  // Remove existing file if it exists (to avoid permission issues)
  if (fs.existsSync(versionFile)) {
    try {
      fs.unlinkSync(versionFile);
      console.log(`✓ Removed existing version file`);
    } catch (removeError) {
      console.log(`⚠️ Could not remove existing file: ${removeError.message}`);
    }
  }

  // Try to write file, if it fails, try alternative approach
  try {
    fs.writeFileSync(versionFile, content, { mode: 0o644 });
    console.log(`✓ Generated version file: ${version} (branch: ${branch})`);
  } catch (writeError) {
    console.log(`⚠️ Direct write failed, trying alternative approach: ${writeError.message}`);

    // Alternative: Use shell command to write file
    execSync(`printf '%s\\n' '${content.replace(/'/g, "'\\''")}' > "${versionFile}"`, {
      stdio: 'inherit',
    });
    console.log(
      `✓ Generated version file using alternative method: ${version} (branch: ${branch})`
    );
  }

  // Verify file was created and is readable
  if (fs.existsSync(versionFile)) {
    const stats = fs.statSync(versionFile);
    console.log(`✓ Version file exists (size: ${stats.size} bytes)`);

    // Try to read it back to verify content
    const readContent = fs.readFileSync(versionFile, 'utf8');
    if (readContent.includes(cleanVersion)) {
      console.log(`✓ Version file content verified`);
    } else {
      console.log(`⚠️ Version file content may be incorrect`);
    }
  } else {
    throw new Error('Version file was not created');
  }
} catch (error) {
  console.error(`❌ Error creating version file:`, error.message);
  console.error(`Data dir: ${dataDir}`);
  console.error(`Version file: ${versionFile}`);
  console.error(`Current working directory: ${process.cwd()}`);

  // Try to list directory contents for debugging
  try {
    const files = fs.readdirSync(dataDir);
    console.error(`Data directory contents: [${files.join(', ')}]`);
  } catch (listError) {
    console.error(`Could not list data directory: ${listError.message}`);
  }

  process.exit(1);
}
