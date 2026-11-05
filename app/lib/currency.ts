// The one place that knows about seller currencies and markets. A seller's country (seller_country
// from GET /seller/me) decides their currency: IN sellers see INR, AE sellers see AED. Every amount,
// price label and currency symbol in the portal and the landing pages goes through this file.
// Nothing outside it should spell a currency code or symbol.

export type Currency = "INR" | "AED";
export type SellerCountryCode = "IN" | "AE";

export const INR: Currency = "INR";
export const AED: Currency = "AED";

export const CURRENCY_BY_COUNTRY: Record<SellerCountryCode, Currency> = { IN: INR, AE: AED };

const SYMBOL: Record<Currency, string> = { INR: "₹", AED: "AED" };

/** "₹" or "AED", e.g. for an input prefix or a field label. */
export function currencySymbol(currency: Currency): string {
  return SYMBOL[currency];
}

/** "₹1,200" or "AED 55.00". */
export function formatMoney(n: number | null | undefined, currency: Currency): string {
  const v = Number(n || 0);
  return currency === AED
    ? `${SYMBOL.AED} ${v.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${SYMBOL.INR}${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/** Per-currency amount bag from the backend, e.g. { INR: 1200, AED: 55 }. */
export type Money = Partial<Record<Currency, number>>;

/** The part of a Money bag in one currency, formatted. Other currencies are not shown. */
export function formatMoneyIn(m: Money | null | undefined, currency: Currency): string {
  return formatMoney(m?.[currency] ?? 0, currency);
}

// ─── Seller country ──────────────────────────────────────────────────────────

/** Fields of the GET /seller/me seller this file reads. */
export interface SellerMarketFields {
  seller_country?: string | null;
  uae?: { seller_country?: string | null } | null;
  agreement?: { seller_country?: string | null } | null;
}

/** "AE" for UAE-based sellers, else "IN" (the backend's default for a missing country). */
export function sellerCountry(seller: SellerMarketFields | null | undefined): SellerCountryCode {
  const c = seller?.seller_country ?? seller?.uae?.seller_country ?? seller?.agreement?.seller_country;
  return String(c || "").toUpperCase() === "AE" ? "AE" : "IN";
}

export function sellerCurrency(seller: SellerMarketFields | null | undefined): Currency {
  return CURRENCY_BY_COUNTRY[sellerCountry(seller)];
}

/** The currency this seller does not price in. Older orders and payouts can still be in it. */
export function otherCurrency(currency: Currency): Currency {
  return currency === AED ? INR : AED;
}

/** Product price columns of one seller country. A seller only ever reads and writes their own pair. */
export interface ProductPriceColumns {
  price_inr?: number | null;
  original_price_inr?: number | null;
  price_aed?: number | null;
  original_price_aed?: number | null;
}

export function productPrice(p: ProductPriceColumns, country: SellerCountryCode): { price: number | null; mrp: number | null } {
  return country === "AE"
    ? { price: p.price_aed ?? null, mrp: p.original_price_aed ?? null }
    : { price: p.price_inr ?? null, mrp: p.original_price_inr ?? null };
}

/** Form fields of POST / PUT /seller/products for a price. Only the seller's own currency is ever sent. */
export function productPriceFields(country: SellerCountryCode, price: string, mrp: string): Record<string, string> {
  return country === "AE"
    ? { sell_in_uae: "true", price_aed: price, mrp_aed: mrp }
    : { price_inr: price, mrp };
}

/** Dashboard routes only India-based sellers have (pickup address, India contract). */
const INDIA_ONLY_ROUTES = ["/dashboard/contract", "/dashboard/warehouse"];

/** False for a dashboard route this seller must not see; the layout sends them to /dashboard. */
export function canOpenRoute(seller: SellerMarketFields | null | undefined, pathname: string): boolean {
  if (sellerCountry(seller) === "IN") return true;
  return !INDIA_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/** IANA zone used for "today" and date bucketing in the seller's panel. */
export function sellerTimeZone(country: SellerCountryCode): string {
  return country === "AE" ? "Asia/Dubai" : "Asia/Kolkata";
}
