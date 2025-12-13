#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CodyFeature {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  version?: string;
}

interface CodyBacklog {
  versions: Record<string, CodyFeature[]>;
  features: CodyFeature[];
}

interface BeadsIssue {
  id: string;
  title: string;
  status: string;
  priority?: string;
  type?: string;
  description?: string;
}

interface VersionStats {
  version: string;
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  review: number;
  todo: number;
  completionRate: number;
  risk: string;
  codyFeatures: CodyFeature[];
  beadsIssues: BeadsIssue[];
}

class StatusDashboard {
  private projectRoot: string;
  private backlogFile: string;
  private beadsFile: string;
  public version: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.backlogFile = path.join(this.projectRoot, '.cody/project/build/feature-backlog.md');
    this.beadsFile = path.join(this.projectRoot, '.beads/issues.jsonl');
    this.version = this.getCurrentVersion();
  }

  private getCurrentVersion(): string {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      return packageJson.version;
    } catch {
      return '0.19.4';
    }
  }

  private parseCodyBacklog(): CodyBacklog {
    if (!fs.existsSync(this.backlogFile)) {
      return { versions: {}, features: [] };
    }

    const content = fs.readFileSync(this.backlogFile, 'utf8');
    const lines = content.split('\n');
    
    const versions: Record<string, CodyFeature[]> = {};
    let currentVersion: string | null = null;
    let currentFeatures: CodyFeature[] = [];
    
    for (const line of lines) {
      const versionMatch = line.match(/^## v([0-9.]+(?:-[a-zA-Z0-9.-]+)?) .*? - (🟢|🟡|🔴)/);
      if (versionMatch) {
        if (currentVersion && currentFeatures.length > 0) {
          versions[currentVersion] = currentFeatures;
        }
        currentVersion = versionMatch[1];
        currentFeatures = [];
        continue;
      }

      const featureMatch = line.match(/^\| (F\d+) \| ([^|]+) \| ([^|]+) \| (High|Medium|Low) \| (🔴|🟡|🟢)/);
      if (featureMatch && currentVersion) {
        const [, id, title, description, priority, status] = featureMatch;
        currentFeatures.push({
          id,
          title: title.trim(),
          description: description.trim(),
          priority,
          status: this.mapStatus(status)
        });
      }
    }

    if (currentVersion && currentFeatures.length > 0) {
      versions[currentVersion] = currentFeatures;
    }

    return { versions, features: currentFeatures };
  }

  private mapStatus(status: string): string {
    switch (status) {
      case '🟢': return 'completed';
      case '🟡': return 'in_progress';
      case '🔴': return 'todo';
      default: return 'todo';
    }
  }

  private parseBeadsIssues(): BeadsIssue[] {
    if (!fs.existsSync(this.beadsFile)) {
      return [];
    }

    const content = fs.readFileSync(this.beadsFile, 'utf8');
    const lines = content.trim().split('\n');
    
    const issues: BeadsIssue[] = [];
    for (const line of lines) {
      if (line.trim()) {
        try {
          const issue = JSON.parse(line) as BeadsIssue;
          issues.push(issue);
        } catch {
          // Skip malformed lines
        }
      }
    }

    return issues;
  }

  private calculateVersionStats(version: string, codyFeatures: CodyFeature[], beadsIssues: BeadsIssue[]): VersionStats {
    // Filter issues for this version
    const versionIssues = beadsIssues.filter(issue => {
      const title = issue.title || '';
      return title.includes(`(${version})`) || title.includes(`v${version}`);
    });

    const total = versionIssues.length;
    const completed = versionIssues.filter(i => i.status === 'completed').length;
    const inProgress = versionIssues.filter(i => i.status === 'in_progress').length;
    const blocked = versionIssues.filter(i => i.status === 'blocked').length;
    const todo = versionIssues.filter(i => i.status === 'todo').length;
    const review = versionIssues.filter(i => i.status === 'review').length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Risk assessment
    const risks: string[] = [];
    if (completionRate < 25 && total > 0) {
      risks.push('Low completion rate');
    }
    if (blocked > 0) {
      risks.push(`${blocked} blocked issues`);
    }
    if (inProgress > completed * 2) {
      risks.push('High WIP count');
    }
    if (completionRate > 80 && review > 0) {
      risks.push(`${review} issues in review`);
    }
    
    return {
      version,
      total,
      completed,
      inProgress,
      blocked,
      review,
      todo,
      completionRate,
      risk: risks.length > 0 ? risks.join(', ') : 'Low risk',
      codyFeatures: codyFeatures.filter(f => f.version === version),
      beadsIssues: versionIssues
    };
  }

  public generateDashboard(): void {
    // Note: Box drawing characters and emojis may not render correctly on Windows CMD
    // For best display, use Windows Terminal, PowerShell, or Unix-like systems
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log(`║           VERSION ${this.version} PROJECT HEALTH DASHBOARD                   ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');

    try {
      const { versions, features } = this.parseCodyBacklog();
      const issues = this.parseBeadsIssues();
      
      // Cody Planning Status
      console.log('📋 CODY PLANNING STATUS');
      console.log('├─ Features in backlog:', features.length);
      console.log(`├─ Active versions: ${Object.keys(versions).length}`);
      
      // Beads Execution Status
      console.log('🔮 BEADS EXECUTION STATUS');
      console.log(`├─ Total issues: ${issues.length}`);
      
      const completed = issues.filter(i => i.status === 'completed').length;
      const inProgress = issues.filter(i => i.status === 'in_progress').length;
      const blocked = issues.filter(i => i.status === 'blocked').length;
      
      console.log(`├─ Completed: ${completed} (${issues.length > 0 ? Math.round((completed / issues.length) * 100) : 0}%)`);
      console.log(`├─ In Progress: ${inProgress}`);
      console.log(`├─ Blocked: ${blocked}`);
      console.log(`└─ Ready to start: ${issues.filter(i => i.status === 'todo').length}`);
      console.log('');
      
      // Version Details
      if (Object.keys(versions).length > 0) {
        console.log('📊 VERSION BREAKDOWN');
        
        for (const [version, codyFeatures] of Object.entries(versions)) {
          const stats = this.calculateVersionStats(version, codyFeatures, issues);
          
          const status = stats.completionRate === 100 ? '🟢' : 
                         stats.completionRate > 50 ? '🟡' : '🔴';
          
          console.log(`\n${status} v${version} (${stats.completionRate}% complete)`);
          console.log(`├─ Cody Features: ${stats.codyFeatures.length}`);
          console.log(`├─ Beads Issues: ${stats.total}`);
          console.log(`├─ Completed: ${stats.completed}`);
          console.log(`├─ In Progress: ${stats.inProgress}`);
          console.log(`├─ Blocked: ${stats.blocked}`);
          console.log(`└─ Risk: ${stats.risk}`);
        }
      }
      
      console.log('');
      
      // Risk Assessment
      console.log('⚠️  RISK ASSESSMENT');
      const globalRisks: string[] = [];
      
      if (blocked > 0) {
        globalRisks.push(`${blocked} blocked issues need attention`);
      }
      
      if (inProgress > completed * 2) {
        globalRisks.push('High WIP count - focus on completing existing work');
      }
      
      if (issues.length > 200) {
        globalRisks.push('Database size >200 - run cleanup recommended');
      }
      
      if (globalRisks.length === 0) {
        console.log('└─ Overall risk: LOW 🟢');
      } else {
        console.log('└─ Overall risk: MEDIUM 🟡');
        globalRisks.forEach(risk => console.log(`   ⚠️  ${risk}`));
      }
      
      console.log('');
      console.log('🚀 QUICK ACTIONS');
      console.log('├─ Check ready work: bd --no-daemon ready --json');
      console.log('├─ Start new session: ./scripts/session-notes.sh');
      console.log('├─ Sync backlog: bun run sync:backlog-to-beads');
      console.log('├─ Update status: bun run sync:beads-to-cody');
      console.log('└─ Generate release notes: bun run sync:release-notes');
      
    } catch (error: any) {
      console.error('💥 Dashboard generation failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new StatusDashboard();
  
  const version = process.argv.find(arg => arg.startsWith('--version='));
  if (version) {
    const versionValue = version.split('=')[1];
    if (versionValue && versionValue.trim()) {
      dashboard.version = versionValue.trim();
    } else {
      console.error('Error: --version requires a non-empty value');
      process.exit(1);
    }
  }

  dashboard.generateDashboard();
}

export default StatusDashboard;
