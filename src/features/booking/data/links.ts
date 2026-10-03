import "server-only";
import { headers } from "next/headers";
import { getSiteUrl as getConfiguredSiteUrl } from "@/lib/env.server";

/**
 * Basis-URL van de site, voor links in e-mails. In productie komt hij uit
 * SITE_URL (verplicht, zie controleerEnv): de Host-header van een request is
 * door de bezoeker te beïnvloeden en hoort dus niet in een annuleerlink te
 * belanden. Alleen in development vallen we terug op het request.
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
