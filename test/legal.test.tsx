import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { selectLegalCountry } from "@/app/legal/country";
import { ENTITY, REVIEW_LABEL, UAE_PRIVACY, UAE_REFUNDS, UAE_TERMS } from "@/app/legal/uae";
import Terms, { generateMetadata } from "@/app/terms/page";
import Privacy from "@/app/privacy-policy/page";
import Refunds from "@/app/refund-policy/page";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({ cookies: () => ({ get: (k: string) => (jar.has(k) ? { value: jar.get(k) } : undefined) }) }));

const PAGES = [["terms", Terms], ["privacy", Privacy], ["refunds", Refunds]] as const;
const html = (Page: (typeof PAGES)[number][1], market?: string) => renderToStaticMarkup(<Page searchParams={{ market }} />);

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

  it("serves the seller's own version from cookies", () => {
    jar.set("nm_seller_country", "AE");
    expect(html(Terms, "in")).toContain(ENTITY.name);
    jar.clear();
    jar.set("nm_market", "ae");
    expect(html(Terms)).toContain(ENTITY.name);
  });
});

describe.each(PAGES)("%s page", (_, Page) => {
  it("UAE version has nothing from the other country", () => {
    const page = html(Page, "ae");
    expect(page).not.toMatch(NOT_ON_UAE);
    expect(page).toContain(ENTITY.name);
    expect(page).toContain(REVIEW_LABEL);
  });

  it("India version has nothing from the other country", () => {
    expect(html(Page, "in")).not.toMatch(NOT_ON_INDIA);
    expect(html(Page)).not.toMatch(NOT_ON_INDIA);
  });
});

describe("UAE terms", () => {
  const page = html(Terms, "ae");

  it("uses UAE law, leaves the courts to the lawyer", () => {
    expect(page).toContain("governed by the laws of the United Arab Emirates");
    expect(page).toContain("Exact courts and venue");
    const law = UAE_TERMS.sections.find((s) => s.heading.startsWith("GOVERNING LAW"))!;
    expect(JSON.stringify(law)).not.toMatch(/courts of|Ajman/);
  });

  it("covers AED, VAT and TRN", () => {
    for (const s of ["AED", "VAT", "TRN", "IBAN"]) expect(page).toContain(s);
  });

  it("has no text that is not traced to the agreement or marked for review", () => {
    for (const s of [...UAE_TERMS.sections, ...UAE_REFUNDS.sections]) expect(Boolean(s.source || s.review)).toBe(true);
    expect(UAE_PRIVACY.sections.some((s) => s.review)).toBe(true);
  });

  it("is kept out of search while placeholders remain", () => {
    expect(generateMetadata({ searchParams: { market: "ae" } }).robots).toEqual({ index: false, follow: false });
    expect(generateMetadata({ searchParams: {} }).robots).toBeUndefined();
  });
});

describe("India terms stay as they were", () => {
  it("keeps Indian law and courts", () => {
    const page = html(Terms, "in");
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
