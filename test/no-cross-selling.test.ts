import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Tracking code belongs to another change and is not part of the seller copy.
const SKIP = [/^app\/api\/track\//, /^app\/lib\/track\.ts$/];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(ts|tsx|css)$/.test(name) && !SKIP.some((r) => r.test(p)) ? [p] : [];
  });
}

const SOURCES = [...files("app"), ...files("src")].map((path) => ({ path, text: readFileSync(path, "utf8") }));

const BANNED: RegExp[] = [
  /also (want to )?sell/i, /sell (in|to) (the )?(uae|india)/i, /sell(ing)? across countries/i, /cross[- ]?(border|sell)/i,
  /india[- ]?to[- ]?uae/i, /uae[- ]?to[- ]?india/i, /uae sales/i, /uae_from_india/, /addendum/i, /international (sale|seller|store|shipping)/i,
  /global seller/i, /both (countries|markets)/i, /other market/i, /isUaeApproved|uaeApproved|UAE_NOT_APPROVED/, /approved for (the )?uae/i,
  /uaeAgreement/, /\/dashboard\/uae/,
];

describe("no cross-selling anywhere in the panel", () => {
  it.each(BANNED.map((r) => [String(r), r] as const))("%s does not appear", (_, pattern) => {
    expect(SOURCES.filter((s) => pattern.test(s.text)).map((s) => s.path)).toEqual([]);
  });

  it("only the country rules send the UAE listing flag", () => {
    const users = SOURCES.filter((s) => /sell_in_uae|price_aed.*fd\.append|fd\.append\("price_aed/.test(s.text)).map((s) => s.path);
    expect(users).toEqual(["app/lib/currency.ts"]);
  });

  it("has no password fields or routes", () => {
    expect(SOURCES.filter((s) => /type="password"|sellers\/approve/.test(s.text)).map((s) => s.path)).toEqual([]);
  });
});
