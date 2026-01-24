import { describe, it, expect } from 'vitest';
import { capitalize, truncate } from './string.js';

/**
 * String utility tests
 */
describe('String Utilities', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should not change already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('hi', 5)).toBe('hi');
    });

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('');
    });
  });
});
