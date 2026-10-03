import type { MetadataRoute } from "next";
import { noIndex } from "@/config/navigation";
import { getSiteUrl } from "@/lib/env.server";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: { userAgent: "*", allow: "/", disallow: [...noIndex] },
    ...(base ? { sitemap: `${base}/sitemap.xml`, host: base } : {}),
  };
}
