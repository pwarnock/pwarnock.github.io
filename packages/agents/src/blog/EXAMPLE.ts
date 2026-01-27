/**
 * BlogAgent Usage Examples
 *
 * This file demonstrates how to use the BlogAgent class
 * to generate blog post content bundles.
 */

import { BlogAgent } from './blog-agent.js';

/**
 * Example 1: Generate an original blog post
 */
async function generateOriginalPost() {
  const agent = new BlogAgent();
  await agent.initialize();

  const result = await agent.generateBlogPost({
    title: 'My Approach to Testing Web Applications',
    contentType: 'original',
    summary: 'How I structure tests for web applications using Playwright and Vitest.',
    keyPoints: [
      'Unit tests for business logic',
      'Integration tests for API contracts',
      'E2E tests for critical user flows'
    ],
    tags: ['testing', 'web-development', 'quality-assurance'],
    categories: ['Engineering'],
  });

  if (result.success) {
    console.log('Blog post generated at:', result.bundlePath);
    console.log('Session ID:', result.bundle?.sessions[0].id);
  } else {
    console.error('Error:', result.error);
  }
}

/**
 * Example 2: Generate a curated blog post
 */
async function generateCuratedPost() {
  const agent = new BlogAgent();
  await agent.initialize();

  const result = await agent.generateBlogPost({
    title: 'Weekly Tech Reading #42',
    contentType: 'curated',
    summary: 'This week\'s most interesting articles on software development.',
    keyPoints: [
      'New framework releases',
      'Security updates',
      'Community discussions'
    ],
    tags: ['curated', 'reading-list'],
    categories: ['Tech'],
  });

  if (result.success) {
    console.log('Curated post generated');
  }
}

/**
 * Example 3: Generate a project-based blog post
 */
async function generateProjectPost() {
  const agent = new BlogAgent();
  await agent.initialize();

  const result = await agent.generateBlogPost({
    title: 'Building a Custom Static Site Generator',
    contentType: 'project',
    summary: 'Lessons learned from building my own SSG with Hugo and TypeScript.',
    keyPoints: [
      'Content bundle structure',
      'Frontmatter validation',
      'Performance optimization'
    ],
    tags: ['project', 'hugo', 'typescript'],
    categories: ['Engineering'],
  });

  if (result.success) {
    console.log('Project post generated');
  }
}

/**
 * Example 4: Record user feedback for voice learning
 */
async function recordFeedbackExample() {
  const agent = new BlogAgent();
  await agent.initialize();

  // Positive feedback
  const positiveResult = await agent.recordFeedback(
    'I like how you keep it conversational and use "I" statements',
    'positive'
  );
  console.log('Positive feedback recorded:', positiveResult.summary);

  // Negative feedback
  const negativeResult = await agent.recordFeedback(
    'Don\'t use "delve into" - it sounds too AI-written',
    'negative'
  );
  console.log('Negative feedback recorded:', negativeResult.summary);
}

/**
 * Example 5: Get learning progress
 */
async function checkProgressExample() {
  const agent = new BlogAgent();
  await agent.initialize();

  const progress = await agent.getLearningProgress();
  console.log('Learning progress:', progress);
}

/**
 * Example 6: Generate from template
 */
async function generateFromTemplateExample() {
  const agent = new BlogAgent();
  await agent.initialize();

  const result = await agent.generateFromTemplate({
    contentType: 'original',
    title: 'Template Test Post',
    summary: 'Generated using the template helper',
    keyPoints: ['Point 1', 'Point 2'],
    tags: ['test'],
    categories: ['Testing'],
  });

  if (result.success) {
    console.log('Template-based post generated');
  }
}

/**
 * Example 7: Review workflow integration
 */
async function reviewWorkflowExample() {
  const agent = new BlogAgent();
  await agent.initialize();

  // Generate a blog post
  const result = await agent.generateBlogPost({
    title: 'Review Workflow Test',
    contentType: 'original',
    summary: 'Testing the review workflow integration.',
  });

  if (result.success && result.bundle?.sessions[0]) {
    const sessionId = result.bundle.sessions[0].id;
    const workflow = agent.getReviewWorkflow();

    // Add a comment
    const commentResult = await workflow.addComment(
      sessionId,
      'introduction',
      'Make this more personal'
    );
    console.log('Comment added:', commentResult.commentId);

    // Get session status
    const status = await workflow.getSessionStatus(sessionId);
    console.log('Session status:', status);

    // Resolve the comment
    await workflow.resolveComment(sessionId, commentResult.commentId!, 'accepted');

    // Approve the session (only when all comments are resolved)
    const approveResult = await workflow.approveSession(sessionId);
    console.log('Session approved:', approveResult.success);
  }
}

/**
 * Example 8: Validate generated content
 */
async function validateContentExample() {
  const agent = new BlogAgent();
  await agent.initialize();

  const result = await agent.generateBlogPost({
    title: 'Validation Test',
    contentType: 'original',
    summary: 'Testing content validation with proper length and structure.',
    date: new Date('2025-01-15'),
  });

  if (result.success && result.bundlePath) {
    const validation = await agent.validateBlogPost(result.bundlePath);
    console.log('Validation result:', validation);

    if (validation.valid) {
      console.log('Content is valid!');
    } else {
      console.log('Validation errors:', validation.errors);
    }
  }
}

/**
 * Example 9: Get content type information
 */
async function contentTypeInfoExample() {
  const agent = new BlogAgent();

  const types = agent.getSupportedContentTypes();
  console.log('Supported content types:', types);

  types.forEach(type => {
    const description = agent.getContentTypeDescription(type);
    console.log(`${type}: ${description}`);
  });
}

/**
 * Example 10: Complete workflow
 */
async function completeWorkflowExample() {
  const agent = new BlogAgent();
  await agent.initialize();

  // 1. Generate blog post
  console.log('1. Generating blog post...');
  const result = await agent.generateBlogPost({
    title: 'Complete Workflow Example',
    contentType: 'original',
    summary: 'A complete example of the BlogAgent workflow.',
    keyPoints: ['Step 1', 'Step 2', 'Step 3'],
    tags: ['example', 'workflow'],
    categories: ['Documentation'],
  });

  if (!result.success) {
    console.error('Failed to generate blog post:', result.error);
    return;
  }

  console.log('   Generated at:', result.bundlePath);
  console.log('   Session ID:', result.bundle?.sessions[0].id);

  // 2. Validate content
  console.log('\n2. Validating content...');
  if (result.bundlePath) {
    const validation = await agent.validateBlogPost(result.bundlePath);
    console.log('   Valid:', validation.valid);
    console.log('   Errors:', validation.errors.length);
    console.log('   Warnings:', validation.warnings.length);
  }

  // 3. Check style guidelines
  console.log('\n3. Style guidelines:');
  const guidelines = await agent.getStyleGuidelines();
  console.log('   Tone:', guidelines.tone);
  console.log('   Dos:', guidelines.dos.length);
  console.log('   Donts:', guidelines.donts.length);

  // 4. Learning progress
  console.log('\n4. Learning progress:');
  const progress = await agent.getLearningProgress();
  console.log('   Vocabulary:', progress.vocabularyCount);
  console.log('   Patterns:', progress.patternCount);
}

// Export examples
export {
  generateOriginalPost,
  generateCuratedPost,
  generateProjectPost,
  recordFeedbackExample,
  checkProgressExample,
  generateFromTemplateExample,
  reviewWorkflowExample,
  validateContentExample,
  contentTypeInfoExample,
  completeWorkflowExample,
};
