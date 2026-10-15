import { MAIN_SITE_URL, RETURN_WINDOW_DAYS, SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS } from "@/app/lib/seller-config";
import type { ModeContent } from "./types";

const host = MAIN_SITE_URL.replace(/^https?:\/\//, "");

const india: ModeContent = {
  code: "in",
  tab: { label: "India", short: "IN" },
  meta: {
    title: "Sell on NOTMADE across India | Seller portal",
    description: `Sell streetwear on ${host}. You set your prices, NOTMADE delivers in 3 hours across Delhi NCR and 3 to 5 days across India, and you are paid ${PAYOUT_DAYS} days after delivery.`,
  },

  hero: {
    kicker: "Seller accounts open in India",
    headline: ["Your label.", "Our reach."],
    sub: `List on ${host} at prices you set. We deliver in 3 hours across Delhi NCR and in 3 to 5 days across India, collect cash on delivery, handle returns, and pay you ${PAYOUT_DAYS} days after each delivery.`,
    stats: [
      { counter: { to: 3, unit: "hr" }, label: "Delhi NCR delivery" },
      { counter: { to: PAYOUT_DAYS, unit: "days" }, label: "Payout after delivery" },
      { rate: "india_pct", label: "Commission, live rate" },
    ],
  },

  trust: [
    "3-hour delivery in Delhi NCR",
    "3 to 5 days across India",
    "Cash on delivery",
    `${RETURN_WINDOW_DAYS}-day returns with unboxing video`,
    "You set your own prices",
  ],
  marquee: [
    "3-hour NCR delivery",
    "Pan-India in 3 to 5 days",
    `${PAYOUT_DAYS}-day payout`,
    "Cash on delivery",
    "You set the price",
    `${RETURN_WINDOW_DAYS}-day returns, unboxing video`,
    "AWB labels in one tap",
  ],

  why: {
    title: "We run the delivery. You run the label.",
    items: [
      { counter: { to: 3, unit: "hours" }, title: "Delhi NCR delivery", desc: "Orders in Delhi NCR are delivered in 3 hours, between 9am and 6pm." },
      { counter: { from: 3, to: 5, unit: "days" }, title: "Across India", desc: "Everywhere else in India, orders arrive in 3 to 5 days." },
      { counter: { to: PAYOUT_DAYS, unit: "days" }, title: "Payout after delivery", desc: `Your settlement is paid ${PAYOUT_DAYS} days after the order is delivered.` },
      { kicker: "Your price", title: "You set it. Always.", desc: "You set the price for every product you list." },
    ],
  },

  timeline: {
    eyebrow: "How it works",
    title: "From sign-up to payout.",
    sub: "Ten steps, all inside one seller panel.",
    steps: [
      { title: "Sign up with email OTP", desc: "Enter your email and the one-time code we send. No password to remember.", needs: ["An email address you check"] },
      { title: "KYC documents", desc: "Add your business details and upload your documents.", needs: ["GST certificate, or PAN and Aadhaar if you are not GST registered", "Business address and contact number"] },
      { title: "Agreement e-sign", desc: "Read the seller agreement in the panel and sign it with a code sent to your email.", needs: ["The code from your email"] },
      { title: "Admin approval", desc: "Our team reviews your account. You can follow the status from your panel." },
      { title: "List products with variants", desc: "Add photos, your price and variants like size or colour, with photos for each option. Every product is reviewed before it goes live.", needs: ["Product photos", "Your price and stock per variant"] },
      { title: "Order arrives: Accept or Reject", desc: "Each new order shows up in Orders. Accept it if you can fulfil it, or reject it if you cannot." },
      { title: "Pack and Mark as ready", desc: "Pack the order and tap Mark as ready when it is ready to hand over." },
      { title: "Courier pickup and AWB", desc: "The AWB is generated for the order. Download the label, stick it on, and hand the parcel to the courier at pickup." },
      { title: "Delivery", desc: "3 hours in Delhi NCR (9am to 6pm), 3 to 5 days across India. Cash on delivery is available.", turnaround: "3 hours NCR · 3 to 5 days India" },
      { title: `Payout in ${PAYOUT_DAYS} days`, desc: `You are settled ${PAYOUT_DAYS} days after delivery, with each order shown in Payouts.`, turnaround: `${PAYOUT_DAYS} days after delivery` },
    ],
  },

  orderDay: {
    title: "A day of orders.",
    sub: "Two delivery speeds, one routine: accept, pack, mark ready, hand over.",
    lanes: [
      { title: "Delhi NCR", badge: "9am – 6pm", counter: { to: 3, unit: "hours" }, stops: ["Order placed", "You accept", "Packed, marked ready", "Delivered"] },
      { title: "Rest of India", counter: { from: 3, to: 5, unit: "days" }, stops: ["Order placed", "You accept", "Pickup with AWB", "Delivered"] },
    ],
    notes: [
      { title: "Accept or Reject", desc: "Every order waits for your decision. Accept to confirm you will ship it; reject if the item is not available." },
      { title: "Returns", desc: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video. You can watch the video from the order in your panel.` },
      { title: "Cash on delivery", desc: "Customers can choose to pay on delivery. COD orders come into your panel like any other order." },
    ],
  },

  commission: {
    title: "Know your payout before you list.",
    sub: "Type a price. The commission rate comes live from NOTMADE, so this is the rate you will see at sign-up.",
    kind: "amount",
    currencySymbol: "₹",
    defaultPrice: 1999,
    routes: [{ label: "India store", rate: "india_pct", hint: `Orders on ${host}` }],
    note: "Your exact rate is also shown in the agreement before you sign.",
  },

  features: {
    title: "Everything in one panel.",
    sub: "The tools you use every day, built for drops and restocks.",
    items: [
      { icon: "dashboard", title: "Seller dashboard", desc: "Orders, products and payouts at a glance the moment you log in." },
      { icon: "orders", title: "Order management", desc: "Accept, reject, mark ready and follow each order to delivery." },
      { icon: "variants", title: "Variants with images", desc: "Sizes, colours and a second option, each value with its own photos." },
      { icon: "label", title: "AWB labels", desc: "Download the shipping label for every order, ready to print." },
      { icon: "bell", title: "Notifications", desc: "New orders, approvals and updates, in the panel as they happen." },
      { icon: "payout", title: "Payout tracking", desc: "See what is due, what is paid and which orders each settlement covers." },
    ],
  },

  documents: {
    title: "What you need to apply.",
    sub: "Have these ready before you start.",
    groups: [
      { title: "If you are GST registered", items: ["GST certificate (GSTIN)"] },
      { title: "If you are not GST registered", items: ["PAN card", "Aadhaar (front)"] },
      { title: "For everyone", items: ["Business name and address", "Contact number", "Email for OTP and agreement signing", "Product photos"] },
    ],
  },

  faq: [
    { q: "Who sets the price?", a: "You do. You set the price for each product you list." },
    { q: "How fast is delivery?", a: "3 hours across Delhi NCR between 9am and 6pm, and 3 to 5 days across the rest of India." },
    { q: "Do customers get cash on delivery?", a: "Yes. Cash on delivery is available to customers." },
    { q: "When do I get paid?", a: `${PAYOUT_DAYS} days after the order is delivered. Payouts in your panel show each settlement and the orders in it.` },
    { q: "How do returns work?", a: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video, which you can watch from the order in your panel.` },
    { q: "Can I reject an order?", a: "Yes. Every new order waits for you to accept or reject it. Reject if you cannot fulfil it." },
    { q: "What is the commission?", a: "The current India rate is shown live on this page and in your agreement before you sign." },
    { q: "Can I also sell in the UAE?", a: "Yes. Once your India account is approved you can turn on UAE selling for the products you choose. Switch to “Sell to UAE from India” above to see how." },
  ],

  final: { title: ["Drop it on", "NOTMADE."], sub: "Open your India seller account with just your email." },
  signup: { label: "Start selling", href: "/login?market=in" },
  login: { label: "Log in", href: "/login?market=in" },
  footnote: "Full terms are in the seller agreement shown at sign-up.",
};

export default india;
