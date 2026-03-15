---
title: 'Declarative Infrastructure as Code'
description:
  'Define what your infrastructure should look like, not how to build it — the technique behind Terraform, Bicep, Pulumi, and CloudFormation'
date: 2026-03-14T00:00:00-07:00
categories: ['enterprise']
tags: ['infrastructure-as-code', 'devops', 'cloud', 'techniques']
external_url: 'https://en.wikipedia.org/wiki/Infrastructure_as_code'
website: 'wikipedia.org'
tool_category: 'Cloud Infrastructure'
radar:
  quadrant: 'Techniques'
  ring: 'Adopt'
slug: 'declarative-infrastructure-as-code'
draft: false
---

The idea is simple: describe the end state of your infrastructure in code, and let a tool figure out the steps to get there. You say "I want a load balancer with three backend instances," not "create an instance, then another, then a load balancer, then attach them."

This is the shared pattern underneath [Terraform](/tools/terraform-infrastructure-as-code/), [Bicep](/tools/bicep-azure-infrastructure-as-code/), CloudFormation, and Pulumi. The tools differ in language (HCL, domain-specific, YAML, general-purpose), scope (multi-cloud vs single-cloud), and state management strategy — but the technique is the same.

## Why it matters

Declarative IaC gives you three things that imperative scripts don't:

- **Drift detection** — compare what's defined vs what's deployed, catch manual changes
- **Idempotency** — run the same config twice, get the same result (no duplicate resources)
- **Plan before apply** — preview what will change before touching production

These aren't nice-to-haves. Without them, infrastructure changes are a trust exercise. With them, they're auditable, reviewable, and reversible.

## Why it's Adopt

This is table stakes. Any team managing cloud infrastructure without declarative IaC is accumulating risk — undocumented resources, irreproducible environments, and "it works on my account" problems. The only real decision is which tool fits your stack.

## Links

- [Terraform](/tools/terraform-infrastructure-as-code/) — multi-cloud, HCL-based, largest provider ecosystem
- [OpenTofu](/tools/opentofu-open-source-terraform-fork/) — open-source Terraform fork under the Linux Foundation
- [Bicep](/tools/bicep-azure-infrastructure-as-code/) — Azure-native, compiles to ARM templates
