# Tools Layout

## Architecture

Tools are grouped by radar ring (Adopt → Trial → Assess → Hold → Other) in `packages/site/layouts/tools/list.html`. No pagination — all tools render on a single page across sections.

The card partial `packages/site/layouts/partials/components/card-tool-radar.html` renders each tool. The legacy `card-tools.html` is unused by this layout but kept for backward compatibility.

## Gotchas

- **No nested `<main>` inside `{{ define "main" }}`**: `baseof.html` already wraps the block in `<main id="main-content" class="flex-grow container mx-auto px-4 ...">`. Adding another `<main>` causes double container nesting with conflicting padding, making cards appear narrower than they should be.
- **Smart grid for single-item sections**: When a ring section has only 1 tool, the grid uses `grid-cols-1 lg:grid-cols-2` instead of the default 3-column layout. Detected via `{{ if le (len .tools) 1 }}`.
- **Nil ring guard**: `$ring` is nil for tools without `radar.ring` frontmatter. Hugo's `index` panics on nil keys — always wrap in `{{ with $ring }}` before calling `index $ringColors .`
- **Badge rendering**: DaisyUI v5 badges break when placed in flex rows with multi-line titles (fixed height gets crushed). Rule: 1 badge per card, always `shrink-0`, never in the same flex row as the title
- **Ring color mapping** lives in the card partial, not the list layout: `dict "Adopt" "success" "Trial" "info" "Assess" "warning" "Hold" "error"`
- **Adding a new ring**: Update both the color mapping in `card-tool-radar.html` and the `$sections` slice in `list.html`
- **`complement` for "Other"**: `list.html` builds the set of all radar-tagged tools via `union`, then uses `complement` to get tools without radar data — avoids fragile nil checks on nested params
