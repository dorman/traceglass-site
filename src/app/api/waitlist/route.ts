// @polsia:user-owned
//
// POST /api/waitlist — public signup that appends a row to the Notion waitlist DB.
// Lives under /api, which proxy.ts's matcher excludes (no CSP/nonce, not proxied).
//
// The POST is intentionally PUBLIC — anyone can join the waitlist.
// Do NOT add a public GET that lists signups: the emails are PII.

import 'server-only';
import { NextResponse } from 'next/server';
import {
  createWaitlistEntry,
  findWaitlistEmail,
  getNotionWaitlistConfig,
  type HeadlineVariant,
} from '@/lib/waitlist/notion';
import { allowWaitlistRequest, clientIpFromRequest } from '@/lib/waitlist/rate-limit';
import { waitlistSchema } from '@/lib/waitlist/schema';

export const dynamic = 'force-dynamic';

const UNAVAILABLE = 'Waitlist signup is temporarily unavailable. Please try again later.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

type WaitlistBody = {
  email?: unknown;
  consent?: unknown;
  headlineVariant?: unknown;
  /** Honeypot — real users leave this empty. */
  company?: unknown;
};

function normalizeVariant(value: unknown): HeadlineVariant {
  return value === 'B' ? 'B' : 'A';
}

function fieldErrorsResponse(errors: Record<string, string>, status: number) {
  return NextResponse.json({ errors }, { status });
}

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  if (!allowWaitlistRequest(ip)) {
    return fieldErrorsResponse({ email: 'Too many requests. Please try again later.' }, 429);
  }

  let body: WaitlistBody;
  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return fieldErrorsResponse({ email: 'Invalid JSON body.' }, 400);
  }

  // Honeypot filled → pretend success, do not store.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const result = waitlistSchema.safeParse({ email: body.email, consent: body.consent });
  if (!result.success) {
    const flattened = result.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const field of ['email', 'consent'] as const) {
      const message = flattened[field]?.[0];
      if (message) errors[field] = message;
    }
    return fieldErrorsResponse(errors, 400);
  }

  const email = result.data.email.trim().toLowerCase();
  const headlineVariant = normalizeVariant(body.headlineVariant);

  const config = getNotionWaitlistConfig();
  if (!config.ok) {
    return fieldErrorsResponse({ email: UNAVAILABLE }, 503);
  }

  try {
    const exists = await findWaitlistEmail(config.token, config.databaseId, email);
    if (exists) {
      return fieldErrorsResponse({ email: "You're already on the waitlist." }, 409);
    }

    await createWaitlistEntry(config.token, config.databaseId, email, headlineVariant);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return fieldErrorsResponse({ email: GENERIC_ERROR }, 502);
  }
}
