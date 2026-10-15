// @polsia:user-owned
//
// POST /api/contact — public contact form that appends a row to the Notion
// contact DB. Lives under /api, which proxy.ts's matcher excludes.
//
// The POST is intentionally PUBLIC. Do NOT log message contents or emails —
// those are PII / may contain sensitive reports.

import 'server-only';
import { NextResponse } from 'next/server';
import { createContactEntry, getNotionContactConfig } from '@/lib/contact/notion';
import { allowContactRequest, clientIpFromRequest } from '@/lib/contact/rate-limit';
import { contactSchema } from '@/lib/contact/schema';

export const dynamic = 'force-dynamic';

const UNAVAILABLE = 'Contact is temporarily unavailable. Please try again later.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

type ContactBody = {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
  consent?: unknown;
  /** Honeypot — real users leave this empty. */
  company?: unknown;
};

function fieldErrorsResponse(errors: Record<string, string>, status: number) {
  return NextResponse.json({ errors }, { status });
}

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  if (!allowContactRequest(ip)) {
    return fieldErrorsResponse({ form: 'Too many requests. Please try again later.' }, 429);
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return fieldErrorsResponse({ form: 'Invalid JSON body.' }, 400);
  }

  // Honeypot filled → pretend success, do not store.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Consent is implied by submitting the form; always treat as true server-side.
  const result = contactSchema.safeParse({
    name: typeof body.name === 'string' ? body.name : undefined,
    email: body.email,
    topic: body.topic,
    message: body.message,
    consent: true,
  });
  if (!result.success) {
    const flattened = result.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const field of ['name', 'email', 'topic', 'message'] as const) {
      const message = flattened[field]?.[0];
      if (message) errors[field] = message;
    }
    return fieldErrorsResponse(errors, 400);
  }

  const email = result.data.email.trim().toLowerCase();
  const config = getNotionContactConfig();
  if (!config.ok) {
    return fieldErrorsResponse({ form: UNAVAILABLE }, 503);
  }

  try {
    await createContactEntry(config.token, config.databaseId, {
      name: result.data.name,
      email,
      topic: result.data.topic,
      message: result.data.message,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return fieldErrorsResponse({ form: GENERIC_ERROR }, 502);
  }
}
