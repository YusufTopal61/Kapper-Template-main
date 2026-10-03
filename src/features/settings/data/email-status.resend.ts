import "server-only";
import { getResendConfig } from "@/lib/env.server";
import type { EmailStatusChecker } from "../domain/settings.repository";
import type { EmailStatus } from "../domain/settings.entity";

function domainOf(address: string): string | null {
  const match = address.match(/@([^\s>]+)/);
  return match?.[1] ? match[1].toLowerCase() : null;
}

/**
 * Vraagt bij Resend zelf op of er een geverifieerd domein is, en of het
 * huidige afzenderadres (RESEND_FROM) daar ook daadwerkelijk op draait.
 * Zonder geverifieerd domein levert Resend alleen af op het adres van de
 * accounteigenaar — elke andere klant krijgt geen mail, zonder dat de
 * boeking zelf faalt. Dat gat moet zichtbaar zijn voor de beheerder, niet
 * alleen in een serverlog.
 */
async function checkEmailStatus(): Promise<EmailStatus> {
  const { apiKey, from } = getResendConfig();

  if (!apiKey) {
    return { configured: false, sandboxMode: true, fromAddress: from, verifiedDomains: [] };
  }

  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      // Kan de status niet betrouwbaar vaststellen — dan liever "sandbox"
      // aannemen dan valse zekerheid geven.
      return {
        configured: true,
        sandboxMode: true,
        fromAddress: from,
        verifiedDomains: [],
      };
    }

    const data = (await response.json()) as { data?: Array<{ name: string; status: string }> };
    const verified = (data.data ?? [])
      .filter((domainName) => domainName.status === "verified")
      .map((domainName) => domainName.name);

    const fromDomain = domainOf(from);
    const fromDomainVerified = Boolean(fromDomain && verified.includes(fromDomain));

    return {
      configured: true,
      sandboxMode: !fromDomainVerified,
      fromAddress: from,
      verifiedDomains: verified,
    };
  } catch (error) {
    console.error("[email] status ophalen bij Resend mislukt:", error);
    return { configured: true, sandboxMode: true, fromAddress: from, verifiedDomains: [] };
  }
}

export function createResendEmailStatusChecker(): EmailStatusChecker {
  return { check: checkEmailStatus };
}
