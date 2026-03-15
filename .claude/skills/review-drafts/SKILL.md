---
name: review-drafts
description: Review and approve draft content with browser preview. Lists all drafts across content types (blog, tech-radar, portfolio), shows screenshots via Playwright, and handles approve/feedback loop. Use when the user wants to review drafts, preview unpublished content, or approve posts for publishing.
args:
  - name: type
    description: "Filter by content type: blog, radar, or all (default: all)"
    required: false
  - name: slug
    description: "Review a specific draft by slug"
    required: false
---

# Review Drafts Skill

Review and approve draft content across all content types with live browser previews via Playwright.

## When to Use

Activate when users:
- Want to review draft content before publishing
- Ask to preview blog posts, tech radar entries, or portfolio items
- Say "review drafts", "show me my drafts", "preview drafts"
- Want to approve or reject multiple drafts in a session

## Usage

```
/review-drafts              # Review all drafts
/review-drafts --type radar # Review only tech radar drafts
/review-drafts --slug terraform-infrastructure-as-code  # Review a specific draft
```

## Process

### Phase 1: Discovery

Find all drafts by searching for `draft: true` in frontmatter.

**Search locations:**
- `packages/site/content/blog/posts/*/index.md` → type: blog
- `packages/site/content/tools/*/index.md` → type: radar
- `packages/site/content/portfolio/*/index.md` → type: portfolio

**How to search:**
```bash
grep -rl "draft: true" packages/site/content/blog/posts/*/index.md packages/site/content/tools/*/index.md packages/site/content/portfolio/*/index.md 2>/dev/null
```

For each draft found, read the frontmatter to extract `title`, `date`, and content type (inferred from path).

**Present results as a numbered table:**

| # | Title | Type | Date |
|---|-------|------|------|
| 1 | Example Post | blog | 2026-03-10 |
| 2 | Terraform | radar | 2026-03-12 |

**Filtering:**
- If `type` arg is provided, only show matching drafts
- If `slug` arg is provided, skip the list and jump directly to that draft's review

Ask the user which draft(s) they want to review, or if they want to go through all of them sequentially.

### Phase 2: Start Hugo Dev Server

Before showing previews, ensure Hugo is running with draft rendering enabled.

**Check if already running:**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:1313 2>/dev/null
```

**If not running, start it:**
```bash
cd packages/site && hugo server --environment development --port 1313 --buildDrafts &
```

**Wait for server ready** (poll up to 10 seconds):
```bash
for i in $(seq 1 10); do curl -s -o /dev/null http://localhost:1313 && break || sleep 1; done
```

**IMPORTANT:** Remember the Hugo server PID so it can be stopped in Phase 4.

### Phase 3: Review Loop

For each draft the user wants to review:

#### Step 1: Show Content Summary

Read the markdown file and present:
- **Title** and **date**
- **Summary/description** (from frontmatter `summary` or `description` field)
- **Ring/quadrant** (for radar entries)
- **Content type** (blog, radar, portfolio)
- Brief excerpt of the body content (first ~200 chars)

#### Step 2: Browser Preview

Use Playwright MCP tools to capture a screenshot:

1. **Navigate** to the draft URL using `browser_navigate`:
   - Blog: `http://localhost:1313/blog/posts/<slug>/`
   - Radar: `http://localhost:1313/tools/<slug>/`
   - Portfolio: `http://localhost:1313/portfolio/<slug>/`

2. **Wait** for the page to load: `browser_wait_for` with selector `article` or `main` (whichever exists), timeout 5000ms

3. **Screenshot** the page: `browser_take_screenshot`

4. Present the screenshot to the user inline.

#### Step 3: User Decision

Ask the user (via AskUserQuestion) what they want to do:

- **approve** → Flip `draft: true` to `draft: false` in the frontmatter using the Edit tool. Confirm the change.
- **feedback** → User provides notes on what to change. Apply edits to the markdown file, then re-screenshot and show updated preview. Loop back to the decision prompt.
- **open** → Use `browser_snapshot` to show the current DOM accessibility tree so the user can interact with the page via Playwright commands (`browser_click`, `browser_scroll`, etc.). When done exploring, return to the decision prompt.
- **skip** → Move to the next draft without changes.
- **stop** → End the review session immediately, proceed to Phase 4.

**Track results:** Keep a running count of approved, skipped, and feedback items.

### Phase 4: Cleanup

1. **Stop Hugo dev server:**
   ```bash
   kill <hugo_pid>
   ```
   If PID was lost, find and kill it:
   ```bash
   pkill -f "hugo server.*--buildDrafts" 2>/dev/null
   ```

2. **Show summary:**
   ```
   Review complete:
   - Approved: X
   - Skipped: Y
   - Feedback applied: Z
   ```

3. **If any drafts were approved**, suggest committing:
   ```bash
   git add packages/site/content/
   git commit -m "Publish: <list of approved titles>"
   git push
   ```

## URL Patterns

| Content Type | URL Pattern |
|-------------|-------------|
| Blog | `http://localhost:1313/blog/posts/<slug>/` |
| Tech Radar | `http://localhost:1313/tools/<slug>/` |
| Portfolio | `http://localhost:1313/portfolio/<slug>/` |

## Slug Extraction

The slug is the directory name containing `index.md`. For example:
- `packages/site/content/tools/terraform-infrastructure-as-code/index.md` → slug: `terraform-infrastructure-as-code`
- `packages/site/content/blog/posts/claude-march-2026-double-usage-promotion/index.md` → slug: `claude-march-2026-double-usage-promotion`

## Edge Cases

- **Hugo already running without `--buildDrafts`**: Stop the existing server and restart with `--buildDrafts`
- **Draft has no summary/description**: Show first paragraph of body instead
- **Screenshot fails**: Fall back to showing the rendered HTML via `browser_snapshot` (accessibility tree)
- **Multiple frontmatter formats**: Tech radar entries may use `radar.ring` (nested) or `ring` (flat) — handle both

## Related Skills

- `/approve-blog` — Quick approval without preview (blog only)
- `/create-blog` — Create a new blog post draft
- `/create-tech-radar` — Create a new tech radar entry
- `/create-portfolio` — Create a new portfolio entry
