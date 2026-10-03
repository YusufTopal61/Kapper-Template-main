import "server-only";
import { logger } from "@/lib/logger";
import { getResendConfig } from "@/lib/env.server";
import type { EmailContent } from "./mail-templates";

export type SendResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

/**
 * Sends an email via Resend.
 *
 * Never throws: a failed mail must not block a booking. The result tells the
 * caller what happened, and everything is logged. Without RESEND_API_KEY the
 * mail is written to the console, so the flow can be tested completely locally
 * before the key exists.
 */
export async function sendEmail(
  to: string | null | undefined,
  content: EmailContent,
): Promise<SendResult> {
  if (!to) {
    const reason = "no recipient configured";
    logger.warn("email", `skipped: ${reason}`, { subject: content.subject });
    return { status: "skipped", reason };
  }

  const { apiKey, from } = getResendConfig();

  if (!apiKey) {
    logger.info(
      "email",
      "RESEND_API_KEY is missing — mail not sent (set it in .env.local to send)",
      {
        to,
        subject: content.subject,
      },
    );
    return { status: "skipped", reason: "RESEND_API_KEY is missing" };
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
      logger.error("email", "Resend rejected the email", undefined, {
        status: response.status,
        subject: content.subject,
        body,
      });
      return { status: "failed", reason: `Resend ${response.status}` };
    }

    const data = (await response.json()) as { id?: string };
    return { status: "sent", id: data.id ?? "unknown" };
  } catch (error) {
    logger.error("email", "sending failed", error, { subject: content.subject });
    return { status: "failed", reason: error instanceof Error ? error.message : "onbekende fout" };
  }
}

/** Sends several mails in parallel; one failure lets the rest continue. */
export async function sendEmails(
  mails: Array<{ to: string | null | undefined; content: EmailContent }>,
): Promise<SendResult[]> {
  return Promise.all(mails.map(({ to, content }) => sendEmail(to, content)));
}
