import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seller-config";

// /login, /dashboard and /onboarding stay crawlable so bots can see their noindex header.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
