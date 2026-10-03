export type NavItem = { label: string; href: string };

/** Main navigation. The sitemap reads this list too, so a new page is never forgotten. */
export const mainNavigation: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Diensten", href: "/diensten" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Galerij", href: "/galerij" },
  { label: "Contact", href: "/contact" },
];

export const bookingLink: NavItem = { label: "Boeken", href: "/boeken" };

export const legalLinks: readonly NavItem[] = [
  { label: "Privacybeleid", href: "/privacybeleid" },
  { label: "Algemene voorwaarden", href: "/algemene-voorwaarden" },
];

/** Pages that belong in the sitemap, with the priority search engines get as a hint. */
export const sitemapPages: ReadonlyArray<{
  href: string;
  priority: number;
  frequency: "weekly" | "monthly" | "yearly";
}> = [
  { href: "/", priority: 1, frequency: "weekly" },
  { href: "/boeken", priority: 0.9, frequency: "weekly" },
  { href: "/diensten", priority: 0.8, frequency: "monthly" },
  { href: "/over-ons", priority: 0.6, frequency: "monthly" },
  { href: "/contact", priority: 0.6, frequency: "monthly" },
  { href: "/galerij", priority: 0.5, frequency: "monthly" },
  { href: "/privacybeleid", priority: 0.2, frequency: "yearly" },
  { href: "/algemene-voorwaarden", priority: 0.2, frequency: "yearly" },
];

/** Paths search engines must not index. */
export const noIndex: readonly string[] = ["/admin", "/boeking/annuleren"];
