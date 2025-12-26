# Discovery

This document captures the raw, unfiltered idea or initial AI prompt that
sparked the project.

## Starting Prompt

"I want a specialized planning agent for each of my content types. I would like to provide URLs and notes and have it generate the content type and supporting assets and have an interactive review workflow."

## Questions

**AGENT Q1:** Who are the target users for this content agent system? Is this primarily for your own use, or do you envision other content creators using it as well?

**USER A1:** Primarily me. In the future it could be open-source or other agents.

**AGENT Q2:** What specific pain points in your current content creation workflow are you trying to solve? For example, is it the time it takes to format content properly, ensuring all required frontmatter fields are present, generating appropriate assets/images, maintaining consistency across content types, or something else?

**USER A2:** Writers' block, making sure all requirements are met, context switching, generating assets/images, maintaining consistency (not robotic or ai slop).

**AGENT Q3:** When you say "providing URLs and notes" - can you walk me through a specific example of how you envision using one of these agents? For instance, if you wanted to create a blog post about a new technology you learned, what would that workflow look like from start to finish?

**USER A3:** I would provide enough context for the agent to expand in my voice; we might go through an interactive process like this to get additional context and parameters. It would be like I'm talking to a web producer or junior creator.

**AGENT Q4:** How would you expect the agent to learn and maintain your "voice"? Would you provide examples of your existing content for it to study? Have a style guide document it references? Expect it to learn from your previous interactions over time? Something else? And what does "success" look like for maintaining consistency - how would you know the agent has captured your voice correctly?

**USER A4:** Learning, documenting, open to suggestion (but I don't want to provide examples). Success is that people and agents look at it and it doesn't feel scattered or fake (slop). It has captured my voice when an analysis can distinguish content types and that it sufficiently unique from top results.

**AGENT Q5:** Let's talk about the interactive review workflow you mentioned. After the agent generates a draft, what would that review process look like? For example, would you want inline comments/suggestions you can accept or reject? A side-by-side comparison with the original input? The ability to iterate on specific sections? Automated checks (frontmatter validation, asset requirements, etc.)? What would make you feel confident that the content is ready to publish?

**USER A5:** All of the above except side-by-side. Mostly I want to sign-off rather than blindly publish. In most cases, I don't want the agent to overachieve. Concise and SEO/AEO friendly and targeting my audience which isn't fully clear who that is and each content type might have a different audience.

**AGENT Q6:** You mentioned generating assets/images. What types of assets would each content type need? For example, blog posts: featured images? Diagrams? Screenshots? Social media cards? Portfolio projects: project thumbnails? Demo GIFs? Architecture diagrams? Tech radar: visual radar charts? Category icons? And what's your preference for image generation - should the agent create them, or would you prefer it to provide detailed prompts/descriptions that you can use with image generation tools?

**USER A6:** I don't have local image gen yet, so start with prompt, but eventually A2A (agent-to-agent).

**AGENT Q7:** Let's talk about the technical integration. How should these agents fit into your current Hugo workflow? Would you want a CLI tool you run from the command line (like `bun run agent:blog`)? An interactive web interface? Integration with your existing scripts/validation pipeline? Something that runs within Claude Code/Cursor as we're doing now? And where should the generated content go - directly into your `content/` directory as drafts, or somewhere else for review first?

**USER A7:** Either a skill/agent or CLI agent? No web interface. I want hugo content bundles.

**AGENT Q8:** For each content type agent, what are the "must have" features for version 1, vs what can wait? For example, is it essential that: the agent learns your voice immediately, or can that develop over time? Asset/image prompts are generated in v1, or can that come later? Full interactive review workflow, or basic draft generation to start? All 4 tech radar sub-types from day one, or start with blog/portfolio first? What would make this useful enough that you'd actually use it regularly, vs a minimum viable prototype?

**USER A8:** Agent adopts and begins documenting/refining style, every post should get an image, draft gen is ok to start, I have a backlog of tech radar content, so all of the above.

**AGENT Q9:** You mentioned each content type might have a different audience. Can you tell me what you imagine those audiences are for: Blog posts: Who are you writing for? Portfolio projects: Who's viewing these? Tech radar: What's the audience for your technology assessments? This will help the agent tailor the tone and approach for each content type.

**USER A9:** Blog posts are primarily my thoughts, portfolio is primarily for hiring and peer review, tech radar, is broad but opinionated. Audience is a mix of hiring (recruiters and decision makers e.g. contract) and peers are anyone that I've networked with or found me in search (could be technical senior level or aspiring (but not targeted at junior) and adjacent roles like product.

**AGENT Q10:** A few final questions to round out my understanding: 1. Constraints: Are there any technical constraints I should know about? (e.g., must use your existing validation scripts, file naming conventions, content structure requirements). 2. Existing alternatives: What are you doing today to create content? Is it just writing directly in Markdown, or do you use any tools/templates? 3. Risks: What's your biggest concern about this system? Producing low-quality content? The agent not capturing your voice? Breaking your existing workflow? Something else?

**USER A10:** 1. Stay within guardrails. If unfairly blocked, we can discuss improvements. 2. Manual with a lot of context switching, am using coding agents to generate markdown and web UI for image gen. 3. Low-quality content that's obviously generated and or damaging.

## Discovery Summary

You want to build a **multi-agent content creation system** integrated into your Hugo workflow that acts like a collaborative web producer or junior creator.

### The Problem
Current workflow involves:
- Writer's block
- Manual content creation with lots of context switching
- Using coding agents for markdown + web UI for image gen
- Risk of generating low-quality or obviously AI-generated content
- Ensuring all requirements are met across different content types

### The Solution
**Three specialized agents** that:
1. **Learn your voice** through interaction and document/refine your style over time
2. **Generate Hugo content bundles** with proper frontmatter and structure
3. **Create image prompts** for every post (eventually A2A image generation)
4. **Provide interactive review** with inline comments, iteration, and automated validation checks
5. **Require sign-off** before publishing (no blind deployment)
6. **Stay within guardrails** of your existing validation scripts and conventions

### Content Types & Audiences
| Agent | Audience | Tone/Approach |
|-------|----------|---------------|
| **Blog Post** | General | Your thoughts, personal voice |
| **Portfolio Project** | Recruiters, peers | Professional, showcase work |
| **Tech Radar** (4 sub-types) | Senior technical, decision-makers, adjacent product roles | Opinionated but broad |

### Success Criteria
- Content doesn't feel like "AI slop" - authentic and unique from top results
- Each content type is distinguishable by tone and approach
- Agent captures your voice through iterative learning
- Concise, SEO/AEO friendly output
- You actually use it regularly (reduces context switching)

### Technical Requirements
- **Implementation**: Skill/agent or CLI (no web interface)
- **Output**: Hugo content bundles with proper structure
- **Validation**: Stay within existing guardrails (scripts, naming conventions)
- **Scope v1**: All agents + image prompts + draft generation + style documentation
