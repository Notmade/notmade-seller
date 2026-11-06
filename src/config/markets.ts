// Seller markets shown in the country switcher, login and onboarding (landing copy lives in app/landing/content).
// Adding a country = adding one object to MARKETS (and its code to NEXT_PUBLIC_SELLER_MARKETS_OPEN
// once accounts open there). New seller sign-ups also need the country in SELLER_SIGNUP_COUNTRIES: see
// useSignupOpen in app/components/market.tsx.

import { CURRENCY_BY_COUNTRY, type Currency } from "@/app/lib/currency";
import { FLAG_AE, FLAG_IN } from "./flags";
import { MAIN_SITE_URL, SETTLEMENT_DAYS_AFTER_DELIVERY, UAE_SITE_URL } from "@/app/lib/seller-config";

export type MarketCode = "in" | "ae";

export interface Market {
  code: MarketCode;
  name: string;
  /** Inline SVG markup (trusted, static) drawn in a 3:2 box. */
  flag: string;
  /** Seller country sent to POST /seller/signup. */
  sellerCountry: "IN" | "AE";
  currency: Currency;
  payoutCurrency: Currency;
  storeUrl: string;
  documents: string[];
  delivery: string;
  /** Sellers can onboard in this market (NEXT_PUBLIC_SELLER_MARKETS_OPEN). New sign-ups: useSignupOpen. */
  open: boolean;
}

// Only "in" and "ae" are recognised; anything else in the variable is ignored.
const OPEN = new Set(
  (process.env.NEXT_PUBLIC_SELLER_MARKETS_OPEN || "in,ae").split(",").map((s) => s.trim().toLowerCase())
    .filter((s) => s === "in" || s === "ae"),
);

export const SETTLEMENT_DAYS = SETTLEMENT_DAYS_AFTER_DELIVERY;

export const MARKETS: Market[] = [
  {
    code: "in",
    name: "India",
    flag: FLAG_IN,
    sellerCountry: "IN",
    currency: CURRENCY_BY_COUNTRY.IN,
    payoutCurrency: CURRENCY_BY_COUNTRY.IN,
    storeUrl: MAIN_SITE_URL,
    documents: ["GST certificate, or PAN and Aadhaar", "Product photos", "Bank account in your business name"],
    delivery: "Delivery in 3 hours across Delhi NCR and 3 to 5 days across India",
    open: OPEN.has("in"),
  },
  {
    code: "ae",
    name: "UAE",
    flag: FLAG_AE,
    sellerCountry: "AE",
    currency: CURRENCY_BY_COUNTRY.AE,
    payoutCurrency: CURRENCY_BY_COUNTRY.AE,
    storeUrl: UAE_SITE_URL,
    documents: ["Trade licence", "TRN, if you are VAT registered", "Emirates ID or passport", "IBAN for your UAE bank account"],
    delivery: "Delivered in 3 to 5 days across the UAE",
    open: OPEN.has("ae"),
  },
];

export const DEFAULT_MARKET: MarketCode = "in";
export const MARKET_COOKIE = "nm_market";

export function isMarketCode(v: unknown): v is MarketCode {
  return typeof v === "string" && MARKETS.some((m) => m.code === v);
}

export function getMarket(code: string | null | undefined): Market {
  return MARKETS.find((m) => m.code === code) ?? MARKETS.find((m) => m.code === DEFAULT_MARKET)!;
}

export function marketForCountry(country: string | null | undefined): Market | undefined {
  return MARKETS.find((m) => m.sellerCountry === country);
}
