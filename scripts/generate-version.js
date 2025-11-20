#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get package version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Get git hash for footer
const shortHash = execSync('git rev-parse --short HEAD').toString().trim();

// Create data file for Hugo
const dataDir = path.join(__dirname, '..', 'data');
const versionFile = path.join(dataDir, 'version.toml');

console.log(`📁 Creating data directory: ${dataDir}`);
console.log(`📄 Writing version file: ${versionFile}`);

try {
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write version file
  const versionContent = `current = "${version}"\nhash = "${shortHash}"\n`;
  fs.writeFileSync(versionFile, versionContent, 'utf8');
  console.log(`✓ Generated version file: ${version} (${shortHash})`);
} catch (error) {
  console.error(`❌ Failed to create version file: ${error.message}`);
  process.exit(1);
}
