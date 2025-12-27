#!/usr/bin/env -S bun
/**
 * Content Agents CLI
 *
 * Command-line interface for generating content using the content agents.
 *
 * Usage:
 *   bun run agent:blog [--title "..."] [--type original|curated|embed|project] [--summary "..."]
 *   bun run agent:portfolio [--title "..."] [--client "..."] [--technologies "React,Node"]
 *   bun run agent:radar [--title "..."] [--quadrant tools] [--ring trial]
 *
 * Interactive mode:
 *   bun run agent:blog --interactive
 *   bun run agent:portfolio --interactive
 *   bun run agent:radar --interactive
 */

import { BlogAgent, type BlogPostRequest } from '../blog/blog-agent.js';
import { PortfolioAgent, type PortfolioGenerationRequest } from '../portfolio/portfolio-agent.js';
import { TechRadarAgent, type TechRadarOptions } from '../tech-radar/tech-radar-agent.js';
import type { BlogContentType, RadarSubtype } from '../types/index.js';
import * as readline from 'readline';

// =============================================================================
// Argument Parsing
// =============================================================================

interface ParsedArgs {
  command: string;
  interactive: boolean;
  options: Record<string, string>;
}

function parseArgs(args: string[]): ParsedArgs {
  const command = args[0] || '';
  const interactive = args.includes('--interactive') || args.includes('-i');
  const options: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--') && !['--interactive', '-i'].includes(arg)) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        options[key] = value;
        i++;
      }
    }
  }

  return { command, interactive, options };
}

// =============================================================================
// Interactive Prompts
// =============================================================================

function createPromptInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function promptWithDefault(
  rl: readline.Interface,
  question: string,
  defaultValue: string
): Promise<string> {
  const answer = await prompt(rl, `${question} [${defaultValue}]: `);
  return answer || defaultValue;
}

async function promptChoice<T extends string>(
  rl: readline.Interface,
  question: string,
  choices: T[],
  defaultChoice: T
): Promise<T> {
  const choicesStr = choices.map((c) => (c === defaultChoice ? `[${c}]` : c)).join(', ');
  const answer = await prompt(rl, `${question} (${choicesStr}): `);
  const normalized = answer.toLowerCase();
  if (choices.includes(normalized as T)) {
    return normalized as T;
  }
  return defaultChoice;
}

// =============================================================================
// Blog Agent CLI
// =============================================================================

async function runBlogCli(options: Record<string, string>, interactive: boolean): Promise<void> {
  console.log('\n--- Blog Agent ---\n');

  let request: BlogPostRequest;

  if (interactive) {
    const rl = createPromptInterface();

    try {
      const title = await prompt(rl, 'Title: ');
      if (!title) {
        console.error('Error: Title is required');
        process.exit(1);
      }

      const contentType = await promptChoice<BlogContentType>(
        rl,
        'Content type',
        ['original', 'curated', 'embed', 'project'],
        'original'
      );

      const summary = await prompt(rl, 'Summary: ');
      if (!summary) {
        console.error('Error: Summary is required');
        process.exit(1);
      }

      const tagsStr = await promptWithDefault(rl, 'Tags (comma-separated)', '');
      const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : undefined;

      const categoriesStr = await promptWithDefault(rl, 'Categories (comma-separated)', '');
      const categories = categoriesStr
        ? categoriesStr.split(',').map((c) => c.trim())
        : undefined;

      const keyPointsStr = await promptWithDefault(rl, 'Key points (comma-separated)', '');
      const keyPoints = keyPointsStr
        ? keyPointsStr.split(',').map((p) => p.trim())
        : undefined;

      request = {
        title,
        contentType,
        summary,
        tags,
        categories,
        keyPoints,
        draft: true,
      };
    } finally {
      rl.close();
    }
  } else {
    // Non-interactive mode - parse from options
    const title = options['title'];
    const contentType = (options['type'] || 'original') as BlogContentType;
    const summary = options['summary'];

    if (!title) {
      console.error('Error: --title is required');
      console.error('Usage: bun run agent:blog --title "..." --type original --summary "..."');
      process.exit(1);
    }

    if (!summary) {
      console.error('Error: --summary is required');
      console.error('Usage: bun run agent:blog --title "..." --type original --summary "..."');
      process.exit(1);
    }

    if (!['original', 'curated', 'embed', 'project'].includes(contentType)) {
      console.error('Error: --type must be one of: original, curated, embed, project');
      process.exit(1);
    }

    const tags = options['tags']?.split(',').map((t) => t.trim());
    const categories = options['categories']?.split(',').map((c) => c.trim());
    const keyPoints = options['key-points']?.split(',').map((p) => p.trim());

    request = {
      title,
      contentType,
      summary,
      tags,
      categories,
      keyPoints,
      draft: true,
    };
  }

  console.log('\nGenerating blog post...\n');
  console.log('Request:', JSON.stringify(request, null, 2));

  const agent = new BlogAgent();
  await agent.initialize();

  const result = await agent.generateBlogPost(request);

  if (result.success) {
    console.log('\n[SUCCESS] Blog post generated\n');
    console.log('Bundle path:', result.bundlePath);
    console.log('\nFrontmatter:', JSON.stringify(result.bundle?.frontmatter, null, 2));
    console.log('\nImage prompts:', result.bundle?.imagePrompts);
    console.log('\n--- Content Preview ---\n');
    console.log(result.bundle?.content?.substring(0, 500) + '...');
  } else {
    console.error('\n[ERROR] Failed to generate blog post:', result.error);
    process.exit(1);
  }
}

// =============================================================================
// Portfolio Agent CLI
// =============================================================================

async function runPortfolioCli(
  options: Record<string, string>,
  interactive: boolean
): Promise<void> {
  console.log('\n--- Portfolio Agent ---\n');

  let request: PortfolioGenerationRequest;

  if (interactive) {
    const rl = createPromptInterface();

    try {
      const title = await prompt(rl, 'Project title: ');
      if (!title) {
        console.error('Error: Title is required');
        process.exit(1);
      }

      const client = await prompt(rl, 'Client name: ');
      if (!client) {
        console.error('Error: Client is required');
        process.exit(1);
      }

      const description = await prompt(rl, 'Description: ');
      if (!description) {
        console.error('Error: Description is required');
        process.exit(1);
      }

      const technologiesStr = await prompt(rl, 'Technologies (comma-separated): ');
      if (!technologiesStr) {
        console.error('Error: Technologies are required');
        process.exit(1);
      }
      const technologies = technologiesStr.split(',').map((t) => t.trim());

      const category = await promptWithDefault(rl, 'Category', 'Web Development');
      const githubUrl = await promptWithDefault(rl, 'GitHub URL (optional)', '');
      const liveUrl = await promptWithDefault(rl, 'Live URL (optional)', '');

      const challengesStr = await promptWithDefault(rl, 'Challenges (comma-separated)', '');
      const challenges = challengesStr
        ? challengesStr.split(',').map((c) => c.trim())
        : undefined;

      const outcomesStr = await promptWithDefault(rl, 'Outcomes (comma-separated)', '');
      const outcomes = outcomesStr ? outcomesStr.split(',').map((o) => o.trim()) : undefined;

      request = {
        title,
        client,
        description,
        technologies,
        category,
        githubUrl: githubUrl || undefined,
        liveUrl: liveUrl || undefined,
        projectDetails: {
          challenges,
          outcomes,
        },
      };
    } finally {
      rl.close();
    }
  } else {
    // Non-interactive mode
    const title = options['title'];
    const client = options['client'];
    const description = options['description'];
    const technologiesStr = options['technologies'];

    if (!title) {
      console.error('Error: --title is required');
      console.error(
        'Usage: bun run agent:portfolio --title "..." --client "..." --description "..." --technologies "React,Node"'
      );
      process.exit(1);
    }

    if (!client) {
      console.error('Error: --client is required');
      process.exit(1);
    }

    if (!description) {
      console.error('Error: --description is required');
      process.exit(1);
    }

    if (!technologiesStr) {
      console.error('Error: --technologies is required');
      process.exit(1);
    }

    const technologies = technologiesStr.split(',').map((t) => t.trim());
    const challenges = options['challenges']?.split(',').map((c) => c.trim());
    const outcomes = options['outcomes']?.split(',').map((o) => o.trim());

    request = {
      title,
      client,
      description,
      technologies,
      category: options['category'],
      githubUrl: options['github-url'],
      liveUrl: options['live-url'],
      projectDetails: {
        challenges,
        outcomes,
      },
    };
  }

  console.log('\nGenerating portfolio entry...\n');
  console.log('Request:', JSON.stringify(request, null, 2));

  const agent = new PortfolioAgent();
  await agent.initialize();

  const result = await agent.generatePortfolio(request);

  if (result.success) {
    console.log('\n[SUCCESS] Portfolio entry generated\n');
    console.log('Content path:', result.contentPath);
    console.log('\nFrontmatter:', JSON.stringify(result.bundle?.frontmatter, null, 2));
    console.log('\nImage prompts:', result.bundle?.imagePrompts);
    if (result.warnings && result.warnings.length > 0) {
      console.log('\nWarnings:', result.warnings);
    }
    console.log('\n--- Content Preview ---\n');
    console.log(result.bundle?.content?.substring(0, 500) + '...');
  } else {
    console.error('\n[ERROR] Failed to generate portfolio entry:', result.error);
    process.exit(1);
  }
}

// =============================================================================
// Tech Radar Agent CLI
// =============================================================================

async function runRadarCli(options: Record<string, string>, interactive: boolean): Promise<void> {
  console.log('\n--- Tech Radar Agent ---\n');

  let radarOptions: TechRadarOptions;

  if (interactive) {
    const rl = createPromptInterface();

    try {
      const title = await prompt(rl, 'Technology name: ');
      if (!title) {
        console.error('Error: Title is required');
        process.exit(1);
      }

      const description = await prompt(rl, 'Description: ');
      if (!description) {
        console.error('Error: Description is required');
        process.exit(1);
      }

      const quadrant = await promptChoice(
        rl,
        'Quadrant',
        ['tools', 'techniques', 'platforms', 'languages-and-frameworks'],
        'tools'
      );

      const ring = await promptChoice<RadarSubtype>(
        rl,
        'Ring',
        ['adopt', 'trial', 'assess', 'hold'],
        'trial'
      );

      const tagsStr = await promptWithDefault(rl, 'Tags (comma-separated)', '');
      const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : undefined;

      radarOptions = {
        title,
        description,
        quadrant,
        ring,
        tags,
        draft: true,
      };
    } finally {
      rl.close();
    }
  } else {
    // Non-interactive mode
    const title = options['title'];
    const description = options['description'];
    const quadrant = options['quadrant'] || 'tools';
    const ring = (options['ring'] || 'trial') as RadarSubtype;

    if (!title) {
      console.error('Error: --title is required');
      console.error(
        'Usage: bun run agent:radar --title "..." --description "..." --quadrant tools --ring trial'
      );
      process.exit(1);
    }

    if (!description) {
      console.error('Error: --description is required');
      process.exit(1);
    }

    if (!['adopt', 'trial', 'assess', 'hold'].includes(ring)) {
      console.error('Error: --ring must be one of: adopt, trial, assess, hold');
      process.exit(1);
    }

    const tags = options['tags']?.split(',').map((t) => t.trim());

    radarOptions = {
      title,
      description,
      quadrant,
      ring,
      tags,
      draft: true,
    };
  }

  console.log('\nGenerating tech radar entry...\n');
  console.log('Options:', JSON.stringify(radarOptions, null, 2));

  const agent = new TechRadarAgent();

  const result = await agent.generateTechRadar(radarOptions);

  console.log('\n[SUCCESS] Tech radar entry generated\n');
  console.log('Bundle path:', result.bundlePath);
  console.log('\nFrontmatter:', JSON.stringify(result.frontmatter, null, 2));
  console.log('\nImage prompts:', result.imagePrompts.prompts);
  console.log('\n--- Content Preview ---\n');
  console.log(result.content.substring(0, 500) + '...');
}

// =============================================================================
// Help
// =============================================================================

function showHelp(): void {
  console.log(`
Content Agents CLI

Usage:
  bun run src/agents/cli/agent-cli.ts <command> [options]

Commands:
  blog        Generate a blog post
  portfolio   Generate a portfolio entry
  radar       Generate a tech radar entry
  help        Show this help message

Blog Options:
  --title       Post title (required)
  --type        Content type: original, curated, embed, project (default: original)
  --summary     Post summary (required)
  --tags        Comma-separated tags
  --categories  Comma-separated categories
  --key-points  Comma-separated key points
  --interactive Enable interactive prompts

Portfolio Options:
  --title         Project title (required)
  --client        Client name (required)
  --description   Project description (required)
  --technologies  Comma-separated technologies (required)
  --category      Project category
  --github-url    GitHub repository URL
  --live-url      Live project URL
  --challenges    Comma-separated challenges
  --outcomes      Comma-separated outcomes
  --interactive   Enable interactive prompts

Radar Options:
  --title        Technology name (required)
  --description  Technology description (required)
  --quadrant     Radar quadrant: tools, techniques, platforms, languages-and-frameworks
  --ring         Radar ring: adopt, trial, assess, hold (default: trial)
  --tags         Comma-separated tags
  --interactive  Enable interactive prompts

Examples:
  bun run src/agents/cli/agent-cli.ts blog --title "My Post" --type original --summary "A summary"
  bun run src/agents/cli/agent-cli.ts portfolio --title "Project" --client "ACME" --description "A project" --technologies "React,Node"
  bun run src/agents/cli/agent-cli.ts radar --title "Bun" --description "Fast JS runtime" --quadrant tools --ring adopt
  bun run src/agents/cli/agent-cli.ts blog --interactive
`);
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { command, interactive, options } = parseArgs(args);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  switch (command) {
    case 'blog':
      await runBlogCli(options, interactive);
      break;
    case 'portfolio':
      await runPortfolioCli(options, interactive);
      break;
    case 'radar':
      await runRadarCli(options, interactive);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
