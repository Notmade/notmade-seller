// UAE commission rate card for new sellers. Rates come from GET /seller/commission-rates when the
// backend sends them; the values below are the published fallback.

export type ElectronicsFulfilment = "seller" | "notmade";

export interface UaeRateCard {
  electronics_seller_ships_pct: number;
  electronics_notmade_ships_pct: number;
  fashion_accessories_pct: number;
  /** False when every rate came from the fallback. */
  live: boolean;
}

export const UAE_RATE_CARD_FALLBACK = {
  electronics_seller_ships_pct: 12,
  electronics_notmade_ships_pct: 14,
  fashion_accessories_pct: 17,
} as const;

/** The part of GET /seller/commission-rates the rate card reads. */
export interface RateCardSource {
  uae_local_pct?: number | null;
  uae_rate_card?: Partial<Record<keyof typeof UAE_RATE_CARD_FALLBACK, number | null>> | null;
}

const validPct = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 100 ? v : null);

/** Every rate is checked on its own, so one bad value never drags the others to the fallback. */
export function resolveRateCard(source: RateCardSource | null | undefined): UaeRateCard {
  const card = source?.uae_rate_card;
  const fromCard = (k: keyof typeof UAE_RATE_CARD_FALLBACK) => validPct(card?.[k]);
  const seller = fromCard("electronics_seller_ships_pct");
  const notmade = fromCard("electronics_notmade_ships_pct");
  // uae_local_pct is the UAE seller rate the backend has today
  const fashion = fromCard("fashion_accessories_pct") ?? validPct(source?.uae_local_pct);
  return {
    electronics_seller_ships_pct: seller ?? UAE_RATE_CARD_FALLBACK.electronics_seller_ships_pct,
    electronics_notmade_ships_pct: notmade ?? UAE_RATE_CARD_FALLBACK.electronics_notmade_ships_pct,
    fashion_accessories_pct: fashion ?? UAE_RATE_CARD_FALLBACK.fashion_accessories_pct,
    live: seller != null || notmade != null || fashion != null,
  };
}

export function electronicsRate(card: UaeRateCard, mode: ElectronicsFulfilment): number {
  return mode === "seller" ? card.electronics_seller_ships_pct : card.electronics_notmade_ships_pct;
}

export const FULFILMENT_LABEL: Record<ElectronicsFulfilment, string> = {
  seller: "Seller ships",
  notmade: "NOTMADE ships",
};

/** Commission and the seller's share of a price, rounded to the smallest unit. */
export function splitPrice(price: number, pct: number): { commission: number; payout: number } {
  const commission = Math.round(price * pct) / 100;
  return { commission, payout: Math.round((price - commission) * 100) / 100 };
}
