import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "@/app/lib/llms";
import { ALL_FAQ } from "@/app/landing/content/faq";
import india from "@/app/landing/content/in";
import uae from "@/app/landing/content/ae";
import { PUBLIC_PAGES } from "@/app/lib/public-pages";
import { RETURN_WINDOW_DAYS } from "@/app/lib/seller-config";

// The return window is RETURN_WINDOW_DAYS (7, same as the backend's return-window.js) on every public page.
const MODES = [india, uae];
const HOURS_WINDOW = /\b\d+\s*hours?\b[^.]{0,40}\b(from|of|after)\s+delivery/i;

const pageSource = (path: string) => readFileSync(`app${path === "/" ? "" : path}/page.tsx`, "utf8");

describe("return window", () => {
  it("is 7 days in config", () => {
    expect(RETURN_WINDOW_DAYS).toBe(7);
  });

  it("refund policy states the configured window in days", () => {
    const source = readFileSync("app/refund-policy/page.tsx", "utf8");
    expect(source).toContain("Customers have {RETURN_WINDOW_DAYS} days from delivery to raise a return request");
    expect(source).not.toMatch(HOURS_WINDOW);
    expect(source).not.toMatch(/48\s*hours/i);
  });

  it("no public page, FAQ or llms.txt gives the window in hours", () => {
    for (const p of PUBLIC_PAGES) expect(pageSource(p.path), p.path).not.toMatch(HOURS_WINDOW);
    for (const f of [...ALL_FAQ, ...MODES.flatMap((m) => m.faq)]) expect(f.a).not.toMatch(HOURS_WINDOW);
    expect(buildLlmsTxt()).not.toMatch(HOURS_WINDOW);
  });
});
