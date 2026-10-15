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

# Vite emits relative ./assets/* URLs. When Next serves /demo (no trailing slash),
# those resolve to /assets/* and 404. Rewrite to absolute /demo/assets/* paths.
if [[ -f "$DEST/index.html" ]]; then
  python3 - <<'PY'
from pathlib import Path
path = Path("/workspace/public/demo/index.html")
html = path.read_text()
html = html.replace('src="./assets/', 'src="/demo/assets/')
html = html.replace("src='./assets/", "src='/demo/assets/")
html = html.replace('href="./assets/', 'href="/demo/assets/')
html = html.replace("href='./assets/", "href='/demo/assets/")
path.write_text(html)
print("Rewrote asset URLs in public/demo/index.html to /demo/assets/*")
PY
fi

echo "Synced web-demo/dist → public/demo"
