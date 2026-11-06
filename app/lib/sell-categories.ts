// What a UAE seller says they sell, at the start of sign-up. The keys are the rate card's group keys.
//
// POST /seller/signup has no field for this, so it lives in this browser for the length of the flow
// and is never sent. It decides which rates to show and whether to ask who ships. It sets no rate: the
// backend prices each order by the product's category.

import type { FulfilmentMode } from "./rate-card";

export const SELL_CATEGORIES = [
  { key: "phones_laptops", label: "Mobile phones and laptops" },
  { key: "handmade", label: "Handmade products" },
  { key: "default", label: "Apparel and all other categories" },
] as const;

export type SellCategory = (typeof SELL_CATEGORIES)[number]["key"];

export const SELL_CATEGORIES_KEY = "nm_seller_categories";

export const sellsPhones = (categories: SellCategory[]) => categories.includes("phones_laptops");

export function loadSellCategories(): SellCategory[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(SELL_CATEGORIES_KEY) || "[]");
    return SELL_CATEGORIES.map((c) => c.key).filter((k) => Array.isArray(saved) && saved.includes(k));
  } catch {
    return [];
  }
}

export function saveSellCategories(categories: SellCategory[]): void {
  try { localStorage.setItem(SELL_CATEGORIES_KEY, JSON.stringify(categories)); } catch { /* storage blocked */ }
}

/** True once the seller said what they sell and it has no phones or laptops. */
export function knownNoPhones(categories: SellCategory[]): boolean {
  return categories.length > 0 && !sellsPhones(categories);
}

/** Categories chosen, and who ships when phones and laptops are among them. */
export function rateStepComplete(categories: SellCategory[], mode: "" | FulfilmentMode): boolean {
  return categories.length > 0 && (!sellsPhones(categories) || !!mode);
}

/**
 * The backend refuses a new UAE seller with no default_fulfilment_mode, and cannot quote their agreement
 * without one, so a seller who was never asked still needs a value. This is the one it falls back to for
 * a line with no choice of its own, so sending it changes nothing: no other category's rate depends on
 * it, and listing a phone later still asks who ships that product.
 */
export const UNASKED_FULFILMENT_MODE: FulfilmentMode = "notmade_ships";

/** default_fulfilment_mode for POST /seller/signup. Undefined leaves the field out. */
export function fulfilmentModeToSend(
  categories: SellCategory[], chosen: "" | FulfilmentMode, stored: FulfilmentMode | null | undefined,
): FulfilmentMode | undefined {
  if (sellsPhones(categories)) return chosen || undefined;
  return stored ? undefined : UNASKED_FULFILMENT_MODE;
}
