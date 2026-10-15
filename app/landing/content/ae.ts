// UAE copy. Do not write the currency code here: prices are set by the seller in the local currency in the panel.
import { RETURN_WINDOW_DAYS, SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS, UAE_SITE_URL } from "@/app/lib/seller-config";
import type { ModeContent } from "./types";

const host = UAE_SITE_URL.replace(/^https?:\/\//, "");

const uae: ModeContent = {
  code: "ae",
  tab: { label: "UAE", short: "AE" },
  meta: {
    title: "Sell on NOTMADE in the UAE | Seller portal",
    description: `Sell streetwear on ${host}. You set your prices in the local currency, delivery is handled with partner assistance, customers can pay cash on delivery, and you are paid ${PAYOUT_DAYS} days after delivery.`,
  },

  hero: {
    kicker: `UAE store · ${host}`,
    headline: ["Built in the UAE.", "Sold on NOTMADE."],
    sub: `List on ${host} at prices you set in the local currency. Local delivery is handled with partner assistance, customers can pay cash on delivery, and you are paid ${PAYOUT_DAYS} days after each delivery.`,
    stats: [
      { counter: { to: PAYOUT_DAYS, unit: "days" }, label: "Payout after delivery" },
      { counter: { to: RETURN_WINDOW_DAYS, unit: "days" }, label: "Returns, with unboxing video" },
      { rate: "uae_local_pct", label: "Local commission, live rate" },
    ],
  },

  trust: [
    `UAE store at ${host}`,
    "Partner-assisted local delivery",
    "Cash on delivery",
    `${RETURN_WINDOW_DAYS}-day returns with unboxing video`,
    "You set your own prices",
  ],
  marquee: [
    host,
    "Cash on delivery",
    "Partner-assisted delivery",
    `${PAYOUT_DAYS}-day payout`,
    "You set the price",
    `${RETURN_WINDOW_DAYS}-day returns, unboxing video`,
    "One seller panel",
  ],

  why: {
    title: "A UAE storefront, without building one.",
    items: [
      { kicker: "Store", title: host, desc: "Your products listed on NOTMADE's UAE store, next to the rest of the drop." },
      { kicker: "Delivery", title: "Partner-assisted", desc: "Local delivery is handled with our delivery partners. You pack and mark ready." },
      { kicker: "COD", title: "Cash on delivery", desc: "Customers in the UAE can pay cash on delivery today." },
      { counter: { to: PAYOUT_DAYS, unit: "days" }, title: "Payout after delivery", desc: `Settled ${PAYOUT_DAYS} days after the order is delivered, to your UAE bank account.` },
    ],
  },

  timeline: {
    eyebrow: "How it works",
    title: "From sign-up to payout.",
    sub: "The same seller panel Indian sellers use, set up for the UAE.",
    steps: [
      { title: "Sign up with email OTP", desc: "Enter your email and the one-time code we send. No password to remember.", needs: ["An email address you check"] },
      { title: "Business details and documents", desc: "Add your business details and upload your documents.", needs: ["Trade licence", "Emirates ID or passport", "IBAN for your UAE bank account"] },
      { title: "Agreement e-sign", desc: "Read the UAE seller agreement in the panel and sign it with a code sent to your email.", needs: ["The code from your email"] },
      { title: "Admin approval", desc: "Our team reviews your account. You can follow the status from your panel." },
      { title: "List products with variants", desc: "Add photos, variants with photos for each option, and your price, set in the local currency in the panel. Every product is reviewed before it goes live.", needs: ["Product photos", "Your price and stock per variant"] },
      { title: "Order arrives: Accept or Reject", desc: "Each new order shows up in Orders. Accept it if you can fulfil it, or reject it if you cannot." },
      { title: "Pack and Mark as ready", desc: "Pack the order and tap Mark as ready when it is ready to hand over." },
      { title: "Partner-assisted handover", desc: "Our delivery partner collects the parcel and delivers it in the UAE." },
      { title: "Delivery, cash on delivery", desc: "The customer receives the order and can pay cash on delivery." },
      { title: `Payout in ${PAYOUT_DAYS} days`, desc: `You are settled ${PAYOUT_DAYS} days after delivery, to your UAE bank account.`, turnaround: `${PAYOUT_DAYS} days after delivery` },
    ],
  },

  orderDay: {
    title: "A day of orders.",
    sub: "Accept, pack, mark ready. Our partners take it from there.",
    lanes: [
      { title: "UAE order", badge: "Cash on delivery", stops: ["Order placed", "You accept", "Packed, marked ready", "Partner delivers"] },
    ],
    notes: [
      { title: "Accept or Reject", desc: "Every order waits for your decision. Accept to confirm you will ship it; reject if the item is not available." },
      { title: "Returns", desc: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video. You can watch the video from the order in your panel.` },
      { title: "Your prices", desc: "Prices are set by you in the local currency in the panel." },
    ],
  },

  commission: {
    title: "See the split on every sale.",
    sub: "Out of every sale, this is what NOTMADE keeps and what you receive. The rate comes live from NOTMADE.",
    kind: "split",
    routes: [{ label: "UAE local seller", rate: "uae_local_pct", hint: `Orders on ${host}` }],
    note: "Your exact rate is also shown in the agreement before you sign.",
  },

  features: {
    title: "Everything in one panel.",
    sub: "Run your UAE store from the same seller panel.",
    items: [
      { icon: "dashboard", title: "Seller dashboard", desc: "Orders, products and payouts at a glance the moment you log in." },
      { icon: "orders", title: "Order management", desc: "Accept, reject, mark ready and follow each order to delivery." },
      { icon: "variants", title: "Variants with images", desc: "Sizes, colours and a second option, each value with its own photos." },
      { icon: "label", title: "Shipping labels", desc: "Download the label for every order, ready for handover." },
      { icon: "bell", title: "Notifications", desc: "New orders, approvals and updates, in the panel as they happen." },
      { icon: "payout", title: "Payout tracking", desc: "See what is due, what is paid and which orders each settlement covers." },
    ],
  },

  documents: {
    title: "What a UAE seller needs.",
    sub: "For UAE-based businesses with a trade licence.",
    groups: [
      { title: "Business", items: ["Trade licence and its number", "TRN, if you are VAT registered", "Business name, address and emirate"] },
      { title: "Owner ID", items: ["Emirates ID, or passport"] },
      { title: "Payouts", items: ["IBAN for your UAE bank account"] },
      { title: "Listing", items: ["Product photos", "Your prices, set in the local currency in the panel"] },
    ],
  },

  faq: [
    { q: "Who can sell on the UAE store?", a: "UAE-based businesses with a trade licence. If your business is in India, see “Sell to UAE from India” above." },
    { q: "Where are my products sold?", a: `On NOTMADE's UAE store at ${host}.` },
    { q: "Who sets the price?", a: "You do, in the local currency in the panel." },
    { q: "Who handles delivery?", a: "Local delivery is handled with partner assistance. You pack the order and mark it ready in your panel." },
    { q: "Can customers pay cash on delivery?", a: "Yes. Cash on delivery is available in the UAE today." },
    { q: "When do I get paid?", a: `${PAYOUT_DAYS} days after the order is delivered, to your UAE bank account.` },
    { q: "How do returns work?", a: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video, which you can watch from the order in your panel.` },
    { q: "What is the commission?", a: "The current UAE local rate is shown live on this page and in your agreement before you sign." },
  ],

  final: { title: ["Your drop,", "in the UAE."], sub: `Get your products on ${host}.` },
  signup: {
    label: "Start selling",
    href: "/login?market=ae",
    waitlist: {
      label: "Join the waitlist",
      note: "UAE seller sign-up is not open yet. This adds your email to the UAE seller waitlist; it is not an application.",
      done: "You're on the UAE seller waitlist. We will email you when UAE seller sign-up opens. No account has been created yet.",
      waitlistMarket: "ae",
    },
  },
  login: { label: "Log in", href: "/login?market=ae" },
  footnote: "Full terms are in the seller agreement shown at sign-up.",
};

export default uae;
