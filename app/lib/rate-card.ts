// Commission rate cards exactly as the backend publishes them (GET /seller/commission-rates,
// GET /seller/me). There are no rates in this file: when the backend has no card, the panel shows no
// number, because a seller must never read a rate their agreement does not state.

export type FulfilmentMode = "seller_ships" | "notmade_ships";

export interface RateLine {
  fulfilment_mode: FulfilmentMode | null;
  /** The total the seller pays. */
  pct: number;
  /** On AE-2026-11-v3 phones and laptops only: what `pct` is made of. */
  commission_pct?: number;
  shipping_charge_pct?: number;
}
export interface RateGroup { key: string; label: string; shipping_included: boolean; rates: RateLine[] }
export interface RateCard { version?: string; effective_from?: string; groups: RateGroup[] }

export const WHO_SHIPS_LABEL: Record<FulfilmentMode, string> = {
  seller_ships: "I ship",
  notmade_ships: "NOTMADE ships",
};

const validPct = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 100;

/** The card with only its usable rates. Null when nothing usable is left. */
export function usableCard(card: Partial<RateCard> | null | undefined): RateCard | null {
  const groups = (card?.groups ?? [])
    .map((g) => ({ ...g, rates: (g.rates ?? []).filter((r) => validPct(r.pct)) }))
    .filter((g) => g.rates.length > 0);
  return groups.length ? { ...card, groups } : null;
}

function groupPct(group: RateGroup, mode: FulfilmentMode): number {
  return (group.rates.find((r) => r.fulfilment_mode === mode) ?? group.rates.find((r) => r.fulfilment_mode === null) ?? group.rates[0]).pct;
}

/** The group the who-ships choice applies to: phones and laptops, or Electronics on a v1 card. */
export function whoShipsGroup(card: RateCard | null): RateGroup | null {
  if (!card) return null;
  return card.groups.find((g) => g.rates.some((r) => r.fulfilment_mode)) ?? card.groups.find((g) => g.key === "phones_laptops") ?? null;
}

export function whoShipsRate(card: RateCard | null, mode: FulfilmentMode): number | null {
  const group = whoShipsGroup(card);
  return group ? groupPct(group, mode) : null;
}

/** False on a v2 card, where who ships sets no rate. */
export function whoShipsChangesRate(card: RateCard | null): boolean {
  return whoShipsRate(card, "seller_ships") !== whoShipsRate(card, "notmade_ships");
}

/** A group's rate in words, e.g. "12%" or "12% if you ship, 14% if NOTMADE ships". */
export function groupRateText(group: RateGroup): string {
  const seller = groupPct(group, "seller_ships");
  const notmade = groupPct(group, "notmade_ships");
  const rate = seller === notmade ? `${seller}%` : `${seller}% if you ship, ${notmade}% if NOTMADE ships`;
  return group.shipping_included ? `${rate}, shipping included` : rate;
}

/** The rate of one group in words, for the choice made so far. Null when the card has no such group. */
export function chosenRateText(card: RateCard | null, key: string, mode?: FulfilmentMode | ""): string | null {
  const group = card?.groups.find((g) => g.key === key);
  if (!group) return null;
  return mode ? `${groupPct(group, mode)}%` : groupRateText(group);
}

/** One who-ships option as the seller reads it. `breakdown` is null where no shipping charge applies. */
export function whoShipsOption(card: RateCard | null, mode: FulfilmentMode): { title: string; breakdown: string | null } {
  const pct = whoShipsRate(card, mode);
  const line = whoShipsGroup(card)?.rates.find((r) => r.fulfilment_mode === mode);
  return {
    title: pct == null ? WHO_SHIPS_LABEL[mode] : `${WHO_SHIPS_LABEL[mode]}, ${pct}%`,
    breakdown: line?.shipping_charge_pct && line.commission_pct != null
      ? `(${line.commission_pct}% + ${line.shipping_charge_pct}% NOTMADE shipping charge, flat, no VAT added)`
      : null,
  };
}

/** One "label: rate" line per group. Empty when there is no card. */
export function rateCardLines(card: Partial<RateCard> | null | undefined): string[] {
  return (usableCard(card)?.groups ?? []).map((g) => `${g.label}: ${groupRateText(g)}`);
}

/**
 * The rate for a category, by the `commission_group` from GET /seller/categories. Same order as the
 * backend: an unmapped category pays the default group, and who ships falls back to NOTMADE.
 */
export function categoryRate(card: Partial<RateCard> | null | undefined, group: string | null | undefined, mode?: FulfilmentMode | null): number | null {
  const usable = usableCard(card);
  if (!usable || !group) return null;
  const match = usable.groups.find((g) => g.key === group) ?? usable.groups.find((g) => g.key === "default");
  return match ? groupPct(match, mode ?? "notmade_ships") : null;
}

/** The commission to quote on a listing: the seller's card for that category, else India's one flat rate. */
export function listingRate(
  seller: { rate_card?: RateCard | null; default_fulfilment_mode?: FulfilmentMode | null; commission?: { india_pct: number | null } },
  category: { commission_group?: string } | undefined,
  mode?: FulfilmentMode | null,
): number | null {
  return categoryRate(seller.rate_card, category?.commission_group, mode ?? seller.default_fulfilment_mode) ?? seller.commission?.india_pct ?? null;
}

/** Commission and the seller's share of a price, rounded to the smallest unit. */
export function splitPrice(price: number, pct: number): { commission: number; payout: number } {
  const commission = Math.round(price * pct) / 100;
  return { commission, payout: Math.round((price - commission) * 100) / 100 };
}
