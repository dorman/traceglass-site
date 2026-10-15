# Vercel settings (do not auto-create)

Configure a Vercel project manually when ready. **Do not** create or deploy from
this agent run.

## Project

| Setting | Value |
| ------- | ----- |
| Team | `edorman11-1433` |
| Framework Preset | **Next.js** |
| Root Directory | `.` (repository root) |
| Build Command | `npm run build` |
| Output Directory | **Leave default** (Next.js — Vercel detects `.next`; do not set `out` or `dist`) |
| Install Command | `npm ci` |
| Node.js Version | `22.x` (or ≥20.18.1 per `package.json` engines) |

## Environment variables

Mirror production secrets from the previous TraceGlass / Polsia deploy (at
minimum):

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (canonical site URL)
- `POLSIA_EMAIL_PROXY_URL`
- `NEXT_PUBLIC_APP_URL`

Optional: `POLSIA_OWNER_EMAIL`, `POLSIA_API_*`, Stripe billing vars if used.

## Database

Run Prisma migrations on the Postgres instance before (or as part of) deploy:

```bash
npx prisma migrate deploy
```

This applies waitlist/auth migrations plus `MarketingPage` / `SiteDesign`. The
app seed (on boot) publishes the default marketing pages.

## WASM demo on Vercel

The in-browser demo is a prebuilt static tree at `public/demo/` (synced from
`web-demo/dist`). Vercel serves it as static files under `/demo/` — **no Rust
toolchain is required on Vercel**.

To refresh the demo after an engine pin bump:

```bash
cd web-demo && npm ci && npm run build
../scripts/sync-demo-to-public.sh
```

Commit the updated `web-demo/pkg/` and `public/demo/` artifacts.
