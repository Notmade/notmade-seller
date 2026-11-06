// UAE: every rate, line of copy and company detail on the UAE seller page, and the UAE facts the rest
// of the site quotes. Edit here and every page follows. Only UAE facts live in this file.
// Payment methods are never written here: they come live from /app/config (app/lib/landing-data.ts).
import { AED } from "@/app/lib/currency";
import type { Entity, Item, PageContent, RateRow } from "./types";

export const STORE_URL = "https://uae.notmade.in";
export const SUPPORT_EMAIL = "care@notmade.in";
const host = STORE_URL.replace(/^https?:\/\//, "");

export const SETTLEMENT_DAYS = 7;

export const LEGAL_ENTITY = "House of Notmade Studio FZE LLC";

/** Copied from the current backend agreement (uae-local-v2); update both together when it changes. */
export const ENTITY: Entity = {
  name: LEGAL_ENTITY,
  registeredOffice: "Office No. BC-894509, 26th Floor, Amber Gem Tower, Sheikh Khalifa Street, Ajman, United Arab Emirates",
  ids: [{ label: "Licence No.", value: "2628021907888" }],
  phone: "+971 55 759 0282",
  law: "Laws of the UAE as applied in Ajman, with the courts of Ajman",
  store: STORE_URL,
};

export const RATES: RateRow[] = [
  { key: "electronics", label: "Mobile phones and laptops", short: "Phones and laptops", pct: 12 },
  { key: "handmade", label: "Handmade products", short: "Handmade", pct: 14 },
  { key: "standard", label: "Apparel and all other categories", short: "Apparel and all other", pct: 17 },
];

export const SETTLEMENT_LINE = `Settlement within ${SETTLEMENT_DAYS} days.`;

export const PAYMENTS = {
  title: "We offer multiple payment options to your customers",
  /** Shown instead of the title until two methods are live, so the page never overclaims. */
  titleFew: "Payment options for your customers",
  more: "More payment options coming soon",
};

export const CONCIERGE = {
  title: "Our team helps shoppers buy.",
  sub: "Not every sale starts at a checkout. When a shopper needs a hand, our team steps in.",
  channels: ["Instagram", "WhatsApp", "Other channels"],
  items: [
    { title: "Answer questions", desc: "Shoppers message us about your products and get a reply from a person." },
    { title: "Help them order", desc: "Our team helps shoppers place the order with the right variant and address." },
    { title: "Help them pay", desc: "We guide shoppers through the secure payment option that suits them." },
  ] satisfies Item[],
};

export const CHANNEL = {
  title: "A new sales channel for UAE brands.",
  sub: "Keep your own store. Add NOTMADE as another way to reach shoppers across the UAE.",
  items: [
    { title: "Your prices, in AED", desc: "You set every price. NOTMADE never changes it." },
    { title: "Your brand on the page", desc: `Your products and brand name on ${host}.` },
    { title: "One seller panel", desc: "Orders, stock, products and payouts in one place on any device." },
  ] satisfies Item[],
};

const uae: PageContent = {
  code: "ae",
  label: "UAE",
  meta: {
    title: "Sell on NOTMADE UAE | A New Sales Channel for UAE Brands",
    description: `A new sales channel for UAE brands on ${host}. Commission from ${Math.min(...RATES.map((r) => r.pct))}%. ${SETTLEMENT_LINE} Prices and payouts in AED.`,
  },
  hero: {
    kicker: "For UAE brands",
    headline: ["Your next", "sales channel."],
    sub: `Reach more shoppers across the UAE on ${host}. Real people helping shoppers buy, and AED payouts to your bank. ${SETTLEMENT_LINE}`,
  },
  rates: RATES,
  commission: { title: "Commission.", sub: "Simple rates by category.", example: 1000 },
  promises: [
    { title: SETTLEMENT_LINE, desc: "AED payouts to your UAE bank account by IBAN." },
    { title: "Executed under UAE terms", desc: `Your seller agreement is with ${LEGAL_ENTITY}. You read it in the panel and sign it with a code sent to your email.` },
  ],
  steps: {
    title: "How to register.",
    sub: "Four steps, on any device. No password, ever.",
    items: [
      { title: "Choose your country", desc: "Pick the UAE. Prices and payouts are in AED." },
      { title: "Verify your email", desc: "Enter your email and the one-time code (OTP) we send." },
      { title: "Sign the agreement", desc: "Add your trade licence and business details, then sign online under UAE terms." },
      { title: "Add products and bank details", desc: "List products at your own AED price, and add your IBAN for settlements." },
    ],
  },
  faq: [
    { q: "Who can sell?", a: "UAE-based businesses with a valid trade licence." },
    { q: "What does it cost?", a: "Commission depends on the category, as shown on this page. Your rate is set out in your agreement." },
    { q: "How do shoppers get help?", a: "Our team helps shoppers on Instagram, WhatsApp and other channels to order and pay." },
    { q: "Who sets the price?", a: `You do, in ${AED}, in your seller panel.` },
    { q: "How am I paid?", a: `${SETTLEMENT_LINE} Payouts are in AED, to your UAE bank account by IBAN.` },
    { q: "Who is the agreement with?", a: `${LEGAL_ENTITY}, under UAE terms. You can read it in full before you sign.` },
  ],
  final: { title: "Open your UAE seller account.", sub: "Register with your email and finish onboarding in your seller panel." },
  signup: { label: "Register to sell", href: "/login?market=ae&apply=1" },
  login: { label: "Log in", href: "/login?market=ae" },
  legalFooter: "HOUSE OF NOTMADE STUDIO FZE LLC, licence 2628021907888, Ajman Nuventures Centre Free Zone (ANC Free Zone), Office BC-894509, 26th Floor, Amber Gem Tower, Sheikh Khalifa Street, Ajman, United Arab Emirates",
};

export const WAITLIST = {
  /** The sign-up button while registration is closed. It only scrolls to the email form. */
  cta: "Registrations opening soon",
  label: "Notify me",
  note: "Seller registration is opening soon. This adds your email to the seller waitlist; it is not an application.",
  done: "You're on the seller waitlist. We will email you when registration opens.",
  market: "ae",
  contact: SUPPORT_EMAIL,
  final: { title: "Registrations opening soon.", sub: "Leave your email and we will tell you when UAE seller registration opens." },
} as const;

export default uae;
