---
title: 'Terraform'
description:
  'HashiCorp infrastructure as code tool — declarative config for provisioning and managing cloud resources across providers'
date: 2026-03-14T00:00:00-07:00
categories: ['enterprise']
tags: ['infrastructure-as-code', 'devops', 'cloud', 'hashicorp', 'enterprise']
external_url: 'https://www.terraform.io/'
website: 'terraform.io'
tool_category: 'Cloud Infrastructure'
radar:
  quadrant: 'Tools'
  ring: 'Adopt'
slug: 'terraform-infrastructure-as-code'
draft: false
---

HashiCorp's infrastructure as code tool. Write declarative HCL config, run `terraform plan` to preview changes, `terraform apply` to provision. Multi-cloud — works with AWS, Azure, GCP, and hundreds of other providers. Created by [Mitchell Hashimoto](/people/industry/#mitchell-hashimoto).

## What it does

- Declarative infrastructure definitions in HCL
- State management tracks what's deployed vs what's defined
- Plan/apply workflow lets you preview before changing anything
- Provider ecosystem covers virtually every cloud and SaaS service
- Modules for reusable infrastructure patterns

## Terraform vs Bicep

Both are declarative IaC tools, but they solve different problems. Terraform is cloud-agnostic with a massive provider ecosystem — if you're managing infrastructure across AWS, Azure, and GCP, it's the obvious choice. [Bicep](/tools/bicep-azure-infrastructure-as-code/) is Azure-native, compiles to ARM templates, and has tighter integration with the Azure ecosystem (no state file to manage, first-party resource support on day one).

The real question isn't which is "better" — it's whether you're multi-cloud or Azure-committed. If you're all-in on Azure, Bicep removes an entire class of state management headaches. If you're anywhere else, or multi-cloud, Terraform is the default.

## Why it's on the radar

Industry standard for multi-cloud IaC. [Declarative infrastructure as code](/tools/declarative-infrastructure-as-code/) is a technique that's moved well past "adopt" at this point — it's table stakes for any team that wants reproducible, auditable infrastructure. Terraform is the most mature implementation of that pattern.

Worth noting the BSL license change in 2023 — led to the [OpenTofu](/tools/opentofu-open-source-terraform-fork/) fork for those who want a pure open-source option. The provider ecosystem is still unmatched regardless of which fork you use.

## Links

- [terraform.io](https://www.terraform.io/)
- [Terraform Registry](https://registry.terraform.io/)
