// Shape shared by the two country files. Each country has its own file; neither imports the other.

export type ModeCode = "in" | "ae";

export interface Cta { label: string; href: string }
export interface Item { title: string; desc: string }
export interface Fact { value: string; label: string }

/** One line of the commission card. `standard` is the rate for everything without its own line. */
export interface RateRow {
  key: string; label: string; short: string; pct: number;
  /** Set on a line that only applies when this party ships. The live rate card prices it by this. */
  mode?: "seller_ships" | "notmade_ships";
}

/** The company a seller contracts with. */
export interface Entity {
  /** Name shown on the site; the agreement carries the full registered name. */
  name: string;
  registeredOffice?: string;
  ids?: { label: string; value: string }[];
  phone: string;
  law: string;
  store: string;
}

export interface PageContent {
  code: ModeCode;
  label: string;
  meta: { title: string; description: string };
  hero: { kicker: string; headline: string[]; sub: string };
  /** Commission lines, in the order the page shows them. */
  rates: RateRow[];
  commission: { title: string; sub?: string; note?: string; example: number };
  /** Short promises beside the commission card. */
  promises: Item[];
  steps: { title: string; sub: string; items: Item[] };
  faq: { q: string; a: string }[];
  final: { title: string; sub: string };
  signup: Cta;
  login: Cta;
  /** The legal footer, exactly as it must read. */
  legalFooter: string;
}
