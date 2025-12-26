/**
 * Voice Learning System Tests
 */

import { describe, it, expect } from 'vitest';
import { VoiceLearningSystem } from '../voice-learning.js';

describe('VoiceLearningSystem', () => {
  it('should load existing blog style documentation', async () => {
    const vls = new VoiceLearningSystem();
    const blogStyle = await vls.loadStyleDoc('blog');

    expect(blogStyle).toBeDefined();
    expect(blogStyle?.contentType).toBe('blog');
    expect(blogStyle?.dos).toContain('Be concise and to the point');
    expect(blogStyle?.donts).toContain('Avoid AI-sounding phrases');
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

  it('should get style suggestions for blog', async () => {
    const vls = new VoiceLearningSystem();
    const suggestions = await vls.getStyleSuggestions('blog');

    expect(suggestions.tone).toBe('Conversational, personal, and authentic');
    expect(suggestions.dos).toContain('Use "I" statements for personal perspective');
    expect(suggestions.donts).toContain('Avoid AI-sounding phrases');
  });

  it('should get style suggestions for portfolio', async () => {
    const vls = new VoiceLearningSystem();
    const suggestions = await vls.getStyleSuggestions('portfolio');

    expect(suggestions.tone).toBe('Professional, achievement-focused, and confident');
    expect(suggestions.vocabulary).toContain('led');
    expect(suggestions.dos).toContain('Highlight impact and technical depth');
  });

  it('should get learning progress', async () => {
    const vls = new VoiceLearningSystem();
    const progress = await vls.getLearningProgress('blog');

    expect(progress.vocabularyCount).toBe(0);
    expect(progress.doCount).toBeGreaterThan(0);
    expect(progress.dontCount).toBeGreaterThan(0);
    expect(progress.lastUpdated).toBeInstanceOf(Date);
  });
});
