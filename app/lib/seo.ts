import type { Metadata } from "next";
import { getPage, type PageKey, type PublicPage } from "./public-pages";
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

// ─── Pages listed in app/lib/public-pages.ts ─────────────────────────────────

export const OG_SIZE = { width: 1200, height: 630 };

/** Absolute URL on seller.notmade.in; the home page has no trailing slash. */
export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Generated share image for a page (app/og/[page]/route.tsx). */
export const ogImagePath = (key: PageKey) => `/og/${key}`;

/** Metadata for a registered page: absolute title, canonical, OG and Twitter with a generated image. */
export function registeredPageMetadata({ title, description, path, key, locale }: PublicPage): Metadata {
  const image = { url: ogImagePath(key), ...OG_SIZE, alt: title, type: "image/png" };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: "NOTMADE Seller", type: "website", locale, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export const metadataFor = (key: PageKey): Metadata => registeredPageMetadata(getPage(key));

export type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

/** Home → page breadcrumb for a public page. */
export function crumbsFor(key: PageKey): Crumb[] {
  const home = { name: getPage("home").name, path: "/" };
  if (key === "home") return [home];
  const page = getPage(key);
  return [home, { name: page.name, path: page.path }];
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "NOTMADE Seller",
    url: SITE_URL,
    inLanguage: "en",
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so text can never close the tag. */
export const jsonLdHtml = ldJson;
