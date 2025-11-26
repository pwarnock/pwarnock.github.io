#!/usr/bin/env node

/**
 * Backlog to Beads Sync Script
 * Parses Cody feature backlog and creates corresponding Beads issues
 * Implements Phase 2 of Cody-Beads integration automation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BacklogToBeads {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.backlogFile = path.join(this.projectRoot, '.cody/project/build/feature-backlog.md');
    this.beadsFile = path.join(this.projectRoot, '.beads/issues.jsonl');
    this.version = this.getCurrentVersion();
    this.createdIssues = [];
    this.errors = [];
  }

  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );
      return packageJson.version;
    } catch (error) {
      console.warn('⚠️  Could not read version from package.json, using default');
      return '0.19.4';
    }
  }

  parseBacklog() {
    console.log('📖 Parsing Cody feature backlog...');

    if (!fs.existsSync(this.backlogFile)) {
      throw new Error(`Feature backlog not found: ${this.backlogFile}`);
    }

    const content = fs.readFileSync(this.backlogFile, 'utf8');
    const lines = content.split('\n');

    const versions = {};
    let currentVersion = null;
    let currentFeatures = [];

    for (const line of lines) {
      // Detect version headers
      const versionMatch = line.match(/^## v([0-9.]+).*? - (🟢|🟡|🔴)/);
      if (versionMatch) {
        if (currentVersion && currentFeatures.length > 0) {
          versions[currentVersion] = currentFeatures;
        }
        currentVersion = versionMatch[1];
        currentFeatures = [];
        continue;
      }

      // Detect feature entries
      const featureMatch = line.match(
        /^| (F\d+) | ([^|]+) | ([^|]+) | (High|Medium|Low) | (🔴|🟡|🟢)/
      );
      if (featureMatch && currentVersion) {
        const [, id, title, description, priority, status] = featureMatch;
        currentFeatures.push({
          id,
          title: title.trim(),
          description: description.trim(),
          priority: this.mapPriority(priority),
          status: this.mapStatus(status),
          version: currentVersion,
        });
      }
    }

    // Add last version
    if (currentVersion && currentFeatures.length > 0) {
      versions[currentVersion] = currentFeatures;
    }

    console.log(`✅ Found ${Object.keys(versions).length} versions with features`);
    return versions;
  }

  mapPriority(priority) {
    switch (priority) {
      case 'Critical':
        return '0';
      case 'High':
        return '1';
      case 'Medium':
        return '2';
      case 'Low':
        return '3';
      case 'Backlog':
        return '4';
      default:
        return '2';
    }
  }

  mapStatus(status) {
    switch (status) {
      case '🟢 Completed':
        return 'completed';
      case '🟡 In Progress':
        return 'in_progress';
      case '🔴 Not Started':
        return 'todo';
      default:
        return 'todo';
    }
  }

  getExistingIssues() {
    console.log('🔍 Checking existing Beads issues...');

    if (!fs.existsSync(this.beadsFile)) {
      console.log('ℹ️  No existing issues file found');
      return new Set();
    }

    const content = fs.readFileSync(this.beadsFile, 'utf8');
    const lines = content.trim().split('\n');

    const existingIssues = new Set();
    for (const line of lines) {
      if (line.trim()) {
        try {
          const issue = JSON.parse(line);
          existingIssues.add(issue.title);
        } catch (error) {
          // Skip malformed lines
        }
      }
    }

    console.log(`✅ Found ${existingIssues.size} existing issues`);
    return existingIssues;
  }

  createBeadsIssue(feature, dependencies = []) {
    const title = `(${feature.version}) ${feature.title}`;

    // Check if already exists
    const existingIssues = this.getExistingIssues();
    if (existingIssues.has(title)) {
      console.log(`⏭️  Skipping existing issue: ${title}`);
      return null;
    }

    try {
      const env = { ...process.env, BEADS_NO_DAEMON: '1' };
      let command = `bd --no-daemon create "${title}" -t feature -p ${feature.priority} --json`;

      if (dependencies.length > 0) {
        command += ` --deps ${dependencies.join(',')}`;
      }

      const output = execSync(command, {
        cwd: this.projectRoot,
        env,
        encoding: 'utf8',
      });

      const issue = JSON.parse(output);
      console.log(`✅ Created issue: ${issue.id}: ${title}`);

      return {
        beadsId: issue.id,
        featureId: feature.id,
        title,
        version: feature.version,
        priority: feature.priority,
      };
    } catch (error) {
      console.error(`❌ Failed to create issue: ${title}`);
      console.error(`   Error: ${error.message}`);
      this.errors.push({ feature, error: error.message });
      return null;
    }
  }

  async sync() {
    console.log('🔄 Starting Backlog to Beads sync...');
    console.log(`📍 Project: ${this.projectRoot}`);
    console.log(`📊 Version: ${this.version}`);
    console.log('');

    try {
      const versions = this.parseBacklog();
      const existingIssues = this.getExistingIssues();

      for (const [version, features] of Object.entries(versions)) {
        console.log(`\n🎯 Processing version ${version} (${features.length} features)...`);

        // Filter for incomplete features only
        const incompleteFeatures = features.filter(f => f.status !== 'completed');

        if (incompleteFeatures.length === 0) {
          console.log(`✅ All features in v${version} are completed`);
          continue;
        }

        console.log(`📝 Creating issues for ${incompleteFeatures.length} incomplete features...`);

        // Create issues with dependency tracking
        const dependencyMap = new Map();

        for (const feature of incompleteFeatures) {
          const dependencies = [];

          // Add dependencies based on feature relationships
          if (feature.title.toLowerCase().includes('testing')) {
            // Testing features depend on implementation features
            const implFeature = incompleteFeatures.find(
              f => f.title.toLowerCase().includes('implement') && f.version === feature.version
            );
            if (implFeature && dependencyMap.has(implFeature.id)) {
              dependencies.push(dependencyMap.get(implFeature.id));
            }
          }

          const created = this.createBeadsIssue(feature, dependencies);
          if (created) {
            this.createdIssues.push(created);
            dependencyMap.set(feature.id, created.beadsId);
          }
        }
      }

      console.log('\n📊 Sync Summary');
      console.log('===============');
      console.log(`✅ Issues created: ${this.createdIssues.length}`);
      console.log(`❌ Errors: ${this.errors.length}`);

      if (this.createdIssues.length > 0) {
        console.log('\n🔗 Created Issues:');
        this.createdIssues.forEach(issue => {
          console.log(`   ${issue.beadsId}: ${issue.title}`);
        });

        console.log('\n📝 Next Steps:');
        console.log('1. Check created issues: bd --no-daemon list --json');
        console.log('2. Update feature backlog with issue IDs');
        console.log('3. Start work: bd --no-daemon ready --json');
      }

      if (this.errors.length > 0) {
        console.log('\n❌ Errors:');
        this.errors.forEach(({ feature, error }) => {
          console.log(`   ${feature.id}: ${error}`);
        });
      }
    } catch (error) {
      console.error('💥 Sync failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new BacklogToBeads();

  const version = process.argv.find(arg => arg.startsWith('--version='));
  if (version) {
    sync.version = version.split('=')[1];
  }

  sync.sync().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

export default BacklogToBeads;
