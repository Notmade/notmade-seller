import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seller-config";

// Public pages only; /login, /onboarding and /dashboard are noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: "/", priority: 1 },
    { path: "/terms", priority: 0.5 },
    { path: "/privacy-policy", priority: 0.3 },
    { path: "/refund-policy", priority: 0.3 },
  ].map(({ path, priority }) => ({ url: `${SITE_URL}${path === "/" ? "" : path}`, changeFrequency: "monthly", priority }));
}
