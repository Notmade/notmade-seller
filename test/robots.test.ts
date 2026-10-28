import { describe, expect, it } from "vitest";
import robots, { NAMED_CRAWLERS, PRIVATE_PATHS } from "@/app/robots";
import { SITE_URL } from "@/app/lib/seller-config";

const REQUIRED_BOTS = [
  "Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot",
  "PerplexityBot", "Google-Extended", "Applebot-Extended",
];

describe("robots.txt", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
  const agents = (rule: (typeof rules)[number]) => ([] as string[]).concat(rule.userAgent ?? []);

  it("names every search and AI crawler and allows the public site", () => {
    const named = rules.find((rule) => agents(rule).includes("GPTBot"))!;
    expect(agents(named).sort()).toEqual([...REQUIRED_BOTS].sort());
    expect(NAMED_CRAWLERS.sort()).toEqual([...REQUIRED_BOTS].sort());
    expect(named.allow).toBe("/");
  });

  it("disallows the panel, onboarding and API in every group", () => {
    expect(rules.some((rule) => agents(rule).includes("*"))).toBe(true);
    for (const rule of rules) {
      expect(rule.disallow).toEqual(expect.arrayContaining(["/dashboard", "/onboarding", "/api/"]));
      expect(([] as string[]).concat(rule.disallow ?? [])).toEqual(PRIVATE_PATHS);
    }
  });

  it("never blocks a public page", () => {
    for (const rule of rules) for (const d of ([] as string[]).concat(rule.disallow ?? [])) expect(d).not.toBe("/");
  });

  it("points to the sitemap", () => {
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
