# Cody PBT Migration Plan

## Executive Summary

Migration from Cody SDD Framework v1.1.3 to Cody PBT v1.2.0 with zero data loss
and preserved project history.

## Current State Analysis

### Existing Framework (v1.1.3)

- **Structure**: `.cody/` with custom configurations
- **Project Data**: 14+ completed versions, rich planning history
- **Customizations**: AGENTS.md, bd integration, custom scripts
- **Commands**: Limited set (`:cody help`, `:cody plan`, etc.)

### Target Framework (Cody PBT v1.2.0)

- **Structure**: Enhanced `.cody/` with better organization
- **Features**: Two-phase development (Plan → Build), improved templates
- **Commands**: Expanded command set with better AI integration
- **Active Development**: Maintained project with community support

## Migration Strategy

### Phase 1: ✅ COMPLETED - Data Preservation

- **Backup Created**: `.cody.backup.20251124_094441/`
- **bd Issues Exported**: 85 issues preserved in JSON format
- **Verification**: All critical data backed up successfully

### Phase 2: Structure Mapping

#### Directory Structure Comparison

| Current (SDD)              | Target (PBT)                    | Migration Action |
| -------------------------- | ------------------------------- | ---------------- |
| `.cody/project/plan/`      | `.cody/project/plan/`           | ✅ Compatible    |
| `.cody/project/versions/`  | `.cody/project/build/versions/` | 🔄 Migrate       |
| `.cody/project/discovery/` | `.cody/project/library/`        | 🔄 Reorganize    |
| `.cody/config/commands/`   | `.cody/config/commands/`        | ✅ Update        |
| `.cody/config/templates/`  | `.cody/config/templates/`       | ✅ Enhance       |

#### Data Migration Plan

1. **Planning Documents** (No Change Needed)
   - `discovery.md` → `discovery.md` (compatible)
   - `prd.md` → `prd.md` (compatible)
   - `plan.md` → `plan.md` (compatible)

2. **Version History** (Structure Change)
   - Move all version folders to `build/versions/`
   - Preserve existing naming convention initially
   - Gradually adopt new `v[major.minor.patch]-[name]` format

3. **Discovery Documents** (Reorganization)
   - Move audit documents to `library/docs/`
   - Maintain accessibility to historical context

### Phase 3: Command Migration

#### Command Mapping

| Current Command | PBT Equivalent        | Action        |
| --------------- | --------------------- | ------------- |
| `:cody help`    | `:cody help`          | ✅ Compatible |
| `:cody plan`    | `:cody plan`          | ✅ Compatible |
| `:cody build`   | `:cody build`         | ✅ Enhanced   |
| `:cody refresh` | `:cody refresh`       | ✅ Compatible |
| `:cody upgrade` | `:cody upgrade`       | ✅ Enhanced   |
| N/A             | `:cody version build` | 🆕 New        |
| N/A             | `:cody version add`   | 🆕 New        |
| N/A             | `:cody assets list`   | 🆕 New        |

### Phase 4: Template Migration

#### Template Enhancements

1. **Plan Phase Templates** (Compatible)
   - Discovery template enhancements
   - PRD template improvements
   - Plan template refinements

2. **Build Phase Templates** (New Structure)
   - Feature backlog template
   - Version-specific templates (design.md, tasklist.md, retrospective.md)
   - Release notes template

### Phase 5: Custom Integration Preservation

#### Critical Customizations to Preserve

1. **AGENTS.md Documentation**
   - Maintain as project-specific guide
   - Update with new PBT commands
   - Preserve bd integration workflows

2. **bd (beads) Integration**
   - Continue issue tracking with bd
   - Maintain JSONL sync functionality
   - Update any hardcoded command references

3. **Custom Scripts**
   - `agent-init.sh` - Update for PBT compatibility
   - `backup-cody.sh` - Maintain backup functionality
   - `check-cody-health.sh` - Update health checks

## Implementation Timeline

### Week 1: Preparation ✅

- [x] Create comprehensive backup
- [x] Export bd issues
- [x] Document migration plan

### Week 2: Testing Environment

- [ ] Create isolated test copy
- [ ] Install PBT in test environment
- [ ] Test data migration scripts
- [ ] Validate command compatibility

### Week 3: Migration Execution

- [ ] Install PBT alongside existing framework
- [ ] Migrate version data to new structure
- [ ] Update templates and commands
- [ ] Test all functionality

### Week 4: Finalization

- [ ] Remove old framework
- [ ] Update documentation
- [ ] Train on new commands
- [ ] Monitor for issues

## Risk Mitigation

### High-Risk Areas

1. **Version History Loss** - Mitigated by comprehensive backup
2. **Command Incompatibility** - Mitigated by testing environment
3. **Template Corruption** - Mitigated by gradual migration

### Rollback Plan

1. **Immediate Rollback**: Restore from `.cody.backup.20251124_094441/`
2. **Partial Rollback**: Selective restoration of specific components
3. **Forward Recovery**: Fix issues in-place without rollback

## Success Criteria

### Functional Requirements

- [ ] All existing version history accessible
- [ ] All commands working correctly
- [ ] bd integration maintained
- [ ] Custom scripts functional

### Quality Requirements

- [ ] No data loss
- [ ] Improved functionality
- [ ] Better documentation
- [ ] Enhanced AI integration

## Next Steps

1. **Immediate**: Proceed to testing environment setup
2. **Short-term**: Execute migration in isolated copy
3. **Medium-term**: Full production migration
4. **Long-term**: Optimize with new PBT features

## Conclusion

This migration plan provides a structured, low-risk approach to upgrading from
Cody SDD Framework to Cody PBT while preserving all valuable project history and
customizations. The phased approach allows for testing and validation at each
step, ensuring a successful transition with enhanced capabilities.
