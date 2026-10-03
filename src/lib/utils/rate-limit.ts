/**
 * Eenvoudige sliding-window rate limiter in het geheugen.
 *
 * Let op: de teller leeft per server-instantie. Op één server (of tijdens
 * development) is dat precies genoeg om spam en geautomatiseerd misbruik van
 * het publieke boekingsformulier tegen te houden. Draai je straks op meerdere
 * instanties of op serverless, vervang de opslag dan door iets gedeelds
 * (Upstash Redis, of een tabel in Supabase) — de aanroep hieronder blijft gelijk.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

/** Ruimt vensters op die niemand meer raadpleegt, zodat de Map niet groeit. */
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

  // Hooguit één keer per minuut grootschalig opruimen.
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
