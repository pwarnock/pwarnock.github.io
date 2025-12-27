# Troubleshooting Guide

Common issues and solutions for the content agents.

## CLI Issues

### Command not found
```
error: script "agent:blog" not found
```
**Solution:** Run `bun install` to ensure dependencies are installed.

### Missing required arguments
```
Error: Missing required field: title
```
**Solution:** Provide all required fields or use `--interactive` mode.

### Invalid content type
```
Error: Invalid content type. Must be one of: original, curated, embed, project
```
**Solution:** Use a valid content type value.

## Validation Errors

### Blog: No H1 headings allowed
```
Error: H1 heading found in content body
```
**Solution:** Remove any `# Title` from the markdown content. The title comes from frontmatter.

### Blog: Summary too short/long
```
Warning: Summary should be 150-200 characters
```
**Solution:** Adjust summary length for optimal SEO display in search results.

### Portfolio: Invalid date format
```
Error: completion_date must be YYYY-MM format
```
**Solution:** Use `2024-12` format, not `2024-12-26` or `December 2024`.

### Portfolio: Technologies not an array
```
Error: technologies must be an array
```
**Solution:** In CLI, use comma-separated: `--technologies "React,Node,TypeScript"`

### Portfolio: demo_url deprecated
```
Warning: demo_url is deprecated, use live_url instead
```
**Solution:** Replace `demo_url` with `live_url` in frontmatter.

### Tech Radar: Invalid ring
```
Error: ring must be one of: adopt, trial, assess, hold
```
**Solution:** Use a valid ring value.

### Tech Radar: Invalid quadrant
```
Error: quadrant must be one of: techniques, tools, platforms, languages-and-frameworks
```
**Solution:** Use a valid quadrant value.

## Generation Issues

### Content too generic
**Problem:** Generated content lacks personality or specific details.

**Solution:**
1. Provide more context in your request
2. Use the voice learning system to record feedback
3. Add specific examples or key points

### Style doesn't match my voice
**Problem:** Content doesn't sound like me.

**Solution:**
1. Record positive feedback for content you like:
   ```typescript
   await agent.recordFeedback("I love the personal anecdotes", "positive");
   ```
2. Record negative feedback for issues:
   ```typescript
   await agent.recordFeedback("Too formal, use more casual language", "negative");
   ```
3. Style docs are stored in `.cody/project/library/style-docs/`

### Content too long/short
**Problem:** Generated content is not the right length.

**Solution:** Specify key points to control scope:
```bash
bun run agent:blog \
  --title "Quick Tip" \
  --type original \
  --summary "A brief tip about X" \
  --key-points "One main point only"
```

## File System Issues

### Permission denied
```
Error: EACCES: permission denied
```
**Solution:** Check write permissions for `content/` directory.

### Directory not found
```
Error: ENOENT: no such file or directory
```
**Solution:** Ensure the content directories exist:
```bash
mkdir -p content/blog/posts content/portfolio content/tools
```

### File already exists
```
Warning: File already exists at path
```
**Solution:** The agent won't overwrite existing files. Choose a different title or delete the existing file.

## Review Workflow Issues

### Session not found
```
Error: Review session not found
```
**Solution:** Sessions are stored in `.cody/project/library/sessions/`. Check if the directory exists.

### Cannot approve draft
**Problem:** Trying to approve content that hasn't been reviewed.

**Solution:** Complete the review workflow:
1. Generate content (creates draft)
2. Review and provide feedback
3. Apply revisions
4. Explicitly approve

## Voice Learning Issues

### Style not being applied
**Problem:** Recorded feedback isn't affecting new content.

**Solution:**
1. Check style docs exist in `.cody/project/library/style-docs/`
2. Ensure feedback is being recorded with correct content type
3. Try recording more specific feedback

### Reset style documentation
**Problem:** Want to start fresh with voice learning.

**Solution:** Delete the style doc file:
```bash
rm .cody/project/library/style-docs/blog-style.json
```

## Getting Help

1. Check the agent-specific guides:
   - [Blog Agent](./BLOG_AGENT.md)
   - [Portfolio Agent](./PORTFOLIO_AGENT.md)
   - [Tech Radar Agent](./TECH_RADAR_AGENT.md)

2. Run with `--help`:
   ```bash
   bun run agent:help
   ```

3. Check validation scripts directly:
   ```bash
   ./scripts/validate-blog-post.sh content/blog/posts/my-post/
   node scripts/validate-portfolio-frontmatter.js
   ```
