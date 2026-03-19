---
title: 'Azure Application Gateway'
description:
  'Layer 7 load balancer and reverse proxy with WAF, SSL termination, path-based routing, and multi-site hosting'
date: 2026-03-14T00:00:00-07:00
categories: ['enterprise']
tags: ['azure', 'load-balancer', 'waf', 'networking', 'cloud', 'enterprise', 'reverse-proxy']
external_url: 'https://learn.microsoft.com/en-us/azure/application-gateway/overview'
website: 'learn.microsoft.com'
tool_category: 'Cloud Infrastructure'
radar:
  quadrant: 'Platforms'
  ring: 'Assess'
slug: 'azure-application-gateway-layer-7-load-balancer'
draft: false
---

Azure's Layer 7 (HTTP/HTTPS) load balancer and reverse proxy. Sits in front of your backend pools and handles SSL termination, WAF, path-based routing, and multi-site hosting. Different from Azure Load Balancer, which operates at Layer 4 (TCP/IP).

## What it does

- **Routing**: Path-based (`/api/*` → pool A, `/static/*` → pool B) and multi-site (different domains to different backends)
- **WAF**: Optional web application firewall using OWASP Core Rule Set — covers SQL injection, XSS, command injection, request smuggling
- **SSL termination**: Offloads TLS at the gateway so backends don't handle certs. Can re-encrypt for end-to-end if needed
- **Backend pools**: VMs, scale sets, App Services, or on-prem servers. Round-robin load balancing with session stickiness option
- **Health probes**: Marks unhealthy backends (non-2xx/3xx responses) and stops routing to them
- **Autoscaling**: Scales instances based on traffic load
- **Protocol support**: WebSocket and HTTP/2 natively

## Why it's on the radar

Investigating for work. If you're already in Azure and need application-level routing with WAF, this is the managed option. The path-based and multi-site routing is useful for consolidating multiple apps behind a single IP. SSL termination at the gateway simplifies cert management across backend pools.

## What to figure out

- Cost model — instance hours + data processed adds up differently than something like Cloudflare or an NGINX reverse proxy you run yourself
- How the WAF rule tuning works in practice — OWASP CRS can be noisy with false positives
- Comparison with Azure Front Door for global vs regional traffic patterns
- Whether App Service backends simplify things enough to justify the coupling

## Links

- [How Application Gateway works](https://learn.microsoft.com/en-us/training/modules/intro-to-azure-application-gateway/3-how-azure-application-gateway-works)
- [Application Gateway docs](https://learn.microsoft.com/en-us/azure/application-gateway/overview)
