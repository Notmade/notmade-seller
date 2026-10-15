// Shape of one landing-page mode. Edit copy in in.ts / ae.ts / global.ts; components only read these.

export type ModeCode = "in" | "ae" | "global";

/** Field of GET /seller/commission-rates. Rates are never written into copy; the page reads them live. */
export type RateKey = "india_pct" | "uae_local_pct" | "international_pct";

/** A number that counts up when it scrolls into view. Only for facts we publish (hours, days). */
export interface Counter {
  to: number;
  /** For ranges like 3–5: the first number, shown before the counted one. */
  from?: number;
  unit: string;
}

export interface Step {
  title: string;
  desc: string;
  /** What the seller needs for this step. */
  needs?: string[];
  /** Typical turnaround. Leave out unless it is a published fact. */
  turnaround?: string;
}

export interface Lane {
  title: string;
  /** Short badge on the lane, e.g. "9am – 6pm". */
  badge?: string;
  counter?: Counter;
  stops: string[];
}

export interface SplitRoute {
  label: string;
  rate: RateKey;
  hint: string;
}

export interface Cta {
  label: string;
  href: string;
}

export interface ModeContent {
  code: ModeCode;
  tab: { label: string; short: string };
  meta: { title: string; description: string };

  hero: {
    kicker: string;
    /** Headline lines; the last line is set in red. */
    headline: string[];
    sub: string;
    stats: { counter?: Counter; text?: string; rate?: RateKey; label: string }[];
  };

  /** Short facts in the strip under the hero. */
  trust: string[];
  marquee: string[];

  why: { title: string; items: { counter?: Counter; kicker?: string; title: string; desc: string }[] };

  timeline: { eyebrow: string; title: string; sub: string; steps: Step[] };

  /** India → NOTMADE → UAE customer diagram (global mode). */
  flow?: { title: string; sub: string; nodes: { label: string; title: string; points: string[] }[] };

  orderDay: {
    title: string;
    sub: string;
    lanes: Lane[];
    notes: { title: string; desc: string }[];
  };

  commission: {
    title: string;
    sub: string;
    /** "amount": price in, payout out. "split": percentage bar only, no currency. */
    kind: "amount" | "split";
    routes: SplitRoute[];
    currencySymbol?: string;
    defaultPrice?: number;
    note: string;
  };

  /** Side-by-side store comparison (global mode). */
  stores?: { title: string; sub: string; cards: { name: string; host: string; rate: RateKey; rows: [string, string][] }[] };

  features: { title: string; sub: string; items: { title: string; desc: string; icon: IconName }[] };

  documents: { title: string; sub: string; groups: { title: string; items: string[] }[] };

  faq: { q: string; a: string }[];

  final: { title: string[]; sub: string };

  /** Sign-up CTA. `waitlist` is used while this mode's country is not open for direct sign-up. */
  signup: Cta & { waitlist?: { label: string; note: string; done: string; waitlistMarket: "ae" } };
  login: Cta;

  /** Closing line under the final CTA. */
  footnote: string;
}

export type IconName =
  | "dashboard" | "orders" | "variants" | "label" | "bell" | "payout" | "globe" | "store";
