/**
 * Fixed site data. Everything the owner can change (address, phone, opening
 * hours) is NOT here but in the database (settings feature): that is the single
 * source of truth, also for JSON-LD.
 */
export const siteConfig = {
  /** Brand name in titles and structured data. */
  brandName: "BARBER",
  title: "BARBER — Premium barbershop",
  description:
    "Scherp geknipt, rustig afgewerkt. Knippen, baard en de volledige behandeling. Plan eenvoudig online je afspraak.",
  language: "nl",
  locale: "nl_NL",
  themeColor: "#0a0a0a",
  ogImage: "/og-image.png",
  /** schema.org type for local SEO: BarberShop, HairSalon, AutoDealer, … */
  localType: "BarberShop",
} as const;

/**
 * The agency that built and maintains the site. Used for the footer credit and
 * the help line in the admin panel. Business facts only, no personal details.
 */
export const builder = {
  name: "YM Creations",
  url: "https://ymcreations.com",
  email: "contact@ymcreations.com",
  phone: "+31 6 53 40 02 20",
  kvk: "96175354",
} as const;
