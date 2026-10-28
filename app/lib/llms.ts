// /llms.txt (https://llmstxt.org): a plain summary of the seller programme for AI assistants and search.
// Built from the same config and page list as the site, so its facts and links never drift from the pages.

import { uaeRateSentence } from "../landing/content/faq";
import { getMarket } from "@/src/config/markets";
import { AED, INR, SELLER_SUPPORT_EMAIL } from "./currency";
import { getPage, PUBLIC_PAGES, type PageKey } from "./public-pages";
import { absoluteUrl } from "./seo";
import {
  COMMISSION_PCT_INDIA, CONTACT_EMAIL, ENTITY_BY_COUNTRY, MAIN_SITE_URL, MIN_PRODUCTS, RETURN_WINDOW_DAYS, REVIEW_HOURS,
  SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS, UAE_SITE_URL,
} from "./seller-config";

const link = (key: PageKey) => {
  const p = getPage(key);
  return `- [${p.name}](${absoluteUrl(p.path)}): ${p.description}`;
};

export function buildLlmsTxt(): string {
  const india = getMarket("in");
  const uae = getMarket("ae");
  const main: PageKey[] = ["sell-in-india", "sell-in-uae", "how-it-works", "fees-and-payouts", "faq"];
  const rest = PUBLIC_PAGES.filter((p) => p.key !== "home" && !main.includes(p.key)).map((p) => p.key);

  return `# NOTMADE Seller

> NOTMADE is a fashion and lifestyle marketplace with an India store (${MAIN_SITE_URL}) and a UAE store (${UAE_SITE_URL}). seller.notmade.in is where businesses in India and the UAE sign up to sell on it, sign their seller agreement and run orders and payouts from one seller panel. Sellers set their own prices; NOTMADE takes a commission on each delivered order.

## Who can sell
- India: businesses based in India, with or without GST registration. Documents: GSTIN and GST certificate if GST registered, otherwise PAN card and Aadhaar; plus a bank account in the business name. Products are sold on ${MAIN_SITE_URL} in ${INR}.
- UAE: businesses established in the UAE with a valid trade licence. Documents: trade licence, Emirates ID or passport, TRN if VAT registered, and a UAE bank IBAN. Products are sold on ${UAE_SITE_URL} in ${AED}.
- Products must be genuine, accurately described and legally compliant in the country of sale. In India at least ${MIN_PRODUCTS} products are needed to go live.

## How selling works
1. Sign up with an email one-time code (no password), then add business details and documents.
2. Read and sign the seller agreement in the panel with an email code.
3. NOTMADE reviews the account, usually within ${REVIEW_HOURS} hours.
4. List products with photos, price, stock and variants.
5. Accept or reject each new order, pack it and mark it ready for the courier.
6. Get paid by bank transfer, with a settlement statement.

## Fees and payouts
- India: no listing fee or monthly fee. Flat commission on the selling price; the standard rate is ${COMMISSION_PCT_INDIA}% (the exact rate is in the agreement). Payout within ${PAYOUT_DAYS} days of confirmed delivery, after commission, GST on commission, TDS and return adjustments.
- UAE: commission on the ${AED} selling price. ${uaeRateSentence()} Payout to the seller's UAE IBAN within ${PAYOUT_DAYS} days after the ${RETURN_WINDOW_DAYS}-day return window closes.
- Returns: customers can return within ${RETURN_WINDOW_DAYS} days of delivery with an unboxing video. The seller bears the cost when the cause is a defect, misdescription or seller error.

## Delivery
- India: ${india.delivery}. Cash on delivery is available.
- UAE: ${uae.delivery}, with NOTMADE's partner couriers. Cash on delivery is available.

## Companies
- India: ${ENTITY_BY_COUNTRY.IN.name}, ${ENTITY_BY_COUNTRY.IN.registeredOffice}. ${ENTITY_BY_COUNTRY.IN.law}.
- UAE: ${ENTITY_BY_COUNTRY.AE.name}, ${ENTITY_BY_COUNTRY.AE.registeredOffice}. ${ENTITY_BY_COUNTRY.AE.law}.

## Main pages
${main.map(link).join("\n")}

## Policies and contact
${rest.map(link).join("\n")}
- Seller support: ${SELLER_SUPPORT_EMAIL}. Agreements and notices: ${CONTACT_EMAIL}.

## Not public
The seller panel (/dashboard), onboarding (/onboarding) and the API (/api/) need a seller login and are not indexed.
`;
}
