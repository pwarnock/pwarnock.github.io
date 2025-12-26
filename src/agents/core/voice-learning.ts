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
      return {
        tone: 'Conversational and authentic',
        vocabulary: [],
        dos: ['Be concise', 'Avoid AI-sounding phrases'],
        donts: ['Don\'t overachieve', 'Avoid excessive jargon']
      };
    }

    return {
      tone: styleDoc.tone,
      vocabulary: styleDoc.vocabulary,
      dos: styleDoc.dos,
      donts: styleDoc.donts
    };
  }
}
