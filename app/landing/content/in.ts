// India: every rate, line of copy and company detail on the India seller page, and the India facts
// the rest of the site quotes. Edit here and every page follows. Only India facts live in this file.
import { INR, formatMoney } from "@/app/lib/currency";
import type { Entity, Item, PageContent, RateRow } from "./types";

export const STORE_URL = "https://notmade.in";
const host = STORE_URL.replace(/^https?:\/\//, "");

export const SETTLEMENT_DAYS = 7;
export const RETURN_WINDOW_DAYS = 7;
/** Minimum products needed to go live (seller terms). */
export const MIN_PRODUCTS = 10;

export const LEGAL_ENTITY = "House of Notmade Studio Private Limited";
export const CIN = "U62099UW2026PTC256850";

/** Copied from the current backend agreement (in-v2); update both together when it changes. */
export const ENTITY: Entity = {
  name: "House of Notmade Studio",
  registeredOffice: "GK-II/41/C-2, Second Floor, Gyan Khand-2, Shipra Sun City, Indirapuram, Ghaziabad, Uttar Pradesh 201014, India",
  ids: [{ label: "CIN", value: CIN }, { label: "GSTIN", value: "09AAICH8658N1ZM" }],
  phone: "+91 93548 52701",
  law: "Laws of India, with arbitration seated in Ghaziabad, Uttar Pradesh",
  store: STORE_URL,
};

export const RATES: RateRow[] = [
  { key: "handmade", label: "Handmade products", short: "Handmade", pct: 15 },
  { key: "standard", label: "Fashion and all other categories", short: "Fashion and all other", pct: 17 },
];

export const TAX_NOTE = "GST on commission and TDS apply as per law.";
export const SHIPPING_LINE = "Shipping is taken care of by NOTMADE.";
export const SETTLEMENT_LINE = `Settlement within ${SETTLEMENT_DAYS} days.`;

const rateSentence = (rates: RateRow[]) => rates.map((r) => `${r.label} ${r.pct}%.`).join(" ");

/** The commission statement, word for word, everywhere it is quoted. */
export const COMMISSION_STATEMENT = `${rateSentence(RATES)} ${TAX_NOTE}`;

export const CATEGORIES = ["Handmade", "Fashion", "Accessories", "Home decor", "And many more categories"];

export const SUPPORT: Item[] = [
  { title: "Delivery across India", desc: "3-hour delivery across Delhi NCR for orders between 9am and 6pm, and 3 to 5 days across the rest of India." },
  { title: "Cash on delivery", desc: "Customers can pay on delivery, so you do not lose orders from buyers who prefer it." },
  { title: "You set the price", desc: "You set the price for every product. NOTMADE never changes it." },
  { title: "One seller panel", desc: "Orders, stock, products, payouts and your agreement, all in one place on any device." },
];

export const AGREEMENT = {
  body: `Your seller agreement is executed with ${LEGAL_ENTITY}. You read it in the panel and sign it with a code sent to your email.`,
};

const india: PageContent = {
  code: "in",
  label: "India",
  meta: {
    title: `Sell Across India on NOTMADE | Commission From ${Math.min(...RATES.map((r) => r.pct))}%`,
    description: `Sell handmade, fashion and many more categories across India on ${host}. Commission from ${Math.min(...RATES.map((r) => r.pct))}%. ${SHIPPING_LINE} ${SETTLEMENT_LINE}`,
  },
  hero: {
    kicker: "For brands in India",
    headline: ["Sell across", "India."],
    sub: `Handmade, fashion and many more categories on ${host}. ${SHIPPING_LINE} ${SETTLEMENT_LINE}`,
  },
  rates: RATES,
  commission: { title: "Commission.", note: TAX_NOTE, example: 1999 },
  promises: [
    { title: SHIPPING_LINE, desc: "Pack the order and mark it ready in your panel." },
    { title: SETTLEMENT_LINE, desc: "Payouts in your panel show each settlement and the orders in it." },
    { title: `${formatMoney(0, INR)} listing fee`, desc: "List your products for free." },
  ],
  steps: {
    title: "How to register.",
    sub: "Four steps, on any device. No password, ever.",
    items: [
      { title: "Choose your country", desc: "Pick India. Prices and payouts are in INR." },
      { title: "Verify your email", desc: "Enter your email and the one-time code (OTP) we send." },
      { title: "Sign the agreement", desc: `Add your business details, then sign online with ${LEGAL_ENTITY}.` },
      { title: "Add products and bank details", desc: `Start with at least ${MIN_PRODUCTS} products at your own INR price, and add your bank details.` },
    ],
  },
  faq: [
    { q: "What can I sell?", a: "Handmade products, fashion and many more categories. You pick the category for each product when you list it." },
    { q: "What does it cost?", a: `Commission depends on the category, as shown on this page. ${TAX_NOTE} Listing is free.` },
    { q: "Who sets the price?", a: "You do. You set the INR price for each product you list." },
    { q: "How does shipping work?", a: `${SHIPPING_LINE} You pack the order and mark it ready in your panel.` },
    { q: "How fast is delivery?", a: "3 hours across Delhi NCR between 9am and 6pm, and 3 to 5 days across the rest of India." },
    { q: "When do I get paid?", a: `${SETTLEMENT_LINE} Payouts are in INR, to your bank account.` },
    { q: "How do returns work?", a: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video, which you can watch from the order in your panel.` },
    { q: "Who is the agreement with?", a: `${LEGAL_ENTITY}. You can read it in full before you sign.` },
  ],
  final: { title: "Start selling across India.", sub: "Register with your email and finish onboarding in your seller panel." },
  signup: { label: "Register to sell", href: "/login?market=in&apply=1" },
  login: { label: "Log in", href: "/login?market=in" },
  legalFooter: `${LEGAL_ENTITY}, CIN ${CIN}`,
};

export default india;
