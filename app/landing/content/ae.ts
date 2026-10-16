// UAE copy. Only state what the app or backend already configures for the UAE; anything else
// (payout timing, fees, delivery times, emirates covered) is "shared during onboarding".
import { UAE_SITE_URL } from "@/app/lib/seller-config";
import { AED } from "@/app/lib/currency";
import type { ModeContent } from "./types";

const host = UAE_SITE_URL.replace(/^https?:\/\//, "");

const uae: ModeContent = {
  code: "ae",
  label: "UAE",
  meta: {
    title: "Sell on NOTMADE in the UAE | Seller portal",
    description: `Sell to customers in the UAE on ${host}. Cash on delivery, delivery handled with our partner couriers, and one seller panel for your orders.`,
  },

  hero: {
    kicker: "For UAE-based labels",
    headline: ["Sell to customers", "in the UAE."],
    sub: `List on ${host} at prices you set. Customers can pay cash on delivery, and delivery is handled with our partner couriers.`,
    proof: [
      { value: "COD", label: "cash on delivery for customers" },
      { value: "Partner couriers", label: "handle delivery" },
      { value: "Emirate-wise", label: "coverage, shared during onboarding" },
    ],
  },

  steps: {
    title: "UAE seller onboarding.",
    sub: "From sign-up to your first order, in one seller panel.",
    items: [
      { title: "Sign up with OTP", desc: "Enter your email and the one-time code we send. No password." },
      { title: "Business details and documents", desc: "Add your business details and emirate, then upload your trade licence, Emirates ID or passport, TRN if you are VAT registered, and the IBAN for your UAE bank account." },
      { title: "Sign the UAE agreement", desc: "Read the UAE seller agreement in the panel and sign it with a code sent to your email." },
      { title: "Account review", desc: "Our team reviews your account. You can follow the status in your panel." },
      { title: "Add products", desc: `Add photos, variants with photos for each option, and your price in ${AED}.` },
      { title: "Accept or reject orders", desc: "Every new order waits for you. Accept it if you can fulfil it, reject it if you cannot." },
      { title: "Mark ready", desc: "Pack the order and tap Mark as ready. Our partner courier collects it." },
      { title: "Get paid", desc: "Payouts go to your UAE bank account. The payout schedule is shared during onboarding." },
    ],
  },

  delivery: {
    title: "Delivery in the UAE.",
    sub: "You pack and mark ready. Our partner couriers take it from there.",
    items: [
      { value: "Partner couriers", label: "Delivery", note: "Collected from you and delivered to the customer" },
      { value: "Emirate-wise", label: "Coverage", note: "Emirates covered and delivery times are shared during onboarding" },
      { value: "COD", label: "Cash on delivery", note: "Customers in the UAE can pay on delivery" },
    ],
  },

  money: {
    title: "Commission and payout.",
    sub: "A commission on each completed sale. The rate is read live from NOTMADE.",
    points: [
      { title: "You set the price", desc: `Prices are set by you in ${AED} in the panel.` },
      { title: "Payout to your UAE bank", desc: "Paid to the IBAN on your account. Payout schedule shared during onboarding." },
      { title: "Other fees", desc: "Any fees beyond commission are shared during onboarding." },
    ],
    calc: {
      rate: "uae_local_pct",
      currency: AED,
      note: "Your exact rate is shown in the UAE seller agreement before you sign.",
    },
  },

  returns: {
    title: "Returns.",
    sub: "Customers return with an unboxing video. The return window is shared during onboarding.",
    points: [
      "An unboxing video is required for every return",
      "Watch the video from the order in your panel",
      "Return window shared during onboarding",
    ],
  },

  faq: [
    { q: "Who can sell on the UAE store?", a: "UAE-based businesses with a trade licence." },
    { q: "Where are my products sold?", a: `On NOTMADE's UAE store at ${host}.` },
    { q: "Who sets the price?", a: `You do, in ${AED}, in the seller panel.` },
    { q: "Who handles delivery?", a: "Our partner couriers. You pack the order and mark it ready in your panel." },
    { q: "Which emirates do you cover?", a: "Coverage is set emirate by emirate. The emirates covered and delivery times are shared during onboarding." },
    { q: "Can customers pay cash on delivery?", a: "Yes. Cash on delivery is available to customers in the UAE." },
    { q: "When do I get paid?", a: "Payouts go to your UAE bank account. The payout schedule is shared during onboarding." },
    { q: "What is the commission?", a: "The current UAE rate is shown live on this page and in your agreement before you sign." },
  ],

  final: { title: "Start selling in the UAE.", sub: `Get your products on ${host}.` },
  signup: {
    label: "Start selling",
    href: "/login?market=ae&apply=1",
    waitlist: {
      label: "Join the waitlist",
      note: "UAE seller sign-up is not open yet. This adds your email to the UAE seller waitlist; it is not an application.",
      done: "You're on the UAE seller waitlist. We will email you when UAE seller sign-up opens.",
      waitlistMarket: "ae",
    },
  },
  login: { label: "Log in", href: "/login?market=ae" },
};

export default uae;
