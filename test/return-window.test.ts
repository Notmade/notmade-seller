import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RefundPolicy from "@/app/refund-policy/page";
import { buildLlmsTxt } from "@/app/lib/llms";
import { ALL_FAQ } from "@/app/landing/content/faq";
import { MODES } from "@/app/landing/content";
import { PUBLIC_PAGES } from "@/app/lib/public-pages";
import { RETURN_WINDOW_DAYS } from "@/app/lib/seller-config";

// The return window is RETURN_WINDOW_DAYS (7, same as the backend's return-window.js) on every public page.
const HOURS_WINDOW = /\b\d+\s*hours?\b[^.]{0,40}\b(from|of|after)\s+delivery/i;

const pageSource = (path: string) => readFileSync(`app${path === "/" ? "" : path}/page.tsx`, "utf8");

describe("return window", () => {
  it("is 7 days in config", () => {
    expect(RETURN_WINDOW_DAYS).toBe(7);
  });

  it("refund policy states the configured window in days", () => {
    const html = renderToStaticMarkup(RefundPolicy());
    expect(html).toContain(`Customers have ${RETURN_WINDOW_DAYS} days from delivery to raise a return request`);
    expect(html).not.toMatch(HOURS_WINDOW);
    expect(html).not.toMatch(/48\s*hours/i);
  });

  it("no public page, FAQ or llms.txt gives the window in hours", () => {
    for (const p of PUBLIC_PAGES) expect(pageSource(p.path), p.path).not.toMatch(HOURS_WINDOW);
    for (const f of [...ALL_FAQ, ...MODES.flatMap((m) => m.faq)]) expect(f.a).not.toMatch(HOURS_WINDOW);
    for (const m of MODES) expect(JSON.stringify(m.returns)).not.toMatch(/hours/i);
    expect(buildLlmsTxt()).not.toMatch(HOURS_WINDOW);
  });
});
