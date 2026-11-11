// Changes to approved products (backend migration 081). An approved product stays live exactly as it is while a change
// waits: stock applies at once, every other change (each price change included) waits for NOTMADE's approval.
import type { PendingChange, Product } from "./seller-api";

export const MAX_PRODUCT_PHOTOS = 8; // per product, on create and on edit (backend)

export const CHANGE_LABEL: Record<PendingChange["status"], string> = {
  pending: "Change pending approval",
  approved: "Change approved",
  partially_approved: "Change partly approved",
  rejected: "Change not approved",
};

/** True once the product passed review: edits then wait for approval and the listing never goes offline for them. */
export function isApproved(p: Pick<Product, "approval_status">): boolean {
  return p.approval_status === "approved";
}

export const hasPendingChange = (p: Pick<Product, "pending_change">) => p.pending_change?.status === "pending";

/** What the edit form starts from: the product as it will look once its waiting change is approved, else as it is. */
export function formSource(p: Product): Product {
  const pc = p.pending_change;
  if (pc?.status !== "pending" || !pc.preview) return p;
  return { ...pc.preview, pending_change: pc, approval_status: p.approval_status, is_live: p.is_live, stock: p.stock };
}

/** One photo in the edit form: one already stored (url) or one picked now (file). Order is the gallery order. */
export type PhotoItem = { kind: "url"; url: string } | { kind: "file"; file: File; preview: string };

/**
 * existing_images for PUT /seller/products/:id: kept URLs in order, and "new:<i>" where the i-th uploaded file goes,
 * so a new photo can be placed anywhere, first included. `files` is the upload order.
 */
export function photoPayload(items: PhotoItem[]): { existing: string[]; files: File[] } {
  const files: File[] = [];
  const existing = items.map((it) => {
    if (it.kind === "url") return it.url;
    files.push(it.file);
    return `new:${files.length - 1}`;
  });
  return { existing, files };
}

/** True when the gallery differs from `initial` in any way: a photo added, removed, or the same photos in a new order. */
export function photosChanged(initial: string[], items: PhotoItem[]): boolean {
  if (items.some((i) => i.kind === "file")) return true;
  const now = items.map((i) => (i.kind === "url" ? i.url : ""));
  return now.length !== initial.length || now.some((u, i) => u !== initial[i]);
}

export function movePhoto<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}
