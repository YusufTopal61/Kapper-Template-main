import type { MetadataRoute } from "next";
import { sitemapPages } from "@/config/navigation";
import { getSiteUrl } from "@/lib/env.server";

/**
 * De sitemap wordt gegenereerd uit dezelfde paginalijst als de navigatie en
 * wordt dus nooit handmatig bijgehouden. Er zijn nog geen pagina's per dienst;
 * komen die er, dan voegen we ze hier toe vanuit de database.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return sitemapPages.map((page) => ({
    url: `${base}${page.href === "/" ? "" : page.href}` || "/",
    changeFrequency: page.frequency,
    priority: page.priority,
  }));
}
