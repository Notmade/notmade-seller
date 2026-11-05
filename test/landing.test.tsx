import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import IndiaLanding from "@/app/components/landing/IndiaLanding";
import UaeLanding from "@/app/components/landing/UaeLanding";
import india from "@/app/landing/content/in";
import uae from "@/app/landing/content/ae";
import { DEFAULT_MODE, selectMode } from "@/app/landing/content";
import { uaePaymentOptions, type ConfigPaymentMethod } from "@/app/lib/landing-data";
import { resolveRateCard, UAE_RATE_CARD_FALLBACK } from "@/app/lib/rate-card";

const rates = resolveRateCard(null);
const uaeHtml = (methods: ConfigPaymentMethod[] = [], signupOpen = true) =>
  renderToStaticMarkup(<UaeLanding rates={rates} methods={methods} signupOpen={signupOpen} />);
const indiaHtml = () => renderToStaticMarkup(<IndiaLanding />);

const text = (html: string) => html.replace(/&#x27;/g, "'");

describe("landing selection by country", () => {
  it("prefers ?market=, then the cookie, then India", () => {
    expect(selectMode("ae", "in")).toBe("ae");
    expect(selectMode("in", "ae")).toBe("in");
    expect(selectMode(undefined, "ae")).toBe("ae");
    expect(selectMode(undefined, undefined)).toBe(DEFAULT_MODE);
    expect(DEFAULT_MODE).toBe("in");
  });

  it("ignores unknown or repeated values", () => {
    expect(selectMode("global", undefined)).toBe("in");
    expect(selectMode("global", "ae")).toBe("ae");
    expect(selectMode(["ae", "in"], undefined)).toBe("in");
    expect(selectMode(undefined, "xx")).toBe("in");
  });

  it("shows the current country and a way to change it", () => {
    expect(indiaHtml()).toContain('<span aria-current="true">India</span>');
    expect(uaeHtml()).toContain('<span aria-current="true">UAE</span>');
    expect(indiaHtml()).toContain('href="/country"');
    expect(uaeHtml()).toContain('href="/country"');
  });

  it("each page has its own SEO copy and structured data", () => {
    expect(india.meta.title).not.toBe(uae.meta.title);
    expect(india.meta.description).not.toBe(uae.meta.description);
    expect(indiaHtml()).toContain("House of Notmade Studio Private Limited");
    const ld = (html: string) => JSON.parse(html.match(/application\/ld\+json">([\s\S]*?)<\/script>/)![1].replace(/\\u003c/g, "<"));
    expect(ld(indiaHtml())[0].areaServed.name).toBe("India");
    expect(ld(uaeHtml())[0].areaServed.name).toBe("United Arab Emirates");
    expect(ld(uaeHtml())[0].legalName).toBe("House of Notmade Studio FZE LLC");
    expect(ld(indiaHtml()).map((x: { "@type": string }) => x["@type"])).toEqual(["Organization", "WebPage", "FAQPage"]);
  });

  it("server-only page selection keeps both countries out of one client bundle", () => {
    const parts = readFileSync("app/components/landing/parts.tsx", "utf8") + readFileSync("app/components/landing/SiteHeader.tsx", "utf8");
    expect(parts).not.toMatch(/landing\/content\/(in|ae)"/);
  });
});

describe("India page", () => {
  const page = text(indiaHtml());

  it("states the commission word for word", () => {
    expect(page).toContain("flat 17% commission, no other charges");
  });

  it("carries the required content", () => {
    for (const s of ["Sell across", "Fashion", "Accessories", "Home decor", "many more categories", "Logistics and shipping support",
      "House of Notmade Studio Private Limited", "INR", "Register to sell", "Questions, answered."]) expect(page).toContain(s);
  });

  it("names nothing from the other country", () => {
    expect(page).not.toMatch(/\bUAE\b|\bAED\b|\bVAT\b|\bTRN\b|Dubai|Emirat|dirham|Tabby|Tamara|FZE/i);
  });

  it("has no rate card or shipping modes", () => {
    expect(page).not.toMatch(/seller ships|notmade ships|rate card|electronics|shipping included/i);
    expect(page.match(/\d+%/g)!.every((m) => m === "17%")).toBe(true);
  });
});

describe("UAE page", () => {
  const page = text(uaeHtml());

  it("names nothing from the other country", () => {
    expect(page).not.toMatch(/\bIndia|\bINR\b|₹|rupee|Private Limited|Delhi|\bGST|Aadhaar|\bPAN\b|\+91/i);
  });

  it("shows the rate card with AED examples", () => {
    for (const s of ["Electronics", "Seller ships", "NOTMADE ships", "Fashion and accessories", "Shipping included", "12%", "14%", "17%",
      "AED 1,000.00", "AED 880.00", "AED 860.00", "AED 166.00"]) expect(page).toContain(s);
  });

  it("says the terms apply to new sellers, and never mentions existing sellers", () => {
    expect(page).toContain("These terms apply to new sellers.");
    expect(page).not.toMatch(/existing seller/i);
  });

  it("carries the required content", () => {
    for (const s of ["Cards", "Tabby", "Instagram", "WhatsApp", "A new sales channel for UAE brands", "under UAE terms",
      "House of Notmade Studio FZE LLC", "AED payouts", "Register to sell"]) expect(page).toContain(s);
  });

  it("does not make a single-figure or selling-across-countries claim", () => {
    expect(page).not.toMatch(/45%|cross[- ]?border|across countries|international/i);
  });

  it("uses live rates when the backend sends them", () => {
    const live = resolveRateCard({ uae_rate_card: { electronics_seller_ships_pct: 11 } });
    const html = renderToStaticMarkup(<UaeLanding rates={live} methods={[]} signupOpen />);
    expect(html).toContain("11%");
  });

  it("shows the waitlist while sign-up is closed", () => {
    const html = uaeHtml([], false);
    expect(html).toContain("Join the waitlist");
    expect(html).not.toContain("/login?market=ae&amp;apply=1");
  });
});

describe("UAE payment options", () => {
  const names = (m: ConfigPaymentMethod[]) => uaePaymentOptions(m).options.map((o) => o.name);

  it("mentions Tamara only when it is enabled", () => {
    expect(names([])).toEqual(["Cards", "Tabby"]);
    expect(uaePaymentOptions([]).moreComing).toBe(true);
    expect(text(uaeHtml([]))).not.toMatch(/tamara/i);
    expect(text(uaeHtml([]))).toContain("More options coming");

    const on = [{ id: "tamara", type: "online", provider: "tamara" }];
    expect(names(on)).toContain("Tamara");
    expect(uaePaymentOptions(on).moreComing).toBe(false);
    expect(text(uaeHtml(on))).not.toContain("More options coming");
  });

  it("does not repeat Tabby, and cash on delivery alone still means more are coming", () => {
    const r = uaePaymentOptions([{ id: "tabby", provider: "tabby", type: "online" }, { id: "cod", type: "cod" }]);
    expect(r.options.filter((o) => o.name === "Tabby")).toHaveLength(1);
    expect(r.moreComing).toBe(true);
  });
});

describe("rate card", () => {
  it("falls back to the published values", () => {
    expect(rates).toMatchObject({ ...UAE_RATE_CARD_FALLBACK, live: false });
  });

  it("never uses the rate of any other seller type", () => {
    const r = resolveRateCard({ uae_local_pct: 17, international_pct: 45 } as never);
    expect(r.electronics_seller_ships_pct).toBe(12);
    expect(r.electronics_notmade_ships_pct).toBe(14);
    expect(r.fashion_accessories_pct).toBe(17);
  });

  it("rejects bad values rate by rate", () => {
    const r = resolveRateCard({ uae_rate_card: { electronics_seller_ships_pct: 150, electronics_notmade_ships_pct: 13 } });
    expect(r.electronics_seller_ships_pct).toBe(12);
    expect(r.electronics_notmade_ships_pct).toBe(13);
  });
});
