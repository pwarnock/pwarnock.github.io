# Self-Enforcing Release Process

## 1. Executive Summary

This document defines a self‑enforcing, CI‑driven release process for this Hugo
static site, built and tooled with Bun and GitHub Actions.

The design has three core ideas:

1. **CI is the only release authority**: all tags, version bumps, and
   deployments are created by GitHub Actions, never directly from a developer’s
   machine.
2. **Single source of truth for version**: `package.json.version` is the
   canonical version for the site and all release automation.
3. **Requests, not actions**: developers submit **release requests** via
   `scripts/release.sh`; GitHub Actions (`release-controller.yml`) validates and
   executes those requests, while additional workflows ensure the rules cannot
   be bypassed.

This produces a repeatable, auditable release pipeline for the Hugo site,
integrated with Beads (`bd`) for change tracking, with guardrails that are
enforced automatically by CI rather than by convention.

Effort: **M–L (1–2 days)** including wiring GitHub Actions, writing the
`release.sh` client, and iterative polishing.

---

## 2. Architectural Principles

1. **Centralized Authority**
   - All release‑critical actions (version bumps, Git tags, GitHub Releases,
     production deployments) happen **only** in CI.
   - Local tools (`scripts/release.sh`) can only create or update **declarative
     release requests** in the repository; they never mutate versions or tags
     directly.

2. **Single Source of Truth for Versions**
   - `package.json.version` is the canonical version across:
     - Release naming (`vX.Y.Z` tags)
     - Hugo site metadata (e.g., footer/version badge, build metadata)
     - Beads records for releases.
   - CI derives everything else from this canonical value.

3. **Declarative, Idempotent Operations**
   - A release is described by a **request file** (`.release/request.json`) that
     encodes intent (type, target, description), not imperative steps.
   - CI (`release-controller.yml`) is idempotent: re‑running on the same
     commit/request either:
     - Confirms the release already completed, or
     - Continues/repairs a partially completed release, without corrupting
       state.

4. **Self‑Enforcement via CI**
   - Guardrails are built into GitHub Actions:
     - PRs that edit `package.json.version` directly (outside the controller)
       **fail**.
     - Tags pushed outside of CI are rejected or blocked by policy (where
       possible) and flagged.
   - The process is enforced by automation, not by manual review discipline.

5. **Minimal, Incremental Complexity**
   - Start with a simple, linear flow:
     - `main` → release request → CI builds Hugo site → deploys static assets.
   - Extensions (e.g., multiple environments, preview releases) build on the
     same release request mechanism.

6. **Traceability and Observability**
   - Every production deployment is:
     - Linked to a Bead (`bd`) entry with metadata about scope and status.
     - Traceable from tag → commit → release request → CI run → deployment
       artifact/location.

7. **Developer Ergonomics**
   - The happy path is a single command (`scripts/release.sh`) with clear,
     interactive prompts.
   - Developers don’t have to remember versioning rules, tag formats, or
     deployment commands.

---

## 3. Technical Architecture (Components, Data Flows)

### 3.1 Components

1. **Local Client: `scripts/release.sh`**
   - Entry point for developers.
   - Responsibilities:
     - Collect release parameters (type: `rc` / `final` / `hotfix`, description,
       target branch).
     - Ensure working tree is clean and on the expected base branch (usually
       `main`).
     - Optionally interact with `bd` (Beads) to:
       - Create or link a Bead representing this release.
       - Attach metadata (version, commit, release type).
     - Write/update `.release/request.json` on the current branch.
     - Commit and push the request.
     - Optionally open a PR or directly push to `main` depending on policy.

2. **Release Controller (GitHub Actions:
   `.github/workflows/release-controller.yml`)**
   - Trigger:
     - On push to `main` that modifies `.release/request.json`.
   - Responsibilities:
     1. **Validate the request**:
        - Schema validation of `.release/request.json`.
        - Ensure no conflicting or concurrent active release request for the
          same branch.
     2. **Compute next version**:
        - Read `package.json.version`.
        - Use request parameters to decide bump strategy:
          - `rc`: bump pre‑release (e.g., `1.2.0-rc.1`, `1.2.0-rc.2`).
          - `final`: bump patch/minor/major per policy and strip pre‑release.
          - `hotfix`: bump patch from the currently deployed version.
     3. **Mutate version and tag (only in CI)**:
        - Update `package.json.version`.
        - Commit the version change with a bot identity.
        - Create and push an annotated Git tag: `v<version>`.
        - Optionally create/update a GitHub Release.
     4. **Build and deploy Hugo site**:
        - Install dependencies with Bun.
        - Run Hugo build (`hugo` with appropriate config/environment).
        - Upload build artifacts and deploy to the configured target (e.g.,
          static hosting bucket, CDN, or GitHub Pages).
     5. **Update `.release/request.json` and Bead status**:
        - Mark status (e.g., `pending` → `in_progress` → `succeeded` /
          `failed`).
        - If using Beads, call `bd` to mark the release as `Released`/`Failed`
          with deployment metadata.

3. **Version Consistency Gate (GitHub Actions:
   `.github/workflows/version-consistency.yml`)**
   - Trigger:
     - On pull request targeting `main`.
   - Responsibilities:
     - Detect direct edits to `package.json.version`.
     - Fail the PR if:
       - Version changed and the author is not the release bot CI user, or
       - The change is not part of the controlled release path (e.g., no
         corresponding `.release/request.json` change).
     - Optionally, block changes to tags or `.release/` files except via the
       controller.

4. **Orphan RC Auditor (GitHub Actions:
   `.github/workflows/orphan-rc-auditor.yml`)**
   - Trigger:
     - Scheduled (e.g., daily or weekly).
   - Responsibilities:
     - Scan tags/releases for `-rc.*` versions without corresponding:
       - Final promotion within a configured grace period, or
       - Bead entries in a terminal state.
     - Emit a report (issues, PR comments, or Slack/webhook notification)
       listing:
       - Stale RC versions.
       - Associated commits and Bead references.
     - Optionally auto‑open cleanup tasks (e.g., Bead reminders, backlog items).

5. **Beads Integration (`bd` CLI)**
   - Use inside:
     - `scripts/release.sh`: to create or link a Bead when a release request is
       initiated.
     - `release-controller.yml`: to update Bead status on success/failure.
   - Provides:
     - A human‑readable, centralized view of what changed in each release of the
       Hugo site.
     - Audit trail for stakeholders outside of Git.

6. **Hugo/Bun Build Pipeline**
   - Implemented inside `release-controller.yml`:
     - Uses Bun for any JavaScript tooling (e.g., linting, asset processing).
     - Uses Hugo for static site generation.
   - Artifacts:
     - Compiled static site (e.g., `public/` directory).
     - Build metadata (timestamp, Git SHA, version) used by the site.

---

### 3.2 Data Flows

#### 3.2.1 Release Request Creation

1. Developer runs:
   ```bash
   ./scripts/release.sh [rc|final|hotfix]
   ```
2. Script:
   - Validates clean working tree and correct branch.
   - Optionally prompts for:
     - Short release summary.
     - Linked Bead ID or creates a new Bead via `bd`.
   - Writes `.release/request.json`, e.g.:

   ```json
   {
     "type": "final",
     "targetBranch": "main",
     "requestedBy": "dev@example.com",
     "description": "Q3 content and navigation updates",
     "beadId": "B-1234",
     "requestedAt": "2024-08-01T12:34:56Z"
   }
   ```

   - Commits this file.
   - Pushes to the remote branch (and optionally opens a PR if not on `main`).

3. When the change reaches `main`, it triggers the release controller workflow.

#### 3.2.2 Release Execution in CI

1. `release-controller.yml` starts on push to `main` that includes changes to
   `.release/request.json`.
2. It validates that:
   - The request is syntactically correct.
   - There is no other active request being processed (or it serializes them).
3. It reads `package.json.version` and calculates the next version.
4. It:
   - Updates `package.json.version`.
   - Commits with a bot identity.
   - Pushes the commit and creates tag `vX.Y.Z`.
5. It builds the Hugo site using Bun + Hugo and deploys artifacts to the
   configured production environment.
6. It updates `.release/request.json` status and, via `bd`, updates the Bead
   status.

---

#### 3.2.3 Guardrails and Audits

- **PRs**:
  - `version-consistency.yml` checks diffs:
    - If `package.json.version` has changed and the actor is not the release
      bot, CI fails.
    - If `.release/request.json` changes in unexpected ways (e.g., manual status
      edits), CI fails.
- **Scheduled audits**:
  - `orphan-rc-auditor.yml`:
    - Lists RC tags without corresponding final tags or deployments.
    - Notifies owners for cleanup or follow‑up.

---

## 4. Behavioral Design (Golden Path)

This section describes the intended “happy path” behavior for common workflows.

### 4.1 Releasing a Final Version from `main`

1. **Prepare the branch**
   - Developer merges all content/feature PRs into `main`.
   - `main` is green: all CI checks pass.

2. **Initiate release**
   - From local clone on `main` with clean working tree:
     ```bash
     ./scripts/release.sh final
     ```
   - Script:
     - Confirms `HEAD` is on `origin/main` or warns if not.
     - Asks for:
       - Release description.
       - Optional existing Bead ID, or creates a new Bead via `bd`.

3. **Create and push request**
   - Script writes `.release/request.json` with `type: "final"`.
   - Script commits and pushes directly to `main` (or via a short‑lived PR,
     depending on policy).
   - Push triggers `release-controller.yml` in GitHub Actions.

4. **CI release execution**
   - `release-controller.yml`:
     - Validates request.
     - Calculates new version (e.g., bump patch).
     - Updates `package.json.version`, commits, and creates `vX.Y.Z` tag.
     - Builds Hugo site.
     - Deploys the static site to production.
     - Updates `.release/request.json` status and the Bead via `bd`.

5. **Outcome**
   - Production environment serves the new Hugo site version.
   - `package.json.version` and `vX.Y.Z` tag reflect the deployed state.
   - Bead shows `Released` with links to:
     - Git commit/tag.
     - CI run.
     - Deployment info.

---

### 4.2 Creating a Release Candidate (RC)

1. Developer runs:
   ```bash
   ./scripts/release.sh rc
   ```
2. Script:
   - Writes `.release/request.json` with `type: "rc"` and optional target (e.g.,
     staging environment).
3. `release-controller.yml`:
   - Bumps pre‑release version (`1.2.0-rc.1`, `1.2.0-rc.2`, …).
   - Builds Hugo site and deploys to an RC/staging environment.
   - Tags commit with the RC version.
4. RC is tested; later, a `final` release request promotes it to production
   using a new (final) version.

---

### 4.3 Hotfix Release

1. A production issue is identified.
2. A fix is implemented and merged into a hotfix branch based off the current
   production tag/commit.
3. On the hotfix branch (or once merged back to `main`, depending on policy),
   developer runs:
   ```bash
   ./scripts/release.sh hotfix
   ```
4. `release-controller.yml`:
   - Reads current production version.
   - Bumps patch accordingly (e.g., from `1.2.0` to `1.2.1`).
   - Builds and deploys the Hugo site.
   - Updates tags and Bead.

---

## 5. Implementation Strategy (Phased Rollout)

The goal is to reach a self‑enforcing system incrementally, minimizing
disruption.

### Phase 0: Baseline and Instrumentation (S)

- Confirm current:
  - Hugo build command.
  - Deployment mechanism (e.g., GitHub Pages, S3/CloudFront, or other).
- Ensure `package.json` exists and `version` is present.
- Add simple build + deploy workflow if it doesn’t yet exist.

### Phase 1: Introduce Release Requests and Controller (M)

- Implement `scripts/release.sh` with:
  - Argument parsing for `rc|final|hotfix`.
  - Generation of `.release/request.json`.
  - Git commit and push behavior.
  - Optional initial `bd` hooks (may be stubbed/logging only at first).
- Add `release-controller.yml`:
  - Triggered on push to `main` with `.release/request.json` changes.
  - For now, perform:
    - Request validation.
    - Hugo build + deploy.
  - In this phase, **do not** yet enforce version‑bump logic; just log the
    intended version steps.

### Phase 2: Make `package.json.version` Canonical (M)

- Extend `release-controller.yml` to:
  - Read and bump `package.json.version`.
  - Commit the version bump.
  - Create and push a release tag `vX.Y.Z`.
- Begin using `package.json.version` in:
  - Hugo build metadata (e.g., via data files or environment variables consumed
    by Hugo).
  - User‑visible footer or version marker in the site (optional but
    recommended).

### Phase 3: Enforce Guardrails (M)

- Add `version-consistency.yml`:
  - Fail PRs that change `package.json.version` without going through the
    release controller.
  - Optionally enforce that `.release/request.json` is only modified in
    well‑defined ways:
    - Certain fields (like `status`) are only set by CI (checked via commit
      actor or pattern).
- Update developer documentation:
  - Document `scripts/release.sh` as the only supported path for releases.
  - Add guidance to avoid manual `git tag` or direct version edits.

### Phase 4: Add Auditing and Clean‑Up (S–M)

- Add `orphan-rc-auditor.yml`:
  - Scheduled job scanning RC tags for staleness.
  - Emit report via issues or notifications.
- Integrate `bd`:
  - Ensure `scripts/release.sh` can:
    - Link to existing Beads, or
    - Create a new one via `bd`.
  - Ensure `release-controller.yml` updates Bead statuses and attaches
    artifacts/links.

### Phase 5: Refinement and UX Improvements (S–M, ongoing)

- Improve `scripts/release.sh` UX:
  - Better prompts, validation, and dry‑run mode.
- Enhance CI observability:
  - Clear outputs and logs indicating version bump, tag, and deployment URL.
- Expand to additional environments (if needed):
  - e.g., per‑branch preview builds that reuse parts of the release architecture
    without version bumps.

---

## 6. Failure Mode Analysis

This section outlines key failure modes and how the design mitigates them.

1. **Direct Version Edits**
   - _Risk_: Developer manually changes `package.json.version` (e.g., bumping
     locally).
   - _Mitigation_:
     - `version-consistency.yml` fails any PR with a non‑bot change to
       `package.json.version`.
     - Release controller is the only process allowed to commit this file with
       version changes.

2. **Manual Tagging**
   - _Risk_: Developer manually creates `git tag vX.Y.Z` and pushes, bypassing
     CI.
   - _Mitigation_:
     - Document policy: manual tagging is unsupported.
     - Optionally use protected branches/tag protection rules to restrict tag
       pushes to CI bot.
     - Or: add an audit job that:
       - Detects tags not created by the bot.
       - Files issues for cleanup.

3. **Stale or Conflicting Release Requests**
   - _Risk_: Multiple `.release/request.json` files or outdated requests cause
     confusion.
   - _Mitigation_:
     - Enforce a single active request per branch.
     - Controller validates that:
       - The request’s commit matches `HEAD` of `main` (or configured branch).
       - Older requests are ignored/failed with clear messaging.
     - `orphan-rc-auditor` helps identify old RCs that never completed.

4. **CI Deployment Failures**
   - _Risk_: Hugo build or deployment step fails in CI, leaving version bumped
     but site not updated.
   - _Mitigation_:
     - Controller is structured so:
       - Version bump + tag + deployment happen as logically atomic steps where
         possible.
       - If deployment fails after tagging:
         - Status in `.release/request.json` and Bead are marked `failed`.
         - Next run can either:
           - Re‑deploy same version, or
           - Start a new patch release with a fix.
     - Clear CI output and notifications pointing to the failing step.

5. **Inconsistent Beads Integration**
   - _Risk_: Missing or incorrect Bead linkage leads to poor traceability.
   - _Mitigation_:
     - Make Bead linking part of `scripts/release.sh` prompts.
     - Validate presence of `beadId` in `.release/request.json` (or allow a
       default for non‑tracked releases).
     - Controller updates Bead statuses automatically.

6. **Orphan RC Releases**
   - _Risk_: Many RC builds accumulate without being promoted or cleaned up.
   - _Mitigation_:
     - `orphan-rc-auditor.yml` scheduled job flags RCs older than a threshold
       (e.g., 14 days).
     - Team decides to either promote, re‑test, or retire them.

7. **Developer Bypass/Confusion**
   - _Risk_: Developers keep using old manual process or ad‑hoc scripts.
   - _Mitigation_:
     - Deprecate legacy release scripts and update `README`/developer docs to
       point to `scripts/release.sh`.
     - Optionally add a CI check that fails if legacy scripts are invoked (e.g.,
       by detecting certain file changes or commit messages).
     - Offer a transition period with both paths, then disable the old one.

---

## 7. Success Metrics

To know if the self‑enforcing release process is working, track:

1. **Process Adoption**
   - % of production deployments initiated via `scripts/release.sh` /
     `release-controller.yml` vs. any other path.
   - Target: **100%** of releases go through the controller within a short
     adoption period.

2. **Version Integrity**
   - Number of PRs failing due to unauthorized `package.json.version` changes.
   - Target: Trend to **near zero** after initial education period.

3. **Release Reliability**
   - % of releases that succeed end‑to‑end (build, version bump, tag, deploy) on
     first attempt.
   - Target: **>95%** success on first run; investigate and fix root causes for
     failures.

4. **Traceability**
   - For each production deployment, can we answer:
     - Which Bead describes it?
     - Which commit, tag, and CI run produced it?
   - Target: **100%** of production deployments have:
     - A Bead (or equivalent record) linked to tag and CI run.

5. **Cycle Time for Releases**
   - Time from `scripts/release.sh` invocation to production deployment
     complete.
   - Target: Stable, predictable duration (e.g., <15 minutes), with little
     manual intervention.

6. **Operational Load**
   - Number of manual interventions needed per release (e.g., reruns, manual
     approvals, ad‑hoc fixes).
   - Target: **Minimal**, ideally fully automated for non‑emergency releases.

7. **RC Hygiene**
   - Count of RC versions older than the defined threshold without promotion or
     retirement.
   - Target: Very low; RCs should either be promoted or retired within a set
     window (e.g., 2 weeks).

---

This design gives the Hugo static site a simple, robust, and auditable release
process, centered on one canonical version, one controlling CI workflow, and a
single “release request” entry point for developers. As needs evolve (multiple
environments, more complex promotion paths), the same architecture can be
extended without changing the core principles.
