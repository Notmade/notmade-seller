import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { selectLegalCountry } from "@/app/legal/country";
import { ENTITY, UAE_PRIVACY, UAE_REFUNDS, UAE_TERMS } from "@/app/legal/uae";
import sitemap from "@/app/sitemap";
import Terms from "@/app/terms/page";
import Privacy from "@/app/privacy-policy/page";
import Refunds from "@/app/refund-policy/page";
import UaeTerms, { metadata as uaeTermsMeta } from "@/app/uae/terms/page";
import UaePrivacy, { metadata as uaePrivacyMeta } from "@/app/uae/privacy-policy/page";
import UaeRefunds, { metadata as uaeRefundsMeta } from "@/app/uae/refund-policy/page";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({ cookies: () => ({ get: (k: string) => (jar.has(k) ? { value: jar.get(k) } : undefined) }) }));
vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Error(`redirect:${to}`); } }));

const PAGES = [
  ["terms", Terms, UaeTerms, uaeTermsMeta],
  ["privacy-policy", Privacy, UaePrivacy, uaePrivacyMeta],
  ["refund-policy", Refunds, UaeRefunds, uaeRefundsMeta],
] as const;
const india = (Page: (typeof PAGES)[number][1], market?: string) => renderToStaticMarkup(<Page searchParams={{ market }} />);
const uae = (Page: (typeof PAGES)[number][2]) => renderToStaticMarkup(<Page />).replace(/&#x27;/g, "'");

/** The whole rendered page, including links and attributes. Emails on the notmade.in domain are not country text. */
const NOT_ON_UAE = /\bIndia\b|\bIndian\b|\bGST|\bINR\b|₹|Private Limited|Delhi|\+91/;
const NOT_ON_INDIA = /\bUAE\b|\bAED\b|\bVAT\b|\bTRN\b|FZE|Emirat|Ajman/;

beforeEach(() => jar.clear());

describe("legal country selection", () => {
  it("puts a signed-in seller's country first", () => {
    expect(selectLegalCountry("AE", "in", "in")).toBe("AE");
    expect(selectLegalCountry("IN", "ae", "ae")).toBe("IN");
  });

  it("then the page's market, then the landing market, then India", () => {
    expect(selectLegalCountry(undefined, "ae", "in")).toBe("AE");
    expect(selectLegalCountry(undefined, "in", "ae")).toBe("IN");
    expect(selectLegalCountry(undefined, undefined, "ae")).toBe("AE");
    expect(selectLegalCountry(undefined, undefined, undefined)).toBe("IN");
    expect(selectLegalCountry("XX", ["ae"], "zz")).toBe("IN");
  });

  it("sends UAE visitors from the shared URL to the UAE page", () => {
    expect(() => india(Terms, "ae")).toThrow("redirect:/uae/terms");
    jar.set("nm_market", "ae");
    expect(() => india(Privacy)).toThrow("redirect:/uae/privacy-policy");
    jar.clear();
    jar.set("nm_seller_country", "AE");
    expect(() => india(Refunds, "in")).toThrow("redirect:/uae/refund-policy");
  });

  it("sends a signed-in India seller from a UAE page to their own", () => {
    jar.set("nm_seller_country", "IN");
    expect(() => uae(UaeTerms)).toThrow("redirect:/terms");
  });
});

describe.each(PAGES)("%s page", (slug, Page, UaePage, meta) => {
  it("UAE version has nothing from the other country", () => {
    const page = uae(UaePage);
    expect(page).not.toMatch(NOT_ON_UAE);
    expect(page).toContain(ENTITY.name);
  });

  it("UAE version is finished and indexable at its own URL", () => {
    expect(uae(UaePage)).not.toMatch(/LAWYER REVIEW|placeholder|to be confirmed/i);
    expect(meta.robots).toBeUndefined();
    expect(meta.alternates?.canonical).toBe(`/uae/${slug}`);
    expect(sitemap().map((e) => e.url)).toContain(`https://seller.notmade.in/uae/${slug}`);
  });

  it("India version has nothing from the other country", () => {
    expect(india(Page, "in")).not.toMatch(NOT_ON_INDIA);
    expect(india(Page)).not.toMatch(NOT_ON_INDIA);
  });
});

describe("UAE legal wording", () => {
  const terms = uae(UaeTerms);

  it("uses the v2 governing law and courts", () => {
    expect(terms).toContain("governed by the laws of the United Arab Emirates as applied in the Emirate of Ajman");
    expect(terms).toContain("the courts of Ajman shall have jurisdiction");
  });

  it("covers AED, VAT and TRN", () => {
    for (const s of ["AED", "VAT", "TRN", "IBAN"]) expect(terms).toContain(s);
  });

  it("says how changes take effect", () => {
    expect(terms).toMatch(/by email or in the seller dashboard/);
    expect(terms).toMatch(/continue to use the platform/);
  });

  it("cites the consumer protection law and the store's seven-day window", () => {
    const page = uae(UaeRefunds);
    expect(page).toContain("Federal Law No. 15 of 2020 on Consumer Protection");
    expect(page).toContain("seven (7) days of delivery");
  });

  it("cites the data law and gives the rights contact", () => {
    const page = uae(UaePrivacy);
    expect(page).toContain("Federal Decree-Law No. 45 of 2021");
    expect(page).toMatch(/access, correct or delete/);
    expect(page).toContain("care@notmade.in");
    for (const s of ["trade licence", "TRN", "Emirates ID", "IBAN"]) expect(page).toContain(s);
  });

  it("traces every section to a source", () => {
    for (const s of [...UAE_TERMS.sections, ...UAE_REFUNDS.sections, ...UAE_PRIVACY.sections]) expect(s.source).not.toBe("");
  });
});

describe("India terms stay as they were", () => {
  it("keeps Indian law and courts", () => {
    const page = india(Terms, "in");
    expect(page).toContain("governed by the laws of India");
    expect(page).toContain("courts in Delhi");
    expect(page).toContain("+91 93548 52701");
  });
});

describe("seller views in source", () => {
  const read = (p: string) => readFileSync(p, "utf8");

  it("clears the country hint when the session ends", () => {
    expect(read("app/lib/seller-api.ts")).toMatch(/clearSession[\s\S]*?COUNTRY_COOKIE/);
  });

  it("the old switch is gone from the landing pages", () => {
    expect(read("app/components/landing/SiteHeader.tsx")).not.toMatch(/>India<\/a>|>UAE<\/a>/);
  });
});
