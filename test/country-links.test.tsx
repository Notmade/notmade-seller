import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SiteFooter from "@/app/components/landing/SiteFooter";
import IndiaLanding from "@/app/components/landing/IndiaLanding";
import UaeLanding from "@/app/components/landing/UaeLanding";
import { COMMISSION_STATEMENT_INDIA } from "@/app/lib/seller-config";
import { getPage } from "@/app/lib/public-pages";
import { SELLER_FAQ } from "@/app/landing/content/faq";
import nextConfig from "@/next.config.mjs";

const cta = { label: "x", href: "#x" };
const hrefs = (html: string) => Array.from(html.matchAll(/href="([^"]+)"/g), (m) => m[1]);

describe("country links", () => {
  it("uses / and /uae in the header and footer, never a ?market= home link", () => {
    const india0 = renderToStaticMarkup(<IndiaLanding />).replace(/<nav class="n-switch"[\s\S]*?<\/nav>/g, "");
    expect(hrefs(india0).filter((h) => h.includes("market=") && !h.startsWith("/login"))).toEqual([]);
    const india = renderToStaticMarkup(<SiteFooter code="in" entity="e" login={cta} primary={cta} links={[]} />);
    expect(hrefs(india)).toEqual(expect.arrayContaining(["/", "/terms", "/privacy-policy", "/refund-policy"]));
    const uae = renderToStaticMarkup(<SiteFooter code="ae" entity="e" login={cta} primary={cta} links={[]} />);
    expect(hrefs(uae)).toEqual(expect.arrayContaining(["/uae", "/uae/terms", "/uae/privacy-policy", "/uae/refund-policy"]));
    expect(hrefs(renderToStaticMarkup(<UaeLanding payments={null} signupOpen={false} />))).not.toContain("/");
  });

  it("registers / and /uae as the country pages", () => {
    expect(getPage("home").path).toBe("/");
    expect(getPage("uae").path).toBe("/uae");
  });

  it("redirects the old landing paths permanently", async () => {
    const rules = await nextConfig.redirects!();
    expect(rules).toEqual(expect.arrayContaining([
      { source: "/sell-in-india", destination: "/", permanent: true },
      { source: "/sell-in-uae", destination: "/uae", permanent: true },
    ]));
  });
});

describe("India commission statement", () => {
  it("is the same on the fees page and the FAQ", () => {
    expect(readFileSync("app/fees-and-payouts/page.tsx", "utf8")).toContain("india: `${COMMISSION_STATEMENT_INDIA}");
    const cost = SELLER_FAQ.find((g) => g.id === "fees")!.items[0];
    expect(cost.a).toContain(COMMISSION_STATEMENT_INDIA);
  });
});
