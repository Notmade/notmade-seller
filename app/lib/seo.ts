import type { Metadata } from "next";
import { CONTACT_EMAIL, INSTAGRAM_URL, LEGAL_NAME, MAIN_SITE_URL, SITE_URL } from "./seller-config";

const SITE_NAME = "NOTMADE Seller";

/** Metadata for an indexable public page: absolute title, description, canonical, OG and Twitter. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_IN" },
    twitter: { card: "summary", title, description },
  };
}

export const NOINDEX: Metadata = { robots: { index: false, follow: false } };

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NOTMADE",
    legalName: LEGAL_NAME,
    url: MAIN_SITE_URL,
    email: CONTACT_EMAIL,
    sameAs: [INSTAGRAM_URL, MAIN_SITE_URL],
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path === "/" ? "" : c.path}`,
    })),
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
