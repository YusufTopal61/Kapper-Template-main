import "server-only";
import { getClientIp } from "./client-ip.server";
import { rateLimit } from "./rate-limit";

const STANDAARD_VENSTER_MS = 10 * 60 * 1000;

/**
 * Rem op misbruik van publieke acties en pagina's. Geeft `null` als de
 * aanvraag door mag, anders het aantal seconden dat de bezoeker moet wachten.
 */
export async function beperkAanvragen(
  prefix: string,
  max: number,
  vensterMs = STANDAARD_VENSTER_MS,
): Promise<number | null> {
  const limiet = rateLimit(`${prefix}:${await getClientIp()}`, { max, vensterMs });
  return limiet.toegestaan ? null : limiet.opnieuwProberenOverSeconden;
}
