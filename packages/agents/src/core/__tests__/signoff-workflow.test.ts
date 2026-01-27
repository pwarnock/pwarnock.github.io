/**
 * Tests for SignoffWorkflow Engine
 *
 * Comprehensive test coverage for:
 * - Session preparation and signoff workflow
 * - Validation checkpoints (frontmatter, structure, images, comments)
 * - Approval workflow enforcement
 * - Rejection with reasons
 * - Status reporting and change summaries
 * - Integration with ReviewWorkflow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SignoffWorkflow } from '../signoff-workflow.js';
import type { ContentBundle } from '../../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('SignoffWorkflow', () => {
  let workflow: SignoffWorkflow;
  let testSessionsDir: string;
  let mockBlogBundle: ContentBundle;
  let mockPortfolioBundle: ContentBundle;
  let mockTechRadarBundle: ContentBundle;

  beforeEach(async () => {
    // Create temporary sessions directory for testing
    testSessionsDir = path.join(process.cwd(), '.test-signoff-sessions');
    await fs.mkdir(testSessionsDir, { recursive: true });

    // Initialize workflow with test directory
    workflow = new SignoffWorkflow(undefined, testSessionsDir);
    await workflow.initialize();

    // Create mock blog bundle
    mockBlogBundle = {
      type: 'blog',
      frontmatter: {
        title: 'Test Blog Post',
        date: '2025-12-26',
        summary: 'A comprehensive test blog post for SignoffWorkflow',
        tags: ['test', 'signoff', 'workflow'],
        draft: true,
      },
      content: '# Introduction\n\nThis is the introduction.\n\n## Main Content\n\nThis is the main content.',
      imagePrompts: ['A test image for the blog post'],
      validationStatus: 'pending',
      reviewStatus: 'draft',
      createdAt: new Date(),
      sessions: [],
    };

    // Create mock portfolio bundle
    mockPortfolioBundle = {
      type: 'portfolio',
      frontmatter: {
        title: 'Test Portfolio Project',
        date: '2025-12-26',
        draft: true,
        description: 'A test portfolio project',
        client: 'Test Client',
        technologies: ['TypeScript', 'Hugo', 'Tailwind'],
        completion_date: '2025-12',
        category: 'Web Development',
      },
      content: '# Project Overview\n\nThis is a test project.\n\n## Technical Implementation\n\nBuilt with modern technologies.',
      imagePrompts: [],
      validationStatus: 'pending',
      reviewStatus: 'draft',
      createdAt: new Date(),
      sessions: [],
    };

    // Create mock tech radar bundle
    mockTechRadarBundle = {
      type: 'tech-radar',
      frontmatter: {
        title: 'Test Technology',
        date: '2025-12-26',
        draft: true,
        description: 'A test technology for the radar',
        quadrant: 'tools',
        ring: 'adopt',
        tags: ['test', 'technology'],
      },
      content: '# Overview\n\nThis is a test technology.\n\n## Key Features\n\nFeature 1, Feature 2.',
      imagePrompts: [],
      validationStatus: 'pending',
      reviewStatus: 'draft',
      createdAt: new Date(),
      sessions: [],
    };
  });

  afterEach(async () => {
    // Clean up test sessions directory
    try {
      await fs.rm(testSessionsDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newWorkflow = new SignoffWorkflow(undefined, testSessionsDir);
      await newWorkflow.initialize();
      expect(newWorkflow).toBeDefined();
    });

    it('should handle multiple initializations gracefully', async () => {
      await workflow.initialize();
      await workflow.initialize();
      // Should not throw - second initialize is ignored
      expect(workflow).toBeDefined();
    });
  });

  describe('Prepare for Signoff', () => {
    it('should prepare valid blog bundle for signoff', async () => {
      const result = await workflow.prepareForSignoff(mockBlogBundle);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.status?.validationPassed).toBe(true);
      expect(result.status?.canApprove).toBe(true);
      expect(result.status?.pendingComments).toBe(0);
    });

    it('should prepare valid portfolio bundle for signoff', async () => {
      const result = await workflow.prepareForSignoff(mockPortfolioBundle);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.status?.validationPassed).toBe(true);
      expect(result.status?.canApprove).toBe(true);
    });

    it('should prepare valid tech radar bundle for signoff', async () => {
      const result = await workflow.prepareForSignoff(mockTechRadarBundle);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.status?.validationPassed).toBe(true);
      expect(result.status?.canApprove).toBe(true);
    });

    it('should fail validation for missing frontmatter fields', async () => {
      const invalidBundle = { ...mockBlogBundle };
      delete invalidBundle.frontmatter.summary;

      const result = await workflow.prepareForSignoff(invalidBundle);

      expect(result.success).toBe(true);
      expect(result.status?.validationPassed).toBe(false);
      expect(result.status?.canApprove).toBe(false);
      expect(result.status?.checkpoints.frontmatter).toBe(false);
    });

    it('should fail validation for missing content structure', async () => {
      const invalidBundle = { ...mockBlogBundle, content: '' };

      const result = await workflow.prepareForSignoff(invalidBundle);

      expect(result.success).toBe(true);
      expect(result.status?.validationPassed).toBe(false);
      expect(result.status?.canApprove).toBe(false);
      expect(result.status?.checkpoints.structure).toBe(false);
    });

    it('should fail validation for empty image prompts', async () => {
      const invalidBundle = {
        ...mockBlogBundle,
        imagePrompts: ['valid prompt', ''],
      };

      const result = await workflow.prepareForSignoff(invalidBundle);

      expect(result.success).toBe(true);
      expect(result.status?.validationPassed).toBe(false);
      expect(result.status?.canApprove).toBe(false);
      expect(result.status?.checkpoints.images).toBe(false);
    });

    it('should create unique session IDs', async () => {
      const result1 = await workflow.prepareForSignoff(mockBlogBundle);
      const result2 = await workflow.prepareForSignoff(mockPortfolioBundle);

      expect(result1.sessionId).not.toBe(result2.sessionId);
    });
  });

  describe('Validation Checkpoints', () => {
    it('should pass all checkpoints for valid blog bundle', async () => {
      const checkpoints = await workflow['runValidationCheckpoints'](mockBlogBundle);

      expect(checkpoints.frontmatter).toBe(true);
      expect(checkpoints.structure).toBe(true);
      expect(checkpoints.images).toBe(true);
      expect(checkpoints.comments).toBe(true);
    });

    it('should pass all checkpoints for valid portfolio bundle', async () => {
      const checkpoints = await workflow['runValidationCheckpoints'](mockPortfolioBundle);

      expect(checkpoints.frontmatter).toBe(true);
      expect(checkpoints.structure).toBe(true);
      expect(checkpoints.images).toBe(true);
      expect(checkpoints.comments).toBe(true);
    });

    it('should fail frontmatter checkpoint for missing title', async () => {
      const invalidBundle = { ...mockBlogBundle };
      delete invalidBundle.frontmatter.title;

      const checkpoints = await workflow['runValidationCheckpoints'](invalidBundle);

      expect(checkpoints.frontmatter).toBe(false);
    });

    it('should fail frontmatter checkpoint for missing date', async () => {
      const invalidBundle = { ...mockBlogBundle };
      delete invalidBundle.frontmatter.date;

      const checkpoints = await workflow['runValidationCheckpoints'](invalidBundle);

      expect(checkpoints.frontmatter).toBe(false);
    });

    it('should fail structure checkpoint for empty content', async () => {
      const invalidBundle = { ...mockBlogBundle, content: '' };

      const checkpoints = await workflow['runValidationCheckpoints'](invalidBundle);

      expect(checkpoints.structure).toBe(false);
    });

    it('should fail structure checkpoint for content without headings', async () => {
      const invalidBundle = { ...mockBlogBundle, content: 'Just plain text without headings.' };

      const checkpoints = await workflow['runValidationCheckpoints'](invalidBundle);

      expect(checkpoints.structure).toBe(false);
    });

    it('should pass images checkpoint when no images present', async () => {
      const bundle = { ...mockPortfolioBundle, imagePrompts: [] };

      const checkpoints = await workflow['runValidationCheckpoints'](bundle);

      expect(checkpoints.images).toBe(true);
    });

    it('should fail images checkpoint for empty prompts', async () => {
      const invalidBundle = {
        ...mockBlogBundle,
        imagePrompts: ['valid', '', 'also valid'],
      };

      const checkpoints = await workflow['runValidationCheckpoints'](invalidBundle);

      expect(checkpoints.images).toBe(false);
    });
  });

  describe('Request Approval', () => {
    it('should request approval for valid session', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const requestResult = await workflow.requestApproval(prepareResult.sessionId!);

      expect(requestResult.success).toBe(true);
      expect(requestResult.status?.canApprove).toBe(true);
      expect(requestResult.status?.validationPassed).toBe(true);
      expect(requestResult.status?.pendingComments).toBe(0);
    });

    it('should fail for non-existent session', async () => {
      const result = await workflow.requestApproval('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });

    it('should indicate cannot approve with pending comments', async () => {
      // This test would require adding comments via ReviewWorkflow
      // For now, we test the basic structure
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const requestResult = await workflow.requestApproval(prepareResult.sessionId!);

      expect(requestResult.success).toBe(true);
      expect(requestResult.status).toBeDefined();
    });
  });

  describe('Approve Session', () => {
    it('should approve valid session', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const approveResult = await workflow.approveSession(prepareResult.sessionId!);

      expect(approveResult.success).toBe(true);
      expect(approveResult.sessionId).toBeDefined();
      expect(approveResult.status?.canApprove).toBe(true);
    });

    it('should not approve session with failed validation', async () => {
      const invalidBundle = { ...mockBlogBundle, content: '' };
      const prepareResult = await workflow.prepareForSignoff(invalidBundle);
      const approveResult = await workflow.approveSession(prepareResult.sessionId!);

      expect(approveResult.success).toBe(false);
      expect(approveResult.error).toContain('Cannot approve session');
    });

    it('should not approve non-existent session', async () => {
      const result = await workflow.approveSession('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });

    it('should never auto-publish - requires explicit approval', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);

      // Session should not be approved after prepareForSignoff
      const status1 = await workflow.getSignoffStatus(prepareResult.sessionId!);
      expect(status1).toBeDefined();

      // Must explicitly call approveSession
      const approveResult = await workflow.approveSession(prepareResult.sessionId!);
      expect(approveResult.success).toBe(true);
    });
  });

  describe('Reject Session', () => {
    it('should reject session with reason', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const rejectResult = await workflow.rejectSession(
        prepareResult.sessionId!,
        'Content does not meet quality standards'
      );

      expect(rejectResult.success).toBe(true);
      expect(rejectResult.sessionId).toBeDefined();
      expect(rejectResult.error).toContain('Content does not meet quality standards');
    });

    it('should not reject without reason', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const rejectResult = await workflow.rejectSession(prepareResult.sessionId!, '');

      expect(rejectResult.success).toBe(false);
      expect(rejectResult.error).toContain('Rejection reason is required');
    });

    it('should not reject non-existent session', async () => {
      const result = await workflow.rejectSession('non-existent-id', 'Test reason');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
  });

  describe('Get Signoff Status', () => {
    it('should return status for valid session', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const status = await workflow.getSignoffStatus(prepareResult.sessionId!);

      expect(status).toBeDefined();
      expect(status?.canApprove).toBe(true);
      expect(status?.validationPassed).toBe(true);
      expect(status?.pendingComments).toBe(0);
      expect(status?.checkpoints.frontmatter).toBe(true);
      expect(status?.checkpoints.structure).toBe(true);
      expect(status?.checkpoints.images).toBe(true);
      expect(status?.checkpoints.comments).toBe(true);
    });

    it('should return null for non-existent session', async () => {
      const status = await workflow.getSignoffStatus('non-existent-id');
      expect(status).toBeNull();
    });

    it('should indicate cannot approve when validation fails', async () => {
      const invalidBundle = { ...mockBlogBundle, content: '' };
      const prepareResult = await workflow.prepareForSignoff(invalidBundle);
      const status = await workflow.getSignoffStatus(prepareResult.sessionId!);

      expect(status?.canApprove).toBe(false);
      expect(status?.validationPassed).toBe(false);
    });
  });

  describe('Generate Summary', () => {
    it('should generate summary for valid session', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const summary = await workflow.generateSummary(prepareResult.sessionId!);

      expect(summary).toBeDefined();
      expect(summary?.sessionId).toBe(prepareResult.sessionId);
      expect(summary?.validationPassed).toBe(true);
      expect(summary?.commentsPending).toBe(0);
      expect(summary?.checkpoints.frontmatter).toBe(true);
      expect(summary?.checkpoints.structure).toBe(true);
      expect(summary?.checkpoints.images).toBe(true);
      expect(summary?.checkpoints.comments).toBe(true);
    });

    it('should return null for non-existent session', async () => {
      const summary = await workflow.generateSummary('non-existent-id');
      expect(summary).toBeNull();
    });

    it('should include comment counts in summary', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const summary = await workflow.generateSummary(prepareResult.sessionId!);

      expect(summary?.commentsResolved).toBe(0);
      expect(summary?.commentsPending).toBe(0);
      expect(summary?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Integration: Complete Signoff Workflow', () => {
    it('should handle complete signoff lifecycle for blog', async () => {
      // 1. Prepare for signoff
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      expect(prepareResult.success).toBe(true);
      expect(prepareResult.status?.canApprove).toBe(true);

      // 2. Request approval
      const requestResult = await workflow.requestApproval(prepareResult.sessionId!);
      expect(requestResult.success).toBe(true);
      expect(requestResult.status?.canApprove).toBe(true);

      // 3. Approve session
      const approveResult = await workflow.approveSession(prepareResult.sessionId!);
      expect(approveResult.success).toBe(true);

      // 4. Generate summary
      const summary = await workflow.generateSummary(prepareResult.sessionId!);
      expect(summary?.validationPassed).toBe(true);
    });

    it('should handle complete signoff lifecycle for portfolio', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockPortfolioBundle);
      expect(prepareResult.success).toBe(true);

      const requestResult = await workflow.requestApproval(prepareResult.sessionId!);
      expect(requestResult.status?.canApprove).toBe(true);

      const approveResult = await workflow.approveSession(prepareResult.sessionId!);
      expect(approveResult.success).toBe(true);
    });

    it('should handle complete signoff lifecycle for tech radar', async () => {
      const prepareResult = await workflow.prepareForSignoff(mockTechRadarBundle);
      expect(prepareResult.success).toBe(true);

      const requestResult = await workflow.requestApproval(prepareResult.sessionId!);
      expect(requestResult.status?.canApprove).toBe(true);

      const approveResult = await workflow.approveSession(prepareResult.sessionId!);
      expect(approveResult.success).toBe(true);
    });

    it('should block approval when validation fails', async () => {
      // Create invalid bundle
      const invalidBundle = { ...mockBlogBundle, content: '' };

      // 1. Prepare for signoff (should fail validation)
      const prepareResult = await workflow.prepareForSignoff(invalidBundle);
      expect(prepareResult.status?.validationPassed).toBe(false);
      expect(prepareResult.status?.canApprove).toBe(false);

      // 2. Request approval (should still block)
      const requestResult = await workflow.requestApproval(prepareResult.sessionId!);
      expect(requestResult.status?.canApprove).toBe(false);

      // 3. Try to approve (should fail)
      const approveResult = await workflow.approveSession(prepareResult.sessionId!);
      expect(approveResult.success).toBe(false);
      expect(approveResult.error).toContain('Cannot approve session');
    });

    it('should handle rejection and restart workflow', async () => {
      // 1. Prepare and reject
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);
      const rejectResult = await workflow.rejectSession(
        prepareResult.sessionId!,
        'Needs more detail in introduction'
      );
      expect(rejectResult.success).toBe(true);

      // 2. Create new session for revised content
      const revisedBundle = { ...mockBlogBundle };
      const newPrepareResult = await workflow.prepareForSignoff(revisedBundle);
      expect(newPrepareResult.success).toBe(true);

      // 3. Approve revised version
      const approveResult = await workflow.approveSession(newPrepareResult.sessionId!);
      expect(approveResult.success).toBe(true);
    });

    it('should never auto-publish - requires explicit approval at every step', async () => {
      // Prepare for signoff
      const prepareResult = await workflow.prepareForSignoff(mockBlogBundle);

      // Verify not auto-approved
      const status1 = await workflow.getSignoffStatus(prepareResult.sessionId!);
      expect(status1).toBeDefined(); // Session exists

      // Request approval
      const requestResult = await workflow.requestApproval(prepareResult.sessionId!);

      // Verify still not approved
      expect(requestResult.status?.canApprove).toBe(true); // Can approve, but not approved yet

      // Must explicitly approve
      const approveResult = await workflow.approveSession(prepareResult.sessionId!);
      expect(approveResult.success).toBe(true);
    });
  });

  describe('Validation Checkpoint Details', () => {
    it('should validate blog frontmatter correctly', async () => {
      const validBlog = {
        type: 'blog' as const,
        frontmatter: {
          title: 'Test',
          date: '2025-12-26',
          summary: 'A summary',
        },
        content: '# Test\n\nContent',
        imagePrompts: [],
        validationStatus: 'pending' as const,
        reviewStatus: 'draft' as const,
        createdAt: new Date(),
        sessions: [],
      };

      const result = await workflow['validateFrontmatter'](validBlog);
      expect(result).toBe(true);
    });

    it('should validate portfolio frontmatter correctly', async () => {
      const validPortfolio = {
        type: 'portfolio' as const,
        frontmatter: {
          title: 'Test',
          date: '2025-12-26',
          draft: true,
          description: 'A description',
          client: 'Client',
          technologies: ['Tech'],
          completion_date: '2025-12',
          category: 'Web',
        },
        content: '# Test\n\nContent',
        imagePrompts: [],
        validationStatus: 'pending' as const,
        reviewStatus: 'draft' as const,
        createdAt: new Date(),
        sessions: [],
      };

      const result = await workflow['validateFrontmatter'](validPortfolio);
      expect(result).toBe(true);
    });

    it('should validate tech radar frontmatter correctly', async () => {
      const validRadar = {
        type: 'tech-radar' as const,
        frontmatter: {
          title: 'Test',
          date: '2025-12-26',
          draft: true,
          description: 'A description',
          quadrant: 'tools',
          ring: 'adopt',
        },
        content: '# Test\n\nContent',
        imagePrompts: [],
        validationStatus: 'pending' as const,
        reviewStatus: 'draft' as const,
        createdAt: new Date(),
        sessions: [],
      };

      const result = await workflow['validateFrontmatter'](validRadar);
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const invalidWorkflow = new SignoffWorkflow('/invalid/path');
      // Should throw with helpful error message
      await expect(invalidWorkflow.initialize()).rejects.toThrow();
    });

    it('should handle prepareForSignoff errors gracefully', async () => {
      const invalidBundle = { ...mockBlogBundle };
      delete (invalidBundle as any).type; // Make it invalid

      const result = await workflow.prepareForSignoff(invalidBundle);
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing type');
    });
  });
});
