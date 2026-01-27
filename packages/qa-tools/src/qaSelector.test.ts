/**
 * Unit tests for QA Mode Selector (policy golden cases)
 *
 * These tests ensure the selector behaves as expected for canonical file sets.
 */

import { describe, it, expect } from 'vitest';
import { selectMode } from './qaSelector';
import { qaPolicyVersion, a11yPolicyVersion } from './qaConfig';

describe('qaSelector', () => {
  const baseCtx = { qaPolicyVersion, a11yPolicyVersion };

  it('selects content_fast_path for pure content changes', () => {
    const changedFiles = ['content/blog/post.md'];
    const result = selectMode({ changedFiles, ...baseCtx });
    expect(result.selectedMode).toBe('content_fast_path');
    expect(result.reason).toMatch(/content-eligible/);
    expect(result.details.matchedAllowed).toEqual(['content/blog/post.md']);
    expect(result.details.matchedNonContent).toEqual([]);
    expect(result.details.matchedA11yCriticalData).toEqual([]);
  });

  it('selects full when any layout file changes', () => {
    const changedFiles = ['content/blog/post.md', 'layouts/_default/single.html'];
    const result = selectMode({ changedFiles, ...baseCtx });
    expect(result.selectedMode).toBe('full');
    expect(result.reason).toMatch(/Non-content or unknown paths/);
    expect(result.details.matchedNonContent).toContain('layouts/_default/single.html');
  });

  it('selects full when a11y-critical data changes', () => {
    const changedFiles = ['data/navigation.toml'];
    const result = selectMode({ changedFiles, ...baseCtx });
    expect(result.selectedMode).toBe('full');
    expect(result.reason).toMatch(/A11y-critical data changed/);
    expect(result.details.matchedA11yCriticalData).toContain('data/navigation.toml');
  });

  it('selects content_fast_path for static media files', () => {
    const changedFiles = ['static/img/new-hero.png', 'static/images/logo.svg'];
    const result = selectMode({ changedFiles, ...baseCtx });
    expect(result.selectedMode).toBe('content_fast_path');
    expect(result.reason).toMatch(/content-eligible/);
    expect(result.details.matchedAllowed).toEqual(
      expect.arrayContaining(['static/img/new-hero.png', 'static/images/logo.svg'])
    );
  });

  it('selects full for root config changes', () => {
    const changedFiles = ['hugo.toml'];
    const result = selectMode({ changedFiles, ...baseCtx });
    expect(result.selectedMode).toBe('full');
    expect(result.reason).toMatch(/Non-content or unknown paths/);
    expect(result.details.matchedNonContent).toContain('hugo.toml');
  });

  it('defaults to full when no changed files', () => {
    const changedFiles: string[] = [];
    const result = selectMode({ changedFiles, ...baseCtx });
    expect(result.selectedMode).toBe('full');
    expect(result.reason).toMatch(/No changed files detected/);
  });
});
