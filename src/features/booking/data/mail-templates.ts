import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { parseDate, normalizeTime } from "@/features/settings/domain/opening-hours.rules";

export type EmailBooking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  serviceName: string;
  price?: number | null;
  durationMinutes?: number | null;
};

export type EmailBusiness = {
  businessName: string;
  address?: string | null;
  phoneNumber?: string | null;
};

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function longDate(date: string) {
  return format(parseDate(date), "EEEE d MMMM yyyy", { locale: nl });
}

function euro(price?: number | null) {
  if (price === null || price === undefined) return null;
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(price);
}

/** Voorkomt dat klantinvoer de HTML van de e-mail kan breken. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type LayoutOptions = {
  business: EmailBusiness;
  title: string;
  intro: string;
  rows: Array<[string, string]>;
  button?: { label: string; url: string };
  closing?: string;
  footnote?: string;
};

/**
 * Gedeelde opmaak: zwart/wit, tabel-gebaseerd zodat het ook in Outlook klopt,
 * en een systeem-fontstack omdat e-mailclients geen webfonts laden.
 */
function layout({ business, title, intro, rows, button, closing, footnote }: LayoutOptions) {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#737373;width:40%;">${escapeHtml(label)}</td>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:15px;color:#111111;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const buttonHtml = button
    ? `
      <tr>
        <td style="padding:32px 0 8px;">
          <a href="${button.url}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;border-radius:999px;">${escapeHtml(button.label)}</a>
        </td>
      </tr>`
    : "";

  const closingHtml = closing
    ? `<tr><td style="padding:24px 0 0;font-size:15px;line-height:1.6;color:#404040;">${escapeHtml(closing)}</td></tr>`
    : "";

  const contactLines = [business.address, business.phoneNumber]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join(" &middot; ");

  const footnoteHtml = footnote
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#a3a3a3;">${escapeHtml(footnote)}</p>`
    : "";

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:${font};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#111111;padding:28px 32px;">
                <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:5px;text-transform:uppercase;">${escapeHtml(business.businessName)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:26px;line-height:1.2;font-weight:700;color:#111111;letter-spacing:-0.5px;padding-bottom:12px;">${escapeHtml(title)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;line-height:1.6;color:#404040;padding-bottom:16px;">${escapeHtml(intro)}</td>
                  </tr>
                  <tr>
                    <td>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5;">
                        ${rowsHtml}
                      </table>
                    </td>
                  </tr>
                  ${buttonHtml}
                  ${closingHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#fafafa;border-top:1px solid #e5e5e5;padding:24px 32px;">
                ${footnoteHtml}
                <p style="margin:0;font-size:12px;line-height:1.6;color:#a3a3a3;">${escapeHtml(business.businessName)}${contactLines ? ` &middot; ${contactLines}` : ""}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function plainText(title: string, intro: string, rows: Array<[string, string]>, extra?: string) {
  const lines = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  return [title, "", intro, "", lines, extra ? `\n${extra}` : ""].join("\n").trim();
}

function bookingRows(booking: EmailBooking): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ["Dienst", booking.serviceName],
    ["Datum", longDate(booking.date)],
    ["Tijd", normalizeTime(booking.time)],
  ];
  const price = euro(booking.price);
  if (price) rows.push(["Prijs", price]);
  if (booking.durationMinutes) rows.push(["Duur", `${booking.durationMinutes} minuten`]);
  return rows;
}

// ------------------------------------------------------------------ klant

export function bookingConfirmationCustomer(
  booking: EmailBooking,
  business: EmailBusiness,
  cancelUrl: string,
): EmailContent {
  const title = "Je afspraak staat genoteerd";
  const intro = `Hoi ${booking.customerName}, bedankt voor je boeking. We zien je graag op het onderstaande moment. Tot dan!`;
  const rows = bookingRows(booking);
  if (business.address) rows.push(["Adres", business.address]);

  return {
    subject: `Afspraak bevestigd — ${longDate(booking.date)} om ${normalizeTime(booking.time)}`,
    html: layout({
      business,
      title,
      intro,
      rows,
      button: { label: "Afspraak annuleren", url: cancelUrl },
      closing:
        "Kun je onverhoopt niet? Annuleer dan even via de knop hierboven, dan kunnen we het tijdslot aan iemand anders geven.",
      footnote: "Deze annuleerlink is persoonlijk — deel hem niet met anderen.",
    }),
    text: plainText(
      title,
      intro,
      rows,
      `Annuleren kan via: ${cancelUrl}\n\nDeze link is persoonlijk — deel hem niet met anderen.`,
    ),
  };
}

export function cancellationConfirmedCustomer(
  booking: EmailBooking,
  business: EmailBusiness,
  bookAgainUrl: string,
): EmailContent {
  const title = "Je afspraak is geannuleerd";
  const intro = `Hoi ${booking.customerName}, je afspraak is geannuleerd. Er staat niets meer voor je ingepland.`;
  const rows = bookingRows(booking);

  return {
    subject: `Afspraak geannuleerd — ${longDate(booking.date)}`,
    html: layout({
      business,
      title,
      intro,
      rows,
      button: { label: "Nieuwe afspraak plannen", url: bookAgainUrl },
      closing: "Je bent altijd welkom terug. Tot ziens in de stoel.",
    }),
    text: plainText(title, intro, rows, `Nieuwe afspraak plannen: ${bookAgainUrl}`),
  };
}

export function appointmentChangedCustomer(
  booking: EmailBooking,
  business: EmailBusiness,
  cancelUrl: string,
): EmailContent {
  const title = "Je afspraak is gewijzigd";
  const intro = `Hoi ${booking.customerName}, je afspraak is aangepast. Hieronder staan de nieuwe gegevens.`;
  const rows = bookingRows(booking);
  if (business.address) rows.push(["Adres", business.address]);

  return {
    subject: `Afspraak gewijzigd — ${longDate(booking.date)} om ${normalizeTime(booking.time)}`,
    html: layout({
      business,
      title,
      intro,
      rows,
      button: { label: "Afspraak annuleren", url: cancelUrl },
      closing:
        "Komt dit moment niet uit? Laat het ons weten, dan zoeken we samen een ander tijdslot.",
    }),
    text: plainText(title, intro, rows, `Annuleren kan via: ${cancelUrl}`),
  };
}

// ------------------------------------------------------------------ admin

export function newBookingAdmin(
  booking: EmailBooking,
  business: EmailBusiness,
  adminUrl: string,
): EmailContent {
  const title = "Nieuwe boeking";
  const intro = `${booking.customerName} heeft zojuist een afspraak gemaakt.`;
  const rows: Array<[string, string]> = [
    ["Klant", booking.customerName],
    ["E-mail", booking.customerEmail],
    ["Telefoon", booking.customerPhone],
    ...bookingRows(booking),
  ];

  return {
    subject: `Nieuwe boeking — ${booking.customerName}, ${longDate(booking.date)} om ${normalizeTime(booking.time)}`,
    html: layout({
      business,
      title,
      intro,
      rows,
      button: { label: "Bekijk in beheer", url: adminUrl },
    }),
    text: plainText(title, intro, rows, `Bekijk in beheer: ${adminUrl}`),
  };
}

export function cancellationAdmin(
  booking: EmailBooking,
  business: EmailBusiness,
  adminUrl: string,
  byCustomer: boolean,
): EmailContent {
  const title = "Afspraak geannuleerd";
  const intro = byCustomer
    ? `${booking.customerName} heeft de afspraak zelf geannuleerd. Het tijdslot is weer vrij.`
    : `De afspraak van ${booking.customerName} is geannuleerd vanuit het beheerpaneel. De klant heeft bericht gekregen.`;
  const rows: Array<[string, string]> = [
    ["Klant", booking.customerName],
    ["E-mail", booking.customerEmail],
    ["Telefoon", booking.customerPhone],
    ...bookingRows(booking),
  ];

  return {
    subject: `Geannuleerd — ${booking.customerName}, ${longDate(booking.date)} om ${normalizeTime(booking.time)}`,
    html: layout({
      business,
      title,
      intro,
      rows,
      button: { label: "Bekijk in beheer", url: adminUrl },
    }),
    text: plainText(title, intro, rows, `Bekijk in beheer: ${adminUrl}`),
  };
}
