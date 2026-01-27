# Cody Build Command

Build a new Cody PBT version with feature backlog.

## Usage
```
/cody-build v1.2.0-feature
/cody-build v1.2.0-feature "Login page"
```

## Steps
1. Use cody-executor: `:cody version build {VERSION}`
2. Use context-librarian: Compress output
3. Use beads-manager: Create issues from backlog
4. Update .claude/session-state.json

## Result
- Version created at .cody/project/build/versions/{VERSION}/
- Feature backlog generated
- Issues created in beads
- Session state updated

