#!/usr/bin/env node

/**
 * Release Notes Generator Script
 * Generates professional release notes from completed Beads issues
 * Implements Phase 2 of Cody-Beads integration automation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReleaseNotesGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.beadsFile = path.join(this.projectRoot, '.beads/issues.jsonl');
    this.releasesDir = path.join(this.projectRoot, 'docs/releases');
    this.version = this.getCurrentVersion();
    this.generated = [];
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

  parseBeadsIssues() {
    console.log('🔍 Parsing Beads issues...');

    if (!fs.existsSync(this.beadsFile)) {
      console.log('ℹ️  No Beads issues file found');
      return [];
    }

    const content = fs.readFileSync(this.beadsFile, 'utf8');
    const lines = content.trim().split('\n');

    const issues = [];
    for (const line of lines) {
      if (line.trim()) {
        try {
          const issue = JSON.parse(line);
          if (issue.status === 'completed') {
            issues.push(issue);
          }
        } catch (error) {
          // Skip malformed lines
        }
      }
    }

    console.log(`✅ Found ${issues.length} completed issues`);
    return issues;
  }

  groupIssuesByVersion(issues) {
    const versionGroups = {};

    for (const issue of issues) {
      const title = issue.title || 'Untitled issue';
      const description = issue.description || 'No description';

      // Look for version patterns: (v0.20.0) or v0.20.0
      let version = 'unknown';
      const versionMatch = title.match(/((v\d+\.\d+\.\d+))|v(\d+\.\d+\.\d+)/);
      if (versionMatch) {
        version = versionMatch[1] || versionMatch[2];
      }

      // Initialize version group if needed
      if (!versionGroups[version]) {
        versionGroups[version] = {
          features: [],
          bugs: [],
          tasks: [],
          chores: [],
          docs: [],
          other: [],
        };
      }

      // Categorize by issue type
      const type = issue.issue_type || 'task';
      switch (type) {
        case 'feature':
          versionGroups[version].features.push(issue);
          break;
        case 'bug':
          versionGroups[version].bugs.push(issue);
          break;
        case 'task':
          versionGroups[version].tasks.push(issue);
          break;
        case 'chore':
          versionGroups[version].chores.push(issue);
          break;
        case 'doc':
          versionGroups[version].docs.push(issue);
          break;
        default:
          versionGroups[version].other.push(issue);
      }
    }

    return versionGroups;
  }

  formatIssueList(issues) {
    return issues
      .map(issue => {
        const title = issue.title || 'Untitled issue';
        const description = issue.description || 'No description';

        // Extract main description point if available
        let detail = '';
        if (description.includes('## Description')) {
          const descMatch = description.match(/## Descriptions*s*([^\n]+)/);
          if (descMatch) {
            detail = ` - ${descMatch[1]}`;
          }
        }

        return `- ${title}${detail}`;
      })
      .join('\n');
  }

  generateReleaseNotes(version, versionIssues) {
    const { features, bugs, tasks, chores, docs, other } = versionIssues;

    const sections = [];

    // New Features
    if (features.length > 0) {
      sections.push(`## New Features
${this.formatIssueList(features)}`);
    }

    // Bug Fixes
    if (bugs.length > 0) {
      sections.push(`## Bug Fixes
${this.formatIssueList(bugs)}`);
    }

    // Improvements (tasks)
    if (tasks.length > 0) {
      sections.push(`## Improvements
${this.formatIssueList(tasks)}`);
    }

    // Maintenance (chores)
    if (chores.length > 0) {
      sections.push(`## Maintenance
${this.formatIssueList(chores)}`);
    }

    // Documentation
    if (docs.length > 0) {
      sections.push(`## Documentation
${this.formatIssueList(docs)}`);
    }

    // Other
    if (other.length > 0) {
      sections.push(`## Other Changes
${this.formatIssueList(other)}`);
    }

    // Generate full release notes
    const date = new Date().toISOString().split('T')[0];
    const totalChanges = Object.values(versionIssues).flat().length;

    const notes = `# Release Notes: v${version}

*Published: ${date}*

## Summary

This release includes ${totalChanges} changes across ${features.length} new features, ${bugs.length} bug fixes, and various improvements.

${sections.join('\n\n')}

---

## Development Details

**Total Issues Resolved:** ${totalChanges}
- Features: ${features.length}
- Bug Fixes: ${bugs.length}
- Improvements: ${tasks.length}
- Maintenance: ${chores.length}
- Documentation: ${docs.length}

**Generated from:** Beads issue tracking system
**Project:** ${path.basename(this.projectRoot)}
**Environment:** Production

---

*These release notes were automatically generated from completed Beads issues. 
Please review for accuracy and add additional context before publishing.*`;

    return notes;
  }

  async generate() {
    console.log('📝 Starting release notes generation...');
    console.log(`📍 Project: ${this.projectRoot}`);
    console.log(`📊 Version: ${this.version}`);
    console.log('');

    try {
      // Ensure releases directory exists
      fs.mkdirSync(this.releasesDir, { recursive: true });

      const issues = this.parseBeadsIssues();
      const versionGroups = this.groupIssuesByVersion(issues);

      console.log(`📦 Found versions with completed issues: ${Object.keys(versionGroups).length}`);

      for (const [version, versionIssues] of Object.entries(versionGroups)) {
        const totalChanges = Object.values(versionIssues).flat().length;

        if (totalChanges === 0) {
          console.log(`⏭️  Skipping v${version} (no completed issues)`);
          continue;
        }

        console.log(`📝 Generating release notes for v${version} (${totalChanges} changes)...`);

        const notes = this.generateReleaseNotes(version, versionIssues);
        const releaseFile = path.join(this.releasesDir, `v${version}.md`);

        // Check if file already exists
        if (fs.existsSync(releaseFile)) {
          console.log(`⚠️  Release notes exist, backing up: v${version}.md.backup`);
          fs.writeFileSync(`${releaseFile}.backup`, fs.readFileSync(releaseFile));
        }

        fs.writeFileSync(releaseFile, notes, 'utf8');

        this.generated.push({
          version,
          file: releaseFile,
          changes: totalChanges,
        });

        console.log(`✅ Generated: ${releaseFile}`);
      }

      console.log('\n📊 Generation Summary');
      console.log('==========================');
      console.log(`✅ Release notes generated: ${this.generated.length}`);
      console.log(`❌ Errors: ${this.errors.length}`);

      if (this.generated.length > 0) {
        console.log('\n📝 Generated Files:');
        this.generated.forEach(({ version, file, changes }) => {
          console.log(`   ✅ v${version}: ${changes} changes → ${file}`);
        });

        console.log('\n📋 Next Steps:');
        console.log('1. Review generated release notes');
        console.log('2. Edit for tone and additional context');
        console.log('3. Create GitHub release with notes');
        console.log('4. Update version in package.json if needed');
      }

      if (this.errors.length > 0) {
        console.log('\n❌ Errors:');
        this.errors.forEach(error => console.log(`   ❌ ${error}`));
      }
    } catch (error) {
      console.error('💥 Generation failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ReleaseNotesGenerator();

  const version = process.argv.find(arg => arg.startsWith('--version='));
  if (version) {
    generator.version = version.split('=')[1];
  }

  generator.generate().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

export default ReleaseNotesGenerator;
