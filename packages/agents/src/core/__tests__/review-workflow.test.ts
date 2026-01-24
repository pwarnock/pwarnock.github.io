/**
 * Tests for ReviewWorkflow Engine
 *
 * Comprehensive test coverage for:
 * - Session creation and lifecycle management
 * - Inline comment tracking and resolution
 * - Status transitions (draft → in-review → approved/rejected)
 * - Persistent session storage
 * - Approval workflow enforcement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReviewWorkflow } from '../review-workflow.js';
import type { ContentBundle } from '../../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('ReviewWorkflow', () => {
  let workflow: ReviewWorkflow;
  let testSessionsDir: string;
  let mockBundle: ContentBundle;

  beforeEach(async () => {
    // Create temporary sessions directory for testing
    testSessionsDir = path.join(process.cwd(), '.test-sessions');
    await fs.mkdir(testSessionsDir, { recursive: true });

    // Initialize workflow with test directory
    workflow = new ReviewWorkflow(testSessionsDir);
    await workflow.initialize();

    // Create mock content bundle
    mockBundle = {
      type: 'blog',
      frontmatter: {
        title: 'Test Blog Post',
        date: '2025-12-26',
        summary: 'A test post for ReviewWorkflow',
        tags: ['test', 'workflow'],
      },
      content: '# Test Content\n\nThis is test content.',
      imagePrompts: ['A test image'],
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

  describe('Session Creation', () => {
    it('should create a new session successfully', async () => {
      const result = await workflow.createSession(mockBundle);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.sessionId).toMatch(/^[0-9a-f-]+$/); // UUID format
    });

    it('should add session to content bundle', async () => {
      const result = await workflow.createSession(mockBundle);

      expect(result.success).toBe(true);
      expect(mockBundle.sessions).toHaveLength(1);
      expect(mockBundle.sessions[0].id).toBe(result.sessionId);
      expect(mockBundle.reviewStatus).toBe('draft');
    });

    it('should create unique session IDs', async () => {
      const result1 = await workflow.createSession(mockBundle);
      const result2 = await workflow.createSession(mockBundle);

      expect(result1.sessionId).not.toBe(result2.sessionId);
    });

    it('should persist session to storage', async () => {
      const result = await workflow.createSession(mockBundle);

      // Verify session file exists
      const sessionFile = path.join(testSessionsDir, `${result.sessionId}.json`);
      const exists = await fs.access(sessionFile).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('Comment Management', () => {
    it('should add comment to session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const commentResult = await workflow.addComment(
        sessionResult.sessionId!,
        'intro',
        'This needs more detail'
      );

      expect(commentResult.success).toBe(true);
      expect(commentResult.commentId).toBeDefined();

      // Verify comment was added
      const comments = await workflow.getSessionComments(sessionResult.sessionId!);
      expect(comments).toHaveLength(1);
      expect(comments[0].section).toBe('intro');
      expect(comments[0].text).toBe('This needs more detail');
      expect(comments[0].resolution).toBe('pending');
    });

    it('should transition session to in-review when first comment added', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.addComment(sessionResult.sessionId!, 'intro', 'First comment');

      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('in-review');
    });

    it('should add multiple comments to different sections', async () => {
      const sessionResult = await workflow.createSession(mockBundle);

      await workflow.addComment(sessionResult.sessionId!, 'intro', 'Intro comment');
      await workflow.addComment(sessionResult.sessionId!, 'conclusion', 'Conclusion comment');

      const comments = await workflow.getSessionComments(sessionResult.sessionId!);
      expect(comments).toHaveLength(2);
      expect(comments[0].section).toBe('intro');
      expect(comments[1].section).toBe('conclusion');
    });

    it('should reject comment with empty section', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const result = await workflow.addComment(sessionResult.sessionId!, '', 'Comment text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Section identifier is required');
    });

    it('should reject comment with empty text', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const result = await workflow.addComment(sessionResult.sessionId!, 'intro', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Comment text is required');
    });

    it('should reject comment for non-existent session', async () => {
      const result = await workflow.addComment('non-existent-id', 'intro', 'Comment');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
  });

  describe('Comment Resolution', () => {
    it('should resolve comment as accepted', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const commentResult = await workflow.addComment(
        sessionResult.sessionId!,
        'intro',
        'Needs improvement'
      );

      const resolveResult = await workflow.resolveComment(
        sessionResult.sessionId!,
        commentResult.commentId!,
        'accepted'
      );

      expect(resolveResult.success).toBe(true);

      // Verify comment was resolved
      const comments = await workflow.getSessionComments(sessionResult.sessionId!);
      expect(comments[0].resolution).toBe('accepted');
    });

    it('should resolve comment as rejected', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const commentResult = await workflow.addComment(
        sessionResult.sessionId!,
        'intro',
        'Change this'
      );

      const resolveResult = await workflow.resolveComment(
        sessionResult.sessionId!,
        commentResult.commentId!,
        'rejected'
      );

      expect(resolveResult.success).toBe(true);

      // Verify comment was resolved
      const comments = await workflow.getSessionComments(sessionResult.sessionId!);
      expect(comments[0].resolution).toBe('rejected');
    });

    it('should track resolved comment counts', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const comment1 = await workflow.addComment(sessionResult.sessionId!, 'intro', 'Comment 1');
      const comment2 = await workflow.addComment(sessionResult.sessionId!, 'body', 'Comment 2');

      await workflow.resolveComment(sessionResult.sessionId!, comment1.commentId!, 'accepted');
      await workflow.resolveComment(sessionResult.sessionId!, comment2.commentId!, 'rejected');

      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.resolvedComments).toBe(2);
      expect(status?.acceptedComments).toBe(1);
      expect(status?.rejectedComments).toBe(1);
      expect(status?.pendingComments).toBe(0);
    });

    it('should reject resolution for non-existent comment', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const result = await workflow.resolveComment(
        sessionResult.sessionId!,
        'non-existent-comment',
        'accepted'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Comment not found');
    });
  });

  describe('Session Approval', () => {
    it('should approve session with all resolved comments', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const commentResult = await workflow.addComment(
        sessionResult.sessionId!,
        'intro',
        'Fix this'
      );

      // Resolve comment
      await workflow.resolveComment(sessionResult.sessionId!, commentResult.commentId!, 'accepted');

      // Approve session
      const approveResult = await workflow.approveSession(sessionResult.sessionId!);

      expect(approveResult.success).toBe(true);

      // Verify status
      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('approved');
    });

    it('should approve session with no comments', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const approveResult = await workflow.approveSession(sessionResult.sessionId!);

      expect(approveResult.success).toBe(true);

      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('approved');
    });

    it('should reject approval with pending comments', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.addComment(sessionResult.sessionId!, 'intro', 'Pending comment');

      const approveResult = await workflow.approveSession(sessionResult.sessionId!);

      expect(approveResult.success).toBe(false);
      expect(approveResult.error).toContain('pending comment');

      // Verify status didn't change
      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('in-review');
    });

    it('should not approve already approved session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.approveSession(sessionResult.sessionId!);

      const approveResult = await workflow.approveSession(sessionResult.sessionId!);

      expect(approveResult.success).toBe(false);
      expect(approveResult.error).toContain('already approved');
    });

    it('should not approve rejected session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.rejectSession(sessionResult.sessionId!);

      const approveResult = await workflow.approveSession(sessionResult.sessionId!);

      expect(approveResult.success).toBe(false);
      expect(approveResult.error).toContain('rejected session');
    });
  });

  describe('Session Rejection', () => {
    it('should reject session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const rejectResult = await workflow.rejectSession(sessionResult.sessionId!);

      expect(rejectResult.success).toBe(true);

      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('rejected');
    });

    it('should not reject already rejected session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.rejectSession(sessionResult.sessionId!);

      const rejectResult = await workflow.rejectSession(sessionResult.sessionId!);

      expect(rejectResult.success).toBe(false);
      expect(rejectResult.error).toContain('already rejected');
    });

    it('should not reject approved session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.approveSession(sessionResult.sessionId!);

      const rejectResult = await workflow.rejectSession(sessionResult.sessionId!);

      expect(rejectResult.success).toBe(false);
      expect(rejectResult.error).toContain('Cannot reject an approved session');
    });
  });

  describe('Session Status', () => {
    it('should return null for non-existent session', async () => {
      const status = await workflow.getSessionStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should return draft status for new session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      const status = await workflow.getSessionStatus(sessionResult.sessionId!);

      expect(status?.status).toBe('draft');
      expect(status?.commentCount).toBe(0);
      expect(status?.pendingComments).toBe(0);
      expect(status?.resolvedComments).toBe(0);
      expect(status?.createdAt).toBeInstanceOf(Date);
    });

    it('should track comment counts correctly', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.addComment(sessionResult.sessionId!, 'intro', 'Comment 1');
      await workflow.addComment(sessionResult.sessionId!, 'body', 'Comment 2');

      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.commentCount).toBe(2);
      expect(status?.pendingComments).toBe(2);
    });
  });

  describe('Session Persistence', () => {
    it('should persist and reload sessions', async () => {
      // Create session and add comment
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.addComment(sessionResult.sessionId!, 'intro', 'Test comment');

      // Create new workflow instance (simulates restart)
      const workflow2 = new ReviewWorkflow(testSessionsDir);
      await workflow2.initialize();

      // Verify session was loaded
      const status = await workflow2.getSessionStatus(sessionResult.sessionId!);
      expect(status).toBeDefined();
      expect(status?.commentCount).toBe(1);
    });

    it('should persist resolved comments across reloads', async () => {
      // Create session with resolved comment
      const sessionResult = await workflow.createSession(mockBundle);
      const commentResult = await workflow.addComment(
        sessionResult.sessionId!,
        'intro',
        'Test comment'
      );
      await workflow.resolveComment(sessionResult.sessionId!, commentResult.commentId!, 'accepted');

      // Reload workflow
      const workflow2 = new ReviewWorkflow(testSessionsDir);
      await workflow2.initialize();

      // Verify comment resolution persisted
      const comments = await workflow2.getSessionComments(sessionResult.sessionId!);
      expect(comments[0].resolution).toBe('accepted');
    });
  });

  describe('Bundle Sessions', () => {
    it('should track sessions by bundle', async () => {
      const result1 = await workflow.createSession(mockBundle);
      const result2 = await workflow.createSession(mockBundle);

      const bundleId = `${mockBundle.type}-${mockBundle.frontmatter.date}-test-blog-post`;
      const sessions = await workflow.getBundleSessions(bundleId);

      expect(sessions).toHaveLength(2);
      expect(sessions).toContain(result1.sessionId);
      expect(sessions).toContain(result2.sessionId);
    });

    it('should return empty array for unknown bundle', async () => {
      const sessions = await workflow.getBundleSessions('unknown-bundle');
      expect(sessions).toEqual([]);
    });
  });

  describe('Session Deletion', () => {
    it('should delete session', async () => {
      const sessionResult = await workflow.createSession(mockBundle);

      const deleted = await workflow.deleteSession(sessionResult.sessionId!);
      expect(deleted).toBe(true);

      // Verify session no longer exists
      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status).toBeNull();
    });

    it('should return false for non-existent session', async () => {
      const deleted = await workflow.deleteSession('non-existent');
      expect(deleted).toBe(false);
    });

    it('should remove deleted session from bundle index', async () => {
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.deleteSession(sessionResult.sessionId!);

      const bundleId = `${mockBundle.type}-${mockBundle.frontmatter.date}-test-blog-post`;
      const sessions = await workflow.getBundleSessions(bundleId);

      expect(sessions).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('should return zero statistics initially', async () => {
      const stats = await workflow.getStatistics();

      expect(stats.totalSessions).toBe(0);
      expect(stats.draftSessions).toBe(0);
      expect(stats.inReviewSessions).toBe(0);
      expect(stats.approvedSessions).toBe(0);
      expect(stats.rejectedSessions).toBe(0);
      expect(stats.totalComments).toBe(0);
      expect(stats.pendingComments).toBe(0);
    });

    it('should track session statistics', async () => {
      // Create multiple sessions
      const session1 = await workflow.createSession(mockBundle);
      const session2 = await workflow.createSession(mockBundle);

      await workflow.addComment(session1.sessionId!, 'intro', 'Comment');
      await workflow.approveSession(session2.sessionId!);
      await workflow.rejectSession(session1.sessionId!);

      const stats = await workflow.getStatistics();

      expect(stats.totalSessions).toBe(2);
      expect(stats.rejectedSessions).toBe(1);
      expect(stats.approvedSessions).toBe(1);
    });

    it('should track comment statistics', async () => {
      const sessionResult = await workflow.createSession(mockBundle);

      await workflow.addComment(sessionResult.sessionId!, 'intro', 'Comment 1');
      await workflow.addComment(sessionResult.sessionId!, 'body', 'Comment 2');
      const comment3 = await workflow.addComment(sessionResult.sessionId!, 'conclusion', 'Comment 3');

      await workflow.resolveComment(sessionResult.sessionId!, comment3.commentId!, 'accepted');

      const stats = await workflow.getStatistics();

      expect(stats.totalComments).toBe(3);
      expect(stats.pendingComments).toBe(2);
    });
  });

  describe('Integration: Complete Review Workflow', () => {
    it('should handle complete review lifecycle', async () => {
      // 1. Create session
      const sessionResult = await workflow.createSession(mockBundle);
      expect(sessionResult.success).toBe(true);

      let status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('draft');

      // 2. Add comments
      const comment1 = await workflow.addComment(sessionResult.sessionId!, 'intro', 'Fix intro');
      const comment2 = await workflow.addComment(sessionResult.sessionId!, 'body', 'Expand body');
      expect(comment1.success).toBe(true);
      expect(comment2.success).toBe(true);

      status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('in-review');
      expect(status?.commentCount).toBe(2);

      // 3. Resolve comments
      await workflow.resolveComment(sessionResult.sessionId!, comment1.commentId!, 'accepted');
      await workflow.resolveComment(sessionResult.sessionId!, comment2.commentId!, 'accepted');

      status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.resolvedComments).toBe(2);

      // 4. Approve session
      const approveResult = await workflow.approveSession(sessionResult.sessionId!);
      expect(approveResult.success).toBe(true);

      status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('approved');
    });

    it('should prevent premature approval', async () => {
      // Create session with pending comments
      const sessionResult = await workflow.createSession(mockBundle);
      await workflow.addComment(sessionResult.sessionId!, 'intro', 'Pending');

      // Try to approve with pending comments
      const approveResult = await workflow.approveSession(sessionResult.sessionId!);
      expect(approveResult.success).toBe(false);

      // Verify session not approved
      const status = await workflow.getSessionStatus(sessionResult.sessionId!);
      expect(status?.status).toBe('in-review');
    });
  });
});
