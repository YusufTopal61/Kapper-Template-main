import "server-only";
import { getResendConfig } from "@/lib/env.server";
import type { EmailContent } from "./mail-templates";

export type SendResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

/**
 * Verstuurt een e-mail via Resend.
 *
 * Werpt nooit een fout: een mislukte mail mag een boeking niet blokkeren. Het
 * resultaat vertelt de aanroeper wat er gebeurd is, en alles wordt gelogd.
 * Zonder RESEND_API_KEY wordt de mail naar de console geschreven, zodat de
 * flow lokaal compleet te testen is voordat de key er is.
 */
export async function sendEmail(
  to: string | null | undefined,
  content: EmailContent,
): Promise<SendResult> {
  if (!to) {
    const reason = "geen ontvanger ingesteld";
    console.warn(`[email] overgeslagen (${reason}): ${content.subject}`);
    return { status: "skipped", reason };
  }

  const { apiKey, from } = getResendConfig();

  if (!apiKey) {
    console.info(
      [
        "[email] RESEND_API_KEY ontbreekt — niet verzonden.",
        `  aan:      ${to}`,
        `  onderwerp: ${content.subject}`,
        "  (zet RESEND_API_KEY in .env.local om echt te versturen)",
      ].join("\n"),
    );
    return { status: "skipped", reason: "RESEND_API_KEY ontbreekt" };
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
        to: [to],
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] Resend gaf ${response.status} voor "${content.subject}": ${body}`);
      return { status: "failed", reason: `Resend ${response.status}` };
    }

    const data = (await response.json()) as { id?: string };
    return { status: "sent", id: data.id ?? "unknown" };
  } catch (error) {
    console.error(`[email] versturen mislukt voor "${content.subject}":`, error);
    return { status: "failed", reason: error instanceof Error ? error.message : "onbekende fout" };
  }
}

/** Verstuurt meerdere mails parallel; één mislukking laat de rest doorgaan. */
export async function sendEmails(
  mails: Array<{ to: string | null | undefined; content: EmailContent }>,
): Promise<SendResult[]> {
  return Promise.all(mails.map(({ to, content }) => sendEmail(to, content)));
}
