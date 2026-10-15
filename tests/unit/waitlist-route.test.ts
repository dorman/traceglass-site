/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const notionState = vi.hoisted(() => ({
  queryResults: [] as unknown[],
  queryOk: true,
  createOk: true,
  createCalls: 0,
  queryCalls: 0,
}));

vi.mock('server-only', () => ({}));

vi.stubGlobal(
  'fetch',
  vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('/databases/') && url.includes('/query')) {
      notionState.queryCalls += 1;
      return new Response(
        JSON.stringify({ results: notionState.queryOk ? notionState.queryResults : undefined }),
        { status: notionState.queryOk ? 200 : 500 },
      );
    }
    if (url.endsWith('/pages') && init?.method === 'POST') {
      notionState.createCalls += 1;
      return new Response(JSON.stringify({ id: 'page-1' }), {
        status: notionState.createOk ? 200 : 500,
      });
    }
    return new Response('unexpected', { status: 500 });
  }),
);

import { POST } from '@/app/api/waitlist/route';
import { resetWaitlistRateLimitForTests } from '@/lib/waitlist/rate-limit';

function request(body: unknown, headers?: HeadersInit) {
  return new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(headers ?? {}) },
    body: JSON.stringify(body),
  });
}

describe('POST /api/waitlist', () => {
  beforeEach(() => {
    resetWaitlistRateLimitForTests();
    notionState.queryResults = [];
    notionState.queryOk = true;
    notionState.createOk = true;
    notionState.createCalls = 0;
    notionState.queryCalls = 0;
    process.env.NOTION_TOKEN = 'test-token';
    process.env.NOTION_WAITLIST_DB_ID = '11111111-1111-1111-1111-111111111111';
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetWaitlistRateLimitForTests();
    delete process.env.NOTION_TOKEN;
    delete process.env.NOTION_WAITLIST_DB_ID;
  });

  it('accepts a valid email and consent', async () => {
    const res = await POST(
      request({ email: 'Person@Example.COM', consent: true, headlineVariant: 'B' }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(notionState.queryCalls).toBe(1);
    expect(notionState.createCalls).toBe(1);
  });

  it('rejects an invalid email', async () => {
    const res = await POST(request({ email: 'not-an-email', consent: true }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      errors: { email: 'Please enter a valid email address.' },
    });
    expect(notionState.createCalls).toBe(0);
  });

  it('rejects missing consent', async () => {
    const res = await POST(request({ email: 'ok@example.com', consent: false }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      errors: { consent: 'Please confirm you want launch updates.' },
    });
  });

  it('honeypot filled returns fake success without Notion writes', async () => {
    const res = await POST(
      request({ email: 'bot@example.com', consent: true, company: 'Acme Corp' }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(notionState.queryCalls).toBe(0);
    expect(notionState.createCalls).toBe(0);
  });

  it('returns 409 for duplicate emails', async () => {
    notionState.queryResults = [{ id: 'existing' }];
    const res = await POST(request({ email: 'dup@example.com', consent: true }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      errors: { email: "You're already on the waitlist." },
    });
    expect(notionState.createCalls).toBe(0);
  });

  it('returns 503 when Notion env vars are missing', async () => {
    delete process.env.NOTION_TOKEN;
    delete process.env.NOTION_WAITLIST_DB_ID;
    const res = await POST(request({ email: 'ok@example.com', consent: true }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      errors: {
        email: 'Waitlist signup is temporarily unavailable. Please try again later.',
      },
    });
    expect(notionState.createCalls).toBe(0);
  });

  it('rate-limits repeated requests from the same IP', async () => {
    const headers = { 'x-forwarded-for': '203.0.113.50' };
    for (let i = 0; i < 8; i += 1) {
      const res = await POST(request({ email: `user${i}@example.com`, consent: true }, headers));
      expect(res.status).toBe(201);
    }
    const limited = await POST(request({ email: 'overflow@example.com', consent: true }, headers));
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({
      errors: { email: 'Too many requests. Please try again later.' },
    });
  });
});
