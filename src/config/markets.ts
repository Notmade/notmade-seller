// Seller markets shown in the country switcher, login and onboarding (landing copy lives in app/landing/content).
// Adding a country = adding one object to MARKETS (and its code to NEXT_PUBLIC_SELLER_MARKETS_OPEN
// once accounts open there).

import { CURRENCY_BY_COUNTRY, type Currency } from "@/app/lib/currency";
import { COMMISSION_PCT_INDIA, MAIN_SITE_URL, SETTLEMENT_DAYS_AFTER_DELIVERY, UAE_SITE_URL } from "@/app/lib/seller-config";

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
  /** Fallback commission for the registration step when the API has no seller-specific rate yet. */
  commissionPct: number | null;
  /** Seller accounts can be created for this market (NEXT_PUBLIC_SELLER_MARKETS_OPEN). */
  open: boolean;
}

// Only "in" and "ae" are recognised; anything else in the variable is ignored.
const OPEN = new Set(
  (process.env.NEXT_PUBLIC_SELLER_MARKETS_OPEN || "in,ae").split(",").map((s) => s.trim().toLowerCase())
    .filter((s) => s === "in" || s === "ae"),
);

const envPct = (v: string | undefined) => (v && Number.isFinite(Number(v)) ? Number(v) : null);

export const SETTLEMENT_DAYS = SETTLEMENT_DAYS_AFTER_DELIVERY;

const FLAG_IN =
  '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#FF9933"/><rect y="13.33" width="30" height="6.67" fill="#138808"/>' +
  '<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width="0.6"/><circle cx="15" cy="10" r="0.5" fill="#000080"/>';
const FLAG_AE =
  '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#00732F"/><rect y="13.33" width="30" height="6.67" fill="#000"/>' +
  '<rect width="8" height="20" fill="#FF0000"/>';

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
    commissionPct: COMMISSION_PCT_INDIA,
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
    commissionPct: envPct(process.env.NEXT_PUBLIC_UAE_COMMISSION_PCT),
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

export const OPEN_MARKETS = MARKETS.filter((m) => m.open);

/** "Seller accounts are open to India-based sellers for now." built from the open list. */
export function openMarketsSentence(): string {
  const names = OPEN_MARKETS.map((m) => `${m.name}-based`);
  if (!names.length) return "Seller accounts are not open yet.";
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `Seller accounts are open to ${list} sellers for now.`;
}

export function signupHref(m: Market): string {
  return `/login?market=${m.code}`;
}

