# Deployment Testing and Verification

This guide documents how to test and verify the deployment infrastructure,
including validation scripts, workflow integration, and end-to-end testing.

## Testing Strategy

The deployment infrastructure uses a multi-layered testing approach:

1. **Unit Tests** - Individual script functionality
2. **Integration Tests** - Workflow end-to-end verification
3. **Validation Tests** - Pre/post-deployment checks
4. **Manual Tests** - Human verification steps

## Running Tests

### Validation Tests

Test the deployment validation script and all supporting infrastructure:

```bash
bun run test:deployment
```

This runs 27 individual tests covering:

- Script existence and permissions
- Hugo configuration validation
- CSS validation
- Staging configuration
- Build output structure
- Deploy script integration
- Documentation completeness
- Package.json scripts

**Expected Output**: ✅ All tests passed!

### Integration Tests

Test the entire deployment workflow from main → staging → production:

```bash
bun run test:deployment:integration
```

This runs 14 comprehensive integration tests covering:

- Environment branches (staging, production)
- Git remotes configuration
- Deployment scripts
- Validation scripts
- Environment configurations
- Hugo builds
- Documentation completeness
- CI/CD integration
- Error handling
- Rollback capability
- Security considerations
- Monitoring capability

**Expected Output**: ✅ Deployment workflow is properly configured

## Detailed Test Coverage

### Unit Test Suite (test/deployment_validation.test.sh)

| Test                             | Purpose                                  | Validates                      |
| -------------------------------- | ---------------------------------------- | ------------------------------ |
| **Suite 1: Script Verification** |                                          |                                |
| Script exists                    | Verify validate-deployment.sh is present | File existence, executable bit |
| Help output                      | Verify script displays help correctly    | Documentation accuracy         |
| **Suite 2: Tools & Environment** |                                          |                                |
| Required tools                   | Check git, hugo, bun available           | Tool installation              |
| Hugo config validation           | Check production baseURL                 | Configuration correctness      |
| Staging config exists            | Verify staging/hugo.toml                 | Environment-specific config    |
| **Suite 3: Validation Logic**    |                                          |                                |
| CSS validation                   | Detect unprocessed directives            | Build output quality           |
| Security validation              | Check for hardcoded URLs                 | Security practices             |
| Build output                     | Verify public/ structure                 | Hugo build completeness        |
| **Suite 4: Deploy Scripts**      |                                          |                                |
| deploy-staging.sh                | Integration with validation              | Script completeness            |
| deploy-production.sh             | Confirmation prompt, validation          | Safety mechanisms              |
| **Suite 5: Supporting Scripts**  |                                          |                                |
| test-environment.sh              | Help and execution                       | Script functionality           |
| setup-branch-protection.sh       | GitHub CLI integration                   | Automation setup               |
| **Suite 6: Integration**         |                                          |                                |
| package.json scripts             | New deployment scripts present           | Build system integration       |
| Documentation                    | ENVIRONMENT_SETTINGS.md quality          | Documentation completeness     |
| docs/README.md                   | Cross-references                         | Navigation and indexing        |

### Integration Test Suite (test/deployment_workflow.integration.sh)

| Test                 | Purpose                                    | Validates                 |
| -------------------- | ------------------------------------------ | ------------------------- |
| Environment branches | staging, production exist                  | Git workflow setup        |
| Git remotes          | staging, production configured             | Remote setup              |
| Deploy scripts       | All 3 scripts executable                   | Deployment capability     |
| Validation scripts   | Both scripts executable                    | Validation capability     |
| Environment configs  | dev/staging/prod all valid                 | Configuration consistency |
| Hugo builds          | Configs exist for each env                 | Build configuration       |
| Path-based build     | Script functional                          | Build routing             |
| Branch protection    | Setup automation available                 | Access control            |
| Documentation        | All docs present & complete                | Knowledge management      |
| CI/CD integration    | Workflows found                            | GitHub Actions setup      |
| Error handling       | set -e, confirmations, returns             | Safety mechanisms         |
| Rollback capability  | Procedures documented                      | Recovery ability          |
| Security             | Secrets and force push controls documented | Security practices        |
| Monitoring           | Post-deploy checks present                 | Observability             |

## Pre-Deployment Validation

Before deploying to any environment, the deployment scripts automatically run:

```bash
./scripts/validate-deployment.sh pre [environment]
```

**Checks performed**:

- Git state clean (no uncommitted changes)
- Remote is up to date
- Hugo configuration valid
- CSS processed correctly
- No hardcoded URLs
- No exposed secrets

**Example**:

```bash
# Check before deploying to staging
./scripts/validate-deployment.sh pre staging

# Check before deploying to production
./scripts/validate-deployment.sh pre production
```

## Post-Deployment Validation

After deploying to an environment, the deployment scripts run:

```bash
./scripts/validate-deployment.sh post [environment] [url]
```

**Checks performed**:

- Build output structure (public/index.html, public/css/main.css, etc.)
- Image alt text
- Language attributes
- Internal link validity
- Environment-specific settings
- Site accessibility (optional URL check)

**Example**:

```bash
# Check after deploying to staging
./scripts/validate-deployment.sh post staging

# Check after deploying to production with site URL
./scripts/validate-deployment.sh post production https://peterwarnock.com
```

## Environment-Specific Tests

Test configuration for each environment:

```bash
./scripts/test-environment.sh staging
./scripts/test-environment.sh production
```

**Tests performed**:

- Environment configuration validation
- Environment-specific test suite execution
- Environment variables verification
- Branch protection documentation review

## Manual Verification Checklist

### After Deploying to Staging

- [ ] Build succeeded (check GitHub Actions)
- [ ] E2E tests pass: `bun run test:e2e`
- [ ] Accessibility tests pass: `bun run test:accessibility`
- [ ] CSS loads correctly (check browser dev tools)
- [ ] Version footer shows staging version
- [ ] Theme switcher works
- [ ] Mobile menu responsive
- [ ] Analytics disabled or using test account
- [ ] No JavaScript errors in console
- [ ] No 404 errors in network tab

### After Deploying to Production

All staging checks PLUS:

- [ ] Site loads at https://peterwarnock.com
- [ ] Version footer shows production version
- [ ] Analytics tracking enabled (check GA)
- [ ] 301 redirects working (if any)
- [ ] SSL certificate valid
- [ ] DNS pointing correctly
- [ ] Performance metrics acceptable
- [ ] No security warnings
- [ ] Monitoring alerts configured

## Troubleshooting Tests

### Test Failures

If validation tests fail:

1. **Check script permissions**:

   ```bash
   chmod +x scripts/*.sh test/*.sh
   ```

2. **Verify Hugo configuration**:

   ```bash
   hugo config
   cat config/production/hugo.toml
   cat config/staging/hugo.toml
   ```

3. **Check CSS processing**:

   ```bash
   grep -E "@import|@plugin|@tailwind" static/css/main.css
   # Should return nothing
   ```

4. **Verify remotes**:

   ```bash
   git remote -v
   # Should show upstream, staging, production
   ```

5. **Check branches**:
   ```bash
   git branch
   # Should show staging and production
   ```

### Integration Test Failures

If integration tests fail:

1. **Ensure branches exist**:

   ```bash
   git checkout staging
   git checkout production
   git checkout main
   ```

2. **Verify remotes are set up**:

   ```bash
   ./scripts/setup-environments.sh
   ```

3. **Check documentation consistency**:

   ```bash
   grep -l "staging\|production" docs/operations/*.md
   ```

4. **Validate branch protection setup**:
   ```bash
   bun run setup:branch-protection --help
   ```

## Continuous Integration

The test suite runs automatically in CI/CD:

```yaml
# .github/workflows/test.yml (example)
- name: Run deployment tests
  run: bun run test:deployment

- name: Run integration tests
  run: bun run test:deployment:integration
```

These tests:

- Run on every push to main
- Run on pull requests
- Must pass before deployment to staging
- Must pass before deployment to production

## Performance Testing

For deployment workflow performance:

```bash
time bun run test:deployment
time bun run test:deployment:integration
```

Expected times:

- Unit tests: < 10 seconds
- Integration tests: < 30 seconds

## Coverage Reporting

To see test coverage:

```bash
# Run with coverage
bun run test:coverage

# Generate HTML report
bun run test:coverage --report=html
```

## Adding New Tests

To add validation to deployment scripts:

1. **Add function to validate-deployment.sh**:

   ```bash
   validate_new_feature() {
       log_info "Validating new feature..."
       # validation logic
       log_success "Feature validation passed"
   }
   ```

2. **Call function in appropriate check**:

   ```bash
   pre_deployment_check() {
       # ... existing checks ...
       validate_new_feature || return 1
   }
   ```

3. **Add test to test suite**:

   ```bash
   test_new_feature() {
       log_test "Testing new feature validation"
       # test logic
       log_pass "Feature test passed"
   }
   ```

4. **Update documentation**:
   - Add to DEPLOYMENT_TESTING.md test table
   - Update script help text
   - Update related guides

## See Also

- [INFRASTRUCTURE_PROMOTION_WORKFLOW.md](./INFRASTRUCTURE_PROMOTION_WORKFLOW.md) -
  Deployment workflow
- [ENVIRONMENT_SETTINGS.md](./ENVIRONMENT_SETTINGS.md) - Environment
  configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment procedures
