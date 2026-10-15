// @polsia:user-owned — in-memory per-IP limiter for the public contact form.

type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 8;

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Simple in-memory per-IP limiter. Returns true when the request is allowed. */
export function allowContactRequest(ip: string): boolean {
  const now = Date.now();
  prune(now);

  const existing = buckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (existing.count >= MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  return true;
}

/** Test-only: clear limiter state between cases. */
export function resetContactRateLimitForTests(): void {
  buckets.clear();
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return 'unknown';
}
