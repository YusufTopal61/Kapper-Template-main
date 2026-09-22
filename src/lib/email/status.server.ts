import { getResendConfig } from "@/lib/env";

export type EmailStatus = {
  /** Staat er een RESEND_API_KEY? Zonder key worden mails alleen gelogd. */
  geconfigureerd: boolean;
  /**
   * true = Resend staat nog in testmodus: mails komen alleen aan bij het
   * eigen Resend-accountadres, niet bij echte klanten. Dit is de meest
   * voorkomende manier waarop "waterdichte" e-mail alsnog stil faalt.
   */
  sandboxModus: boolean;
  vanAdres: string;
  geverifieerdeDomeinen: string[];
};

function domeinVan(adres: string): string | null {
  const match = adres.match(/@([^\s>]+)/);
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
export async function controleerEmailStatus(): Promise<EmailStatus> {
  const { apiKey, from } = getResendConfig();

  if (!apiKey) {
    return { geconfigureerd: false, sandboxModus: true, vanAdres: from, geverifieerdeDomeinen: [] };
  }

  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      // Kan de status niet betrouwbaar vaststellen — dan liever "sandbox"
      // aannemen dan valse zekerheid geven.
      return {
        geconfigureerd: true,
        sandboxModus: true,
        vanAdres: from,
        geverifieerdeDomeinen: [],
      };
    }

    const data = (await response.json()) as { data?: Array<{ name: string; status: string }> };
    const geverifieerd = (data.data ?? [])
      .filter((domein) => domein.status === "verified")
      .map((domein) => domein.name);

    const vanDomein = domeinVan(from);
    const vanDomeinGeverifieerd = Boolean(vanDomein && geverifieerd.includes(vanDomein));

    return {
      geconfigureerd: true,
      sandboxModus: !vanDomeinGeverifieerd,
      vanAdres: from,
      geverifieerdeDomeinen: geverifieerd,
    };
  } catch (error) {
    console.error("[email] status ophalen bij Resend mislukt:", error);
    return { geconfigureerd: true, sandboxModus: true, vanAdres: from, geverifieerdeDomeinen: [] };
  }
}
