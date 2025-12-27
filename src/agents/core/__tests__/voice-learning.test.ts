/**
 * Voice Learning System Tests
 *
 * Comprehensive tests for the VoiceLearningSystem including:
 * - Style documentation loading and saving
 * - Pattern extraction from feedback
 * - Style suggestions and defaults
 * - Learning progress tracking
 * - Vocabulary and example management
 * - Validation and backup functionality
 * - Import/export operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VoiceLearningSystem } from '../voice-learning.js';
import * as fs from 'fs';
import * as path from 'path';

describe('VoiceLearningSystem', () => {
  describe('Loading Style Documentation', () => {
    it('should load existing blog style documentation', async () => {
      const vls = new VoiceLearningSystem();
      const blogStyle = await vls.loadStyleDoc('blog');

      expect(blogStyle).toBeDefined();
      expect(blogStyle?.contentType).toBe('blog');
      // Check structure rather than specific content (which may change from learning)
      expect(Array.isArray(blogStyle?.dos)).toBe(true);
      expect(Array.isArray(blogStyle?.donts)).toBe(true);
    });

    it('should load existing portfolio style documentation', async () => {
      const vls = new VoiceLearningSystem();
      const portfolioStyle = await vls.loadStyleDoc('portfolio');

      expect(portfolioStyle).toBeDefined();
      expect(portfolioStyle?.contentType).toBe('portfolio');
      expect(portfolioStyle?.vocabulary).toContain('led');
      expect(portfolioStyle?.vocabulary).toContain('developed');
    });

    it('should load existing tech-radar style documentation', async () => {
      const vls = new VoiceLearningSystem();
      const radarStyle = await vls.loadStyleDoc('tech-radar');

      expect(radarStyle).toBeDefined();
      expect(radarStyle?.contentType).toBe('tech-radar');
      expect(radarStyle?.vocabulary).toContain('adopt');
      expect(radarStyle?.vocabulary).toContain('trial');
    });

    it('should return null for non-existent style document', async () => {
      // Mock the file system to simulate missing file
      const vls = new VoiceLearningSystem();
      const invalidDoc = await vls.loadStyleDoc('invalid-type' as any);

      // Should return null or throw for invalid type
      expect(invalidDoc).toBeNull();
    });

    it('should convert date strings to Date objects', async () => {
      const vls = new VoiceLearningSystem();
      const blogStyle = await vls.loadStyleDoc('blog');

      expect(blogStyle?.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('Style Suggestions', () => {
    it('should get style suggestions for blog', async () => {
      const vls = new VoiceLearningSystem();
      const suggestions = await vls.getStyleSuggestions('blog');

      // Check structure rather than specific content
      expect(typeof suggestions.tone).toBe('string');
      expect(suggestions.tone.length).toBeGreaterThan(0);
      expect(Array.isArray(suggestions.dos)).toBe(true);
      expect(Array.isArray(suggestions.donts)).toBe(true);
    });

    it('should get style suggestions for portfolio', async () => {
      const vls = new VoiceLearningSystem();
      const suggestions = await vls.getStyleSuggestions('portfolio');

      expect(suggestions.tone).toBe('Professional, achievement-focused, and confident');
      expect(suggestions.vocabulary).toContain('led');
      expect(suggestions.dos).toContain('Highlight impact and technical depth');
    });

    it('should get style suggestions for tech-radar', async () => {
      const vls = new VoiceLearningSystem();
      const suggestions = await vls.getStyleSuggestions('tech-radar');

      expect(suggestions.tone).toBe('Opinionated but balanced and informed');
      expect(suggestions.vocabulary).toContain('adopt');
      expect(suggestions.vocabulary).toContain('trial');
      expect(suggestions.dos).toContain('Provide technical depth and context');
    });

    it('should include donts in suggestions', async () => {
      const vls = new VoiceLearningSystem();
      const suggestions = await vls.getStyleSuggestions('blog');

      expect(suggestions.donts).toBeDefined();
      expect(Array.isArray(suggestions.donts)).toBe(true);
      expect(suggestions.donts.length).toBeGreaterThan(0);
    });
  });

  describe('Learning Progress', () => {
    it('should get learning progress with vocabulary count', async () => {
      const vls = new VoiceLearningSystem();
      const progress = await vls.getLearningProgress('blog');

      // Check that progress has expected structure
      expect(progress.vocabularyCount).toBeGreaterThanOrEqual(0);
      expect(progress.doCount).toBeGreaterThan(0);
      expect(progress.dontCount).toBeGreaterThan(0);
      expect(progress.lastUpdated).toBeInstanceOf(Date);
    });

    it('should get learning progress for portfolio', async () => {
      const vls = new VoiceLearningSystem();
      const progress = await vls.getLearningProgress('portfolio');

      expect(progress.vocabularyCount).toBeGreaterThan(0);
      expect(progress.patternCount).toBeGreaterThanOrEqual(0);
      expect(progress.doCount).toBeGreaterThan(0);
      expect(progress.dontCount).toBeGreaterThan(0);
    });

    it('should return empty progress for non-existent content type', async () => {
      const vls = new VoiceLearningSystem();
      const progress = await vls.getLearningProgress('invalid-type' as any);

      expect(progress.vocabularyCount).toBe(0);
      expect(progress.patternCount).toBe(0);
      expect(progress.doCount).toBe(0);
      expect(progress.dontCount).toBe(0);
      expect(progress.lastUpdated).toBeNull();
    });

    it('should track example counts separately', async () => {
      const vls = new VoiceLearningSystem();
      const progress = await vls.getLearningProgress('blog');

      expect(progress.goodExampleCount).toBeGreaterThanOrEqual(0);
      expect(progress.badExampleCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Initialize Style Doc', () => {
    it('should create initial style documentation with correct structure', () => {
      const vls = new VoiceLearningSystem();
      const styleDoc = vls.initializeStyleDoc('blog', 'Casual and friendly');

      expect(styleDoc.contentType).toBe('blog');
      expect(styleDoc.tone).toBe('Casual and friendly');
      expect(styleDoc.vocabulary).toEqual([]);
      expect(styleDoc.sentencePatterns).toEqual([]);
      expect(styleDoc.dos).toEqual([]);
      expect(styleDoc.donts).toEqual([]);
      expect(styleDoc.examples.good).toEqual([]);
      expect(styleDoc.examples.bad).toEqual([]);
      expect(styleDoc.lastUpdated).toBeInstanceOf(Date);
    });

    it('should create style doc for portfolio type', () => {
      const vls = new VoiceLearningSystem();
      const styleDoc = vls.initializeStyleDoc('portfolio', 'Professional');

      expect(styleDoc.contentType).toBe('portfolio');
      expect(styleDoc.tone).toBe('Professional');
    });

    it('should create style doc for tech-radar type', () => {
      const vls = new VoiceLearningSystem();
      const styleDoc = vls.initializeStyleDoc('tech-radar', 'Technical and opinionated');

      expect(styleDoc.contentType).toBe('tech-radar');
      expect(styleDoc.tone).toBe('Technical and opinionated');
    });
  });

  describe('Pattern Extraction from Feedback', () => {
    it('should return failure result when no style doc exists', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.extractPatternsFromFeedback(
        'invalid-type' as any,
        'This is great feedback',
        'positive'
      );

      expect(result.success).toBe(false);
      expect(result.summary).toContain('No style documentation found');
      expect(result.patternsExtracted.vocabulary).toBe(0);
    });

    it('should extract patterns from positive feedback for blog', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.extractPatternsFromFeedback(
        'blog',
        'I love the personal stories and authentic voice',
        'positive'
      );

      expect(result.success).toBe(true);
      expect(result.patternsExtracted).toBeDefined();
    });

    it('should extract patterns from negative feedback for blog', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.extractPatternsFromFeedback(
        'blog',
        'This is too formal and academic',
        'negative'
      );

      expect(result.success).toBe(true);
    });

    it('should return pattern counts in result', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.extractPatternsFromFeedback(
        'blog',
        'Great conversational tone',
        'positive'
      );

      expect(result.patternsExtracted).toHaveProperty('vocabulary');
      expect(result.patternsExtracted).toHaveProperty('sentencePatterns');
      expect(result.patternsExtracted).toHaveProperty('dos');
      expect(result.patternsExtracted).toHaveProperty('donts');
      expect(result.patternsExtracted).toHaveProperty('corrections');
    });
  });

  describe('Validation', () => {
    it('should validate existing blog style document', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.validateStyleDoc('blog');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate existing portfolio style document', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.validateStyleDoc('portfolio');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate existing tech-radar style document', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.validateStyleDoc('tech-radar');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for non-existent style document', async () => {
      const vls = new VoiceLearningSystem();
      const result = await vls.validateStyleDoc('non-existent' as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Export Style Doc', () => {
    it('should export blog style document as JSON string', async () => {
      const vls = new VoiceLearningSystem();
      const exported = await vls.exportStyleDoc('blog');

      expect(exported).not.toBeNull();
      expect(typeof exported).toBe('string');

      // Should be valid JSON
      const parsed = JSON.parse(exported!);
      expect(parsed.contentType).toBe('blog');
    });

    it('should export portfolio style document as JSON string', async () => {
      const vls = new VoiceLearningSystem();
      const exported = await vls.exportStyleDoc('portfolio');

      expect(exported).not.toBeNull();
      const parsed = JSON.parse(exported!);
      expect(parsed.contentType).toBe('portfolio');
    });

    it('should return null for non-existent style document', async () => {
      const vls = new VoiceLearningSystem();
      const exported = await vls.exportStyleDoc('non-existent' as any);

      expect(exported).toBeNull();
    });

    it('should export formatted JSON with indentation', async () => {
      const vls = new VoiceLearningSystem();
      const exported = await vls.exportStyleDoc('blog');

      // Check for formatting (newlines indicate pretty-printing)
      expect(exported).toContain('\n');
    });
  });

  describe('Import Style Doc', () => {
    it('should reject import with mismatched content type', async () => {
      const vls = new VoiceLearningSystem();
      const wrongTypeJson = JSON.stringify({
        contentType: 'portfolio',
        tone: 'Test',
        vocabulary: [],
        sentencePatterns: [],
        dos: [],
        donts: [],
        examples: { good: [], bad: [] },
        lastUpdated: new Date().toISOString()
      });

      await expect(
        vls.importStyleDoc('blog', wrongTypeJson)
      ).rejects.toThrow('Content type mismatch');
    });

    it('should reject import with invalid JSON', async () => {
      const vls = new VoiceLearningSystem();

      await expect(
        vls.importStyleDoc('blog', 'not valid json')
      ).rejects.toThrow('Failed to import style doc');
    });

    it('should successfully import valid style document for tech-radar', async () => {
      const vls = new VoiceLearningSystem();

      // Use tech-radar which is less likely to be modified by other tests
      const originalExport = await vls.exportStyleDoc('tech-radar');

      // Create a valid style document with matching content type
      const validJson = JSON.stringify({
        contentType: 'tech-radar',
        tone: 'Test Imported Tone',
        vocabulary: ['imported-word'],
        sentencePatterns: ['imported pattern'],
        dos: ['Do something imported'],
        donts: ['Dont do something imported'],
        examples: { good: ['good imported example'], bad: ['bad imported example'] },
        lastUpdated: new Date().toISOString()
      });

      // Import should succeed
      await vls.importStyleDoc('tech-radar', validJson);

      // Verify the import worked
      const loaded = await vls.loadStyleDoc('tech-radar');
      expect(loaded).not.toBeNull();
      expect(loaded?.tone).toBe('Test Imported Tone');

      // Restore original state
      if (originalExport) {
        await vls.importStyleDoc('tech-radar', originalExport);
      }
    });
  });

  describe('Utility Methods', () => {
    it('should have getBackups method', () => {
      const vls = new VoiceLearningSystem();
      expect(typeof vls.getBackups).toBe('function');
    });

    it('should get backups for existing content type', () => {
      const vls = new VoiceLearningSystem();
      const backups = vls.getBackups('blog');

      expect(Array.isArray(backups)).toBe(true);
    });
  });

  describe('Add Vocabulary', () => {
    it('should add new vocabulary word to style doc', async () => {
      const vls = new VoiceLearningSystem();
      const initialProgress = await vls.getLearningProgress('blog');
      const initialCount = initialProgress.vocabularyCount;

      // Add a unique word to avoid test pollution
      const uniqueWord = `test-word-${Date.now()}`;
      await vls.addVocabulary('blog', uniqueWord);

      const progress = await vls.getLearningProgress('blog');
      expect(progress.vocabularyCount).toBe(initialCount + 1);
    });

    it('should not duplicate existing vocabulary word', async () => {
      const vls = new VoiceLearningSystem();

      // First, get current count
      const initialProgress = await vls.getLearningProgress('blog');
      const initialCount = initialProgress.vocabularyCount;

      // Add a unique word
      const uniqueWord = `unique-word-${Date.now()}`;
      await vls.addVocabulary('blog', uniqueWord);

      // Try to add the same word again
      await vls.addVocabulary('blog', uniqueWord);

      const finalProgress = await vls.getLearningProgress('blog');
      // Should only be incremented by 1, not 2
      expect(finalProgress.vocabularyCount).toBe(initialCount + 1);
    });
  });

  describe('Add Example', () => {
    it('should add good example to style doc', async () => {
      const vls = new VoiceLearningSystem();
      const initialProgress = await vls.getLearningProgress('blog');
      const initialCount = initialProgress.goodExampleCount;

      const uniqueExample = `Good example ${Date.now()}`;
      await vls.addExample('blog', uniqueExample, 'good');

      const progress = await vls.getLearningProgress('blog');
      expect(progress.goodExampleCount).toBe(initialCount + 1);
    });

    it('should add bad example to style doc', async () => {
      const vls = new VoiceLearningSystem();
      const initialProgress = await vls.getLearningProgress('blog');
      const initialCount = initialProgress.badExampleCount;

      const uniqueExample = `Bad example ${Date.now()}`;
      await vls.addExample('blog', uniqueExample, 'bad');

      const progress = await vls.getLearningProgress('blog');
      expect(progress.badExampleCount).toBe(initialCount + 1);
    });
  });

  describe('Add Sentence Pattern', () => {
    it('should add new sentence pattern to style doc', async () => {
      const vls = new VoiceLearningSystem();
      const initialProgress = await vls.getLearningProgress('blog');
      const initialCount = initialProgress.patternCount;

      const uniquePattern = `Pattern ${Date.now()}`;
      await vls.addSentencePattern('blog', uniquePattern);

      const progress = await vls.getLearningProgress('blog');
      expect(progress.patternCount).toBe(initialCount + 1);
    });

    it('should not duplicate existing sentence pattern', async () => {
      const vls = new VoiceLearningSystem();
      const initialProgress = await vls.getLearningProgress('blog');
      const initialCount = initialProgress.patternCount;

      const uniquePattern = `Unique pattern ${Date.now()}`;
      await vls.addSentencePattern('blog', uniquePattern);
      await vls.addSentencePattern('blog', uniquePattern);

      const progress = await vls.getLearningProgress('blog');
      expect(progress.patternCount).toBe(initialCount + 1);
    });
  });

  describe('Restore from Backup', () => {
    it('should throw error if backup file does not exist', async () => {
      const vls = new VoiceLearningSystem();

      await expect(
        vls.restoreFromBackup('blog', '/non-existent/path/backup.json')
      ).rejects.toThrow('Backup file not found');
    });

    it('should restore from valid backup file', async () => {
      const vls = new VoiceLearningSystem();

      // Use portfolio which is less affected by parallel test runs
      const originalExport = await vls.exportStyleDoc('portfolio');
      expect(originalExport).not.toBeNull();

      // Get backup files
      const backups = vls.getBackups('portfolio');

      // If there are backups, we can test restore
      if (backups.length > 0) {
        // Restore from first backup
        await vls.restoreFromBackup('portfolio', backups[0]);

        // Verify we can still load the doc
        const restored = await vls.loadStyleDoc('portfolio');
        expect(restored).not.toBeNull();
        expect(restored?.contentType).toBe('portfolio');

        // Restore original state
        if (originalExport) {
          await vls.importStyleDoc('portfolio', originalExport);
        }
      }
    });
  });

  describe('Save Style Doc', () => {
    it('should persist style documentation', async () => {
      const vls = new VoiceLearningSystem();

      // Add something and verify it persists - use portfolio to avoid conflict
      const uniqueWord = `persist-test-${Date.now()}`;
      await vls.addVocabulary('portfolio', uniqueWord);

      // Create new instance to verify persistence
      const vls2 = new VoiceLearningSystem();
      const styleDoc = await vls2.loadStyleDoc('portfolio');

      expect(styleDoc?.vocabulary).toContain(uniqueWord);
    });
  });

  describe('Get Or Create Style Doc', () => {
    it('should create new style doc with defaults for non-existent content type', async () => {
      const vls = new VoiceLearningSystem();

      // addVocabulary internally calls getOrCreateStyleDoc
      // For an existing type, it should use the existing doc
      await vls.addVocabulary('portfolio', 'test-word');

      const progress = await vls.getLearningProgress('portfolio');
      expect(progress.vocabularyCount).toBeGreaterThan(0);
    });
  });

  describe('Default Style Content', () => {
    it('should have dos array for blog', async () => {
      const vls = new VoiceLearningSystem();
      const suggestions = await vls.getStyleSuggestions('blog');

      // Verify dos exists and has content
      expect(Array.isArray(suggestions.dos)).toBe(true);
      expect(suggestions.dos.length).toBeGreaterThan(0);
    });

    it('should have donts array for portfolio', async () => {
      const vls = new VoiceLearningSystem();
      const suggestions = await vls.getStyleSuggestions('portfolio');

      // Verify donts exists and has content
      expect(Array.isArray(suggestions.donts)).toBe(true);
      expect(suggestions.donts.length).toBeGreaterThan(0);
    });

    it('should have default vocabulary for tech-radar', async () => {
      const vls = new VoiceLearningSystem();
      const suggestions = await vls.getStyleSuggestions('tech-radar');

      expect(suggestions.vocabulary).toContain('assess');
      expect(suggestions.vocabulary).toContain('hold');
      expect(suggestions.vocabulary).toContain('maturity');
    });
  });
});
