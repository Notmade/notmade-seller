// India sellers selling into the UAE store. No currency code in this copy; the UAE price is set in the panel.
import { MAIN_SITE_URL, RETURN_WINDOW_DAYS, SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS, UAE_SITE_URL } from "@/app/lib/seller-config";
import type { ModeContent } from "./types";

const inHost = MAIN_SITE_URL.replace(/^https?:\/\//, "");
const aeHost = UAE_SITE_URL.replace(/^https?:\/\//, "");

const global: ModeContent = {
  code: "global",
  tab: { label: "Sell to UAE from India", short: "IN→AE" },
  meta: {
    title: "Sell to the UAE from India | NOTMADE seller portal",
    description: `Indian sellers on NOTMADE can now list the same products on ${aeHost}. Set a UAE price, get admin approval, and manage UAE orders from the same panel. Paid ${PAYOUT_DAYS} days after delivery.`,
  },

  hero: {
    kicker: "New for India sellers",
    headline: ["India seller can now", "sell to the UAE."],
    sub: `List the same product on ${aeHost} with a UAE price you set. UAE orders land in the same panel, shipping is partner-assisted, and you are paid ${PAYOUT_DAYS} days after delivery.`,
    stats: [
      { text: "One", label: "Panel for India and UAE orders" },
      { counter: { to: PAYOUT_DAYS, unit: "days" }, label: "Payout after delivery" },
      { rate: "international_pct", label: "India to UAE commission, live" },
    ],
  },

  trust: [
    "DPIIT recognised startup",
    `India store · ${inHost}`,
    `UAE store · ${aeHost}`,
    "Partner-assisted shipping",
    `${PAYOUT_DAYS}-day payout after delivery`,
    "You set your own prices",
  ],
  marquee: [
    "Same product, two stores",
    "Your UAE price",
    "One seller panel",
    "Partner-assisted shipping",
    `${PAYOUT_DAYS}-day payout`,
    `${RETURN_WINDOW_DAYS}-day returns, unboxing video`,
  ],

  why: {
    title: "One catalogue. Two stores.",
    items: [
      { kicker: "Same product", title: "List it for the UAE", desc: "Enable Sell in UAE on a product you already sell in India." },
      { kicker: "Your price", title: "Set a UAE price", desc: "Each product gets its own UAE price, set by you in the panel." },
      { kicker: "Same panel", title: "One place for orders", desc: "UAE orders appear next to India orders, with the same accept, pack and ready flow." },
      { counter: { to: PAYOUT_DAYS, unit: "days" }, title: "Payout after delivery", desc: `UAE orders are settled ${PAYOUT_DAYS} days after delivery.` },
    ],
  },

  flow: {
    title: "How a UAE order travels.",
    sub: "You ship from India. NOTMADE and its partners take it to the customer.",
    nodes: [
      { label: "01", title: "India seller", points: ["Accept the UAE order", "Pack it", "Mark as ready for handover"] },
      { label: "02", title: "NOTMADE", points: ["Partner-assisted shipping", "Order tracked in your panel", `Payout ${PAYOUT_DAYS} days after delivery`] },
      { label: "03", title: "UAE customer", points: [`Orders on ${aeHost}`, "Receives the parcel", `${RETURN_WINDOW_DAYS}-day returns with unboxing video`] },
    ],
  },

  timeline: {
    eyebrow: "How it works",
    title: "From India listing to UAE order.",
    sub: "Already approved in India? These are the only extra steps.",
    steps: [
      { title: "Have an approved India account", desc: "Sign up with email OTP, complete KYC and the agreement, and get approved. Already selling in India? You are here.", needs: ["An approved NOTMADE India seller account"] },
            { title: "Enable “Sell in UAE” on a product", desc: "Pick the products you want in the UAE and switch on UAE selling for each one." },
      { title: "Set the UAE price", desc: "Enter a separate UAE price for each product. You see what you receive after commission as you type.", needs: ["Your UAE price per product"] },
      { title: "Admin approval", desc: `Our team reviews the product before it goes live on ${aeHost}.` },
      { title: "UAE order arrives in the same panel", desc: "UAE orders appear in Orders next to your India orders. Accept or reject as usual." },
      { title: "Pack and mark ready for handover", desc: "Pack the order and mark it ready, just like an India order." },
      { title: "Partner-assisted shipping", desc: "NOTMADE's partners take the parcel from India to the customer in the UAE." },
      { title: `Payout in ${PAYOUT_DAYS} days`, desc: `You are settled ${PAYOUT_DAYS} days after delivery. Each UAE order shows the UAE rate.`, turnaround: `${PAYOUT_DAYS} days after delivery` },
    ],
  },

  orderDay: {
    title: "Two stores, one routine.",
    sub: "The store the customer ordered from decides the commission rate. Everything else works the same.",
    lanes: [
      { title: `India order · ${inHost}`, counter: { from: 3, to: 5, unit: "days" }, badge: "3 hours in NCR", stops: ["Order placed", "You accept", "Pickup with AWB", "Delivered"] },
      { title: `UAE order · ${aeHost}`, badge: "Partner-assisted", stops: ["Order placed", "You accept", "Ready for handover", "Delivered in UAE"] },
    ],
    notes: [
      { title: "Accept or Reject", desc: "Every order, India or UAE, waits for your decision. Reject if you cannot fulfil it." },
      { title: "Returns", desc: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video, which you can watch from the order in your panel.` },
      { title: "Rate follows the store", desc: "An order from the India store uses the India rate. An order from the UAE store uses the India to UAE rate." },
    ],
  },

  commission: {
    title: "The rate depends on the store.",
    sub: "Switch the store to see the split. Both rates come live from NOTMADE.",
    kind: "split",
    routes: [
      { label: "UAE store order", rate: "international_pct", hint: `India seller, order on ${aeHost}` },
      { label: "India store order", rate: "india_pct", hint: `Same product, order on ${inHost}` },
    ],
    note: "Both rates are read live from NOTMADE.",
  },

  stores: {
    title: "India store vs UAE store.",
    sub: "Same product, same panel. These are the differences.",
    cards: [
      {
        name: "India store", host: inHost, rate: "india_pct",
        rows: [["Price", "Your India price"], ["Delivery", "3 hours NCR · 3 to 5 days India"], ["Shipping", "Courier pickup with AWB"], ["Payout", `${PAYOUT_DAYS} days after delivery`]],
      },
      {
        name: "UAE store", host: aeHost, rate: "international_pct",
        rows: [["Price", "Your UAE price, set separately"], ["Delivery", "To customers in the UAE"], ["Shipping", "Partner-assisted from India"], ["Payout", `${PAYOUT_DAYS} days after delivery`]],
      },
    ],
  },

  features: {
    title: "Nothing new to learn.",
    sub: "UAE selling is built into the panel you already use.",
    items: [
      { icon: "globe", title: "Sell in UAE switch", desc: "Turn the UAE on or off per product." },
      { icon: "store", title: "Separate UAE price", desc: "Set the UAE price yourself and see your share after commission." },
      { icon: "orders", title: "One order list", desc: "India and UAE orders together, with the store on each order." },
      { icon: "dashboard", title: "Admin approval", desc: "Each UAE listing is reviewed by our team before it goes live." },
      { icon: "bell", title: "Notifications", desc: "New UAE orders and approvals, as they happen." },
      { icon: "payout", title: "Payout tracking", desc: "Every order shows its store, its rate and when it is paid." },
    ],
  },

  documents: {
    title: "What you need.",
    sub: "To list a product on the UAE store.",
    groups: [
      { title: "Your India account", items: ["Approved NOTMADE India seller account", "Your India KYC: GST certificate, or PAN and Aadhaar"] },
      { title: "For each UAE product", items: ["“Sell in UAE” switched on", "A UAE price you set in the panel"] },
    ],
  },

  faq: [
    { q: "How do I list a product in the UAE?", a: "Turn on UAE selling on the product, set its UAE price and save. It goes live after admin approval." },
    { q: "Who sets the UAE price?", a: "You do, separately from your India price." },
    { q: "Where do UAE orders show up?", a: "In the same Orders page as your India orders. Accept, pack and mark ready as usual." },
    { q: "Who ships to the UAE?", a: "Shipping to the UAE is partner-assisted. You mark the order ready for handover." },
    { q: "Which commission applies?", a: "It depends on the store the order came from: the India rate for India store orders, the India to UAE rate for UAE store orders. Both are shown live on this page." },
    { q: "When do I get paid for UAE orders?", a: `${PAYOUT_DAYS} days after delivery, like India orders.` },
    { q: "Where are the terms?", a: "Terms are in the agreement shown at signup." },
  ],

  final: { title: ["Take your label", "to the UAE."], sub: "New here? Open an India account first. Already selling? Log in and turn on UAE selling." },
  signup: { label: "Start selling", href: "/login?market=in" },
  login: { label: "Log in", href: "/login?market=in" },
  footnote: "Terms are in the agreement shown at signup.",
};

export default global;
