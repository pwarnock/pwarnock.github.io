/**
 * Signoff Workflow Engine
 *
 * Orchestrates the approval process for content bundles with validation checkpoints.
 * Integrates ReviewWorkflow for session management and ValidationResult for validation.
 * Ensures content cannot be auto-published - requires explicit user approval.
 *
 * Key Features:
 * - Multi-stage validation checkpoints (frontmatter, structure, images, comments)
 * - Integration with ReviewWorkflow for session management
 * - Explicit approval required (never auto-publishes)
 * - Block approval if validation fails or pending comments exist
 * - Comprehensive status reporting and change summaries
 * - Rejection tracking with reasons
 */

import type {
  ContentBundle,
  ValidationResult,
  ValidationCheckpoints,
  SignoffStatus,
  SignoffResult,
  ChangeSummary,
} from '../types/index.js';
import { ReviewWorkflow } from './review-workflow.js';
import { HugoIntegration } from './hugo-integration.js';
import { getAgentPaths } from '../config/index.js';

/**
 * Signoff Workflow Engine
 *
 * Manages the complete approval workflow for content bundles:
 * - Creates review sessions via ReviewWorkflow
 * - Runs validation checkpoints (frontmatter, structure, images, comments)
 * - Tracks validation results and prevents premature approval
 * - Generates comprehensive summaries of changes and validation results
 * - Requires explicit approval (never auto-publishes)
 *
 * Workflow Stages:
 * 1. prepareForSignoff() - Create session and run initial validation
 * 2. User reviews and adds comments via ReviewWorkflow
 * 3. User addresses issues and updates content
 * 4. requestApproval() - Request approval, triggers validation re-check
 * 5. approveSession() - Final explicit approval (ONLY if validation passes)
 * 6. Content ready for publish
 */
/**
 * Session metadata for tracking validation
 */
interface SessionMetadata {
  sessionId: string;
  contentType: string;
  title: string;
  checkpoints: ValidationCheckpoints;
  validationResults: ValidationResult;
  createdAt: Date;
}

export class SignoffWorkflow {
  private reviewWorkflow: ReviewWorkflow;
  private hugoIntegration: HugoIntegration;
  private projectRoot: string;
  private initialized: boolean = false;
  private sessionMetadata: Map<string, SessionMetadata>;

  /**
   * Initialize the SignoffWorkflow engine
   *
   * @param projectRoot - Project root directory
   * @param sessionsDir - Directory for session storage
   */
  constructor(projectRoot?: string, sessionsDir?: string) {
    const paths = getAgentPaths(projectRoot);
    this.projectRoot = paths.projectRoot;
    const sessionsPath = sessionsDir || paths.sessionsDir;

    this.reviewWorkflow = new ReviewWorkflow(sessionsPath);
    this.hugoIntegration = new HugoIntegration(this.projectRoot);
    this.sessionMetadata = new Map();
  }

  /**
   * Initialize the workflow engine
   * Initializes ReviewWorkflow and HugoIntegration
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.reviewWorkflow.initialize();
      this.initialized = true;
    } catch (error) {
      throw new Error(
        'Failed to initialize SignoffWorkflow: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  /**
   * Prepare content bundle for signoff
   *
   * Creates a review session and runs all validation checkpoints.
   * This is the entry point for the signoff workflow.
   *
   * @param contentBundle - The content bundle to prepare for signoff
   * @returns SignoffResult with sessionId and validation status
   */
  async prepareForSignoff(contentBundle: ContentBundle): Promise<SignoffResult> {
    await this.ensureInitialized();

    try {
      // Validate content bundle type
      if (!contentBundle.type) {
        return {
          success: false,
          error: 'Invalid content bundle: missing type',
        };
      }

      // Step 1: Create review session
      const sessionResult = await this.reviewWorkflow.createSession(contentBundle);
      if (!sessionResult.success || !sessionResult.sessionId) {
        return {
          success: false,
          error: sessionResult.error || 'Failed to create review session',
        };
      }

      const sessionId = sessionResult.sessionId;

      // Step 2: Run validation checkpoints
      const checkpoints = await this.runValidationCheckpoints(contentBundle);

      // Step 3: Get validation errors/warnings
      const validationResult = await this.validateContent(contentBundle);

      // Step 4: Store session metadata
      const metadata: SessionMetadata = {
        sessionId,
        contentType: contentBundle.type,
        title: contentBundle.frontmatter.title || 'Untitled',
        checkpoints,
        validationResults: validationResult,
        createdAt: new Date(),
      };
      this.sessionMetadata.set(sessionId, metadata);

      // Step 5: Check pending comments
      const status = await this.reviewWorkflow.getSessionStatus(sessionId);
      const pendingComments = status?.pendingComments || 0;

      // Step 6: Check if validation passed
      checkpoints.comments = pendingComments === 0;
      const validationPassed = this.checkValidationPassed(checkpoints);

      // Step 7: Determine if approval is possible
      const canApprove = validationPassed && pendingComments === 0;

      // Step 8: Generate signoff status
      const signoffStatus: SignoffStatus = {
        canApprove,
        validationPassed,
        pendingComments,
        validationErrors: validationResult.errors,
        validationWarnings: validationResult.warnings,
        checkpoints,
      };

      return {
        success: true,
        sessionId,
        status: signoffStatus,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to prepare for signoff: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Run all validation checkpoints for a content bundle
   *
   * Validation checkpoints:
   * - frontmatter: Required fields present and valid
   * - structure: Content structure is valid
   * - images: Image references are valid (if present)
   * - comments: No pending comments (checked separately)
   *
   * @param contentBundle - The content bundle to validate
   * @returns ValidationCheckpoints with results for each checkpoint
   */
  async runValidationCheckpoints(contentBundle: ContentBundle): Promise<ValidationCheckpoints> {
    await this.ensureInitialized();

    const checkpoints: ValidationCheckpoints = {
      frontmatter: false,
      structure: false,
      images: false,
      comments: false,
    };

    try {
      // Checkpoint 1: Frontmatter validation
      checkpoints.frontmatter = await this.validateFrontmatter(contentBundle);

      // Checkpoint 2: Structure validation
      checkpoints.structure = await this.validateStructure(contentBundle);

      // Checkpoint 3: Images validation (if images present)
      checkpoints.images = await this.validateImages(contentBundle);

      // Checkpoint 4: Comments validation (must be checked via session)
      // This is set to true initially - will be checked in requestApproval
      checkpoints.comments = true;

      return checkpoints;
    } catch (error) {
      console.error('Error running validation checkpoints:', error);
      return checkpoints;
    }
  }

  /**
   * Request approval for a session
   *
   * Triggers validation re-check and returns current status.
   * Does NOT approve - just validates and reports if approval is possible.
   *
   * @param sessionId - The session to request approval for
   * @returns SignoffResult with current status
   */
  async requestApproval(sessionId: string): Promise<SignoffResult> {
    await this.ensureInitialized();

    try {
      // Get session status
      const sessionStatus = await this.reviewWorkflow.getSessionStatus(sessionId);
      if (!sessionStatus) {
        return {
          success: false,
          error: 'Session not found: ' + sessionId,
        };
      }

      // Get stored metadata
      const metadata = this.sessionMetadata.get(sessionId);
      if (!metadata) {
        return {
          success: false,
          error: 'Session metadata not found: ' + sessionId,
        };
      }

      // Check for pending comments
      const pendingComments = sessionStatus.pendingComments;

      // Update checkpoints with current comment status
      const checkpoints: ValidationCheckpoints = {
        ...metadata.checkpoints,
        comments: pendingComments === 0,
      };

      // Determine if validation passed
      const validationPassed = this.checkValidationPassed(checkpoints);

      // Determine if approval is possible
      const canApprove = validationPassed && pendingComments === 0;

      // Build validation errors
      const validationErrors: string[] = [];
      if (!validationPassed) {
        if (!checkpoints.frontmatter) validationErrors.push('Frontmatter validation failed');
        if (!checkpoints.structure) validationErrors.push('Structure validation failed');
        if (!checkpoints.images) validationErrors.push('Image validation failed');
        if (!checkpoints.comments) validationErrors.push('Pending comments must be resolved');
      }

      // Build signoff status
      const signoffStatus: SignoffStatus = {
        canApprove,
        validationPassed,
        pendingComments,
        validationErrors,
        validationWarnings: metadata.validationResults.warnings,
        checkpoints,
      };

      return {
        success: true,
        sessionId,
        status: signoffStatus,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to request approval: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Approve a session for publication
   *
   * IMPORTANT: This is the ONLY way to approve a session.
   * Never auto-publishes - requires explicit approval.
   *
   * Approval requirements:
   * - All validation checkpoints must pass
   * - No pending comments allowed
   * - Session must exist
   *
   * @param sessionId - The session to approve
   * @returns SignoffResult
   */
  async approveSession(sessionId: string): Promise<SignoffResult> {
    await this.ensureInitialized();

    try {
      // First check if approval is possible
      const approvalRequest = await this.requestApproval(sessionId);
      if (!approvalRequest.success || !approvalRequest.status) {
        return {
          success: false,
          error: approvalRequest.error || 'Failed to check approval status',
        };
      }

      // Check if approval is allowed
      if (!approvalRequest.status.canApprove) {
        const reasons: string[] = [];

        if (!approvalRequest.status.validationPassed) {
          reasons.push('Validation checkpoints must pass');
        }

        if (approvalRequest.status.pendingComments > 0) {
          reasons.push(`${approvalRequest.status.pendingComments} pending comment(s) must be resolved`);
        }

        return {
          success: false,
          error: 'Cannot approve session: ' + reasons.join('. '),
          status: approvalRequest.status,
        };
      }

      // Approve the session via ReviewWorkflow
      const approveResult = await this.reviewWorkflow.approveSession(sessionId);
      if (!approveResult.success) {
        return {
          success: false,
          error: approveResult.error || 'Failed to approve session',
        };
      }

      return {
        success: true,
        sessionId,
        status: approvalRequest.status,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to approve session: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Reject a session with a reason
   *
   * Marks a session as rejected and stores the rejection reason.
   * Create a new session to restart the signoff process.
   *
   * @param sessionId - The session to reject
   * @param reason - The reason for rejection
   * @returns SignoffResult
   */
  async rejectSession(sessionId: string, reason: string): Promise<SignoffResult> {
    await this.ensureInitialized();

    try {
      // Validate reason
      if (!reason || reason.trim() === '') {
        return {
          success: false,
          error: 'Rejection reason is required',
        };
      }

      // Reject the session via ReviewWorkflow
      const rejectResult = await this.reviewWorkflow.rejectSession(sessionId);
      if (!rejectResult.success) {
        return {
          success: false,
          error: rejectResult.error || 'Failed to reject session',
        };
      }

      // Store rejection reason (would be in session metadata in production)
      // For now, we'll just log it
      console.log(`Session ${sessionId} rejected: ${reason}`);

      return {
        success: true,
        sessionId,
        error: reason, // Using error field to pass rejection reason
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reject session: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Get current signoff status for a session
   *
   * Returns comprehensive status including:
   * - Whether approval is possible
   * - Validation results
   * - Pending comments count
   * - Validation errors and warnings
   * - Checkpoint results
   *
   * @param sessionId - The session to get status for
   * @returns SignoffStatus or null if session not found
   */
  async getSignoffStatus(sessionId: string): Promise<SignoffStatus | null> {
    await this.ensureInitialized();

    try {
      // Get session status from ReviewWorkflow
      const sessionStatus = await this.reviewWorkflow.getSessionStatus(sessionId);
      if (!sessionStatus) {
        return null;
      }

      // Get stored metadata
      const metadata = this.sessionMetadata.get(sessionId);
      if (!metadata) {
        return null;
      }

      // Check for pending comments
      const pendingComments = sessionStatus.pendingComments;

      // Update checkpoints with current comment status
      const checkpoints: ValidationCheckpoints = {
        ...metadata.checkpoints,
        comments: pendingComments === 0,
      };

      // Determine if validation passed
      const validationPassed = this.checkValidationPassed(checkpoints);

      // Determine if approval is possible
      const canApprove = validationPassed && pendingComments === 0;

      // Build validation errors
      const validationErrors: string[] = [];
      if (!validationPassed) {
        if (!checkpoints.frontmatter) validationErrors.push('Frontmatter validation failed');
        if (!checkpoints.structure) validationErrors.push('Structure validation failed');
        if (!checkpoints.images) validationErrors.push('Image validation failed');
        if (!checkpoints.comments) validationErrors.push('Pending comments must be resolved');
      }

      return {
        canApprove,
        validationPassed,
        pendingComments,
        validationErrors,
        validationWarnings: metadata.validationResults.warnings,
        checkpoints,
      };
    } catch (error) {
      console.error('Failed to get signoff status:', error);
      return null;
    }
  }

  /**
   * Generate a summary of changes and validation results
   *
   * Provides a comprehensive summary including:
   * - Session information
   * - Content type and title
   * - Validation status
   * - Comment resolution status
   * - Checkpoint results
   *
   * @param sessionId - The session to generate summary for
   * @returns ChangeSummary or null if session not found
   */
  async generateSummary(sessionId: string): Promise<ChangeSummary | null> {
    await this.ensureInitialized();

    try {
      // Get session status
      const sessionStatus = await this.reviewWorkflow.getSessionStatus(sessionId);
      if (!sessionStatus) {
        return null;
      }

      // Get stored metadata
      const metadata = this.sessionMetadata.get(sessionId);
      if (!metadata) {
        return null;
      }

      // Get signoff status
      const signoffStatus = await this.getSignoffStatus(sessionId);
      if (!signoffStatus) {
        return null;
      }

      // Build summary
      const summary: ChangeSummary = {
        sessionId,
        contentType: metadata.contentType,
        title: metadata.title,
        validationPassed: signoffStatus.validationPassed,
        commentsResolved: sessionStatus.resolvedComments,
        commentsPending: sessionStatus.pendingComments,
        createdAt: metadata.createdAt,
        checkpoints: signoffStatus.checkpoints,
      };

      return summary;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return null;
    }
  }

  /**
   * Validate frontmatter checkpoint
   *
   * @param contentBundle - The content bundle to validate
   * @returns True if frontmatter is valid
   */
  private async validateFrontmatter(contentBundle: ContentBundle): Promise<boolean> {
    try {
      const frontmatter = contentBundle.frontmatter;

      // Check for required fields based on content type
      switch (contentBundle.type) {
        case 'blog':
          return !!(
            frontmatter.title &&
            frontmatter.date &&
            frontmatter.summary
          );

        case 'portfolio':
          return !!(
            frontmatter.title &&
            frontmatter.date &&
            frontmatter.description &&
            frontmatter.client &&
            frontmatter.technologies &&
            frontmatter.completion_date &&
            frontmatter.category
          );

        case 'tech-radar':
          return !!(
            frontmatter.title &&
            frontmatter.date &&
            frontmatter.description &&
            frontmatter.quadrant &&
            frontmatter.ring
          );

        default:
          return false;
      }
    } catch (error) {
      console.error('Frontmatter validation error:', error);
      return false;
    }
  }

  /**
   * Validate structure checkpoint
   *
   * @param contentBundle - The content bundle to validate
   * @returns True if structure is valid
   */
  private async validateStructure(contentBundle: ContentBundle): Promise<boolean> {
    try {
      // Check if content exists
      if (!contentBundle.content || contentBundle.content.trim() === '') {
        return false;
      }

      // Check if content has basic structure (at least one heading)
      const hasHeading = /^#+\s/.test(contentBundle.content);
      return hasHeading;
    } catch (error) {
      console.error('Structure validation error:', error);
      return false;
    }
  }

  /**
   * Validate images checkpoint
   *
   * @param contentBundle - The content bundle to validate
   * @returns True if images are valid (or no images present)
   */
  private async validateImages(contentBundle: ContentBundle): Promise<boolean> {
    try {
      // If no image prompts, consider this checkpoint passed
      if (!contentBundle.imagePrompts || contentBundle.imagePrompts.length === 0) {
        return true;
      }

      // Check if all image prompts are non-empty
      const allValid = contentBundle.imagePrompts.every(prompt => prompt && prompt.trim() !== '');
      return allValid;
    } catch (error) {
      console.error('Images validation error:', error);
      return false;
    }
  }

  /**
   * Validate content bundle
   *
   * Runs comprehensive validation and returns detailed results.
   * This method would integrate with HugoIntegration.validateContentBundle()
   * in production.
   *
   * @param contentBundle - The content bundle to validate
   * @returns ValidationResult with errors and warnings
   */
  private async validateContent(contentBundle: ContentBundle): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate frontmatter
      const frontmatterValid = await this.validateFrontmatter(contentBundle);
      if (!frontmatterValid) {
        errors.push('Frontmatter validation failed: missing required fields');
      }

      // Validate structure
      const structureValid = await this.validateStructure(contentBundle);
      if (!structureValid) {
        errors.push('Structure validation failed: content is empty or missing headings');
      }

      // Validate images
      const imagesValid = await this.validateImages(contentBundle);
      if (!imagesValid) {
        errors.push('Image validation failed: some image prompts are empty');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push('Validation error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return {
        valid: false,
        errors,
        warnings,
      };
    }
  }

  /**
   * Check if all validation checkpoints passed
   *
   * @param checkpoints - The validation checkpoints to check
   * @returns True if all checkpoints passed
   */
  private checkValidationPassed(checkpoints: ValidationCheckpoints): boolean {
    return (
      checkpoints.frontmatter &&
      checkpoints.structure &&
      checkpoints.images &&
      checkpoints.comments
    );
  }

  /**
   * Ensure the workflow engine is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
