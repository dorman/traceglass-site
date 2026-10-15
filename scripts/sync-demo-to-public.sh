#!/usr/bin/env bash
# Copy the built static WASM demo into public/demo for Next.js / Vercel.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/web-demo/dist"
DEST="$ROOT/public/demo"

if [[ ! -d "$SRC" ]]; then
  echo "Missing $SRC — run: (cd web-demo && npm ci && npm run build)" >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$DEST"
cp -a "$SRC"/. "$DEST"/
echo "Synced web-demo/dist → public/demo"
