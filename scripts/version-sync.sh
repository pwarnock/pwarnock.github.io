#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_PKG="$ROOT_DIR/package.json"

VERSION=$(jq -r '.version' "$ROOT_PKG")

# Workspace package.json files
for pkg in "$ROOT_DIR"/packages/*/package.json "$ROOT_DIR/shared/package.json"; do
  [ -f "$pkg" ] || continue
  jq --arg v "$VERSION" '.version = $v' "$pkg" > "$pkg.tmp" && mv "$pkg.tmp" "$pkg"
  printf 'synced %s -> %s\n' "$pkg" "$VERSION"
done

# hugo.toml version field
HUGO_TOML="$ROOT_DIR/packages/site/hugo.toml"
sed -i.bak -E "s/^([[:space:]]*version = \")([0-9]+\.[0-9]+\.[0-9]+)(\")/\1$VERSION\3/" "$HUGO_TOML"
rm -f "$HUGO_TOML.bak"
printf 'synced %s -> %s\n' "$HUGO_TOML" "$VERSION"

printf 'version sync complete: %s\n' "$VERSION"
