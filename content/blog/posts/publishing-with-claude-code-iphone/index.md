---
title: 'Publishing Blog Posts with Claude Code on iPhone'
date: 2026-01-23T18:00:00Z
draft: false
summary: 'How I use Claude Code in the Claude app on iPhone to create, edit, and publish blog posts directly from my mobile device.'
tags: ['Claude Code', 'iOS', 'Mobile Development', 'AI Agents', 'Blogging']
author: 'Peter Warnock'
content_type: 'original'
---

## The Mobile Publishing Revolution

I never thought I'd be publishing blog posts from my iPhone. But with Claude Code integrated into the Claude mobile app, I'm now writing, editing, and deploying content while sitting on the couch, riding the bus, or waiting in line for coffee.

This isn't just "mobile-friendly" editing—this is full-stack development and deployment from a 6-inch screen. Here's how it works.

## What is Claude Code?

Claude Code is Anthropic's official CLI tool that brings agentic coding capabilities directly into conversations with Claude. While it started as a desktop tool, the Claude mobile app now includes the same autonomous coding features:

- **File operations**: Create, read, edit files in your repository
- **Git integration**: Commit changes, push to remote branches, create pull requests
- **Command execution**: Run builds, tests, and deployment scripts
- **Multi-file context**: Navigate codebases with full project awareness

All of this happens through natural language instructions to Claude, who acts as your development partner.

## My Mobile Workflow

### 1. Starting the Conversation

I open the Claude app on my iPhone and describe what I want to publish:

> "Create a blog post about X. The post should explain Y and include examples of Z."

Claude understands the blog structure (Hugo with YAML frontmatter) and immediately gets to work.

### 2. Claude Explores the Codebase

Before writing anything, Claude explores existing blog posts to understand:
- File structure and naming conventions
- Frontmatter requirements (title, date, tags, summary)
- Writing style and tone
- Content organization patterns

This exploration happens autonomously—I don't need to provide instructions about file locations or format requirements.

### 3. Content Creation

Claude creates the blog post file with:
- Proper YAML frontmatter
- Structured markdown content
- Appropriate tags and metadata
- Current date/time

If I want changes, I just describe them conversationally:

> "Make the introduction more technical"
> "Add a section about edge cases"
> "Include code examples for the setup process"

### 4. Review and Iterate

Claude shows me the content. I can request edits, additions, or restructuring. The back-and-forth feels natural—like working with a colleague who happens to have perfect recall of the entire codebase.

### 5. Git Operations

When I'm satisfied, I ask Claude to commit and push:

> "Looks good. Commit this and push to the feature branch."

Claude handles:
- Creating commits with descriptive messages
- Pushing to the correct branch
- Including the Claude session URL in commit messages (for auditability)

### 6. Deployment

For this Hugo-based blog, deployment happens automatically via GitHub Actions when changes reach the main branch. But Claude can also:
- Create pull requests with detailed descriptions
- Run build commands to verify the site compiles
- Preview the post locally (if I'm on desktop)

## What Makes This Powerful

### Context Awareness

Claude maintains full context of:
- The conversation history
- Files it has read or modified
- Git repository state
- Previous edits in this session

This means I can reference earlier points conversationally:

> "Actually, move that second section before the introduction."

No need to specify file paths or line numbers—Claude knows what "that section" means.

### Mobile-Optimized Interaction

The Claude mobile app is designed for these workflows:
- **Voice input**: Dictate instructions while walking
- **Quick edits**: Tap to approve or request changes
- **Session continuity**: Pick up where you left off
- **Tool permissions**: Control when Claude can execute commands

### Real Development Power

This isn't a watered-down mobile experience. Claude has full access to:
- File system operations
- Git commands
- Build tools and test runners
- Package managers
- Shell commands

The only limitation is screen size—but Claude's concise output and clear status updates work perfectly on mobile.

## Practical Benefits

### 1. Capture Ideas Immediately

When inspiration strikes, I can start writing immediately—no need to wait until I'm at a computer. The idea gets captured with full context and proper structure.

### 2. Iterative Refinement

Mobile sessions are perfect for iterative work:
- Morning: Draft outline
- Afternoon: Expand sections
- Evening: Polish and publish

Each session builds on the previous one through Git history and Claude's context awareness.

### 3. Location Independence

I've published blog posts from:
- Airport lounges
- Coffee shops
- My backyard
- Late night from bed (this is dangerous for productivity)

As long as I have an internet connection, I have full publishing capabilities.

### 4. Lower Friction

The biggest barrier to blogging is friction—opening editors, remembering frontmatter syntax, formatting markdown, running builds. Claude handles all of that, leaving me to focus purely on ideas and writing.

## The Technical Details

### Repository Structure

This blog uses Hugo, a static site generator. Posts live in:
```
content/blog/posts/post-name/index.md
```

Each post includes YAML frontmatter:
```yaml
---
title: 'Post Title'
date: 2026-01-23T18:00:00Z
draft: false
summary: 'Brief description'
tags: ['tag1', 'tag2']
author: 'Peter Warnock'
---
```

Claude knows this structure from exploring the codebase and generates compliant files automatically.

### Git Branch Workflow

When working on a blog post, Claude:
1. Creates or checks out a feature branch (e.g., `claude/blog-post-name-abc123`)
2. Commits changes with descriptive messages
3. Pushes to origin
4. Can create PRs for review

The branch naming convention (`claude/` prefix) helps identify AI-generated work.

### Mobile Constraints

Some operations are better suited for desktop:
- **Image editing**: Adding screenshots or diagrams
- **Complex debugging**: When build errors need investigation
- **Large refactors**: Touching many files simultaneously

But for pure content creation and publishing? Mobile works beautifully.

## Tips for Mobile Publishing

### 1. Use Voice Input

The Claude app supports voice input. Dictating instructions while walking or commuting feels natural and efficient.

### 2. Keep Sessions Focused

Mobile sessions work best when focused on a single task. If you need to refactor code AND write a blog post, split them into separate conversations.

### 3. Trust Claude's Exploration

Let Claude explore the codebase before making changes. It will discover patterns and conventions that ensure consistency.

### 4. Review Before Pushing

Always review the generated content before committing. Claude shows you the files it created or modified—take a moment to skim them.

### 5. Use Todo Lists for Complex Posts

For multi-section posts, ask Claude to create a todo list:

> "Create a blog post about X. Make a todo list for the sections we need to write."

This gives you a clear roadmap and lets you work through sections incrementally.

## The Bigger Picture

Mobile publishing with Claude Code represents a shift in how we think about software development:

**From location-dependent to location-independent**
Development work no longer requires a desk, keyboard, and monitor. Natural language interfaces unlock the same power on mobile devices.

**From tool mastery to intent specification**
Instead of remembering Hugo frontmatter syntax or Git commands, I describe what I want. Claude handles the implementation details.

**From synchronous to asynchronous workflows**
I can start a post in the morning, refine it during lunch, and publish it in the evening—all from my phone, with full context preservation.

## Limitations and Considerations

This workflow isn't perfect:

- **Network dependency**: No internet = no Claude
- **Context limits**: Very long conversations eventually hit token limits
- **Screen size**: Reviewing large code changes is harder on mobile
- **Cost**: Claude usage has per-message costs (though quite reasonable)

But for focused content creation and publishing, these limitations rarely matter.

## Try It Yourself

If you have access to Claude Code in the Claude mobile app, try publishing a blog post:

1. Open Claude on your phone
2. Describe the post you want to create
3. Let Claude explore your blog's structure
4. Review and iterate on the content
5. Commit and push when satisfied

You'll be surprised how natural it feels—and how much friction disappears when you can delegate the mechanics to an AI partner.

## Conclusion

Publishing this blog post from my iPhone—using Claude Code to create the file, format the frontmatter, and push to Git—feels like science fiction. But it's real, it's practical, and it's changing how I create content.

The future of development isn't just AI-assisted coding on big monitors. It's conversational, mobile, and accessible from anywhere. Claude Code on iPhone proves that the command line isn't the only interface to serious development work.

Natural language is the new CLI. And it fits perfectly in your pocket.

---

*This post was created entirely using Claude Code in the Claude mobile app on iPhone, committed to Git, and deployed to peterwarnock.com—without touching a laptop.*
