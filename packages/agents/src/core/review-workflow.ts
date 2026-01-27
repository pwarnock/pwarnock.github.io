/**
 * ReviewWorkflow Engine
 *
 * Manages draft creation and iteration cycles for the Content Agent System.
 * Handles inline comments, review sessions, and approval workflows with explicit
 * approval requirements (never auto-publishes).
 *
 * Key Features:
 * - Session lifecycle management (draft to in-review to approved)
 * - Inline comment tracking per section
 * - Comment resolution workflow (pending to accepted/rejected)
 * - Session history persistence
 * - Integration with content bundles
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { getAgentPaths } from '../config/index.js';
import type {
  ContentBundle,
  Comment,
  ContentType,
} from '../types/index.js';

/**
 * Draft review file structure
 *
 * Lightweight tracking for content drafts pending user review.
 * Stored at `.agents/drafts/{type}-{slug}.review.json`
 */
export interface DraftReviewFile {
  /** Path to the content bundle (e.g., content/blog/posts/2026-01-26-my-post/index.md) */
  bundlePath: string;

  /** Content type (blog, portfolio, tech-radar) */
  contentType: ContentType;

  /** Slug derived from title */
  slug: string;

  /** Current status of the draft */
  status: 'pending_review' | 'approved' | 'rejected';

  /** Image prompts generated for this content */
  imagePrompts: string[];

  /** When the draft was created */
  createdAt: string;

  /** When the draft was last updated */
  updatedAt: string;

  /** Validation result from content checks */
  validationResult: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };

  /** Optional notes from review */
  reviewNotes?: string;
}

/**
 * Generate a unique ID using Node.js crypto API
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Session storage interface
 */
interface SessionStorage {
  sessions: Map<string, InternalReviewSession>;
  bundleIndex: Map<string, string[]>; // bundleId -> sessionIds
}

/**
 * Resolution type for comments
 */
export type CommentResolution = 'pending' | 'accepted' | 'rejected';

/**
 * Session status type
 */
export type SessionStatus = 'draft' | 'in-review' | 'approved' | 'rejected';

/**
 * Internal ReviewSession with tracking
 */
interface InternalReviewSession {
  id: string;
  contentBundleId: string;
  comments: InternalComment[];
  bundleId: string;
  status: SessionStatus;
  createdAt: Date;
}

/**
 * Internal Comment with ID and resolution tracking
 */
interface InternalComment {
  id: string;
  section: string;
  text: string;
  resolution: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  resolvedAt?: Date;
}

/**
 * Result type for session operations
 */
export interface SessionResult {
  success: boolean;
  sessionId?: string;
  commentId?: string;
  error?: string;
}

/**
 * Review Workflow Engine
 *
 * Manages the complete review lifecycle for content bundles including:
 * - Session creation and lifecycle management
 * - Inline comment tracking and resolution
 * - Status transitions (draft to in-review to approved/rejected)
 * - Persistent session history storage
 *
 * IMPORTANT: Never auto-publishes - always requires explicit approval via approveSession()
 */
export class ReviewWorkflow {
  private storage: SessionStorage;
  private sessionsDir: string;
  private initialized: boolean = false;

  /**
   * Initialize the ReviewWorkflow engine
   *
   * @param sessionsDir - Directory path for session storage
   */
  constructor(sessionsDir?: string) {
    this.storage = {
      sessions: new Map(),
      bundleIndex: new Map(),
    };
    this.sessionsDir = sessionsDir || getAgentPaths().sessionsDir;
  }

  /**
   * Initialize the workflow engine
   * Creates sessions directory and loads existing sessions
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Create sessions directory if it doesn't exist
      await fs.mkdir(this.sessionsDir, { recursive: true });

      // Load existing sessions
      await this.loadSessions();

      this.initialized = true;
    } catch (error) {
      throw new Error(
        'Failed to initialize ReviewWorkflow: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  /**
   * Create a new review session for a content bundle
   *
   * Session lifecycle:
   * 1. Created with 'draft' status
   * 2. Can add comments immediately
   * 3. Must be explicitly approved (never auto-publishes)
   *
   * @param contentBundle - The content bundle to create a session for
   * @returns Session result with sessionId
   */
  async createSession(contentBundle: ContentBundle): Promise<SessionResult> {
    await this.ensureInitialized();

    try {
      // Generate unique session ID
      const sessionId = generateId();

      // Create new session with draft status
      const session: InternalReviewSession = {
        id: sessionId,
        contentBundleId: contentBundle.frontmatter.title || 'untitled',
        comments: [],
        bundleId: this.generateBundleId(contentBundle),
        status: 'draft',
        createdAt: new Date(),
      };

      // Store session
      this.storage.sessions.set(sessionId, session);

      // Update bundle index
      const bundleId = session.bundleId;
      if (!this.storage.bundleIndex.has(bundleId)) {
        this.storage.bundleIndex.set(bundleId, []);
      }
      this.storage.bundleIndex.get(bundleId)!.push(sessionId);

      // Persist session
      await this.saveSession(session);

      // Update content bundle with new session reference
      contentBundle.sessions.push({
        id: sessionId,
        contentBundleId: session.contentBundleId,
        comments: [],
        status: session.status === 'draft' || session.status === 'in-review' ? 'active' : session.status,
        createdAt: session.createdAt,
      });

      // Update bundle review status
      contentBundle.reviewStatus = 'draft';

      return {
        success: true,
        sessionId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create session: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Add an inline comment to a specific section
   *
   * Comments are tracked per section and can be resolved later.
   * Automatically transitions session to 'in-review' status.
   *
   * @param sessionId - The session to add the comment to
   * @param section - The section identifier (e.g., "intro", "conclusion")
   * @param text - The comment text
   * @returns Session result with commentId
   */
  async addComment(
    sessionId: string,
    section: string,
    text: string
  ): Promise<SessionResult> {
    await this.ensureInitialized();

    try {
      const session = this.storage.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Session not found: ' + sessionId,
        };
      }

      // Validate inputs
      if (!section || section.trim() === '') {
        return {
          success: false,
          error: 'Section identifier is required',
        };
      }

      if (!text || text.trim() === '') {
        return {
          success: false,
          error: 'Comment text is required',
        };
      }

      // Create new comment
      const comment: InternalComment = {
        id: generateId(),
        section: section.trim(),
        text: text.trim(),
        resolution: 'pending',
        createdAt: new Date(),
      };

      // Add to session
      session.comments.push(comment);

      // Transition to in-review if adding first comment
      if (session.status === 'draft' && session.comments.length === 1) {
        session.status = 'in-review';
      }

      // Persist updated session
      await this.saveSession(session);

      return {
        success: true,
        commentId: comment.id,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add comment: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Resolve a comment with a specific resolution
   *
   * Resolution options:
   * - 'accepted': Comment was addressed and change applied
   * - 'rejected': Comment was reviewed and decided against
   *
   * @param sessionId - The session containing the comment
   * @param commentId - The comment to resolve
   * @param resolution - The resolution status (accepted or rejected)
   * @returns Session result
   */
  async resolveComment(
    sessionId: string,
    commentId: string,
    resolution: 'accepted' | 'rejected'
  ): Promise<SessionResult> {
    await this.ensureInitialized();

    try {
      const session = this.storage.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Session not found: ' + sessionId,
        };
      }

      // Find comment
      const comment = session.comments.find(c => c.id === commentId);
      if (!comment) {
        return {
          success: false,
          error: 'Comment not found: ' + commentId,
        };
      }

      // Update comment resolution
      comment.resolution = resolution;
      comment.resolvedAt = new Date();

      // Persist updated session
      await this.saveSession(session);

      return {
        success: true,
        commentId: comment.id,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to resolve comment: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Approve a session for publication
   *
   * IMPORTANT: This is the ONLY way to transition a session to approved.
   * Never auto-publishes - requires explicit approval.
   *
   * Approval requirements:
   * - All comments must be resolved (accepted or rejected)
   * - Session must be in 'draft' or 'in-review' status
   *
   * @param sessionId - The session to approve
   * @returns Session result
   */
  async approveSession(sessionId: string): Promise<SessionResult> {
    await this.ensureInitialized();

    try {
      const session = this.storage.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Session not found: ' + sessionId,
        };
      }

      // Check if session is already approved or rejected
      if (session.status === 'approved') {
        return {
          success: false,
          error: 'Session is already approved',
        };
      }

      if (session.status === 'rejected') {
        return {
          success: false,
          error: 'Cannot approve a rejected session. Create a new session instead.',
        };
      }

      // Verify all comments are resolved
      const pendingComments = session.comments.filter(c => c.resolution === 'pending');
      if (pendingComments.length > 0) {
        return {
          success: false,
          error: 'Cannot approve session with ' + pendingComments.length + ' pending comment(s). Resolve all comments first.',
        };
      }

      // Approve session
      session.status = 'approved';

      // Persist updated session
      await this.saveSession(session);

      return {
        success: true,
        sessionId: session.id,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to approve session: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Reject a session
   *
   * Marks a session as rejected, preventing approval.
   * Create a new session to restart the review process.
   *
   * @param sessionId - The session to reject
   * @returns Session result
   */
  async rejectSession(sessionId: string): Promise<SessionResult> {
    await this.ensureInitialized();

    try {
      const session = this.storage.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Session not found: ' + sessionId,
        };
      }

      // Check if session is already finalized
      if (session.status === 'approved') {
        return {
          success: false,
          error: 'Cannot reject an approved session',
        };
      }

      if (session.status === 'rejected') {
        return {
          success: false,
          error: 'Session is already rejected',
        };
      }

      // Reject session
      session.status = 'rejected';

      // Persist updated session
      await this.saveSession(session);

      return {
        success: true,
        sessionId: session.id,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reject session: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Get the current status of a session
   *
   * Returns comprehensive session information including:
   * - Status (draft, in-review, approved, rejected)
   * - Comment count and resolution breakdown
   * - Creation timestamp
   *
   * @param sessionId - The session to query
   * @returns Session status or null if not found
   */
  async getSessionStatus(sessionId: string): Promise<{
    status: SessionStatus;
    commentCount: number;
    pendingComments: number;
    resolvedComments: number;
    acceptedComments: number;
    rejectedComments: number;
    createdAt: Date;
  } | null> {
    await this.ensureInitialized();

    const session = this.storage.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      status: session.status,
      commentCount: session.comments.length,
      pendingComments: session.comments.filter(c => c.resolution === 'pending').length,
      resolvedComments: session.comments.filter(c => c.resolution !== 'pending').length,
      acceptedComments: session.comments.filter(c => c.resolution === 'accepted').length,
      rejectedComments: session.comments.filter(c => c.resolution === 'rejected').length,
      createdAt: session.createdAt,
    };
  }

  /**
   * Get all comments for a session
   *
   * @param sessionId - The session to get comments from
   * @returns Array of comments or empty array if session not found
   */
  async getSessionComments(sessionId: string): Promise<Comment[]> {
    await this.ensureInitialized();

    const session = this.storage.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    // Return comments without internal fields
    return session.comments.map(comment => ({
      section: comment.section,
      text: comment.text,
      resolution: comment.resolution,
    }));
  }

  /**
   * Get all sessions for a content bundle
   *
   * @param bundleId - The bundle identifier
   * @returns Array of session IDs
   */
  async getBundleSessions(bundleId: string): Promise<string[]> {
    await this.ensureInitialized();

    return this.storage.bundleIndex.get(bundleId) || [];
  }

  /**
   * Delete a session (use with caution)
   *
   * @param sessionId - The session to delete
   * @returns Success status
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const session = this.storage.sessions.get(sessionId);
      if (!session) {
        return false;
      }

      // Remove from bundle index
      const bundleSessions = this.storage.bundleIndex.get(session.bundleId);
      if (bundleSessions) {
        const index = bundleSessions.indexOf(sessionId);
        if (index > -1) {
          bundleSessions.splice(index, 1);
        }
      }

      // Remove from storage
      this.storage.sessions.delete(sessionId);

      // Delete session file
      const sessionFile = path.join(this.sessionsDir, sessionId + '.json');
      await fs.unlink(sessionFile);

      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Load all existing sessions from storage
   */
  private async loadSessions(): Promise<void> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      const sessionFiles = files.filter(f => f.endsWith('.json'));

      for (const file of sessionFiles) {
        try {
          const filePath = path.join(this.sessionsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const session = JSON.parse(content) as InternalReviewSession;

          // Convert date strings back to Date objects
          session.createdAt = new Date(session.createdAt);
          session.comments.forEach(comment => {
            comment.createdAt = new Date(comment.createdAt);
            if (comment.resolvedAt) {
              comment.resolvedAt = new Date(comment.resolvedAt);
            }
          });

          // Load session
          this.storage.sessions.set(session.id, session);

          // Update bundle index
          if (!this.storage.bundleIndex.has(session.bundleId)) {
            this.storage.bundleIndex.set(session.bundleId, []);
          }
          this.storage.bundleIndex.get(session.bundleId)!.push(session.id);
        } catch (error) {
          console.error('Failed to load session from ' + file + ':', error);
        }
      }
    } catch (error) {
      // Directory might not exist yet, which is fine
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to load sessions:', error);
      }
    }
  }

  /**
   * Save a session to storage
   */
  private async saveSession(session: InternalReviewSession): Promise<void> {
    const sessionFile = path.join(this.sessionsDir, session.id + '.json');
    await fs.writeFile(sessionFile, JSON.stringify(session, null, 2), 'utf-8');
  }

  /**
   * Generate a stable bundle ID from content bundle
   */
  private generateBundleId(bundle: ContentBundle): string {
    const title = bundle.frontmatter.title || 'untitled';
    const date = bundle.frontmatter.date || new Date().toISOString().split('T')[0];
    return bundle.type + '-' + date + '-' + title.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Ensure the workflow engine is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get session statistics
   *
   * @returns Statistics about all sessions
   */
  async getStatistics(): Promise<{
    totalSessions: number;
    draftSessions: number;
    inReviewSessions: number;
    approvedSessions: number;
    rejectedSessions: number;
    totalComments: number;
    pendingComments: number;
  }> {
    await this.ensureInitialized();

    const sessions = Array.from(this.storage.sessions.values());

    return {
      totalSessions: sessions.length,
      draftSessions: sessions.filter(s => s.status === 'draft').length,
      inReviewSessions: sessions.filter(s => s.status === 'in-review').length,
      approvedSessions: sessions.filter(s => s.status === 'approved').length,
      rejectedSessions: sessions.filter(s => s.status === 'rejected').length,
      totalComments: sessions.reduce((sum, s) => sum + s.comments.length, 0),
      pendingComments: sessions.reduce(
        (sum, s) => sum + s.comments.filter(c => c.resolution === 'pending').length,
        0
      ),
    };
  }

  // ============================================================================
  // Draft Review File Methods
  // ============================================================================

  /**
   * Create a draft review file for a content bundle
   *
   * Draft files are lightweight tracking for content pending user review.
   * Unlike full review sessions, they don't track inline comments.
   *
   * @param options - Draft file options
   * @returns Result with file path
   */
  async createDraftReviewFile(options: {
    bundlePath: string;
    contentType: ContentType;
    slug: string;
    imagePrompts?: string[];
    validationResult?: { valid: boolean; errors: string[]; warnings: string[] };
  }): Promise<{ success: boolean; filePath?: string; error?: string }> {
    await this.ensureInitialized();

    try {
      const draftsDir = getAgentPaths().draftsDir;
      await fs.mkdir(draftsDir, { recursive: true });

      const now = new Date().toISOString();
      const draftFile: DraftReviewFile = {
        bundlePath: options.bundlePath,
        contentType: options.contentType,
        slug: options.slug,
        status: 'pending_review',
        imagePrompts: options.imagePrompts || [],
        createdAt: now,
        updatedAt: now,
        validationResult: options.validationResult || { valid: true, errors: [], warnings: [] },
      };

      const fileName = `${options.contentType}-${options.slug}.review.json`;
      const filePath = path.join(draftsDir, fileName);

      await fs.writeFile(filePath, JSON.stringify(draftFile, null, 2), 'utf-8');

      return { success: true, filePath };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create draft review file: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Get a draft review file by content type and slug
   *
   * @param contentType - The content type (blog, portfolio, tech-radar)
   * @param slug - The content slug
   * @returns Draft review file or null if not found
   */
  async getDraftReviewFile(
    contentType: ContentType,
    slug: string
  ): Promise<DraftReviewFile | null> {
    await this.ensureInitialized();

    try {
      const draftsDir = getAgentPaths().draftsDir;
      const fileName = `${contentType}-${slug}.review.json`;
      const filePath = path.join(draftsDir, fileName);

      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as DraftReviewFile;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all draft review files
   *
   * @param contentType - Optional filter by content type
   * @returns Array of draft review files
   */
  async listDraftReviewFiles(contentType?: ContentType): Promise<DraftReviewFile[]> {
    await this.ensureInitialized();

    try {
      const draftsDir = getAgentPaths().draftsDir;
      const files = await fs.readdir(draftsDir);

      const reviewFiles = files.filter(f => f.endsWith('.review.json'));
      const drafts: DraftReviewFile[] = [];

      for (const file of reviewFiles) {
        try {
          const filePath = path.join(draftsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const draft = JSON.parse(content) as DraftReviewFile;

          if (!contentType || draft.contentType === contentType) {
            drafts.push(draft);
          }
        } catch (error) {
          console.error(`Failed to read draft file ${file}:`, error);
        }
      }

      return drafts;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Approve a draft by updating its status and removing draft: true from content
   *
   * This is the ONLY way to transition a draft to approved status.
   * Modifies both the review file and the actual content file.
   *
   * @param contentType - The content type
   * @param slug - The content slug
   * @param notes - Optional approval notes
   * @returns Result with updated bundle path
   */
  async approveDraft(
    contentType: ContentType,
    slug: string,
    notes?: string
  ): Promise<{ success: boolean; bundlePath?: string; error?: string }> {
    await this.ensureInitialized();

    try {
      const draft = await this.getDraftReviewFile(contentType, slug);
      if (!draft) {
        return { success: false, error: `Draft not found: ${contentType}-${slug}` };
      }

      if (draft.status === 'approved') {
        return { success: false, error: 'Draft is already approved' };
      }

      // Update the content file to remove draft: true
      const bundlePath = draft.bundlePath;
      const content = await fs.readFile(bundlePath, 'utf-8');

      // Replace draft: true with draft: false in frontmatter
      const updatedContent = content.replace(/^(---[\s\S]*?)draft:\s*true([\s\S]*?---)/, '$1draft: false$2');

      await fs.writeFile(bundlePath, updatedContent, 'utf-8');

      // Update the draft review file
      draft.status = 'approved';
      draft.updatedAt = new Date().toISOString();
      if (notes) {
        draft.reviewNotes = notes;
      }

      const draftsDir = getAgentPaths().draftsDir;
      const fileName = `${contentType}-${slug}.review.json`;
      const filePath = path.join(draftsDir, fileName);
      await fs.writeFile(filePath, JSON.stringify(draft, null, 2), 'utf-8');

      return { success: true, bundlePath };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to approve draft: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Reject a draft
   *
   * @param contentType - The content type
   * @param slug - The content slug
   * @param notes - Rejection reason
   * @returns Result
   */
  async rejectDraft(
    contentType: ContentType,
    slug: string,
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    await this.ensureInitialized();

    try {
      const draft = await this.getDraftReviewFile(contentType, slug);
      if (!draft) {
        return { success: false, error: `Draft not found: ${contentType}-${slug}` };
      }

      draft.status = 'rejected';
      draft.updatedAt = new Date().toISOString();
      draft.reviewNotes = notes;

      const draftsDir = getAgentPaths().draftsDir;
      const fileName = `${contentType}-${slug}.review.json`;
      const filePath = path.join(draftsDir, fileName);
      await fs.writeFile(filePath, JSON.stringify(draft, null, 2), 'utf-8');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reject draft: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Delete a draft review file
   *
   * @param contentType - The content type
   * @param slug - The content slug
   * @returns Success status
   */
  async deleteDraftReviewFile(contentType: ContentType, slug: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const draftsDir = getAgentPaths().draftsDir;
      const fileName = `${contentType}-${slug}.review.json`;
      const filePath = path.join(draftsDir, fileName);

      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }
}
