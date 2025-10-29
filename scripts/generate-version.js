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
const version = (branch === 'main' || branch === 'master') ? packageVersion : `${branch}-${shortHash}`;

// Remove 'v' prefix if present (template adds it)
const cleanVersion = version.startsWith('v') ? version.substring(1) : version;

// Create data file for Hugo
const dataDir = path.join(__dirname, '..', 'data');
const versionFile = path.join(dataDir, 'version.toml');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const content = `current = "${cleanVersion}"
branch = "${branch}"
hash = "${shortHash}"
`;

fs.writeFileSync(versionFile, content);
console.log(`✓ Generated version: ${version} (branch: ${branch})`);