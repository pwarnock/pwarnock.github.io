---
title: 'Demoing Gastown with Cody Article Writer Skill'
summary: 'An experiential post about using Gastown multi-agent workspace to demo the Cody Article Writer AI skill, including the BD integration lessons learned along the way.'
date: 2026-01-05T17:00:00Z
draft: false
tags: ['Gastown', 'Cody Article Writer', 'AI Agents', 'Multi-Agent Systems', 'Beads']
author: 'Peter Warnock'
image: featured.png
imageAlt: 'Gastown multi-agent workspace orchestrating the Cody Article Writer skill workflow'
---

I spent some time today demoing two AI-powered tools working together: [Gastown](https://github.com/steveyegge/gastown), a multi-agent workspace manager, and [Cody Article Writer](https://github.com/ibuildwith-ai/cody-article-writer), an AI agent skill for structured article writing. The experience surfaced some interesting insights about multi-agent system integration that I want to document.

This demo ran on **OpenCode** (an interactive CLI tool) using **MiniMax M2.1** as the underlying model, not the default Claude. This setup demonstrates how OpenCode can orchestrate agent skills within a multi-agent workspace context while using alternative models.

{{< figure src="featured.png" alt="Diagram showing the Gastown multi-agent workspace orchestrating the Cody Article Writer skill" caption="Gastown convoys track work while the Cody Article Writer skill produces structured articles" width="100%" >}}

## What I Was Trying to Do

The goal was straightforward: use Gastown to orchestrate a demo of the Cody Article Writer skill. Specifically:

1. Create a Gastown convoy to track the demo work
2. Use an agent to run the Cody Article Writer workflow
3. Write an article about "The Future of AI-Powered Development"
4. Track everything through Gastown's git-backed issue tracker (Beads)
5. Publish the resulting article to my blog

The demo worked - I ended up with a 4,200-word article about AI development tools. But getting there taught me more than the article itself.

## Setting Up the Environment

Gastown organizes work into "rigs" - each rig is typically a git repository. My blog is one such rig, located at `~/gt/my-blog-rig/`. The rig has a worktree at `refinery/rig/` which contains the actual blog source.

Installing the Cody Article Writer skill was simple. I extracted it into the agent's skills directory:

```bash
unzip cody-article-writer.skill -d .claude/skills/
```

This made the skill available to any Claude Code instance running in that context. The skill follows the Agent Skills specification and provides a structured workflow: topic ideation → style selection → title/thesis → outline → writing → editorial pass → metadata → export.

## The Workflow

Gastown uses "convoys" to track work across multiple issues. I created one for this demo:

```bash
gt convoy create "Cody Article Writer Demo" demo-001
gt sling demo-001 my-blog-rig
```

The `sling` command was supposed to spawn a "polecat" - an ephemeral worker agent that would pick up the work. This is where things got interesting.

## The Integration Issue

The polecat spawned but failed to attach properly. Looking at the logs, I saw errors like:

```
bd slot set pw-my-blog-rig-polecat-polecat-1 role hq-polecat-role:
  Error: failed to resolve bead hq-polecat-role: no issue found
```

The naming mismatch was the problem. Gastown uses different prefixes for different contexts:

- **Town-wide beads** (`hq-*` prefix): convoys, deacon, mayor, witness
- **Rig-specific beads** (`pw-*` prefix): project issues for my-blog-rig

The polecat was named with the rig prefix (`pw-my-blog-rig-polecat-polecat-1`) but trying to access town-wide beads (`hq-polecat-role`, `hq-demo-001`). These beads didn't exist in the expected locations.

Additionally, the BD database had a legacy format issue:

```
LEGACY DATABASE DETECTED!
This database was created before version 0.17.5 and lacks a repository fingerprint.
```

## The Fix

I resolved this in two steps:

**First**, migrate the database to the current format:

```bash
bd migrate --update-repo-id
```

This bound the database to the repository and resolved the version mismatch.

**Second**, create the proper beads with the correct prefixes:

```bash
bd new "Write demo article using cody-article-writer skill" --id hq-demo-001
gt convoy add hq-cv-lg5jg hq-demo-001
```

Once the beads existed with the right names, the convoy tracking worked correctly. When I closed `hq-demo-001`, the convoy auto-closed, showing 1/1 completed.

## What Cody Article Writer Produced

Despite the integration hiccups, the skill itself worked beautifully. I gave it a topic ("The Future of AI-Powered Development") and a style guide ("Tech Professional" - tone 7/10, technical 8/10). The skill guided me through:

1. **Topic refinement** - Clarifying the thesis
2. **Style selection** - Choosing a professional voice
3. **Title and thesis** - "AI-assisted development is not replacing developers but amplifying their capabilities"
4. **Outline generation** - Five sections covering current state, capabilities, human-AI partnership, team implications, and future preparation
5. **Article writing** - Full draft with sections, examples, and formatting
6. **Editorial pass** - Optional polish (I skipped this for the demo)
7. **Metadata** - Title, description, keywords for frontmatter
8. **Export** - Markdown file with YAML frontmatter

The output went to `cody-projects/article-writer/articles/the-future-of-ai-powered-development.md`, and has since been published to the blog:

**[The Future of AI-Powered Development](/blog/posts/the-future-of-ai-powered-development/)**

## Key Takeaways

1. **Multi-agent systems need consistent naming conventions**. When work spans town-wide and rig-specific contexts, bead prefixes must align.

2. **Legacy database migrations matter**. The BD database had been created before version 0.17.5. Running migrations proactively prevents integration issues.

3. **Convoys provide good visibility**. Even when the polecat failed, the convoy system tracked the work and I could see what was supposed to happen.

4. **Agent skills integrate cleanly when configured correctly**. Cody Article Writer is designed to be dropped into any Claude Code environment. Once the path was set up (`cody-projects/article-writer/`), it just worked.

5. **State persistence is valuable**. The skill saved drafts, styles, and exports. If I'd been interrupted, I could resume with "continue my article".

## The Meta-Lesson

What's interesting is that this post itself is meta - I'm writing about the experience of writing an article. The gastown + cody integration creates a recursive loop: agents using tools that help agents.

The real value isn't any single article. It's the pattern:

- Gastown provides orchestration and state tracking
- Agent skills provide specialized capabilities
- Beads provides git-backed persistence
- The combination creates a workspace where AI agents can collaborate on complex, multi-step tasks

I'm planning to use this setup for future writing projects. The structure forces me to think through topics before diving in, and the git-backed state means I can work across sessions without losing context.

---

## Related Tools

- [Gastown](/tools/gastown/) - Multi-agent orchestrator for Claude Code
- [Cody Article Writer](/tools/cody-article-writer/) - AI-assisted article writing skill

---

_Tags: Gastown, Cody Article Writer, AI Agents, Multi-Agent Systems, Beads_
