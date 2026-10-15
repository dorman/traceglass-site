# TraceGlass Site

Marketing site and in-browser WASM demo for
[TraceGlass](https://github.com/dorman/traceglass) — a local-first terminal tool
for opening diagnostic logs, ranking signals, and reviewing source evidence
without uploading log content.

## What's in this repo

| Path | Purpose |
| ---- | ------- |
| `src/`, `public/`, `prisma/`, … | Next.js marketing app (Signal theme, logo, sample-log terminal) |
| `web-demo/` | Portable client-side WASM scanner (no upload) |
| `public/demo/` | Prebuilt static demo served at `/demo/` |
| `signatures/` | Versioned signature catalog snapshots for the site API |
| `scripts/engine.pin` | Pinned `dorman/traceglass` commit for WASM rebuilds |

The Rust CLI engine stays in `dorman/traceglass`. This repo **fetches** a pinned
revision to rebuild WASM (see [Engine strategy](#engine--wasm-strategy)); it does
not vendor the full engine source tree.

## Develop (Next.js site)

```bash
cp .env.example .env.local   # edit secrets as needed
npm ci
npm run dev                  # http://localhost:3000
```

Useful scripts: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

Set `SKIP_ENV_VALIDATION=1` for lint/typecheck/unit tests without a database.

## Develop (WASM demo)

Requires Rust ≥1.85, `wasm-pack`, and Node 22:

```bash
bash scripts/fetch-engine.sh
cd web-demo
npm ci
npx playwright install chromium   # once
npm run dev                       # builds wasm, then Vite
```

Or use the vendored `web-demo/pkg/` without Rust:

```bash
cd web-demo && npm ci && npx vite
```

Playwright: `cd web-demo && npm test` (rebuilds wasm first).

After rebuilding the demo for production static hosting:

```bash
cd web-demo && npm run build
../scripts/sync-demo-to-public.sh
```

## Engine / WASM strategy

**Choice: vendored prebuilt WASM package + build script that sparse-clones a
pinned public commit** (not a git submodule).

Why:

1. **Submodule of `dorman/traceglass`** would pull the whole monorepo (including
   the old in-repo site) and, until PR
   [#54](https://github.com/dorman/traceglass/pull/54) merges, would have to
   track a draft branch tip.
2. **Build-from-main in CI alone** cannot work until `#54` lands — `main` does
   not yet expose the `wasm-scan` surface.
3. **Vendored `web-demo/pkg/`** lets Vercel and casual clones serve `/demo/`
   with **no Rust toolchain**. `scripts/fetch-engine.sh` +
   `web-demo/scripts/build-wasm.sh` rebuild from
   `scripts/engine.pin` (currently the `#54` tip SHA) whenever the pin moves.
   After `#54` merges, retarget the pin to `main` (or a release tag).

## License

MIT — Copyright (c) 2026 TraceGlass. See [LICENSE](./LICENSE).

## Deploy

Do not create a Vercel project from this README. When you are ready, use the
settings in [docs/vercel.md](./docs/vercel.md) (team `edorman11-1433`, Next.js
framework, `npm run build`, default Next output).
