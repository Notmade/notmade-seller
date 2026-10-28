import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seller-config";

/** Signed-in seller panel, onboarding (documents, agreement signing) and the API. Never crawled. */
export const PRIVATE_PATHS = ["/dashboard", "/onboarding", "/api/"];

/**
 * Search and AI crawlers named so their access to the public pages is explicit. Google-Extended and
 * Applebot-Extended are opt-in tokens for use in Google's and Apple's AI models, not separate crawlers.
 */
export const NAMED_CRAWLERS = [
  "Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot",
  "PerplexityBot", "Google-Extended", "Applebot-Extended",
];

// /login is not disallowed: it is noindex (meta and X-Robots-Tag), and crawlers must fetch it to see that.
// A crawler obeys only the most specific group that names it, so each group repeats the disallow list.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: NAMED_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
