import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const versionFile = path.join(dataDir, 'version.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Get version from package.json
let version = '0.0.0';
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  version = packageJson.version;
} catch (e) {
  console.warn('Could not read package.json version');
}

// Get git hash
let hash = 'dev';
try {
  hash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.warn('Could not get git hash, using default');
}

const data = {
  version,
  hash,
  buildDate: new Date().toISOString()
};

fs.writeFileSync(versionFile, JSON.stringify(data, null, 2));
console.log(`✅ Generated build version: ${version} (${hash})`);
