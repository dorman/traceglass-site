/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

describe('GET /api/pages/[slug] without DATABASE_URL', () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.DATABASE_URL;
  });

  it('serves registry defaults for known marketing pages', async () => {
    delete process.env.DATABASE_URL;
    const { GET } = await import('@/app/api/pages/[slug]/route');
    const res = await GET(new Request('http://localhost/api/pages/home'), {
      params: Promise.resolve({ slug: 'home' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('TraceGlass');
    expect(body.sourceKey).toBe('home');
    expect(body.content?.version).toBe(1);
  });

  it('returns 404 for unknown slugs', async () => {
    delete process.env.DATABASE_URL;
    const { GET } = await import('@/app/api/pages/[slug]/route');
    const res = await GET(new Request('http://localhost/api/pages/nope'), {
      params: Promise.resolve({ slug: 'nope' }),
    });
    expect(res.status).toBe(404);
  });
});
