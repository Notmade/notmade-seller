// Copy shared in shape by both landing pages. Each country has its own file; neither imports the other.

export type ModeCode = "in" | "ae";

export interface Cta { label: string; href: string }
export interface Item { title: string; desc: string }
export interface Fact { value: string; label: string }

export interface PageContent {
  code: ModeCode;
  label: string;
  meta: { title: string; description: string };
  hero: { kicker: string; headline: string[]; sub: string; proof: Fact[] };
  steps: { title: string; sub: string; items: Item[] };
  faq: { q: string; a: string }[];
  final: { title: string; sub: string };
  signup: Cta;
  login: Cta;
}
