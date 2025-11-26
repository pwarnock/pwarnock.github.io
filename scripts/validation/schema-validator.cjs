#!/usr/bin/env node

/**
 * Schema.org Validation Script
 * Tests JSON-LD structured data output for all content types
 */

const fs = require('fs');

// Test content types
const testCases = [
  {
    name: 'Original Content',
    file: 'public/blog/posts/test-original-content/index.html',
    expectedType: 'Article',
    expectedAuthor: 'Peter Warnock',
    hasPublisher: true,
  },
  {
    name: 'Curated Content',
    file: 'public/blog/posts/test-curated-content/index.html',
    expectedType: 'Article',
    expectedAuthor: 'Test Author',
    hasIsBasedOn: true,
  },
  {
    name: 'Embed Content',
    file: 'public/blog/posts/test-embed-content/index.html',
    expectedType: 'Article',
    expectedAuthor: 'Test Newsletter',
    hasEmbedUrl: true,
  },
];

function extractStructuredData(html) {
  const regex = /<script type="application\/ld\+json">([^<]+)<\/script>/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    try {
      // Clean up the JSON string - remove escaped newlines and quotes
      let jsonStr = match[1]
        .replace(/\\n/g, '')
        .replace(/\\"/g, '"')
        .replace(/"\n/g, '"')
        .trim();
      
      console.log(`Found JSON-LD: ${jsonStr.substring(0, 100)}...`);
      
      const data = JSON.parse(jsonStr);
      if (data['@type'] === 'Article') {
        matches.push(data);
      }
    } catch (e) {
      console.warn('Failed to parse JSON-LD:', e.message);
      console.warn('Raw match:', match[1].substring(0, 200));
    }
  }
  
  return matches;
}
    } catch (e) {
      console.warn('Failed to parse JSON-LD:', e.message);
    }
  }

  return matches;
}

function validateStructuredData(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📁 File: ${testCase.file}`);

  if (!fs.existsSync(testCase.file)) {
    console.log(`❌ File not found: ${testCase.file}`);
    return false;
  }

  const html = fs.readFileSync(testCase.file, 'utf8');
  const structuredData = extractStructuredData(html);

  if (structuredData.length === 0) {
    console.log('❌ No Article structured data found');
    return false;
  }

  const article = structuredData[0];
  let passed = true;

  // Check type
  if (article['@type'] !== testCase.expectedType) {
    console.log(`❌ Type mismatch: expected ${testCase.expectedType}, got ${article['@type']}`);
    passed = false;
  } else {
    console.log(`✅ Type correct: ${article['@type']}`);
  }

  // Check author
  if (article.author && article.author.name !== testCase.expectedAuthor) {
    console.log(
      `❌ Author mismatch: expected ${testCase.expectedAuthor}, got ${article.author?.name}`
    );
    passed = false;
  } else {
    console.log(`✅ Author correct: ${article.author?.name}`);
  }

  // Check specific properties
  if (testCase.hasIsBasedOn && !article.isBasedOn) {
    console.log('❌ Missing isBasedOn property');
    passed = false;
  } else if (testCase.hasIsBasedOn) {
    console.log(`✅ isBasedOn present: ${article.isBasedOn}`);
  }

  if (testCase.hasEmbedUrl && !article.embedUrl) {
    console.log('❌ Missing embedUrl property');
    passed = false;
  } else if (testCase.hasEmbedUrl) {
    console.log(`✅ embedUrl present: ${article.embedUrl}`);
  }

  if (testCase.hasPublisher && !article.publisher) {
    console.log('❌ Missing publisher property');
    passed = false;
  } else if (testCase.hasPublisher) {
    console.log(`✅ Publisher present: ${article.publisher?.name}`);
  }

  // Check required fields
  const requiredFields = ['headline', 'datePublished', 'mainEntityOfPage'];
  for (const field of requiredFields) {
    if (!article[field]) {
      console.log(`❌ Missing required field: ${field}`);
      passed = false;
    } else {
      console.log(`✅ Required field present: ${field}`);
    }
  }

  return passed;
}

function main() {
  console.log('🔍 Schema.org Validation for Content Type System');
  console.log('='.repeat(50));

  let allPassed = true;

  for (const testCase of testCases) {
    const passed = validateStructuredData(testCase);
    allPassed = allPassed && passed;
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All schema.org validation tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some validation tests failed.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractStructuredData, validateStructuredData };
