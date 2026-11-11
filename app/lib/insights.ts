// Pure calculations behind Overview, Analytics and Inventory. Every number comes from the seller's
// own orders and products, and only in the seller's currency.

import type { Category, Order, OrderBucket, Product } from "./seller-api";
import type { Currency } from "./currency";

export const DEFAULT_LOW_STOCK = 3;
const DAY = 86_400_000;

export const BUCKET_LABEL: Record<OrderBucket, string> = {
  new: "New", accepted: "To pack", ready: "To ship", shipped: "Shipped",
  delivered: "Delivered", cancelled: "Cancelled", returns: "Returns",
};

/** Orders of one currency. A seller never sees amounts in any other. */
export const ordersIn = (orders: Order[], currency: Currency) => orders.filter((o) => o.commission.currency === currency);

/** YYYY-MM-DD of an instant in a time zone. */
export function dayKey(at: Date | string | number, timeZone: string): string {
  return new Date(at).toLocaleDateString("en-CA", { timeZone });
}

const counted = (o: Order) => o.bucket !== "cancelled";

/** Gross sales and order count per window, ending today in the seller's time zone. */
export function revenueWindows(orders: Order[], timeZone: string, now = Date.now()) {
  const today = dayKey(now, timeZone);
  const within = (days: number) => {
    const keys = new Set(Array.from({ length: days }, (_, i) => dayKey(now - i * DAY, timeZone)));
    const rows = orders.filter((o) => counted(o) && keys.has(dayKey(o.created_at, timeZone)));
    return { revenue: rows.reduce((s, o) => s + o.commission.gross, 0), orders: rows.length };
  };
  return { today: within(1), week: within(7), month: within(30), todayKey: today };
}

export interface DayPoint { day: string; revenue: number; orders: number }

/** One point per day, oldest first, with zero-sale days kept so gaps stay visible. */
export function salesSeries(orders: Order[], days: number, timeZone: string, now = Date.now()): DayPoint[] {
  const points = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const day = dayKey(now - i * DAY, timeZone);
    points.set(day, { day, revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    if (!counted(o)) continue;
    const p = points.get(dayKey(o.created_at, timeZone));
    if (p) { p.revenue += o.commission.gross; p.orders += 1; }
  }
  return Array.from(points.values());
}

export interface TopProduct { id: string; name: string; units: number; revenue: number }

export function topProducts(orders: Order[], limit = 5): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const o of orders) {
    if (!counted(o)) continue;
    for (const i of o.items) {
      const row = map.get(i.product_id) ?? { id: i.product_id, name: i.product_name, units: 0, revenue: 0 };
      row.units += i.quantity;
      row.revenue += (i.market_unit_price ?? i.unit_price) * i.quantity;
      map.set(i.product_id, row);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function ordersByStatus(orders: Order[]): { bucket: OrderBucket; label: string; count: number }[] {
  const counts = new Map<OrderBucket, number>();
  for (const o of orders) counts.set(o.bucket, (counts.get(o.bucket) ?? 0) + 1);
  return (Object.keys(BUCKET_LABEL) as OrderBucket[])
    .map((bucket) => ({ bucket, label: BUCKET_LABEL[bucket], count: counts.get(bucket) ?? 0 }))
    .filter((r) => r.count > 0);
}

/** Order-side conversion: share of received orders accepted, and of accepted orders delivered. */
export function orderFunnel(orders: Order[]) {
  const received = orders.length;
  const accepted = orders.filter((o) => o.seller_accepted_at).length;
  const delivered = orders.filter((o) => o.bucket === "delivered").length;
  const share = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);
  return { received, accepted, delivered, acceptRate: share(accepted, received), deliverRate: share(delivered, accepted) };
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type StockState = "out" | "low" | "ok";

export const stockState = (stock: number, threshold: number): StockState =>
  stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";

export interface StockRow {
  /** Unique per row. */
  key: string;
  productId: string;
  variantId: string | null;
  size: string | null;
  name: string;
  variant: string | null;
  sku: string | null;
  image: string | null;
  stock: number;
}

/** One row per sellable unit: each active variant, or the product itself when it has none. */
export function stockRows(products: Product[]): StockRow[] {
  return products.flatMap((p): StockRow[] => {
    const base = { productId: p.id, name: p.name, image: p.images?.[0] ?? null, sku: p.sku ?? null };
    if (p.variants?.length) {
      return p.variants.filter((v) => v.is_active !== false).map((v) => ({
        ...base, key: `${p.id}:${v.id}`, variantId: v.id, size: null, sku: v.sku ?? base.sku,
        variant: v.label ?? (Object.values(v.option_values ?? {}).join(" · ") || null), stock: Number(v.stock) || 0,
      }));
    }
    const sized = (p.product_variants ?? []).filter((v) => v.is_active !== false);
    if (sized.length) {
      return sized.map((v) => ({
        ...base, key: `${p.id}:${v.size}`, variantId: v.id ?? null, size: v.size, variant: v.size, stock: Number(v.stock) || 0,
      }));
    }
    return [{ ...base, key: p.id, variantId: null, size: null, variant: null, stock: Number(p.stock) || 0 }];
  });
}

// ─── Catalogue ───────────────────────────────────────────────────────────────

const GROUPS: { name: string; match: RegExp }[] = [
  { name: "Electronics", match: /electronic|laptop|phone|mobile|audio|headphone|earbud|speaker|camera|gaming|computer|tablet|charger|gadget|smartwatch/i },
  { name: "Home", match: /home|decor|kitchen|furnish|furniture|bedding|candle|lighting|dining|vase/i },
  { name: "Beauty", match: /beauty|skin|makeup|cosmetic|fragrance|perfume|hair|grooming/i },
  { name: "Accessories", match: /accessor|bag|wallet|belt|cap|hat|jewel|watch|sunglass|eyewear|scarf|sock|footwear|shoe|sneaker/i },
  { name: "Fashion", match: /fashion|wear|shirt|tee|hoodie|jacket|jean|trouser|pant|dress|skirt|kurta|saree|sweat|top|short|cargo|cloth|apparel|men|women|kids/i },
];

export interface CategoryGroup { name: string; categories: Category[] }

/** Backend `group` when present, else by keyword. Listed in a fixed order with "More" last. */
export function groupCategories(categories: Category[]): CategoryGroup[] {
  const order = GROUPS.map((g) => g.name).reverse();
  const out = new Map<string, Category[]>();
  for (const c of categories) {
    const name = c.group?.trim() || GROUPS.find((g) => g.match.test(c.name))?.name || "More";
    out.set(name, [...(out.get(name) ?? []), c]);
  }
  const rank = (n: string) => { const i = order.indexOf(n); return i < 0 ? order.length - 0.5 : i; };
  return Array.from(out, ([name, list]) => ({ name, categories: list }))
    .sort((a, b) => (a.name === "More" ? 1 : b.name === "More" ? -1 : rank(a.name) - rank(b.name)));
}

export function filterCategories(groups: CategoryGroup[], query: string): CategoryGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({ name: g.name, categories: g.name.toLowerCase().includes(q) ? g.categories : g.categories.filter((c) => c.name.toLowerCase().includes(q)) }))
    .filter((g) => g.categories.length > 0);
}
