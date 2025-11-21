#!/usr/bin/env node

/**
 * Portfolio Frontmatter Validation Script
 *
 * Validates that all portfolio items have required frontmatter fields
 * and follow the documented structure.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import yaml from 'js-yaml';

const REQUIRED_FIELDS = [
  'title',
  'date',
  'draft',
  'description',
  'client',
  'technologies',
  'completion_date',
  'category',
];

const RECOMMENDED_TECHNOLOGIES = [
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'JavaScript',
  'TypeScript',
  'HTML5',
  'CSS3',
  'SASS',
  'Tailwind CSS',
  'Bootstrap',
  'Express.js',
  'Django',
  'Flask',
  'PostgreSQL',
  'MongoDB',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'Git',
  'Webpack',
  'Vite',
  'Hugo',
  'Jekyll',
  'Next.js',
  'Nuxt.js',
  'Supabase',
  'Vercel',
  'OpenAI',
  'SendGrid',
  'Laravel',
  'Filament',
  'Astro',
  'Starlight',
  'Bun',
];

const RECOMMENDED_CATEGORIES = [
  'Web App',
  'Mobile App',
  'Desktop App',
  'API',
  'Library',
  'CLI Tool',
  'Educational Game',
  'Data Visualization',
  'E-commerce',
  'CMS',
  'SaaS',
  'Prototype',
  'Open Source',
];

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);

  if (!match) return null;

  try {
    return yaml.load(match[1]);
  } catch (error) {
    console.error('YAML parsing error:', error);
    return null;
  }
}

/**
 * Validate a single portfolio item
 */
function validatePortfolioItem(filePath, frontmatter) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(path.dirname(filePath));

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in frontmatter)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate specific fields
  if (frontmatter.title && typeof frontmatter.title !== 'string') {
    errors.push('title must be a string');
  }

  if (frontmatter.date) {
    const dateStr =
      frontmatter.date instanceof Date
        ? frontmatter.date.toISOString().split('T')[0]
        : String(frontmatter.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      errors.push('date must be in YYYY-MM-DD format');
    }
  }

  if (frontmatter.draft !== undefined && typeof frontmatter.draft !== 'boolean') {
    errors.push('draft must be a boolean');
  }

  if (frontmatter.description && typeof frontmatter.description !== 'string') {
    errors.push('description must be a string');
  }

  if (frontmatter.client && typeof frontmatter.client !== 'string') {
    errors.push('client must be a string');
  }

  if (frontmatter.technologies) {
    if (!Array.isArray(frontmatter.technologies)) {
      errors.push('technologies must be an array');
    } else {
      // Check for recommended technologies
      const unknownTech = frontmatter.technologies.filter(
        tech => !RECOMMENDED_TECHNOLOGIES.includes(tech)
      );
      if (unknownTech.length > 0) {
        warnings.push(`Unknown technologies (consider standardizing): ${unknownTech.join(', ')}`);
      }
    }
  }

  if (frontmatter.completion_date && !/^\d{4}-\d{2}$/.test(frontmatter.completion_date)) {
    errors.push('completion_date must be in YYYY-MM format');
  }

  if (frontmatter.category) {
    if (typeof frontmatter.category !== 'string') {
      errors.push('category must be a string');
    } else if (!RECOMMENDED_CATEGORIES.includes(frontmatter.category)) {
      warnings.push(`Unknown category (consider using: ${RECOMMENDED_CATEGORIES.join(', ')})`);
    }
  }

  // Check for deprecated demo_url
  if (frontmatter.demo_url) {
    errors.push('Use "live_url" instead of "demo_url"');
  }

  // Optional field recommendations
  if (!frontmatter.github_url) {
    warnings.push('Consider adding github_url for repository link');
  }

  if (!frontmatter.live_url) {
    warnings.push('Consider adding live_url for live demo link');
  }

  // URL validation
  if (frontmatter.github_url && !/^https?:\/\/github\.com\//.test(frontmatter.github_url)) {
    warnings.push('github_url should be a valid GitHub URL');
  }

  if (frontmatter.live_url && !/^https?:\/\/.+/.test(frontmatter.live_url)) {
    warnings.push('live_url should be a valid HTTP/HTTPS URL');
  }

  return { errors, warnings, fileName };
}

/**
 * Main validation function
 */
async function validatePortfolio() {
  console.log('🔍 Validating portfolio frontmatter...\n');

  const portfolioDir = path.join(
    path.dirname(new URL(import.meta.url).pathname), // eslint-disable-line no-undef
    '..',
    'content',
    'portfolio'
  );
  const pattern = path.join(portfolioDir, '**', 'index.md');

  const files = await glob(pattern, { nodir: true });

  if (files.length === 0) {
    console.log('❌ No portfolio files found');
    process.exit(1);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(file, 'utf8');
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter) {
      console.log(`❌ ${path.basename(path.dirname(file))}: Invalid or missing frontmatter`);
      totalErrors++;
      continue;
    }

    const { errors, warnings, fileName } = validatePortfolioItem(file, frontmatter);

    if (errors.length > 0 || warnings.length > 0) {
      console.log(`📄 ${fileName}:`);
    }

    errors.forEach(error => {
      console.log(`  ❌ ${error}`);
      totalErrors++;
    });

    warnings.forEach(warning => {
      console.log(`  ⚠️  ${warning}`);
      totalWarnings++;
    });

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`✅ ${fileName}: Valid`);
    } else {
      console.log('');
    }
  }

  console.log(`\n📊 Validation Summary:`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ Validation failed - fix errors before committing');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Validation passed with warnings - consider fixing them');
    process.exit(0);
  } else {
    console.log('\n✅ All portfolio frontmatter is valid!');
    process.exit(0);
  }
}

// Run validation
validatePortfolio().catch(error => {
  console.error('❌ Validation error:', error);
  process.exit(1);
});

export { validatePortfolio, validatePortfolioItem, parseFrontmatter };
