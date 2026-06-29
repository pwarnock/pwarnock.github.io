# Release Process

Releases are fully automated. Merge a PR to main → version bumps → tag → GitHub release → deploy.

## How It Works

1. You merge a PR to `main`
2. `auto-release.yml` scans commits since the last tag
3. Determines version bump from conventional commit prefixes:
   - `fix:`, `perf:` → patch (0.20.3 → 0.20.4)
   - `feat:` → minor (0.20.3 → 0.21.0)
   - `BREAKING CHANGE` footer or `!:` suffix → major (0.20.3 → 1.0.0)
4. Bumps version in all package.json files + hugo.toml via `scripts/version-sync.sh`
5. Commits with `[skip ci]`, creates annotated git tag
6. Creates GitHub release with auto-generated notes
7. Builds Hugo site and deploys to GitHub Pages

## No Manual Steps Required

- No `scripts/release.sh`
- No `.release/request.json`
- No waiting for CI to process a release request

## Version Source of Truth

`package.json` version in the root is the canonical version.
All workspace packages are synced automatically by `scripts/version-sync.sh`.

## What Happens on Non-Releasable Commits

If there are no conventional commits (or only `chore:`, `docs:`, `ci:` etc.) since the last tag, the workflow skips the release step and only deploys. This means every merge to main still deploys, but not every merge produces a new version tag.
