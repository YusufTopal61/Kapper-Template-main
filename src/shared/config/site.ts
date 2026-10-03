/**
 * Vaste gegevens van de site. Alles wat de eigenaar zelf kan wijzigen (adres,
 * telefoon, openingstijden) staat NIET hier maar in de database (module
 * settings): daar is het de enige bron van waarheid, ook voor JSON-LD.
 */
export const siteConfig = {
  /** Merknaam in titels en structured data. */
  merknaam: "BARBER",
  titel: "BARBER — Premium barbershop",
  beschrijving:
    "Scherp geknipt, rustig afgewerkt. Knippen, baard en de volledige behandeling. Plan eenvoudig online je afspraak.",
  taal: "nl",
  locale: "nl_NL",
  themeColor: "#0a0a0a",
  ogImage: "/og-image.png",
  /** schema.org-type voor lokale SEO: BarberShop, HairSalon, AutoDealer, … */
  lokaalType: "BarberShop",
} as const;
