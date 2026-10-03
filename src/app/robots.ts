import type { MetadataRoute } from "next";
import { nietIndexeren } from "@/shared/config/navigation";
import { getSiteUrl } from "@/shared/lib/env.server";

export default function robots(): MetadataRoute.Robots {
  const basis = getSiteUrl();

  return {
    rules: { userAgent: "*", allow: "/", disallow: [...nietIndexeren] },
    ...(basis ? { sitemap: `${basis}/sitemap.xml`, host: basis } : {}),
  };
}
