---
title: 'Aspire by Microsoft'
description:
  'Code-first orchestration for distributed apps — define, run, and deploy multi-service systems from a single C# AppHost'
date: 2026-03-14T00:00:00-07:00
categories: ['enterprise']
tags: ['dotnet', 'azure', 'orchestration', 'distributed-systems', 'cloud', 'enterprise']
external_url: 'https://aspire.dev/'
website: 'aspire.dev'
tool_category: 'Cloud Infrastructure'
radar:
  quadrant: 'Platforms'
  ring: 'Assess'
slug: 'aspire-distributed-app-orchestration'
draft: false
---

Microsoft's orchestration platform for distributed apps, created by [David Fowler](/people/industry/#david-fowler) and the .NET team. Define your entire stack — frontends, APIs, databases, containers — in a single C# AppHost file, then run locally or deploy to Kubernetes, Azure, AWS, or on-prem. Recently rebranded from ".NET Aspire" to just "Aspire", reflecting its multi-language positioning.

## What it does

- **Code-first config**: Model services, dependencies, and deployment in C# instead of scattered YAML/config files
- **Multi-language**: Orchestrates C#, Java, Python, TypeScript, Go — the rebrand from .NET Aspire signals this isn't a .NET-only play
- **Built-in observability**: OpenTelemetry dashboard with logs, traces, and health checks out of the box
- **Local-to-prod parity**: Same app model runs via `aspire run` locally and `aspire deploy` to production
- **100+ integrations**: Pre-built connectors for databases, messaging, cloud services, monitoring

## Why it's on the radar

Interesting approach to the "how do I run 6 services locally" problem. The code-first model is more maintainable than docker-compose for complex setups. Dropping the ".NET" prefix is a deliberate signal — they're positioning this as a polyglot platform, not a .NET ecosystem tool. The OpenTelemetry dashboard being built in rather than bolted on is a good default.

## Open questions

- How deep is the Azure coupling vs genuinely multi-cloud?
- Does the C# AppHost requirement create a barrier for teams that aren't .NET shops?
- How does it compare to Tilt, Skaffold, or docker-compose for local dev orchestration?

## Links

- [aspire.dev](https://aspire.dev/)
