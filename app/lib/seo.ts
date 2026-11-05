import type { Metadata } from "next";
import { CONTACT_EMAIL, INSTAGRAM_URL, SITE_URL } from "./seller-config";

const SITE_NAME = "NOTMADE Seller";

/** Metadata for an indexable public page: absolute title, description, canonical, OG and Twitter. */
export function pageMetadata({ title, description, path, locale = "en_IN" }: { title: string; description: string; path: string; locale?: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: "website", locale },
    twitter: { card: "summary", title, description },
  };
}

export const NOINDEX: Metadata = { robots: { index: false, follow: false } };

/** Business that runs the seller programme in one country. */
export function organizationLd({ legalName, url, country }: { legalName: string; url: string; country: "IN" | "AE" }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NOTMADE",
    legalName,
    url,
    email: CONTACT_EMAIL,
    areaServed: { "@type": "Country", name: country === "AE" ? "United Arab Emirates" : "India" },
    sameAs: [INSTAGRAM_URL, url],
  };
}

/** The landing page itself: what is offered, to whom, in which country. */
export function webPageLd({ name, description, path, country }: { name: string; description: string; path: string; country: "IN" | "AE" }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    inLanguage: country === "AE" ? "en-AE" : "en-IN",
    audience: { "@type": "BusinessAudience", geographicArea: { "@type": "Country", name: country === "AE" ? "United Arab Emirates" : "India" } },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Script-safe JSON for a ld+json tag. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
