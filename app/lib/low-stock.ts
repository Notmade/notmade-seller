// The seller's low-stock threshold: the saved account setting when the backend has one, else this
// browser's value, else the default.
import { DEFAULT_LOW_STOCK } from "./insights";
import type { Seller } from "./seller-api";

const key = (id: string) => `nm_low_stock:${id}`;

export function lowStockThreshold(seller: Pick<Seller, "id" | "low_stock_threshold">): number {
  if (typeof seller.low_stock_threshold === "number") return seller.low_stock_threshold;
  try {
    const n = Number(localStorage.getItem(key(seller.id)));
    if (Number.isInteger(n) && n > 0) return n;
  } catch { /* storage blocked */ }
  return DEFAULT_LOW_STOCK;
}

export function rememberLowStock(sellerId: string, n: number) {
  try { localStorage.setItem(key(sellerId), String(n)); } catch { /* storage blocked */ }
}
