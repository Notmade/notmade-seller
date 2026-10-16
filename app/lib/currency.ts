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

// ─── Seller market access ────────────────────────────────────────────────────

export const SELLER_SUPPORT_EMAIL = "seller@notmade.in";
export const UAE_NOT_APPROVED_MESSAGE = `You are not approved for UAE yet. Please contact ${SELLER_SUPPORT_EMAIL}`;

/** Fields of the GET /seller/me seller this file reads. */
export interface SellerMarketFields {
  seller_country?: string | null;
  sell_in_uae?: boolean | null;
  uae?: { seller_country?: string | null; approved?: boolean | null } | null;
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

/**
 * India-based seller that NOTMADE has approved for the UAE store. Uses uae.approved when the backend
 * sends it, else the seller-level sell_in_uae flag. Always false for UAE-based sellers, who have no
 * India-to-UAE section.
 */
export function isUaeApproved(seller: SellerMarketFields | null | undefined): boolean {
  if (!seller || sellerCountry(seller) !== "IN") return false;
  return seller.uae?.approved ?? !!seller.sell_in_uae;
}

/** Dashboard routes that only make sense for India-based sellers (India pickup, India contract, India-to-UAE). */
const INDIA_ONLY_ROUTES = ["/dashboard/uae", "/dashboard/contract", "/dashboard/warehouse"];

/** False for a dashboard route this seller must not see; the layout sends them to /dashboard. */
export function canOpenRoute(seller: SellerMarketFields | null | undefined, pathname: string): boolean {
  if (sellerCountry(seller) === "IN") return true;
  return !INDIA_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/** Order region ("in" | "ae") whose amounts are in this currency. */
export function regionForCurrency(currency: Currency): "in" | "ae" {
  return currency === AED ? "ae" : "in";
}
