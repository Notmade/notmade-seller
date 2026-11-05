import { cookies } from "next/headers";
import type { SellerCountryCode } from "../lib/currency";

/** Written by the panel after GET /seller/me. Display hint only, never used for access. */
export const SELLER_COUNTRY_COOKIE = "nm_seller_country";
const MARKET_COOKIE = "nm_market";

type Query = string | string[] | undefined;

/** A signed-in seller's country wins, then the page's ?market=, then the landing market, then India. */
export function selectLegalCountry(seller: string | undefined, market: Query, cookie: string | undefined): SellerCountryCode {
  if (seller === "AE" || seller === "IN") return seller;
  if (market === "ae") return "AE";
  if (market === "in") return "IN";
  return cookie === "ae" ? "AE" : "IN";
}

export function legalCountry(market: Query): SellerCountryCode {
  const jar = cookies();
  return selectLegalCountry(jar.get(SELLER_COUNTRY_COOKIE)?.value, market, jar.get(MARKET_COOKIE)?.value);
}
