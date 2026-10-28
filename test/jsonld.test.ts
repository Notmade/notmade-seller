import { describe, expect, it } from "vitest";
import { ALL_FAQ, SELLER_FAQ } from "@/app/landing/content/faq";
import { MODES } from "@/app/landing/content";
import { PUBLIC_PAGES } from "@/app/lib/public-pages";
import {
  breadcrumbLd, crumbsFor, faqLd, jsonLdHtml, organizationLd, pageMetadata, webPageLd, websiteLd,
} from "@/app/lib/seo";
import { INSTAGRAM_URL, MAIN_SITE_URL, SITE_URL, UAE_SITE_URL } from "@/app/lib/seller-config";

const FORBIDDEN = /^(aggregateRating|review|reviews|ratingValue|reviewCount|numberOfEmployees|memberOf|award)$/;

function keys(v: unknown, out: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => keys(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { out.push(k); keys(x, out); }
  return out;
}

const allLd = [
  organizationLd(), websiteLd(), faqLd(ALL_FAQ), ...MODES.map((m) => faqLd(m.faq)),
  ...PUBLIC_PAGES.map((p) => breadcrumbLd(crumbsFor(p.key))),
  webPageLd(PUBLIC_PAGES.find((p) => p.key === "sell-in-india")!, { code: "IN", name: "India" }),
  webPageLd(PUBLIC_PAGES.find((p) => p.key === "sell-in-uae")!, { code: "AE", name: "United Arab Emirates" }),
];

describe("JSON-LD", () => {
  it("Organization uses the real links from config", () => {
    const org = organizationLd();
    expect(org["@type"]).toBe("Organization");
    expect(org.sameAs).toEqual([INSTAGRAM_URL, MAIN_SITE_URL, UAE_SITE_URL]);
    expect(org.url).toBe(MAIN_SITE_URL);
  });

  it("WebSite is seller.notmade.in and published by the Organization", () => {
    const site = websiteLd();
    expect(site.url).toBe(SITE_URL);
    expect(site.publisher["@id"]).toBe(organizationLd()["@id"]);
  });

  it("has no ratings, reviews or other unsupported claims anywhere", () => {
    for (const ld of allLd) for (const k of keys(ld)) expect(k).not.toMatch(FORBIDDEN);
  });

  it("FAQPage on /faq is exactly the visible seller FAQ", () => {
    const ld = faqLd(ALL_FAQ);
    const visible = SELLER_FAQ.flatMap((g) => g.items);
    expect(ld.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(visible.map((f) => [f.q, f.a]));
    expect(new Set(visible.map((f) => f.q)).size).toBe(visible.length);
  });

  it("FAQ answers are short and contain no unfilled placeholders", () => {
    for (const f of [...ALL_FAQ, ...MODES.flatMap((m) => m.faq)]) {
      expect(f.a.length).toBeLessThan(500);
      expect(f.a).not.toMatch(/undefined|null|NaN|\{\{|TODO/);
    }
  });

  it("BreadcrumbList starts at home and uses absolute URLs", () => {
    for (const p of PUBLIC_PAGES) {
      const items = breadcrumbLd(crumbsFor(p.key)).itemListElement;
      expect(items[0].item).toBe(SITE_URL);
      expect(items.at(-1)!.item).toBe(`${SITE_URL}${p.path === "/" ? "" : p.path}`);
      items.forEach((it, i) => expect(it.position).toBe(i + 1));
    }
  });

  it("WebPage for a country page names the country and the canonical URL", () => {
    const ld = webPageLd(PUBLIC_PAGES.find((p) => p.key === "sell-in-uae")!, { code: "AE", name: "United Arab Emirates" });
    expect(ld.url).toBe(`${SITE_URL}/sell-in-uae`);
    expect(ld.about).toEqual({ "@type": "Country", name: "United Arab Emirates", identifier: "AE" });
    expect(ld.inLanguage).toBe("en-AE");
  });

  it("escapes < so page text cannot close the script tag", () => {
    const html = jsonLdHtml({ a: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("<");
    expect(JSON.parse(html)).toEqual({ a: "</script><script>alert(1)</script>" });
  });
});

describe("page metadata", () => {
  it("every public page has a unique title and description of a sensible length", () => {
    const titles = PUBLIC_PAGES.map((p) => p.title);
    const descs = PUBLIC_PAGES.map((p) => p.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
    for (const t of titles) expect(t.length).toBeLessThanOrEqual(60);
    for (const d of descs) { expect(d.length).toBeGreaterThan(70); expect(d.length).toBeLessThanOrEqual(170); }
  });

  it("sets canonical, Open Graph and a large Twitter card with an image", () => {
    for (const p of PUBLIC_PAGES) {
      const m = pageMetadata(p);
      expect(m.alternates?.canonical).toBe(p.path);
      expect(m.openGraph?.url).toBe(p.path);
      expect(JSON.stringify(m.openGraph?.images)).toContain(`/og/${p.key}`);
      expect(m.twitter).toMatchObject({ card: "summary_large_image" });
      expect(JSON.stringify(m.twitter)).toContain(`/og/${p.key}`);
    }
  });
});
