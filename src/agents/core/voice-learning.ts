/**
 * Voice Learning System
 *
 * Captures user feedback and corrections during review sessions,
 * maintains content-type-specific style patterns, and persists
 * style guide to JSON file for cross-session learning.
 */

import type { StyleDocumentation, ContentType } from '../types/index.js';
import fs from 'fs';
import path from 'path';

export class VoiceLearningSystem {
  private projectRoot: string;
  private styleDocsDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.styleDocsDir = path.join(this.projectRoot, '.cody/project/library/style-docs');
  }

  /**
   * Load style documentation for a content type
   */
  async loadStyleDoc(contentType: ContentType): Promise<StyleDocumentation | null> {
    const filePath = path.join(this.styleDocsDir, `${contentType}-style.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      return {
        ...data,
        lastUpdated: new Date(data.lastUpdated)
      };
    } catch (error) {
      console.error(`Error loading style doc for ${contentType}:`, error);
      return null;
    }
  }

  /**
   * Save style documentation for a content type
   */
  async saveStyleDoc(styleDoc: StyleDocumentation): Promise<void> {
    const filePath = path.join(this.styleDocsDir, `${styleDoc.contentType}-style.json`);

    // Ensure directory exists
    if (!fs.existsSync(this.styleDocsDir)) {
      fs.mkdirSync(this.styleDocsDir, { recursive: true });
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify(styleDoc, null, 2), 'utf8');
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
   */
  async extractPatternsFromFeedback(
    contentType: ContentType,
    feedback: string,
    context: 'positive' | 'negative'
  ): Promise<void> {
    const styleDoc = await this.loadStyleDoc(contentType);

    if (!styleDoc) {
      console.warn(`No style doc found for ${contentType}, creating new one`);
      return;
    }

    // TODO: Implement pattern extraction logic
    // For now, just store the feedback as a note
    if (context === 'positive') {
      styleDoc.dos.push(feedback);
    } else {
      styleDoc.donts.push(feedback);
    }

    styleDoc.lastUpdated = new Date();
    await this.saveStyleDoc(styleDoc);
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
}
