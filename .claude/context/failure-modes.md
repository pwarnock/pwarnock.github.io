# Failure Modes

> Known symptom to cause to fix mappings for fast debugging.
> Add entries as new failure modes are discovered.

## Build Failures

### Hugo build fails with template error
- **Symptom**: `Error building site: ... execute of template failed`
- **Cause**: Go template syntax error in `packages/site/layouts/`
- **Fix**: Check the referenced template file. Common issues: missing `{{ end }}`, wrong variable scope, unquoted strings in `dict`.
- **Prevention**: `hugo --logLevel debug` for detailed error context.

### CSS appears broken / unstyled pages
- **Symptom**: Site loads but Tailwind classes don't apply, raw `@import`/`@plugin` directives visible
- **Cause**: CSS not processed through Tailwind CLI before Hugo serves from `static/`
- **Fix**: `bun x @tailwindcss/cli -i ./packages/site/assets/css/main.css -o ./packages/site/static/css/main.css --minify`
- **Verify**: `grep -E "@import|@plugin" packages/site/static/css/main.css` should return nothing.

### Build succeeds but version not updated in footer
- **Symptom**: Footer shows old version number after version bump
- **Cause**: `data/version.json` not regenerated before build
- **Fix**: `bun run generate-version` runs automatically in `build` script. Check `packages/site/data/version.json` contains correct version.

## Test Failures

### Vitest tests fail with singleton pollution
- **Symptom**: Tests pass individually but fail when run together; state leaks between tests
- **Cause**: Shared singleton instances not cleaned up between tests
- **Fix**: Add proper cleanup in `afterEach` hooks. Reset singleton state. Use `vi.restoreAllMocks()`.
- **Reference**: Commit `b64be5e` fixed this pattern.

### Playwright tests fail with "browser not found"
- **Symptom**: `Error: browserType.launch: Executable doesn't exist`
- **Cause**: Playwright browsers not installed or out of date
- **Fix**: `bunx playwright install` (or `bunx playwright install chromium` for just Chromium).

### Godog BDD tests fail with module errors
- **Symptom**: `go test` fails with import resolution errors
- **Cause**: Running from wrong directory; Go module paths differ from monorepo root
- **Fix**: `cd test && go test -v ./support/...` — must run from `test/` directory.

### Visual regression snapshots differ unexpectedly
- **Symptom**: `@visual` tests fail with pixel differences
- **Cause**: Font rendering, animation timing, or intentional design change
- **Fix**: Review with `bunx playwright show-report`. If intentional: `bunx playwright test --grep @visual --update-snapshots`.
- **Warning**: Never update snapshots without reviewing the diff.

### Vitest double `--run` flag error
- **Symptom**: `Expected a single value for option "--run", received [true, true]`
- **Cause**: `bun run test` already maps to `vitest --run` in package.json. Passing `--run` again via `bun run test --run` duplicates the flag.
- **Fix**: Use `bun run test` (no extra flags) or `bunx vitest --run` for direct invocation.
- **Convention**: For ad-hoc test runs, prefer `bunx vitest` directly.

## CI/CD Failures

### Version consistency check blocks PR
- **Symptom**: `version-consistency.yml` fails; PR cannot merge
- **Cause**: Unauthorized version bump in PR (only release-controller can bump versions)
- **Fix**: Revert the version change in `package.json`. Use `scripts/release.sh` for intentional releases.

### Release controller creates duplicate tag
- **Symptom**: Tag already exists error during release
- **Cause**: Idempotency issue or partial previous run
- **Fix**: Controller should be re-runnable. Check `.release/request.json` state. Delete stale tag if controller confirms it's safe.

### Orphan RC auditor flags stale release candidate
- **Symptom**: GitHub issue created about stale RC tag
- **Cause**: RC was created but never promoted to final
- **Fix**: Either promote with `scripts/release.sh final` or delete the RC tag if abandoned.

## Pre-commit Hook Failures

### Commitlint rejects commit message
- **Symptom**: `input: <message>` then `subject may not be empty` or type errors
- **Cause**: Message doesn't match `<type>(<scope>): <subject>` format
- **Fix**: Use conventional commit format. Valid types: feat, fix, refactor, test, docs, chore, perf, style.

### CSS linting fails
- **Symptom**: stylelint reports errors on CSS files
- **Cause**: CSS doesn't match stylelint-config-standard rules
- **Fix**: `bun run lint:css` to see errors, then fix. Or `bun x stylelint --fix` for auto-fixable issues.

### YAML/TOML lint fails
- **Symptom**: actionlint or taplo reports errors
- **Cause**: Syntax issues in GitHub Actions workflows or Hugo TOML config
- **Fix**: `bun run lint:yaml` and `bun run lint:toml` for details.

## Agent System Failures

### Agent generates content with wrong voice
- **Symptom**: Generated content uses "we" instead of "I", or doesn't match style docs
- **Cause**: Style documentation not loaded or outdated
- **Fix**: Check `.cody/project/library/style-docs/<type>-style.json` exists and is current. Re-run voice learning if needed.

### Agent validation script not found
- **Symptom**: `Blog validation script not found` error
- **Cause**: Path resolution failed; scripts directory not at expected location
- **Fix**: Check `packages/agents/src/config/paths.ts` — ensure `getAgentPaths()` resolves correctly from monorepo root.

## Dependency Issues

### Bun install fails with resolution errors
- **Symptom**: `bun install` fails to resolve workspace packages
- **Cause**: `workspace:*` references with mismatched package names or missing `shared` package
- **Fix**: Verify package names in each `packages/*/package.json` match workspace references. Run `bun install` from monorepo root.

### Security vulnerability in dependency
- **Symptom**: `bun audit` or Dependabot reports vulnerability
- **Cause**: Transitive dependency has known CVE
- **Fix**: Add to `resolutions` in root `package.json` to pin safe version. Reference: commit `1725551` removed 4 vulnerabilities this way.
