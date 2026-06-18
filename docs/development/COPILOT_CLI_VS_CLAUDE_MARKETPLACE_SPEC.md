---
title: "GitHub Copilot CLI vs Claude Marketplace: Specification Divergence"
description: "Understanding the gap between GitHub Copilot CLI marketplace specifications and Claude marketplace plugin specifications, with practical implications for cross-platform plugin developers."
date: 2026-06-18
tags: [copilot, claude, marketplace, plugins, specifications, compatibility]
---

# GitHub Copilot CLI vs Claude Marketplace: Specification Divergence

## Overview

The GitHub Copilot CLI and Claude (Anthropic) marketplaces are two competing platforms for extending AI assistant capabilities with custom plugins, skills, and tools. While both serve similar purposes, they diverge significantly in **specification design, validation strictness, distribution model, and feature sets**. This document outlines those divergences and their practical impact on developers targeting both platforms.

### Key Finding

**YAML Syntax Validity ≠ Specification Compliance.** A plugin manifest can parse cleanly as valid YAML while still violating platform-specific semantic validators. This gap creates silent failures where local development tests pass but consumer deployments fail with cryptic error messages.

---

## 1. Architecture & Distribution Model

### GitHub Copilot CLI Marketplace

**Centralized Registry Model:**
- Single source of truth: `marketplace.json` file (committed to repository)
- Plugin discovery: Repository-based; marketplace registry points to local paths or external GitHub repos
- Installation: Via Copilot CLI commands: `copilot plugin install plugin-name@marketplace`
- Version resolution: Git tags, releases, or commit hashes referenced in `marketplace.json`
- Update mechanism: Git pulls; consumer must pull changes to marketplace registry

**Example Flow:**
```
User runs: copilot plugin install progressive-disclosure@my-marketplace
  ↓
CLI reads: .github/plugin/marketplace.json
  ↓
Finds entry: { name: "progressive-disclosure", version: "1.0.4", source: { repo: "owner/repo", path: "plugins/progressive-disclosure" } }
  ↓
Clones/updates: owner/repo at the specified ref
  ↓
Validates: plugin.json and YAML structure against Copilot validators
  ↓
Installs to: ~/.copilot/plugins/ (or equivalent)
```

### Claude Marketplace

**Package Registry Model:**
- Multiple sources: Anthropic's official registry + third-party package registries (npm, PyPI, etc.)
- Plugin discovery: Package registry search + metadata from published packages
- Installation: Via package manager or Anthropic's Claude API configuration
- Version resolution: Semantic versioning via package registry (npm, PyPI, etc.)
- Update mechanism: Package manager updates; automatic or explicit depending on configuration

**Example Flow:**
```
Developer publishes: TypeScript tool via npm
  ↓
Publishes: package.json with tool metadata and schema
  ↓
Claude registry indexes: Package via OpenAPI schema and manifest
  ↓
User installs: Claude API client configures tool by package reference
  ↓
Claude loads: Tool definition and OpenAPI schema at runtime
  ↓
Invokes: Tool via standardized callable interface
```

---

## 2. Manifest Specification

### GitHub Copilot CLI: `plugin.json` and `.mcp.json`

**Primary Manifest: `plugin.json`**

```json
{
  "id": "my-skill",
  "name": "My Skill",
  "publisher": "Peter Warnock",
  "version": "1.0.4",
  "description": "A brief description of what this skill does, under 1024 characters total.",
  "required": true,
  "icons": {
    "light": "./icons/light.png",
    "dark": "./icons/dark.png"
  },
  "tools": [
    {
      "id": "tool-name",
      "name": "Tool Display Name",
      "description": "What this tool does",
      "inputSchema": {
        "type": "object",
        "properties": {
          "param1": { "type": "string" }
        }
      }
    }
  ],
  "agents": [
    {
      "id": "agent-name",
      "name": "Agent Name",
      "description": "What this agent does"
    }
  ]
}
```

**Key Constraints (Semantic Validators):**
- `description` must be < 1024 characters (strict byte-length check)
- `name` must be < 256 characters
- `id` must match kebab-case pattern and be unique within plugin scope
- Tool `inputSchema` must be valid JSON Schema (but Copilot may have custom validation)
- No circular dependencies or unsupported schema keywords

**Secondary Manifest: `.mcp.json` (optional)**

Used for advanced integrations with Model Context Protocol servers:

```json
{
  "version": "1.0",
  "clients": {
    "claude": {
      "enabled": true
    }
  },
  "mcpServers": {
    "example-server": {
      "command": "npx",
      "args": ["example-server"],
      "env": {}
    }
  }
}
```

---

### Claude Marketplace: OpenAPI Schema + Tool Definition

**Primary Definition: OpenAPI 3.0 / 3.1 Schema**

```yaml
openapi: '3.0.0'
info:
  title: My Tool
  version: '1.0.0'
  description: 'Complete description of what this tool does.'
  x-custom-vendor-field: 'vendor-specific extensions'
paths:
  /search:
    post:
      operationId: search
      summary: 'Search for information'
      description: 'Detailed description of search behavior'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: 'The search query'
      responses:
        '200':
          description: 'Search results'
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      type: object
```

**Key Design:**
- **Standard-based:** Full compliance with OpenAPI 3.0/3.1 spec (not proprietary)
- **Vendor Extensions:** Allows `x-*` fields for tool-specific metadata without breaking spec compliance
- **Versioning:** Semantic versioning; no restrictions on description length
- **Code Generation:** Tools can be auto-generated from OpenAPI schema in multiple languages

---

## 3. Validation & Constraint Divergence

### Copilot CLI Validators (Semantic Checks)

Copilot performs runtime validation that **goes beyond YAML syntax**:

| Constraint | Copilot CLI | Claude Marketplace |
|-----------|-------------|-------------------|
| **Description length** | < 1024 bytes (strict) | No fixed limit; discouraged > 1000 chars for UX |
| **Name length** | < 256 bytes | No strict limit (OpenAPI allows any length) |
| **ID format** | Kebab-case, unique per plugin | N/A (uses operation ID from OpenAPI) |
| **Schema validation** | JSON Schema + Copilot extensions | Full OpenAPI 3.0/3.1 compliance |
| **Circular dependencies** | Rejected at validation | Allowed (resolved at runtime) |
| **Special characters in descriptions** | Specific escaping rules | Standard JSON escaping |
| **Deprecation handling** | Field-level flags | OpenAPI `deprecated: true` |

### Practical Impact: The "Clean YAML, Failed Validation" Problem

**Example:** The `progressive-disclosure` skill had this issue:

```json
{
  "description": "A very long description that mentions features A, B, C, D, and E... Lorem ipsum dolor sit amet... consectetur adipiscing elit..."
}
```

**Result:**
- ✅ YAML parses without error (`yaml.parse()` succeeds)
- ✅ JSON schema is structurally valid
- ❌ **Copilot validator rejects it:** `description must be < 1024 characters`

This divergence means:
- Local linting tools (`yamllint`, `prettier`) may not catch the error
- Consumer environments fail silently without clear error messaging
- Developers must test against the actual Copilot validator, not just syntax checkers

---

## 4. Plugin Definition & Capabilities

### Copilot CLI Plugin Types

**1. Skills**
- Reusable, composable units of functionality
- Exposed as callable functions to agents
- Format: Markdown-based `.md` files with YAML front matter (or JSON in `plugin.json`)
- Lifecycle: Skills are discovered and loaded by agents at runtime

**2. Agents**
- Autonomous entities with specific personas and capabilities
- Can use skills, tools, and call other services
- Scoped to specific domains (e.g., "code reviewer", "devops troubleshooter")
- Format: Defined in `plugin.json` with agent metadata

**3. Tools**
- Direct command/function invocations exposed to agents
- Similar to skills but with stricter interface definition
- Format: JSON Schema input/output definitions in `plugin.json`

### Claude Marketplace Tool Types

**1. Tools (Primary)**
- Functions/services exposed via OpenAPI schema
- Automatically callable by Claude based on context
- Can be chained in sequences
- Format: OpenAPI 3.0/3.1 YAML or JSON

**2. Resources (Emerging)**
- Long-form content management
- File attachment and retrieval
- Format: MCP (Model Context Protocol) spec

**3. Models (Future)**
- Custom model deployments
- Not yet widely supported in public marketplace

---

## 5. Version Resolution & Dependency Management

### Copilot CLI: Git-Native

```json
// marketplace.json
{
  "plugins": [
    {
      "name": "progressive-disclosure",
      "version": "1.0.4",
      "source": {
        "repo": "pwarnock/pwarnock-cc-plugins",
        "path": "skills/progressive-disclosure",
        "ref": "v1.0.4"  // Git tag/branch/commit
      }
    }
  ]
}
```

**How it resolves:**
1. CLI clones/updates `pwarnock/pwarnock-cc-plugins`
2. Checks out the specified `ref` (tag `v1.0.4`, branch, or commit SHA)
3. Reads `skills/progressive-disclosure/plugin.json` at that ref
4. Validates against Copilot's semantic validators
5. Installs to local plugin cache

**Issue:** If the git tag/release doesn't exist or version isn't tagged, the marketplace catalog won't see the update even if the commit is pushed.

### Claude Marketplace: Package Registry

```json
// package.json (npm example)
{
  "name": "@pwarnock/my-tool",
  "version": "1.0.4",
  "description": "My tool",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

**How it resolves:**
1. Developer publishes to npm (or PyPI, etc.)
2. Package registry indexes the published version
3. Claude's API queries package registry for latest metadata
4. Consumer imports via package reference: `@pwarnock/my-tool@1.0.4`
5. Package manager resolves and downloads

**Advantage:** Version resolution is automatic and decoupled from git history; no manual tagging required.

---

## 6. Practical Implications for Cross-Platform Developers

### Problem 1: Validation Divergence Creates Silent Failures

**Scenario:** You develop a plugin that:
- Passes local validation (`yaml -c`, `json.parse()`)
- Works in your test environment
- Publishes successfully to GitHub
- **Fails when consumers install** without clear error

**Why:** Copilot's validator checks semantic constraints that generic tools don't know about.

**Solution:**
1. Always test against Copilot CLI's actual validator, not just syntax checkers
2. Document all semantic constraints in your plugin README
3. Provide a pre-commit hook that runs Copilot's validator before pushing
4. Monitor error logs from consumer installations

### Problem 2: Version Resolution Mismatch

**Scenario:** You bump `plugin.json` version to `1.0.4` and commit to `main`, but:
- Forgot to create a git tag `v1.0.4`
- Pushed to GitHub
- Consumer's marketplace marketplace catalog doesn't reflect the new version

**Why:** Copilot's marketplace references git tags; Claude's uses package registries.

**Solution:**
1. **Copilot CI/CD:** Use release automation (e.g., semantic-release) to auto-tag on version bumps
2. **Claude:** Use npm/PyPI versioning and publish to registry on release
3. **Cross-platform:** Maintain both tag + package registry sync

### Problem 3: YAML Parsing vs Semantic Validation

**What You Think Happens:**
```bash
$ yaml plugin.json    # ✅ Parses fine
$ copilot plugin validate  # ✅ Should also pass, right?
```

**What Actually Happens:**
```bash
$ yaml plugin.json    # ✅ OK
$ copilot plugin validate  # ❌ FAILED: description must be < 1024 chars
```

**Why:** YAML syntax != semantic constraints.

**Solution:**
1. Implement validation in your CI/CD pipeline that runs Copilot's actual validator
2. Don't rely on generic linting tools for Copilot compatibility
3. Test in a fresh Copilot environment periodically to catch validation regressions

---

## 7. Comparison Matrix

| Aspect | Copilot CLI | Claude Marketplace |
|--------|-------------|-------------------|
| **Manifest Format** | `plugin.json` + `.mcp.json` | OpenAPI 3.0/3.1 + tool definition |
| **Discovery Model** | Git repository registry | Package registry (npm, PyPI, etc.) |
| **Version Resolution** | Git tags / commits | Semantic versioning via package manager |
| **Description Constraints** | < 1024 bytes (strict) | No byte limit (UX recommendation < 1000) |
| **Name Constraints** | < 256 bytes, kebab-case | No format constraints (OpenAPI allows any) |
| **Validation Type** | Semantic (strict, non-standard) | Schema-based (OpenAPI standard) |
| **Capability Types** | Skills, agents, tools, resources | Tools, resources, models |
| **Deprecation** | Custom flags | OpenAPI `deprecated: true` |
| **Extensibility** | `.mcp.json` for MCP servers | `x-*` vendor fields in OpenAPI |
| **Update Mechanism** | Git pull from repo | Package manager update |
| **Plugin Isolation** | Local filesystem + git remotes | NPM/PyPI registry + API clients |
| **Testing Environment** | Copilot CLI (requires installation) | Claude API + SDK (any language) |

---

## 8. Best Practices for Cross-Platform Plugins

### 1. Dual Maintenance

Maintain two separate metadata formats:
```
my-plugin/
├── plugin.json           # Copilot CLI manifest
├── .mcp.json             # Copilot MCP integration
├── package.json          # NPM for Claude Marketplace
├── openapi.yaml          # Claude OpenAPI spec
└── README.md             # Shared documentation
```

### 2. CI/CD Validation

```bash
# Validate against both platforms
$ copilot plugin validate --file plugin.json
$ npm run validate:openapi openapi.yaml
$ yamllint plugin.json
```

### 3. Version Sync

- Bump version in **both** `plugin.json` and `package.json`
- Create git tag after commit
- Publish to npm/registry
- Document version alignment in CHANGELOG

### 4. Documentation

Include:
- Explicit description length limits for Copilot (< 1024 bytes)
- Changelog noting platform-specific changes
- Troubleshooting guide for validation failures
- Links to platform-specific documentation

### 5. Testing Strategy

```
Local Development
  ↓
Syntax Validation (yaml, json)
  ↓
Copilot Semantic Validation (copilot plugin validate)
  ↓
Claude OpenAPI Validation (swagger-cli, swagger-ui)
  ↓
Live Testing in Each Platform
  ↓
Consumer Installation Test
```

---

## 9. Known Issues & Workarounds

### Issue: Description Length Rejection

**Error:** `description must be < 1024 characters`

**Root Cause:** Copilot validator counts UTF-8 bytes (not characters); some Unicode characters exceed 1 byte.

**Workaround:**
```json
{
  "description": "Brief, under 100 chars. See README.md for full details."
}
```

### Issue: Version Not Resolved in Marketplace

**Error:** Plugin version "1.0.4" not found in marketplace, reverted to 1.0.3

**Root Cause:** Git tag `v1.0.4` not created; marketplace reads from tags only.

**Workaround:**
```bash
git tag v1.0.4
git push origin v1.0.4
# Wait for marketplace catalog refresh (5-15 minutes)
```

### Issue: Schema Validation Failures

**Error:** `schema not compliant with JSON Schema draft-7`

**Root Cause:** Copilot uses a stricter JSON Schema validator than generic tools; some keywords or patterns not supported.

**Workaround:**
- Test `inputSchema` against https://www.jsonschemavalidator.net/
- Avoid advanced keywords (e.g., `$ref` chains, `allOf` with conflicts)
- Provide concrete examples in schema descriptions

---

## 10. Recommendations

1. **For New Projects:** If targeting both platforms, use OpenAPI as your source of truth and generate `plugin.json` from it, rather than maintaining both manually.

2. **For Existing Copilot CLI Plugins:** Add Clara marketplace support by:
   - Creating an `openapi.yaml` that mirrors your tool definitions
   - Publishing to npm with `@scope/plugin-name` naming
   - Testing against both validators in CI/CD

3. **For Shared Marketplace Requirements:** Advocate for standardization; both Copilot CLI and Claude benefit from a unified marketplace spec (e.g., OpenAPI as the common language).

4. **For Documentation:** Include platform-specific gotchas in your plugin README; the 1024-byte description limit is a good example of a gotcha that can't be discovered without testing.

---

## References

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/copilot-cli)
- [Copilot Plugin Specification](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- [Claude Tools Documentation](https://docs.anthropic.com/docs/build-a-system-with-tools)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

---

**Last Updated:** June 18, 2026  
**Author:** Peter Warnock  
**Status:** Published
