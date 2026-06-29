---
title: 'WSL Container Lets You Ditch Docker Desktop on Windows'
summary:
  "Microsoft's WSL Container brings a built-in Linux container runtime to WSL, giving Windows-standardized orgs a reason to adopt WSL without the Docker Desktop licensing and overhead."
date: 2026-06-29T12:00:00-07:00
draft: false
content_type: curated
source_url: 'https://devblogs.microsoft.com/commandline/wsl-container-is-now-available-for-public-preview/'
tags: ['WSL', 'Containers', 'Windows', 'DevOps']
author: 'Peter Warnock'
description:
  "Microsoft's WSL Container brings a built-in Linux container runtime to WSL, giving Windows-standardized orgs a reason to adopt WSL without the Docker Desktop licensing and overhead."
---

Running Linux containers on Windows has traditionally meant installing Docker Desktop — a separate licensed product that adds another vendor, another daemon, and another approval cycle for IT.

Microsoft's WSL Container (now in public preview) changes that math. It's a Linux container runtime built directly into WSL, so any org standardized on Windows can now run containers without Docker Desktop at all.

This is the angle that makes WSL adoption easier to justify. The usual objection from IT is "we'd need Docker Desktop too, and that's another license to manage." With WSL Container, that objection goes away. One platform, one vendor, and container workflows come bundled with it.

For teams already evaluating WSL as a dev environment, this is the feature that tips it from "nice to have" to "we should roll this out."

## Sandboxing for Agentic Workflows

There's a second angle that matters more as agent-driven development picks up: sandboxing.

When an agent writes and runs code on your machine, you want it isolated from the host. Containers are the obvious answer, but on Windows that has meant standing up Docker Desktop just to give the agent a sandbox. WSL Container removes that step — agents get an isolated Linux env natively, no extra runtime to install or license.

For any org letting coding agents execute code on developer machines, this is a cleaner sandbox story than "install Docker Desktop on every laptop." It also keeps agent execution inside a Microsoft-supported boundary, which is easier to get past security review than a third-party daemon.

The security model is what makes it defensible for IT. Defender for Endpoint monitors container events directly, and Intune/GPO let admins restrict which registries and distros are allowed. So the sandbox isn't just isolated — it's governed by the same controls already applied to the rest of the Windows fleet.

## Install

```bash
wsl --update --pre-release
```

GA expected fall 2026. VS Code dev containers work too (pre-release, set "Docker Path" to `wslc`).

[Source: Windows Command Line Blog →](https://devblogs.microsoft.com/commandline/wsl-container-is-now-available-for-public-preview/)