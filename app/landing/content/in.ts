import { MAIN_SITE_URL, RETURN_WINDOW_DAYS, SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS } from "@/app/lib/seller-config";
import { INR, formatMoney } from "@/app/lib/currency";
import type { ModeContent } from "./types";

const host = MAIN_SITE_URL.replace(/^https?:\/\//, "");

const india: ModeContent = {
  code: "in",
  label: "India",
  hero: {
    kicker: "For streetwear labels",
    headline: ["Make it.", "We'll move it."],
    sub: `List on ${host} at prices you set. We deliver, collect cash on delivery and handle returns. You get paid ${PAYOUT_DAYS} days after each delivery.`,
    proof: [
      { value: "3-hour", label: "delivery across Delhi NCR" },
      { value: `${PAYOUT_DAYS}-day`, label: "payout after delivery" },
      { value: formatMoney(0, INR), label: "listing fee" },
    ],
  },

  steps: {
    title: "From sign-up to payout.",
    sub: "Everything happens in one seller panel.",
    items: [
      { title: "Sign up with OTP", desc: "Enter your email and the one-time code we send. No password. Add your business details and KYC documents." },
      { title: "Sign the agreement", desc: "Read the seller agreement in the panel and sign it with a code sent to your email." },
      { title: "Add products", desc: "Add photos, your price and variants like size or colour, with photos for each option." },
      { title: "Accept or reject orders", desc: "Every new order waits for you. Accept it if you can fulfil it, reject it if you cannot." },
      { title: "Mark ready", desc: "Pack the order and tap Mark as ready." },
      { title: "Courier pickup", desc: "Download the AWB label, stick it on and hand the parcel to the courier." },
      { title: "Get paid", desc: `Your payout lands ${PAYOUT_DAYS} days after delivery, with every order listed in Payouts.` },
    ],
  },

  delivery: {
    title: "Delivery timeline.",
    sub: "Two speeds, one routine for you: accept, pack, mark ready.",
    items: [
      { value: "3 hours", label: "Delhi NCR", note: "Orders placed between 9am and 6pm" },
      { value: "3 to 5 days", label: "Pan-India", note: "Everywhere else in India" },
      { value: "COD", label: "Cash on delivery", note: "Available to customers" },
    ],
  },

  money: {
    title: "Commission and payout.",
    sub: "One commission on each completed sale. No listing fee.",
    points: [
      { title: `${formatMoney(0, INR)} listing fee`, desc: "List your products for free." },
      { title: "You set the price", desc: "You set the price for every product you list." },
      { title: `Paid in ${PAYOUT_DAYS} days`, desc: `Payout ${PAYOUT_DAYS} days after the order is delivered.` },
    ],
    calc: {
      rate: "india_pct",
      currency: INR,
      defaultPrice: 1999,
      note: "Your exact rate is shown in the seller agreement before you sign.",
    },
  },

  returns: {
    title: "Returns.",
    sub: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video.`,
    points: [
      `${RETURN_WINDOW_DAYS}-day return window from delivery`,
      "An unboxing video is required for every return",
      "Watch the video from the order in your panel",
    ],
  },

  faq: [
    { q: "Who sets the price?", a: "You do. You set the price for each product you list." },
    { q: "Is there a listing fee?", a: "No. Listing is free. NOTMADE takes a commission only on completed sales." },
    { q: "How fast is delivery?", a: "3 hours across Delhi NCR between 9am and 6pm, and 3 to 5 days across the rest of India." },
    { q: "Do customers get cash on delivery?", a: "Yes. Cash on delivery is available to customers." },
    { q: "When do I get paid?", a: `${PAYOUT_DAYS} days after the order is delivered. Payouts in your panel show each settlement and the orders in it.` },
    { q: "How do returns work?", a: `Customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video, which you can watch from the order in your panel.` },
    { q: "Can I reject an order?", a: "Yes. Every new order waits for you to accept or reject it." },
    { q: "What is the commission?", a: "The current India rate is shown live on this page and in your agreement before you sign." },
  ],

  final: { title: "Start selling on NOTMADE.", sub: "Open your India seller account with just your email." },
  signup: { label: "Start selling", href: "/login?market=in&apply=1" },
  login: { label: "Log in", href: "/login?market=in" },
};

export default india;
