// UAE seller page. Only UAE facts live here. The legal entity comes from the backend UAE agreement;
// rates come from app/lib/rate-card.ts and are never written into this copy.
import { LEGAL_ENTITY_UAE, UAE_SITE_URL } from "@/app/lib/seller-config";
import { AED } from "@/app/lib/currency";
import type { Item, PageContent } from "./types";

const host = UAE_SITE_URL.replace(/^https?:\/\//, "");

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

export const AGREEMENT = {
  title: "Executed under UAE terms.",
  body: `Your seller agreement is executed under UAE terms with ${LEGAL_ENTITY_UAE}. You read it in the panel and sign it with a code sent to your email.`,
  payout: `AED payouts to your UAE bank account by IBAN. Settlement timing is set out in the agreement.`,
};

export const RATES = {
  title: "Commission rate card.",
  sub: "One simple card. Pick who ships your electronics when you register.",
  newSellers: "These terms apply to new sellers.",
  electronicsExample: 1000,
  fashionExample: 200,
};

const uae: PageContent = {
  code: "ae",
  label: "UAE",
  meta: {
    title: "Sell on NOTMADE UAE | A New Sales Channel for UAE Brands",
    description: `A new sales channel for UAE brands on ${host}. Secure card and Tabby pay-later payments for shoppers, team support on Instagram and WhatsApp, a clear rate card and AED payouts.`,
  },
  hero: {
    kicker: "For UAE brands",
    headline: ["Your next", "sales channel."],
    sub: `Reach more shoppers across the UAE on ${host}. Secure payments, real people helping shoppers buy, and AED payouts to your bank.`,
    proof: [
      { value: "Tabby", label: "pay-later and cards for shoppers" },
      { value: AED, label: "prices and payouts" },
      { value: "Instagram", label: "and WhatsApp order help from our team" },
    ],
  },
  steps: {
    title: "Onboard in five steps.",
    sub: "Register with your email. No password, ever.",
    items: [
      { title: "Register", desc: "Enter your email and the one-time code we send." },
      { title: "Choose how you ship", desc: "See the commission rate for your electronics and pick who ships them." },
      { title: "Add business details", desc: "Your trade licence, Emirates ID or passport, TRN if VAT registered, and IBAN." },
      { title: "Sign the agreement", desc: "Executed under UAE terms, signed online with an email code." },
      { title: "List and sell", desc: "Add products with AED prices. Accept orders, pack and ship from your panel." },
    ],
  },
  faq: [
    { q: "Who can sell?", a: "UAE-based businesses with a valid trade licence." },
    { q: "What does it cost?", a: "Commission follows the rate card on this page. Your rate is shown again before you register and is set out in your agreement." },
    { q: "How do shoppers pay?", a: "By card or with Tabby pay-later, using secure online payment options." },
    { q: "How do shoppers get help?", a: "Our team helps shoppers on Instagram, WhatsApp and other channels to order and pay." },
    { q: "Who sets the price?", a: `You do, in ${AED}, in your seller panel.` },
    { q: "How am I paid?", a: "In AED, to your UAE bank account by IBAN. Settlement timing is set out in the agreement." },
    { q: "Who is the agreement with?", a: `${LEGAL_ENTITY_UAE}, under UAE terms. You can read it in full before you sign.` },
  ],
  final: { title: "Open your UAE seller account.", sub: "Register with your email and finish onboarding in your seller panel." },
  signup: { label: "Register to sell", href: "/login?market=ae&apply=1" },
  login: { label: "Log in", href: "/login?market=ae" },
};

export const WAITLIST = {
  label: "Join the waitlist",
  note: "Seller registration is opening soon. This adds your email to the seller waitlist; it is not an application.",
  done: "You're on the seller waitlist. We will email you when registration opens.",
  market: "ae",
} as const;

export default uae;
