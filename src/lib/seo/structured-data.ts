/**
 * JSON-LD builders (schema.org). Pure functies zonder framework: ze krijgen
 * gewone gegevens binnen en geven een object terug dat <JsonLd> rendert.
 * NAW en openingstijden komen uit de database, zodat site, JSON-LD en Google
 * Bedrijfsprofiel nooit uit elkaar lopen.
 */

type JsonLdObject = Record<string, unknown>;

const SCHEMA_DAGEN = {
  maandag: "Monday",
  dinsdag: "Tuesday",
  woensdag: "Wednesday",
  donderdag: "Thursday",
  vrijdag: "Friday",
  zaterdag: "Saturday",
  zondag: "Sunday",
} as const;

type DagNaam = keyof typeof SCHEMA_DAGEN;
type Openingstijden = Record<DagNaam, { open: boolean; van: string; tot: string }>;

export type BedrijfsGegevens = {
  naam: string;
  url: string;
  telefoon: string | null;
  adres: string | null;
  openingstijden: Openingstijden;
};

export type DienstGegevens = { naam: string; beschrijving: string; prijs: number };

/** "Straat 1, 1234 AB Stad" wordt een PostalAddress; past het niet, dan blijft de hele tekst als straat staan. */
export function parseAdres(adres: string): JsonLdObject {
  const [straat = adres, rest = ""] = adres.split(",").map((deel) => deel.trim());
  const match = rest.match(/^(\d{4}\s?[A-Za-z]{2})\s+(.+)$/);

  return {
    "@type": "PostalAddress",
    streetAddress: straat,
    ...(match ? { postalCode: match[1], addressLocality: match[2] } : {}),
    addressCountry: "NL",
  };
}

export function openingstijdenJsonLd(openingstijden: Openingstijden): JsonLdObject[] {
  return (Object.keys(SCHEMA_DAGEN) as DagNaam[])
    .filter((dag) => openingstijden[dag].open)
    .map((dag) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAGEN[dag],
      opens: openingstijden[dag].van,
      closes: openingstijden[dag].tot,
    }));
}

export function organizationJsonLd(bedrijf: Pick<BedrijfsGegevens, "naam" | "url">, logo: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${bedrijf.url}/#organization`,
    name: bedrijf.naam,
    url: bedrijf.url,
    logo,
  };
}

export function websiteJsonLd(bedrijf: Pick<BedrijfsGegevens, "naam" | "url">, taal: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${bedrijf.url}/#website`,
    name: bedrijf.naam,
    url: bedrijf.url,
    inLanguage: taal,
    publisher: { "@id": `${bedrijf.url}/#organization` },
  };
}

/** Het lokale bedrijfstype (BarberShop, HairSalon, …) met NAW en openingstijden. */
export function localBusinessJsonLd(bedrijf: BedrijfsGegevens, type: string, afbeelding: string) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${bedrijf.url}/#localbusiness`,
    name: bedrijf.naam,
    url: bedrijf.url,
    image: afbeelding,
    ...(bedrijf.telefoon ? { telephone: bedrijf.telefoon } : {}),
    ...(bedrijf.adres ? { address: parseAdres(bedrijf.adres) } : {}),
    openingHoursSpecification: openingstijdenJsonLd(bedrijf.openingstijden),
  };
}

export function serviceJsonLd(
  dienst: DienstGegevens,
  bedrijf: Pick<BedrijfsGegevens, "url">,
  pad: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: dienst.naam,
    ...(dienst.beschrijving ? { description: dienst.beschrijving } : {}),
    provider: { "@id": `${bedrijf.url}/#localbusiness` },
    areaServed: "NL",
    url: `${bedrijf.url}${pad}`,
    // Prijs 0 betekent "nog niet ingesteld", niet "gratis": dan melden we geen aanbod aan Google.
    ...(dienst.prijs > 0
      ? {
          offers: {
            "@type": "Offer",
            price: dienst.prijs.toFixed(2),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(url: string, items: ReadonlyArray<{ naam: string; pad: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.naam,
      item: `${url}${item.pad}`,
    })),
  };
}

/** Alleen gebruiken op een pagina waar de vragen en antwoorden ook echt zichtbaar staan. */
export function faqJsonLd(vragen: ReadonlyArray<{ vraag: string; antwoord: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: vragen.map(({ vraag, antwoord }) => ({
      "@type": "Question",
      name: vraag,
      acceptedAnswer: { "@type": "Answer", text: antwoord },
    })),
  };
}

/**
 * Serialiseert voor in een <script>-tag. `<` wordt geëscaped zodat een dienst-
 * of bedrijfsnaam met `</script>` de pagina niet kan breken (XSS).
 */
export function serialiseerJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
