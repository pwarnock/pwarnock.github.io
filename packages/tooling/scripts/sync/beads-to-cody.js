#!/usr/bin/env node

/**
 * Beads to Cody Status Aggregation Script
 * Updates Cody feature backlog with current Beads issue progress
 * Implements Phase 2 of Cody-Beads integration automation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BeadsToCody {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.backlogFile = path.join(this.projectRoot, '.cody/project/build/feature-backlog.md');
    this.beadsFile = path.join(this.projectRoot, '.beads/issues.jsonl');
    this.version = this.getCurrentVersion();
    this.updates = [];
    this.errors = [];
  }

  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );
      return packageJson.version;
    } catch (_error) {
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
          issues.push(issue);
        } catch (_error) {
          // Skip malformed lines
        }
      }
    }

    console.log(`✅ Found ${issues.length} Beads issues`);
    return issues;
  }

  parseCodyBacklog() {
    console.log('📖 Parsing Cody feature backlog...');

    if (!fs.existsSync(this.backlogFile)) {
      console.log('ℹ️  No Cody backlog found - will create new structure');
      return {
        content: '',
        versions: {},
        featureSections: new Map(),
      };
    }

    const content = fs.readFileSync(this.backlogFile, 'utf8');
    const lines = content.split('\n');

    const versions = {};
    const featureSections = new Map();
    let currentVersion = null;
    let currentFeatures = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect version headers
      const versionMatch = line.match(/^## v([0-9.]+).*? - (🟢|🟡|🔴)/);
      if (versionMatch) {
        if (currentVersion && currentFeatures.length > 0) {
          versions[currentVersion] = {
            features: currentFeatures,
            lines: currentFeatures.map(f => f.lineIndex),
          };
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
        const feature = {
          id,
          title: title.trim(),
          description: description.trim(),
          priority: this.mapPriority(priority),
          status: this.mapStatus(status),
          version: currentVersion,
          lineIndex: i,
        };
        currentFeatures.push(feature);
        featureSections.set(id, feature);
      }
    }

    // Add last version
    if (currentVersion && currentFeatures.length > 0) {
      versions[currentVersion] = {
        features: currentFeatures,
        lines: currentFeatures.map(f => f.lineIndex),
      };
    }

    return { content, versions, featureSections };
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

  calculateVersionStats(version, versionIssues) {
    const total = versionIssues.length;
    const completed = versionIssues.filter(i => i.status === 'completed').length;
    const inProgress = versionIssues.filter(i => i.status === 'in_progress').length;
    const todo = versionIssues.filter(i => i.status === 'todo').length;
    const blocked = versionIssues.filter(i => i.status === 'blocked').length;
    const review = versionIssues.filter(i => i.status === 'review').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Risk assessment
    const risks = [];
    if (completionRate === 0 && total > 0) {
      risks.push('No progress made');
    }
    if (inProgress > completed * 2) {
      risks.push('High WIP count (more in progress than completed)');
    }
    if (blocked > 0) {
      risks.push(`${blocked} blocked issue(s)`);
    }
    if (completionRate > 80 && review > 0) {
      risks.push(`${review} issues in review (close them out)`);
    }

    return {
      total,
      completed,
      inProgress,
      todo,
      blocked,
      review,
      completionRate,
      issues: versionIssues,
      risk: risks.length > 0 ? risks.join(', ') : 'None',
    };
  }

  generateIssueList(issues) {
    if (issues.length === 0) return 'No issues linked yet.';

    return issues
      .map(issue => {
        const status =
          issue.status === 'completed'
            ? '✅'
            : issue.status === 'in_progress'
              ? '🔄'
              : issue.status === 'blocked'
                ? '🚫'
                : '⏸️';
        return `${status} ${issue.id}: ${issue.title}`;
      })
      .join('\n');
  }

  generateRiskAssessment(stats) {
    if (stats.risk === 'None') return '🟢 Low risk';
    if (stats.risk.includes('blocked')) return '🔴 High risk';
    if (stats.risk.includes('WIP')) return '🟡 Medium risk';
    return '🟡 Medium risk';
  }

  updateBacklogWithProgress() {
    console.log('📝 Updating Cody backlog with Beads progress...');

    const { content, versions, featureSections } = this.parseCodyBacklog();
    const issues = this.parseBeadsIssues();

    // Calculate stats for each version
    const versionStats = {};

    for (const [version, versionData] of Object.entries(versions)) {
      // Find issues for this version
      const versionIssues = issues.filter(issue => {
        const title = issue.title;
        return (
          title.includes(`(${version})`) ||
          title.includes(`v${version}`) ||
          featureSections.has(issue.id)
        );
      });

      versionStats[version] = this.calculateVersionStats(version, versionIssues);
    }

    // Update the backlog content
    const lines = content.split('\n');
    let updatedCount = 0;

    for (const [version, stats] of Object.entries(versionStats)) {
      const versionData = versions[version];
      if (!versionData) continue;

      // Find the version header line
      const versionHeaderIndex = versionData.features[0]?.lineIndex || 0;
      if (versionHeaderIndex >= lines.length) continue;

      const headerLine = lines[versionHeaderIndex];

      // Update version status based on completion rate
      let newStatus = '🔴 Not Started';
      if (stats.completionRate === 100) {
        newStatus = '🟢 Completed';
      } else if (stats.completionRate > 0) {
        newStatus = '🟡 In Progress';
      }

      // Update the status in the header
      const updatedHeader = headerLine.replace(/ - (🔴|🟡|🟢)/, ` - ${newStatus}`);
      if (updatedHeader !== headerLine) {
        lines[versionHeaderIndex] = updatedHeader;
        updatedCount++;
      }

      // Add or update progress section after the feature table
      const progressSectionIndex = lines.findIndex(
        (line, idx) => idx > versionHeaderIndex && line.includes('Implementation Progress')
      );

      const completionRate = stats.completionRate;
      const progressText = `${completionRate}% Complete (${stats.completed}/${stats.total} issues)`;

      if (progressSectionIndex >= 0) {
        // Update existing progress section
        lines[progressSectionIndex] = `*Status: ${progressText}*`;
      } else {
        // Add new progress section
        const insertIndex = versionHeaderIndex + versionData.features.length + 5; // After feature table
        if (insertIndex < lines.length) {
          const issueList = this.generateIssueList(stats.issues);
          const riskText = this.generateRiskAssessment(stats);

          const insertText = `
### Implementation Progress
*Status: ${progressText}*
${issueList}

**Risk Assessment:** ${riskText}`;

          lines.splice(insertIndex, 0, insertText);
          // Adjust subsequent line indices
          for (const v of Object.values(versions)) {
            v.lines = v.lines.map(i => (i >= insertIndex ? i + 1 : i));
          }
        }
        updatedCount++;
      }

      // Add issue links and risk assessment
      if (stats.issues.length > 0) {
        const insertIndex = versionHeaderIndex + versionData.features.length + 5; // After feature table
        if (insertIndex < lines.length) {
          const issueList = this.generateIssueList(stats.issues);
          const riskText = this.generateRiskAssessment(stats);

          const insertText = `
### Implementation Progress
${issueList}

**Risk Assessment:** ${riskText}`;

          // Check if this section already exists
          const nextLines = lines.slice(insertIndex, insertIndex + 3);
          const hasProgressSection = nextLines.some(line =>
            line.includes('Implementation Progress')
          );

          if (!hasProgressSection) {
            lines.splice(insertIndex, 0, insertText);
            updatedCount++;
          }
        }

        this.updates.push(
          `v${version}: ${stats.completionRate}% complete, ${stats.risk.toLowerCase()}`
        );
      }
    }

    // Write updated content
    const updatedContent = lines.join('\n');
    fs.writeFileSync(this.backlogFile, updatedContent, 'utf8');

    console.log(`✅ Updated backlog with ${updatedCount} changes`);
  }

  async aggregate() {
    console.log('🔄 Starting Beads to Cody status aggregation...');
    console.log(`📍 Project: ${this.projectRoot}`);
    console.log(`📊 Version: ${this.version}`);
    console.log('');

    try {
      this.updateBacklogWithProgress();

      console.log('\n📊 Aggregation Summary');
      console.log('========================');
      console.log(`✅ Updates applied: ${this.updates.length}`);
      console.log(`❌ Errors: ${this.errors.length}`);

      if (this.updates.length > 0) {
        console.log('\n🔄 Applied Updates:');
        this.updates.forEach(update => console.log(`   ✅ ${update}`));
      }

      if (this.errors.length > 0) {
        console.log('\n❌ Errors:');
        this.errors.forEach( _error => console.log(`   ❌ ${error}`));
      }

      console.log('\n📋 Next Steps:');
      console.log('1. Review updated backlog: .cody/project/build/feature-backlog.md');
      console.log('2. Check ready work: bd --no-daemon ready --json');
      console.log('3. Plan next work items');
    } catch (_error) {
      console.error('💥 Aggregation failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const aggregator = new BeadsToCody();

  const version = process.argv.find(arg => arg.startsWith('--version='));
  if (version) {
    aggregator.version = version.split('=')[1];
  }

  aggregator.aggregate().catch( _error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

export default BeadsToCody;
