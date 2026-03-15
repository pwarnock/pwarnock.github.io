---
title: 'VitePlus'
description:
  'Unified CLI toolchain — build, lint, format, test, and package from one tool built on Vite, Vitest, Rolldown, and Oxc'
date: 2026-03-14T00:00:00-07:00
categories: ['developer-centric']
tags: ['developer-tools', 'build-tools', 'vite', 'rust', 'toolchain', 'monorepo']
external_url: 'https://viteplus.dev/'
website: 'viteplus.dev'
tool_category: 'Build Tools'
radar:
  quadrant: 'Tools'
  ring: 'Assess'
slug: 'viteplus-unified-web-toolchain'
draft: false
---

Single CLI that replaces your dev server, bundler, linter, formatter, test runner, and package builder. Built on Vite, Vitest, Rolldown, and Oxc — the Rust-based tooling layer that's been gaining traction across the ecosystem.

## What it does

- Dev server and production builds (Vite + Rolldown)
- Lint, format, and type-check in one pass (Oxlint + Oxfmt)
- Test runner with Jest-compatible API, browser mode, and coverage
- Library packaging with auto-generated TypeScript definitions
- Task runner with caching and monorepo-aware dependency resolution
- Auto-detects Node version and package manager per project

## Why it's on the radar

The "one tool to rule them all" pitch isn't new, but the foundation is interesting — Rolldown and Oxc are already proving themselves independently. If VitePlus gets the integration right, it could eliminate a lot of config-file overhead. The monorepo task runner with caching is the part worth paying attention to.

## Open questions

- How stable is Rolldown under this wrapper vs using it directly?
- Does the opinionated lint/format config play well with existing setups, or is it all-or-nothing?
- Monorepo story compared to [Turborepo](/tools/turborepo-monorepo-build-system/) or Nx?

## Links

- [viteplus.dev](https://viteplus.dev/)
