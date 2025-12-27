/**
 * Voice Learning System
 *
 * Captures user feedback and corrections during review sessions,
 * maintains content-type-specific style patterns, and persists
 * style guide to JSON file for cross-session learning.
 */

import type { StyleDocumentation, ContentType } from '../types/index.js';
import {
  readJSONFile,
  writeJSONFile,
  ensureDirectory,
  validateJSONFile,
  getFileStats
} from '../utils/storage.js';
import {
  extractPatternsFromFeedback,
  mergePatterns,
  generatePatternSummary
} from '../utils/pattern-extractor.js';
import { getAgentPaths } from '../config/index.js';

export class VoiceLearningSystem {
  private projectRoot: string;
  private styleDocsDir: string;
  private readonly styleDocFields: (keyof StyleDocumentation)[] = [
    'contentType',
    'tone',
    'vocabulary',
    'sentencePatterns',
    'dos',
    'donts',
    'examples',
    'lastUpdated'
  ];

  constructor() {
    const paths = getAgentPaths();
    this.projectRoot = paths.projectRoot;
    this.styleDocsDir = paths.styleDocsDir;
  }

  /**
   * Load style documentation for a content type
   */
  async loadStyleDoc(contentType: ContentType): Promise<StyleDocumentation | null> {
    const filePath = `${this.styleDocsDir}/${contentType}-style.json`;

    const data = readJSONFile<StyleDocumentation>(filePath);

    if (!data) {
      return null;
    }

    // Convert date string back to Date object
    return {
      ...data,
      lastUpdated: new Date(data.lastUpdated)
    };
  }

  /**
   * Save style documentation for a content type
   */
  async saveStyleDoc(styleDoc: StyleDocumentation): Promise<void> {
    const filePath = `${this.styleDocsDir}/${styleDoc.contentType}-style.json`;

    try {
      writeJSONFile(filePath, styleDoc, { createBackup: true, format: true });
    } catch (error) {
      console.error(`Error saving style doc for ${styleDoc.contentType}:`, error);
      throw error;
    }
  }

  /**
   * Initialize new style documentation for a content type
   */
  initializeStyleDoc(contentType: ContentType, tone: string): StyleDocumentation {
    return {
      contentType,
      tone,
      vocabulary: [],
      sentencePatterns: [],
      dos: [],
      donts: [],
      examples: {
        good: [],
        bad: []
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Extract patterns from user feedback
   *
   * Analyzes feedback text to extract:
   * - Vocabulary words and phrases
   * - Sentence patterns and structures
   * - Dos and donts based on feedback tone
   * - Correction patterns for common issues
   *
   * Updates the style documentation with extracted patterns
   */
  async extractPatternsFromFeedback(
    contentType: ContentType,
    feedback: string,
    context: 'positive' | 'negative'
  ): Promise<{
    success: boolean;
    summary: string;
    patternsExtracted: {
      vocabulary: number;
      sentencePatterns: number;
      dos: number;
      donts: number;
      corrections: number;
    };
  }> {
    let styleDoc = await this.loadStyleDoc(contentType);

    // Initialize style doc if it doesn't exist
    if (!styleDoc) {
      styleDoc = this.initializeStyleDoc(contentType, 'professional');
      await this.saveStyleDoc(styleDoc);
    }

    try {
      // Extract patterns using the pattern extractor utility
      const extracted = extractPatternsFromFeedback(feedback);

      // If context is explicitly provided, override classification
      if (context === 'positive' && extracted.dos.length === 0) {
        extracted.dos.push(feedback);
      } else if (context === 'negative' && extracted.donts.length === 0) {
        extracted.donts.push(feedback);
      }

      // Merge extracted patterns with existing style documentation
      const merged = mergePatterns(
        {
          vocabulary: styleDoc.vocabulary,
          sentencePatterns: styleDoc.sentencePatterns,
          dos: styleDoc.dos,
          donts: styleDoc.donts
        },
        extracted
      );

      // Update style documentation
      styleDoc.vocabulary = merged.vocabulary;
      styleDoc.sentencePatterns = merged.sentencePatterns;
      styleDoc.dos = merged.dos;
      styleDoc.donts = merged.donts;
      styleDoc.lastUpdated = new Date();

      // Save updated documentation
      await this.saveStyleDoc(styleDoc);

      // Generate summary
      const summary = generatePatternSummary(extracted);

      return {
        success: true,
        summary,
        patternsExtracted: {
          vocabulary: extracted.vocabulary.length,
          sentencePatterns: extracted.sentencePatterns.length,
          dos: extracted.dos.length,
          donts: extracted.donts.length,
          corrections: extracted.corrections.length
        }
      };
    } catch (error) {
      console.error(`Error extracting patterns from feedback:`, error);
      return {
        success: false,
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        patternsExtracted: {
          vocabulary: 0,
          sentencePatterns: 0,
          dos: 0,
          donts: 0,
          corrections: 0
        }
      };
    }
  }

  /**
   * Get style suggestions for content generation
   */
  async getStyleSuggestions(contentType: ContentType): Promise<{
    tone: string;
    vocabulary: string[];
    dos: string[];
    donts: string[];
  }> {
    const styleDoc = await this.loadStyleDoc(contentType);

    if (!styleDoc) {
      // Return defaults if no style doc exists
      return this.getDefaultStyle(contentType);
    }

    return {
      tone: styleDoc.tone,
      vocabulary: styleDoc.vocabulary,
      dos: styleDoc.dos,
      donts: styleDoc.donts
    };
  }

  /**
   * Get default style guidelines for a content type
   */
  private getDefaultStyle(contentType: ContentType): {
    tone: string;
    vocabulary: string[];
    dos: string[];
    donts: string[];
  } {
    const defaults: Record<ContentType, {
      tone: string;
      vocabulary: string[];
      dos: string[];
      donts: string[];
    }> = {
      blog: {
        tone: 'Conversational, personal, and authentic',
        vocabulary: [],
        dos: [
          'Be concise and to the point',
          'Use "I" statements for personal perspective',
          'Share authentic thoughts and experiences',
          'Optimize for SEO/AEO discoverability'
        ],
        donts: [
          'Don\'t overachieve with excessive content',
          'Avoid AI-sounding phrases like "delve into", "in conclusion", "it\'s important to note"',
          'Don\'t be robotic or overly formal',
          'Avoid excessive jargon without explanation'
        ]
      },
      portfolio: {
        tone: 'Professional, achievement-focused, and confident',
        vocabulary: ['led', 'developed', 'implemented', 'achieved', 'delivered'],
        dos: [
          'Highlight impact and technical depth',
          'Use metrics and quantifiable results',
          'Showcase problem-solving skills',
          'Demonstrate value delivered to clients'
        ],
        donts: [
          'Don\'t be overly modest or downplay achievements',
          'Avoid vague statements without specifics',
          'Don\'t list responsibilities without outcomes',
          'Avoid excessive technical jargon for non-technical audiences'
        ]
      },
      'tech-radar': {
        tone: 'Opinionated but balanced and informed',
        vocabulary: ['adopt', 'trial', 'assess', 'hold', 'maturity', 'ecosystem'],
        dos: [
          'Provide technical depth and context',
          'Consider practical adoption implications',
          'Assess maturity and ecosystem support',
          'Be forward-looking but realistic'
        ],
        donts: [
          'Don\'t be purely opinionated without evidence',
          'Avoid hype-driven language',
          'Don\'t ignore potential drawbacks or limitations',
          'Avoid being overly negative about technologies'
        ]
      }
    };

    return defaults[contentType];
  }

  /**
   * Add vocabulary word to style documentation
   */
  async addVocabulary(contentType: ContentType, word: string): Promise<void> {
    const styleDoc = await this.getOrCreateStyleDoc(contentType);

    if (!styleDoc.vocabulary.includes(word)) {
      styleDoc.vocabulary.push(word);
      styleDoc.lastUpdated = new Date();
      await this.saveStyleDoc(styleDoc);
    }
  }

  /**
   * Add example to style documentation
   */
  async addExample(
    contentType: ContentType,
    example: string,
    type: 'good' | 'bad'
  ): Promise<void> {
    const styleDoc = await this.getOrCreateStyleDoc(contentType);

    styleDoc.examples[type].push(example);
    styleDoc.lastUpdated = new Date();
    await this.saveStyleDoc(styleDoc);
  }

  /**
   * Add sentence pattern to style documentation
   */
  async addSentencePattern(
    contentType: ContentType,
    pattern: string
  ): Promise<void> {
    const styleDoc = await this.getOrCreateStyleDoc(contentType);

    if (!styleDoc.sentencePatterns.includes(pattern)) {
      styleDoc.sentencePatterns.push(pattern);
      styleDoc.lastUpdated = new Date();
      await this.saveStyleDoc(styleDoc);
    }
  }

  /**
   * Get or create style documentation
   */
  private async getOrCreateStyleDoc(contentType: ContentType): Promise<StyleDocumentation> {
    let styleDoc = await this.loadStyleDoc(contentType);

    if (!styleDoc) {
      const defaults = this.getDefaultStyle(contentType);
      styleDoc = this.initializeStyleDoc(contentType, defaults.tone);
      styleDoc.dos = defaults.dos;
      styleDoc.donts = defaults.donts;
      styleDoc.vocabulary = defaults.vocabulary;
      await this.saveStyleDoc(styleDoc);
    }

    return styleDoc;
  }

  /**
   * Get learning progress statistics
   */
  async getLearningProgress(contentType: ContentType): Promise<{
    vocabularyCount: number;
    patternCount: number;
    doCount: number;
    dontCount: number;
    goodExampleCount: number;
    badExampleCount: number;
    lastUpdated: Date | null;
  }> {
    const styleDoc = await this.loadStyleDoc(contentType);

    if (!styleDoc) {
      return {
        vocabularyCount: 0,
        patternCount: 0,
        doCount: 0,
        dontCount: 0,
        goodExampleCount: 0,
        badExampleCount: 0,
        lastUpdated: null
      };
    }

    return {
      vocabularyCount: styleDoc.vocabulary.length,
      patternCount: styleDoc.sentencePatterns.length,
      doCount: styleDoc.dos.length,
      dontCount: styleDoc.donts.length,
      goodExampleCount: styleDoc.examples.good.length,
      badExampleCount: styleDoc.examples.bad.length,
      lastUpdated: styleDoc.lastUpdated
    };
  }

  /**
   * Validate style documentation file
   */
  async validateStyleDoc(contentType: ContentType): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const filePath = `${this.styleDocsDir}/${contentType}-style.json`;
    return validateJSONFile<StyleDocumentation>(filePath, this.styleDocFields);
  }

  /**
   * Get backup files for a content type
   */
  getBackups(contentType: ContentType): string[] {
    const baseFileName = `${contentType}-style.json`;
    const dir = this.styleDocsDir;

    // List all files that start with the base filename
    const files = require('fs').readdirSync(dir).filter((file: string): boolean =>
      file.startsWith(baseFileName) && file !== baseFileName
    );

    return files.map((file: string) => `${dir}/${file}`);
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(contentType: ContentType, backupPath: string): Promise<void> {
    const fs = require('fs');

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const targetPath = `${this.styleDocsDir}/${contentType}-style.json`;

    // Copy backup to main file
    fs.copyFileSync(backupPath, targetPath);

    console.log(`Restored ${contentType} style doc from backup: ${backupPath}`);
  }

  /**
   * Export style documentation as JSON string
   */
  async exportStyleDoc(contentType: ContentType): Promise<string | null> {
    const styleDoc = await this.loadStyleDoc(contentType);

    if (!styleDoc) {
      return null;
    }

    return JSON.stringify(styleDoc, null, 2);
  }

  /**
   * Import style documentation from JSON string
   */
  async importStyleDoc(contentType: ContentType, jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as StyleDocumentation;

      // Validate content type matches
      if (data.contentType !== contentType) {
        throw new Error(
          `Content type mismatch: expected ${contentType}, got ${data.contentType}`
        );
      }

      // Update timestamp
      data.lastUpdated = new Date();

      // Save
      await this.saveStyleDoc(data);
    } catch (error) {
      throw new Error(`Failed to import style doc: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
