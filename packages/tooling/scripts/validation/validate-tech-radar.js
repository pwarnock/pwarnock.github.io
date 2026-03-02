#!/usr/bin/env node

/**
 * Tech Radar Frontmatter Validation Script
 *
 * Validates that all tech radar entries have required frontmatter fields
 * and follow the documented structure. Handles both frontmatter formats:
 * - Nested: radar.quadrant / radar.ring (existing entries)
 * - Flat: top-level quadrant / ring (new entries)
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Recursively walk tools directory and collect all index.md files.
 * Skips _index.md (Hugo section file).
 */
function collectToolsIndexMd(rootDir) {
  const results = [];

  (function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile() && path.basename(full) === 'index.md' && path.basename(dir) !== 'tools') {
        results.push(full);
      }
    }
  })(rootDir);

  return results;
}

const REQUIRED_FIELDS = ['title', 'date', 'description'];

const VALID_RINGS = ['adopt', 'trial', 'assess', 'hold'];

const VALID_QUADRANTS = [
  'tools',
  'techniques',
  'platforms',
  'languages-and-frameworks',
  'languages & frameworks',
  'languages',
  'frameworks',
  'infrastructure',
  'libraries',
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
 * Extract quadrant and ring from frontmatter, handling both formats:
 * - Flat: { quadrant: 'tools', ring: 'trial' }
 * - Nested: { radar: { quadrant: 'Tools', ring: 'Trial' } }
 */
function extractRadarFields(frontmatter) {
  if (frontmatter.quadrant && frontmatter.ring) {
    return {
      quadrant: String(frontmatter.quadrant).toLowerCase(),
      ring: String(frontmatter.ring).toLowerCase(),
    };
  }

  if (frontmatter.radar && typeof frontmatter.radar === 'object') {
    return {
      quadrant: frontmatter.radar.quadrant
        ? String(frontmatter.radar.quadrant).toLowerCase()
        : null,
      ring: frontmatter.radar.ring
        ? String(frontmatter.radar.ring).toLowerCase()
        : null,
    };
  }

  return { quadrant: null, ring: null };
}

/**
 * Validate a single tech radar entry
 */
function validateRadarEntry(filePath, frontmatter) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(path.dirname(filePath));

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in frontmatter) || !frontmatter[field]) {
      // Accept 'summary' as alias for 'description'
      if (field === 'description' && frontmatter.summary) {
        continue;
      }
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate title
  if (frontmatter.title && typeof frontmatter.title !== 'string') {
    errors.push('title must be a string');
  }

  // Validate date format
  if (frontmatter.date) {
    const dateStr =
      frontmatter.date instanceof Date
        ? frontmatter.date.toISOString().split('T')[0]
        : String(frontmatter.date);
    if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      errors.push('date must start with YYYY-MM-DD format');
    }
  }

  // Validate description
  if (frontmatter.description && typeof frontmatter.description !== 'string') {
    errors.push('description must be a string');
  }

  // Validate draft field type
  if (frontmatter.draft !== undefined && typeof frontmatter.draft !== 'boolean') {
    errors.push('draft must be a boolean');
  }

  // Extract and validate radar classification
  const { quadrant, ring } = extractRadarFields(frontmatter);

  if (!quadrant && !ring) {
    warnings.push('Missing radar classification (quadrant/ring) — consider adding radar metadata');
  } else {
    if (quadrant && !VALID_QUADRANTS.includes(quadrant)) {
      errors.push(`Invalid quadrant "${quadrant}" — must be one of: ${VALID_QUADRANTS.join(', ')}`);
    }

    if (ring && !VALID_RINGS.includes(ring)) {
      errors.push(`Invalid ring "${ring}" — must be one of: ${VALID_RINGS.join(', ')}`);
    }

    if (quadrant && !ring) {
      errors.push('quadrant specified but ring is missing');
    }

    if (ring && !quadrant) {
      errors.push('ring specified but quadrant is missing');
    }
  }

  // Warn on missing tags
  if (!frontmatter.tags || (Array.isArray(frontmatter.tags) && frontmatter.tags.length === 0)) {
    warnings.push('Consider adding tags for discoverability');
  }

  return { errors, warnings, fileName };
}

/**
 * Main validation function
 */
async function validateTechRadar() {
  console.log('📡 Validating tech radar frontmatter...\n');

  // Navigate from packages/tooling/scripts/validation/ to packages/site/content/tools/
  const toolsDir = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '..', '..', '..', 'site', 'content', 'tools'
  );

  const files = collectToolsIndexMd(toolsDir);

  if (files.length === 0) {
    console.log('❌ No tech radar files found');
    process.exit(1);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter) {
      console.log(`❌ ${path.basename(path.dirname(file))}: Invalid or missing frontmatter`);
      totalErrors++;
      continue;
    }

    const { errors, warnings, fileName } = validateRadarEntry(file, frontmatter);

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
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ Validation failed — fix errors before committing');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Validation passed with warnings — consider fixing them');
    process.exit(0);
  } else {
    console.log('\n✅ All tech radar frontmatter is valid!');
    process.exit(0);
  }
}

// Run validation
validateTechRadar().catch(error => {
  console.error('❌ Validation error:', error);
  process.exit(1);
});

export { validateTechRadar, validateRadarEntry, parseFrontmatter, extractRadarFields, VALID_QUADRANTS, VALID_RINGS };
