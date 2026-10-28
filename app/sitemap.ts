import type { MetadataRoute } from "next";
import { PUBLIC_PAGES } from "./lib/public-pages";
import { absoluteUrl } from "./lib/seo";

// Public pages only (app/lib/public-pages.ts). /login, /onboarding and /dashboard are noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: p.lastModified,
    changeFrequency: "monthly",
    priority: p.priority,
  }));
}
