import "server-only";
import { headers } from "next/headers";
import { getSiteUrl as getConfiguredSiteUrl } from "@/lib/env.server";

/**
 * Base URL of the site, for links in emails. In production it comes from
 * SITE_URL (required, see validateEnv): a request's Host header can be
 * influenced by the visitor and so does not belong in a cancel link. Only in
 * development do we fall back to the request.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;

  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host");
  if (!host) return "";
  return `${list.get("x-forwarded-proto") ?? "http"}://${host}`;
}

export const cancelUrl = async (bookingId: string, token: string) =>
  `${await getSiteUrl()}/boeking/annuleren/${bookingId}?token=${token}`;

export const adminBookingsUrl = async () => `${await getSiteUrl()}/admin/boekingen`;

export const bookAgainUrl = async () => `${await getSiteUrl()}/boeken`;
