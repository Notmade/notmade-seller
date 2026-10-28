import { describe, expect, it } from "vitest";
import { GET } from "@/app/llms.txt/route";
import { PUBLIC_PAGES } from "@/app/lib/public-pages";
import {
  COMMISSION_PCT_INDIA, ENTITY_BY_COUNTRY, MAIN_SITE_URL, RETURN_WINDOW_DAYS, SETTLEMENT_DAYS_AFTER_DELIVERY, SITE_URL, UAE_SITE_URL,
} from "@/app/lib/seller-config";

describe("llms.txt", async () => {
  const res = GET();
  const text = await res.text();

  it("is served as markdown", () => {
    expect(res.headers.get("Content-Type")).toMatch(/^text\/markdown/);
    expect(text.startsWith("# NOTMADE Seller\n\n> ")).toBe(true);
  });

  it("covers both countries, who can sell and how selling works", () => {
    for (const h of ["## Who can sell", "## How selling works", "## Fees and payouts", "## Delivery", "## Companies"]) expect(text).toContain(h);
    expect(text).toContain(MAIN_SITE_URL);
    expect(text).toContain(UAE_SITE_URL);
    expect(text).toContain(ENTITY_BY_COUNTRY.IN.name);
    expect(text).toContain(ENTITY_BY_COUNTRY.AE.name);
  });

  it("quotes numbers from config, not hand-typed copies", () => {
    expect(text).toContain(`standard rate is ${COMMISSION_PCT_INDIA}%`);
    expect(text).toContain(`within ${SETTLEMENT_DAYS_AFTER_DELIVERY} days of confirmed delivery`);
    expect(text).toContain(`within ${RETURN_WINDOW_DAYS} days of delivery`);
  });

  it("links every public page by absolute URL and no private page", () => {
    const links = Array.from(text.matchAll(/\]\((https?:[^)]+)\)/g), (m) => m[1]);
    for (const p of PUBLIC_PAGES.filter((p) => p.key !== "home")) expect(links).toContain(`${SITE_URL}${p.path}`);
    for (const l of links) expect(l).not.toMatch(/\/(dashboard|onboarding|api|login)/);
  });

  it("does not claim ratings, reviews or seller counts", () => {
    expect(text).not.toMatch(/\bratings?\b|\bstars?\b|customer reviews|\d[\d,]*\+?\s+(sellers|brands)|testimonial/i);
  });
});
