# GitHub Pages Security Limitations & Migration Plan

**Status**: Documentation  
**Created**: November 25, 2025  
**Scope**: Security headers, CSP, and platform limitations for static hosting

---

## Executive Summary

GitHub Pages is a free, convenient static hosting platform but has **critical
security limitations** due to its shared infrastructure model. This document
outlines:

1. **Current Security Posture**: What we can and cannot control
2. **Limitations**: What GitHub Pages cannot provide
3. **Mitigations**: What we've implemented to work within constraints
4. **Migration Path**: How to move to platforms with proper security header
   support

---

## Current Security Posture

### What We Control

✅ **At Build Time**:

- Hugo security settings (inline shortcodes disabled, safe functions)
- Content Security Policy (CSP) via meta tags
- Git information integrity (GPG signing of releases)
- Dependency security (npm audit, Playwright updates)
- Code scanning (GitHub CodeQL)

✅ **At Runtime**:

- HTTPS enforcement (GitHub Pages automatically serves via HTTPS)
- Semantic HTML (no untrusted content)
- Analytics sandboxing (Google Tag Manager contained)
- Feature flags for gradual rollout

### What We Cannot Control

❌ **HTTP Headers** (GitHub Pages Limitation):

- `Content-Security-Policy` header (enforced version) - GitHub Pages ignores
  HTTP header CSP
- `X-Frame-Options` - Cannot set to DENY
- `X-Content-Type-Options: nosniff` - Not enforced
- `Strict-Transport-Security` (HSTS) - Not supported
- `Referrer-Policy` - Not configurable
- `Permissions-Policy` - Not configurable
- Custom header injection - Not supported

❌ **Infrastructure**:

- WAF (Web Application Firewall)
- DDoS protection beyond GitHub's baseline
- Rate limiting
- IP-based access control
- Custom middleware

---

## GitHub Pages Limitations Explained

### 1. Content Security Policy (CSP) Headers

**The Problem**: GitHub Pages serves all content from the `github.io` domain
with a shared HTTPS certificate. It does NOT allow custom HTTP headers, which
means:

```
❌ Cannot send: Content-Security-Policy: default-src 'self'
❌ Cannot send: X-Frame-Options: DENY
❌ Cannot send: X-Content-Type-Options: nosniff
```

**Our Mitigation**: We use CSP via `<meta>` tags in HTML, which provides
**partial** protection:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net/ https://www.googletagmanager.com/;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://www.googletagmanager.com/;
"
/>
```

**Why Meta Tags Are Weaker**:

- `<meta>` CSP is evaluated AFTER HTML parsing begins
- Cannot protect against form-hijacking (GET requests)
- Cannot protect against navigation to data: URLs
- Plugins and certain attacks may bypass meta CSP

---

### 2. No HSTS (HTTP Strict-Transport-Security)

**The Problem**: HSTS forces all future traffic to HTTPS and prevents downgrade
attacks. GitHub Pages doesn't support it.

**Risk**: Moderate

- First visit to http://peterwarnock.com (if someone types without https) could
  be intercepted
- Subsequent requests still protected by HTTPS by default on modern browsers

**Our Mitigation**:

- Redirect http → https at DNS level (not applicable, GitHub handles this)
- Browser preload list inclusion (peterwarnock.com is already in HSTS preload
  list)

---

### 3. No X-Frame-Options Header

**The Problem**: Cannot prevent clickjacking attacks via frame embedding.

**Risk**: Low for portfolio sites

- Attacker could embed site in a malicious page
- User might be tricked into interacting with overlaid content
- Analytics and form submissions could be intercepted

**Our Mitigation**:

- No sensitive forms on site (contact via email)
- No financial transactions
- Analytics data is non-sensitive
- Could implement frame-busting JavaScript (less reliable than headers)

---

### 4. No X-Content-Type-Options: nosniff

**The Problem**: Browsers may sniff file types instead of respecting MIME types,
enabling XSS attacks.

**Risk**: Low

- Only applies to old browsers (IE, Edge Legacy)
- Modern browsers respect MIME types
- Our assets are all static, not user-uploaded

**Our Mitigation**:

- Proper MIME types configured in Hugo
- No user-uploaded content
- No form submissions to server

---

### 5. No Custom Middleware or WAF

**The Problem**: Cannot implement custom security logic or Web Application
Firewall rules.

**Risk**: Low for static sites

- No backend endpoints to attack
- No databases or authentication
- No rate limiting for DDoS

**Our Mitigation**:

- Cloudflare free plan provides DDoS protection (can add as reverse proxy)
- No sensitive operations to protect
- Monitoring via GitHub Actions logs

---

## Security Improvements Made (v0.20.1)

### Hugo Security Configuration

**File**: `hugo.toml`

```toml
[security]
  enableInlineShortcodes = false              # Prevent shortcode injection
  [security.exec]
    allow = ['^dart-sass-embedded$', ...]     # Whitelist safe executables
    osEnv = ['(?i)^(PATH|PATHEXT|...)$']      # Limit OS environment access
  [security.funcs]
    getenv = ['^HUGO_']                       # Only HUGO_ env vars
  [security.http]
    methods = ['(?i)GET|POST']                # Allow safe HTTP methods
    urls = ['.*']                             # Allow all URLs (configurable)
```

### Content Security Policy (Meta Tag)

**File**: `layouts/_default/baseof.html` (or similar)

Protects against:

- Inline script injection
- Style injection
- Unauthorized image loading
- Cross-origin requests

### Build-Time Security

- **Hugo build security**: All security checks enabled
- **Dependency scanning**: `npm audit`, `pip audit` in CI
- **Code scanning**: GitHub CodeQL on all PRs
- **SAST**: ESLint, StyleLint, type checking

### Deployment Security

- **Atomic releases**: via `scripts/release.sh` and GitHub Actions
- **Version integrity**: Git signed tags
- **Automated rollback**: Feature flags + previous version tags available

---

## Remaining Risks

### Low Risk

- **Clickjacking**: No X-Frame-Options header (mitigated by no sensitive
  operations)
- **Form hijacking**: CSP via meta tag (not perfect, but functional)
- **MIME type sniffing**: Modern browsers unaffected

### Theoretical Risk

- **Initial HTTPS downgrade**: Not in HSTS preload for all subdomains (unlikely
  but possible)
- **DNS hijacking**: Outside GitHub Pages' control
- **Supply chain attacks**: Dependencies could be compromised (npm audit helps)

### Not Applicable

- **Database attacks**: No database
- **SQL injection**: No SQL
- **Authentication bypass**: No authentication
- **Session hijacking**: No sessions

---

## Migration Plan: Platforms with Full Security Header Support

### Recommended Platforms

#### 1. **Vercel** (Recommended for Next.js/Edge)

**Advantages**:

- ✅ Custom HTTP headers via `vercel.json`
- ✅ Middleware support (request/response interception)
- ✅ Automatic HSTS header
- ✅ Free tier for open source
- ✅ Global CDN with DDoS protection
- ✅ Analytics built-in

**Disadvantages**:

- Vendor lock-in to Vercel ecosystem
- More complex configuration
- Requires Next.js for full feature access

**Security Headers**:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com/;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

#### 2. **Netlify** (Best for Hugo)

**Advantages**:

- ✅ Custom HTTP headers via `_headers` file
- ✅ Redirect rules and request rewriting
- ✅ Edge Functions for middleware
- ✅ Excellent Hugo support
- ✅ Atomic deployments
- ✅ Built-in form handling

**Disadvantages**:

- Free tier has limited edge function invocations
- Less developer ecosystem than Vercel

**Security Headers**:

```
# _headers file at site root
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com/;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

#### 3. **CloudFlare Pages** (Most Control)

**Advantages**:

- ✅ Custom HTTP headers and workers
- ✅ WAF rules available
- ✅ Rate limiting and DDoS protection
- ✅ Page Rules for granular control
- ✅ Workers for middleware
- ✅ Free tier with good limits

**Disadvantages**:

- More complex configuration learning curve
- Requires understanding of CloudFlare ecosystem

**Security Headers** (via CloudFlare Workers):

```javascript
// CloudFlare Worker
export default {
  async fetch(request) {
    const response = await fetch(request);

    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Security-Policy', "default-src 'self'");
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000');

    return newResponse;
  },
};
```

---

## Migration Path: Step-by-Step

### Phase 1: Preparation (Week 1)

- [ ] Choose target platform (recommend **Netlify** for Hugo)
- [ ] Create account and connect GitHub repo
- [ ] Test build on new platform
- [ ] Set up DNS records (CNAME) on custom domain
- [ ] Configure security headers in platform-specific format

### Phase 2: Staging (Week 2-3)

- [ ] Deploy to staging subdomain (e.g., staging.peterwarnock.com)
- [ ] Run full Playwright test suite on staging
- [ ] Verify analytics integration
- [ ] Check performance (Lighthouse)
- [ ] Test SSL/TLS certificate validity

### Phase 3: Cutover (Week 4)

- [ ] Create DNS migration plan
- [ ] Schedule migration for low-traffic time
- [ ] Update DNS to point to new platform
- [ ] Monitor 404s and analytics
- [ ] Keep GitHub Pages as fallback (24-48 hours)

### Phase 4: Cleanup (Week 5)

- [ ] Verify all traffic on new platform
- [ ] Decommission GitHub Pages repo (or make it read-only)
- [ ] Update deployment documentation
- [ ] Archive migration logs

---

## Platform Comparison Matrix

| Feature              | GitHub Pages | Netlify  | Vercel   | CloudFlare |
| -------------------- | ------------ | -------- | -------- | ---------- |
| Custom HTTP Headers  | ❌           | ✅       | ✅       | ✅         |
| HSTS Support         | ❌           | ✅       | ✅       | ✅         |
| Middleware/Functions | ❌           | ✅       | ✅       | ✅         |
| WAF                  | ❌           | ❌       | ❌       | ✅         |
| Rate Limiting        | ❌           | ❌       | ❌       | ✅         |
| Free Tier            | ✅           | ✅       | ✅       | ✅         |
| Hugo Support         | ✅           | ✅       | ⚠️       | ✅         |
| Cost (High Volume)   | Free         | $19+/mo  | $20+/mo  | $0-200/mo  |
| Ease of Use          | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐     |

**Recommendation for this project**: **Netlify**

- Native Hugo support
- Simple `_headers` configuration
- Free tier sufficient for portfolio site
- Atomic deployments match release process
- Great developer experience

---

## Security Best Practices Until Migration

While on GitHub Pages, follow these practices to maximize security:

### 1. Dependency Management

```bash
# Regular audits
npm audit
npm audit fix

# Update regularly
npm update
```

### 2. GitHub Actions Security

```yaml
# Use pinned versions
- uses: actions/checkout@v4 # ✅ Pinned
- uses: actions/setup-node@v4 # ✅ Pinned
# NOT: uses: actions/checkout@main  # ❌ Avoid
```

### 3. Secret Management

- No hardcoded secrets in repo
- Use GitHub Secrets for API keys
- Rotate tokens regularly
- Audit token usage in Actions logs

### 4. Release Integrity

- Sign commits with GPG
- Create signed git tags for releases
- Include commit SHA in release notes
- Document version-to-commit mapping

### 5. Monitoring

- Check GitHub Dependabot alerts weekly
- Monitor build failures
- Review Actions logs for suspicious activity
- Set up alerts for failed builds/deployments

---

## Testing Security Headers

### After Migration, Verify Headers

```bash
# Test with curl
curl -I https://peterwarnock.com | grep -E "Content-Security|X-Frame|HSTS|Strict"

# Expected output:
# Content-Security-Policy: default-src 'self'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Online Tools

- **Security Headers**: https://securityheaders.com
- **Observatory**: https://observatory.mozilla.org
- **SSL Labs**: https://www.ssllabs.com/ssltest/

---

## Related Documentation

- **Release Process**:
  [RELEASE_PROCESS_UX_GUIDE.md](/docs/development/RELEASE_PROCESS_UX_GUIDE.md)
- **Deployment**: [DEPLOYMENT.md](/docs/operations/DEPLOYMENT.md)
- **Hugo Security**: [hugo.toml](/hugo.toml) (security section)
- **GitHub Pages Docs**: https://docs.github.com/en/pages

---

## Timeline for Migration

**Current Status**: GitHub Pages (adequate for portfolio, but limited security)

**Recommended Timeline**:

- **Short term (1-3 months)**: Monitor GitHub Pages performance, start Netlify
  evaluation
- **Medium term (3-6 months)**: Implement Netlify staging, complete testing
- **Long term (6+ months)**: Migrate to Netlify if security becomes business
  requirement

**Trigger for Migration**:

- Customer data collection (Netlify Forms)
- Monetization requirements (payment processing)
- Increased security requirements
- Need for edge computing (rate limiting, WAF)

---

## Conclusion

GitHub Pages provides excellent value for free, static hosting with HTTPS and
global CDN. The security limitations are acceptable for a portfolio site with no
sensitive data or backend operations.

For enhanced security posture, migration to **Netlify** is recommended as a
straightforward upgrade path that maintains Hugo compatibility while adding
proper HTTP header support.

---

**Last Updated**: November 25, 2025  
**Review Frequency**: Quarterly  
**Audience**: Developers, DevOps, Security Team
