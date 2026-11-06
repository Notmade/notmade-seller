// Every indexable page on seller.notmade.in. Metadata, the sitemap, llms.txt, the header and footer
// links and the tests all read this list, so a new public page is added here first.
// `lastModified` is the date the page's copy last changed; bump it when you edit what the page says.

import { AED } from "./currency";
import {
  COMMISSION_PCT_INDIA, MAIN_SITE_URL, SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS, UAE_SITE_URL,
} from "./seller-config";

const host = (u: string) => u.replace(/^https?:\/\//, "");

export type PageKey =
  | "home" | "uae" | "uae-terms" | "uae-privacy-policy" | "uae-refund-policy" | "how-it-works" | "fees-and-payouts" | "faq"
  | "policies" | "seller-agreement" | "contact" | "terms" | "privacy-policy" | "refund-policy";

export interface PublicPage {
  key: PageKey;
  path: string;
  /** Short name for breadcrumbs, nav and llms.txt. */
  name: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  lastModified: string;
  priority: number;
  /** Open Graph locale; country pages use the country's English locale. */
  locale: "en_IN" | "en_AE";
}

export const PUBLIC_PAGES: PublicPage[] = [
  {
    key: "home", path: "/", name: "Home", priority: 1, lastModified: "2026-11-05", locale: "en_IN",
    title: "Sell across India on NOTMADE | NOTMADE Seller",
    description: `Sell on ${host(MAIN_SITE_URL)} from anywhere in India. No listing fee, a ${COMMISSION_PCT_INDIA}% commission and payout ${PAYOUT_DAYS} days after delivery.`,
  },
  {
    key: "uae", path: "/uae", name: "UAE seller page", priority: 1, lastModified: "2026-11-05", locale: "en_AE",
    title: "Selling in the UAE on NOTMADE | NOTMADE Seller",
    description: `Reach customers across the UAE on ${host(UAE_SITE_URL)}. Set your prices in ${AED}, see the commission rate card and get paid to your UAE IBAN.`,
  },
  {
    key: "how-it-works", path: "/how-it-works", name: "How it works", priority: 0.8, lastModified: "2026-10-28", locale: "en_IN",
    title: "How selling on NOTMADE works | NOTMADE Seller",
    description: "From sign-up to payout: sign up with an email code, add your business documents, sign the seller agreement, list products, accept orders and get paid.",
  },
  {
    key: "fees-and-payouts", path: "/fees-and-payouts", name: "Fees and payouts", priority: 0.8, lastModified: "2026-10-28", locale: "en_IN",
    title: "Seller fees, commission and payouts | NOTMADE",
    description: "What it costs to sell on NOTMADE in India and the UAE: commission on each delivered order, what is deducted from a settlement, and when payouts reach your bank.",
  },
  {
    key: "faq", path: "/faq", name: "Seller FAQ", priority: 0.8, lastModified: "2026-10-28", locale: "en_IN",
    title: "Seller FAQ: documents, fees, payouts, returns | NOTMADE",
    description: "Answers for new sellers: who can sell, documents for India and the UAE, commission, payout timing, returns, accepting orders, listing products and approval time.",
  },
  {
    key: "policies", path: "/policies", name: "Seller policies", priority: 0.6, lastModified: "2026-10-28", locale: "en_IN",
    title: "Seller policies: quality, returns, privacy | NOTMADE",
    description: "The rules for selling on NOTMADE: product quality and authenticity, returns with an unboxing video, who pays for a return, and how seller data is used.",
  },
  {
    key: "seller-agreement", path: "/seller-agreement", name: "Seller agreement summary", priority: 0.6, lastModified: "2026-10-28", locale: "en_IN",
    title: "Seller agreement summary for India and the UAE | NOTMADE",
    description: "A plain-English summary of the NOTMADE seller agreements for India and the UAE: who you contract with, pricing, commission, settlement, returns and termination.",
  },
  {
    key: "contact", path: "/contact", name: "Contact", priority: 0.5, lastModified: "2026-10-28", locale: "en_IN",
    title: "Contact NOTMADE seller support",
    description: "Email or call NOTMADE about selling in India or the UAE, your seller account, orders or payouts. Registered office details for both companies.",
  },
  {
    key: "terms", path: "/terms", name: "Terms and conditions", priority: 0.4, lastModified: "2026-10-14", locale: "en_IN",
    title: "Seller terms and conditions | NOTMADE",
    description: "Seller terms and conditions for the NOTMADE platform: commission, payments, product quality standards, disputes and governing law.",
  },
  {
    key: "privacy-policy", path: "/privacy-policy", name: "Privacy policy", priority: 0.3, lastModified: "2026-07-25", locale: "en_IN",
    title: "Seller privacy policy | NOTMADE",
    description: "What NOTMADE collects when you apply to sell, how it is used, and how to ask for your data to be deleted.",
  },
  {
    key: "refund-policy", path: "/refund-policy", name: "Refund policy", priority: 0.3, lastModified: "2026-11-05", locale: "en_IN",
    title: "Refund and returns policy for sellers | NOTMADE",
    description: "How returns and refunds work on NOTMADE, and what a seller is responsible for when a product is damaged, wrong or not as listed.",
  },
  {
    key: "uae-terms", path: "/uae/terms", name: "UAE terms", priority: 0.4, lastModified: "2026-11-05", locale: "en_AE",
    title: "UAE seller terms | NOTMADE",
    description: "Seller terms for businesses on the NOTMADE UAE store: commission, payments, product standards, disputes and governing law.",
  },
  {
    key: "uae-privacy-policy", path: "/uae/privacy-policy", name: "UAE privacy policy", priority: 0.3, lastModified: "2026-11-05", locale: "en_AE",
    title: "UAE seller privacy policy | NOTMADE",
    description: "What NOTMADE collects when a UAE business applies to sell, how it is used, and how to ask for your data to be deleted.",
  },
  {
    key: "uae-refund-policy", path: "/uae/refund-policy", name: "UAE refund policy", priority: 0.3, lastModified: "2026-11-05", locale: "en_AE",
    title: "UAE refund and returns policy for sellers | NOTMADE",
    description: "How returns and refunds work on the NOTMADE UAE store, and what a seller is responsible for on a damaged or wrong product.",
  },
];

export function getPage(key: PageKey): PublicPage {
  return PUBLIC_PAGES.find((p) => p.key === key)!;
}
