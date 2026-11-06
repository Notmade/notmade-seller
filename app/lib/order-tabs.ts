// Order tabs. To pack holds accepted orders and those already marked ready: both are still with the
// seller. Cancelled keeps its own tab so nothing a seller could see before disappears.
import type { Order, OrderBucket } from "./seller-api";

export type OrderTab = "new" | "pack" | "shipped" | "delivered" | "returns" | "cancelled";

export const ORDER_TABS: { key: OrderTab; label: string; buckets: OrderBucket[] }[] = [
  { key: "new", label: "New", buckets: ["new"] },
  { key: "pack", label: "To pack", buckets: ["accepted", "ready"] },
  { key: "shipped", label: "Shipped", buckets: ["shipped"] },
  { key: "delivered", label: "Delivered", buckets: ["delivered"] },
  { key: "returns", label: "Returns", buckets: ["returns"] },
  { key: "cancelled", label: "Cancelled", buckets: ["cancelled"] },
];

/** ?tab= in links from notifications and emails, which use the backend's bucket names. */
export function tabForParam(v: string | null): OrderTab | null {
  return ORDER_TABS.find((t) => t.key === v || (t.buckets as string[]).includes(v ?? ""))?.key ?? null;
}

export const orderInTab = (o: Pick<Order, "bucket">, tab: OrderTab) => ORDER_TABS.find((t) => t.key === tab)!.buckets.includes(o.bucket);

/** POST /seller/orders/:ref/ship answers NOTMADE_SHIPS unless every line is seller-ships. */
export function sellerShips(o: Pick<Order, "items">): boolean {
  return o.items.length > 0 && o.items.every((i) => i.fulfilment_mode === "seller_ships");
}

/** Same rule as the backend's tracking_id check. */
export const validTrackingId = (v: string) => /^[A-Za-z0-9._/-]{4,60}$/.test(v.trim());
