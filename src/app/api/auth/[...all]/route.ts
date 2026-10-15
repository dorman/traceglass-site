// @polsia:framework-owned - DO NOT EDIT. Code installed by polsia/modules/better-auth@0.2.0. Drift = commit rejected.
//
// better-auth catch-all route handler. Mounts EVERY better-auth endpoint
// (sign-in, sign-up, sign-out, session, callbacks, ...) under /api/auth/*.
// Lives under /api, which proxy.ts's matcher excludes (no CSP/nonce, not proxied).
//
// toNextJsHandler returns native App Router GET/POST handlers — NO Server Actions,
// so the 'nextCookies()' plugin is intentionally absent: cookies are set on the
// route handler's own NextResponse, which Next.js does not discard.
//
// Marketing-only deploys may omit BETTER_AUTH_* / DATABASE_URL; in that case
// every auth endpoint returns 503 instead of initializing a half-configured
// login flow.

import 'server-only';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAuthConfigured, isDatabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

const handlers = toNextJsHandler(auth);

function authUnavailable() {
  return NextResponse.json(
    { error: 'Authentication is not configured on this deployment.' },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  if (!isAuthConfigured() || !isDatabaseConfigured()) {
    return authUnavailable();
  }
  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (!isAuthConfigured() || !isDatabaseConfigured()) {
    return authUnavailable();
  }
  return handlers.POST(request);
}
