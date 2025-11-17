#!/usr/bin/env node

/**
 * Automatic Semantic Versioning Script
 * 
 * Analyzes commit changes to determine version bump:
 * - NEW FEATURE: bump minor (0.17.0 → 0.18.0)
 * - DEFAULT (bug fix, refactor, docs): bump patch (0.17.0 → 0.17.1)
 * 
 * Signals for feature detection:
 * 1. Git diff contains new files with specific patterns
 * 2. Beads issues with "feature" type
 * 3. Commit messages containing "feature:", "feat:"
 * 
 * Idempotent: safe to run multiple times - only updates if version needs changing
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// ============================================================================
// CONFIGURATION
// ============================================================================

const HUGO_CONFIG = path.join(projectRoot, 'hugo.toml');
const BEADS_FILE = path.join(projectRoot, '.beads', 'issues.jsonl');

// Patterns that indicate a feature commit
const FEATURE_PATTERNS = [
  /^feat:/i,
  /^feature:/i,
  /new [a-z]+ component/i,
  /implement [a-z]+ feature/i,
];

// Patterns that indicate a patch (bug, refactor, docs)
const PATCH_PATTERNS = [
  /^fix:/i,
  /^refactor:/i,
  /^docs:/i,
  /^style:/i,
  /^chore:/i,
  /^test:/i,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse current version from hugo.toml
 */
function getCurrentVersion() {
  try {
    const content = fs.readFileSync(HUGO_CONFIG, 'utf8');
    const match = content.match(/version\s*=\s*"([^"]+)"/);
    if (match) {
      return match[1];
    }
  } catch (err) {
    console.error('❌ Failed to read hugo.toml:', err.message);
    process.exit(1);
  }
  return null;
}

/**
 * Parse semantic version (major.minor.patch)
 */
function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Invalid version format: ${versionString}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Format version object back to string
 */
function formatVersion(parsed) {
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

/**
 * Get short git hash
 */
function getShortHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get all commit messages since last version tag or last N commits
 */
function getRecentCommitMessages(limit = 10) {
  try {
    return execSync(`git log -${limit} --pretty=format:%B`).toString().trim();
  } catch {
    return '';
  }
}

/**
 * Get staged files for this commit
 */
function getStagedFiles() {
  try {
    return execSync('git diff --cached --name-only').toString().trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Check git diff for feature-related changes
 */
function detectFeatureFromDiff() {
  try {
    const diff = execSync('git diff --cached').toString();
    
    // Check for new components
    if (diff.includes('layouts/partials/components/') && diff.includes('+')) {
      return true;
    }
    
    // Check for new sections
    if (diff.includes('layouts/partials/sections/') && diff.includes('+')) {
      return true;
    }
    
    // Check for new content sections
    if (diff.includes('content/')) {
      const lines = diff.split('\n');
      const newFiles = lines.filter(l => l.startsWith('diff --git') && l.includes('new file'));
      if (newFiles.length > 0) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Parse beads issues to detect features
 */
function detectFeatureFromBeads() {
  try {
    if (!fs.existsSync(BEADS_FILE)) {
      return false;
    }

    const content = fs.readFileSync(BEADS_FILE, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    
    // Check last 5 issues for "feature" type and "in_progress" or "open" status
    for (const line of lines.slice(-5)) {
      try {
        const issue = JSON.parse(line);
        if (issue.issue_type === 'feature' && 
            (issue.status === 'in_progress' || issue.status === 'open')) {
          return true;
        }
      } catch {
        // Skip malformed lines
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Detect version bump type from commit metadata
 */
function detectVersionBumpType() {
  const messages = getRecentCommitMessages(5);
  
  // Check commit messages for patterns
  for (const pattern of FEATURE_PATTERNS) {
    if (pattern.test(messages)) {
      return 'minor';
    }
  }
  
  // Check diff for feature indicators
  if (detectFeatureFromDiff()) {
    return 'minor';
  }
  
  // Check beads for feature issues
  if (detectFeatureFromBeads()) {
    return 'minor';
  }
  
  // Default to patch bump
  return 'patch';
}

/**
 * Bump version based on type
 */
function bumpVersion(versionString, bumpType) {
  const parsed = parseVersion(versionString);
  
  if (bumpType === 'minor') {
    parsed.minor += 1;
    parsed.patch = 0;
  } else if (bumpType === 'patch') {
    parsed.patch += 1;
  }
  
  return formatVersion(parsed);
}

/**
 * Update version in hugo.toml
 */
function updateHugoConfig(newVersion) {
  try {
    let content = fs.readFileSync(HUGO_CONFIG, 'utf8');
    content = content.replace(
      /version\s*=\s*"[^"]+"/,
      `version = "${newVersion}"`
    );
    fs.writeFileSync(HUGO_CONFIG, content, 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Failed to update hugo.toml:', err.message);
    return false;
  }
}

/**
 * Update footer template to include git hash
 */
function updateFooterTemplate() {
  try {
    const footerPath = path.join(projectRoot, 'layouts', 'partials', 'footer.html');
    let content = fs.readFileSync(footerPath, 'utf8');
    
    // Check if hash is already in the template
    if (content.includes('.Site.Params.versionHash')) {
      return true; // Already updated
    }
    
    // Add versionHash alongside version in footer
    const oldVersion = 'v{{ .Site.Params.version }}';
    const newVersion = 'v{{ .Site.Params.version }}{{ with .Site.Params.versionHash }} ({{ . }}){{ end }}';
    
    if (content.includes(oldVersion)) {
      content = content.replace(oldVersion, newVersion);
      fs.writeFileSync(footerPath, content, 'utf8');
      return true;
    }
    
    return true; // Already in new format
  } catch (err) {
    console.error('⚠️  Could not update footer template:', err.message);
    return false;
  }
}

/**
 * Add version to hugo.toml params
 */
function addVersionHashToParams(hash) {
  try {
    let content = fs.readFileSync(HUGO_CONFIG, 'utf8');
    
    // Check if versionHash already exists
    if (content.includes('versionHash')) {
      // Update existing
      content = content.replace(
        /versionHash\s*=\s*"[^"]*"/,
        `versionHash = "${hash}"`
      );
    } else {
      // Add after version line
      content = content.replace(
        /(version\s*=\s*"[^"]+"\n)/,
        `$1   versionHash = "${hash}"\n`
      );
    }
    
    fs.writeFileSync(HUGO_CONFIG, content, 'utf8');
    return true;
  } catch (err) {
    console.error('⚠️  Could not add versionHash to hugo.toml:', err.message);
    return false;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

console.log('\n📦 Auto-Version Pre-Commit Hook\n');

// Get current version
const currentVersion = getCurrentVersion();
console.log(`Current version: ${currentVersion}`);

// Detect what should be bumped
const bumpType = detectVersionBumpType();
console.log(`Detected bump type: ${bumpType}`);

// Calculate new version
const newVersion = bumpVersion(currentVersion, bumpType);
console.log(`New version: ${newVersion}`);

// Only update if version actually changed
if (currentVersion === newVersion) {
  console.log('✅ Version already correct, skipping update');
  process.exit(0);
}

// Update hugo.toml with new version
if (!updateHugoConfig(newVersion)) {
  console.error('❌ Failed to update version');
  process.exit(1);
}

// Add git hash to params
const shortHash = getShortHash();
if (!addVersionHashToParams(shortHash)) {
  console.error('⚠️  Warning: Could not add version hash');
}

// Update footer template if needed
updateFooterTemplate();

console.log(`✅ Version bumped: ${currentVersion} → ${newVersion}`);
console.log(`✅ Git hash: ${shortHash}`);
console.log('\n💡 Stage the hugo.toml changes: git add hugo.toml\n');
