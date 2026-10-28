import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { PRIVATE_PATHS } from "@/app/robots";
import { PUBLIC_PAGES } from "@/app/lib/public-pages";
import { SITE_URL } from "@/app/lib/seller-config";

describe("sitemap.xml", () => {
  const entries = sitemap();

  it("lists exactly the public pages, once each", () => {
    expect(entries.map((e) => e.url)).toEqual(PUBLIC_PAGES.map((p) => `${SITE_URL}${p.path === "/" ? "" : p.path}`));
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
  });

  it("only has absolute URLs on seller.notmade.in, none behind login", () => {
    for (const { url } of entries) {
      expect(url.startsWith(SITE_URL)).toBe(true);
      expect(url).not.toMatch(/[?#]/);
      const path = url.slice(SITE_URL.length) || "/";
      for (const p of [...PRIVATE_PATHS, "/login"]) expect(path.startsWith(p)).toBe(false);
    }
  });

  it("has a real lastmod date for every page, never in the future", () => {
    for (const e of entries) {
      expect(String(e.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const t = Date.parse(String(e.lastModified));
      expect(Number.isNaN(t)).toBe(false);
      expect(t).toBeLessThanOrEqual(Date.now());
    }
  });

  it("only lists pages that exist in the app", () => {
    for (const p of PUBLIC_PAGES) expect(existsSync(`app${p.path === "/" ? "" : p.path}/page.tsx`), p.path).toBe(true);
  });
});
