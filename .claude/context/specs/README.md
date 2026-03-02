# Subsystem Specs

On-demand detailed documentation for individual subsystems.
Generated when deep context is needed for a specific area.

## Usage

When working on a subsystem and need more context than the subsystem-map provides,
generate a spec file by analyzing the subsystem's source code, tests, and dependencies.

## Naming Convention

`<subsystem-name>.md` — e.g., `agents.md`, `release-system.md`, `qa-tools.md`

## Spec Template

Each spec should cover:
1. **Purpose** — What this subsystem does and why
2. **API Surface** — Key exports, interfaces, entry points
3. **Internal Architecture** — How components interact
4. **Data Flow** — Input to processing to output
5. **Configuration** — Settings, environment variables
6. **Testing** — How to test, what's covered
7. **Failure Modes** — Subsystem-specific failure patterns
8. **Dependencies** — What it depends on and what depends on it
