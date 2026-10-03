import "server-only";
import { headers } from "next/headers";

/**
 * The visitor's IP, for rate limiting. Behind a trusted proxy (Vercel) the
 * first address in X-Forwarded-For is the real client address. "unknown" shares
 * one bucket — better too strict than no limit.
 */
export async function getClientIp(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || list.get("x-real-ip") || "unknown";
}
