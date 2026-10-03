import "server-only";
import { headers } from "next/headers";
import { getSiteUrl as getConfiguredSiteUrl } from "@/shared/lib/env.server";

/**
 * Basis-URL van de site, voor links in e-mails. In productie komt hij uit
 * SITE_URL (verplicht, zie controleerEnv): de Host-header van een request is
 * door de bezoeker te beïnvloeden en hoort dus niet in een annuleerlink te
 * belanden. Alleen in development vallen we terug op het request.
 */
export async function getSiteUrl(): Promise<string> {
  const ingesteld = getConfiguredSiteUrl();
  if (ingesteld) return ingesteld;

  const lijst = await headers();
  const host = lijst.get("x-forwarded-host") ?? lijst.get("host");
  if (!host) return "";
  return `${lijst.get("x-forwarded-proto") ?? "http"}://${host}`;
}

export const annuleerUrl = async (bookingId: string, token: string) =>
  `${await getSiteUrl()}/boeking/annuleren/${bookingId}?token=${token}`;

export const adminBoekingUrl = async () => `${await getSiteUrl()}/admin/boekingen`;

export const opnieuwBoekenUrl = async () => `${await getSiteUrl()}/boeken`;
