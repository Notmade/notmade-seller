import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import IndiaLanding from "@/app/components/landing/IndiaLanding";
import UaeLanding from "@/app/components/landing/UaeLanding";
import india from "@/app/landing/content/in";
import uae from "@/app/landing/content/ae";
import { DEFAULT_MODE, selectMode } from "@/app/landing/content";
import { flipScript } from "@/app/components/landing/flip";
import { uaePaymentOptions, withLiveStandardRate, type StorePaymentConfig } from "@/app/lib/landing-data";
import { COMMISSION_STATEMENT_INDIA } from "@/app/lib/seller-config";

const LIVE_CONFIG: StorePaymentConfig = {
  payment_methods: [
    { id: "tabby", type: "online", provider: "tabby", label: "Pay later with Tabby", enabled: true, preview: false },
    { id: "cod", type: "cod", provider: null, label: "Cash on delivery" },
  ],
  payments: { online: { enabled: true, provider: "tabby" }, cod: { enabled: true } },
};
const uaeHtml = (payments: StorePaymentConfig | null = LIVE_CONFIG, signupOpen = true) =>
  renderToStaticMarkup(<UaeLanding payments={payments} signupOpen={signupOpen} />);
const indiaHtml = () => renderToStaticMarkup(<IndiaLanding />);

const text = (html: string) => html.replace(/&#x27;/g, "'");
/** The page without the neutral switcher, which is the only place the other country may appear. */
const withoutSwitcher = (html: string) => html.replace(/<nav class="n-switch"[\s\S]*?<\/nav>/g, "");

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

  it("switches between the countries with flags, from both pages", () => {
    for (const html of [indiaHtml(), uaeHtml()]) {
      const nav = html.match(/<nav class="n-switch"[\s\S]*?<\/nav>/)![0];
      expect(nav).toMatch(/India/);
      expect(nav).toMatch(/UAE/);
      expect((nav.match(/<svg/g) ?? []).length).toBe(2);
    }
    expect(indiaHtml()).toContain('aria-current="true"');
    expect(indiaHtml()).toContain('href="/uae" data-flip-link');
    expect(uaeHtml()).toContain('href="/?market=in" data-flip-link');
  });

  it("flips with CSS and turns it off for reduced motion and low-end devices", () => {
    const html = indiaHtml();
    expect(html).toContain("@view-transition");
    expect(html).toMatch(/prefers-reduced-motion: no-preference[\s\S]*@view-transition/);
    expect(html).toContain("rotateY(");
    expect(flipScript).toContain("n-lite");
    expect(flipScript).toContain("skipTransition");
    expect(html).not.toMatch(/three|webgl|<canvas/i);
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

  it("states the commission and terms word for word", () => {
    for (const line of ["Handmade products", "15%", "Fashion and all other categories", "17%", "Shipping is taken care of by NOTMADE.",
      "Settlement within 7 days.", "GST on commission and TDS apply as per law."]) expect(page).toContain(line);
    expect(COMMISSION_STATEMENT_INDIA).toBe("Handmade products 15%. Fashion and all other categories 17%. GST on commission and TDS apply as per law.");
    expect(india.faq.find((f) => f.q === "What does it cost?")?.a).toContain("GST on commission and TDS apply as per law.");
  });

  it("has the legal footer word for word", () => {
    expect(page).toContain('<p class="n-foot-copy">House of Notmade Studio Private Limited, CIN U62099UW2026PTC256850</p>');
  });

  it("names nothing from the other country outside the switcher", () => {
    expect(withoutSwitcher(page)).not.toMatch(/\bUAE\b|\bAED\b|\bVAT\b|\bTRN\b|Dubai|Emirat|dirham|Tabby|Tamara|FZE|Ajman/i);
    expect(JSON.stringify(india)).not.toMatch(/\bUAE\b|\bAED\b|Tabby|FZE/);
  });

  it("only quotes the configured rates", () => {
    expect(new Set(withoutSwitcher(page).match(/\d+%/g))).toEqual(new Set(["15%", "17%"]));
    expect(page).not.toMatch(/seller ships|rate card|electronics|\bflat\b/i);
  });

  it("has four registration steps and the register button", () => {
    expect(india.steps.items.map((s) => s.title)).toEqual(["Choose your country", "Verify your email", "Sign the agreement", "Add products and bank details"]);
    expect(page.match(/class="n-step nr"/g)).toHaveLength(4);
    expect(page.split('id="how"')[1]).toContain('href="/login?market=in&amp;apply=1"');
  });

  it("uses the backend's general rate for the standard line only", () => {
    const html = renderToStaticMarkup(<IndiaLanding rates={withLiveStandardRate(india.rates, 16)} />);
    expect(html).toContain("16%");
    expect(html).toContain("15%");
    expect(html).not.toContain("17%");
  });
});

describe("UAE page", () => {
  const page = text(uaeHtml());

  it("states the commission and terms word for word", () => {
    for (const line of ["Mobile phones and laptops", "12%", "Handmade products", "14%", "Apparel and all other categories", "17%", "Settlement within 7 days."]) expect(page).toContain(line);
  });

  it("has the legal footer word for word", () => {
    expect(page).toContain('<p class="n-foot-copy">HOUSE OF NOTMADE STUDIO FZE LLC, licence 2628021907888, Ajman Nuventures Centre Free Zone (ANC Free Zone), Office BC-894509, 26th Floor, Amber Gem Tower, Sheikh Khalifa Street, Ajman, United Arab Emirates</p>');
  });

  it("names nothing from the other country outside the switcher", () => {
    expect(withoutSwitcher(page)).not.toMatch(/\bIndia|\bINR\b|₹|rupee|Private Limited|Delhi|\bGST|Aadhaar|\bPAN\b|\+91|\bCIN\b/i);
    expect(JSON.stringify(uae)).not.toMatch(/India|\bINR\b|\bGST\b/);
  });

  it("does not make a selling-across-countries claim", () => {
    expect(page).not.toMatch(/45%|cross[- ]?border|across countries|international/i);
  });

  it("has four registration steps", () => {
    expect(uae.steps.items.map((s) => s.title)).toEqual(["Choose your country", "Verify your email", "Sign the agreement", "Add products and bank details"]);
    expect(page.match(/class="n-step nr"/g)).toHaveLength(4);
  });

  it("uses the backend's general rate for the standard line only", () => {
    const html = renderToStaticMarkup(<UaeLanding rates={withLiveStandardRate(uae.rates, 18)} payments={LIVE_CONFIG} signupOpen />);
    expect(html).toContain("18%");
    expect(html).toContain("12%");
    expect(html).toContain("14%");
  });

  it("offers an email form and a contact, never sign-up, while closed", () => {
    const html = text(uaeHtml(LIVE_CONFIG, false));
    expect(html).toContain("Registrations opening soon");
    expect(html).toContain('type="email"');
    expect(html).toContain("mailto:care@notmade.in");
    expect(html).not.toMatch(/apply=1|Register to sell|Open your UAE seller account/);
    expect(html.split('id="how"')[1]).toContain('href="#start"');
  });

  it("offers sign-up once it is open", () => {
    const html = uaeHtml(LIVE_CONFIG, true);
    expect(html).toContain("/login?market=ae&amp;apply=1");
    expect(html).not.toContain("Registrations opening soon");
  });
});

describe("UAE payment options", () => {
  const names = (c: StorePaymentConfig | null) => uaePaymentOptions(c).options.map((o) => o.name);
  const FORBIDDEN = /tamara|apple\s*pay|\bcards?\b(?!-)/i;
  /** The words a shopper reads, without class names or scripts. */
  const copy = (html: string) => withoutSwitcher(html).replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ");

  it("lists exactly what the live config enables, in its words", () => {
    expect(names(LIVE_CONFIG)).toEqual(["Tabby", "Cash on delivery"]);
    const page = copy(uaeHtml());
    expect(page).toContain("We offer multiple payment options to your customers");
    expect(page).toContain("More payment options coming soon");
    expect(page).not.toMatch(FORBIDDEN);
  });

  it("names nothing when the config cannot be read", () => {
    expect(names(null)).toEqual([]);
    expect(names({})).toEqual([]);
    const page = copy(uaeHtml({ payment_methods: [], payments: null }));
    expect(page).toContain("More payment options coming soon");
    expect(page).not.toContain("We offer multiple payment options");
    expect(page).not.toMatch(/tabby|cash on delivery/i);
    expect(page).not.toMatch(FORBIDDEN);
  });

  it("drops Tabby when it is off, in preview, or online payments are off", () => {
    const tabby = LIVE_CONFIG.payment_methods![0];
    const cod = LIVE_CONFIG.payment_methods![1];
    const on = LIVE_CONFIG.payments;
    expect(names({ payment_methods: [{ ...tabby, enabled: false }, cod], payments: on })).toEqual(["Cash on delivery"]);
    expect(names({ payment_methods: [{ ...tabby, enabled: undefined }], payments: on })).toEqual([]);
    expect(names({ payment_methods: [{ ...tabby, preview: true }], payments: on })).toEqual([]);
    expect(names({ payment_methods: [tabby], payments: { online: { enabled: false } } })).toEqual([]);
  });

  it("drops cash on delivery when it is off", () => {
    expect(names({ ...LIVE_CONFIG, payments: { ...LIVE_CONFIG.payments, cod: { enabled: false } } })).toEqual(["Tabby"]);
  });

  it("names another method only when the config enables it", () => {
    const tamara = { id: "tamara", type: "online", provider: "tamara" };
    expect(names({ ...LIVE_CONFIG, payment_methods: [...LIVE_CONFIG.payment_methods!, tamara] })).not.toContain("Tamara");
    expect(names({ ...LIVE_CONFIG, payment_methods: [...LIVE_CONFIG.payment_methods!, { ...tamara, enabled: true }] })).toContain("Tamara");
  });

  it("never writes a payment method into the country file", () => {
    expect(JSON.stringify(uae)).not.toMatch(/tabby|tamara|apple pay|\bcards?\b/i);
    expect(readFileSync("app/landing/content/ae.ts", "utf8")).not.toMatch(/tabby|tamara|apple pay/i);
  });
});

describe("rates", () => {
  it("are the published ones", () => {
    expect(india.rates.map((r) => r.pct)).toEqual([15, 17]);
    expect(uae.rates.map((r) => r.pct)).toEqual([12, 14, 17]);
  });

  it("ignore a bad live value", () => {
    for (const bad of [null, undefined, 0, 150, Number.NaN]) expect(withLiveStandardRate(india.rates, bad)).toBe(india.rates);
  });
});

describe("no fake proof", () => {
  it("has no stats or testimonials", () => {
    for (const html of [indiaHtml(), uaeHtml()]) expect(html).not.toMatch(/testimonial|\d[\d,]*\+?\s+(sellers|brands)|trusted by|\bstars?\b|rated /i);
  });
});
