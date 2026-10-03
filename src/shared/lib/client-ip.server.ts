import "server-only";
import { headers } from "next/headers";

/**
 * IP van de bezoeker, voor rate limiting. Achter een vertrouwde proxy (Vercel)
 * is het eerste adres in X-Forwarded-For het echte clientadres. "onbekend" deelt
 * één emmer — liever te streng dan geen limiet.
 */
export async function getClientIp(): Promise<string> {
  const lijst = await headers();
  const doorgestuurd = lijst.get("x-forwarded-for")?.split(",")[0]?.trim();
  return doorgestuurd || lijst.get("x-real-ip") || "onbekend";
}
