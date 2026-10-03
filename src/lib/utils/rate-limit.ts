/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Note: the counter lives per server instance. On a single server (or during
 * development) that is exactly enough to stop spam and automated abuse of the
 * public booking form. When you later run on multiple instances or serverless,
 * replace the storage with something shared (Upstash Redis, or a table in
 * Supabase) — the call below stays the same.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

/** Cleans up buckets nobody consults any more, so the Map does not grow. */
function cleanup(now: number, maxAgeMs: number) {
  for (const [key, bucket] of buckets) {
    const recent = bucket.timestamps.filter((t) => now - t < maxAgeMs);
    if (recent.length === 0) {
      buckets.delete(key);
    } else {
      bucket.timestamps = recent;
    }
  }
}

let lastCleanup = 0;

export type RateLimitResult =
  { allowed: true; remaining: number } | { allowed: false; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  options: { max: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();

  // At most one large cleanup per minute.
  if (now - lastCleanup > 60_000) {
    cleanup(now, options.windowMs);
    lastCleanup = now;
  }

  const bucket = buckets.get(key) ?? { timestamps: [] };
  const recent = bucket.timestamps.filter((t) => now - t < options.windowMs);

  if (recent.length >= options.max) {
    const oldest = Math.min(...recent);
    const waitMs = options.windowMs - (now - oldest);
    buckets.set(key, { timestamps: recent });
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)),
    };
  }

  recent.push(now);
  buckets.set(key, { timestamps: recent });
  return { allowed: true, remaining: options.max - recent.length };
}
