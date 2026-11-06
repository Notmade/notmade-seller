// The site names the UAE entity by its legal name only. Its licence and address are in the agreement, which the backend serves.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EntityDetails } from "@/app/components/public/PublicPage";
import { ENTITY } from "@/app/legal/uae";
import { ENTITY_BY_COUNTRY, LEGAL_ENTITY_UAE } from "@/app/lib/seller-config";
import { GET } from "@/app/llms.txt/route";

const REMOVED = /2628021907888|BC-894509|Amber Gem|Sheikh Khalifa|26th Floor|Nuventures|ANC Free Zone/i;
const NAME = "HOUSE OF NOTMADE STUDIO FZE LLC";
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const path = join(dir, f);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

describe("UAE entity on the seller site", () => {
  it("has the licence and address nowhere in the site's source", () => {
    expect(walk("app").filter((f) => REMOVED.test(readFileSync(f, "utf8")))).toEqual([]);
  });

  it("uses the legal name exactly", () => {
    expect([LEGAL_ENTITY_UAE, ENTITY_BY_COUNTRY.AE.name, ENTITY.name]).toEqual([NAME, NAME, NAME]);
  });

  it("is in llms.txt by name, with no address", async () => {
    const text = await GET().text();
    expect(text).toContain(`- UAE: ${NAME}. `);
    expect(text).not.toMatch(REMOVED);
  });

  it("shows no licence or office row on the UAE details; India keeps its own", () => {
    const uae = renderToStaticMarkup(<EntityDetails entity={ENTITY_BY_COUNTRY.AE} agreement="x" />);
    expect(uae).toContain(NAME);
    expect(uae).not.toMatch(/Registered office|Licence/);
    const india = renderToStaticMarkup(<EntityDetails entity={ENTITY_BY_COUNTRY.IN} agreement="x" />);
    for (const s of ["Registered office", "CIN", "GSTIN", "Indirapuram"]) expect(india).toContain(s);
  });
});
