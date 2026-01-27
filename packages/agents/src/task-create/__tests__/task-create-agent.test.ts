/**
 * Task Create Agent Tests
 *
 * Tests for natural language parsing and task creation.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { TaskCreateAgent } from '../task-create-agent.js';

describe('TaskCreateAgent', () => {
  let agent: TaskCreateAgent;

  beforeEach(() => {
    agent = new TaskCreateAgent();
  });

  describe('Type Detection', () => {
    it('should detect bug type from fix keyword', () => {
      const patterns = agent.getTypePatterns();
      const text = 'fix authentication error';
      let detected = false;

      for (const pattern of patterns.bug) {
        if (pattern.test(text)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should detect feature type from add keyword', () => {
      const patterns = agent.getTypePatterns();
      const text = 'add user dashboard';
      let detected = false;

      for (const pattern of patterns.feature) {
        if (pattern.test(text)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should detect docs type from documentation keyword', () => {
      const patterns = agent.getTypePatterns();
      const text = 'update documentation for API';
      let detected = false;

      for (const pattern of patterns.docs) {
        if (pattern.test(text)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should detect refactor type from refactor keyword', () => {
      const patterns = agent.getTypePatterns();
      const text = 'refactor auth module';
      let detected = false;

      for (const pattern of patterns.refactor) {
        if (pattern.test(text)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });
  });

  describe('Priority Detection', () => {
    it('should detect P0 from urgent keyword', () => {
      const patterns = agent.getPriorityPatterns();
      const text = 'urgent: fix production bug';
      let detected = false;

      for (const pattern of patterns[0]) {
        if (pattern.test(text)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should detect P1 from high priority keyword', () => {
      const patterns = agent.getPriorityPatterns();
      const text = 'high priority feature request';
      let detected = false;

      for (const pattern of patterns[1]) {
        if (pattern.test(text)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should detect P3 from low priority keyword', () => {
      const patterns = agent.getPriorityPatterns();
      const text = 'low priority nice to have';
      let detected = false;

      for (const pattern of patterns[3]) {
        if (pattern.test(text)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });
  });

  describe('Tag Extraction', () => {
    it('should extract learning tag', () => {
      const tags = agent.getCommonTags();
      expect(tags).toContain('learning');
    });

    it('should extract refactor tag', () => {
      const tags = agent.getCommonTags();
      expect(tags).toContain('refactor');
    });

    it('should extract performance tag', () => {
      const tags = agent.getCommonTags();
      expect(tags).toContain('performance');
    });

    it('should extract security tag', () => {
      const tags = agent.getCommonTags();
      expect(tags).toContain('security');
    });
  });

  describe('Supported Types', () => {
    it('should return all supported types', () => {
      const types = agent.getSupportedTypes();
      expect(types).toContain('bug');
      expect(types).toContain('feature');
      expect(types).toContain('docs');
      expect(types).toContain('test');
      expect(types).toContain('refactor');
      expect(types).toContain('chore');
    });
  });

  describe('Input Validation', () => {
    it('should validate empty text', async () => {
      const result = await agent.createTask({ text: '' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should validate whitespace-only text', async () => {
      const result = await agent.createTask({ text: '   ' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });
});
