/**
 * JSON-LD builders (schema.org). Pure functions without a framework: they take
 * plain data and return an object that <JsonLd> renders. Name/address/phone
 * and opening hours come from the database, so site, JSON-LD and Google
 * Business Profile never drift apart.
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

/** "Street 1, 1234 AB City" becomes a PostalAddress; if it does not fit, the whole text stays as the street. */
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

/** The local business type (BarberShop, HairSalon, …) with address and opening hours. */
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
    // Price 0 means "not set yet", not "free": then we report no offer to Google.
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

/** Only use on a page where the questions and answers are actually visible. */
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
 * Serializes for use inside a <script> tag. `<` is escaped so a service or
 * business name containing `</script>` cannot break the page (XSS).
 */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
