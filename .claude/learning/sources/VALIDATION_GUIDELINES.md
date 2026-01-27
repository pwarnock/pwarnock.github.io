# Content Validation Guidelines

This repository is treated as a **public space**. All learnings, bookmarks, and context should be safe for public viewing.

## ✅ Safe Content (Commit These)

### Session Learnings
- Technical discoveries: "Learned that Playwright needs headless mode for CI"
- Architecture insights: "Found that lazy loading reduces initial bundle size by 40%"
- Bug fixes: "Fixed infinite loop in pagination by adding bounds check"
- Pattern discoveries: "Discovered memoization pattern reduces re-renders"
- Tool configurations: "Jest requires transformIgnorePatterns for ESM modules"

### Reading List
- Public articles and blog posts
- Open source documentation
- Published research papers
- Public GitHub repositories
- Conference talks on YouTube

### Professional Tone
- Informal conversational notes are fine (they get written up professionally)
- Technical frustrations are okay if generalized ("This API is poorly documented")
- Learning context is valuable ("Spent 2 hours debugging this")

## ❌ Private Content (DO NOT Commit)

### Session Learnings - Avoid
- **Client/employer specifics**: "Fixed auth bug for client XYZ's internal system"
- **Credentials/secrets**: API keys, passwords, tokens (even in examples)
- **Internal URLs**: Company wiki links, internal dashboards, private repos
- **Personal information**: Names of coworkers, team structures, org details
- **Business logic**: Proprietary algorithms, trade secrets
- **Personal frustrations**: Complaints about specific people or organizations

### Reading List - Avoid
- **Private documentation**: Internal company wikis, private Notion pages
- **Restricted access**: Private Google Docs, Dropbox links requiring auth
- **Personal research**: Medical, financial, legal bookmarks unrelated to dev work
- **Confidential sources**: Customer data, private communications

## Validation Prompt

Use this prompt to check content before committing:

```
Review this content for sensitive information. Check for:

1. **Client/Company Names**: Any specific business names or customer references?
2. **Credentials**: API keys, passwords, tokens, connection strings?
3. **Internal URLs**: Links requiring authentication or private access?
4. **Personal Information**: Real names (except public figures), email addresses, phone numbers?
5. **Business Logic**: Proprietary algorithms, trade secrets, competitive info?
6. **Private Context**: References to private conversations, internal meetings, org structure?

Content to check:
---
[PASTE CONTENT HERE]
---

If any issues found, suggest redacted/generalized versions.
If clean, respond: "✅ Safe for public commit"
```

## Generalization Examples

### Before (Private)
```markdown
## 2026-01-26 Learning

Fixed critical auth bug for Acme Corp's SSO integration. Their SAML
implementation was rejecting our assertions because we weren't signing
with SHA-256. Contact: john.doe@acmecorp.com for details.
```

### After (Public)
```markdown
## 2026-01-26 Learning

Fixed SAML SSO integration issue. Authentication was failing because
assertions weren't signed with SHA-256. Solution: Update SAML signing
algorithm configuration to use SHA-256 instead of SHA-1.

**Pattern**: Always verify SAML signing algorithm requirements early in SSO setup.
```

### Before (Private)
```markdown
## Reading List

- https://acmecorp.atlassian.net/wiki/internal-api-docs
- https://docs.google.com/document/d/private-strategy-doc
```

### After (Public)
```markdown
## Reading List

- [SAML 2.0 Technical Overview](https://docs.oasis-open.org/security/saml/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
```

## Pre-Commit Integration

This validation is integrated into the pre-commit workflow:

1. **Automated checks** scan for common patterns (API keys, URLs with auth tokens)
2. **Manual review** required for new learnings and bookmarks
3. **CI validation** can flag suspicious patterns in pull requests

## Recovery

If sensitive content is accidentally committed:

1. **DO NOT** use `git commit --amend` (leaves history)
2. **DO** use `git filter-branch` or BFG Repo-Cleaner to remove from history
3. **DO** rotate any exposed credentials immediately
4. **DO** notify the team if this is a shared repository

## Philosophy

> "Write as if your grandmother, your future employer, and a security researcher will all read this."

This repo is a **professional portfolio** and **learning journal**. Keep it:
- Technically accurate
- Professionally written
- Publicly shareable
- Credentials-free
- Client-anonymous

When in doubt, generalize or leave it out.
