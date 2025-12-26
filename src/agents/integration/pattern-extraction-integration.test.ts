/**
 * Integration test for pattern extraction with VoiceLearningSystem
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { VoiceLearningSystem } from '../core/voice-learning.js';
import type { ContentType } from '../types/index.js';

describe('Pattern Extraction Integration', () => {
  const vls = new VoiceLearningSystem();
  const testContentType: ContentType = 'blog';

  beforeAll(async () => {
    // Ensure we have a style doc to work with
    const styleDoc = await vls.loadStyleDoc(testContentType);
    if (!styleDoc) {
      const defaultStyle = vls.initializeStyleDoc(testContentType, 'Test tone');
      await vls.saveStyleDoc(defaultStyle);
    }
  });

  it('should extract patterns from real-world feedback and update style doc', async () => {
    const feedback = `
      This is too formal and academic. Make it more conversational.
      Don't use AI-sounding phrases like "delve into" or "tapestry".
      I love the personal stories - keep those!
      Avoid starting sentences with "It is important to note".
      Use "I think" instead of "I believe" for a more casual tone.
    `;

    const result = await vls.extractPatternsFromFeedback(testContentType, feedback, 'negative');

    // Verify extraction succeeded
    expect(result.success).toBe(true);
    expect(result.summary).toBeTruthy();

    // Verify patterns were extracted
    expect(result.patternsExtracted.vocabulary).toBeGreaterThan(0);
    expect(result.patternsExtracted.corrections).toBeGreaterThan(0);

    // Verify the style doc was updated
    const updatedStyle = await vls.loadStyleDoc(testContentType);
    expect(updatedStyle).toBeDefined();
    expect(updatedStyle!.vocabulary.length).toBeGreaterThan(0);
  });

  it('should handle positive feedback correctly', async () => {
    const feedback = 'Great conversational tone! Love the personal stories and authentic voice.';

    const result = await vls.extractPatternsFromFeedback(testContentType, feedback, 'positive');

    expect(result.success).toBe(true);
    expect(result.patternsExtracted.dos).toBeGreaterThan(0);
  });

  it('should identify common correction patterns', async () => {
    const feedback = 'This is too long and wordy. Make it more concise.';

    const result = await vls.extractPatternsFromFeedback(testContentType, feedback, 'negative');

    expect(result.success).toBe(true);
    expect(result.patternsExtracted.corrections).toBeGreaterThan(0);

    // Load updated style doc and verify corrections were learned
    const styleDoc = await vls.loadStyleDoc(testContentType);
    expect(styleDoc).toBeDefined();

    // Check that donts were added
    if (styleDoc) {
      const hasConcisenessFeedback = styleDoc.donts.some(d =>
        d.toLowerCase().includes('wordy') || d.toLowerCase().includes('long')
      );
      expect(hasConcisenessFeedback).toBe(true);
    }
  });

  it('should extract vocabulary from quoted phrases', async () => {
    const feedback = 'Avoid "delve into" and "tapestry" - use simpler language instead.';

    const result = await vls.extractPatternsFromFeedback(testContentType, feedback, 'negative');

    expect(result.success).toBe(true);
    expect(result.patternsExtracted.vocabulary).toBeGreaterThan(0);

    const styleDoc = await vls.loadStyleDoc(testContentType);
    expect(styleDoc).toBeDefined();

    if (styleDoc) {
      expect(styleDoc.vocabulary).toContain('delve into');
      expect(styleDoc.vocabulary).toContain('tapestry');
    }
  });

  it('should merge patterns without duplicates', async () => {
    // Get initial state
    const initialStyle = await vls.loadStyleDoc(testContentType);
    const initialVocabCount = initialStyle!.vocabulary.length;

    // Add feedback with existing vocabulary
    const feedback = 'Use "delve into" sparingly.';

    await vls.extractPatternsFromFeedback(testContentType, feedback, 'negative');

    // Get updated state
    const updatedStyle = await vls.loadStyleDoc(testContentType);

    // Vocabulary count should not increase (duplicate was filtered)
    expect(updatedStyle!.vocabulary.length).toBe(initialVocabCount);
  });

  it('should provide learning progress statistics', async () => {
    const progress = await vls.getLearningProgress(testContentType);

    expect(progress.vocabularyCount).toBeGreaterThanOrEqual(0);
    expect(progress.patternCount).toBeGreaterThanOrEqual(0);
    expect(progress.doCount).toBeGreaterThanOrEqual(0);
    expect(progress.dontCount).toBeGreaterThanOrEqual(0);
    expect(progress.lastUpdated).toBeInstanceOf(Date);
  });

  it('should handle multiple feedback sessions accumulating knowledge', async () => {
    const session1 = 'Use active voice. Be concise.';
    const session2 = 'Avoid jargon. Keep it simple.';
    const session3 = 'Prefer "I think" over "I believe".';

    await vls.extractPatternsFromFeedback(testContentType, session1, 'positive');
    await vls.extractPatternsFromFeedback(testContentType, session2, 'negative');
    await vls.extractPatternsFromFeedback(testContentType, session3, 'positive');

    const finalStyle = await vls.loadStyleDoc(testContentType);
    expect(finalStyle).toBeDefined();

    // Should have accumulated patterns from all sessions
    expect(finalStyle!.dos.length + finalStyle!.donts.length).toBeGreaterThan(0);
  });
});
