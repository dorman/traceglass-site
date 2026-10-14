#!/usr/bin/env bash
# Sparse-checkout the TraceGlass Rust crate (engine) at the pinned commit.
# The engine is not committed to this marketing repo — see docs/vercel.md and
# the PR description for why we pin + fetch instead of a submodule.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/engine.pin"

DEST="${ENGINE_DIR:-$ROOT/engine}"
CACHE="${ENGINE_CACHE:-$ROOT/.cache/traceglass-engine}"

if [[ -f "$DEST/wasm/Cargo.toml" ]]; then
  current="$(git -C "$CACHE" rev-parse HEAD 2>/dev/null || true)"
  if [[ "$current" == "$REPO_SHA" ]]; then
    echo "Engine already at $REPO_SHA → $DEST"
    exit 0
  fi
fi

echo "Fetching $REPO_URL @$REPO_SHA (sparse: $SPARSE_PATH)…"
rm -rf "$CACHE"
mkdir -p "$(dirname "$CACHE")"
git clone --filter=blob:none --sparse "$REPO_URL" "$CACHE"
git -C "$CACHE" sparse-checkout set "$SPARSE_PATH"
git -C "$CACHE" fetch --depth 1 origin "$REPO_SHA"
git -C "$CACHE" checkout --force "$REPO_SHA"

rm -rf "$DEST"
cp -a "$CACHE/$SPARSE_PATH" "$DEST"
echo "Engine ready at $DEST ($(git -C "$CACHE" rev-parse --short HEAD))"
