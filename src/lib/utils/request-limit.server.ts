import "server-only";
import { getClientIp } from "./client-ip.server";
import { rateLimit } from "./rate-limit";

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Brake on abuse of public actions and pages. Returns `null` when the request
 * may pass, otherwise the number of seconds the visitor has to wait.
 */
export async function limitRequests(
  prefix: string,
  max: number,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<number | null> {
  const rateResult = rateLimit(`${prefix}:${await getClientIp()}`, { max, windowMs });
  return rateResult.allowed ? null : rateResult.retryAfterSeconds;
}
