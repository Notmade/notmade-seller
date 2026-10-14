// Seller markets shown in the country switcher, landing page, login and onboarding.
// Adding a country = adding one object to MARKETS (and its code to NEXT_PUBLIC_SELLER_MARKETS_OPEN
// once accounts open there).

import {
  COMMISSION_PCT_INDIA, MAIN_SITE_URL, MIN_PRODUCTS, RETURN_WINDOW_HOURS, SETTLEMENT_DAYS_AFTER_DELIVERY, UAE_SITE_URL,
} from "@/app/lib/seller-config";

export type MarketCode = "in" | "ae" | "global";

export interface Market {
  code: MarketCode;
  name: string;
  /** Inline SVG markup (trusted, static) drawn in a 3:2 box. */
  flag: string;
  /** Seller country sent to POST /seller/signup; null when there is no signup path yet. */
  sellerCountry: "IN" | "AE" | null;
  currency: string | null;
  payoutCurrency: string | null;
  storeUrl: string | null;
  documents: string[];
  delivery: string | null;
  /** Fallback commission for the registration step when the API has no seller-specific rate yet. */
  commissionPct: number | null;
  /** Seller accounts can be created for this market (NEXT_PUBLIC_SELLER_MARKETS_OPEN). */
  open: boolean;
  /** Landing page copy. Markets with this set get a segment in the landing page toggle. */
  landing?: MarketLanding;
}

export interface MarketLanding {
  /** Two-letter label for the compact header toggle. */
  short: string;
  meta: { title: string; description: string };
  status: string;
  headline: string;
  sub: string;
  storeHost: string;
  delivery: string;
  documents: string[];
  payout: string;
  pricePoints: { t: string; d: string }[];
  returns: string;
  /** Prices shown on the CSS product-card illustration in the hero. */
  samplePrices: string[];
  whatsapp: { display: string; href: string };
  faq: { q: string; a: string }[];
}

const OPEN = new Set(
  (process.env.NEXT_PUBLIC_SELLER_MARKETS_OPEN || "in").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
);

const envPct = (v: string | undefined) => (v && Number.isFinite(Number(v)) ? Number(v) : null);

export const UAE_STORE_LIVE = process.env.NEXT_PUBLIC_UAE_STORE_LIVE === "true";
export const SETTLEMENT_DAYS = SETTLEMENT_DAYS_AFTER_DELIVERY;

const UAE_STATUS = UAE_STORE_LIVE ? "UAE store is live" : "UAE store launching soon";
const SIZES_ANSWER =
  "Yes. Add sizes to a product, including size names of your own, with stock for each one. Each product can have up to 10 photos.";
const UAE_FROM_INDIA =
  "Yes. Once your India account is approved, turn on UAE selling from your dashboard, set a separate AED price for each product " +
  "and sign a short UAE addendum with a code sent to your email. UAE sales are settled in AED.";

const FLAG_IN =
  '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#FF9933"/><rect y="13.33" width="30" height="6.67" fill="#138808"/>' +
  '<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width="0.6"/><circle cx="15" cy="10" r="0.5" fill="#000080"/>';
const FLAG_AE =
  '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#00732F"/><rect y="13.33" width="30" height="6.67" fill="#000"/>' +
  '<rect width="8" height="20" fill="#FF0000"/>';
const FLAG_GLOBAL =
  '<rect width="30" height="20" fill="#fff"/><g fill="none" stroke="#111" stroke-width="1.2"><circle cx="15" cy="10" r="7.5"/>' +
  '<ellipse cx="15" cy="10" rx="3.2" ry="7.5"/><path d="M7.5 10h15M9 6h12M9 14h12"/></g>';

export const MARKETS: Market[] = [
  {
    code: "in",
    name: "India",
    flag: FLAG_IN,
    sellerCountry: "IN",
    currency: "INR",
    payoutCurrency: "INR",
    storeUrl: MAIN_SITE_URL,
    documents: ["GST certificate, or PAN and Aadhaar", "Product photos", "Bank account in your business name"],
    delivery: "Delivery in 3 hours across Delhi NCR and 3 to 5 days across India",
    commissionPct: COMMISSION_PCT_INDIA,
    open: OPEN.has("in"),
    landing: {
      short: "IN",
      meta: {
        title: "Sell on NOTMADE across India | Seller portal",
        description: `Open a NOTMADE seller account. Set your own INR prices, we deliver across India, and you are settled within ${SETTLEMENT_DAYS_AFTER_DELIVERY} days after delivery.`,
      },
      status: OPEN.has("in") ? "Seller accounts open in India" : "India waitlist open",
      headline: "Sell on NOTMADE across India",
      sub: `List your products on notmade.in at prices you set in INR. We deliver, talk to your customers and handle returns. You are settled within ${SETTLEMENT_DAYS_AFTER_DELIVERY} days after each order is delivered.`,
      storeHost: "notmade.in",
      delivery: "3 hours in Delhi NCR, 3 to 5 days across India",
      documents: ["GST certificate, or PAN and Aadhaar", "Bank account in your business name"],
      payout: "INR, to your Indian bank account",
      pricePoints: [
        { t: "INR and AED prices, set separately", d: "Your INR price for India, and a separate AED price for any product you also sell in the UAE." },
        { t: "Sizes and photos your way", d: "Add sizes with your own size names and stock, and up to 10 photos per product." },
        { t: "You choose where it sells", d: "Turn UAE selling on for the products you want there. The rest stay India only." },
      ],
      returns: `Customers can return a damaged or wrong item within ${RETURN_WINDOW_HOURS} hours of delivery. You can watch the unboxing video from the order in your dashboard.`,
      samplePrices: ["₹1,899", "₹2,450", "₹999"],
      whatsapp: { display: "+91 93548 52701", href: "https://wa.me/919354852701" },
      faq: [
        { q: "What documents do I need?",
          a: "A GST certificate, or your PAN and Aadhaar if you are not GST registered, and a bank account in your business name. You will also need photos of your products." },
        { q: "Who sets the price?",
          a: "You do. You set the INR price for each product, and a separate AED price if you also sell in the UAE. NOTMADE never changes your prices." },
        { q: "When do I get paid?",
          a: `Within ${SETTLEMENT_DAYS_AFTER_DELIVERY} days after your order is delivered, in INR to your bank account. Each settlement comes with a statement listing the orders it covers.` },
        { q: "How do returns work?",
          a: `Customers can raise a return for a damaged or wrong item within ${RETURN_WINDOW_HOURS} hours of delivery. We review each request, and you can watch the customer's unboxing video from the order in your dashboard.` },
        { q: "Who handles delivery?",
          a: "We do. You pack the order and print the shipping label from your dashboard, and our courier partner picks it up from your address. Delivery takes 3 hours in Delhi NCR and 3 to 5 days across India." },
        { q: "Can I sell different sizes?", a: SIZES_ANSWER },
        { q: "Can I also sell in the UAE?", a: UAE_FROM_INDIA },
        { q: "How do I start?",
          a: `Create your account with your email, add your business details and documents, and sign the seller agreement with a code sent to your email. Then list at least ${MIN_PRODUCTS} products. We review each product before it goes live.` },
      ],
    },
  },
  {
    code: "ae",
    name: "UAE",
    flag: FLAG_AE,
    sellerCountry: "AE",
    currency: "AED",
    payoutCurrency: "AED",
    storeUrl: UAE_SITE_URL,
    documents: ["Trade licence", "TRN, if you are VAT registered", "Emirates ID or passport", "IBAN for your UAE bank account"],
    delivery: "Delivered in 3 to 5 days across the UAE",
    commissionPct: envPct(process.env.NEXT_PUBLIC_UAE_COMMISSION_PCT),
    open: OPEN.has("ae"),
    landing: {
      short: "AE",
      meta: {
        title: "Sell on NOTMADE in the UAE | Seller portal",
        description: `Sell on uae.notmade.in. Set your own AED prices, we deliver across the UAE in 3 to 5 days, and you are settled in AED within ${SETTLEMENT_DAYS_AFTER_DELIVERY} days.`,
      },
      status: UAE_STATUS,
      headline: "Sell on NOTMADE in the UAE",
      sub: `List your products on uae.notmade.in at prices you set in AED. We deliver across the UAE and settle you in AED within ${SETTLEMENT_DAYS_AFTER_DELIVERY} days after each order is delivered.`,
      storeHost: "uae.notmade.in",
      delivery: "3 to 5 days across the UAE",
      documents: ["Trade licence", "TRN, if you are VAT registered", "Emirates ID or passport", "IBAN for your UAE bank account"],
      payout: "AED, to your UAE bank account",
      pricePoints: [
        { t: "Your AED price", d: "You set the AED price for each product. It is the price customers see on uae.notmade.in." },
        { t: "Sizes and photos your way", d: "Add sizes with your own size names and stock, and up to 10 photos per product." },
        { t: "Edit from your dashboard", d: "Change a product's price, sizes or photos yourself from the products page." },
      ],
      returns: "Customers can return a damaged or wrong item within 3 days of delivery, with an unboxing video you can watch from the order in your dashboard.",
      samplePrices: ["AED 89", "AED 120", "AED 49"],
      whatsapp: { display: "+971 55 759 0282", href: "https://wa.me/971557590282" },
      faq: [
        { q: "What documents do I need?",
          a: "Your trade licence, your TRN if you are VAT registered, an Emirates ID or passport, and an IBAN for your UAE bank account. You will also need photos of your products." },
        { q: "Who sets the price?", a: "You do. You set the AED price for each product. NOTMADE never changes your prices." },
        { q: "When do I get paid?",
          a: `Within ${SETTLEMENT_DAYS_AFTER_DELIVERY} days after your order is delivered, in AED to your UAE bank account. Each settlement comes with a statement listing the orders it covers.` },
        { q: "How do returns work?",
          a: "Customers can raise a return for a damaged or wrong item within 3 days of delivery, with an unboxing video. We review each request, and you can watch the video from the order in your dashboard." },
        { q: "Who handles delivery?", a: "We do. Orders are delivered in 3 to 5 days across the UAE, and you can follow each one from your dashboard." },
        { q: "Can I sell different sizes?", a: SIZES_ANSWER },
        { q: "I am based in India. Can I sell in the UAE?", a: UAE_FROM_INDIA },
        OPEN.has("ae")
          ? { q: "How do I start?",
              a: "Create your account with your email, add your business details and documents, and sign the seller agreement with a code sent to your email. Then list your products." }
          : { q: "How do I start?",
              a: "UAE-based seller accounts are not open yet. Join the waitlist with your email and we will write to you when they open. If your business is in India, you can open an India account now and add the UAE from your dashboard." },
      ],
    },
  },
  {
    code: "global",
    name: "Global",
    flag: FLAG_GLOBAL,
    sellerCountry: null,
    currency: null,
    payoutCurrency: null,
    storeUrl: null,
    documents: [
      "Business registration in your country",
      "Tax registration number, if you have one",
      "Government ID of the owner",
      "A bank account in your business name",
      "Product photos",
    ],
    delivery: null,
    commissionPct: null,
    open: OPEN.has("global"),
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
  const names = OPEN_MARKETS.filter((m) => m.sellerCountry).map((m) => `${m.name}-based`);
  if (!names.length) return "Seller accounts are not open yet.";
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `Seller accounts are open to ${list} sellers for now.`;
}

export function signupHref(m: Market): string {
  return `/login?market=${m.code}`;
}

/** Markets shown in the landing page toggle, in order. */
export const LANDING_MARKETS = MARKETS.filter((m): m is Market & { landing: MarketLanding } => !!m.landing);

export function landingMarket(code: string | null | undefined): Market & { landing: MarketLanding } {
  return LANDING_MARKETS.find((m) => m.code === code) ?? LANDING_MARKETS.find((m) => m.code === DEFAULT_MARKET)!;
}
