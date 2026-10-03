export type NavItem = { label: string; href: string };

/** Hoofdnavigatie. De sitemap leest deze lijst ook, zodat een nieuwe pagina nooit vergeten wordt. */
export const hoofdNavigatie: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Diensten", href: "/diensten" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Galerij", href: "/galerij" },
  { label: "Contact", href: "/contact" },
];

export const boekenLink: NavItem = { label: "Boeken", href: "/boeken" };

export const juridischeLinks: readonly NavItem[] = [
  { label: "Privacybeleid", href: "/privacybeleid" },
  { label: "Algemene voorwaarden", href: "/algemene-voorwaarden" },
];

/** Pagina's die in de sitemap horen, met de prioriteit die zoekmachines als hint krijgen. */
export const sitemapPaginas: ReadonlyArray<{
  href: string;
  prioriteit: number;
  frequentie: "weekly" | "monthly" | "yearly";
}> = [
  { href: "/", prioriteit: 1, frequentie: "weekly" },
  { href: "/boeken", prioriteit: 0.9, frequentie: "weekly" },
  { href: "/diensten", prioriteit: 0.8, frequentie: "monthly" },
  { href: "/over-ons", prioriteit: 0.6, frequentie: "monthly" },
  { href: "/contact", prioriteit: 0.6, frequentie: "monthly" },
  { href: "/galerij", prioriteit: 0.5, frequentie: "monthly" },
  { href: "/privacybeleid", prioriteit: 0.2, frequentie: "yearly" },
  { href: "/algemene-voorwaarden", prioriteit: 0.2, frequentie: "yearly" },
];

/** Paden die zoekmachines niet mogen indexeren. */
export const nietIndexeren: readonly string[] = ["/admin", "/boeking/annuleren"];
