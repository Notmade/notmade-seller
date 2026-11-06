// India seller page. Only India facts live here.
import {
  COMMISSION_PCT_INDIA as PCT, COMMISSION_STATEMENT_INDIA as STATEMENT, LEGAL_ENTITY_INDIA, MAIN_SITE_URL, MIN_PRODUCTS, RETURN_WINDOW_DAYS,
  SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS,
} from "@/app/lib/seller-config";
import { INR, formatMoney } from "@/app/lib/currency";
import type { Item, PageContent } from "./types";

const host = MAIN_SITE_URL.replace(/^https?:\/\//, "");

export const CATEGORIES = ["Fashion", "Accessories", "Home decor", "And many more categories"];

export const SUPPORT: Item[] = [
  { title: "Logistics and shipping support", desc: "Pack the order and mark it ready in your panel. We help with the AWB label and courier pickup." },
  { title: "Delivery across India", desc: "3-hour delivery across Delhi NCR for orders between 9am and 6pm, and 3 to 5 days across the rest of India." },
  { title: "Cash on delivery", desc: "Customers can pay on delivery, so you do not lose orders from buyers who prefer it." },
  { title: "One seller panel", desc: "Orders, stock, products, payouts and your agreement, all in one place on any device." },
];

export const PAYOUT = {
  title: "INR payouts to your bank.",
  points: [
    { title: `Paid ${PAYOUT_DAYS} days after delivery`, desc: "Payouts in your panel show each settlement and the orders in it." },
    { title: `${formatMoney(0, INR)} listing fee`, desc: "List your products for free." },
    { title: "You set the price", desc: "You set the price for every product. NOTMADE never changes it." },
  ] satisfies Item[],
};

export const AGREEMENT = {
  title: "A clear agreement.",
  body: `Your seller agreement is executed with ${LEGAL_ENTITY_INDIA}. You read it in the panel and sign it with a code sent to your email.`,
};

const india: PageContent = {
  code: "in",
  label: "India",
  meta: {
    title: `Sell Across India on NOTMADE | Flat ${PCT}% Commission`,
    description: `Sell fashion, accessories, home decor and many more categories across India on ${host}. ${STATEMENT} Logistics and shipping support, and INR payouts.`,
  },
  hero: {
    kicker: "For brands in India",
    headline: ["Sell across", "India."],
    sub: `Fashion, accessories, home decor and many more categories on ${host}. ${STATEMENT}`,
    proof: [
      { value: `${PCT}%`, label: "flat commission, no hidden charges" },
      { value: `${PAYOUT_DAYS}-day`, label: "INR payout after delivery" },
      { value: "3-hour", label: "delivery across Delhi NCR" },
    ],
  },
  steps: {
    title: "Onboard in five steps.",
    sub: "Register with your email. No password, ever.",
    items: [
      { title: "Register", desc: "Enter your email and the one-time code we send." },
      { title: "Add business details", desc: "Your GST or PAN details, pickup address and KYC documents." },
      { title: "Sign the agreement", desc: `Executed with ${LEGAL_ENTITY_INDIA}, signed online with an email code.` },
      { title: "List your products", desc: `Add photos, variants and your INR price. Start with at least ${MIN_PRODUCTS} products.` },
      { title: "Sell and get paid", desc: `Accept orders, pack, hand over. Payout ${PAYOUT_DAYS} days after delivery.` },
    ],
  },
  faq: [
    { q: "What can I sell?", a: "Fashion, accessories, home decor and many more categories. You pick the category for each product when you list it." },
    { q: "What does it cost?", a: `${STATEMENT} Listing is free.` },
    { q: "Who sets the price?", a: "You do. You set the INR price for each product you list." },
    { q: "How does shipping work?", a: "You pack the order and mark it ready in your panel. We support you with the AWB label and courier pickup." },
    { q: "How fast is delivery?", a: "3 hours across Delhi NCR between 9am and 6pm, and 3 to 5 days across the rest of India." },
    { q: "When do I get paid?", a: `${PAYOUT_DAYS} days after the order is delivered, in INR, to your bank account.` },
    { q: "How do returns work?", a: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video, which you can watch from the order in your panel.` },
    { q: "Who is the agreement with?", a: `${LEGAL_ENTITY_INDIA}. You can read it in full before you sign.` },
  ],
  final: { title: "Start selling across India.", sub: "Register with your email and finish onboarding in your seller panel." },
  signup: { label: "Register to sell", href: "/login?market=in&apply=1" },
  login: { label: "Log in", href: "/login?market=in" },
};

export default india;
