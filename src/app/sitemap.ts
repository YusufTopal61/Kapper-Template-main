import type { MetadataRoute } from "next";
import { sitemapPages } from "@/config/navigation";
import { getSiteUrl } from "@/lib/env.server";

/**
 * The sitemap is generated from the same page list as the navigation, so it is
 * never maintained by hand. There are no per-service pages yet; once there are,
 * we add them here from the database.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return sitemapPages.map((page) => ({
    url: `${base}${page.href === "/" ? "" : page.href}` || "/",
    changeFrequency: page.frequency,
    priority: page.priority,
  }));
}
