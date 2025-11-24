# Data Mapping Analysis: Current SDD → PBT Structure

## Version History Mapping

### Current Structure (.cody/project/versions/)

```
v0.10.3-hero-standardization/
├── release-notes.md
├── retrospective.md
└── version.md

v0.12.0-blog-layout-optimization/
├── release-notes.md
├── retrospective.md
└── version.md

v0.14.0-infrastructure-overhaul/
├── release-notes.md
├── retrospective.md
└── version.md

v0.15.0-deployment-workflows/
└── version.md

v0.16.0-hero-carousel-system/
├── release-notes.md
├── retrospective.md
└── version.md

v0.4.0-testing/
├── design.md
├── release-notes.md
├── retrospective.md
├── tasklist.md
└── version.md

v0.6.0-hero-recreation/
├── design.md
├── release-notes.md
├── retrospective.md
├── tasklist.md
└── version.md

v0.7.0-tools-section/
├── design.md
├── release-notes.md
└── retrospective.md

v0.8.0-upstream-integration/
├── design.md
├── release-notes.md
├── retrospective.md
├── tasklist.md
└── version.md

v0.8.1-bug-fixes/
├── design.md
├── release-notes.md
├── retrospective.md
├── tasklist.md
└── version.md

v0.8.2/
└── release-notes.md

v0.9.0-design-system/
├── design.md
├── migration-plan.md
├── tasklist.md
└── version.md

v0.9.1-bugfixes/
├── design.md
├── tasklist.md
└── version.md

v0.9.2-mobile-content/
├── design.md
├── tasklist.md
└── version.md

v0.9.3-security/
├── design.md
├── tasklist.md
└── version.md
```

### Target Structure (.cody/project/build/versions/)

```
v0.10.3-hero-standardization/
├── design.md (create from version.md)
├── retrospective.md (keep)
├── tasklist.md (create from release-notes.md)
└── version.md (keep)

[... similar pattern for all versions]
```

## Migration Rules

### 1. File Mapping

| Current File        | Target File        | Action    |
| ------------------- | ------------------ | --------- |
| `version.md`        | `version.md`       | Keep      |
| `release-notes.md`  | `tasklist.md`      | Transform |
| `retrospective.md`  | `retrospective.md` | Keep      |
| `design.md`         | `design.md`        | Keep      |
| `migration-plan.md` | `design.md`        | Merge     |

### 2. Content Transformation

#### release-notes.md → tasklist.md

```markdown
# Current release-notes.md structure

## Version v0.10.3-hero-standardization

### Changes

- Feature A implemented
- Bug B fixed

# Target tasklist.md structure

# Task List: v0.10.3-hero-standardization

## Completed Tasks

- [x] Implement Feature A
- [x] Fix Bug B
```

### 3. Missing Files Handling

- Versions without `design.md`: Create from `version.md` content
- Versions without `tasklist.md`: Create from `release-notes.md`
- Versions with incomplete data: Mark as "Legacy Version"

## Discovery Documents Mapping

### Current Structure (.cody/project/discovery/)

```
cody-demo-15-spacing-audit.md
cody-demo-16-mobile-nav-architecture.md
cody-demo-17-accessibility-audit.md
cody-demo-18-component-audit.md
```

### Target Structure (.cody/project/library/docs/)

```
audits/
├── spacing-audit.md
├── mobile-nav-architecture.md
├── accessibility-audit.md
└── component-audit.md
```

## Planning Documents Compatibility

### Current Structure (.cody/project/plan/)

```
discovery.md
prd.md
plan.md
```

### Target Structure (.cody/project/plan/)

```
discovery.md (compatible)
prd.md (compatible)
plan.md (compatible)
```

## Template Mapping

### Current Templates (.cody/config/templates/)

```
tool-content-template.md
```

### Target Templates (.cody/config/templates/)

```
plan/
├── discovery.md
├── prd.md
└── plan.md

build/
├── feature-backlog.md
├── release-notes.md
└── version/
    ├── design.md
    ├── retrospective.md
    └── tasklist.md
```

## Command Mapping

### Current Commands

- `help.md`
- `plan.md`
- `build.md`
- `refresh.md`
- `refresh-update.md`
- `relearn.md`
- `upgrade.md`

### New Commands to Add

- `version-add.md`
- `version-build.md`
- `assets-list.md`

## Custom Integration Preservation

### AGENTS.md

- Keep as project-specific documentation
- Update command references
- Add PBT-specific guidelines

### bd Integration

- Maintain current functionality
- Update any hardcoded paths
- Preserve JSONL sync

### Custom Scripts

- `agent-init.sh` - Update for PBT
- `backup-cody.sh` - Keep
- `check-cody-health.sh` - Update

## Migration Script Outline

```bash
#!/bin/bash
# Data migration script

# 1. Create new directory structure
mkdir -p .cody/project/build/versions
mkdir -p .cody/project/library/docs/audits

# 2. Move versions to build/versions/
mv .cody/project/versions/* .cody/project/build/versions/

# 3. Transform discovery documents
mv .cody/project/discovery/* .cody/project/library/docs/audits/

# 4. Create missing files for each version
for version in .cody/project/build/versions/*/; do
    if [ ! -f "$version/design.md" ]; then
        create_design_from_version "$version"
    fi
    if [ ! -f "$version/tasklist.md" ]; then
        create_tasklist_from_release_notes "$version"
    fi
done

# 5. Update templates
cp -r cody-pbt-source/.cody/config/templates/* .cody/config/templates/
```

## Validation Checklist

- [ ] All 14+ versions migrated
- [ ] No data loss in version history
- [ ] All discovery documents accessible
- [ ] Planning documents functional
- [ ] Commands working correctly
- [ ] Templates updated
- [ ] Custom integrations preserved
