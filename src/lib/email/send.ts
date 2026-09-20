import { getResendConfig } from "@/lib/env";
import type { EmailInhoud } from "./templates";

export type VerzendResultaat =
  | { status: "verzonden"; id: string }
  | { status: "overgeslagen"; reden: string }
  | { status: "mislukt"; reden: string };

/**
 * Verstuurt een e-mail via Resend.
 *
 * Werpt nooit een fout: een mislukte mail mag een boeking niet blokkeren. Het
 * resultaat vertelt de aanroeper wat er gebeurd is, en alles wordt gelogd.
 * Zonder RESEND_API_KEY wordt de mail naar de console geschreven, zodat de
 * flow lokaal compleet te testen is voordat de key er is.
 */
export async function verstuurEmail(
  naar: string | null | undefined,
  inhoud: EmailInhoud,
): Promise<VerzendResultaat> {
  if (!naar) {
    const reden = "geen ontvanger ingesteld";
    console.warn(`[email] overgeslagen (${reden}): ${inhoud.subject}`);
    return { status: "overgeslagen", reden };
  }

  const { apiKey, from } = getResendConfig();

  if (!apiKey) {
    console.info(
      [
        "[email] RESEND_API_KEY ontbreekt — niet verzonden.",
        `  aan:      ${naar}`,
        `  onderwerp: ${inhoud.subject}`,
        "  (zet RESEND_API_KEY in .env.local om echt te versturen)",
      ].join("\n"),
    );
    return { status: "overgeslagen", reden: "RESEND_API_KEY ontbreekt" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [naar],
        subject: inhoud.subject,
        html: inhoud.html,
        text: inhoud.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] Resend gaf ${response.status} voor "${inhoud.subject}": ${body}`);
      return { status: "mislukt", reden: `Resend ${response.status}` };
    }

    const data = (await response.json()) as { id?: string };
    return { status: "verzonden", id: data.id ?? "onbekend" };
  } catch (error) {
    console.error(`[email] versturen mislukt voor "${inhoud.subject}":`, error);
    return { status: "mislukt", reden: error instanceof Error ? error.message : "onbekende fout" };
  }
}

/** Verstuurt meerdere mails parallel; één mislukking laat de rest doorgaan. */
export async function verstuurEmails(
  mails: Array<{ naar: string | null | undefined; inhoud: EmailInhoud }>,
): Promise<VerzendResultaat[]> {
  return Promise.all(mails.map(({ naar, inhoud }) => verstuurEmail(naar, inhoud)));
}
