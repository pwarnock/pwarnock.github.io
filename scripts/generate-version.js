#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current branch and commit hash
const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
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
  // Ensure data directory exists with proper permissions
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
    console.log(`✓ Created data directory`);
  }

  const content = `current = "${cleanVersion}"
branch = "${branch}"
hash = "${shortHash}"
`;

  // Write file with explicit permissions
  fs.writeFileSync(versionFile, content, { mode: 0o644 });
  console.log(`✓ Generated version file: ${version} (branch: ${branch})`);

  // Verify file was created
  if (fs.existsSync(versionFile)) {
    console.log(`✓ Version file exists and is readable`);
  } else {
    throw new Error('Version file was not created');
  }

} catch (error) {
  console.error(`❌ Error creating version file:`, error.message);
  console.error(`Data dir: ${dataDir}`);
  console.error(`Version file: ${versionFile}`);
  console.error(`Current working directory: ${process.cwd()}`);
  process.exit(1);
}
