import type { MetadataRoute } from "next";
import { sitemapPaginas } from "@/shared/config/navigation";
import { getSiteUrl } from "@/shared/lib/env.server";

/**
 * De sitemap wordt gegenereerd uit dezelfde paginalijst als de navigatie en
 * wordt dus nooit handmatig bijgehouden. Er zijn nog geen pagina's per dienst;
 * komen die er, dan voegen we ze hier toe vanuit de database.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const basis = getSiteUrl();

  return sitemapPaginas.map((pagina) => ({
    url: `${basis}${pagina.href === "/" ? "" : pagina.href}` || "/",
    changeFrequency: pagina.frequentie,
    priority: pagina.prioriteit,
  }));
}
