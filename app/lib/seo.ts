import type { Metadata } from "next";
import { SELLER_SUPPORT_EMAIL } from "./currency";
import { getPage, type PageKey, type PublicPage } from "./public-pages";
import { CONTACT_EMAIL, INDIA_PHONE, INSTAGRAM_URL, MAIN_SITE_URL, SITE_URL, UAE_SITE_URL } from "./seller-config";

const SITE_NAME = "NOTMADE Seller";
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const OG_SIZE = { width: 1200, height: 630 };

/** Absolute URL on seller.notmade.in; the home page has no trailing slash. */
export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Generated share image for a page (app/og/[page]/route.tsx). */
export const ogImagePath = (key: PageKey) => `/og/${key}`;

/** Metadata for an indexable public page: absolute title, description, canonical, OG and Twitter with image. */
export function pageMetadata(page: PublicPage): Metadata {
  const { title, description, path, key, locale } = page;
  const image = { url: ogImagePath(key), ...OG_SIZE, alt: title, type: "image/png" };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: "website", locale, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export const metadataFor = (key: PageKey): Metadata => pageMetadata(getPage(key));

export const NOINDEX: Metadata = { robots: { index: false, follow: false } };

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "NOTMADE",
    url: MAIN_SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    email: CONTACT_EMAIL,
    sameAs: [INSTAGRAM_URL, MAIN_SITE_URL, UAE_SITE_URL],
    contactPoint: [{
      "@type": "ContactPoint",
      contactType: "seller support",
      email: SELLER_SUPPORT_EMAIL,
      telephone: INDIA_PHONE.replace(/\s/g, ""),
      areaServed: ["IN", "AE"],
      availableLanguage: ["en"],
    }],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

/** WebPage for a country page: what the page is about and which site it belongs to. */
export function webPageLd(page: PublicPage, country: { code: "IN" | "AE"; name: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(page.path)}#webpage`,
    url: absoluteUrl(page.path),
    name: page.title,
    description: page.description,
    inLanguage: page.locale.replace("_", "-"),
    dateModified: page.lastModified,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    about: { "@type": "Country", name: country.name, identifier: country.code },
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
      item: absoluteUrl(c.path),
    })),
  };
}

/** Home → page breadcrumb for a public page. */
export function crumbsFor(key: PageKey): Crumb[] {
  const home = { name: getPage("home").name, path: "/" };
  if (key === "home") return [home];
  const page = getPage(key);
  return [home, { name: page.name, path: page.path }];
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

/** JSON for a <script type="application/ld+json">, with "<" escaped so text can never close the tag. */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
