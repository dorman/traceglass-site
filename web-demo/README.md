# TraceGlass browser demo (portable)

Self-contained static demo that runs the TraceGlass signature scanner in the
browser via WebAssembly. Lives in `dorman/traceglass-site`.

## Privacy claim (honest)

- Your log is read with the **File API** and scanned in WASM on the main thread.
- Nothing is uploaded. Closing or refreshing the page discards everything.
- CSP allows `connect-src 'self'` only so the page can fetch the local `.wasm`
  asset at startup. Scanning itself issues **no** network requests (asserted in
  Playwright). No third-party CDN scripts.

## What's included / excluded

| Included | Excluded (native-only) |
| -------- | ---------------------- |
| Built-in signature library | Filesystem / directory walks |
| Lenses (`incident-reliability`, etc.) | On-disk zip extraction |
| Plain / JSON / NDJSON / CSV line scan | Interactive TUI |
| In-memory ZIP support-bundle scan | Watchlist / config persistence |
| Planted-incident sample replay | |

## Develop

From the **site repo root**:

```bash
bash scripts/fetch-engine.sh   # sparse-clone pinned dorman/traceglass engine
cd web-demo
npm install
npx playwright install chromium   # once
npm run dev                       # builds wasm then Vite
```

`pkg/` is committed so you can skip Rust and run `npx vite` against the
vendored artifacts. Rebuild with `npm run build:wasm` when `scripts/engine.pin`
changes.

## Build / test

```bash
npm run build                     # wasm-pack + vite build → dist/
npm test                          # Playwright against preview server
```

Sync into the Next.js app (served at `/demo/`):

```bash
npm run build
../scripts/sync-demo-to-public.sh
```

## Layout

- `../engine/` — fetched Rust crate + `wasm/` bindings (gitignored)
- `../scripts/engine.pin` — public repo URL + SHA
- `pkg/` — generated JS/WASM (vendored for deploy)
- `public/samples/` — planted-incident demo logs
