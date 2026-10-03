import "server-only";
import { getClientIp } from "./client-ip.server";
import { rateLimit } from "./rate-limit";

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Rem op misbruik van publieke acties en pagina's. Geeft `null` als de
 * aanvraag door mag, anders het aantal seconden dat de bezoeker moet wachten.
 */
export async function limitRequests(
  prefix: string,
  max: number,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<number | null> {
  const rateResult = rateLimit(`${prefix}:${await getClientIp()}`, { max, windowMs });
  return rateResult.allowed ? null : rateResult.retryAfterSeconds;
}
