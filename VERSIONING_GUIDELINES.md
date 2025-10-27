# Versioning Guidelines

This document establishes versioning standards and conventions for the Peter Warnock portfolio website project.

## Versioning Strategy

### Semantic Versioning (SemVer)

We follow strict semantic versioning: `MAJOR.MINOR.PATCH`

#### Format
```
v[MAJOR].[MINOR].[PATCH]-[NAME]
```

#### Components
- **MAJOR**: Breaking changes, major redesigns, technology stack changes
- **MINOR**: New features, significant content additions, UI improvements  
- **PATCH**: Bug fixes, content updates, minor improvements
- **NAME**: Descriptive identifier (max 30 chars, lowercase, dashes only)

### Examples
```
v0.8.2-tailwind-v4-upgrade
v0.9.0-design-system-overhaul
v1.0.0-production-launch
v1.1.0-blog-enhancements
v1.1.1-contact-form-fix
```

## Version Categories

### Major Releases (X.0.0)

**Criteria:**
- Breaking changes to existing functionality
- Major redesign or rebranding
- Technology stack changes
- Significant architectural changes
- API changes (if applicable)

**Process:**
- Extensive testing and validation
- Migration documentation
- Rollback planning
- Stakeholder approval

**Examples:**
- `v1.0.0-initial-launch`
- `v2.0.0-redesign-and-cms-integration`

### Minor Releases (X.Y.0)

**Criteria:**
- New features or functionality
- Significant content additions
- UI/UX improvements
- New sections or pages
- Integration with new services

**Process:**
- Feature testing
- Content review
- Performance validation
- Documentation updates

**Examples:**
- `v0.8.0-blog-system-integration`
- `v0.9.0-portfolio-enhancements`
- `v1.2.0-search-functionality`

### Patch Releases (X.Y.Z)

**Criteria:**
- Bug fixes
- Content updates
- Minor improvements
- Security fixes
- Performance optimizations
- Dependency updates

**Process:**
- Targeted testing
- Regression testing
- Quick deployment
- Documentation updates

**Examples:**
- `v0.8.1-typo-corrections`
- `v0.8.2-security-patch`
- `v1.1.1-mobile-menu-fix`

## Naming Conventions

### Version Names

**Rules:**
- Maximum 30 characters
- Lowercase letters only
- Hyphens for spaces
- Descriptive and meaningful
- No special characters except hyphens

**Good Examples:**
```
v0.8.2-tailwind-v4-upgrade
v0.9.0-design-system-overhaul
v1.0.0-production-launch
v1.1.0-blog-enhancements
v1.2.0-contact-form
```

**Bad Examples:**
```
v0.8.2-Tailwind_V4_Upgrade     # Uppercase and underscores
v0.9.0-Design System Overhaul   # Spaces
v1.0.0-Production@Launch        # Special character
v1.1.0-blog enhancements        # Space
v1.2.0-contact-form!!!         # Special characters
```

### Branch Naming

**Feature Branches:**
```
feature/[version-name]
feature/blog-system-integration
feature/design-system-overhaul
feature/contact-form
```

**Release Branches:**
```
release/vX.Y.Z
release/v0.8.2
release/v1.0.0
```

**Hotfix Branches:**
```
hotfix/vX.Y.Z+1-[description]
hotfix/v0.8.3-critical-security-fix
hotfix/v1.0.1-mobile-menu-fix
```

## Version Incrementation

### Decision Tree

```
Is this a breaking change?
├─ Yes → Increment MAJOR version, reset MINOR and PATCH to 0
└─ No
   └─ Is this a new feature or significant addition?
      ├─ Yes → Increment MINOR version, reset PATCH to 0
      └─ No
         └─ Is this a bug fix or minor improvement?
            ├─ Yes → Increment PATCH version
            └─ No → Consider if it needs versioning at all
```

### Examples

| Current | Change Type | New Version |
|---------|-------------|--------------|
| v0.8.2 | Bug fix | v0.8.3 |
| v0.8.2 | New feature | v0.9.0 |
| v0.8.2 | Breaking change | v1.0.0 |
| v1.0.0 | Bug fix | v1.0.1 |
| v1.0.0 | New feature | v1.1.0 |
| v1.0.0 | Breaking change | v2.0.0 |

## Release Planning

### Version Roadmap

#### Planning Process
1. **Quarterly Planning**: Define major and minor releases
2. **Monthly Review**: Adjust roadmap based on progress
3. **Sprint Planning**: Break down features into tasks
4. **Release Readiness**: Validate completion criteria

#### Version Categories
- **Current**: Latest stable release
- **Development**: Features in progress
- **Planned**: Roadmap items
- **Backlog**: Future considerations

### Release Cadence

#### Major Releases
- **Frequency**: Every 6-12 months
- **Planning**: 3-6 months in advance
- **Testing**: Extensive validation period
- **Communication**: Early stakeholder notification

#### Minor Releases
- **Frequency**: Every 1-3 months
- **Planning**: 1-2 months in advance
- **Testing**: Standard validation process
- **Communication**: Regular progress updates

#### Patch Releases
- **Frequency**: As needed
- **Planning**: As issues arise
- **Testing**: Targeted validation
- **Communication**: Issue-specific notifications

## Version Files and Configuration

### Files to Update

#### hugo.toml
```toml
baseURL = "https://pwarnock.github.io"
languageCode = "en-us"
title = "Peter Warnock"
version = "0.8.2"  # Update this
```

#### package.json
```json
{
  "name": "pwarnock.github.io",
  "version": "0.8.2",  # Update this
  "description": "Peter Warnock Portfolio Website"
}
```

#### Version Documentation
- `CHANGELOG.md`: Release notes and history
- `RELEASE_MANAGEMENT.md`: Process documentation
- Version-specific release notes

### Git Tags

#### Tag Creation
```bash
# Create annotated tag
git tag -a v0.8.2 -m "Release v0.8.2: Tailwind v4 upgrade and security fixes"

# Push tags to remote
git push origin v0.8.2
```

#### Tag Format
- **Annotated tags**: Include release notes
- **Semantic naming**: Follow versioning convention
- **Consistent format**: Always use `v` prefix

## Communication and Documentation

### Release Notes Template

```markdown
# Release v0.8.2 - Tailwind v4 Upgrade

## 🚀 What's New
- Upgraded to Tailwind CSS v4.1.16
- Enhanced security headers
- Improved accessibility features

## 🐛 Bug Fixes
- Fixed mobile navigation issues
- Resolved CSS loading problems
- Corrected meta tag formatting

## 🔧 Improvements
- Better performance optimization
- Enhanced mobile responsiveness
- Improved color contrast ratios

## 📚 Documentation
- Updated development documentation
- Added deployment guides
- Improved code comments

## 🛠️ Technical Changes
- Updated PostCSS configuration
- Migrated to new CSS pipeline
- Enhanced build process

## 🚦 Deployment
- **Released**: October 27, 2025
- **Deployed to**: GitHub Pages
- **Rollback available**: v0.8.1
```

### Communication Channels

#### Internal Team
- **GitHub Releases**: Primary communication channel
- **Team Chat**: Real-time updates and discussions
- **Email**: Formal announcements for major releases

#### External (if applicable)
- **Blog Posts**: Major release announcements
- **Social Media**: Brief updates and highlights
- **Newsletter**: Detailed release information

## Quality Assurance

### Version Validation

#### Pre-Release Checklist
- [ ] Version numbers updated in all files
- [ ] Release notes prepared
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Performance validated
- [ ] Security checks completed

#### Post-Release Validation
- [ ] Site deployed successfully
- [ ] All pages loading correctly
- [ ] No broken links
- [ ] Performance metrics acceptable
- [ ] Accessibility standards met
- [ ] Mobile functionality verified

### Testing Strategy

#### Major Releases
- Full regression testing
- Cross-browser compatibility
- Mobile device testing
- Performance validation
- Security assessment
- Accessibility audit

#### Minor Releases
- Feature-specific testing
- Impact assessment
- Performance validation
- Basic accessibility check

#### Patch Releases
- Targeted bug validation
- Regression testing
- Basic functionality check

## Tools and Automation

### Version Management Tools

#### Git
- Version tagging and branching
- Release management
- Rollback capabilities

#### GitHub
- Release creation and management
- Automated deployment
- Issue tracking

#### npm
- Package versioning
- Dependency management
- Build automation

### Automation Scripts

#### Version Update Script
```bash
#!/bin/bash
# update-version.sh

NEW_VERSION=$1

# Update hugo.toml
sed -i.bak "s/version = \".*\"/version = \"$NEW_VERSION\"/" hugo.toml

# Update package.json
npm version $NEW_VERSION --no-git-tag-version

# Commit changes
git add hugo.toml package.json
git commit -m "chore: update version to $NEW_VERSION"

echo "Version updated to $NEW_VERSION"
```

#### Release Script
```bash
#!/bin/bash
# release.sh

VERSION=$1
MESSAGE=$2

# Create release branch
git checkout -b release/$VERSION

# Update version
./update-version.sh $VERSION

# Run tests
npm test
npm run build

# Merge to main
git checkout main
git merge release/$VERSION

# Create tag
git tag -a $VERSION -m "$MESSAGE"

# Push changes
git push origin main
git push origin $VERSION

# Cleanup
git branch -d release/$VERSION
```

## Best Practices

### Development Practices

#### Version Discipline
- Always update version numbers for releases
- Use semantic versioning consistently
- Maintain clear release notes
- Tag releases properly

#### Branch Management
- Use feature branches for development
- Keep main branch stable
- Use release branches for stabilization
- Delete merged branches promptly

#### Documentation
- Keep documentation current
- Document breaking changes
- Maintain clear changelogs
- Provide migration guides

### Release Practices

#### Planning
- Plan releases in advance
- Coordinate with stakeholders
- Schedule adequate testing time
- Prepare rollback procedures

#### Execution
- Follow release checklist
- Test thoroughly before deployment
- Monitor post-deployment
- Communicate clearly

#### Follow-up
- Validate release success
- Monitor for issues
- Document lessons learned
- Update processes as needed

## Troubleshooting

### Common Issues

#### Version Conflicts
- **Problem**: Different files have different versions
- **Solution**: Use version update script
- **Prevention**: Always update all version references

#### Tag Issues
- **Problem**: Tags not pushed to remote
- **Solution**: Push tags explicitly with `git push --tags`
- **Prevention**: Include tag push in release process

#### Rollback Complexity
- **Problem**: Difficult to rollback to previous version
- **Solution**: Maintain clear tagging strategy
- **Prevention**: Test rollback procedures regularly

### Emergency Procedures

#### Hotfix Process
1. Create hotfix branch from latest stable tag
2. Implement fix with minimal changes
3. Test thoroughly
4. Merge to main and tag new version
5. Deploy immediately
6. Communicate to stakeholders

#### Rollback Process
1. Identify previous stable version
2. Checkout and deploy previous version
3. Validate functionality
4. Communicate to stakeholders
5. Investigate root cause
6. Plan proper fix

This versioning system ensures consistent, predictable releases while maintaining high quality and reliability standards.