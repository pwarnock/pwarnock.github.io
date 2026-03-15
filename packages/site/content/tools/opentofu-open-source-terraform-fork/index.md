---
title: 'OpenTofu'
description:
  'Community-driven fork of Terraform under the Linux Foundation — same HCL, same providers, open-source license'
date: 2026-03-14T00:00:00-07:00
categories: ['enterprise']
tags: ['infrastructure-as-code', 'devops', 'cloud', 'open-source']
external_url: 'https://opentofu.org/'
website: 'opentofu.org'
tool_category: 'Cloud Infrastructure'
radar:
  quadrant: 'Tools'
  ring: 'Assess'
slug: 'opentofu-open-source-terraform-fork'
draft: false
---

When HashiCorp switched [Terraform](/tools/terraform-infrastructure-as-code/) from MPL to the Business Source License in August 2023, the community forked it within days. OpenTofu is that fork — now under the Linux Foundation, backed by Gruntwork, Spacelift, env0, and others.

The pitch is straightforward: same HCL, same provider ecosystem, same workflow, but with a genuinely open-source license (MPL 2.0). If you have existing Terraform configs, migration is mostly a search-and-replace of the binary name.

## Where it diverges

OpenTofu isn't just a license-preserving snapshot. They've started adding features Terraform doesn't have — state encryption being the notable one. The question is whether the feature sets will drift far enough apart to make switching painful later.

## Why it's on the radar

For teams where license terms matter (and they should, especially in enterprise), OpenTofu removes the BSL uncertainty. The provider ecosystem is shared, so you're not giving up compatibility. Worth assessing if you're starting new infrastructure projects — the switching cost is low now but will grow as the forks diverge.

## Links

- [opentofu.org](https://opentofu.org/)
- [OpenTofu Registry](https://search.opentofu.org/)
- [Migration guide from Terraform](https://opentofu.org/docs/intro/migration/)
