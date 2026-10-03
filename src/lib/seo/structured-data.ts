/**
 * JSON-LD builders (schema.org). Pure functies zonder framework: ze krijgen
 * gewone gegevens binnen en geven een object terug dat <JsonLd> rendert.
 * NAW en openingstijden komen uit de database, zodat site, JSON-LD en Google
 * Bedrijfsprofiel nooit uit elkaar lopen.
 */

type JsonLdObject = Record<string, unknown>;

const SCHEMA_WEEKDAYS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
} as const;

type WeekdayName = keyof typeof SCHEMA_WEEKDAYS;
type OpeningHours = Record<WeekdayName, { open: boolean; from: string; to: string }>;

export type BusinessData = {
  name: string;
  url: string;
  phone: string | null;
  address: string | null;
  openingHours: OpeningHours;
};

export type ServiceData = { name: string; description: string; price: number };

/** "Straat 1, 1234 AB Stad" wordt een PostalAddress; past het niet, dan blijft de hele tekst als straat staan. */
export function parseAddress(address: string): JsonLdObject {
  const [street = address, rest = ""] = address.split(",").map((part) => part.trim());
  const match = rest.match(/^(\d{4}\s?[A-Za-z]{2})\s+(.+)$/);

  return {
    "@type": "PostalAddress",
    streetAddress: street,
    ...(match ? { postalCode: match[1], addressLocality: match[2] } : {}),
    addressCountry: "NL",
  };
}

export function openingHoursJsonLd(openingHours: OpeningHours): JsonLdObject[] {
  return (Object.keys(SCHEMA_WEEKDAYS) as WeekdayName[])
    .filter((day) => openingHours[day].open)
    .map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_WEEKDAYS[day],
      opens: openingHours[day].from,
      closes: openingHours[day].to,
    }));
}

export function organizationJsonLd(business: Pick<BusinessData, "name" | "url">, logo: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${business.url}/#organization`,
    name: business.name,
    url: business.url,
    logo,
  };
}

export function websiteJsonLd(business: Pick<BusinessData, "name" | "url">, language: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${business.url}/#website`,
    name: business.name,
    url: business.url,
    inLanguage: language,
    publisher: { "@id": `${business.url}/#organization` },
  };
}

/** Het lokale bedrijfstype (BarberShop, HairSalon, …) met NAW en openingstijden. */
export function localBusinessJsonLd(business: BusinessData, type: string, image: string) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${business.url}/#localbusiness`,
    name: business.name,
    url: business.url,
    image: image,
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.address ? { address: parseAddress(business.address) } : {}),
    openingHoursSpecification: openingHoursJsonLd(business.openingHours),
  };
}

export function serviceJsonLd(
  service: ServiceData,
  business: Pick<BusinessData, "url">,
  path: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    ...(service.description ? { description: service.description } : {}),
    provider: { "@id": `${business.url}/#localbusiness` },
    areaServed: "NL",
    url: `${business.url}${path}`,
    // Prijs 0 betekent "nog niet ingesteld", niet "gratis": dan melden we geen aanbod aan Google.
    ...(service.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: service.price.toFixed(2),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(
  url: string,
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${url}${item.path}`,
    })),
  };
}

/** Alleen gebruiken op een pagina waar de vragen en antwoorden ook echt zichtbaar staan. */
export function faqJsonLd(questions: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/**
 * Serialiseert voor in een <script>-tag. `<` wordt geëscaped zodat een dienst-
 * of bedrijfsnaam met `</script>` de pagina niet kan breken (XSS).
 */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
