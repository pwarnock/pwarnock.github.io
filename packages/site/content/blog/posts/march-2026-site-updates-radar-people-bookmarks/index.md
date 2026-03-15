---
title: 'New on the Site: Radar Entries, People Directory, and Bookmarks'
summary:
  'Added new tech radar entries, launched a people directory and curated bookmarks section, and restructured how I track tools and resources.'
date: 2026-03-14T18:00:00-07:00
draft: false
content_type: original
tags: ['Site Updates', 'Tech Radar', 'Bookmarks', 'Tools']
author: 'Peter Warnock'
description:
  'March 2026 site update — new tech radar entries for gh-aw, VitePlus, Void Zero, Azure Application Gateway, Conductor, Terraform, Bicep, and Aspire. Plus a people directory and curated bookmarks section.'
---

Big batch of updates to the site today. I've been collecting links, tools, and people to follow — and rather than let them rot in browser tabs, I'm putting them where they're useful.

## New Radar Entries

Eight new entries on the tech radar, spanning developer tools and enterprise infrastructure.

### Developer Tools

- **{{< tool-link "gh-aw-github-agentic-workflows" "gh-aw" >}}** (Assess) — GitHub's take on running coding agents inside Actions workflows. You write automation in markdown. The security model is the interesting part.
- **{{< tool-link "viteplus-unified-web-toolchain" "VitePlus" >}}** (Assess) — Single CLI replacing your dev server, bundler, linter, formatter, test runner, and package builder. Built on Vite, Rolldown, and Oxc.
- **{{< tool-link "void-zero-javascript-tooling-platform" "Void Zero" >}}** (Assess) — The VC-backed company behind Vite, Vitest, Rolldown, and Oxc. Launched, but tightly coupled to Cloudflare.
- **{{< tool-link "conductor-parallel-coding-agents" "Conductor" >}}** (Assess) — macOS app for running multiple Claude Code agents in parallel across isolated git worktrees. Haven't tried it yet.
- **{{< tool-link "awesome-copilot-instructions-community-repo" "Copilot Custom Instructions" >}}** (Trial) — The technique of shipping `.instructions.md` files in your repo to give Copilot persistent context. Currently trying several of them out.

### Enterprise & Infrastructure

- **{{< tool-link "azure-application-gateway-layer-7-load-balancer" "Azure Application Gateway" >}}** (Assess) — Layer 7 load balancer with WAF, SSL termination, and path-based routing. Investigating for work.
- **{{< tool-link "terraform-infrastructure-as-code" "Terraform" >}}** (Adopt) — Industry standard for multi-cloud infrastructure as code.
- **{{< tool-link "bicep-azure-infrastructure-as-code" "Bicep" >}}** (Assess) — Azure-native IaC that compiles to ARM templates. Simpler syntax, but Azure-only.
- **{{< tool-link "aspire-distributed-app-orchestration" "Aspire" >}}** (Assess) — Code-first orchestration for distributed apps. Define your stack in C#, run locally or deploy anywhere.

## New Section: People Directory

I started a [people directory](/people/) to track engineers, researchers, and thinkers worth following. Not a "top influencers" listicle — just people whose work I reference often enough that I want a place to point to. First batch:

- **Andrej Karpathy** — coined vibe coding, recently shipped autoresearch
- **Evan You** — Vue.js, Vite, Void Zero
- **Eleanor Berger** — AI engineering, agent skills, writes clearly about LLMs
- **Guillermo Rauch** — Vercel, Next.js
- **Gergely Orosz** — The Pragmatic Engineer newsletter
- **David Fowler** — .NET team at Microsoft, created SignalR and Aspire
- **Martin Fowler** — Thoughtworks, Refactoring, Agile Manifesto
- **Chris Richardson** — microservices.io, distributed systems patterns
- **Jarred Sumner** — created Bun, now at Anthropic
- **Mitchell Hashimoto** — co-founded HashiCorp, building Ghostty
- **Simon Willison** — co-created Django, builds LLM tools in the open
- **shadcn** — shadcn/ui, design engineer at Vercel
- **Grady Booch** — co-created UML, IBM Fellow
- **Uncle Bob Martin** — SOLID principles, Clean Code
- **Evan Boyle** — GitHub, agentic coding

## New Section: Bookmarks

I curate links more than anything. Instead of pretending every link deserves a full radar entry, I created a [bookmarks section](/bookmarks/) for topically grouped link collections with short summaries.

Current pages:

- **[GitHub Ecosystem](/bookmarks/github-ecosystem/)** — GitHub Next, awesome-copilot repo, Copilot CLI changelog bot
- **[Web Platform](/bookmarks/web-platform/)** — ChromiumDev and browser platform resources

These are lightweight by design. A link, a paragraph, maybe a social handle. Enough to remember why I saved it.

## What's Next

The people directory will grow as I keep running into folks whose work is worth referencing. And I'll keep adding bookmark pages as topics accumulate — cloud infrastructure, newsletters, and design resources are likely next.
