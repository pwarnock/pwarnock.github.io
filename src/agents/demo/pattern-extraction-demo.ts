#!/usr/bin/env bun
/**
 * Pattern Extraction Demo
 *
 * Demonstrates how the pattern extraction system works
 * by processing various types of feedback and showing
 * what gets extracted.
 */

import {
  extractPatternsFromFeedback,
  generatePatternSummary
} from '../utils/pattern-extractor.js';

console.log('=== Pattern Extraction Demo ===\n');

// Example 1: Blog post feedback
console.log('Example 1: Blog Post Feedback');
console.log('-'.repeat(50));
const feedback1 = `
  This is too formal and academic. Make it more conversational.
  Don't use AI-sounding phrases like "delve into" or "tapestry".
  I love the personal stories - keep those!
  Avoid starting sentences with "It is important to note".
  Use "I think" instead of "I believe" for a more casual tone.
`;

const result1 = extractPatternsFromFeedback(feedback1);
console.log('Summary:', generatePatternSummary(result1));
console.log('Vocabulary:', result1.vocabulary);
console.log('Dos:', result1.dos);
console.log('Donts:', result1.donts);
console.log('Corrections:', result1.corrections.map(c => `${c.category}: ${c.improvement}`));
console.log();

// Example 2: Portfolio feedback
console.log('Example 2: Portfolio Feedback');
console.log('-'.repeat(50));
const feedback2 = `
  Great use of metrics! "Increased by 50%" is excellent.
  Be more confident in your achievements.
  Don't downplay your role - you led this project.
  Use more active voice throughout.
`;

const result2 = extractPatternsFromFeedback(feedback2);
console.log('Summary:', generatePatternSummary(result2));
console.log('Vocabulary:', result2.vocabulary);
console.log('Dos:', result2.dos);
console.log('Donts:', result2.donts);
console.log();

// Example 3: Tech radar feedback
console.log('Example 3: Tech Radar Feedback');
console.log('-'.repeat(50));
const feedback3 = `
  Good technical depth on the ecosystem.
  This is too positive - mention the drawbacks.
  Avoid hype-driven language.
  Include more adoption considerations.
`;

const result3 = extractPatternsFromFeedback(feedback3);
console.log('Summary:', generatePatternSummary(result3));
console.log('Vocabulary:', result3.vocabulary);
console.log('Dos:', result3.dos);
console.log('Donts:', result3.donts);
console.log('Corrections:', result3.corrections.map(c => `${c.category}: ${c.improvement}`));
console.log();

// Example 4: Concise correction
console.log('Example 4: Concise Correction');
console.log('-'.repeat(50));
const feedback4 = 'Make this more concise. Trim the wordiness.';

const result4 = extractPatternsFromFeedback(feedback4);
console.log('Summary:', generatePatternSummary(result4));
console.log('Corrections:', result4.corrections.map(c => `${c.category}: ${c.improvement}`));
console.log();

// Example 5: Style preference
console.log('Example 5: Style Preference');
console.log('-'.repeat(50));
const feedback5 = 'Prefer "I think" over "I believe" for a more casual tone.';

const result5 = extractPatternsFromFeedback(feedback5);
console.log('Summary:', generatePatternSummary(result5));
console.log('Vocabulary:', result5.vocabulary);
console.log('Corrections:', result5.corrections.map(c => `${c.category}: ${c.improvement}`));
console.log();

console.log('=== Demo Complete ===');
