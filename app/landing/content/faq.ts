// Seller FAQ (/faq). Every answer comes from seller-config, the markets config, the onboarding flow or
// the current seller agreements (in-v2, uae-local-v2). If a fact is not in one of those, leave the
// question out rather than guess.

import { AED } from "@/app/lib/currency";
import {
  COMMISSION_PCT_INDIA, ENTITY_BY_COUNTRY, MAIN_SITE_URL, MIN_PRODUCTS, NOTICE_DAYS_INDIA, NOTICE_DAYS_UAE,
  RETURN_WINDOW_DAYS, REVIEW_HOURS, TERMINATION_SETTLEMENT_DAYS, SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS, UAE_RATE_CHANGE_NOTICE_DAYS, UAE_SITE_URL,
} from "@/app/lib/seller-config";
import { getMarket } from "@/src/config/markets";

const host = (u: string) => u.replace(/^https?:\/\//, "");
const IN = getMarket("in");
const AE = getMarket("ae");

/** "The UAE rate is 15%." when configured, else where to find it. */
export const uaeRateSentence = () =>
  AE.commissionPct != null
    ? `The current UAE rate is ${AE.commissionPct}%, and your exact rate is in your UAE agreement before you sign.`
    : "The UAE rate is shown in your UAE seller agreement before you sign.";

export type FaqItem = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

export const SELLER_FAQ: FaqGroup[] = [
  {
    id: "start",
    title: "Getting started",
    items: [
      {
        q: "Who can sell on NOTMADE?",
        a: `Businesses based in India can sell on ${host(MAIN_SITE_URL)}, with or without GST registration. Businesses established in the UAE with a valid trade licence can sell on ${host(UAE_SITE_URL)}. You sign the seller agreement for the country your business is based in.`,
      },
      {
        q: "What can I sell?",
        a: "NOTMADE is a fashion and lifestyle marketplace. Every product must be genuine, legally compliant and match its photos and description. Selling counterfeit or prohibited products ends the agreement.",
      },
      {
        q: "How do I sign up?",
        a: "Enter your email and the one-time code we send. There is no password. Then add your business details, upload your documents and sign the seller agreement in the panel with a code sent to your email.",
      },
      {
        q: "How long does approval take?",
        a: `Our team reviews your account after you sign the agreement, usually within ${REVIEW_HOURS} hours. We email you when you are approved, and you can follow the status in your panel.`,
      },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    items: [
      {
        q: "What documents do I need to sell in India?",
        a: "If you are GST registered, your GSTIN and GST certificate. If you are not, your PAN card and the front of your Aadhaar. You also add your business address and a bank account in your business name for settlements.",
      },
      {
        q: "What documents do I need to sell in the UAE?",
        a: "Your trade licence, your Emirates ID or passport, your TRN if you are VAT registered, and the IBAN of your UAE bank account for settlements.",
      },
    ],
  },
  {
    id: "fees",
    title: "Fees and payouts",
    items: [
      {
        q: "What does it cost to sell on NOTMADE?",
        a: `In India there is no listing fee and no monthly fee. NOTMADE takes a flat commission on the selling price of each delivered order. The standard India rate is ${COMMISSION_PCT_INDIA}%, and your exact rate is in your agreement before you sign. In the UAE, NOTMADE takes a commission on the ${AED} selling price of each delivered order. ${uaeRateSentence()}`,
      },
      {
        q: "What is deducted from my payout?",
        a: "In India: the commission, GST on the commission, TDS where it applies, and adjustments for returns, cancellations, refunds or chargebacks. In the UAE: the commission, VAT on the commission where it applies, and the same adjustments.",
      },
      {
        q: "When do I get paid?",
        a: `In India, within ${PAYOUT_DAYS} days of confirmed delivery, to the bank account on your profile. In the UAE, within ${PAYOUT_DAYS} days after the ${RETURN_WINDOW_DAYS}-day return window closes, by bank transfer to your UAE IBAN. You get a settlement statement for each payout.`,
      },
      {
        q: "Who sets the price?",
        a: `You do. NOTMADE does not set, mark up or change your selling price. UAE prices are set in ${AED} and must include VAT if you are VAT registered.`,
      },
      {
        q: "Can the commission rate change?",
        a: `In the UAE, NOTMADE gives at least ${UAE_RATE_CHANGE_NOTICE_DAYS} days' written notice, and orders placed before the change keep the rate recorded on the order. In India, NOTMADE gives reasonable notice of any material change to the commission structure.`,
      },
    ],
  },
  {
    id: "orders",
    title: "Orders, delivery and returns",
    items: [
      {
        q: "Do I have to accept every order?",
        a: "No. Every new order waits in your panel for you to accept or reject it. Accept it if you can fulfil it, reject it if you cannot.",
      },
      {
        q: "How does delivery work?",
        a: `In India, pack the order, mark it ready, print the AWB label from your panel and hand the parcel to the courier. ${IN.delivery}. In the UAE, pack the order and mark it ready, and our partner courier collects it. ${AE.delivery}.`,
      },
      {
        q: "Can customers pay cash on delivery?",
        a: "Yes. Cash on delivery is available to customers in India and in the UAE.",
      },
      {
        q: "How do returns work?",
        a: `Customers can raise a return within ${RETURN_WINDOW_DAYS} days of delivery, and only with an unboxing video. You can watch the video from the order in your panel. If the return is caused by a product defect, a wrong description or a seller error, the seller bears the cost. If it is caused by a platform error, or by transit damage in the UAE, NOTMADE bears it.`,
      },
    ],
  },
  {
    id: "listing",
    title: "Listing and invoices",
    items: [
      {
        q: "How do I list products?",
        a: `Once you are approved, add products in your panel: photos, your price, stock, and variants such as size or colour with photos for each option. In India you need at least ${MIN_PRODUCTS} products to go live.`,
      },
      {
        q: "Who issues the invoice to the customer?",
        a: "In India, you issue a GST-compliant invoice directly to the customer. In the UAE, if you are VAT registered, you issue VAT-compliant tax invoices as UAE law requires.",
      },
    ],
  },
  {
    id: "agreement",
    title: "Agreement",
    items: [
      {
        q: "Who is my contract with?",
        a: `India-based sellers contract with ${ENTITY_BY_COUNTRY.IN.name} in India, under the laws of India. UAE-based sellers contract with ${ENTITY_BY_COUNTRY.AE.name} in Ajman, under UAE law. You read and sign the agreement in your panel before your account is reviewed.`,
      },
      {
        q: "How do I stop selling?",
        a: `In India, either side can end the agreement with ${NOTICE_DAYS_INDIA} days' written notice, and pending settlements are paid within ${TERMINATION_SETTLEMENT_DAYS} days of it ending. In the UAE, you can stop selling with ${NOTICE_DAYS_UAE} days' written notice, and orders placed before then are fulfilled and settled as normal.`,
      },
    ],
  },
];

export const ALL_FAQ: FaqItem[] = SELLER_FAQ.flatMap((g) => g.items);
