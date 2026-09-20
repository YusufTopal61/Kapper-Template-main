import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { parseDatum, normaliseerTijd } from "@/lib/opening-hours";

export type EmailBooking = {
  id: string;
  klant_naam: string;
  klant_email: string;
  klant_telefoon: string;
  datum: string;
  tijd: string;
  dienstNaam: string;
  prijs?: number | null;
  duurMinuten?: number | null;
};

export type EmailBedrijf = {
  bedrijfsnaam: string;
  adres?: string | null;
  telefoonnummer?: string | null;
};

export type EmailInhoud = {
  subject: string;
  html: string;
  text: string;
};

function langeDatum(datum: string) {
  return format(parseDatum(datum), "EEEE d MMMM yyyy", { locale: nl });
}

function euro(prijs?: number | null) {
  if (prijs === null || prijs === undefined) return null;
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(prijs);
}

/** Voorkomt dat klantinvoer de HTML van de e-mail kan breken. */
function escapeHtml(waarde: string) {
  return waarde
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type LayoutOpties = {
  bedrijf: EmailBedrijf;
  titel: string;
  intro: string;
  rijen: Array<[string, string]>;
  knop?: { label: string; url: string };
  afsluiting?: string;
  voetnoot?: string;
};

/**
 * Gedeelde opmaak: zwart/wit, tabel-gebaseerd zodat het ook in Outlook klopt,
 * en een systeem-fontstack omdat e-mailclients geen webfonts laden.
 */
function layout({ bedrijf, titel, intro, rijen, knop, afsluiting, voetnoot }: LayoutOpties) {
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

  const rijenHtml = rijen
    .map(
      ([label, waarde]) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#737373;width:40%;">${escapeHtml(label)}</td>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:15px;color:#111111;font-weight:600;">${escapeHtml(waarde)}</td>
        </tr>`,
    )
    .join("");

  const knopHtml = knop
    ? `
      <tr>
        <td style="padding:32px 0 8px;">
          <a href="${knop.url}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;border-radius:999px;">${escapeHtml(knop.label)}</a>
        </td>
      </tr>`
    : "";

  const afsluitingHtml = afsluiting
    ? `<tr><td style="padding:24px 0 0;font-size:15px;line-height:1.6;color:#404040;">${escapeHtml(afsluiting)}</td></tr>`
    : "";

  const contactRegels = [bedrijf.adres, bedrijf.telefoonnummer]
    .filter(Boolean)
    .map((regel) => escapeHtml(String(regel)))
    .join(" &middot; ");

  const voetnootHtml = voetnoot
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#a3a3a3;">${escapeHtml(voetnoot)}</p>`
    : "";

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(titel)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:${font};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#111111;padding:28px 32px;">
                <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:5px;text-transform:uppercase;">${escapeHtml(bedrijf.bedrijfsnaam)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:26px;line-height:1.2;font-weight:700;color:#111111;letter-spacing:-0.5px;padding-bottom:12px;">${escapeHtml(titel)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;line-height:1.6;color:#404040;padding-bottom:16px;">${escapeHtml(intro)}</td>
                  </tr>
                  <tr>
                    <td>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5;">
                        ${rijenHtml}
                      </table>
                    </td>
                  </tr>
                  ${knopHtml}
                  ${afsluitingHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#fafafa;border-top:1px solid #e5e5e5;padding:24px 32px;">
                ${voetnootHtml}
                <p style="margin:0;font-size:12px;line-height:1.6;color:#a3a3a3;">${escapeHtml(bedrijf.bedrijfsnaam)}${contactRegels ? ` &middot; ${contactRegels}` : ""}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function platteTekst(titel: string, intro: string, rijen: Array<[string, string]>, extra?: string) {
  const regels = rijen.map(([label, waarde]) => `${label}: ${waarde}`).join("\n");
  return [titel, "", intro, "", regels, extra ? `\n${extra}` : ""].join("\n").trim();
}

function boekingRijen(boeking: EmailBooking): Array<[string, string]> {
  const rijen: Array<[string, string]> = [
    ["Dienst", boeking.dienstNaam],
    ["Datum", langeDatum(boeking.datum)],
    ["Tijd", normaliseerTijd(boeking.tijd)],
  ];
  const prijs = euro(boeking.prijs);
  if (prijs) rijen.push(["Prijs", prijs]);
  if (boeking.duurMinuten) rijen.push(["Duur", `${boeking.duurMinuten} minuten`]);
  return rijen;
}

// ------------------------------------------------------------------ klant

export function boekingsbevestigingKlant(
  boeking: EmailBooking,
  bedrijf: EmailBedrijf,
  annuleerUrl: string,
): EmailInhoud {
  const titel = "Je afspraak staat genoteerd";
  const intro = `Hoi ${boeking.klant_naam}, bedankt voor je boeking. We zien je graag op het onderstaande moment. Tot dan!`;
  const rijen = boekingRijen(boeking);
  if (bedrijf.adres) rijen.push(["Adres", bedrijf.adres]);

  return {
    subject: `Afspraak bevestigd — ${langeDatum(boeking.datum)} om ${normaliseerTijd(boeking.tijd)}`,
    html: layout({
      bedrijf,
      titel,
      intro,
      rijen,
      knop: { label: "Afspraak annuleren", url: annuleerUrl },
      afsluiting:
        "Kun je onverhoopt niet? Annuleer dan even via de knop hierboven, dan kunnen we het tijdslot aan iemand anders geven.",
      voetnoot: "Deze annuleerlink is persoonlijk — deel hem niet met anderen.",
    }),
    text: platteTekst(
      titel,
      intro,
      rijen,
      `Annuleren kan via: ${annuleerUrl}\n\nDeze link is persoonlijk — deel hem niet met anderen.`,
    ),
  };
}

export function annuleringBevestigdKlant(
  boeking: EmailBooking,
  bedrijf: EmailBedrijf,
  opnieuwBoekenUrl: string,
): EmailInhoud {
  const titel = "Je afspraak is geannuleerd";
  const intro = `Hoi ${boeking.klant_naam}, je afspraak is geannuleerd. Er staat niets meer voor je ingepland.`;
  const rijen = boekingRijen(boeking);

  return {
    subject: `Afspraak geannuleerd — ${langeDatum(boeking.datum)}`,
    html: layout({
      bedrijf,
      titel,
      intro,
      rijen,
      knop: { label: "Nieuwe afspraak plannen", url: opnieuwBoekenUrl },
      afsluiting: "Je bent altijd welkom terug. Tot ziens in de stoel.",
    }),
    text: platteTekst(titel, intro, rijen, `Nieuwe afspraak plannen: ${opnieuwBoekenUrl}`),
  };
}

export function afspraakGewijzigdKlant(
  boeking: EmailBooking,
  bedrijf: EmailBedrijf,
  annuleerUrl: string,
): EmailInhoud {
  const titel = "Je afspraak is gewijzigd";
  const intro = `Hoi ${boeking.klant_naam}, je afspraak is aangepast. Hieronder staan de nieuwe gegevens.`;
  const rijen = boekingRijen(boeking);
  if (bedrijf.adres) rijen.push(["Adres", bedrijf.adres]);

  return {
    subject: `Afspraak gewijzigd — ${langeDatum(boeking.datum)} om ${normaliseerTijd(boeking.tijd)}`,
    html: layout({
      bedrijf,
      titel,
      intro,
      rijen,
      knop: { label: "Afspraak annuleren", url: annuleerUrl },
      afsluiting:
        "Komt dit moment niet uit? Laat het ons weten, dan zoeken we samen een ander tijdslot.",
    }),
    text: platteTekst(titel, intro, rijen, `Annuleren kan via: ${annuleerUrl}`),
  };
}

// ------------------------------------------------------------------ admin

export function nieuweBoekingAdmin(
  boeking: EmailBooking,
  bedrijf: EmailBedrijf,
  adminUrl: string,
): EmailInhoud {
  const titel = "Nieuwe boeking";
  const intro = `${boeking.klant_naam} heeft zojuist een afspraak gemaakt.`;
  const rijen: Array<[string, string]> = [
    ["Klant", boeking.klant_naam],
    ["E-mail", boeking.klant_email],
    ["Telefoon", boeking.klant_telefoon],
    ...boekingRijen(boeking),
  ];

  return {
    subject: `Nieuwe boeking — ${boeking.klant_naam}, ${langeDatum(boeking.datum)} om ${normaliseerTijd(boeking.tijd)}`,
    html: layout({
      bedrijf,
      titel,
      intro,
      rijen,
      knop: { label: "Bekijk in beheer", url: adminUrl },
    }),
    text: platteTekst(titel, intro, rijen, `Bekijk in beheer: ${adminUrl}`),
  };
}

export function annuleringAdmin(
  boeking: EmailBooking,
  bedrijf: EmailBedrijf,
  adminUrl: string,
  doorKlant: boolean,
): EmailInhoud {
  const titel = "Afspraak geannuleerd";
  const intro = doorKlant
    ? `${boeking.klant_naam} heeft de afspraak zelf geannuleerd. Het tijdslot is weer vrij.`
    : `De afspraak van ${boeking.klant_naam} is geannuleerd vanuit het beheerpaneel. De klant heeft bericht gekregen.`;
  const rijen: Array<[string, string]> = [
    ["Klant", boeking.klant_naam],
    ["E-mail", boeking.klant_email],
    ["Telefoon", boeking.klant_telefoon],
    ...boekingRijen(boeking),
  ];

  return {
    subject: `Geannuleerd — ${boeking.klant_naam}, ${langeDatum(boeking.datum)} om ${normaliseerTijd(boeking.tijd)}`,
    html: layout({
      bedrijf,
      titel,
      intro,
      rijen,
      knop: { label: "Bekijk in beheer", url: adminUrl },
    }),
    text: platteTekst(titel, intro, rijen, `Bekijk in beheer: ${adminUrl}`),
  };
}
