import "server-only";
import { logger } from "@/lib/logger";
import { getResendConfig } from "@/lib/env.server";
import type { EmailStatusChecker } from "../domain/settings.repository";
import type { EmailStatus } from "../domain/settings.entity";

function domainOf(address: string): string | null {
  const match = address.match(/@([^\s>]+)/);
  return match?.[1] ? match[1].toLowerCase() : null;
}

/**
 * Asks Resend itself whether there is a verified domain, and whether the
 * current sender address (RESEND_FROM) actually runs on it. Without a verified
 * domain Resend only delivers to the account owner's address — every other
 * customer gets no mail, without the booking itself failing. That gap must be
 * visible to the admin, not only in a server log.
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
      // Cannot determine the status reliably — then we would rather assume "sandbox"
      // than give false certainty.
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
    logger.error("email", "fetching status from Resend failed", error);
    return { configured: true, sandboxMode: true, fromAddress: from, verifiedDomains: [] };
  }
}

export function createResendEmailStatusChecker(): EmailStatusChecker {
  return { check: checkEmailStatus };
}
