// Shape of one landing-page mode. Edit copy in in.ts / ae.ts; components only read these.

import type { Currency } from "@/app/lib/currency";

export type ModeCode = "in" | "ae";

/** Field of GET /seller/commission-rates used on the landing page. Rates are never written into copy. */
export type RateKey = "india_pct" | "uae_local_pct";

export interface Cta {
  label: string;
  href: string;
}

export interface Fact {
  /** Short value, e.g. "3 hours". Plain text. */
  value: string;
  label: string;
  note?: string;
}

export interface ModeContent {
  code: ModeCode;
  label: string;
  hero: {
    kicker: string;
    /** Headline lines; the last line is set in red. */
    headline: string[];
    sub: string;
    proof: Fact[];
  };

  steps: { title: string; sub: string; items: { title: string; desc: string }[] };

  delivery: { title: string; sub: string; items: Fact[] };

  money: {
    title: string;
    sub: string;
    points: { title: string; desc: string }[];
    calc: {
      rate: RateKey;
      currency: Currency;
      /** Prefilled price. Leave out to start empty. */
      defaultPrice?: number;
      note: string;
    };
  };

  returns: { title: string; sub: string; points: string[] };

  faq: { q: string; a: string }[];

  final: { title: string; sub: string };

  /** Sign-up CTA. `waitlist` is used while this mode's country is not open for direct sign-up. */
  signup: Cta & { waitlist?: { label: string; note: string; done: string; waitlistMarket: "ae" } };
  login: Cta;
}
