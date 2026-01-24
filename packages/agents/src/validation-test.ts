/**
 * Integration test: Validate agents generate content that passes validation scripts
 */

import { BlogAgent } from './blog/blog-agent.js';
import { PortfolioAgent } from './portfolio/portfolio-agent.js';
import { TechRadarAgent } from './tech-radar/tech-radar-agent.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testBlogAgent() {
  console.log('\n=== T11: Blog Agent Validation Test ===\n');

  const agent = new BlogAgent();

  const result = await agent.generateBlogPost({
    title: 'Test Blog Post for Validation',
    date: new Date('2025-01-15'),
    summary: 'This is a test blog post to validate that the agent generates content that passes validation scripts',
    contentType: 'original',
    tags: ['testing', 'validation'],
    categories: ['development']
  });

  console.log('Generated bundle path:', result.bundlePath);

  if (!result.bundlePath) {
    throw new Error('Blog agent failed to generate content: ' + (result.error || 'unknown error'));
  }

  // The blog agent returns the directory path (e.g., content/blog/posts/.../index.md)
  // The validation script expects the directory path
  const bundleDir = result.bundlePath.replace('/index.md', '');

  // Run validate-blog-post.sh
  try {
    const output = execSync(`scripts/validate-blog-post.sh "${bundleDir}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ Blog validation passed!');
    console.log(output.substring(0, 200) + '...');
    return true;
  } catch (error: any) {
    console.error('❌ Blog validation failed!');
    console.error(error.stdout || error.stderr || error.message);
    return false;
  }
}

async function testPortfolioAgent() {
  console.log('\n=== T13: Portfolio Agent Validation Test ===\n');

  const agent = new PortfolioAgent();
  await agent.initialize();

  const result = await agent.generatePortfolio({
    title: 'Test Portfolio Project',
    client: 'Test Client Inc.',
    date: new Date('2025-01-15'),
    description: 'A test portfolio project to validate content generation',
    technologies: ['TypeScript', 'React', 'Node.js'],
    completionDate: new Date('2025-01-01'),
    category: 'Web Development',
    draft: true
  });

  console.log('Generated content path:', result.contentPath);

  if (!result.contentPath) {
    throw new Error('Portfolio agent failed to generate content: ' + (result.error || 'unknown error'));
  }

  // Run validate-portfolio-frontmatter.js
  try {
    const output = execSync(`node scripts/validate-portfolio-frontmatter.js "${result.contentPath}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ Portfolio validation passed!');
    console.log(output.substring(0, 200) + '...');
    return true;
  } catch (error: any) {
    console.error('❌ Portfolio validation failed!');
    console.error(error.stdout || error.stderr || error.message);
    return false;
  }
}

async function testTechRadarAgent() {
  console.log('\n=== T15: Tech Radar Agent Validation Test ===\n');

  const agent = new TechRadarAgent();

  const result = await agent.generateTechRadar({
    title: 'Test Technology',
    date: new Date('2025-01-15'),
    description: 'A test technology for validation',
    quadrant: 'languages-frameworks',
    ring: 'adopt',
    tags: ['testing'],
    draft: true
  });

  console.log('Generated bundle path:', result.bundlePath);

  if (!result.bundlePath) {
    throw new Error('Tech radar agent failed to generate content');
  }

  // The bundlePath is already the full path to index.md
  const indexPath = result.bundlePath;

  if (!fs.existsSync(indexPath)) {
    throw new Error(`Index file not found: ${indexPath}`);
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    throw new Error('No frontmatter found in generated content');
  }

  const frontmatter = frontmatterMatch[1];
  const requiredFields = ['title', 'date', 'draft', 'description', 'quadrant', 'ring'];

  for (const field of requiredFields) {
    if (!frontmatter.includes(`${field}:`)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  console.log('✅ Tech radar validation passed!');
  console.log('Frontmatter contains all required fields:', requiredFields.join(', '));
  return true;
}

async function cleanup() {
  console.log('\n=== Cleaning up test content ===\n');

  // Remove generated test content
  const testPaths = [
    'content/blog/posts/2025-01-15-test-blog-post-for-validation',
    'content/portfolio/test-portfolio-project',
    'content/tools/test-technology'
  ];

  // Also clean up the index.md paths
  const testFiles = [
    'content/blog/posts/2025-01-15-test-blog-post-for-validation/index.md',
    'content/portfolio/test-portfolio-project/index.md',
    'content/tools/test-technology/index.md'
  ];

  for (const testPath of testPaths) {
    const fullPath = path.join(process.cwd(), testPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Removed: ${testPath}`);
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  User Acceptance Testing: Agent Validation Integration     ║');
  console.log('║  T11, T13, T15 - Validate agents pass validation scripts    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    blog: false,
    portfolio: false,
    techRadar: false
  };

  try {
    results.blog = await testBlogAgent();
  } catch (error: any) {
    console.error('Blog agent test error:', error.message);
    results.blog = false;
  }

  try {
    results.portfolio = await testPortfolioAgent();
  } catch (error: any) {
    console.error('Portfolio agent test error:', error.message);
    results.portfolio = false;
  }

  try {
    results.techRadar = await testTechRadarAgent();
  } catch (error: any) {
    console.error('Tech radar agent test error:', error.message);
    results.techRadar = false;
  }

  await cleanup();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Validation Results Summary                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`T11 (Blog Agent):        ${results.blog ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`T13 (Portfolio Agent):   ${results.portfolio ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`T15 (Tech Radar Agent):  ${results.techRadar ? '✅ PASSED' : '❌ FAILED'}`);

  const allPassed = results.blog && results.portfolio && results.techRadar;

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ ALL VALIDATION TESTS PASSED!');
    console.log('All agents generate valid content that passes validation scripts.');
  } else {
    console.log('❌ SOME VALIDATION TESTS FAILED');
    console.log('Please review the errors above.');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);
