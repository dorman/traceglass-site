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

## Environment variables (public marketing site)

Set **only** these for the redesigned site + Notion waitlist:

| Variable | Purpose |
| -------- | ------- |
| `NOTION_TOKEN` | Notion integration token (server-only) |
| `NOTION_WAITLIST_DB_ID` | Notion database ID for waitlist rows |
| `NEXT_PUBLIC_APP_URL` | Canonical public site URL (e.g. `https://traceglass.dev`) |

With these three set, the marketing pages (`/`, `/install`, `/release`,
`/signatures`, `/waitlist`), static `/demo`, and `POST /api/waitlist` work.
Sign-ups are written to Notion (not Postgres).

If Notion vars are missing at runtime, the waitlist API returns **503** with a
friendly message; the rest of the site still builds and renders.

### Notion waitlist database columns

The waitlist route expects these properties (names are case-sensitive):

| Property | Notion type | Notes |
| -------- | ----------- | ----- |
| `Email` | Title | Stored lowercased |
| `Signed up` | Date | ISO timestamp of signup |
| `Source` | Select | Written as `website` |
| `Headline variant` | Select | `A` or `B` |
| `Notes` | Rich text | Left empty on create |

## Optional env vars (not required for the public site)

These enable Polsia-era features that remain in the repo but are **gated** when
unset (auth/admin/Stripe/CMS edits against Postgres):

- `DATABASE_URL` — Prisma / Postgres
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — login / session
- `POLSIA_EMAIL_PROXY_URL`, `POLSIA_OWNER_EMAIL`, `POLSIA_API_*` — email + billing

Without `DATABASE_URL`, marketing page bodies come from the in-repo registry
defaults (not the `MarketingPage` table), site design uses built-in defaults,
startup seed is skipped, and `/api/auth/*` returns 503.

## Database

Only needed if you re-enable Postgres-backed CMS/auth:

```bash
npx prisma migrate deploy
```

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
