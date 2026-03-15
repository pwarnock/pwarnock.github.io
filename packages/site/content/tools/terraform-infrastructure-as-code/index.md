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
draft: true
---

HashiCorp's infrastructure as code tool. Write declarative HCL config, run `terraform plan` to preview changes, `terraform apply` to provision. Multi-cloud — works with AWS, Azure, GCP, and hundreds of other providers. Created by [Mitchell Hashimoto](/people/industry/#mitchell-hashimoto).

## What it does

- Declarative infrastructure definitions in HCL
- State management tracks what's deployed vs what's defined
- Plan/apply workflow lets you preview before changing anything
- Provider ecosystem covers virtually every cloud and SaaS service
- Modules for reusable infrastructure patterns

## Why it's on the radar

Industry standard for multi-cloud IaC. If you're not locked into a single cloud's native tooling (like Bicep for Azure), Terraform is the default choice. The provider ecosystem is unmatched. Worth noting the BSL license change in 2023 — led to the OpenTofu fork for those who want a pure open-source option.

## Links

- [terraform.io](https://www.terraform.io/)
- [Terraform Registry](https://registry.terraform.io/)
