// The one set of product statuses a seller sees. Every status comes from the backend's review fields,
// and NOTMADE alone moves a product to Live: nothing in the panel writes is_live or approval_status.
import type { Product } from "./seller-api";

export type ProductStatusKey = "draft" | "pending" | "live" | "rejected" | "approved";

export const STATUS_LABEL: Record<ProductStatusKey, string> = {
  draft: "Draft",
  pending: "In review",
  live: "Live",
  rejected: "Needs changes",
  approved: "Approved · not live",
};

export function productStatus(p: Pick<Product, "status" | "approval_status" | "is_live">): { key: ProductStatusKey; label: string } {
  const key: ProductStatusKey = p.status === "draft" ? "draft"
    : p.approval_status === "rejected" ? "rejected"
    : p.approval_status === "pending" ? "pending"
    : p.is_live ? "live" : "approved";
  return { key, label: STATUS_LABEL[key] };
}
