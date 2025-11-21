# QA Modes Spec v1.0 — Content Fast-Path & Full QA

**Status:** Draft  
**Owners:** Platform/Infra + A11y Lead  
**Scope:** Test/QA orchestration for this repo (local + CI)

---

## 1. Overview

- Goals: provide a fast, safe QA path for content-only changes; automatically
  distinguish content vs infra/code; preserve a11y + SEO guarantees; centralize
  QA behavior as a single spec used by local tooling and CI.
- Modes: two core modes
  - content_fast_path: fast but robust for content-only changes
  - full: comprehensive QA for infra/template/code/config changes
- Entry points (CLI):
  - `bun run qa:auto` (preferred in CI/PRs)
  - `bun run qa:content` (manual content fast-path)
  - `bun run qa:full` (manual full pipeline)

---

## 2. Policy & Safety (v1.0)

- **Policy Versions**
  - `qaPolicyVersion`: `1.0.0`
  - `a11yPolicyVersion`: `1.0.0-content-qa`
  - Any change to path rules, mode definitions, or a11y behavior MUST bump the
    appropriate version and update policy tests.
- **Safety guarantees**
  - Default to full QA on ambiguity; content_fast_path must not weaken a11y/SEO
    guarantees.
  - If detection/spec/environ fails, fallback to `QA_MODE=full` with a warning.

---

## 3. Modes & Steps

- **Mode: content_fast_path**
  - Description: Fast but safe QA for clearly content-only changes.
  - Steps (core):
    1. `content_build` — `bun run build:content` — critical: true
    2. `seo_fast` — `bunx playwright test tests/seo-metadata.spec.ts` —
       critical: true
    3. `a11y_fast` — representative a11y checks on home, one article, one
       listing, optional interactive — critical: true
  - Notes: allow a lightweight a11y toggle if needed; keep it strictly focused
    on content flows.

- **Mode: full**
  - Description: Comprehensive QA for infra/template/code/config changes.
  - Steps (core):
    1. `site_build_full` — `bun run build:infra` — critical: true
    2. `seo_full` — `bunx playwright test tests/seo-metadata.spec.ts` —
       critical: true
    3. `a11y_full` — `tests/accessibility-critical.spec.ts` — critical: true
    4. `e2e_journeys` — `tests/e2e-journeys.spec.ts` — critical: true
    5. `visual_regression` — visual suite — critical: true
    6. `performance` — performance checks — critical: false/true (define in
       final)
    7. `go_bdd` — `cd test && go test ./...` — critical: true

---

## 4. Path Rules (v1)

- **Content-eligible patterns** (content-fast-path):
  - `content/**`
  - `static/img/**`
  - `static/images/**`
  - `static/**/*.jpg`
  - `static/**/*.jpeg`
  - `static/**/*.png`
  - `static/**/*.webp`
  - `static/**/*.gif`
  - `static/**/*.svg`
  - `static/**/*.pdf`
- **Non-content patterns** (force full):
  - `layouts/**`
  - `assets/**`
  - `src/**`
  - `scripts/**`
  - `tests/**`
  - `test/**`
  - `config/**`
  - `.github/**`
  - `.cody/**`
  - `.husky/**`
  - Root configs: `hugo.toml`, `tailwind.config.js`, `postcss.config.cjs`,
    `playwright.config.ts`, `vitest.config.ts`, `lighthouserc.js`,
    `package.json`, `package-lock.json`, `bun.lock`, `ecosystem.config.cjs`,
    `.htmltest.yml`
- **a11y-critical data patterns** (force full):
  - `data/nav.*`
  - `data/navigation/**`
  - `data/footer.*`
  - `data/forms/**`
  - `data/aria/**` (if present)

- **Decision rules**
  - Any a11yCriticalDataPatterns → full
  - Any nonContentPattern → full
  - All changed files match allowedContentPatterns → content_fast_path
  - Otherwise → full

---

## 5. Detection & Inputs

- `QA_BASE_REF` (default: `origin/main`)
- `QA_CHANGED_FILES` (optional; newline-separated)
- If not provided, use `git diff --name-only ${QA_BASE_REF}...HEAD`

---

## 6. Ownership, Rollout & Governance

- **Owners:** Platform/Infra + A11y lead
- **Rollout plan:** shadow -> soft -> default in CI
- **Policy governance:** key changes require cross‑team review; policy golden
  tests kept small
- **Guardrails:** small policy tests to prevent drift; a11y guardrails tied to
  policy changes

---

## 7. Metrics & Rollout Signals

- CI adoption rate (qa:auto vs qa:full)
- QA runtime improvements for content PRs (median time)
- Escapes (a11y/SEO) by mode over time

---

## 8. Risks & Mitigations

- Risk: policy drift; Mitigation: policy tests + small governance guardrails
- Risk: misclassification; Mitigation: conservative defaults; quick overrides
- Risk: fragmentation; Mitigation: define this as the single endorsed
  abstraction

---

## 9. Next Steps

- Approve spec and create inline JS/TS config skeletons.
- Implement selector+runner once plan is green.
- Roll out via shadow mode, then default CI usage.

---

## 10. Change Log (for policy versions)

- v1.0.0 — initial draft
