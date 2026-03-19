---
title: 'Bicep'
description:
  'Azure-native infrastructure as code language — declarative DSL that compiles to ARM templates'
date: 2026-03-14T00:00:00-07:00
categories: ['enterprise']
tags: ['infrastructure-as-code', 'azure', 'devops', 'cloud', 'enterprise', 'microsoft']
external_url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview'
website: 'learn.microsoft.com'
tool_category: 'Cloud Infrastructure'
radar:
  quadrant: 'Tools'
  ring: 'Assess'
slug: 'bicep-azure-infrastructure-as-code'
draft: false
---

Microsoft's domain-specific language for deploying Azure resources. Compiles down to ARM templates but with a drastically simpler syntax. Azure-only by design — if you're multi-cloud, use Terraform.

## What it does

- Declarative Azure resource definitions with type safety and IntelliSense
- Compiles to ARM templates — anything ARM can do, Bicep can do with less verbosity
- Modules for reusable infrastructure patterns
- What-if deployments to preview changes before applying
- First-class VS Code extension with validation and autocomplete

## Why it's on the radar

If you're Azure-only, Bicep is the path of least resistance for IaC. No state file to manage (Azure is the source of truth), no provider plugins, no HCL to learn. The trade-off is obvious: you're locked to Azure. For Azure shops, that's fine. For anyone else, Terraform or OpenTofu gives you portability.

## Open questions

- How does the Azure Verified Modules ecosystem compare to Terraform's module registry?
- Migration path from existing ARM templates — is it seamless or painful?

## Links

- [Bicep overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview)
