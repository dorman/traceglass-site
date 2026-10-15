/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const notionState = vi.hoisted(() => ({
  createOk: true,
  createCalls: 0,
  lastBody: null as Record<string, unknown> | null,
}));

vi.mock('server-only', () => ({}));

vi.stubGlobal(
  'fetch',
  vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/pages') && init?.method === 'POST') {
      notionState.createCalls += 1;
      notionState.lastBody = JSON.parse(String(init.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ id: 'page-1' }), {
        status: notionState.createOk ? 200 : 500,
      });
    }
    return new Response('unexpected', { status: 500 });
  }),
);

import { POST } from '@/app/api/contact/route';
import { resetContactRateLimitForTests } from '@/lib/contact/rate-limit';
import { NOTION_RICH_TEXT_MAX } from '@/lib/contact/schema';

function request(body: unknown, headers?: HeadersInit) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(headers ?? {}) },
    body: JSON.stringify(body),
  });
}

const valid = {
  email: 'Person@Example.COM',
  topic: 'General question',
  message: 'Hello from the contact form.',
  consent: true,
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    resetContactRateLimitForTests();
    notionState.createOk = true;
    notionState.createCalls = 0;
    notionState.lastBody = null;
    process.env.NOTION_TOKEN = 'test-token';
    process.env.NOTION_CONTACT_DB_ID = '22222222-2222-2222-2222-222222222222';
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetContactRateLimitForTests();
    delete process.env.NOTION_TOKEN;
    delete process.env.NOTION_CONTACT_DB_ID;
  });

  it('accepts a valid submission and writes Notion properties', async () => {
    const res = await POST(request({ ...valid, name: 'Alex' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(notionState.createCalls).toBe(1);
    const props = (notionState.lastBody?.properties ?? {}) as Record<string, unknown>;
    expect(props).toMatchObject({
      Status: { select: { name: 'New' } },
      Topic: { select: { name: 'General question' } },
      Email: { email: 'person@example.com' },
    });
    const name = props.Name as { title: Array<{ text: { content: string } }> };
    expect(name.title[0]?.text.content).toBe('Alex');
  });

  it('uses email as the Name title when name is blank', async () => {
    const res = await POST(request(valid));
    expect(res.status).toBe(201);
    const props = (notionState.lastBody?.properties ?? {}) as Record<string, unknown>;
    const name = props.Name as { title: Array<{ text: { content: string } }> };
    expect(name.title[0]?.text.content).toBe('person@example.com');
  });

  it('rejects an invalid email', async () => {
    const res = await POST(request({ ...valid, email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      errors: { email: 'Please enter a valid email address.' },
    });
    expect(notionState.createCalls).toBe(0);
  });

  it('rejects a missing topic', async () => {
    const res = await POST(request({ ...valid, topic: 'Billing' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.topic).toBeTruthy();
    expect(notionState.createCalls).toBe(0);
  });

  it('rejects missing consent', async () => {
    const res = await POST(request({ ...valid, consent: false }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      errors: { consent: 'Please confirm you want us to receive this message.' },
    });
  });

  it('honeypot filled returns fake success without Notion writes', async () => {
    const res = await POST(request({ ...valid, company: 'Acme Corp' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(notionState.createCalls).toBe(0);
  });

  it('returns 503 when Notion env vars are missing', async () => {
    delete process.env.NOTION_TOKEN;
    delete process.env.NOTION_CONTACT_DB_ID;
    const res = await POST(request(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      errors: {
        form: 'Contact is temporarily unavailable. Please try again later.',
      },
    });
    expect(notionState.createCalls).toBe(0);
  });

  it('returns 503 when only the contact database id is missing', async () => {
    delete process.env.NOTION_CONTACT_DB_ID;
    const res = await POST(request(valid));
    expect(res.status).toBe(503);
    expect(notionState.createCalls).toBe(0);
  });

  it('rate-limits repeated requests from the same IP', async () => {
    const headers = { 'x-forwarded-for': '203.0.113.60' };
    for (let i = 0; i < 8; i += 1) {
      const res = await POST(request({ ...valid, email: `user${i}@example.com` }, headers));
      expect(res.status).toBe(201);
    }
    const limited = await POST(request({ ...valid, email: 'overflow@example.com' }, headers));
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({
      errors: { form: 'Too many requests. Please try again later.' },
    });
  });

  it('truncates long messages to the Notion rich_text limit', async () => {
    const message = 'm'.repeat(NOTION_RICH_TEXT_MAX + 250);
    const res = await POST(request({ ...valid, message }));
    expect(res.status).toBe(201);
    const props = (notionState.lastBody?.properties ?? {}) as Record<string, unknown>;
    const rich = props.Message as { rich_text: Array<{ text: { content: string } }> };
    expect(rich.rich_text[0]?.text.content).toHaveLength(NOTION_RICH_TEXT_MAX);
  });
});
